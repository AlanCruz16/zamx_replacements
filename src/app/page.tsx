import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { HomeHero } from '@/components/home/HomeHero'
import { Features } from '@/components/home/Features'
import { CTA } from '@/components/home/CTA'
import { Footer } from '@/components/layout/Footer'

export default async function Home() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  const { data: { session } } = await supabase.auth.getSession()

  return (
    <div className="min-h-screen bg-gray-50">
      <HomeHero isAuthenticated={!!session} />
      <Features />
      <CTA isAuthenticated={!!session} />
      <Footer />
    </div>
  )
}