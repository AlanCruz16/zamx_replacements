import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function ProfilePage() {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
        redirect('/auth/sign-in')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

    return (
        <div className="container py-8">
            <div className="mx-auto max-w-2xl">
                <h1 className="text-2xl font-bold mb-8">Profile</h1>

                <div className="bg-white rounded-lg shadow p-6 space-y-4">
                    <div>
                        <h2 className="text-sm font-medium text-gray-500">Email</h2>
                        <p className="mt-1">{session.user.email}</p>
                    </div>

                    <div>
                        <h2 className="text-sm font-medium text-gray-500">Full Name</h2>
                        <p className="mt-1">{profile?.full_name}</p>
                    </div>

                    <div>
                        <h2 className="text-sm font-medium text-gray-500">Company Name</h2>
                        <p className="mt-1">{profile?.company_name}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}