'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import Link from 'next/link'

export default function LoginPage() {
  const [email,    setEmail]    = useState('')
  const [sent,     setSent]     = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

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
    <div className="min-h-[calc(100vh-3.5rem)] bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Wordmark */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px w-16 bg-[#C9A96E]/30" />
            <span className="text-[#C9A96E] text-[10px] uppercase tracking-[0.3em]">Legendairy</span>
            <div className="h-px w-16 bg-[#C9A96E]/30" />
          </div>
          <p className="text-white/30 text-sm font-serif italic">Your flavors, saved forever.</p>
        </div>

        <div className="bg-[#0D0D0D] rounded-xl border border-white/8 p-8">

          {!sent ? (
            <>
              <h1 className="font-serif text-2xl text-white mb-2">Sign in</h1>
              <p className="text-white/40 text-sm mb-6">
                Enter your email and we&apos;ll send you a magic link — no password needed.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-[10px] font-medium text-white/40 uppercase tracking-[0.2em] mb-2">
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
                    className="
                      w-full px-4 py-3 rounded-lg border border-white/8 bg-black/50
                      text-white placeholder:text-white/20
                      focus:outline-none focus:border-[#C9A96E]/30 transition-colors
                    "
                  />
                </div>

                {errorMsg && (
                  <p className="text-red-400 text-sm bg-red-950/40 border border-red-800/30 rounded-lg px-3 py-2">
                    {errorMsg}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="
                    w-full py-4 bg-[#C9A96E] text-black text-xs font-medium
                    uppercase tracking-[0.25em] rounded-lg
                    hover:bg-[#D4B47A] disabled:opacity-40 disabled:cursor-not-allowed transition-colors
                  "
                >
                  {loading ? 'Sending…' : 'Send magic link ✦'}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-white/30">
                Just browsing?{' '}
                <Link href="/" className="text-[#C9A96E] hover:text-[#D4B47A] transition-colors">
                  Continue without an account
                </Link>
              </p>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="text-4xl mb-4">✉️</div>
              <h2 className="font-serif text-xl text-white mb-2">Check your inbox</h2>
              <p className="text-white/40 text-sm mb-6">
                We sent a magic link to <strong className="text-white">{email}</strong>. Click it to sign in.
              </p>
              <button
                onClick={() => { setSent(false); setEmail('') }}
                className="text-sm text-white/30 hover:text-[#C9A96E] transition-colors"
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
