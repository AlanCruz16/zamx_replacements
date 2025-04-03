import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { HomeHero } from '@/components/home/HomeHero'
import { Features } from '@/components/home/Features'
import { CTA } from '@/components/home/CTA'
import { Footer } from '@/components/layout/Footer'

export default async function Home() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser() // Changed getSession to getUser and session to user

  return (
    <div className="min-h-screen bg-gray-50">
      <HomeHero isAuthenticated={!!user} /> {/* Changed session to user */}
      <Features />
      <CTA isAuthenticated={!!user} /> {/* Changed session to user */}
      <Footer />
    </div>
  )
}
