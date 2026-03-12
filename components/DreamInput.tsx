'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

const EXAMPLE_CHIPS = [
  'Apple pie filling folded into ice cream — apples, cinnamon, crust pieces, the whole thing',
  'Something that tastes like a bonfire on a beach — smoky, salty, a little sweet',
  'Miso caramel with black sesame and a touch of heat',
  'My grandma\'s snickerdoodle cookies turned into ice cream',
  'Tropical chaos — every fruit, maximum crunch, nothing boring',
]

export default function DreamInput() {
  const router   = useRouter()
  const [prompt, setPrompt]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)
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
    <div className="w-full max-w-2xl animate-fade-up">

      {/* Wordmark */}
      <div className="text-center mb-10">
        <div className="flex items-center justify-center gap-4 mb-1">
          <span className="text-gold text-xl animate-sparkle select-none">✦</span>
          <h1 className="font-serif text-5xl md:text-6xl text-navy tracking-tight">
            Legendairy
          </h1>
          <span className="text-gold text-xl animate-sparkle select-none" style={{ animationDelay: '1.2s' }}>✦</span>
        </div>
        <p className="font-serif italic text-navy/50 text-base mt-1">
          artisan ice cream, made just for you
        </p>
        {/* Gold divider flourish */}
        <div className="flex items-center justify-center gap-3 mt-4">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-gold/50" />
          <span className="text-gold/70 text-lg">🍦</span>
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-gold/50" />
        </div>
      </div>

      {/* Prompt card */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-navy/10 shadow-sm p-6">
          <label
            htmlFor="dream-prompt"
            className="block font-serif text-xl md:text-2xl text-navy mb-2 leading-relaxed"
          >
            What&apos;s your dream ice cream?
          </label>
          <p className="font-serif italic text-navy/50 text-sm mb-4 leading-relaxed">
            A flavor you&apos;ve never found anywhere. A memory you want to eat.
            A wild combination you&apos;ve always wondered about.
          </p>
          <textarea
            id="dream-prompt"
            ref={textareaRef}
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="Describe your dream flavor…"
            rows={4}
            className="
              w-full bg-cream/80 border-2 border-navy/10 rounded-xl px-5 py-4
              font-sans text-base text-navy placeholder:text-navy/30
              focus:outline-none focus:border-gold/50 resize-none
              transition-colors duration-200
            "
            disabled={loading}
          />
        </div>

        {/* Example chips */}
        <div>
          <p className="text-navy/40 text-xs mb-3 uppercase tracking-wider flex items-center gap-2">
            <span className="text-gold/60">✦</span> Need a spark?
          </p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_CHIPS.map((chip, i) => (
              <button
                key={i}
                type="button"
                onClick={() => useChip(chip)}
                className="
                  text-xs bg-white border border-gold/30 rounded-full px-3 py-1.5
                  text-navy/60 hover:border-gold hover:text-navy hover:bg-gold/5
                  transition-colors duration-150 text-left
                "
              >
                {chip.length > 55 ? chip.slice(0, 52) + '…' : chip}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!prompt.trim() || loading}
          className="
            relative w-full bg-navy text-cream font-serif text-lg py-4 rounded-xl
            hover:bg-navy/90 disabled:opacity-40 disabled:cursor-not-allowed
            overflow-hidden btn-shimmer transition-colors duration-150
          "
        >
          Build My Flavor ✦
        </button>
      </form>

      <p className="text-center text-navy/30 text-xs mt-8 flex items-center justify-center gap-2">
        <span className="text-gold/40">✦</span>
        Every creation is one of a kind · $19.99/qt · Minimum 2 quarts
        <span className="text-gold/40">✦</span>
      </p>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="text-center space-y-6 animate-fade-up px-4">
      <div className="text-7xl animate-float select-none">🍦</div>
      <div>
        <h2 className="font-serif text-3xl text-navy mb-2">
          Consulting the flavor gods<span className="text-gold">…</span>
        </h2>
        <p className="font-serif italic text-navy/50 text-sm">
          Designing something extraordinary just for you.
        </p>
      </div>
      {/* Bouncing dots */}
      <div className="flex justify-center gap-2">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-gold/60"
            style={{ animation: `bounceDot 1.2s ease-in-out ${i * 0.2}s infinite` }}
          />
        ))}
      </div>
      <p className="text-navy/30 text-xs uppercase tracking-widest">
        ✦ &nbsp; this may take a moment &nbsp; ✦
      </p>
    </div>
  )
}
