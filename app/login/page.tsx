'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import Link from 'next/link'

export default function LoginPage() {
  const [email,       setEmail]       = useState('')
  const [sent,        setSent]        = useState(false)
  const [loading,     setLoading]     = useState(false)
  const [errorMsg,    setErrorMsg]    = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)

    // Grab guest session_id to pass through magic link
    const sessionId = typeof window !== 'undefined'
      ? sessionStorage.getItem('ld_session_id') ?? ''
      : ''

    const redirectTo = `${window.location.origin}/auth/callback?session_id=${encodeURIComponent(sessionId)}&next=/account`

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    })

    setLoading(false)

    if (error) {
      setErrorMsg(error.message)
    } else {
      setSent(true)
    }
  }

  return (
    <div className="min-h-screen bg-[#EDE5D5] flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="text-[#0F0F1F] text-3xl font-serif tracking-wide">
            🍦 Legendairy
          </Link>
          <p className="text-[#0F0F1F]/60 mt-1 text-sm">Your flavors, saved forever.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-[#0F0F1F]/10 p-8">

          {!sent ? (
            <>
              <h1 className="text-2xl font-serif text-[#0F0F1F] mb-2">Sign in</h1>
              <p className="text-[#0F0F1F]/60 text-sm mb-6">
                Enter your email and we&apos;ll send you a magic link — no password needed.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[#0F0F1F] mb-1">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    autoFocus
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-[#0F0F1F]/20 bg-[#EDE5D5] text-[#0F0F1F] placeholder-[#0F0F1F]/40 focus:outline-none focus:ring-2 focus:ring-[#0F0F1F]/30"
                  />
                </div>

                {errorMsg && (
                  <p className="text-red-600 text-sm">{errorMsg}</p>
                )}

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full py-3 px-6 bg-[#0F0F1F] text-[#EDE5D5] rounded-xl font-medium hover:bg-[#0F0F1F]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Sending…' : 'Send magic link'}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-[#0F0F1F]/50">
                Just browsing?{' '}
                <Link href="/" className="text-[#0F0F1F] underline underline-offset-2">
                  Continue without an account
                </Link>
              </p>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="text-4xl mb-4">✉️</div>
              <h2 className="text-xl font-serif text-[#0F0F1F] mb-2">Check your inbox</h2>
              <p className="text-[#0F0F1F]/60 text-sm mb-6">
                We sent a magic link to <strong>{email}</strong>. Click it to sign in.
              </p>
              <button
                onClick={() => { setSent(false); setEmail('') }}
                className="text-sm text-[#0F0F1F]/50 underline underline-offset-2"
              >
                Use a different email
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
