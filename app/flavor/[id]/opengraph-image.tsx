import { ImageResponse } from 'next/og'
import { supabase } from '@/lib/supabase'

export const runtime = 'nodejs'
export const alt = 'Legendairy — Custom Artisan Ice Cream'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

async function loadFraunces() {
  try {
    const css = await fetch(
      'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@1,9..144,900',
      { headers: { 'User-Agent': 'Mozilla/5.0' } }
    ).then(r => r.text())
    const url = css.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/)?.[1]
    if (url) return fetch(url).then(r => r.arrayBuffer())
  } catch {}
  return null
}

export default async function Image({ params }: { params: { id: string } }) {
  const [fontData, { data }] = await Promise.all([
    loadFraunces(),
    supabase
      .from('flavor_creations')
      .select('flavor_name, tagline, suggested_color')
      .eq('id', params.id)
      .single(),
  ])

  const color   = data?.suggested_color ?? '#C83A4E'
  const name    = data?.flavor_name     ?? 'A One-of-One Flavor'
  const tagline = data?.tagline         ?? 'Conjured just for you.'

  const ff = fontData ? 'Fraunces' : 'Georgia'

  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%',
        display: 'flex',
        background: '#2A1810',
        overflow: 'hidden',
      }}>

        {/* Left — color panel */}
        <div style={{
          width: '42%', height: '100%',
          background: `linear-gradient(160deg, ${color}EE, ${color}66)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          position: 'relative',
        }}>
          {/* Shine */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            background: 'radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.18) 0%, transparent 60%)',
            display: 'flex',
          }} />
          <span style={{ fontSize: 120, lineHeight: 1 }}>✦</span>
        </div>

        {/* Right — text panel */}
        <div style={{
          flex: 1, padding: '56px 64px',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        }}>

          {/* Top stamp */}
          <div style={{
            display: 'flex',
            border: '2px solid #FBF3D940',
            padding: '6px 14px',
            alignSelf: 'flex-start',
          }}>
            <span style={{ fontFamily: ff, fontSize: 11, fontWeight: 900, letterSpacing: '0.2em', color: '#FBF3D960', textTransform: 'uppercase' }}>
              One · of · One
            </span>
          </div>

          {/* Flavor name + tagline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <span style={{
              fontFamily: ff, fontStyle: 'italic', fontWeight: 900,
              fontSize: name.length > 20 ? 52 : 64,
              color: '#FBF3D9', lineHeight: 1.05, letterSpacing: '-0.02em',
            }}>
              {name}
            </span>
            <span style={{
              fontFamily: ff, fontStyle: 'italic',
              fontSize: 20, color: '#FBF3D988', lineHeight: 1.45,
            }}>
              {tagline.length > 80 ? tagline.slice(0, 78) + '…' : tagline}
            </span>
          </div>

          {/* Bottom brand */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: ff, fontStyle: 'italic', fontWeight: 900, fontSize: 24, color: '#FBF3D9' }}>
              Legendairy
            </span>
            <span style={{ fontFamily: ff, fontSize: 13, color: '#FBF3D955', letterSpacing: '0.06em' }}>
              legendairyicecream.com
            </span>
          </div>

        </div>
      </div>
    ),
    {
      ...size,
      fonts: fontData ? [{ name: 'Fraunces', data: fontData, style: 'italic', weight: 900 }] : undefined,
    }
  )
}
