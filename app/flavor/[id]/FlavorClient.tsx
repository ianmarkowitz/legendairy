'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { FlavorCreation, FlavorCustomizations } from '@/types/flavor'
import { PRICE_PER_QUART_CENTS, MIN_QUARTS, QUART_INCREMENT } from '@/lib/constants'
import { calculateShipDate, formatShipDate } from '@/lib/utils'
import AllergenBadges from '@/components/AllergenBadges'
import {
  AC, ScoopDoodle, Starburst, WaxSeal,
  Stamp, paperGrain, acSmall,
} from '@/components/ac-primitives'

interface Props { flavor: FlavorCreation; userId?: string | null; autoVault?: boolean }

function renderBold(text: string) {
  return text.split(/\*\*(.+?)\*\*/).map((p, i) => i % 2 === 1 ? <strong key={i}>{p}</strong> : p)
}

const FF = { serif: 'var(--font-fraunces)', hand: 'var(--font-caveat)' }

const ital = (sz: React.CSSProperties['fontSize'], col = AC.ink, wt = 400): React.CSSProperties => ({
  fontFamily: FF.serif, fontStyle: 'italic', fontSize: sz, color: col, fontWeight: wt,
})
const mixBtn = (active: boolean): React.CSSProperties => ({
  padding: '12px 16px', cursor: 'pointer', textAlign: 'left',
  background: active ? `${AC.marigold}20` : `${AC.cream}08`,
  border: `2px solid ${active ? AC.marigold : `${AC.cream}25`}`,
  color: active ? AC.cream : `${AC.cream}55`,
  ...ital(13, active ? AC.cream : `${AC.cream}55`),
})

