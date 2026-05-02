import { supabase } from '@/lib/supabase'
import { AC } from './ac-primitives'
import Link from 'next/link'

type FlavorRow = {
  id: string
  flavor_name: string
  tagline: string
  suggested_color: string | null
  customer_prompt: string
}

const COLOR_MAP: Record<string, string> = {
  pink: '#E8A0B0', lavender: '#C3A0D8', violet: '#9B6FBD', purple: '#7A4BA0',
  blue: '#7FA8C9', teal: '#3A8E7D', turquoise: '#4FC3C3', 'sky blue': '#87CEEB',
  green: '#6B9E4D', sage: '#8EA87A', mint: '#A8D5BA', lime: '#B0D060',
  yellow: '#E8D028', gold: '#E8A628', amber: '#E8901A', orange: '#E26B2E',
  peach: '#F0B090', coral: '#F08080', red: '#C83A4E', cherry: '#8A1F2B',
  rose: '#E06080', raspberry: '#C83A4E', strawberry: '#E83050',
  caramel: '#C8823A', chocolate: '#6B3A1F', vanilla: '#F1E1BC',
  pistachio: '#93C572', matcha: '#7B9E5B', lemon: '#E8D028',
  blueberry: '#4F60A0', mango: '#F4A220', coconut: '#EDE8D0',
  brown: '#8B5A2B', grey: '#A0A0A0', gray: '#A0A0A0',
}

function toColor(raw: string | null): string {
  if (!raw) return AC.marigold
  const t = raw.trim()
  if (/^#[0-9a-fA-F]{3,8}$/.test(t)) return t
  if (/^rgb/.test(t) || /^hsl/.test(t)) return t
  const lower = t.toLowerCase()
  for (const [key, val] of Object.entries(COLOR_MAP)) {
    if (lower.includes(key)) return val
  }
  return AC.marigold
}

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n).trimEnd() + '…' : s
}

const ROTATIONS = [1.2, -0.8, 0.5, -1.1, 0.9, -0.4, 1.5, -0.7, 0.3, -1.3, 0.8, -0.5]

export default async function RecentFlavors() {
  const { data: flavors } = await supabase
    .from('flavor_creations')
    .select('id, flavor_name, tagline, suggested_color, customer_prompt')
    .order('created_at', { ascending: false })
    .limit(12)

  if (!flavors || flavors.length < 3) return null

  const serif = 'var(--font-fraunces)'
  const hand  = 'var(--font-caveat)'

  return (
    <section style={{ background: AC.ink, padding: '72px 0 60px', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{ maxWidth: 1140, margin: '0 auto', padding: '0 28px 36px' }}>
        <div style={{ fontFamily: hand, fontSize: 18, color: AC.marigold, marginBottom: 10 }}>
          from the creative lab
        </div>
        <h2 style={{
          fontFamily: serif, fontStyle: 'italic', fontWeight: 900,
          fontSize: 'clamp(36px, 5vw, 56px)', color: AC.cream,
          margin: '0 0 14px', lineHeight: 1.0,
        }}>
          What people are imagining.
        </h2>
        <p style={{
          fontFamily: serif, fontStyle: 'italic', fontSize: 16,
          color: `${AC.cream}77`, margin: 0, lineHeight: 1.6,
        }}>
          Every flavor below was born from a real prompt. Yours is next.
        </p>
      </div>

      {/* Prompt ticker */}
      <div style={{
        overflow: 'hidden',
        borderTop: `1px solid ${AC.cream}18`,
        borderBottom: `1px solid ${AC.cream}18`,
        padding: '11px 0',
        marginBottom: 44,
        background: `${AC.cream}06`,
      }}>
        <div className="animate-marquee-slow" aria-hidden="true">
          {(flavors as FlavorRow[]).map((f, i) => (
            <span key={`a${i}`} style={{
              fontFamily: hand, fontSize: 16,
              color: `${AC.cream}66`, whiteSpace: 'nowrap',
              padding: '0 20px',
            }}>
              &ldquo;{truncate(f.customer_prompt, 65)}&rdquo;
              <span style={{ color: AC.marigold, padding: '0 8px' }}>✦</span>
            </span>
          ))}
          {(flavors as FlavorRow[]).map((f, i) => (
            <span key={`b${i}`} style={{
              fontFamily: hand, fontSize: 16,
              color: `${AC.cream}66`, whiteSpace: 'nowrap',
              padding: '0 20px',
            }}>
              &ldquo;{truncate(f.customer_prompt, 65)}&rdquo;
              <span style={{ color: AC.marigold, padding: '0 8px' }}>✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* Cards */}
      <div style={{ maxWidth: 1140, margin: '0 auto', padding: '0 28px' }}>
        <div className="rf-strip" style={{ display: 'flex', gap: 20, overflowX: 'auto', paddingBottom: 8 }}>
          {(flavors as FlavorRow[]).map((f, i) => {
            const color = toColor(f.suggested_color)
            const rot   = ROTATIONS[i % ROTATIONS.length]
            return (
              <Link
                key={f.id}
                href={`/flavor/${f.id}`}
                style={{ textDecoration: 'none', flexShrink: 0, display: 'block' }}
              >
                <div
                  className="rf-card"
                  style={{
                    width: 216,
                    borderRadius: 8,
                    overflow: 'hidden',
                    border: `1.5px solid ${AC.cream}20`,
                    background: AC.cream,
                    transform: `rotate(${rot}deg)`,
                    transformOrigin: 'center bottom',
                  }}
                >
                  {/* Color swatch */}
                  <div style={{
                    background: color,
                    height: 92,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                  }}>
                    <span style={{
                      fontFamily: serif, fontSize: 36,
                      color: AC.ink, opacity: 0.25,
                      userSelect: 'none',
                    }}>✦</span>
                  </div>

                  {/* Body */}
                  <div style={{ padding: '15px 17px 18px' }}>
                    <div style={{
                      fontFamily: serif, fontStyle: 'italic', fontWeight: 900,
                      fontSize: 17, color: AC.ink, lineHeight: 1.1, marginBottom: 5,
                    }}>
                      {f.flavor_name}
                    </div>
                    <div style={{
                      fontFamily: serif, fontStyle: 'italic',
                      fontSize: 12, color: AC.rasp, lineHeight: 1.4, marginBottom: 10,
                    }}>
                      {truncate(f.tagline, 55)}
                    </div>
                    <div style={{
                      fontFamily: hand, fontSize: 13,
                      color: `${AC.ink}66`, lineHeight: 1.55, fontStyle: 'italic',
                    }}>
                      &ldquo;{truncate(f.customer_prompt, 72)}&rdquo;
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* CTA */}
      <div style={{ maxWidth: 1140, margin: '36px auto 0', padding: '0 28px', textAlign: 'center' }}>
        <p style={{
          fontFamily: serif, fontStyle: 'italic',
          fontSize: 15, color: `${AC.cream}55`, margin: '0 0 4px',
        }}>
          None of these are yours yet.
        </p>
        <a
          href="#dream-input"
          style={{
            fontFamily: hand, fontSize: 20, color: AC.marigold,
            textDecoration: 'none', letterSpacing: '0.01em',
          }}
        >
          Describe yours above ↑
        </a>
      </div>

    </section>
  )
}
