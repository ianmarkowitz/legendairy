'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'

interface AccountNavProps { email: string }

const tabs = [
  { label: 'My Creations', href: '/account/creations' },
  { label: 'My Orders',    href: '/account/orders' },
  { label: 'The Vault',   href: '/account/vault' },
]

const ink      = '#2A1810'
const rasp     = '#C83A4E'
const parchment = '#F1E1BC'
const cream    = '#FBF3D9'
const marigold = '#E8A628'

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
    <div style={{ background: parchment, borderBottom: `2px solid ${ink}` }}>
      <div className="ac-account-inner" style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* Email + sign out */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '10px 0', borderBottom: `1px dashed ${ink}33`,
        }}>
          <span style={{
            fontFamily: 'var(--font-fraunces)', fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: '0.18em',
            fontSize: 10, color: ink, opacity: 0.5,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '50vw',
          }}>
            {email}
          </span>
          <button
            onClick={handleSignOut}
            style={{
              fontFamily: 'var(--font-fraunces)', fontWeight: 600,
              textTransform: 'uppercase', letterSpacing: '0.18em',
              fontSize: 10, color: rasp, background: 'none', border: 'none',
              cursor: 'pointer', opacity: 0.8,
            }}
          >
            Sign out
          </button>
        </div>

        {/* Tabs */}
        <nav style={{ display: 'flex', gap: 4 }}>
          {tabs.map(tab => {
            const active = pathname.startsWith(tab.href)
            return (
              <Link
                key={tab.href}
                href={tab.href}
                style={{
                  padding: '12px 20px',
                  fontFamily: 'var(--font-fraunces)',
                  fontWeight: active ? 800 : 500,
                  fontSize: 14,
                  color: active ? rasp : ink,
                  textDecoration: 'none',
                  borderBottom: active ? `3px solid ${rasp}` : '3px solid transparent',
                  opacity: active ? 1 : 0.55,
                  transition: 'all 0.15s',
                  fontStyle: active ? 'italic' : 'normal',
                  letterSpacing: '-0.01em',
                }}
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
