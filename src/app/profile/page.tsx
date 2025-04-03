import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ProfileForm } from '@/components/profile/ProfileForm' // Import the form component

export default async function ProfilePage() {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser() // Changed getSession to getUser and session to user

    if (!user) { // Changed session to user
        redirect('/auth/sign-in')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id) // Changed session.user.id to user.id
        .single()

    // Determine if the profile exists to adjust the title/message
    const profileExists = !!profile

    return (
        <div className="container py-8">
            <div className="mx-auto max-w-2xl">
                <h1 className="text-2xl font-bold mb-4">
                    {profileExists ? 'Edit Profile' : 'Complete Your Profile'}
                </h1>
                {!profileExists && (
                    <p className="text-gray-600 mb-8">
                        Please provide your details below to continue to the quotation form.
                    </p>
                )}

                <div className="bg-white rounded-lg shadow p-6 space-y-4">
                    {/* Display Email (read-only) */}
                    <div className="mb-6">
                        <h2 className="text-sm font-medium text-gray-500">Email</h2>
                        <p className="mt-1 text-gray-800">{user.email}</p>
                    </div>

                    {/* Render the Profile Form */}
                    <ProfileForm userId={user.id} profile={profile} />
                </div>
            </div>
        </div>
    )
}
