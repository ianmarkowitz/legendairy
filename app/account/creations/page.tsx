import { createClient } from '@/lib/supabase-server'
import { supabase as serviceClient } from '@/lib/supabase'
import CreationCard from '@/components/CreationCard'
import Link from 'next/link'
import { AC, paperGrain, Stamp, ScoopDoodle } from '@/components/ac-primitives'

export const revalidate = 0

const FF = { serif: 'var(--font-fraunces)', hand: 'var(--font-caveat)' }

export default async function CreationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: creations } = await serviceClient
    .from('flavor_creations')
    .select('id, flavor_name, tagline, suggested_color, created_at, is_vaulted')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const CARD_ROTATIONS = ['-1.2deg', '1.1deg', '-0.8deg', '1.3deg', '-1.0deg', '0.9deg']

  return (
    <div style={{ ...paperGrain }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <span style={{ fontFamily: FF.hand, fontSize: 20, color: AC.rasp, display: 'block', transform: 'rotate(-1deg)', marginBottom: 4 }}>
            — every flavor you&apos;ve dreamed up —
          </span>
          <h1 style={{ fontFamily: FF.serif, fontStyle: 'italic', fontSize: 'clamp(40px, 6vw, 64px)', color: AC.ink, margin: 0, lineHeight: 0.95, letterSpacing: '-0.02em' }}>
            My Creations
          </h1>
        </div>
        <Link href="/" style={{ textDecoration: 'none', alignSelf: 'flex-end', marginBottom: 8 }}>
          <Stamp color={AC.rasp} rotate={-1.5} style={{ fontSize: 11, cursor: 'pointer' }}>+ New Flavor</Stamp>
        </Link>
      </div>

      {!creations || creations.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 24px' }}>
          <ScoopDoodle size={80} fill={AC.parchment} color={`${AC.ink}44`} />
          <h2 style={{ fontFamily: FF.serif, fontStyle: 'italic', fontSize: 28, color: AC.ink, margin: '20px 0 10px' }}>
            No creations yet
          </h2>
          <p style={{ fontFamily: FF.hand, fontSize: 20, color: AC.rasp, margin: '0 0 28px', transform: 'rotate(-1deg)', display: 'inline-block' }}>
            Your AI-generated flavors will appear here.
          </p>
          <div>
            <Link href="/" style={{ fontFamily: FF.serif, fontSize: 14, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: AC.ink, textDecoration: 'none', borderBottom: `2px solid ${AC.marigold}`, paddingBottom: 2 }}>
              Dream up your first flavor →
            </Link>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 28, alignItems: 'start' }}>
          {creations.map((c, i) => (
            <div key={c.id} style={{ transform: `rotate(${CARD_ROTATIONS[i % CARD_ROTATIONS.length]})`, transformOrigin: 'center top' }}>
              <CreationCard
                id={c.id}
                flavorName={c.flavor_name}
                tagline={c.tagline}
                color={c.suggested_color ?? '#C4922A'}
                createdAt={c.created_at}
                isVaulted={c.is_vaulted ?? false}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
