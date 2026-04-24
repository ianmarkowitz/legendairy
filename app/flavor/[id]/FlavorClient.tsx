'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { FlavorCreation, FlavorCustomizations } from '@/types/flavor'
import { PRICE_PER_QUART_CENTS, MIN_QUARTS, QUART_INCREMENT } from '@/lib/constants'
import { calculateShipDate, formatShipDate } from '@/lib/utils'
import AllergenBadges from '@/components/AllergenBadges'

interface Props { flavor: FlavorCreation; userId?: string | null }

function renderBold(text: string) {
  return text.split(/\*\*(.+?)\*\*/).map((p, i) => i % 2 === 1 ? <strong key={i}>{p}</strong> : p)
}

const C = { parchment: '#F1E1BC', cream: '#FBF3D9', ink: '#2A1810', rasp: '#C83A4E', marigold: '#E8A628', cherry: '#8A1F2B' }
const FR = 'var(--font-fraunces)', CAV = 'var(--font-caveat)'
const italic = (sz: number, col = C.ink, wt = 400): React.CSSProperties =>
  ({ fontFamily: FR, fontStyle: 'italic', fontSize: sz, color: col, fontWeight: wt })
const sqBtn = (active: boolean): React.CSSProperties => ({
  padding: '8px 20px', cursor: 'pointer',
  background: active ? C.marigold : 'transparent',
  border: `2px solid ${active ? C.marigold : `${C.cream}44`}`,
  color: active ? C.ink : `${C.cream}88`,
  ...italic(14, active ? C.ink : `${C.cream}88`, active ? 700 : 400),
})

