'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

const C = { parchment: '#F1E1BC', cream: '#FBF3D9', ink: '#2A1810', rasp: '#C83A4E', pist: '#6B8E3D', marigold: '#E8A628', cherry: '#8A1F2B' }
const FF = { fraunces: 'var(--font-fraunces)', caveat: 'var(--font-caveat)' }

const EXAMPLE_CHIPS = [
  'Apple pie filling folded into ice cream',
  'A bonfire on a beach',
  'Miso caramel, black sesame, a whisper of heat',
  "Grandma's snickerdoodles",
  'Tropical chaos — max crunch',
]

function ScoopDoodle({ size = 80, fill = C.parchment, color = C.ink }: { size?: number; fill?: string; color?: string }) {
  return (
    <svg viewBox="0 0 100 120" width={size} height={size * 1.2}>
      <path d="M50 10 C 28 10, 18 30, 22 45 C 12 44, 8 58, 18 62 C 14 72, 28 78, 36 72 C 40 80, 56 82, 62 74 C 72 78, 84 70, 80 58 C 90 54, 88 38, 78 36 C 80 20, 66 8, 50 10 Z" fill={fill} stroke={color} strokeWidth="2" strokeLinejoin="round" />
      <path d="M28 66 L 72 66 L 56 112 L 44 112 Z" fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
      <line x1="34" y1="78" x2="64" y2="78" stroke={color} strokeWidth="1.3" />
      <line x1="36" y1="88" x2="62" y2="88" stroke={color} strokeWidth="1.3" />
    </svg>
  )
}

function Starburst({ label, size = 64, bg = C.rasp, fg = C.cream }: { label: string; size?: number; bg?: string; fg?: string }) {
  const pts = Array.from({ length: 16 }, (_, i) => {
    const a = (i * Math.PI) / 8
    const r = i % 2 === 0 ? size / 2 : size / 2 - 10
    return `${50 + r * Math.cos(a - Math.PI / 2)},${50 + r * Math.sin(a - Math.PI / 2)}`
  }).join(' ')
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} style={{ flexShrink: 0 }}>
      <polygon points={pts} fill={bg} />
      <text x="50" y="56" textAnchor="middle" fontSize="22" fontWeight="bold" fill={fg} fontFamily={FF.fraunces}>{label}</text>
    </svg>
  )
}

function LoadingState() {
  return (
    <div style={{ minHeight: '100vh', background: C.rasp, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 32, padding: '0 24px' }}>
      <ScoopDoodle size={110} fill={C.cream} color={C.ink} />
      <h2 style={{ fontFamily: FF.fraunces, fontStyle: 'italic', fontSize: 'clamp(2rem, 6vw, 3.5rem)', color: C.cream, margin: 0, textAlign: 'center' }}>
        Churning something extraordinary.
      </h2>
      <div style={{ display: 'flex', gap: 10 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: C.cream, opacity: 0.7, animation: `bounceDot 1.2s ease-in-out ${i * 0.2}s infinite` }} />
        ))}
      </div>
    </div>
  )
}

