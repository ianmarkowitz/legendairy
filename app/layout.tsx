import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans bg-cream text-navy antialiased">
        {children}
      </body>
    </html>
  )
}
