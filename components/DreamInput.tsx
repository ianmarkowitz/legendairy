'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  AC, ScoopDoodle, Scribble, Starburst, WaxSeal,
  Stamp, TicketStub, paperGrain, acSerif, acHand, acSmall,
} from './ac-primitives'

const FF = { serif: 'var(--font-fraunces)', hand: 'var(--font-caveat)' }

const CHIPS = [
  { text: 'Apple pie filling folded into ice cream', icon: '🍎', grad: ['#E8A628', '#C83A4E'] },
  { text: 'A bonfire on a beach',                   icon: '🔥', grad: ['#E26B2E', '#8A1F2B'] },
  { text: 'Miso caramel, black sesame, a whisper of heat', icon: '✦', grad: ['#2A1810', '#6B3A78'] },
  { text: "Grandma's snickerdoodles",               icon: '✿', grad: ['#6B8E3D', '#4A6B2A'] },
  { text: 'Tropical chaos — max crunch',            icon: '🌴', grad: ['#7FA8C9', '#6B3A78'] },
]

function LoadingState() {
  return (
    <div style={{ minHeight: '100vh', background: AC.rasp, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 32, padding: '0 24px' }}>
      <ScoopDoodle size={110} fill={AC.cream} color={AC.ink} />
      <h2 style={{ fontFamily: FF.serif, fontStyle: 'italic', fontSize: 'clamp(2rem, 6vw, 3.5rem)', color: AC.cream, margin: 0, textAlign: 'center' }}>
        Churning something extraordinary.
      </h2>
      <div style={{ display: 'flex', gap: 10 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: AC.cream, opacity: 0.7, animation: `bounceDot 1.2s ease-in-out ${i * 0.2}s infinite` }} />
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
  const formRef = useRef<HTMLDivElement>(null)

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
    <div style={{ background: AC.cream, color: AC.ink, fontFamily: FF.serif, ...paperGrain }}>

      {/* ── HERO ── */}
      <section style={{ minHeight: '100vh', padding: 'clamp(48px, 8vw, 96px) clamp(24px, 6vw, 80px)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'start', position: 'relative' }}>

        {/* Left col */}
        <div style={{ maxWidth: 600 }}>
          <Stamp color={AC.rasp} rotate={-1.5} style={{ marginBottom: 24, fontSize: 11 }}>Vol. I · Est. 2025</Stamp>

          {/* H1 block */}
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontFamily: FF.serif, fontStyle: 'italic', fontSize: 'clamp(52px, 7vw, 96px)', lineHeight: 1.05, margin: '0 0 2px', color: AC.ink }}>
              A flavor,
            </h1>
            <div style={{ display: 'inline-block', marginBottom: 6 }}>
              <span style={{ fontFamily: FF.serif, fontStyle: 'italic', fontSize: 'clamp(52px, 7vw, 96px)', color: AC.rasp, lineHeight: 1.05, display: 'block' }}>conjured</span>
              <div style={{ marginTop: -4 }}><Scribble color={AC.marigold} width={300} h={16} /></div>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 6 }}>
              <span style={{ fontFamily: FF.hand, fontSize: 'clamp(52px, 7vw, 96px)', color: AC.marigold, transform: 'rotate(-4deg)', display: 'inline-block', lineHeight: 1 }}>just</span>
              <span style={{ fontFamily: FF.serif, fontStyle: 'italic', fontSize: 'clamp(52px, 7vw, 96px)', color: AC.ink, lineHeight: 1.05 }}>for you.</span>
            </div>
            <span style={{ fontFamily: FF.hand, fontSize: 30, color: AC.pist, display: 'block' }}>( yes, really! )</span>
          </div>

          <p style={{ fontFamily: FF.serif, fontSize: 17, lineHeight: 1.7, color: AC.ink, opacity: 0.8, margin: '0 0 32px', maxWidth: 460 }}>
            Describe a feeling, a memory, a craving. We turn your words into a one-of-one artisan ice cream recipe — then churn and ship it to your door.
          </p>

          {/* Letter-style form */}
          <div ref={formRef}>
            <form onSubmit={handleSubmit} style={{ background: AC.parchment, border: `2px solid ${AC.ink}`, borderRadius: 6, padding: '32px 32px 24px', boxShadow: `6px 6px 0 ${AC.ink}`, ...paperGrain }}>
              <label style={{ fontFamily: FF.hand, fontSize: 22, display: 'block', marginBottom: 14, color: AC.ink }}>Dear flavor architect —</label>
              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                rows={5}
                disabled={loading}
                placeholder="I'm dreaming of something that tastes like…"
                style={{ fontFamily: FF.hand, fontSize: 20, width: '100%', boxSizing: 'border-box', background: 'transparent', border: 'none', borderBottom: `1.5px solid ${AC.ink}`, outline: 'none', resize: 'none', color: AC.ink, lineHeight: 1.7, paddingBottom: 8 }}
              />
              <button
                type="submit"
                disabled={!prompt.trim() || loading}
                style={{ marginTop: 20, background: AC.rasp, color: AC.cream, fontFamily: FF.serif, fontWeight: 700, fontSize: 15, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '14px 36px', border: `2px solid ${AC.ink}`, borderRadius: 4, boxShadow: `4px 4px 0 ${AC.ink}`, cursor: !prompt.trim() ? 'default' : 'pointer', opacity: !prompt.trim() ? 0.5 : 1 }}
              >
                Conjure This Flavor →
              </button>
            </form>
          </div>

          {/* Prompt chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 24 }}>
            {CHIPS.map(({ text, icon, grad }, i) => (
              <button key={i} type="button" onClick={() => useChip(text)}
                style={{ background: `linear-gradient(135deg, ${grad[0]}, ${grad[1]})`, border: `2px solid ${AC.ink}`, borderRadius: 6, padding: '12px 14px', cursor: 'pointer', color: AC.cream, fontFamily: FF.hand, fontSize: 13, transform: `rotate(${[-1.5, 1.2, -0.8, 1.8, -1.2][i]}deg)`, boxShadow: `3px 3px 0 ${AC.ink}`, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6, maxWidth: 148, textAlign: 'left', lineHeight: 1.3, flexShrink: 0 }}>
                <span style={{ fontSize: 22, lineHeight: 1 }}>{icon}</span>
                <span>{text}</span>
              </button>
            ))}
          </div>
          {error && <p style={{ color: AC.rasp, fontFamily: FF.hand, fontSize: 16, marginTop: 12 }}>{error}</p>}
        </div>

        {/* Right col — decorative flavor card */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 40, position: 'relative' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 340 }}>
            {/* Flavor card */}
            <div style={{ background: `linear-gradient(150deg, ${AC.rasp}, ${AC.cherry})`, border: `2px solid ${AC.ink}`, borderRadius: 12, padding: '48px 32px 56px', transform: 'rotate(2.5deg)', boxShadow: `12px 12px 0 ${AC.ink}`, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.12) 0%, transparent 60%)', pointerEvents: 'none' }} />
              <p style={{ ...acSmall, color: `${AC.cream}88`, margin: '0 0 24px' }}>ONE · OF · ONE</p>
              <ScoopDoodle size={96} fill={`${AC.parchment}30`} color={`${AC.parchment}70`} />
              <p style={{ fontFamily: FF.serif, fontStyle: 'italic', fontSize: 24, color: AC.cream, margin: '24px 0 10px', lineHeight: 1.25 }}>Your flavor,<br />your story.</p>
              <p style={{ fontFamily: FF.hand, fontSize: 16, color: `${AC.cream}90`, margin: 0 }}>conjured just for you</p>
            </div>
            {/* Starburst top-right */}
            <div style={{ position: 'absolute', top: 16, right: -20, zIndex: 2 }}>
              <Starburst size={88} fill={AC.marigold} stroke={AC.ink} rotate={8}>
                <span style={{ fontFamily: FF.hand, fontSize: 13, color: AC.ink, fontWeight: 700, textAlign: 'center', lineHeight: 1.2 }}>churned<br />fresh!</span>
              </Starburst>
            </div>
            {/* WaxSeal bottom-left */}
            <div style={{ position: 'absolute', bottom: -16, left: -20, zIndex: 2 }}>
              <WaxSeal size={72} color={AC.rasp} rotate={-8} />
            </div>
          </div>
        </div>

      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{ background: AC.parchment, padding: 'clamp(48px, 7vw, 88px) clamp(24px, 6vw, 80px)', ...paperGrain }}>
        <p style={{ fontFamily: FF.hand, fontSize: 26, color: AC.rasp, margin: '0 0 16px' }}>↓ how the magic happens ↓</p>
        <h2 style={{ fontFamily: FF.serif, fontStyle: 'italic', fontSize: 'clamp(48px, 8vw, 96px)', color: AC.ink, margin: '0 0 56px', lineHeight: 1 }}>Three acts, one pint.</h2>
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
          {[
            { num: 'I',   icon: '✍︎', act: 'You describe', desc: 'A feeling, a memory, a craving. Anything goes — the more vivid, the better.' },
            { num: 'II',  icon: '✦',  act: 'We architect', desc: 'Our flavor engine translates your vision into a precise artisan recipe.' },
            { num: 'III', icon: '✿',  act: 'We churn',     desc: 'Small-batch, hand-packed, labeled with your story. Shipped cold to your door.' },
          ].map(({ num, icon, act, desc }, i) => (
            <div key={i} style={{ flex: '1 1 240px', background: AC.cream, border: `2px solid ${AC.ink}`, borderRadius: 8, padding: '40px 28px 32px', position: 'relative', transform: `rotate(${[-1.5, 1, -0.8][i]}deg)`, boxShadow: `5px 5px 0 ${AC.ink}` }}>
              <div style={{ position: 'absolute', top: -24, right: -24, zIndex: 2 }}>
                <Starburst size={64} fill={AC.marigold} stroke={AC.ink} rotate={0}>
                  <span style={{ fontFamily: FF.serif, fontStyle: 'italic', fontSize: 18, color: AC.ink, fontWeight: 700 }}>{num}</span>
                </Starburst>
              </div>
              <div style={{ fontSize: 34, marginBottom: 16 }}>{icon}</div>
              <h3 style={{ fontFamily: FF.serif, fontStyle: 'italic', fontSize: 40, margin: '0 0 12px', color: AC.ink, lineHeight: 1.05 }}>{act}</h3>
              <p style={{ fontFamily: FF.serif, fontSize: 15, lineHeight: 1.65, color: AC.ink, opacity: 0.75, margin: 0 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── GIFTED CONJURINGS ── */}
      <section id="examples" style={{ background: AC.ink, padding: 'clamp(48px, 7vw, 88px) clamp(24px, 6vw, 80px)' }}>
        <h2 style={{ fontFamily: FF.serif, fontStyle: 'italic', fontSize: 'clamp(48px, 7vw, 84px)', color: AC.parchment, margin: '0 0 56px', lineHeight: 1.05 }}>Gifted conjurings.</h2>
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { bg: [AC.marigold, AC.rasp],    icon: '🎂', to: 'Mara',        from: 'Sam',   title: 'Bonfire on the Boardwalk', story: 'Smoked caramel, toasted marshmallow, a ghost of sea salt — the night we stayed until the fire went out.',  occasion: '30th Birthday'    },
            { bg: [AC.grape,    AC.ink],      icon: '🌙', to: 'Theo',        from: 'Noah',  title: 'Midnight in Kyoto',        story: 'Black sesame, yuzu blossom, matcha ribbon — every alley we wandered that first night together.',               occasion: 'First Anniversary' },
            { bg: [AC.cherry,   AC.tangerine],icon: '🍎', to: 'the in-laws', from: 'Priya', title: 'Orchard Heist',            story: 'Brown butter apple, cinnamon crack, caramel drizzle — a Thanksgiving that earned us seconds.',                 occasion: 'Thanksgiving'     },
          ].map(({ bg, icon, to, from, title, story, occasion }, i) => (
            <div key={i} style={{ flex: '1 1 260px', maxWidth: 320, display: 'flex', flexDirection: 'column' }}>
              {/* Gift tag — clipped arrow shape */}
              <div style={{ alignSelf: 'flex-start', background: AC.parchment, border: `1.5px solid ${AC.cream}40`, padding: '8px 30px 8px 16px', position: 'relative', clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 50%, calc(100% - 14px) 100%, 0 100%)', marginBottom: -1, zIndex: 1 }}>
                <div style={{ position: 'absolute', right: 22, top: '50%', transform: 'translateY(-50%)', width: 7, height: 7, borderRadius: '50%', background: AC.ink, opacity: 0.25 }} />
                <span style={{ fontFamily: FF.hand, fontSize: 15, color: AC.ink }}>To: {to} </span>
                <span style={{ fontFamily: FF.hand, fontSize: 13, color: AC.ink, opacity: 0.6 }}>from {from}</span>
              </div>
              {/* Gradient card — 3:4 aspect */}
              <div style={{ width: '100%', aspectRatio: '3/4', background: `linear-gradient(160deg, ${bg[0]}, ${bg[1]})`, border: `2px solid ${AC.parchment}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(ellipse at 25% 15%, rgba(255,255,255,0.1) 0%, transparent 55%)', pointerEvents: 'none' }} />
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: `${AC.parchment}18`, border: `2px solid ${AC.parchment}45`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>
                  {icon}
                </div>
              </div>
              {/* Story card */}
              <div style={{ background: AC.cream, border: `2px solid ${AC.ink}`, borderTop: 'none', borderRadius: '0 0 8px 8px', padding: '18px 20px', boxSizing: 'border-box' }}>
                <p style={{ fontFamily: FF.hand, fontSize: 13, color: AC.rasp, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 6px' }}>{occasion}</p>
                <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', marginBottom: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: FF.hand, fontSize: 15, color: AC.ink, opacity: 0.7 }}>To {to} · from {from}</span>
                </div>
                <h4 style={{ fontFamily: FF.serif, fontStyle: 'italic', fontSize: 20, margin: '0 0 10px', color: AC.ink, lineHeight: 1.2 }}>{title}</h4>
                <p style={{ fontFamily: FF.serif, fontStyle: 'italic', fontSize: 14, lineHeight: 1.65, color: AC.ink, opacity: 0.72, margin: 0 }}>{story}</p>
              </div>
            </div>
          ))}
        </div>
        {/* Stamp row */}
        <div style={{ display: 'flex', gap: 24, marginTop: 56, flexWrap: 'wrap', justifyContent: 'center' }}>
          {(['dedication', 'custom label', 'story card', 'dry-ice packed'] as const).map((s, i) => (
            <Stamp key={s} color={AC.parchment} rotate={[-2, 1.5, -1, 2][i]} style={{ fontSize: 12, opacity: 0.8 }}>✦ {s}</Stamp>
          ))}
        </div>
      </section>

      {/* ── PRICING ── */}
      <section style={{ background: AC.parchment, padding: 'clamp(64px, 8vw, 112px) clamp(24px, 6vw, 80px)', textAlign: 'center', position: 'relative', overflow: 'hidden', ...paperGrain }}>
        {/* Starburst top-left */}
        <div style={{ position: 'absolute', top: -20, left: -20 }}>
          <Starburst size={200} fill={AC.rasp} stroke={AC.ink} rotate={-12}>
            <span style={{ fontFamily: FF.hand, fontSize: 18, color: AC.cream, fontWeight: 700, lineHeight: 1.3, textAlign: 'center' }}>no charge<br />for big<br />ideas!</span>
          </Starburst>
        </div>
        {/* TicketStub top-right */}
        <div style={{ position: 'absolute', top: 36, right: 36, transform: 'rotate(3deg)' }}>
          <TicketStub bg={AC.marigold} border={AC.ink} style={{ padding: '14px 28px' }}>
            <p style={{ ...acSmall, color: AC.ink, margin: 0, lineHeight: 2, fontSize: 12 }}>ADMIT ONE<br />YOUR PINT<br />good forever</p>
          </TicketStub>
        </div>

        {/* Price */}
        <div style={{ paddingTop: 80 }}>
          <p style={{ fontFamily: FF.serif, fontStyle: 'italic', fontSize: 'clamp(120px, 18vw, 260px)', color: AC.ink, margin: 0, lineHeight: 0.9, letterSpacing: '-0.02em' }}>
            $19<span style={{ color: AC.rasp }}>.99</span>
          </p>
          <p style={{ fontFamily: FF.hand, fontSize: 22, color: AC.ink, opacity: 0.6, margin: '20px 0 52px' }}>per quart · two-quart minimum</p>
        </div>

        {/* 4 Stamps */}
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            { label: 'One-of-one recipe',       rot: -2   },
            { label: 'Custom printed label',    rot:  1.5 },
            { label: 'Handwritten story card',  rot: -1   },
            { label: 'Ships cold, arrives intact', rot: 2 },
          ].map(({ label, rot }) => (
            <Stamp key={label} color={AC.ink} rotate={rot} style={{ fontSize: 12 }}>{label}</Stamp>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ background: AC.rasp, padding: 'clamp(48px, 7vw, 88px) clamp(24px, 6vw, 80px)' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 20, flexWrap: 'wrap', marginBottom: 56 }}>
          <h2 style={{ fontFamily: FF.serif, fontStyle: 'italic', fontSize: 'clamp(36px, 5vw, 64px)', color: AC.cream, margin: 0 }}>Gentle questions.</h2>
          <span style={{ fontFamily: FF.hand, fontSize: 26, color: AC.parchment, opacity: 0.8 }}>(we've heard them all!)</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {[
            { n: '01', q: 'Is every flavor really one-of-one?', a: 'Yes. Each recipe is generated specifically for your prompt and never reused.' },
            { n: '02', q: 'How does pricing work?',             a: '$19.99/qt with a two-quart minimum order. No hidden fees, ever.' },
            { n: '03', q: 'How long from order to doorstep?',  a: 'Typically 5–7 business days from confirmation to your front door, shipped on dry ice.' },
            { n: '04', q: 'Can I save and re-order a flavor?', a: 'Yes — every flavor gets a permanent page. Bookmark it and reorder anytime.' },
          ].map(({ n, q, a }) => (
            <div key={n} style={{ display: 'grid', gridTemplateColumns: '100px 1fr 1fr', gap: '0 32px', alignItems: 'start', borderTop: `1px dashed ${AC.parchment}55`, padding: '28px 0' }}>
              <span style={{ fontFamily: FF.serif, fontStyle: 'italic', fontSize: 80, color: AC.marigold, lineHeight: 0.85, opacity: 0.65 }}>{n}</span>
              <h4 style={{ fontFamily: FF.serif, fontSize: 30, color: AC.cream, margin: 0, lineHeight: 1.2 }}>{q}</h4>
              <p style={{ fontFamily: FF.serif, fontSize: 16, lineHeight: 1.7, color: AC.parchment, opacity: 0.85, margin: 0 }}>{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER CTA ── */}
      <section style={{ background: AC.ink, padding: 'clamp(64px, 9vw, 112px) clamp(24px, 6vw, 80px)', textAlign: 'center' }}>
        <p style={{ fontFamily: FF.hand, fontSize: 72, color: AC.marigold, margin: '0 0 8px', lineHeight: 1 }}>your turn —</p>
        <h2 style={{ fontFamily: FF.serif, fontStyle: 'italic', fontSize: 'clamp(72px, 14vw, 220px)', color: AC.parchment, margin: '0 0 56px', lineHeight: 0.92, letterSpacing: '-0.02em' }}>Dream a flavor.</h2>
        <button
          onClick={() => { formRef.current?.scrollIntoView({ behavior: 'smooth' }); textareaRef.current?.focus() }}
          style={{ background: AC.marigold, color: AC.ink, fontFamily: FF.serif, fontWeight: 700, fontSize: 18, letterSpacing: '0.06em', padding: '18px 52px', border: `2px solid ${AC.ink}`, borderRadius: 4, boxShadow: `5px 5px 0 ${AC.rasp}`, cursor: 'pointer' }}>
          Begin → (it&apos;s fun)
        </button>
        <p style={{ fontFamily: FF.hand, fontSize: 16, color: AC.parchment, opacity: 0.35, marginTop: 64 }}>
          Legendairy · Artisan Ice Cream · All flavors one-of-one
        </p>
      </section>


    </div>
  )
}
