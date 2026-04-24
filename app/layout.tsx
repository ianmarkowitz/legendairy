import type { Metadata } from 'next'
import { Fraunces, Caveat } from 'next/font/google'
import Link from 'next/link'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { createClient } from '@/lib/supabase-server'
import './globals.css'

const fraunces = Fraunces({
  subsets:  ['latin'],
  variable: '--font-fraunces',
  display:  'swap',
  axes:     ['SOFT', 'WONK', 'opsz'],
})

const caveat = Caveat({
  subsets:  ['latin'],
  variable: '--font-caveat',
  display:  'swap',
})

export const metadata: Metadata = {
  title:       'Legendairy Ice Cream — Dream a Flavor',
  description: 'Every flavor is a one-of-a-kind creation, made just for you. Describe your dream ice cream and we\'ll churn it from scratch.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'),
}

const MARQUEE_ITEMS = [
  '✦ ONE-OF-ONE FLAVORS',
  '✦ CHURNED TO ORDER',
  '✦ EST. 2025 BROOKLYN',
  '✦ NO TWO PINTS ALIKE',
  '✦ DELIVERED ON DRY ICE',
  '✦ DREAMT BY YOU',
  '✦ MADE BY HAND',
  '✦ NEVER RE-MADE',
]

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const marqueeFull = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS]

  return (
    <html lang="en" className={`${fraunces.variable} ${caveat.variable}`}>
      <body className="font-serif antialiased" style={{ background: '#F1E1BC', color: '#2A1810' }}>

        {/* Announcement marquee */}
        <div className="overflow-hidden bg-ac-ink text-ac-cream py-2.5" style={{ fontSize: 10, letterSpacing: '0.18em', fontFamily: 'var(--font-fraunces)', fontWeight: 600, textTransform: 'uppercase' }}>
          <div className="animate-marquee whitespace-nowrap flex gap-10">
            {marqueeFull.map((t, i) => (
              <span key={i} className="flex-shrink-0">{t}</span>
            ))}
          </div>
        </div>

        {/* Global nav */}
        <nav className="bg-ac-parchment border-b-2 border-ac-ink" style={{ background: '#F1E1BC' }}>
          <div className="max-w-7xl mx-auto px-6 sm:px-10 flex items-center justify-between h-16">

            {/* Brand */}
            <Link href="/" className="flex items-center gap-3 group">
              <ScoopIcon />
              <div>
                <div className="font-serif text-xl italic font-black tracking-tight leading-none" style={{ color: '#2A1810' }}>
                  Legendairy
                </div>
                <div className="font-hand text-sm leading-none" style={{ color: '#C83A4E', fontFamily: 'var(--font-caveat)', fontWeight: 700, marginTop: 1 }}>
                  — an ice cream carnival
                </div>
              </div>
            </Link>

            {/* Links */}
            <div className="hidden md:flex items-center gap-8 text-sm font-medium" style={{ color: '#2A1810' }}>
              <Link href="/#how-it-works" className="hover:opacity-70 transition-opacity">How it works</Link>
              <Link href="/#examples" className="hover:opacity-70 transition-opacity">Examples</Link>
              {user ? (
                <Link href="/account/vault" className="hover:opacity-70 transition-opacity">The Vault</Link>
              ) : null}
            </div>

            {/* CTA */}
            <div className="flex items-center gap-4">
              {user ? (
                <Link
                  href="/account"
                  className="text-xs uppercase tracking-widest font-bold opacity-60 hover:opacity-100 transition-opacity"
                  style={{ color: '#2A1810' }}
                >
                  My Account
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="text-xs uppercase tracking-widest font-bold opacity-60 hover:opacity-100 transition-opacity"
                  style={{ color: '#2A1810' }}
                >
                  Sign In
                </Link>
              )}
              <Link
                href="/"
                className="stamp hidden sm:inline-block"
                style={{
                  color: '#C83A4E',
                  transform: 'rotate(-2deg)',
                  fontSize: 12,
                  letterSpacing: '0.1em',
                }}
              >
                Begin a dream →
              </Link>
            </div>
          </div>
        </nav>

        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}

function ScoopIcon() {
  return (
    <svg viewBox="0 0 100 120" width={38} height={46} style={{ display: 'block', flexShrink: 0 }}>
      <path
        d="M50 10 C 28 10, 18 30, 22 45 C 12 44, 8 58, 18 62 C 14 72, 28 78, 36 72 C 40 80, 56 82, 62 74 C 72 78, 84 70, 80 58 C 90 54, 88 38, 78 36 C 80 20, 66 8, 50 10 Z"
        fill="#C83A4E" stroke="#2A1810" strokeWidth="2" strokeLinejoin="round"
      />
      <path d="M28 66 L 72 66 L 56 112 L 44 112 Z" fill="none" stroke="#2A1810" strokeWidth="2" strokeLinejoin="round"/>
      <line x1="34" y1="78" x2="64" y2="78" stroke="#2A1810" strokeWidth="1.3"/>
      <line x1="36" y1="88" x2="62" y2="88" stroke="#2A1810" strokeWidth="1.3"/>
      <circle cx="38" cy="32" r="2" fill="#2A1810"/>
      <circle cx="56" cy="26" r="1.5" fill="#2A1810"/>
    </svg>
  )
}