export default function FlavorClient({ flavor, userId, autoVault }: Props) {
  const router = useRouter()
  const [customizations, setCustomizations] = useState<FlavorCustomizations>({
    enabledMixIns: flavor.mixIns.map(m => m.name),
    sweetnessLevel: flavor.sweetnessLevel, customFlavorName: null, personalNote: null,
  })
  const [quantityQuarts, setQuantityQuarts] = useState(MIN_QUARTS)
  const [editingName, setEditingName]       = useState(false)
  const [loading, setLoading]               = useState(false)
  const [error, setError]                   = useState<string | null>(null)
  const [vaulted, setVaulted]               = useState(false)
  const [vaultLoading, setVaultLoading]     = useState(false)
  const [copied, setCopied]                 = useState(false)
  const [remixOpen, setRemixOpen]           = useState(false)
  const [remixPrompt, setRemixPrompt]       = useState('')
  const [remixLoading, setRemixLoading]     = useState(false)
  const [remixError, setRemixError]         = useState<string | null>(null)
  const [remixProgress, setRemixProgress]   = useState(0)

  // Auto-vault after returning from login with ?vault=1
  useEffect(() => {
    if (autoVault && userId && !vaulted) {
      handleVaultToggle()
      router.replace(`/flavor/${flavor.id}`, { scroll: false })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!remixLoading) { setRemixProgress(0); return }
    const start = Date.now()
    const id = setInterval(() => {
      const secs = (Date.now() - start) / 1000
      setRemixProgress(Math.min(85 * (1 - Math.exp(-secs / 5)), 85))
    }, 200)
    return () => clearInterval(id)
  }, [remixLoading])

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
    <div style={{ minHeight: '100vh', background: AC.parchment, ...paperGrain }}>

      {/* ── HEADER ── */}
      <header style={{ background: AC.parchment, borderBottom: `2px solid ${AC.ink}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 28px', ...paperGrain }}>
        <span style={{ ...ital(28, AC.ink, 700) }}>Legendairy</span>
        <Stamp color={AC.rasp} rotate={-1.5} style={{ fontSize: 11 }}>§ Act II · Your Flavor</Stamp>
        {userId
          ? <button onClick={handleVaultToggle} disabled={vaultLoading} style={{ fontFamily: FF.hand, fontSize: 18, color: vaulted ? AC.rasp : AC.ink, background: 'none', border: 'none', cursor: 'pointer', opacity: vaultLoading ? 0.5 : 1 }}>{vaulted ? '♥ Saved' : '♡ Save to Vault'}</button>
          : <button onClick={() => router.push(`/login?next=${encodeURIComponent('/flavor/' + flavor.id + '?vault=1')}`)} style={{ fontFamily: FF.hand, fontSize: 18, color: `${AC.ink}77`, background: 'none', border: 'none', cursor: 'pointer' }}>♡ Save to Vault</button>
        }
      </header>

      {/* ── HERO ── */}
      <section style={{ maxWidth: 1140, margin: '0 auto', padding: 'clamp(40px, 6vw, 72px) 28px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '60fr 40fr', gap: 48, alignItems: 'start' }}>

          {/* Left col */}
          <div>
            <div style={{ marginBottom: 20 }}>
              <Stamp color={AC.ink} rotate={-1} style={{ fontSize: 10, opacity: 0.55 }}>Creation No. {shortId} · one-of-one</Stamp>
            </div>

            {editingName
              ? <input autoFocus defaultValue={displayName}
                  onBlur={e => { setCustomizations(prev => ({ ...prev, customFlavorName: e.target.value.trim() || null })); setEditingName(false) }}
                  onKeyDown={e => e.key === 'Enter' && e.currentTarget.blur()}
                  style={{ ...ital('clamp(52px,7vw,88px)', AC.ink, 700), background: 'transparent', border: 'none', borderBottom: `2px solid ${AC.rasp}`, outline: 'none', width: '100%', display: 'block', marginBottom: 16, lineHeight: 0.92 }} />
              : <button onClick={() => setEditingName(true)} title="Click to rename" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'block', textAlign: 'left', width: '100%' }}>
                  <h1 style={{ ...ital('clamp(52px,7vw,88px)', AC.ink, 700), lineHeight: 0.92, margin: '0 0 16px' }}>
                    {displayName}<span style={{ fontSize: 20, color: `${AC.ink}38`, marginLeft: 10 }}>✏</span>
                  </h1>
                </button>
            }

            <p style={{ ...ital(20, AC.rasp), marginBottom: 28, lineHeight: 1.4 }}>{renderBold(flavor.tagline)}</p>

            <div style={{ background: AC.cream, border: `2px solid ${AC.ink}`, boxShadow: `6px 6px 0 ${AC.marigold}`, padding: '20px 22px', marginBottom: 22, ...paperGrain }}>
              <div style={{ fontFamily: FF.hand, fontSize: 16, color: `${AC.ink}88`, marginBottom: 10 }}>— why this, for you —</div>
              <p style={{ ...ital(15), lineHeight: 1.65, margin: 0 }}>{flavor.whyThisFlavor}</p>
            </div>

            <p style={{ fontFamily: FF.serif, fontSize: 15, color: `${AC.ink}CC`, lineHeight: 1.7, margin: '0 0 28px' }}>{renderBold(flavor.description)}</p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button onClick={() => router.push('/')} style={{ fontFamily: FF.serif, fontStyle: 'italic', fontSize: 14, color: `${AC.ink}77`, background: 'none', border: `1.5px solid ${AC.ink}40`, padding: '8px 18px', cursor: 'pointer', borderRadius: 4 }}>
                Start Over
              </button>
              <button onClick={() => { setRemixOpen(o => !o); setRemixError(null) }} style={{ fontFamily: FF.serif, fontStyle: 'italic', fontSize: 14, color: AC.ink, background: 'none', border: `1.5px solid ${AC.rasp}`, padding: '8px 18px', cursor: 'pointer', borderRadius: 4 }}>
                {remixOpen ? 'Cancel' : '✦ Remix this flavor'}
              </button>
            </div>

            {remixOpen && (
              <div style={{ marginTop: 18, background: AC.parchment, border: `2px solid ${AC.ink}`, padding: '22px 22px 18px', boxShadow: `4px 4px 0 ${AC.ink}`, ...paperGrain }}>
                {remixLoading ? (
                  <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
                    <ScoopDoodle size={56} fill={AC.rasp} color={AC.ink} />
                    <p style={{ fontFamily: FF.hand, fontSize: 22, color: AC.ink, margin: '14px 0 22px', lineHeight: 1.2 }}>
                      Conjuring your remix…
                    </p>
                    <div style={{ background: `${AC.ink}18`, borderRadius: 6, height: 10, overflow: 'hidden', marginBottom: 10 }}>
                      <div style={{ width: `${remixProgress}%`, height: '100%', background: `linear-gradient(90deg, ${AC.rasp}, ${AC.marigold})`, borderRadius: 6, transition: 'width 0.3s ease-out' }} />
                    </div>
                    <p style={{ fontFamily: FF.hand, fontSize: 13, color: `${AC.ink}55`, marginTop: 8 }}>
                      ~ 14 seconds · crafting something extraordinary
                    </p>
                  </div>
                ) : (
                  <>
                    <p style={{ fontFamily: FF.hand, fontSize: 18, color: `${AC.ink}88`, marginBottom: 14 }}>How can we make this even better?</p>
                    <textarea rows={2} value={remixPrompt} onChange={e => setRemixPrompt(e.target.value)}
                      placeholder="e.g. 'make it extra spicy' or 'swap in dark chocolate'"
                      style={{ width: '100%', background: AC.cream, border: `1.5px solid ${AC.ink}66`, padding: '10px 14px', fontFamily: FF.hand, fontSize: 16, color: AC.ink, resize: 'none', outline: 'none', boxSizing: 'border-box', lineHeight: 1.5 }} />
                    {remixError && <p style={{ color: AC.rasp, fontFamily: FF.hand, fontSize: 13, marginTop: 6 }}>{remixError}</p>}
                    <button onClick={handleRemix} disabled={!remixPrompt.trim()}
                      style={{ marginTop: 12, width: '100%', background: AC.ink, color: AC.cream, border: 'none', padding: '13px 0', cursor: !remixPrompt.trim() ? 'default' : 'pointer', ...ital(15, AC.cream), opacity: !remixPrompt.trim() ? 0.45 : 1 }}>
                      Remix this flavor ✦
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Right col — flavor plate */}
          <div style={{ position: 'relative', paddingTop: 24 }}>
            <div style={{ position: 'relative' }}>
              <div style={{ background: AC.cream, border: `2px solid ${AC.ink}`, transform: 'rotate(2.5deg)', boxShadow: `12px 12px 0 ${AC.ink}`, overflow: 'hidden', borderRadius: 4 }}>
                <div style={{ aspectRatio: '3/4', background: `radial-gradient(ellipse at 40% 35%, ${flavor.suggestedColor}EE 0%, ${flavor.suggestedColor}88 50%, ${flavor.suggestedColor}33 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ScoopDoodle size={100} fill={`${AC.parchment}35`} color={`${AC.parchment}75`} />
                </div>
                <div style={{ padding: '14px 18px', background: AC.cream }}>
                  <p style={{ ...acSmall, color: AC.ink, margin: 0, opacity: 0.65 }}>ONE · OF · ONE</p>
                </div>
              </div>
              <div style={{ position: 'absolute', top: -16, right: -20, zIndex: 2 }}>
                <Starburst size={76} fill={AC.marigold} stroke={AC.ink} rotate={10}>
                  <span style={{ fontFamily: FF.hand, fontSize: 11, color: AC.ink, fontWeight: 700, lineHeight: 1.2, textAlign: 'center' }}>just<br />for you!</span>
                </Starburst>
              </div>
              <div style={{ position: 'absolute', bottom: 52, left: -20, zIndex: 2 }}>
                <WaxSeal size={58} color={AC.rasp} rotate={-10}>
                  <span style={{ ...acSmall, fontSize: 8, color: AC.cream }}>AC<br />✦</span>
                </WaxSeal>
              </div>
            </div>
            <button onClick={handleShare} style={{ marginTop: 24, display: 'block', width: '100%', background: 'none', border: `1.5px solid ${AC.ink}44`, padding: '10px 0', cursor: 'pointer', fontFamily: FF.hand, fontSize: 16, color: `${AC.ink}77`, transform: 'rotate(1.5deg)', borderRadius: 4 }}>
              {copied ? '✓ Copied link!' : '🔗 Share this creation'}
            </button>
          </div>

        </div>
      </section>

      {/* ── CUSTOMIZE ── */}
      <section style={{ background: AC.ink, color: AC.cream, padding: 'clamp(48px, 6vw, 80px) 28px' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>
          <h2 style={{ ...ital(48, AC.cream, 700), margin: '0 0 4px', lineHeight: 1 }}>Tweak it, if you must.</h2>
          <p style={{ fontFamily: FF.hand, fontSize: 21, color: `${AC.cream}80`, marginBottom: 44 }}>— the architect is unbothered —</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48 }}>

            {/* Mix-ins */}
            <div>
              <p style={{ fontFamily: FF.hand, fontSize: 17, color: `${AC.cream}70`, marginBottom: 12 }}>Mix-ins</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {flavor.mixIns.map(m => {
                  const on = customizations.enabledMixIns.includes(m.name)
                  return (
                    <button key={m.name} onClick={() => toggleMixIn(m.name)} style={mixBtn(on)}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                        <span>{m.name}</span>
                        <span style={{ color: on ? AC.marigold : `${AC.cream}33`, fontSize: 16 }}>{on ? '✓' : '○'}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Label dedication */}
            <div>
              <p style={{ fontFamily: FF.hand, fontSize: 17, color: `${AC.cream}70`, marginBottom: 8 }}>Label Dedication</p>
              <p style={{ fontFamily: FF.serif, fontSize: 13, color: `${AC.cream}50`, marginBottom: 18, lineHeight: 1.55 }}>A personal note printed on your label. Optional.</p>
              <textarea rows={7}
                placeholder={`"Made for Mom's birthday — her favourite was always mint."`}
                value={customizations.personalNote ?? ''}
                onChange={e => setCustomizations(p => ({ ...p, personalNote: e.target.value || null }))}
                style={{ width: '100%', background: AC.cream, border: `2px solid ${AC.ink}`, padding: '16px 18px', fontFamily: FF.hand, fontSize: 18, color: AC.ink, resize: 'none', outline: 'none', boxSizing: 'border-box', lineHeight: 1.55 }} />
            </div>

          </div>
        </div>
      </section>

      {/* ── ALLERGEN BAR ── */}
      {flavor.allergenFlags.length > 0 && (
        <section style={{ background: AC.cherry, padding: '22px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
            <span style={{ fontSize: 20 }}>⚠</span>
            <p style={{ ...ital(17, AC.cream), margin: 0 }}>{flavor.allergenFlags.map(f => f.toUpperCase()).join(' · ')}</p>
          </div>
          <button onClick={handleCheckout} disabled={loading}
            style={{ background: AC.marigold, color: AC.ink, border: `2px solid ${AC.ink}`, boxShadow: `4px 4px 0 ${AC.ink}`, padding: '10px 26px', cursor: 'pointer', ...ital(15, AC.ink, 700), transform: 'rotate(-1deg)', opacity: loading ? 0.6 : 1, whiteSpace: 'nowrap' }}>
            To checkout →
          </button>
        </section>
      )}
      {flavor.allergenFlags.length > 0 && (
        <div style={{ maxWidth: 1140, margin: '0 auto', padding: '18px 28px 0' }}>
          <AllergenBadges flags={flavor.allergenFlags} />
        </div>
      )}

      {/* ── QUANTITY + PRICING ── */}
      <section style={{ maxWidth: 1140, margin: '0 auto', padding: 'clamp(48px, 6vw, 80px) 28px', ...paperGrain }}>
        <h2 style={{ ...ital(40, AC.ink, 700), marginBottom: 32 }}>How many quarts?</h2>

        {/* Stepper */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 28, marginBottom: 8 }}>
          <button onClick={() => setQuantityQuarts(q => Math.max(MIN_QUARTS, q - QUART_INCREMENT))} disabled={quantityQuarts <= MIN_QUARTS}
            style={{ width: 52, height: 52, border: `2px solid ${AC.ink}`, background: 'transparent', color: AC.ink, fontSize: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: quantityQuarts <= MIN_QUARTS ? 0.28 : 1, borderRadius: 4, fontWeight: 300 }}>−</button>
          <div style={{ textAlign: 'center', minWidth: 80 }}>
            <div style={{ ...ital(52, AC.ink), lineHeight: 1 }}>{quantityQuarts}</div>
            <div style={{ fontFamily: FF.hand, fontSize: 13, color: `${AC.ink}70`, marginTop: 4 }}>qt · {batchCount} batch{batchCount > 1 ? 'es' : ''}</div>
          </div>
          <button onClick={() => setQuantityQuarts(q => q + QUART_INCREMENT)}
            style={{ width: 52, height: 52, border: `2px solid ${AC.ink}`, background: 'transparent', color: AC.ink, fontSize: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4, fontWeight: 300 }}>+</button>
        </div>
        <p style={{ fontFamily: FF.serif, fontSize: 12, color: `${AC.ink}55`, marginBottom: 36 }}>Orders come in multiples of 2 quarts (1 batch = 2 quarts)</p>

        {/* Price box */}
        <div style={{ background: AC.cream, border: `2px solid ${AC.ink}`, padding: '20px 26px', marginBottom: 20, maxWidth: 480, display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: `5px 5px 0 ${AC.marigold}` }}>
          <span style={{ fontFamily: FF.serif, fontSize: 15, color: `${AC.ink}88` }}>{quantityQuarts} qt × $19.99</span>
          <span style={{ ...ital(36, AC.ink) }}>${(totalCents / 100).toFixed(2)}</span>
        </div>

        <p style={{ fontFamily: FF.serif, fontSize: 14, color: `${AC.ink}88`, marginBottom: 22 }}>Estimated ship date: <strong>{shipDate}</strong></p>

        {error && (
          <div style={{ background: `${AC.cherry}22`, border: `1.5px solid ${AC.cherry}`, padding: '12px 18px', marginBottom: 18, color: AC.cherry, fontFamily: FF.serif, fontSize: 14, maxWidth: 480, borderRadius: 4 }}>{error}</div>
        )}

        {/* Order button */}
        <button onClick={handleCheckout} disabled={loading}
          style={{ background: AC.rasp, color: AC.cream, border: `2px solid ${AC.ink}`, boxShadow: `6px 6px 0 ${AC.ink}`, padding: '18px 44px', cursor: loading ? 'default' : 'pointer', ...ital(20, AC.cream, 700), opacity: loading ? 0.6 : 1, display: 'block', maxWidth: 480, width: '100%', textAlign: 'center', borderRadius: 4 }}>
          {loading ? 'Preparing your order…' : `Order ${quantityQuarts} quarts — $${(totalCents / 100).toFixed(2)}`}
        </button>
        <p style={{ fontFamily: FF.serif, fontSize: 12, color: `${AC.ink}50`, marginTop: 18 }}>Secure payment via Stripe · Ships on the next qualifying Monday</p>
      </section>


    </div>
  )
}
