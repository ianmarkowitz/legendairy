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
    <div className="min-h-[calc(100vh-3.5rem)] bg-black">
      {/* Account nav tabs */}
      <AccountNav email={user.email ?? ''} />

      {/* Page content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>
    </div>
  )
}
