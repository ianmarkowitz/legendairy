import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import Link from 'next/link'
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
        <div className="bg-[#1B1B2F] text-[#F5F0E8] border-b-2 border-[#B8952A]/40">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14 text-sm">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-[#B8952A] text-sm animate-sparkle">✦</span>
              <span className="font-serif text-lg italic tracking-wide group-hover:text-[#F5F0E8]/90 transition-colors">
                Legendairy
              </span>
            </Link>
            <div className="flex items-center gap-4">
              {user ? (
                <Link href="/account" className="text-[#F5F0E8]/60 hover:text-[#B8952A] transition-colors text-xs uppercase tracking-widest">
                  My Account
                </Link>
              ) : (
                <Link href="/login" className="text-[#F5F0E8]/60 hover:text-[#B8952A] transition-colors text-xs uppercase tracking-widest">
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </div>
        {children}
      </body>
    </html>
  )
}
