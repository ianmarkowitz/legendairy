'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

const EXAMPLE_CHIPS = [
  'Tahitian vanilla bean with dark chocolate shavings and sea salt caramel ribbons',
  'Aged bourbon caramel with smoked sea salt and toasted pecans',
  'Wild lavender honey with mascarpone and crushed shortbread',
  'Single-origin espresso with hazelnut praline and dark chocolate',
  'Black sesame with white truffle and yuzu zest',
]

export default function DreamInput() {
  const router      = useRouter()
  const [prompt,  setPrompt]  = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!prompt.trim() || loading) return

    setLoading(true)
    setError(null)

    let sessionId = sessionStorage.getItem('ld_session_id')
    if (!sessionId) {
      sessionId = crypto.randomUUID()
      sessionStorage.setItem('ld_session_id', sessionId)
    }

    try {
      const res = await fetch('/api/generate-flavor', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ prompt: prompt.trim(), sessionId }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.')
        setLoading(false)
        return
      }
      router.push(`/flavor/${data.id}`)
    } catch {
      setError('A network error occurred. Please try again.')
      setLoading(false)
    }
  }

  function useChip(text: string) {
    setPrompt(text)
    textareaRef.current?.focus()
  }

  if (loading) return <LoadingState />

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-black text-white flex flex-col items-center justify-center px-4 py-20">

      {/* ── Hero wordmark ── */}
      <div className="text-center mb-14">

        {/* "ARTISAN GELATO" rule */}
        <div className="flex items-center justify-center gap-5 mb-8">
          <div className="h-px w-20 bg-[#C9A96E]/50" />
          <span className="text-[#C9A96E] text-[10px] uppercase tracking-[0.3em] font-light">
            Artisan Ice Cream
          </span>
          <div className="h-px w-20 bg-[#C9A96E]/50" />
        </div>

        {/* Wordmark */}
        <h1 className="font-serif font-light text-white leading-none tracking-tight"
            style={{ fontSize: 'clamp(4rem, 12vw, 9rem)' }}>
          Legendairy
        </h1>

        {/* Tagline */}
        <p className="font-serif italic text-white/40 text-lg mt-4">
          Crafted exclusively for you
        </p>

        {/* Diamond separator */}
        <div className="flex items-center justify-center gap-5 mt-8">
          <div className="h-px w-24 bg-white/8" />
          <span className="text-[#C9A96E]/50 text-xs">◇</span>
          <div className="h-px w-24 bg-white/8" />
        </div>
      </div>

      {/* ── Form ── */}
      <form onSubmit={handleSubmit} className="w-full max-w-2xl">

        {/* Input card */}
        <div className="bg-[#0D0D0D] border border-white/8 rounded-xl p-8 mb-6">
          <h2 className="font-serif text-3xl text-white mb-3">
            Describe your dream flavor
          </h2>
          <p className="text-white/35 text-sm leading-relaxed mb-6">
            A taste you&apos;ve never experienced. A memory transformed into indulgence.
            An impossible combination made real.
          </p>
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="Tell us your vision..."
            rows={5}
            disabled={loading}
            className="
              w-full bg-black/50 border border-white/8 rounded-lg
              text-white text-sm placeholder:text-white/20
              px-4 py-3.5 focus:outline-none focus:border-[#C9A96E]/30
              resize-none transition-colors
            "
          />
        </div>

        {/* Inspiration chips */}
        <div className="mb-7">
          <p className="flex items-center gap-2.5 text-[#C9A96E] text-[10px] uppercase tracking-[0.25em] mb-4">
            <span>✦</span> Seek Inspiration
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {EXAMPLE_CHIPS.map((chip, i) => (
              <button
                key={i}
                type="button"
                onClick={() => useChip(chip)}
                className="
                  text-left text-sm text-white/40 bg-[#0D0D0D]
                  border border-white/8 rounded-lg px-4 py-3
                  hover:border-[#C9A96E]/30 hover:text-white/70
                  transition-colors
                "
              >
                {chip.length > 58 ? chip.slice(0, 55) + '…' : chip}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-red-400 text-sm bg-red-950/40 border border-red-800/30 rounded-lg px-4 py-3 mb-5">
            {error}
          </p>
        )}

        {/* CTA */}
        <button
          type="submit"
          disabled={!prompt.trim() || loading}
          className="
            w-full bg-[#C9A96E] text-black text-xs font-medium
            uppercase tracking-[0.25em] py-5 rounded-lg
            hover:bg-[#D4B47A] disabled:opacity-30 disabled:cursor-not-allowed
            transition-colors
          "
        >
          Create My Flavor ✦
        </button>
      </form>

      <p className="text-white/15 text-xs mt-10 uppercase tracking-widest">
        $19.99 / qt &nbsp;·&nbsp; Minimum 2 quarts
      </p>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-black flex flex-col items-center justify-center text-center space-y-6 px-4">
      <div className="text-6xl animate-float select-none">🍦</div>
      <div>
        <h2 className="font-serif text-3xl text-white mb-2">
          Consulting the flavor gods<span className="text-[#C9A96E]">…</span>
        </h2>
        <p className="font-serif italic text-white/30 text-sm">
          Designing something extraordinary just for you.
        </p>
      </div>
      <div className="flex justify-center gap-2">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-[#C9A96E]/50"
            style={{ animation: `bounceDot 1.2s ease-in-out ${i * 0.2}s infinite` }}
          />
        ))}
      </div>
      <p className="text-white/15 text-xs uppercase tracking-widest">
        ✦ &nbsp; this may take a moment &nbsp; ✦
      </p>
    </div>
  )
}
