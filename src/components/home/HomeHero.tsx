import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

interface HomeHeroProps {
    isAuthenticated: boolean
}

export function HomeHero({ isAuthenticated }: HomeHeroProps) {
    return (
        <div className="bg-white shadow-sm">
            <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                        <span className="block">Spare Parts</span>
                        <span className="block text-blue-600">Quotation Service</span>
                    </h1>
                    <p className="mx-auto mt-3 max-w-md text-base text-gray-500 sm:text-lg md:mt-5 md:max-w-3xl md:text-xl">
                        Get quick quotations for your ZIEHL-ABEGG spare parts. Fast, reliable, and hassle-free service for all your replacement needs.
                    </p>

                    <div className="mt-8 flex justify-center gap-4">
                        {isAuthenticated ? (
                            <Link href="/quotation">
                                <Button size="lg" variant="default" className="gap-2">
                                    Request Quotation <ArrowRight className="w-4 h-4" />
                                </Button>
                            </Link>
                        ) : (
                            <>
                                <Link href="/auth/sign-in">
                                    <Button size="lg" variant="default" className="gap-2">
                                        Sign In <ArrowRight className="w-4 h-4" />
                                    </Button>
                                </Link>
                                <Link href="/auth/sign-up">
                                    <Button size="lg" variant="outline">
                                        Register
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}