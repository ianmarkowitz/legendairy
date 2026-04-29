'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import Link from 'next/link'
import {
  AC, WaxSeal, Stamp, ScoopDoodle, paperGrain, acSmall,
} from '@/components/ac-primitives'

const FF = { serif: 'var(--font-fraunces)', hand: 'var(--font-caveat)' }

export default function LoginPage() {
  const [email,    setEmail]    = useState('')
  const [sent,     setSent]     = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/account'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)

    const sessionId = typeof window !== 'undefined'
      ? sessionStorage.getItem('ld_session_id') ?? ''
      : ''

    const redirectTo = `${window.location.origin}/auth/callback?session_id=${encodeURIComponent(sessionId)}&next=${encodeURIComponent(next)}`

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    })

    setLoading(false)
    if (error) { setErrorMsg(error.message) } else { setSent(true) }
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 56px)', background: AC.parchment, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', ...paperGrain }}>
      <div style={{ width: '100%', maxWidth: 460 }}>

        {/* Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <WaxSeal size={72} color={AC.rasp} rotate={-6}>
            <span style={{ ...acSmall, color: AC.cream, fontSize: 9, lineHeight: 1.4 }}>THE<br />VAULT</span>
          </WaxSeal>
          <h1 style={{ fontFamily: FF.serif, fontStyle: 'italic', fontSize: 'clamp(36px, 6vw, 52px)', color: AC.ink, margin: 0, lineHeight: 1 }}>
            The Vault
          </h1>
          <p style={{ fontFamily: FF.hand, fontSize: 20, color: AC.rasp, margin: 0 }}>
            your flavors, saved forever.
          </p>
        </div>

        {/* Card */}
        <div style={{ background: AC.cream, border: `2px solid ${AC.ink}`, borderRadius: 6, padding: '32px 32px 24px', boxShadow: `6px 6px 0 ${AC.ink}`, ...paperGrain }}>

          {!sent ? (
            <>
              <div style={{ marginBottom: 20 }}>
                <Stamp color={AC.ink} rotate={-1} style={{ fontSize: 10, opacity: 0.5 }}>— sign in —</Stamp>
              </div>

              <label style={{ fontFamily: FF.hand, fontSize: 22, display: 'block', marginBottom: 18, color: AC.ink }}>
                Dear Legendairy,
              </label>

              <form onSubmit={handleSubmit}>
                <p style={{ fontFamily: FF.hand, fontSize: 16, color: `${AC.ink}88`, marginBottom: 14, lineHeight: 1.5 }}>
                  Enter your email and we&apos;ll send you a magic link — no password needed.
                </p>

                <input
                  id="email"
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={{ fontFamily: FF.hand, fontSize: 20, width: '100%', boxSizing: 'border-box', background: 'transparent', border: 'none', borderBottom: `1.5px solid ${AC.ink}`, outline: 'none', color: AC.ink, padding: '4px 0 8px', marginBottom: 8 }}
                />

                {errorMsg && (
                  <p style={{ fontFamily: FF.hand, fontSize: 14, color: AC.rasp, marginTop: 10, marginBottom: 4 }}>{errorMsg}</p>
                )}

                <button
                  type="submit"
                  disabled={loading || !email}
                  style={{ marginTop: 20, width: '100%', background: AC.rasp, color: AC.cream, fontFamily: FF.serif, fontWeight: 700, fontStyle: 'italic', fontSize: 16, letterSpacing: '0.06em', padding: '14px 0', border: `2px solid ${AC.ink}`, borderRadius: 4, boxShadow: `4px 4px 0 ${AC.ink}`, cursor: (loading || !email) ? 'default' : 'pointer', opacity: (loading || !email) ? 0.5 : 1 }}
                >
                  {loading ? 'Sending…' : 'Send magic link ✦'}
                </button>
              </form>

              <p style={{ fontFamily: FF.hand, fontSize: 15, color: `${AC.ink}55`, textAlign: 'center', marginTop: 20 }}>
                Just browsing?{' '}
                <Link href="/" style={{ color: AC.rasp, textDecoration: 'none' }}>
                  Continue without an account
                </Link>
              </p>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <ScoopDoodle size={72} fill={AC.marigold} color={AC.ink} />
              <h2 style={{ fontFamily: FF.serif, fontStyle: 'italic', fontSize: 28, color: AC.ink, margin: '20px 0 10px' }}>
                Check your inbox
              </h2>
              <p style={{ fontFamily: FF.hand, fontSize: 18, color: `${AC.ink}88`, lineHeight: 1.5, marginBottom: 24 }}>
                We sent a magic link to{' '}
                <strong style={{ color: AC.ink }}>{email}</strong>.
                <br />Click it to sign in.
              </p>
              <button
                onClick={() => { setSent(false); setEmail('') }}
                style={{ fontFamily: FF.hand, fontSize: 15, color: `${AC.ink}55`, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
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