export default function FlavorClient({ flavor, userId }: Props) {
  const router = useRouter()
  const [customizations, setCustomizations] = useState<FlavorCustomizations>({
    vegan: false, enabledMixIns: flavor.mixIns.map(m => m.name),
    sweetnessLevel: flavor.sweetnessLevel, customFlavorName: null, personalNote: null,
  })
  const [quantityQuarts, setQuantityQuarts] = useState(MIN_QUARTS)
  const [editingName, setEditingName] = useState(false)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState<string | null>(null)
  const [vaulted, setVaulted]         = useState(false)
  const [vaultLoading, setVaultLoading] = useState(false)
  const [copied, setCopied]           = useState(false)
  const [remixOpen, setRemixOpen]     = useState(false)
  const [remixPrompt, setRemixPrompt] = useState('')
  const [remixLoading, setRemixLoading] = useState(false)
  const [remixError, setRemixError]   = useState<string | null>(null)

  const displayName = customizations.customFlavorName ?? flavor.flavorName
  const totalCents  = quantityQuarts * PRICE_PER_QUART_CENTS
  const batchCount  = quantityQuarts / 2
  const shipDate    = formatShipDate(calculateShipDate(new Date()))
  const shortId     = flavor.id.slice(0, 8).toUpperCase()

  function toggleMixIn(name: string) {
    setCustomizations(prev => ({
      ...prev,
      enabledMixIns: prev.enabledMixIns.includes(name)
        ? prev.enabledMixIns.filter(n => n !== name)
        : [...prev.enabledMixIns, name],
    }))
  }

  async function handleCheckout() {
    if (customizations.enabledMixIns.length === 0) { setError('Please keep at least one mix-in.'); return }
    setLoading(true); setError(null)
    try {
      const res  = await fetch('/api/create-checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ flavorCreationId: flavor.id, quantityQuarts, customizations }) })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Checkout failed.'); setLoading(false); return }
      window.location.href = data.url
    } catch { setError('A network error occurred. Please try again.'); setLoading(false) }
  }

  async function handleVaultToggle() {
    if (!userId) return
    setVaultLoading(true)
    try {
      const res = await fetch('/api/vault', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ flavorCreationId: flavor.id, is_vaulted: !vaulted }) })
      if (res.ok) { const d = await res.json(); setVaulted(d.is_vaulted) }
    } catch { /* silent */ } finally { setVaultLoading(false) }
  }

  function handleShare() {
    navigator.clipboard.writeText(window.location.href).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }

  async function handleRemix() {
    if (!remixPrompt.trim()) return
    setRemixLoading(true); setRemixError(null)
    try {
      const sessionId = typeof window !== 'undefined' ? (sessionStorage.getItem('ld_session_id') ?? undefined) : undefined
      const contextPrompt = [
        `Existing flavor: "${flavor.flavorName}"`, `Tagline: ${flavor.tagline}`,
        `Description: ${flavor.description}`, `Primary flavor: ${flavor.primaryFlavor}`,
        `Sweetness: level ${flavor.sweetnessLevel}/10 using ${flavor.sweetenerType}`,
        `Mix-ins: ${flavor.mixIns.map(m => m.name).join(', ')}`,
        flavor.makerNotes ? `Maker notes: ${flavor.makerNotes}` : null,
        `Original concept: ${flavor.customerPrompt}`, ``,
        `Customer tweak request: ${remixPrompt.trim()}`,
      ].filter(Boolean).join('\n')
      const res  = await fetch('/api/generate-flavor', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: contextPrompt, sessionId }) })
      const data = await res.json()
      if (!res.ok) { setRemixError(data.error ?? 'Could not generate. Try again.'); return }
      router.push(`/flavor/${data.id}`)
    } catch { setRemixError('A network error occurred. Please try again.') }
    finally { setRemixLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', background: C.parchment }}>

      {/* ── 1. HEADER ── */}
      <header style={{ background: C.parchment, borderBottom: `2px solid ${C.ink}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 28px' }}>
        <span style={{ ...italic(26, C.ink, 700) }}>Legendairy</span>
        <div style={{ border: `2px solid ${C.rasp}`, color: C.rasp, padding: '4px 14px', transform: 'rotate(-2deg)', fontFamily: FR, fontStyle: 'italic', fontSize: 11, letterSpacing: '0.12em', fontWeight: 700, textTransform: 'uppercase' }}>
          § ACT II · YOUR FLAVOR
        </div>
        {userId
          ? <button onClick={handleVaultToggle} disabled={vaultLoading} style={{ fontFamily: CAV, fontSize: 18, color: vaulted ? C.rasp : C.ink, background: 'none', border: 'none', cursor: 'pointer', opacity: vaultLoading ? 0.5 : 1 }}>{vaulted ? 'Saved to Vault ♥' : 'Save to Vault ♥'}</button>
          : <span style={{ fontFamily: CAV, fontSize: 18, color: `${C.ink}55` }}>Save to Vault ♥</span>
        }
      </header>

      {/* ── 2. HERO ── */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 28px 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '60fr 40fr', gap: 40, alignItems: 'start' }}>
          <div>
            <div style={{ display: 'inline-block', border: `1px solid ${C.ink}`, padding: '3px 10px', fontFamily: FR, fontStyle: 'italic', fontSize: 10, letterSpacing: '0.14em', color: C.ink, textTransform: 'uppercase', marginBottom: 16 }}>
              Creation No. {shortId} · one-of-one
            </div>
            {editingName
              ? <input autoFocus defaultValue={displayName}
                  onBlur={e => { setCustomizations(prev => ({ ...prev, customFlavorName: e.target.value.trim() || null })); setEditingName(false) }}
                  onKeyDown={e => e.key === 'Enter' && e.currentTarget.blur()}
                  style={{ ...italic(80), background: 'transparent', border: 'none', borderBottom: `2px solid ${C.rasp}`, outline: 'none', width: '100%', display: 'block', marginBottom: 16, lineHeight: 0.9 }} />
              : <button onClick={() => setEditingName(true)} title="Click to rename" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'block', textAlign: 'left' }}>
                  <h1 style={{ ...italic('clamp(56px,7vw,96px)' as unknown as number, C.ink, 700), lineHeight: 0.9, margin: '0 0 16px' }}>
                    {displayName}<span style={{ fontSize: 20, color: `${C.ink}40`, marginLeft: 8 }}>✏</span>
                  </h1>
                </button>
            }
            <p style={{ ...italic(18, `${C.ink}CC`), marginBottom: 24, lineHeight: 1.4 }}>{renderBold(flavor.tagline)}</p>
            <div style={{ background: C.cream, border: `2px solid ${C.ink}`, boxShadow: `6px 6px 0 ${C.marigold}`, padding: '18px 20px', marginBottom: 20 }}>
              <div style={{ fontFamily: CAV, fontSize: 15, color: `${C.ink}99`, marginBottom: 8 }}>— why this, for you —</div>
              <p style={{ ...italic(15), lineHeight: 1.6, margin: 0 }}>{flavor.whyThisFlavor}</p>
            </div>
            <p style={{ fontSize: 14, color: `${C.ink}BB`, lineHeight: 1.7, margin: 0 }}>{renderBold(flavor.description)}</p>
            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button onClick={() => router.push('/')} style={{ fontSize: 13, color: `${C.ink}88`, background: 'none', border: `1px solid ${C.ink}44`, padding: '8px 16px', cursor: 'pointer' }}>Start Over</button>
              <button onClick={() => { setRemixOpen(o => !o); setRemixError(null) }} style={{ fontSize: 13, color: C.ink, background: 'none', border: `1px solid ${C.rasp}`, padding: '8px 16px', cursor: 'pointer', fontFamily: FR, fontStyle: 'italic' }}>
                {remixOpen ? 'Cancel' : '✦ Remix this flavor'}
              </button>
            </div>
            {remixOpen && (
              <div style={{ marginTop: 16, background: C.cream, border: `2px solid ${C.ink}`, padding: 20 }}>
                <p style={{ fontFamily: CAV, fontSize: 17, color: `${C.ink}88`, textAlign: 'center', marginBottom: 12 }}>How can we make this even better?</p>
                <textarea rows={2} value={remixPrompt} onChange={e => setRemixPrompt(e.target.value)}
                  placeholder="e.g. 'make it extra spicy' or 'swap in dark chocolate'"
                  style={{ width: '100%', background: C.parchment, border: `1px solid ${C.ink}66`, padding: '10px 14px', fontFamily: CAV, fontSize: 16, color: C.ink, resize: 'none', outline: 'none', boxSizing: 'border-box' }} />
                {remixError && <p style={{ color: C.rasp, fontSize: 12, marginTop: 4 }}>{remixError}</p>}
                <button onClick={handleRemix} disabled={remixLoading || !remixPrompt.trim()} style={{ marginTop: 10, width: '100%', background: C.ink, color: C.cream, border: 'none', padding: '12px 0', cursor: 'pointer', ...italic(15, C.cream), opacity: (remixLoading || !remixPrompt.trim()) ? 0.45 : 1 }}>
                  {remixLoading ? 'Generating…' : 'Remix this flavor ✦'}
                </button>
              </div>
            )}
          </div>

          {/* Flavor plate */}
          <div style={{ position: 'relative', paddingTop: 20 }}>
            <div style={{ background: C.cream, border: `2px solid ${C.ink}`, transform: 'rotate(2deg)', boxShadow: `12px 12px 0 ${C.ink}`, position: 'relative' }}>
              <div style={{ aspectRatio: '3/4', background: `radial-gradient(ellipse at 40% 35%, ${flavor.suggestedColor}EE 0%, ${flavor.suggestedColor}88 50%, ${flavor.suggestedColor}33 100%)` }} />
              <div style={{ position: 'absolute', top: -14, right: -14, width: 64, height: 64, background: C.marigold, clipPath: 'polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: CAV, fontSize: 9, color: C.ink, textAlign: 'center', lineHeight: 1.2, padding: 2 }}>just for<br />you!</span>
              </div>
            </div>
            <button onClick={handleShare} style={{ marginTop: 20, display: 'block', width: '100%', background: 'none', border: `1px solid ${C.ink}44`, padding: '8px 0', cursor: 'pointer', fontFamily: CAV, fontSize: 15, color: `${C.ink}88`, transform: 'rotate(2deg)' }}>
              {copied ? '✓ Copied link!' : '🔗 Share this creation'}
            </button>
          </div>
        </div>
      </section>

      {/* ── 3. CUSTOMIZE ── */}
      <section style={{ background: C.ink, color: C.cream, padding: '52px 28px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{ ...italic(42, C.cream, 700), margin: '0 0 4px' }}>Tweak it, if you must.</h2>
          <p style={{ fontFamily: CAV, fontSize: 20, color: `${C.cream}88`, marginBottom: 36 }}>— the architect is unbothered —</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
            <div>
              <p style={{ fontFamily: CAV, fontSize: 16, color: `${C.cream}77`, marginBottom: 10 }}>Base</p>
              <div style={{ display: 'flex', gap: 10, marginBottom: 28 }}>
                <button onClick={() => setCustomizations(p => ({ ...p, vegan: false }))} style={sqBtn(!customizations.vegan)}>Whole-milk</button>
                <button onClick={() => setCustomizations(p => ({ ...p, vegan: true }))}  style={sqBtn(customizations.vegan)}>Coconut (vegan)</button>
              </div>
              <p style={{ fontFamily: CAV, fontSize: 16, color: `${C.cream}77`, marginBottom: 10 }}>Mix-ins</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {flavor.mixIns.map(m => {
                  const on = customizations.enabledMixIns.includes(m.name)
                  return (
                    <button key={m.name} onClick={() => toggleMixIn(m.name)} style={{ padding: '12px 14px', cursor: 'pointer', textAlign: 'left', background: on ? `${C.marigold}22` : `${C.cream}08`, border: `2px solid ${on ? C.marigold : `${C.cream}22`}`, color: on ? C.cream : `${C.cream}55` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                        <span style={{ ...italic(13) }}>{m.name}</span>
                        <span style={{ color: on ? C.marigold : `${C.cream}33`, fontSize: 16 }}>{on ? '✓' : '○'}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
            <div>
              <p style={{ fontFamily: CAV, fontSize: 16, color: `${C.cream}77`, marginBottom: 10 }}>Label Dedication</p>
              <p style={{ fontSize: 12, color: `${C.cream}55`, marginBottom: 12, lineHeight: 1.5 }}>A personal note printed on your label. Optional.</p>
              <textarea rows={6} placeholder={`"Made for Mom's birthday — her favourite was always mint."`}
                value={customizations.personalNote ?? ''}
                onChange={e => setCustomizations(p => ({ ...p, personalNote: e.target.value || null }))}
                style={{ width: '100%', background: C.cream, border: `2px solid ${C.ink}`, padding: '14px 16px', fontFamily: CAV, fontSize: 18, color: C.ink, resize: 'none', outline: 'none', boxSizing: 'border-box', lineHeight: 1.5 }} />
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. ALLERGEN BAR ── */}
      {flavor.allergenFlags.length > 0 && (
        <section style={{ background: C.cherry, padding: '24px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
            <span style={{ fontSize: 20 }}>⚠</span>
            <p style={{ ...italic(18, C.cream), margin: 0 }}>{flavor.allergenFlags.map(f => f.toUpperCase()).join(' · ')}</p>
          </div>
          <button onClick={handleCheckout} disabled={loading} style={{ background: C.marigold, color: C.ink, border: `2px solid ${C.ink}`, boxShadow: `4px 4px 0 ${C.ink}`, padding: '10px 24px', cursor: 'pointer', ...italic(16, C.ink, 700), transform: 'rotate(-1deg)', opacity: loading ? 0.6 : 1, whiteSpace: 'nowrap' }}>
            To checkout →
          </button>
        </section>
      )}
      {flavor.allergenFlags.length > 0 && (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '16px 28px 0' }}>
          <AllergenBadges flags={flavor.allergenFlags} />
        </div>
      )}

      {/* ── 5. QUANTITY + PRICING ── */}
      <section style={{ background: C.parchment, maxWidth: 1100, margin: '0 auto', padding: '48px 28px 64px' }}>
        <h2 style={{ ...italic(36, C.ink, 700), marginBottom: 28 }}>How many quarts?</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 6 }}>
          <button onClick={() => setQuantityQuarts(q => Math.max(MIN_QUARTS, q - QUART_INCREMENT))} disabled={quantityQuarts <= MIN_QUARTS}
            style={{ width: 48, height: 48, border: `2px solid ${C.ink}`, background: 'transparent', color: C.ink, fontSize: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: quantityQuarts <= MIN_QUARTS ? 0.3 : 1 }}>−</button>
          <div style={{ textAlign: 'center', minWidth: 80 }}>
            <div style={{ ...italic(48, C.ink), lineHeight: 1 }}>{quantityQuarts}</div>
            <div style={{ fontSize: 12, color: `${C.ink}77`, marginTop: 2 }}>qt · {batchCount} batch{batchCount > 1 ? 'es' : ''}</div>
          </div>
          <button onClick={() => setQuantityQuarts(q => q + QUART_INCREMENT)}
            style={{ width: 48, height: 48, border: `2px solid ${C.ink}`, background: 'transparent', color: C.ink, fontSize: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
        </div>
        <p style={{ fontSize: 11, color: `${C.ink}66`, marginBottom: 28 }}>Orders come in multiples of 2 quarts (1 batch = 2 quarts)</p>
        <div style={{ background: C.cream, border: `2px solid ${C.ink}`, padding: '18px 24px', marginBottom: 20, maxWidth: 480, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 14, color: `${C.ink}99` }}>{quantityQuarts} qt × $19.99</span>
          <span style={{ ...italic(32) }}>${(totalCents / 100).toFixed(2)}</span>
        </div>
        <p style={{ fontSize: 13, color: `${C.ink}88`, marginBottom: 20 }}>Estimated ship date: <strong>{shipDate}</strong></p>
        {error && (
          <div style={{ background: `${C.cherry}22`, border: `1px solid ${C.cherry}`, padding: '10px 16px', marginBottom: 16, color: C.cherry, fontSize: 13, maxWidth: 480 }}>{error}</div>
        )}
        <button onClick={handleCheckout} disabled={loading} style={{ background: C.rasp, color: C.cream, border: `2px solid ${C.ink}`, boxShadow: `6px 6px 0 ${C.ink}`, padding: '18px 40px', cursor: 'pointer', ...italic(20, C.cream, 700), opacity: loading ? 0.6 : 1, display: 'block', maxWidth: 480 }}>
          {loading ? 'Preparing your order…' : `Order ${quantityQuarts} quarts — $${(totalCents / 100).toFixed(2)}`}
        </button>
        <p style={{ fontSize: 11, color: `${C.ink}55`, marginTop: 16 }}>Secure payment via Stripe · Ships on the next qualifying Monday</p>
      </section>

    </div>
  )
}
