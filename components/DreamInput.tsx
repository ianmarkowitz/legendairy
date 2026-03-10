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

    // Guest session ID — persisted in sessionStorage for pre-auth tracking
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
      <div className="text-center mb-12">
        <h1 className="font-serif text-4xl md:text-5xl text-navy tracking-tight mb-2">
          Legendairy
        </h1>
        <p className="text-navy/50 text-sm tracking-widest uppercase">
          Ice Cream
        </p>
      </div>

      {/* Prompt area */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="dream-prompt"
            className="block font-serif text-xl md:text-2xl text-navy mb-4 leading-relaxed"
          >
            Tell us about your dream ice cream.
          </label>
          <p className="text-navy/60 text-sm mb-4 leading-relaxed">
            A flavor you've never found anywhere. A memory you want to eat. A wild
            combination you've always wondered about. We'll build it from scratch, just for you.
          </p>
          <textarea
            id="dream-prompt"
            ref={textareaRef}
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="Describe your dream flavor..."
            rows={5}
            className="
              w-full bg-white border-2 border-navy/20 rounded-xl px-5 py-4
              font-sans text-base text-navy placeholder:text-navy/30
              focus:outline-none focus:border-navy resize-none
              transition-colors duration-200
            "
            disabled={loading}
          />
        </div>

        {/* Example chips */}
        <div>
          <p className="text-navy/40 text-xs mb-3 uppercase tracking-wider">
            Need a spark?
          </p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_CHIPS.map((chip, i) => (
              <button
                key={i}
                type="button"
                onClick={() => useChip(chip)}
                className="
                  text-xs bg-white border border-navy/20 rounded-full px-3 py-1.5
                  text-navy/70 hover:border-navy hover:text-navy
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
            w-full bg-navy text-cream font-serif text-lg py-4 rounded-xl
            hover:bg-navy/90 disabled:opacity-40 disabled:cursor-not-allowed
            transition-opacity duration-150
          "
        >
          Build My Flavor →
        </button>
      </form>

      <p className="text-center text-navy/30 text-xs mt-8">
        Every creation is unique. $19.99/qt · Minimum 2 quarts.
      </p>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="text-center space-y-6 animate-fade-up">
      <div className="text-6xl animate-drip">🍦</div>
      <div>
        <h2 className="font-serif text-2xl text-navy mb-2">
          Consulting the flavor gods...
        </h2>
        <p className="text-navy/50 text-sm">
          Designing something extraordinary just for you.
        </p>
      </div>
      {/* Animated dots */}
      <div className="flex justify-center gap-2">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-navy/30"
            style={{ animation: `drip 1.2s ease-in-out ${i * 0.2}s infinite` }}
          />
        ))}
      </div>
    </div>
  )
}