export default function DreamInput() {
  const router = useRouter()
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!prompt.trim() || loading) return
    setLoading(true)
    setError(null)
    let sessionId = sessionStorage.getItem('ld_session_id')
    if (!sessionId) { sessionId = crypto.randomUUID(); sessionStorage.setItem('ld_session_id', sessionId) }
    try {
      const res = await fetch('/api/generate-flavor', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: prompt.trim(), sessionId }) })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Something went wrong.'); setLoading(false); return }
      router.push(`/flavor/${data.id}`)
    } catch { setError('A network error occurred.'); setLoading(false) }
  }

  function useChip(text: string) { setPrompt(text); textareaRef.current?.focus() }

  if (loading) return <LoadingState />

  return (
    <div style={{ background: C.cream, color: C.ink, fontFamily: FF.fraunces }}>

      {/* ── HERO ── */}
      <section style={{ minHeight: '100vh', padding: 'clamp(48px, 8vw, 96px) clamp(24px, 6vw, 80px)', display: 'flex', alignItems: 'flex-start', gap: 48, flexWrap: 'wrap', position: 'relative' }}>
        <div style={{ flex: '1 1 520px', maxWidth: 720 }}>
          <p style={{ fontFamily: FF.caveat, fontSize: 18, color: C.rasp, marginBottom: 16, letterSpacing: '0.05em' }}>Atelier Carnival · Artisan Ice Cream</p>
          <h1 style={{ fontFamily: FF.fraunces, fontStyle: 'italic', fontSize: 'clamp(52px, 8vw, 100px)', lineHeight: 1.05, margin: '0 0 40px', color: C.ink }}>
            A flavor, conjured<br />just for you.
          </h1>

          {/* Letter form */}
          <form onSubmit={handleSubmit} style={{ background: C.parchment, border: `2px solid ${C.ink}`, borderRadius: 8, padding: '32px 32px 24px', boxShadow: `6px 6px 0 ${C.ink}` }}>
            <label style={{ fontFamily: FF.caveat, fontSize: 22, display: 'block', marginBottom: 12, color: C.ink }}>Dear flavor architect —</label>
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              rows={5}
              disabled={loading}
              placeholder="I'm dreaming of something that tastes like…"
              style={{ fontFamily: FF.caveat, fontSize: 20, width: '100%', boxSizing: 'border-box', background: 'transparent', border: 'none', borderBottom: `1.5px solid ${C.ink}`, outline: 'none', resize: 'none', color: C.ink, lineHeight: 1.7, paddingBottom: 8 }}
            />
            <button
              type="submit"
              disabled={!prompt.trim() || loading}
              style={{ marginTop: 20, background: C.rasp, color: C.cream, fontFamily: FF.fraunces, fontWeight: 700, fontSize: 15, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '14px 36px', border: `2px solid ${C.ink}`, borderRadius: 4, boxShadow: `4px 4px 0 ${C.ink}`, cursor: 'pointer', opacity: !prompt.trim() ? 0.5 : 1 }}
            >
              Conjure This Flavor →
            </button>
          </form>

          {/* Chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 20 }}>
            {EXAMPLE_CHIPS.map((chip, i) => (
              <button key={i} type="button" onClick={() => useChip(chip)}
                style={{ fontFamily: FF.caveat, fontSize: 15, background: 'transparent', border: `1.5px solid ${C.ink}`, borderRadius: 20, padding: '5px 14px', cursor: 'pointer', color: C.ink, transform: `rotate(${[-1.5, 1, -0.8, 1.5, -1][i % 5]}deg)`, transition: 'background 0.15s' }}>
                {chip}
              </button>
            ))}
          </div>
          {error && <p style={{ color: C.rasp, fontFamily: FF.caveat, fontSize: 16, marginTop: 12 }}>{error}</p>}
          <p style={{ fontFamily: FF.caveat, fontSize: 17, color: C.ink, opacity: 0.6, marginTop: 16 }}>~ 14s · no account needed</p>
        </div>

        {/* Wax seal badge */}
        <div style={{ position: 'relative', width: 160, height: 160, flexShrink: 0, marginTop: 80 }}>
          <svg viewBox="0 0 160 160" width={160} height={160}>
            <circle cx="80" cy="80" r="72" fill={C.rasp} />
            <circle cx="80" cy="80" r="64" fill="none" stroke={C.parchment} strokeWidth="1.5" strokeDasharray="4 3" />
            <text x="80" y="68" textAnchor="middle" fontSize="11" fill={C.parchment} fontFamily={FF.fraunces} letterSpacing="3">ATELIER</text>
            <text x="80" y="88" textAnchor="middle" fontSize="11" fill={C.parchment} fontFamily={FF.fraunces} letterSpacing="3">CARNIVAL</text>
            <text x="80" y="108" textAnchor="middle" fontSize="9" fill={C.parchment} fontFamily={FF.caveat} opacity="0.8">est. MMXXIV</text>
          </svg>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ background: C.parchment, padding: 'clamp(48px, 7vw, 88px) clamp(24px, 6vw, 80px)' }}>
        <h2 style={{ fontFamily: FF.fraunces, fontStyle: 'italic', fontSize: 'clamp(36px, 5vw, 60px)', marginBottom: 48, color: C.ink }}>Three acts, one pint.</h2>
        <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
          {[
            { num: 'I', act: 'You describe', desc: 'A feeling, a memory, a craving. Anything goes — the more vivid, the better.' },
            { num: 'II', act: 'We architect', desc: 'Our flavor engine translates your vision into a precise artisan recipe.' },
            { num: 'III', act: 'We churn', desc: 'Small-batch, hand-packed, labeled with your story. Shipped cold to your door.' },
          ].map(({ num, act, desc }, i) => (
            <div key={i} style={{ flex: '1 1 220px', background: C.cream, border: `2px solid ${C.ink}`, borderRadius: 6, padding: '32px 24px 24px', position: 'relative', transform: `rotate(${[-1.2, 0.8, -0.6][i]}deg)`, boxShadow: `4px 4px 0 ${C.ink}` }}>
              <div style={{ position: 'absolute', top: -20, right: 16 }}><Starburst label={num} size={52} bg={C.marigold} fg={C.ink} /></div>
              <p style={{ fontFamily: FF.caveat, fontSize: 13, color: C.rasp, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>Act {num}</p>
              <h3 style={{ fontFamily: FF.fraunces, fontSize: 28, fontStyle: 'italic', margin: '0 0 12px', color: C.ink }}>{act}</h3>
              <p style={{ fontFamily: FF.fraunces, fontSize: 15, lineHeight: 1.6, color: C.ink, opacity: 0.75, margin: 0 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── GIFTED CONJURINGS ── */}
      <section style={{ background: C.ink, padding: 'clamp(48px, 7vw, 88px) clamp(24px, 6vw, 80px)' }}>
        <h2 style={{ fontFamily: FF.fraunces, fontStyle: 'italic', fontSize: 'clamp(36px, 5vw, 60px)', color: C.parchment, marginBottom: 48 }}>Gifted conjurings.</h2>
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { bg: ['#E2A24A', '#C83A4E'], tag: 'For Mara', from: 'Sam', title: 'Bonfire on the Boardwalk', story: 'Smoked caramel, toasted marshmallow, a ghost of sea salt — the night we stayed until the fire went out.', occasion: '30th Birthday' },
            { bg: ['#6B3A78', '#2A1810'], tag: 'For Theo', from: 'Noah', title: 'Midnight in Kyoto', story: 'Black sesame, yuzu blossom, matcha ribbon — every alley we wandered that first night together.', occasion: 'First Anniversary' },
            { bg: ['#8A1F2B', '#E2A24A'], tag: 'For the in-laws', from: 'Priya', title: 'Orchard Heist', story: 'Brown butter apple, cinnamon crack, caramel drizzle — a Thanksgiving that earned us seconds.', occasion: 'Thanksgiving' },
          ].map(({ bg, tag, from, title, story, occasion }, i) => (
            <div key={i} style={{ flex: '1 1 240px', maxWidth: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
              {/* Gift tag */}
              <div style={{ background: C.parchment, border: `1.5px solid ${C.ink}`, borderRadius: '4px 4px 0 0', padding: '6px 20px', fontFamily: FF.caveat, fontSize: 15, color: C.ink, position: 'relative' }}>
                {tag} <span style={{ opacity: 0.6 }}>· from {from}</span>
                <div style={{ position: 'absolute', top: '50%', right: -18, transform: 'translateY(-50%)', width: 8, height: 8, borderRadius: '50%', background: C.ink, border: `1.5px solid ${C.ink}` }} />
              </div>
              {/* Pint */}
              <div style={{ width: '100%', height: 200, borderRadius: 8, background: `linear-gradient(160deg, ${bg[0]}, ${bg[1]})`, border: `2px solid ${C.parchment}40`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ScoopDoodle size={72} fill={`${C.parchment}30`} color={`${C.parchment}80`} />
              </div>
              {/* Story card */}
              <div style={{ background: C.cream, border: `2px solid ${C.ink}`, borderTop: 'none', borderRadius: '0 0 6px 6px', padding: '16px 18px', width: '100%', boxSizing: 'border-box' }}>
                <p style={{ fontFamily: FF.caveat, fontSize: 13, color: C.rasp, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 4px' }}>{occasion}</p>
                <h4 style={{ fontFamily: FF.fraunces, fontStyle: 'italic', fontSize: 18, margin: '0 0 8px', color: C.ink }}>{title}</h4>
                <p style={{ fontFamily: FF.fraunces, fontSize: 13, lineHeight: 1.6, color: C.ink, opacity: 0.7, margin: 0 }}>{story}</p>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginTop: 48, flexWrap: 'wrap' }}>
          {['dedication', 'custom label', 'story card', 'dry-ice'].map(s => (
            <span key={s} style={{ fontFamily: FF.caveat, fontSize: 16, color: C.parchment, opacity: 0.7, border: `1px solid ${C.parchment}40`, borderRadius: 4, padding: '4px 14px' }}>✦ {s}</span>
          ))}
        </div>
      </section>

      {/* ── PRICING ── */}
      <section style={{ background: C.parchment, padding: 'clamp(48px, 7vw, 88px) clamp(24px, 6vw, 80px)', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32, flexWrap: 'wrap' }}>
          <div>
            <p style={{ fontFamily: FF.fraunces, fontStyle: 'italic', fontSize: 'clamp(72px, 14vw, 120px)', color: C.ink, margin: 0, lineHeight: 1 }}>$19.99</p>
            <p style={{ fontFamily: FF.caveat, fontSize: 20, color: C.ink, opacity: 0.6, margin: '8px 0 32px' }}>per quart · two-quart minimum</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 20, flexWrap: 'wrap' }}>
              {['One-of-one recipe', 'Custom printed label', 'Handwritten story card', 'Ships cold, arrives intact'].map(item => (
                <span key={item} style={{ fontFamily: FF.fraunces, fontSize: 14, color: C.ink, border: `2px solid ${C.ink}`, borderRadius: 4, padding: '6px 16px', display: 'inline-block' }}>✦ {item}</span>
              ))}
            </div>
          </div>
          <div style={{ flexShrink: 0 }}>
            <Starburst label="no charge for big ideas!" size={120} bg={C.rasp} fg={C.cream} />
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ background: C.rasp, padding: 'clamp(48px, 7vw, 88px) clamp(24px, 6vw, 80px)' }}>
        <h2 style={{ fontFamily: FF.fraunces, fontStyle: 'italic', fontSize: 'clamp(36px, 5vw, 56px)', color: C.cream, marginBottom: 48 }}>Gentle questions.</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
          {[
            { n: '01', q: 'Is every flavor really one-of-one?', a: 'Yes. Each recipe is generated specifically for your prompt and never reused.' },
            { n: '02', q: 'How does pricing work?', a: '$19.99/qt with a two-quart minimum order. No hidden fees, ever.' },
            { n: '03', q: 'Vegan options?', a: 'Absolutely — just mention it in your prompt and we\'ll craft a coconut or oat-milk base.' },
            { n: '04', q: 'How long from order to doorstep?', a: 'Typically 5–7 business days from confirmation to your front door, shipped on dry ice.' },
            { n: '05', q: 'Can I save and re-order a flavor?', a: 'Yes — every flavor gets a permanent page. Bookmark it and reorder anytime.' },
          ].map(({ n, q, a }) => (
            <div key={n} style={{ background: `${C.cherry}80`, border: `1.5px solid ${C.parchment}40`, borderRadius: 6, padding: '20px 22px' }}>
              <p style={{ fontFamily: FF.caveat, fontSize: 13, color: C.parchment, opacity: 0.7, margin: '0 0 8px', letterSpacing: '0.1em' }}>{n}</p>
              <h4 style={{ fontFamily: FF.fraunces, fontStyle: 'italic', fontSize: 18, color: C.cream, margin: '0 0 10px' }}>{q}</h4>
              <p style={{ fontFamily: FF.fraunces, fontSize: 14, color: C.parchment, opacity: 0.85, lineHeight: 1.65, margin: 0 }}>{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER CTA ── */}
      <section style={{ background: C.ink, padding: 'clamp(64px, 9vw, 112px) clamp(24px, 6vw, 80px)', textAlign: 'center' }}>
        <h2 style={{ fontFamily: FF.fraunces, fontStyle: 'italic', fontSize: 'clamp(48px, 9vw, 96px)', color: C.parchment, margin: '0 0 32px' }}>Dream a flavor.</h2>
        <button
          onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); textareaRef.current?.focus() }}
          style={{ background: C.marigold, color: C.ink, fontFamily: FF.fraunces, fontWeight: 700, fontSize: 16, letterSpacing: '0.06em', padding: '18px 48px', border: `2px solid ${C.ink}`, borderRadius: 4, boxShadow: `4px 4px 0 ${C.parchment}60`, cursor: 'pointer' }}>
          Start Conjuring →
        </button>
        <p style={{ fontFamily: FF.caveat, fontSize: 16, color: C.parchment, opacity: 0.4, marginTop: 56 }}>
          Atelier Carnival · Artisan Ice Cream · All flavors one-of-one
        </p>
      </section>
    </div>
  )
}
