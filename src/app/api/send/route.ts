// route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import sgMail from '@sendgrid/mail';

// Initialize SendGrid with your API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

const productSchema = z.object({
    articleNumber: z.string().min(1),
    model: z.string().min(1),
    quantity: z.number().min(1),
    deliveryPlace: z.string().min(1),
    comments: z.string().optional(),
});

const userSchema = z.object({
    fullName: z.string().min(1),
    companyName: z.string().min(1),
});


export async function POST(request: Request) {
    try {
        const formData = await request.formData();

        // Parse user data from FormData
        const userData = JSON.parse(formData.get('user') as string);
        const validatedUser = userSchema.parse(userData);


        // Parse product data from FormData
        const product1 = JSON.parse(formData.get('product1') as string);
        const product2 = formData.has('product2') ? JSON.parse(formData.get('product2') as string) : undefined;

        // Get image files if they exist
        const product1Image = formData.get('product1Image') as File | null;
        const product2Image = formData.get('product2Image') as File | null;

        // Validate the product data
        const validatedProduct1 = productSchema.parse(product1);
        const validatedProduct2 = product2 ? productSchema.parse(product2) : undefined;

        // Prepare email attachments
        const attachments: { content: string, filename: string, type: string, disposition: string }[] = [];

        // Add images to attachments if they exist
        if (product1Image) {
            const buffer = await product1Image.arrayBuffer();
            const base64 = Buffer.from(buffer).toString('base64');
            attachments.push({
                content: base64,
                filename: product1Image.name,
                type: product1Image.type,
                disposition: 'attachment',
            });
        }

        if (product2Image) {
            const buffer = await product2Image.arrayBuffer();
            const base64 = Buffer.from(buffer).toString('base64');
            attachments.push({
                content: base64,
                filename: product2Image.name,
                type: product2Image.type,
                disposition: 'attachment',
            });
        }

        // Create email content
        const msg = {
            to: 'adagocd@gmail.com',
            from: 'adagocd@gmail.com', // Replace with your SendGrid verified sender
            subject: 'New Quotation Request',
            html: `
                <h2>New Quotation Request</h2>

                <h3>Contact Information</h3>
                <p><strong>Full Name:</strong> ${validatedUser.fullName}</p>
                <p><strong>Company Name:</strong> ${validatedUser.companyName}</p>
    
                
                <h3>Product 1</h3>
                <p><strong>Article Number:</strong> ${validatedProduct1.articleNumber}</p>
                <p><strong>Model:</strong> ${validatedProduct1.model}</p>
                <p><strong>Quantity:</strong> ${validatedProduct1.quantity}</p>
                <p><strong>Delivery Place:</strong> ${validatedProduct1.deliveryPlace}</p>
                ${validatedProduct1.comments ? `<p><strong>Additional Comments:</strong> ${validatedProduct1.comments}</p>` : ''}
                ${product1Image ? `<p><strong>Image Attached:</strong> ${product1Image.name}</p>` : ''}
                
                ${validatedProduct2 ? `
                    <h3>Product 2</h3>
                    <p><strong>Article Number:</strong> ${validatedProduct2.articleNumber}</p>
                    <p><strong>Model:</strong> ${validatedProduct2.model}</p>
                    <p><strong>Quantity:</strong> ${validatedProduct2.quantity}</p>
                    <p><strong>Delivery Place:</strong> ${validatedProduct2.deliveryPlace}</p>
                    ${validatedProduct2.comments ? `<p><strong>Additional Comments:</strong> ${validatedProduct2.comments}</p>` : ''}
                    ${product2Image ? `<p><strong>Image Attached:</strong> ${product2Image.name}</p>` : ''}
                ` : ''}
            `,
            attachments,
        };

        // Send email
        await sgMail.send(msg);

        return NextResponse.json(
            { message: "Form submitted and email sent successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error processing form submission:", error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid form data", details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}