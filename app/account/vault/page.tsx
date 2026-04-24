import { createClient } from '@/lib/supabase-server'
import { supabase as serviceClient } from '@/lib/supabase'
import CreationCard from '@/components/CreationCard'
import Link from 'next/link'

export const revalidate = 0

const C = {
  parchment: '#F1E1BC',
  cream:     '#FBF3D9',
  ink:       '#2A1810',
  rasp:      '#C83A4E',
  pist:      '#6B8E3D',
  marigold:  '#E8A628',
  cherry:    '#8A1F2B',
  grape:     '#6B3A78',
}

const fraunces = 'var(--font-fraunces)'
const caveat   = 'var(--font-caveat)'

// Slight alternating tilts per card position
const CARD_ROTATIONS = ['-1.2deg', '1.1deg', '-0.8deg', '1.3deg', '-1.0deg', '0.9deg']

export default async function VaultPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: vaulted } = await serviceClient
    .from('flavor_creations')
    .select('id, flavor_name, tagline, suggested_color, created_at, is_vaulted')
    .eq('user_id', user.id)
    .eq('is_vaulted', true)
    .order('created_at', { ascending: false })

  // Also fetch total creations count and ordered count for stats
  const { count: totalCount } = await serviceClient
    .from('flavor_creations')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const { count: orderedCount } = await serviceClient
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const vaultedCount = vaulted?.length ?? 0

  const STATS = [
    { label: 'Creations',  value: totalCount  ?? 0 },
    { label: 'Vaulted',    value: vaultedCount       },
    { label: 'Ordered',    value: orderedCount ?? 0 },
    { label: 'Shared',     value: 0                  },
  ]

  // Slight tilt angles for the stats boxes
  const STAT_TILTS = ['-1.2deg', '0.8deg', '-0.6deg', '1.1deg']

  return (
    <div style={{
      minHeight:  '100vh',
      background: C.parchment,
      padding:    '56px 28px 100px',
    }}>

      {/* ── Header ── */}
      <div style={{
        maxWidth:    860,
        margin:      '0 auto',
        marginBottom: 48,
      }}>

        {/* Handwritten subtitle */}
        <div style={{ marginBottom: 6 }}>
          <span style={{
            fontFamily:    caveat,
            fontSize:      22,
            fontWeight:    600,
            color:         C.rasp,
            letterSpacing: '0.04em',
            display:       'inline-block',
            transform:     'rotate(-1.5deg)',
          }}>
            — a private library —
          </span>
        </div>

        {/* Heading with "Vault" in rasp + marigold underline */}
        <h1 style={{
          fontFamily:    fraunces,
          fontSize:      'clamp(52px, 8vw, 96px)',
          fontStyle:     'italic',
          fontWeight:    900,
          color:         C.ink,
          lineHeight:    0.94,
          letterSpacing: '-0.02em',
          margin:        '0 0 32px',
          position:      'relative',
          display:       'inline-block',
        }}>
          The{' '}
          <span style={{ position: 'relative', display: 'inline-block' }}>
            <span style={{ color: C.rasp }}>Vault.</span>
            {/* Marigold scribble underline */}
            <div style={{
              position:         'absolute',
              bottom:           -4,
              left:             0,
              right:            0,
              height:           3,
              background:       C.marigold,
              opacity:          0.85,
              borderRadius:     '2px 1px 3px 1px / 3px 2px 1px 3px',
              transform:        'rotate(-0.5deg) scaleX(1.02)',
              transformOrigin:  'left center',
            }} />
          </span>
        </h1>

        {/* Stats row */}
        <div style={{
          display: 'flex',
          gap:     12,
          flexWrap: 'wrap' as const,
        }}>
          {STATS.map((stat, i) => (
            <div key={stat.label} style={{
              background:   C.cream,
              border:       `2px solid ${C.ink}`,
              padding:      '12px 20px',
              transform:    `rotate(${STAT_TILTS[i]})`,
              minWidth:     72,
              textAlign:    'center',
            }}>
              <div style={{
                fontFamily:    fraunces,
                fontSize:      30,
                fontWeight:    900,
                fontStyle:     'italic',
                color:         C.ink,
                lineHeight:    1,
                marginBottom:  4,
              }}>
                {stat.value}
              </div>
              <div style={{
                fontFamily:    fraunces,
                fontSize:      9,
                textTransform: 'uppercase',
                letterSpacing: '0.16em',
                color:         C.ink,
                opacity:       0.45,
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Grid or Empty state ── */}
      <div style={{ maxWidth: 860, margin: '0 auto' }}>

        {!vaulted || vaulted.length === 0 ? (

          /* Empty state */
          <div style={{
            textAlign:  'center',
            padding:    '80px 24px',
          }}>
            <div style={{
              fontFamily: fraunces,
              fontSize:   72,
              fontStyle:  'italic',
              color:      C.ink,
              opacity:    0.18,
              lineHeight: 1,
              marginBottom: 24,
            }}>
              ♡
            </div>
            <h2 style={{
              fontFamily:    fraunces,
              fontSize:      28,
              fontStyle:     'italic',
              fontWeight:    700,
              color:         C.ink,
              margin:        '0 0 12px',
            }}>
              Your vault is empty
            </h2>
            <p style={{
              fontFamily: caveat,
              fontSize:   20,
              color:      C.rasp,
              margin:     '0 0 32px',
              transform:  'rotate(-1deg)',
              display:    'inline-block',
            }}>
              Tap ♡ on any creation to keep it here forever.
            </p>
            <div>
              <Link href="/account/creations" style={{
                fontFamily:    fraunces,
                fontSize:      14,
                fontWeight:    600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color:         C.ink,
                textDecoration: 'none',
                borderBottom:  `2px solid ${C.marigold}`,
                paddingBottom:  2,
              }}>
                Browse your creations →
              </Link>
            </div>
          </div>

        ) : (

          /* Card grid */
          <div style={{
            display:             'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap:                 28,
            alignItems:          'start',
          }}>
            {vaulted.map((c, i) => (
              <div
                key={c.id}
                style={{
                  transform:      `rotate(${CARD_ROTATIONS[i % CARD_ROTATIONS.length]})`,
                  transformOrigin: 'center top',
                }}
              >
                <CreationCard
                  id={c.id}
                  flavorName={c.flavor_name}
                  tagline={c.tagline}
                  color={c.suggested_color ?? '#C4922A'}
                  createdAt={c.created_at}
                  isVaulted={true}
                  showVault={false}
                />
              </div>
            ))}
          </div>

        )}
      </div>
    </div>
  )
}
