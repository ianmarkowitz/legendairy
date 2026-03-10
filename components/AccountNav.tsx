'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'

interface AccountNavProps {
  email: string
}

const tabs = [
  { label: 'My Creations', href: '/account/creations' },
  { label: 'My Orders',    href: '/account/orders' },
  { label: 'The Vault',   href: '/account/vault' },
]

export default function AccountNav({ email }: AccountNavProps) {
  const pathname = usePathname()
  const router   = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <div className="border-b border-[#1B1B2F]/10 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">

        {/* Top bar: email + sign out */}
        <div className="flex items-center justify-between py-3 border-b border-[#1B1B2F]/5">
          <span className="text-sm text-[#1B1B2F]/50 truncate">{email}</span>
          <button
            onClick={handleSignOut}
            className="text-sm text-[#1B1B2F]/50 hover:text-[#1B1B2F] transition-colors"
          >
            Sign out
          </button>
        </div>

        {/* Tab navigation */}
        <nav className="flex gap-1" aria-label="Account sections">
          {tabs.map(tab => {
            const active = pathname.startsWith(tab.href)
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  active
                    ? 'border-[#1B1B2F] text-[#1B1B2F]'
                    : 'border-transparent text-[#1B1B2F]/50 hover:text-[#1B1B2F]'
                }`}
              >
                {tab.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
