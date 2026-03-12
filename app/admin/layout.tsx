import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import { supabase as serviceClient } from '@/lib/supabase'

export const revalidate = 0

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?next=/admin')
  }

  // Check admin role
  const { data: profile } = await serviceClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-[#EDE5D5]">
      {/* Admin header */}
      <header className="bg-[#0F0F1F] text-[#EDE5D5] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="font-serif text-lg">🍦 Legendairy Admin</span>
          <nav className="flex gap-1 ml-4">
            <Link
              href="/admin/orders"
              className="text-sm text-[#EDE5D5]/70 hover:text-[#EDE5D5] px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              Orders
            </Link>
          </nav>
        </div>
        <Link
          href="/"
          className="text-sm text-[#EDE5D5]/50 hover:text-[#EDE5D5] transition-colors"
        >
          ← View site
        </Link>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  )
}
