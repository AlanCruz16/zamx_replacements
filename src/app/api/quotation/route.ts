import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import sgMail from '@sendgrid/mail'

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

const productSchema = z.object({
    userId: z.string().uuid(),
    articleNumber: z.string().min(1),
    model: z.string().min(1),
    quantity: z.number().min(1),
    deliveryPlace: z.string().min(1),
    comments: z.string().optional(),
})

export async function POST(request: Request) {
    try {
        const cookieStore = cookies()
        const supabase = createClient(cookieStore)

        // Verify authentication
        const { data: { user } } = await supabase.auth.getUser() // Changed getSession to getUser and session to user
        if (!user) { // Changed session to user
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }
        console.log("Step 1: Authentication successful, User ID:", user.id);

        const formData = await request.formData()
        console.log("Step 2: Form data parsed.");

        // Parse and validate products
        const product1 = JSON.parse(formData.get('product1') as string)
        const product2 = formData.has('product2') ? JSON.parse(formData.get('product2') as string) : undefined

        const validatedProduct1 = productSchema.parse(product1)
        const validatedProduct2 = product2 ? productSchema.parse(product2) : undefined
        console.log("Step 3: Products validated.");
        if (validatedProduct2) console.log("Step 3a: Product 2 validated.");

        // Get image files if they exist
        const product1Image = formData.get('product1Image') as File | null
        const product2Image = formData.get('product2Image') as File | null

        // Get user profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id) // Changed session.user.id to user.id
            .single()
        console.log("Step 4: Profile fetched for user:", user.id);

        // Add check for profile existence
        if (!profile) {
            console.error(`Profile not found for user ID: ${user.id}`);
            // Throw an error to be caught by the main catch block, providing a clearer reason
            throw new Error(`User profile not found for ID ${user.id}. Cannot proceed with quotation.`);
        }

        // Prepare data for insertion
        const insertionData = [
            {
                user_id: user.id, // Changed session.user.id to user.id
                article_number: validatedProduct1.articleNumber,
                model: validatedProduct1.model,
                quantity: validatedProduct1.quantity,
                delivery_place: validatedProduct1.deliveryPlace,
                comments: validatedProduct1.comments,
            },
            ...(validatedProduct2 ? [{
                user_id: user.id, // Changed session.user.id to user.id
                article_number: validatedProduct2.articleNumber,
                model: validatedProduct2.model,
                quantity: validatedProduct2.quantity,
                delivery_place: validatedProduct2.deliveryPlace,
                comments: validatedProduct2.comments,
            }] : [])
        ];
        console.log("Step 4a: Preparing to insert data into DB:", JSON.stringify(insertionData, null, 2));

        // Insert quotation requests into database and select the ID
        const { data: insertedRequests, error: insertError } = await supabase
            .from('quotation_requests')
            .insert(insertionData) // Use the prepared data
            .select('id') // Select the ID of the inserted record(s)

        /* Remove original data structure from here
                {
                    user_id: user.id, // Changed session.user.id to user.id
                    article_number: validatedProduct1.articleNumber,
                    model: validatedProduct1.model,
                    quantity: validatedProduct1.quantity,
                    delivery_place: validatedProduct1.deliveryPlace,
                    comments: validatedProduct1.comments,
                },
         */

        if (insertError) {
            console.error("--- Supabase Insert Error ---");
            console.error("Timestamp:", new Date().toISOString());
            console.error("Supabase Error Object:", JSON.stringify(insertError, null, 2));
            throw insertError; // Re-throw after logging
        }
        console.log("Step 5: Quotation inserted into DB.");

        // Extract the first quotation ID (assuming batch insert might return multiple)
        // We need one ID to reference the overall request in the email.
        const quotationId = insertedRequests?.[0]?.id;
        if (!quotationId) {
            console.error("Failed to retrieve Quotation ID after insert.");
            throw new Error("Could not retrieve Quotation ID after database insert.");
        }
        console.log("Step 5a: Retrieved Quotation ID:", quotationId);


        // Prepare email attachments
        const attachments = []

        if (product1Image) {
            const buffer = await product1Image.arrayBuffer()
            const base64 = Buffer.from(buffer).toString('base64')
            attachments.push({
                content: base64,
                filename: product1Image.name,
                type: product1Image.type,
                disposition: 'attachment',
            })
        }

        if (product2Image) {
            const buffer = await product2Image.arrayBuffer()
            const base64 = Buffer.from(buffer).toString('base64')
            attachments.push({
                content: base64,
                filename: product2Image.name,
                type: product2Image.type,
                disposition: 'attachment',
            })
        }
        console.log("Step 6: Attachments prepared.", attachments.length > 0 ? `${attachments.length} attachments.` : "No attachments.");

        // Send email notification
        const msg = {
            to: process.env.NOTIFICATION_EMAIL!,
            from: process.env.SENDGRID_FROM_EMAIL!,
            subject: `New Quotation Request - ID: ${quotationId}`, // Add ID to subject
            html: `
        <h2>New Quotation Request</h2>

        <p><strong>Quotation ID:</strong> ${quotationId}</p>
        <hr>
        <p><strong>ACTION REQUIRED:</strong> Please reply to this email with the price and lead time using the exact format below:</p>
        <pre><code>Quotation ID: ${quotationId}
Price: [Enter Selling Price Here, e.g., 123.45]
Lead Time: [Enter Lead Time Here, e.g., 5 business days]</code></pre>
        <hr>

        <h3>User Information</h3>
        <p><strong>Name:</strong> ${profile.full_name}</p>
        <p><strong>Company:</strong> ${profile.company_name}</p>
        <p><strong>Email:</strong> ${user.email}</p> {/* Changed session.user.email to user.email */}
        
        <h3>Product 1</h3>
        <p><strong>Article Number:</strong> ${validatedProduct1.articleNumber}</p>
        <p><strong>Model:</strong> ${validatedProduct1.model}</p>
        <p><strong>Quantity:</strong> ${validatedProduct1.quantity}</p>
        <p><strong>Delivery Place:</strong> ${validatedProduct1.deliveryPlace}</p>
        ${validatedProduct1.comments ? `<p><strong>Comments:</strong> ${validatedProduct1.comments}</p>` : ''}
        ${product1Image ? `<p><strong>Image Attached:</strong> Yes</p>` : ''}
        
        ${validatedProduct2 ? `
          <h3>Product 2</h3>
          <p><strong>Article Number:</strong> ${validatedProduct2.articleNumber}</p>
          <p><strong>Model:</strong> ${validatedProduct2.model}</p>
          <p><strong>Quantity:</strong> ${validatedProduct2.quantity}</p>
          <p><strong>Delivery Place:</strong> ${validatedProduct2.deliveryPlace}</p>
          ${validatedProduct2.comments ? `<p><strong>Comments:</strong> ${validatedProduct2.comments}</p>` : ''}
          ${product2Image ? `<p><strong>Image Attached:</strong> Yes</p>` : ''}
        ` : ''}
      `,
            attachments,
        }
        console.log("Step 7: Preparing to send email via SendGrid...");
        console.log("SendGrid Message Object:", JSON.stringify(msg, null, 2)); // Log the message object

        // Wrap the SendGrid call
        try {
            console.log("Step 7a: Calling sgMail.send()...");
            await sgMail.send(msg);
            console.log("Step 7b: sgMail.send() successful.");
        } catch (sendGridError: any) {
            console.error("--- SendGrid Specific Error ---");
            console.error("Timestamp:", new Date().toISOString());
            console.error("SendGrid Error Message:", sendGridError?.message);
            console.error("SendGrid Error Stack:", sendGridError?.stack);
            if (sendGridError.response) {
                console.error('SendGrid Error Response Body:', sendGridError.response.body);
            }
            console.error("Full SendGrid Error Object:", JSON.stringify(sendGridError, null, 2));
            // Re-throw the error to be caught by the main catch block
            throw sendGridError;
        }
        console.log("Step 8: Email sent successfully."); // After successful SendGrid call

        return NextResponse.json({
            message: "Quotation request submitted successfully"
        })
    } catch (error: any) { // Added ': any' for better error property access
        console.error('--- Error Processing Quotation Request ---');
        console.error('Timestamp:', new Date().toISOString());

        // Log basic error info
        console.error('Error Message:', error?.message);
        console.error('Error Stack:', error?.stack);

        // Log the full error object structure for inspection
        console.error('Full Error Object:', JSON.stringify(error, null, 2));

        // Check specifically for SendGrid errors (they often have a 'response' property)
        if (error.response) {
            console.error('SendGrid Error Body:', error.response.body);
        }

        // Check for Zod validation errors
        if (error instanceof z.ZodError) {
            console.error('Zod Validation Error Details:', error.errors);
            return NextResponse.json(
                { error: 'Invalid form data', details: error.errors },
                { status: 400 }
            );
        }

        // Generic internal server error response
        return NextResponse.json(
            { error: 'Internal server error. Check server logs for details.' }, // Updated message
            { status: 500 }
        );
    }
}
