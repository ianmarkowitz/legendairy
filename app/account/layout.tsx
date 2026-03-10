import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import AccountNav from '@/components/AccountNav'

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?next=/account')
  }

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      {/* Header */}
      <header className="bg-[#1B1B2F] text-[#F5F0E8] py-4 px-4">
        <div className="max-w-5xl mx-auto">
          <a href="/" className="font-serif text-lg tracking-wide">🍦 Legendairy</a>
        </div>
      </header>

      {/* Account nav tabs */}
      <AccountNav email={user.email ?? ''} />

      {/* Page content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>
    </div>
  )
}
