import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import AccountNav from '@/components/AccountNav'

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?next=/account')

  return (
    <div style={{ minHeight: 'calc(100vh - 80px)', background: '#F1E1BC' }}>
      <AccountNav email={user.email ?? ''} />
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 40px 80px' }}>
        {children}
      </main>
    </div>
  )
}
