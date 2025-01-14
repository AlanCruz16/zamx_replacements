import { NextResponse } from "next/server";
import { z } from "zod";
import sgMail from '@sendgrid/mail';

// Initialize SendGrid with your API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

const formSchema = z.object({
    articleNumber: z.string().min(1),
    model: z.string().min(1),
    quantity: z.number().min(1),
    deliveryPlace: z.string().min(1),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Validate the request body
        const validatedData = formSchema.parse(body);

        // Create email content
        const msg = {
            to: 'marianasaldf@gmail.com',
            from: 'adagocd@gmail.com', // Replace with your SendGrid verified sender
            subject: 'New Quotation Request',
            html: `
                <h2>New Quotation Request</h2>
                <p><strong>Article Number:</strong> ${validatedData.articleNumber}</p>
                <p><strong>Model:</strong> ${validatedData.model}</p>
                <p><strong>Quantity:</strong> ${validatedData.quantity}</p>
                <p><strong>Delivery Place:</strong> ${validatedData.deliveryPlace}</p>
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