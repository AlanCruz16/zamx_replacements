'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import * as z from 'zod'

// Re-define the schema here for server-side validation (or import if shared)
const profileFormSchema = z.object({
    full_name: z.string().min(2, {
        message: 'Full name must be at least 2 characters.',
    }),
    company_name: z.string().optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export async function updateProfile(userId: string, formData: ProfileFormValues) {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // Validate form data on the server
    const validatedData = profileFormSchema.safeParse(formData)

    if (!validatedData.success) {
        console.error('Server-side validation failed:', validatedData.error)
        // Consider returning specific error messages if needed
        throw new Error('Invalid profile data provided.')
    }

    const { full_name, company_name } = validatedData.data

    // Perform the upsert operation
    const { error } = await supabase
        .from('profiles')
        .upsert({
            id: userId, // Ensure the user ID is used as the primary key for upsert
            full_name: full_name,
            company_name: company_name,
            updated_at: new Date().toISOString(), // Optional: track updates
        })
        .eq('id', userId) // Condition for update part of upsert

    if (error) {
        console.error('Supabase upsert error:', error)
        throw new Error('Failed to save profile to the database.')
    }

    // Revalidate the profile page cache
    revalidatePath('/profile')
    // Revalidate the quotation page cache as it depends on the profile
    revalidatePath('/quotation')

    // Redirect to the quotation page after successful update/creation
    redirect('/quotation')
}
