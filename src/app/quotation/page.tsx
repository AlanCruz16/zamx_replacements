import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { QuotationForm } from '@/components/quotation/QuotationForm'
import { InformationSection } from '@/components/quotation/InformationSection'

export default async function QuotationPage() {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser() // Changed getSession to getUser and session to user

    if (!user) { // Changed session to user
        redirect('/auth/sign-in')
    }

    // Get user profile data
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id) // Changed session.user.id to user.id
        .single()

    if (!profile) {
        redirect('/profile')
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto py-8">
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="bg-white rounded-lg shadow-md p-6 text-center">
                        <h1 className="text-3xl font-bold text-gray-900">Quotation Request Form</h1>
                        <p className="mt-2 text-gray-600">Fill in the details below to request a quotation for your spare parts</p>
                    </div>

                    <InformationSection />

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <QuotationForm userId={user.id} /> {/* Changed session.user.id to user.id */}
                    </div>
                </div>
            </div>
        </div>
    )
}
