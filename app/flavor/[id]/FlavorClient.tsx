'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { FlavorCreation, FlavorCustomizations } from '@/types/flavor'
import { PRICE_PER_QUART_CENTS, MIN_QUARTS, QUART_INCREMENT } from '@/lib/constants'
import { calculateShipDate, formatShipDate } from '@/lib/utils'
import AllergenBadges from '@/components/AllergenBadges'

interface Props {
  flavor:  FlavorCreation
  userId?: string | null
}

/** Render **bold** markdown as <strong> spans */
function renderBold(text: string) {
  const parts = text.split(/\*\*(.+?)\*\*/)
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : part,
  )
}

export default function FlavorClient({ flavor, userId }: Props) {
  const router = useRouter()

  const [customizations, setCustomizations] = useState<FlavorCustomizations>({
    vegan:            false,   // whole cream only — no non-dairy option
    enabledMixIns:    flavor.mixIns.map(m => m.name),
    sweetnessLevel:   flavor.sweetnessLevel,   // use AI value, not user-editable
    customFlavorName: null,
    personalNote:     null,
  })
  const [quantityQuarts, setQuantityQuarts] = useState(MIN_QUARTS)
  const [editingName, setEditingName]       = useState(false)
  const [loading, setLoading]               = useState(false)
  const [error, setError]                   = useState<string | null>(null)
  const [vaulted, setVaulted]               = useState(false)
  const [vaultLoading, setVaultLoading]     = useState(false)
  const [copied, setCopied]                 = useState(false)

  // Remix state
  const [remixOpen, setRemixOpen]       = useState(false)
  const [remixPrompt, setRemixPrompt]   = useState('')
  const [remixLoading, setRemixLoading] = useState(false)
  const [remixError, setRemixError]     = useState<string | null>(null)

  const displayName = customizations.customFlavorName ?? flavor.flavorName
  const totalCents  = quantityQuarts * PRICE_PER_QUART_CENTS
  const batchCount  = quantityQuarts / 2
  const shipDate    = formatShipDate(calculateShipDate(new Date()))

  function toggleMixIn(name: string) {
    setCustomizations(prev => ({
      ...prev,
      enabledMixIns: prev.enabledMixIns.includes(name)
        ? prev.enabledMixIns.filter(n => n !== name)
        : [...prev.enabledMixIns, name],
    }))
  }

  async function handleCheckout() {
    if (customizations.enabledMixIns.length === 0) {
      setError('Please keep at least one mix-in.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/create-checkout', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ flavorCreationId: flavor.id, quantityQuarts, customizations }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Checkout failed.'); setLoading(false); return }
      window.location.href = data.url
    } catch {
      setError('A network error occurred. Please try again.')
      setLoading(false)
    }
  }

  async function handleVaultToggle() {
    if (!userId) return
    setVaultLoading(true)
    try {
      const res = await fetch('/api/vault', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ flavorCreationId: flavor.id, is_vaulted: !vaulted }),
      })
      if (res.ok) {
        const data = await res.json()
        setVaulted(data.is_vaulted)
      }
    } catch {
      // silent — non-critical
    } finally {
      setVaultLoading(false)
    }
  }

  function handleShare() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  async function handleRemix() {
    if (!remixPrompt.trim()) return
    setRemixLoading(true)
    setRemixError(null)
    try {
      // Grab session ID for guest session tracking
      const sessionId = typeof window !== 'undefined'
        ? (sessionStorage.getItem('ld_session_id') ?? undefined)
        : undefined

      const contextPrompt = [
        `Existing flavor: "${flavor.flavorName}"`,
        `Tagline: ${flavor.tagline}`,
        `Description: ${flavor.description}`,
        `Primary flavor: ${flavor.primaryFlavor}`,
        `Sweetness: level ${flavor.sweetnessLevel}/10 using ${flavor.sweetenerType}`,
        `Mix-ins: ${flavor.mixIns.map(m => m.name).join(', ')}`,
        flavor.makerNotes ? `Maker notes: ${flavor.makerNotes}` : null,
        `Original concept: ${flavor.customerPrompt}`,
        ``,
        `Customer tweak request: ${remixPrompt.trim()}`,
      ].filter(Boolean).join('\n')

      const res = await fetch('/api/generate-flavor', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ prompt: contextPrompt, sessionId }),
      })
      const data = await res.json()
      if (!res.ok) { setRemixError(data.error ?? 'Could not generate. Try again.'); return }
      router.push(`/flavor/${data.id}`)
    } catch {
      setRemixError('A network error occurred. Please try again.')
    } finally {
      setRemixLoading(false)
    }
  }

  // Richer color tint from AI suggestion
  const tintStyle = {
    background: `linear-gradient(160deg, ${flavor.suggestedColor}22 0%, ${flavor.suggestedColor}0a 100%)`,
  }

  return (
    <div className="min-h-screen bg-cream">

      {/* Hero — flavor reveal */}
      <div
        className="py-16 px-4 text-center border-b-2 border-navy/10 animate-fade-up relative overflow-hidden"
        style={tintStyle}
      >
        {/* Decorative dot in top corners */}
        <span className="absolute top-5 left-6 text-gold/30 text-2xl select-none animate-sparkle">✦</span>
        <span className="absolute top-5 right-6 text-gold/30 text-2xl select-none animate-sparkle" style={{ animationDelay: '1.2s' }}>✦</span>

        <p className="font-serif italic text-navy/40 text-xs tracking-widest mb-5 flex items-center justify-center gap-2">
          <span className="text-gold/50">✦</span>
          your flavor is ready
          <span className="text-gold/50">✦</span>
        </p>

        {/* Flavor name — editable */}
        {editingName ? (
          <input
            autoFocus
            defaultValue={displayName}
            onBlur={e => {
              const v = e.target.value.trim()
              setCustomizations(prev => ({ ...prev, customFlavorName: v || null }))
              setEditingName(false)
            }}
            onKeyDown={e => e.key === 'Enter' && e.currentTarget.blur()}
            className="
              font-serif text-3xl md:text-5xl text-navy text-center bg-transparent
              border-b-2 border-gold/50 outline-none w-full max-w-xl mx-auto block
            "
          />
        ) : (
          <button onClick={() => setEditingName(true)} title="Click to rename" className="group">
            <h1 className="font-serif text-4xl md:text-6xl text-navy leading-tight">
              {displayName}
              <span className="text-navy/20 text-xl ml-2 group-hover:text-gold/60 transition-colors">✏️</span>
            </h1>
          </button>
        )}

        {/* Gold underline */}
        <div className="flex items-center justify-center gap-3 mt-3 mb-4">
          <div className="h-px w-20 bg-gradient-to-r from-transparent to-gold/40" />
          <div className="w-1.5 h-1.5 rounded-full bg-gold/50" />
          <div className="h-px w-20 bg-gradient-to-l from-transparent to-gold/40" />
        </div>

        <p className="font-serif italic text-navy/60 text-lg animate-fade-up-delay">
          {renderBold(flavor.tagline)}
        </p>
        <p className="text-navy/70 mt-4 max-w-lg mx-auto text-sm leading-relaxed animate-fade-up-delay-2">
          {renderBold(flavor.description)}
        </p>
        <p className="font-serif italic text-forest mt-4 text-sm animate-fade-up-delay-2">
          {flavor.whyThisFlavor}
        </p>

        {/* Remix / Start Over */}
        <div className="flex items-center justify-center gap-3 mt-8">
          <button
            onClick={() => router.push('/')}
            className="
              text-sm text-navy/50 hover:text-navy border border-navy/20 hover:border-navy/50
              px-4 py-2 rounded-xl transition-colors
            "
          >
            Start Over
          </button>
          <button
            onClick={() => { setRemixOpen(o => !o); setRemixError(null) }}
            className="
              text-sm font-medium text-navy border-2 border-gold/40 hover:border-gold
              bg-white/60 hover:bg-gold/5 px-4 py-2 rounded-xl transition-colors
            "
          >
            {remixOpen ? 'Cancel' : '✦ Remix this flavor'}
          </button>
        </div>

        {/* Inline remix panel */}
        {remixOpen && (
          <div className="mt-5 max-w-lg mx-auto text-left bg-white/70 rounded-2xl border border-gold/20 p-5 shadow-sm">
            <p className="font-serif italic text-navy/50 text-sm mb-3 text-center">
              How can we make this flavor even better?
            </p>
            <textarea
              rows={2}
              value={remixPrompt}
              onChange={e => setRemixPrompt(e.target.value)}
              placeholder="e.g. 'make it extra spicy' or 'swap in dark chocolate'"
              className="
                w-full bg-cream/80 border-2 border-navy/10 rounded-xl px-4 py-3
                font-sans text-sm text-navy placeholder:text-navy/30
                focus:outline-none focus:border-gold/50 resize-none
              "
            />
            {remixError && (
              <p className="text-red-600 text-xs mt-1">{remixError}</p>
            )}
            <button
              onClick={handleRemix}
              disabled={remixLoading || !remixPrompt.trim()}
              className="
                mt-3 w-full bg-navy text-cream font-serif py-3 rounded-xl
                hover:bg-navy/90 disabled:opacity-40 disabled:cursor-not-allowed
                relative overflow-hidden btn-shimmer transition-colors
              "
            >
              {remixLoading ? 'Generating…' : 'Remix this flavor ✦'}
            </button>
          </div>
        )}
      </div>

      {/* Customization + order panel */}
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-10">

        {/* Mix-ins */}
        <section>
          <h2 className="font-serif text-xl text-navy mb-1">Mix-Ins</h2>
          <p className="text-navy/50 text-xs mb-4">Toggle to include or exclude</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {flavor.mixIns.map(mixIn => {
              const enabled = customizations.enabledMixIns.includes(mixIn.name)
              return (
                <button
                  key={mixIn.name}
                  onClick={() => toggleMixIn(mixIn.name)}
                  className={`
                    border-2 rounded-xl px-4 py-3 text-left transition-all duration-150
                    ${enabled
                      ? 'border-navy bg-white text-navy'
                      : 'border-navy/10 bg-navy/5 text-navy/30'}
                  `}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-medium text-sm">{mixIn.name}</div>
                    <div className={`text-lg flex-shrink-0 ${enabled ? 'opacity-100' : 'opacity-20'}`}>
                      {enabled ? '✓' : '○'}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        {/* Personal note */}
        <section>
          <h2 className="font-serif text-xl text-navy mb-1">Label Dedication</h2>
          <p className="text-navy/50 text-xs mb-3">
            A personal note printed on your label. Optional.
          </p>
          <textarea
            rows={2}
            placeholder={`"Made for Mom's birthday — her favourite was always mint."`}
            value={customizations.personalNote ?? ''}
            onChange={e => setCustomizations(prev => ({
              ...prev,
              personalNote: e.target.value || null,
            }))}
            className="
              w-full bg-white border-2 border-navy/20 rounded-xl px-4 py-3
              font-sans text-sm text-navy placeholder:text-navy/30
              focus:outline-none focus:border-navy resize-none
            "
          />
        </section>

        {/* Allergens */}
        {flavor.allergenFlags.length > 0 && (
          <section>
            <AllergenBadges flags={flavor.allergenFlags} />
          </section>
        )}

        {/* Share + Vault */}
        <section className="flex gap-3">
          <button
            onClick={handleShare}
            className="
              flex-1 flex items-center justify-center gap-2
              border-2 border-navy/20 rounded-xl px-4 py-3
              text-navy text-sm font-medium
              hover:border-navy/50 transition-colors
            "
          >
            {copied ? '✓ Copied!' : '🔗 Share'}
          </button>
          {userId && (
            <button
              onClick={handleVaultToggle}
              disabled={vaultLoading}
              className={`
                flex-1 flex items-center justify-center gap-2
                border-2 rounded-xl px-4 py-3 text-sm font-medium transition-colors
                ${vaulted
                  ? 'border-forest bg-forest/10 text-forest'
                  : 'border-navy/20 text-navy hover:border-navy/50'}
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              {vaulted ? '♥ Vaulted' : '♡ Save to Vault'}
            </button>
          )}
        </section>

        {/* Quantity + order */}
        <section className="border-t border-navy/10 pt-8">
          <h2 className="font-serif text-xl text-navy mb-4">How many quarts?</h2>

          <div className="flex items-center gap-4 mb-2">
            <button
              onClick={() => setQuantityQuarts(q => Math.max(MIN_QUARTS, q - QUART_INCREMENT))}
              disabled={quantityQuarts <= MIN_QUARTS}
              className="
                w-12 h-12 rounded-full border-2 border-navy/30 text-2xl text-navy
                flex items-center justify-center hover:border-navy disabled:opacity-30
                disabled:cursor-not-allowed transition-colors
              "
            >
              −
            </button>
            <div className="text-center flex-1">
              <div className="font-serif text-3xl text-navy">{quantityQuarts} qt</div>
              <div className="text-navy/40 text-xs">{batchCount} batch{batchCount > 1 ? 'es' : ''}</div>
            </div>
            <button
              onClick={() => setQuantityQuarts(q => q + QUART_INCREMENT)}
              className="
                w-12 h-12 rounded-full border-2 border-navy/30 text-2xl text-navy
                flex items-center justify-center hover:border-navy transition-colors
              "
            >
              +
            </button>
          </div>

          <p className="text-navy/40 text-xs text-center mb-6">
            Orders come in multiples of 2 quarts (1 batch = 2 quarts)
          </p>

          <div className="bg-white rounded-xl border border-navy/10 px-6 py-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-navy/60 text-sm">{quantityQuarts} qt × $19.99</span>
              <span className="font-serif text-2xl text-navy">
                ${(totalCents / 100).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Allergen warning */}
          {flavor.allergenFlags.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
              <p className="text-red-700 text-sm font-semibold mb-1">⚠️ Allergen Notice</p>
              <p className="text-red-600 text-xs">
                This flavor contains: {flavor.allergenFlags.map(f => f.toUpperCase()).join(', ')}
              </p>
            </div>
          )}

          {error && (
            <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
              {error}
            </p>
          )}

          {/* Estimated ship date */}
          <p className="text-navy/50 text-sm text-center mb-3">
            🚚 Estimated ship date: <span className="font-medium text-navy">{shipDate}</span>
          </p>

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="
              relative w-full bg-navy text-cream font-serif text-lg py-4 rounded-xl
              hover:bg-navy/90 disabled:opacity-40 disabled:cursor-not-allowed
              overflow-hidden btn-shimmer transition-colors duration-150
            "
          >
            {loading ? 'Preparing your order…' : `Order ${quantityQuarts} quarts — $${(totalCents / 100).toFixed(2)}`}
          </button>

          <p className="text-navy/30 text-xs text-center mt-4 flex items-center justify-center gap-2">
            <span className="text-gold/30">✦</span>
            Secure payment via Stripe · Ships on the next qualifying Monday
            <span className="text-gold/30">✦</span>
          </p>
        </section>

      </div>
    </div>
  )
}
