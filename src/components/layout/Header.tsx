'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/hooks/use-supabase'
import { Button } from '@/components/ui/button'
import { LogOut, User } from 'lucide-react'
import { toast } from 'sonner'

export function Header() {
    const router = useRouter()
    const { supabase } = useSupabase()

    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut()

        if (error) {
            toast.error('Error signing out')
            return
        }

        toast.success('Signed out successfully')
        router.refresh()
        router.push('/')
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center justify-between">
                <Link href="/" className="flex items-center space-x-2">
                    <span className="font-bold">Quotation Service</span>
                </Link>

                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        asChild
                    >
                        <Link href="/profile">
                            <User className="h-4 w-4" />
                            <span className="sr-only">Profile</span>
                        </Link>
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleSignOut}
                    >
                        <LogOut className="h-4 w-4" />
                        <span className="sr-only">Sign out</span>
                    </Button>
                </div>
            </div>
        </header>
    )
}