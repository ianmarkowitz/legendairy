import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Legendairy — Custom Artisan Ice Cream Made to Order'
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

export default async function Image() {
  const fontData = await loadFraunces()

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%',
          background: '#2A1810',
          display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 96px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Radial glow */}
        <div style={{
          position: 'absolute', top: -120, right: -80,
          width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, #C83A4E55 0%, transparent 70%)',
          display: 'flex',
        }} />
        <div style={{
          position: 'absolute', bottom: -80, left: -60,
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, #E8A62833 0%, transparent 70%)',
          display: 'flex',
        }} />

        {/* Top row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            border: '2px solid #FBF3D955',
            padding: '6px 18px',
            display: 'flex',
          }}>
            <span style={{
              fontFamily: fontData ? 'Fraunces' : 'Georgia',
              fontSize: 13, fontWeight: 900,
              textTransform: 'uppercase', letterSpacing: '0.18em',
              color: '#FBF3D980',
            }}>
              ✦ One-of-One · Est. 2025 · Boston
            </span>
          </div>
        </div>

        {/* Main content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          <span style={{
            fontFamily: fontData ? 'Fraunces' : 'Georgia',
            fontSize: 96, fontWeight: 900, fontStyle: 'italic',
            color: '#FBF3D9', lineHeight: 1, letterSpacing: '-0.02em',
          }}>
            A flavor,
          </span>
          <span style={{
            fontFamily: fontData ? 'Fraunces' : 'Georgia',
            fontSize: 96, fontWeight: 900, fontStyle: 'italic',
            color: '#C83A4E', lineHeight: 1, letterSpacing: '-0.02em',
          }}>
            conjured
          </span>
          <span style={{
            fontFamily: fontData ? 'Fraunces' : 'Georgia',
            fontSize: 96, fontWeight: 900, fontStyle: 'italic',
            color: '#FBF3D9', lineHeight: 1, letterSpacing: '-0.02em',
          }}>
            just for you.
          </span>
        </div>

        {/* Bottom row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <span style={{
            fontFamily: fontData ? 'Fraunces' : 'Georgia',
            fontSize: 18, fontWeight: 900, fontStyle: 'italic',
            color: '#FBF3D9', letterSpacing: '-0.01em',
          }}>
            Legendairy
          </span>
          <span style={{
            fontFamily: fontData ? 'Fraunces' : 'Georgia',
            fontSize: 15, color: '#FBF3D960', letterSpacing: '0.06em',
          }}>
            legendairyicecream.com
          </span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: fontData ? [{ name: 'Fraunces', data: fontData, style: 'italic', weight: 900 }] : undefined,
    }
  )
}
