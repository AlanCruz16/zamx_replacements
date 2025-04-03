import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'

export default function SuccessPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
                <div className="flex justify-center mb-4">
                    <CheckCircle className="h-16 w-16 text-green-500" />
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                    Quotation Request Submitted!
                </h1>

                <p className="text-gray-600 mb-8">
                    Thank you for your request. We have received your information and will
                    process it shortly. You will receive a confirmation email with further
                    details.
                </p>

                <div className="space-y-4">
                    <Link href="/quotation">
                        <Button className="w-full" variant="outline">
                            Submit Another Request
                        </Button>
                    </Link>

                    <Link href="/">
                        <Button className="w-full">
                            Return to Home
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}