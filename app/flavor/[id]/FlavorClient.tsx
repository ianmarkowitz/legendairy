'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { FlavorCreation, FlavorCustomizations } from '@/types/flavor'
import { PRICE_PER_QUART_CENTS, MIN_QUARTS, QUART_INCREMENT } from '@/lib/constants'
import AllergenBadges from '@/components/AllergenBadges'

interface Props {
  flavor:     FlavorCreation
  userId?:    string | null   // present if user is logged in
}

export default function FlavorClient({ flavor, userId }: Props) {
  const router = useRouter()

  const [customizations, setCustomizations] = useState<FlavorCustomizations>({
    vegan:            false,
    enabledMixIns:    flavor.mixIns.map(m => m.name),
    sweetnessLevel:   flavor.sweetnessLevel,
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

  const displayName  = customizations.customFlavorName ?? flavor.flavorName
  const totalCents   = quantityQuarts * PRICE_PER_QUART_CENTS
  const batchCount   = quantityQuarts / 2

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
        body:    JSON.stringify({
          flavorCreationId: flavor.id,
          quantityQuarts,
          customizations,
        }),
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

  // Soft color tint from AI suggestion (very light)
  const tintStyle = {
    backgroundColor: flavor.suggestedColor + '18', // 18 = ~10% opacity in hex
  }

  return (
    <div className="min-h-screen bg-cream">

      {/* Hero — flavor reveal */}
      <div
        className="py-16 px-4 text-center border-b border-navy/10 animate-fade-up"
        style={tintStyle}
      >
        <p className="text-navy/40 text-xs uppercase tracking-widest mb-4">
          Your flavor is ready
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
              border-b-2 border-navy outline-none w-full max-w-xl mx-auto block
            "
          />
        ) : (
          <button
            onClick={() => setEditingName(true)}
            title="Click to rename"
            className="group"
          >
            <h1 className="font-serif text-3xl md:text-5xl text-navy leading-tight">
              {displayName}
              <span className="text-navy/20 text-lg ml-2 group-hover:text-navy/50 transition-colors">
                ✏️
              </span>
            </h1>
          </button>
        )}

        <p className="font-serif italic text-navy/60 mt-3 text-lg animate-fade-up-delay">
          {flavor.tagline}
        </p>
        <p className="text-navy/70 mt-4 max-w-lg mx-auto text-sm leading-relaxed animate-fade-up-delay-2">
          {flavor.description}
        </p>
        <p className="text-forest mt-4 text-sm font-medium animate-fade-up-delay-2">
          {flavor.whyThisFlavor}
        </p>
      </div>

      {/* Customization + order panel */}
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-10">

        {/* Base toggle */}
        <section>
          <h2 className="font-serif text-xl text-navy mb-4">Base</h2>
          <div className="flex gap-3">
            {[
              { label: 'Whole Cream', sub: `${flavor.milkfatPercent}% butterfat`, vegan: false },
              { label: 'Coconut Cream', sub: 'Vegan option', vegan: true },
            ].map(opt => (
              <button
                key={String(opt.vegan)}
                onClick={() => setCustomizations(prev => ({ ...prev, vegan: opt.vegan }))}
                className={`
                  flex-1 border-2 rounded-xl px-4 py-3 text-left transition-all duration-150
                  ${customizations.vegan === opt.vegan
                    ? 'border-navy bg-navy text-cream'
                    : 'border-navy/20 bg-white text-navy hover:border-navy/50'}
                `}
              >
                <div className="font-medium">{opt.label}</div>
                <div className={`text-xs mt-0.5 ${customizations.vegan === opt.vegan ? 'text-cream/70' : 'text-navy/50'}`}>
                  {opt.sub}
                </div>
              </button>
            ))}
          </div>
          {!customizations.vegan && (
            <p className="text-navy/40 text-xs mt-2 italic">{flavor.milkfatRationale}</p>
          )}
        </section>

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
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-medium text-sm">{mixIn.name}</div>
                    <div className={`text-lg flex-shrink-0 ${enabled ? 'opacity-100' : 'opacity-20'}`}>
                      {enabled ? '✓' : '○'}
                    </div>
                  </div>
                  <div className={`text-xs mt-0.5 ${enabled ? 'text-navy/50' : 'text-navy/20'}`}>
                    {mixIn.weightGrams}g/qt · {mixIn.foldMethod.replace(/-/g, ' ')}
                  </div>
                  {mixIn.prepNote && enabled && (
                    <div className="text-xs mt-1 text-forest">{mixIn.prepNote}</div>
                  )}
                </button>
              )
            })}
          </div>
        </section>

        {/* Sweetness slider */}
        <section>
          <h2 className="font-serif text-xl text-navy mb-1">Sweetness</h2>
          <div className="flex items-center justify-between text-xs text-navy/40 mb-2">
            <span>Less Sweet</span>
            <span className="text-navy font-medium">Level {customizations.sweetnessLevel} / 10</span>
            <span>More Sweet</span>
          </div>
          <input
            type="range"
            min={1}
            max={10}
            value={customizations.sweetnessLevel}
            onChange={e => setCustomizations(prev => ({ ...prev, sweetnessLevel: Number(e.target.value) }))}
            className="w-full accent-navy"
          />
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

        {/* Share + Vault actions */}
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
                border-2 rounded-xl px-4 py-3
                text-sm font-medium transition-colors
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

          {/* Stepper */}
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

          {/* Price */}
          <div className="bg-white rounded-xl border border-navy/10 px-6 py-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-navy/60 text-sm">{quantityQuarts} qt × $19.99</span>
              <span className="font-serif text-2xl text-navy">
                ${(totalCents / 100).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Allergen warning above checkout — food safety */}
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

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="
              w-full bg-navy text-cream font-serif text-lg py-4 rounded-xl
              hover:bg-navy/90 disabled:opacity-50 disabled:cursor-not-allowed
              transition-opacity duration-150
            "
          >
            {loading ? 'Preparing your order...' : `Order ${quantityQuarts} quarts — $${(totalCents / 100).toFixed(2)}`}
          </button>

          <p className="text-navy/30 text-xs text-center mt-4">
            Secure payment via Stripe · Ships on the next qualifying Monday
          </p>
        </section>

      </div>
    </div>
  )
}
