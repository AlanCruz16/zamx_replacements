import { NextResponse } from 'next/server';
// We might not need the server client or cookies here anymore if we only use service role for DB ops
// We might not need the server client or cookies here anymore if we only use service role for DB ops
// We might not need the server client or cookies here anymore if we only use service role for DB ops
// import { createClient } from '@/lib/supabase/server';
// import { cookies } from 'next/headers';
import { createClient as createSupabaseClient } from '@supabase/supabase-js'; // Import the standard client
import { generateQuotationPDF } from '@/lib/pdfGenerator'; // Import the PDF generator
import sgMail from '@sendgrid/mail'; // Import SendGrid mail client

// Initialize SendGrid (if not already initialized elsewhere globally - safe to call multiple times)
sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function POST(request: Request) {
    console.log('--- Received SendGrid Inbound Parse Webhook ---');
    let parseError: string | null = null; // Declare parseError here for wider scope
    try {
        // SendGrid sends data as multipart/form-data
        const formData = await request.formData();
        const data: { [key: string]: FormDataEntryValue | FormDataEntryValue[] } = {};

        // Log all form fields received from SendGrid
        console.log('Received form data fields:');
        for (const [key, value] of formData.entries()) {
            // If a key appears multiple times, collect values into an array
            if (key in data) {
                if (Array.isArray(data[key])) {
                    (data[key] as FormDataEntryValue[]).push(value);
                } else {
                    data[key] = [data[key] as FormDataEntryValue, value];
                }
            } else {
                data[key] = value;
            }
            console.log(`  ${key}:`, value instanceof File ? `File(${value.name}, ${value.size} bytes)` : value);
        }

        // Log the extracted 'text' field specifically, as it usually contains the reply body
        const emailText = formData.get('text');
        if (emailText) {
            console.log('\n--- Extracted Email Text Body ---');
            console.log(emailText);
            console.log('---------------------------------');

            // --- Start Parsing Logic ---
            let quotationId: string | null = null;
            let price: string | null = null;
            let leadTime: string | null = null;
            // parseError is now declared outside this block

            if (typeof emailText === 'string') {
                // Regex to find the key-value pairs, allowing for whitespace variations
                // More specific regex for UUID format
                const idRegex = /Quotation ID:\s*([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})/i;
                const priceRegex = /Price:\s*(.+)/i;
                const leadTimeRegex = /Lead Time:\s*(.+)/i;

                const idMatch = emailText.match(idRegex);
                const priceMatch = emailText.match(priceRegex);
                const leadTimeMatch = emailText.match(leadTimeRegex);

                if (idMatch && idMatch[1]) {
                    quotationId = idMatch[1].trim();
                } else {
                    parseError = 'Could not find/parse Quotation ID.';
                }

                if (priceMatch && priceMatch[1]) {
                    price = priceMatch[1].trim();
                } else {
                    parseError = (parseError ? parseError + '; ' : '') + 'Could not find/parse Price.';
                }

                if (leadTimeMatch && leadTimeMatch[1]) {
                    leadTime = leadTimeMatch[1].trim();
                } else {
                    parseError = (parseError ? parseError + '; ' : '') + 'Could not find/parse Lead Time.';
                }

                if (parseError) {
                    console.error('--- Parsing Error ---');
                    console.error(parseError);
                    // Decide how to handle parse errors - for now, log and continue
                    // In the future, might send an error notification back
                } else {
                    console.log('--- Parsing Successful ---');
                    console.log('Quotation ID:', quotationId);
                    console.log('Price:', price);
                    console.log('Lead Time:', leadTime);
                    console.log('--------------------------');

                    // --- Start Database Update ---
                    try {
                        // Use Service Role Client for this update to bypass RLS/auth context issues
                        const supabaseAdmin = createSupabaseClient(
                            process.env.NEXT_PUBLIC_SUPABASE_URL!,
                            process.env.SUPABASE_SERVICE_ROLE_KEY!
                        );

                        // Validate data before updating
                        if (!quotationId || price === null || leadTime === null) {
                            throw new Error('Missing parsed data for database update.');
                        }

                        // Attempt to convert price string to number
                        const priceAsNumber = parseFloat(price);
                        if (isNaN(priceAsNumber)) {
                            throw new Error(`Invalid price format: "${price}". Could not convert to number.`);
                        }

                        const { data: updateData, error: updateError } = await supabaseAdmin // Use the admin client
                            .from('quotation_requests')
                            .update({
                                price: priceAsNumber, // Use converted number
                                lead_time: leadTime, // Use parsed string
                                status: 'processing' // Update status
                            })
                            .eq('id', quotationId) // Match the specific request
                            .select() // Optionally select the updated row to confirm
                            .single(); // Expecting only one row to be updated

                        if (updateError) {
                            console.error('--- Supabase Update Error ---');
                            console.error(updateError);
                            throw updateError; // Re-throw to be caught by outer catch block
                        }

                        if (!updateData) {
                            // This case might happen if the ID didn't match any row
                            throw new Error(`Quotation request with ID ${quotationId} not found for update.`);
                        }

                        console.log('--- Database Update Successful ---');
                        console.log('Updated Record ID:', updateData.id);
                        console.log('New Status:', updateData.status);
                        console.log('--------------------------------');

                        // --- Fetch Full Request Data ---
                        const { data: fullRequestData, error: requestFetchError } = await supabaseAdmin
                            .from('quotation_requests')
                            .select(`*`) // Select all columns from the request itself
                            .eq('id', updateData.id) // Use the confirmed updated ID
                            .single();

                        if (requestFetchError || !fullRequestData) {
                            console.error('--- Supabase Request Fetch Error (after update) ---');
                            console.error(requestFetchError);
                            throw new Error(`Failed to fetch full request data for ID ${updateData.id} after update.`);
                        }

                        // --- Fetch Profile Data Separately ---
                        const { data: profileData, error: profileFetchError } = await supabaseAdmin
                            .from('profiles')
                            .select('full_name, company_name')
                            .eq('id', fullRequestData.user_id) // Match using user_id from request
                            .single();

                        if (profileFetchError || !profileData) {
                            console.error('--- Supabase Profile Fetch Error ---');
                            console.error(profileFetchError);
                            // Allow continuing without profile? Or throw error? Let's throw for now.
                            throw new Error(`Failed to fetch profile data for user ID ${fullRequestData.user_id}.`);
                        }


                        // --- Fetch User Email Separately ---
                        const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(
                            fullRequestData.user_id
                        );

                        if (userError || !userData?.user?.email) {
                            console.error('--- Supabase User Fetch Error ---');
                            console.error(userError);
                            throw new Error(`Failed to fetch user email for user ID ${fullRequestData.user_id}.`);
                        }
                        const customerEmail = userData.user.email;
                        console.log('--- Fetched Full Data for PDF (including email) ---');


                        // --- Generate PDF ---
                        const pdfBytes = await generateQuotationPDF({
                            id: fullRequestData.id,
                            created_at: fullRequestData.created_at,
                            customer_company_name: profileData.company_name ?? 'N/A', // Use fetched profileData
                            customer_full_name: profileData.full_name ?? 'N/A', // Use fetched profileData
                            customer_email: customerEmail, // Pass the fetched email
                            article_number: fullRequestData.article_number,
                            model: fullRequestData.model,
                            quantity: fullRequestData.quantity,
                            price: fullRequestData.price!, // Price is guaranteed by successful update
                            lead_time: fullRequestData.lead_time!, // Lead time is guaranteed
                        });
                        console.log(`Generated PDF (${pdfBytes.length} bytes)`);

                        // --- Send Final Email with PDF ---
                        const pdfBase64 = Buffer.from(pdfBytes).toString('base64');
                        const emailSubject = `Your Quotation is Ready - Ref: ${fullRequestData.id.substring(0, 8)}`;
                        const emailHtml = `
                            <p>Dear ${profileData.full_name ?? 'Customer'},</p> {/* Changed profile to profileData */}
                            <p>Please find your requested quotation attached.</p>
                            <p>Quotation Reference: ${fullRequestData.id}</p>
                            <p>Thank you for your inquiry.</p>
                            <br>
                            <p>Best regards,</p>
                            <p>Grupo NSR HVAC y Control S.A. de C.V.</p>
                        `; // Customize as needed

                        const msg = {
                            to: customerEmail,
                            from: process.env.SENDGRID_FROM_EMAIL!, // Use the configured sender
                            subject: emailSubject,
                            html: emailHtml,
                            attachments: [
                                {
                                    content: pdfBase64,
                                    filename: `Quotation_${fullRequestData.id.substring(0, 8)}.pdf`,
                                    type: 'application/pdf',
                                    disposition: 'attachment',
                                },
                            ],
                        };

                        console.log(`--- Preparing to send final email to ${customerEmail} ---`);
                        await sgMail.send(msg);
                        console.log('--- Final email sent successfully ---');

                        // --- Final Status Update ---
                        const { error: finalUpdateError } = await supabaseAdmin
                            .from('quotation_requests')
                            .update({ status: 'completed' }) // Set status to completed
                            .eq('id', fullRequestData.id);

                        if (finalUpdateError) {
                            console.error('--- Supabase Final Status Update Error ---');
                            console.error(finalUpdateError);
                            // Log error but don't necessarily throw, as email was sent
                        } else {
                            console.log(`--- Status updated to 'completed' for ${fullRequestData.id} ---`);
                        }


                    } catch (processError: any) { // Catch errors from Fetch/PDF/Email/FinalUpdate
                        console.error('--- Error during Post-Update Processing ---');
                        console.error(processError.message); // Use processError here
                        // Update parseError so the final response reflects the DB issue
                        parseError = `Post-update processing failed: ${processError.message}`; // Use processError here and update message
                    }
                    // --- End Database Update --- // This comment is slightly misplaced, should be End Post-Update Processing
                }

            } else {
                console.error('Email text body ("text" field) is missing or not a string.');
                parseError = 'Email text body missing or invalid.';
            }
            // --- End Parsing Logic ---

        } else {
            console.log('\nNo "text" field found in the form data.');
            // If no text field, we definitely can't parse
            return NextResponse.json({ error: 'Missing email text body' }, { status: 400 }); // Return error if text is missing
        }


        // Acknowledge receipt to SendGrid - Do this even if parsing fails for now
        // to prevent SendGrid retries, but log the error.
        if (parseError) {
            console.error(`Acknowledging receipt but parsing failed: ${parseError}`);
        }
        return NextResponse.json({ message: 'Webhook received successfully' }, { status: 200 });

    } catch (error: any) {
        console.error('--- Error processing SendGrid webhook ---');
        console.error('Timestamp:', new Date().toISOString());
        console.error('Error Message:', error?.message);
        console.error('Error Stack:', error?.stack);
        console.error('Full Error Object:', JSON.stringify(error, null, 2));

        // Return an error response
        // It's important to still return 2xx to SendGrid if possible,
        // otherwise it might retry. Log the error for debugging.
        // If the error is fundamental (like failing to parse), a 500 might be okay.
        return NextResponse.json({ error: 'Failed to process webhook' }, { status: 500 });
    }
}

// Optional: Handle GET requests or other methods if needed,
// otherwise they default to 405 Method Not Allowed
// export async function GET(request: Request) {
//   return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
// }
