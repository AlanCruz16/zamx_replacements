import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

interface CTAProps {
    isAuthenticated: boolean
}

export function CTA({ isAuthenticated }: CTAProps) {
    return (
        <div className="bg-blue-600">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                        <span className="block">Ready to get started?</span>
                        <span className="block text-blue-200">Request your quotation today</span>
                    </h2>
                    <div className="mt-8">
                        {isAuthenticated ? (
                            <Link href="/quotation">
                                <Button
                                    size="lg"
                                    variant="default"
                                    className="bg-white text-blue-600 hover:bg-blue-50 gap-2"
                                >
                                    Get Started <ArrowRight className="w-4 h-4" />
                                </Button>
                            </Link>
                        ) : (
                            <div className="space-y-4">
                                <Link href="/auth/sign-up">
                                    <Button
                                        size="lg"
                                        variant="default"
                                        className="bg-white text-blue-600 hover:bg-blue-50"
                                    >
                                        Create Account
                                    </Button>
                                </Link>
                                <p className="mt-3 text-blue-200 text-sm">
                                    Already have an account?{" "}
                                    <Link
                                        href="/auth/sign-in"
                                        className="text-white underline hover:text-blue-100"
                                    >
                                        Sign in
                                    </Link>
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}