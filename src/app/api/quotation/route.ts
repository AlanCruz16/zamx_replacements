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
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const formData = await request.formData()

        // Parse and validate products
        const product1 = JSON.parse(formData.get('product1') as string)
        const product2 = formData.has('product2') ? JSON.parse(formData.get('product2') as string) : undefined

        const validatedProduct1 = productSchema.parse(product1)
        const validatedProduct2 = product2 ? productSchema.parse(product2) : undefined

        // Get image files if they exist
        const product1Image = formData.get('product1Image') as File | null
        const product2Image = formData.get('product2Image') as File | null

        // Get user profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

        // Insert quotation requests into database
        const { error: insertError } = await supabase
            .from('quotation_requests')
            .insert([
                {
                    user_id: session.user.id,
                    article_number: validatedProduct1.articleNumber,
                    model: validatedProduct1.model,
                    quantity: validatedProduct1.quantity,
                    delivery_place: validatedProduct1.deliveryPlace,
                    comments: validatedProduct1.comments,
                },
                ...(validatedProduct2 ? [{
                    user_id: session.user.id,
                    article_number: validatedProduct2.articleNumber,
                    model: validatedProduct2.model,
                    quantity: validatedProduct2.quantity,
                    delivery_place: validatedProduct2.deliveryPlace,
                    comments: validatedProduct2.comments,
                }] : [])
            ])

        if (insertError) throw insertError

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

        // Send email notification
        const msg = {
            to: process.env.NOTIFICATION_EMAIL!,
            from: process.env.SENDGRID_FROM_EMAIL!,
            subject: 'New Quotation Request',
            html: `
        <h2>New Quotation Request</h2>
        
        <h3>User Information</h3>
        <p><strong>Name:</strong> ${profile.full_name}</p>
        <p><strong>Company:</strong> ${profile.company_name}</p>
        <p><strong>Email:</strong> ${session.user.email}</p>
        
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

        await sgMail.send(msg)

        return NextResponse.json({
            message: "Quotation request submitted successfully"
        })
    } catch (error) {
        console.error('Error processing quotation request:', error)

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid form data', details: error.errors },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}