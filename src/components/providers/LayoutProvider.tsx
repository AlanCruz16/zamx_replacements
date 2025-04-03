'use client'

import { usePathname } from 'next/navigation'
import { Header } from '@/components/layout/Header'

interface LayoutProviderProps {
    children: React.ReactNode
}

export function LayoutProvider({ children }: LayoutProviderProps) {
    const pathname = usePathname()
    const isAuthPage = pathname.startsWith('/auth/')

    if (isAuthPage) {
        return <>{children}</>
    }

    return (
        <>
            <Header />
            <main>
                {children}
            </main>
        </>
    )
}