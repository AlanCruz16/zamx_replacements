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

const formSchema = z.object({
    product1: productSchema,
    product2: productSchema.optional(),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Validate the request body
        const validatedData = formSchema.parse(body);

        // Create email content with conditional second product
        const msg = {
            to: 'adagocd@gmail.com',
            from: 'adagocd@gmail.com', // Replace with your SendGrid verified sender
            subject: 'New Quotation Request',
            html: `
                <h2>New Quotation Request</h2>
                
                <h3>Product 1</h3>
                <p><strong>Article Number:</strong> ${validatedData.product1.articleNumber}</p>
                <p><strong>Model:</strong> ${validatedData.product1.model}</p>
                <p><strong>Quantity:</strong> ${validatedData.product1.quantity}</p>
                <p><strong>Delivery Place:</strong> ${validatedData.product1.deliveryPlace}</p>
                ${validatedData.product1.comments ? `<p><strong>Additional Comments:</strong> ${validatedData.product1.comments}</p>` : ''}
                
                ${validatedData.product2 ? `
                    <h3>Product 2</h3>
                    <p><strong>Article Number:</strong> ${validatedData.product2.articleNumber}</p>
                    <p><strong>Model:</strong> ${validatedData.product2.model}</p>
                    <p><strong>Quantity:</strong> ${validatedData.product2.quantity}</p>
                    <p><strong>Delivery Place:</strong> ${validatedData.product2.deliveryPlace}</p>
                    ${validatedData.product2.comments ? `<p><strong>Additional Comments:</strong> ${validatedData.product2.comments}</p>` : ''}
                ` : ''}
            `,
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