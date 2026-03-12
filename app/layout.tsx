import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import Link from 'next/link'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { createClient } from '@/lib/supabase-server'
import './globals.css'

const inter = Inter({
  subsets:  ['latin'],
  variable: '--font-inter',
  display:  'swap',
})

const playfair = Playfair_Display({
  subsets:  ['latin'],
  variable: '--font-playfair',
  display:  'swap',
})

export const metadata: Metadata = {
  title:       'Legendairy Ice Cream — Build Your Dream Flavor',
  description: 'Every flavor is a one-of-a-kind creation, made just for you. Describe your dream ice cream and we\'ll build it from scratch.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'),
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans bg-cream text-navy antialiased">
        {/* Global top bar */}
        <div className="bg-black text-white border-b border-white/5">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14 text-sm">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-[#C9A96E] text-xs">✦</span>
              <span className="font-serif text-base italic tracking-wide text-white group-hover:text-white/80 transition-colors">
                Legendairy
              </span>
            </Link>
            <div className="flex items-center gap-4">
              {user ? (
                <Link href="/account" className="text-white/40 hover:text-[#C9A96E] transition-colors text-[10px] uppercase tracking-[0.2em]">
                  My Account
                </Link>
              ) : (
                <Link href="/login" className="text-white/40 hover:text-[#C9A96E] transition-colors text-[10px] uppercase tracking-[0.2em]">
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
