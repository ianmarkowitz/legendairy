// Atelier Carnival shared design primitives
// SVG decorations, stamps, seals, starbursts

import React from 'react'

export const AC = {
  parchment: '#F1E1BC',
  cream:     '#FBF3D9',
  ink:       '#2A1810',
  rasp:      '#C83A4E',
  pist:      '#6B8E3D',
  marigold:  '#E8A628',
  cherry:    '#8A1F2B',
  sky:       '#7FA8C9',
  grape:     '#6B3A78',
  tangerine: '#E26B2E',
}

export function shade(hex: string, amt: number): string {
  const h = hex.replace('#', '')
  const num = parseInt(h, 16)
  let r = (num >> 16) + amt
  let g = ((num >> 8) & 0x00ff) + amt
  let b = (num & 0x0000ff) + amt
  r = Math.max(0, Math.min(255, r))
  g = Math.max(0, Math.min(255, g))
  b = Math.max(0, Math.min(255, b))
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')
}

export function ScoopDoodle({ size = 120, color = '#2A1810', fill = '#E8A628' }: {
  size?: number; color?: string; fill?: string
}) {
  return (
    <svg viewBox="0 0 100 120" width={size} height={size * 1.2} style={{ display: 'block' }}>
      <path
        d="M50 10 C 28 10, 18 30, 22 45 C 12 44, 8 58, 18 62 C 14 72, 28 78, 36 72 C 40 80, 56 82, 62 74 C 72 78, 84 70, 80 58 C 90 54, 88 38, 78 36 C 80 20, 66 8, 50 10 Z"
        fill={fill} stroke={color} strokeWidth="2" strokeLinejoin="round"
      />
      <path d="M28 66 L 72 66 L 56 112 L 44 112 Z" fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round"/>
      <line x1="34" y1="78" x2="64" y2="78" stroke={color} strokeWidth="1.3"/>
      <line x1="36" y1="88" x2="62" y2="88" stroke={color} strokeWidth="1.3"/>
      <line x1="40" y1="98" x2="58" y2="98" stroke={color} strokeWidth="1.3"/>
      <circle cx="38" cy="32" r="2" fill={color}/>
      <circle cx="56" cy="26" r="1.5" fill={color}/>
      <circle cx="62" cy="48" r="2" fill={color}/>
    </svg>
  )
}

export function Scribble({ color = '#C83A4E', width = 260, h = 14 }: {
  color?: string; width?: number; h?: number
}) {
  return (
    <svg viewBox={`0 0 ${width} ${h}`} width={width} height={h} style={{ display: 'block' }}>
      <path
        d={`M2 ${h - 4} Q ${width * 0.25} ${h - 12}, ${width * 0.5} ${h - 5} T ${width - 4} ${h - 4}`}
        fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round"
      />
    </svg>
  )
}

export function Starburst({ size = 160, fill = '#E8A628', stroke = '#2A1810', children, rotate = -6, style = {} }: {
  size?: number; fill?: string; stroke?: string; children?: React.ReactNode; rotate?: number; style?: React.CSSProperties
}) {
  return (
    <div style={{ position: 'relative', width: size, height: size, transform: `rotate(${rotate}deg)`, flexShrink: 0, ...style }}>
      <svg viewBox="0 0 100 100" width={size} height={size} style={{ position: 'absolute', inset: 0 }}>
        <polygon
          points="50,2 56,16 70,8 68,24 84,22 76,36 92,42 78,50 92,58 76,64 84,78 68,76 70,92 56,84 50,98 44,84 30,92 32,76 16,78 24,64 8,58 22,50 8,42 24,36 16,22 32,24 30,8 44,16"
          fill={fill} stroke={stroke} strokeWidth="1.5" strokeLinejoin="round"
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'grid', placeItems: 'center',
        textAlign: 'center', padding: size * 0.2,
      }}>
        {children}
      </div>
    </div>
  )
}

export function WaxSeal({ size = 72, color = '#C83A4E', children, rotate = 0 }: {
  size?: number; color?: string; children?: React.ReactNode; rotate?: number
}) {
  const light = shade(color, 30)
  const dark  = shade(color, -30)
  const vdark = shade(color, -40)
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: `radial-gradient(circle at 35% 30%, ${light}, ${color} 55%, ${dark})`,
      display: 'grid', placeItems: 'center', color: '#FBF3D9',
      fontFamily: 'var(--font-fraunces)', fontWeight: 600,
      textTransform: 'uppercase', letterSpacing: '0.18em', fontSize: 10,
      textAlign: 'center',
      transform: `rotate(${rotate}deg)`,
      boxShadow: `inset -3px -5px 8px ${vdark}88, 2px 3px 0 #2A181044`,
    }}>
      {children}
    </div>
  )
}

export function Stamp({ children, color = '#C83A4E', rotate = -3, style = {} }: {
  children: React.ReactNode; color?: string; rotate?: number; style?: React.CSSProperties
}) {
  return (
    <div style={{
      display: 'inline-block', border: `2.5px solid ${color}`, color,
      padding: '6px 14px', fontFamily: 'var(--font-fraunces)', fontWeight: 900,
      textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 13,
      transform: `rotate(${rotate}deg)`, background: 'transparent',
      ...style,
    }}>
      {children}
    </div>
  )
}

export function DoodleArrow({ w = 120, h = 60, color = '#2A1810', flip = false }: {
  w?: number; h?: number; color?: string; flip?: boolean
}) {
  return (
    <svg viewBox="0 0 120 60" width={w} height={h} style={{ transform: flip ? 'scaleX(-1)' : 'none' }}>
      <path d="M4 12 C 30 4, 70 4, 96 28 C 104 36, 108 46, 110 54" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M100 42 L 112 54 L 98 58" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function TicketStub({ children, bg = '#FBF3D9', border = '#2A1810', style = {} }: {
  children: React.ReactNode; bg?: string; border?: string; style?: React.CSSProperties
}) {
  return (
    <div style={{ position: 'relative', background: bg, border: `1.5px solid ${border}`, padding: '18px 26px', ...style }}>
      <div style={{ position: 'absolute', top: '50%', left: -8, width: 16, height: 16, borderRadius: '50%', background: AC.parchment, border: `1.5px solid ${border}`, transform: 'translateY(-50%)' }} />
      <div style={{ position: 'absolute', top: '50%', right: -8, width: 16, height: 16, borderRadius: '50%', background: AC.parchment, border: `1.5px solid ${border}`, transform: 'translateY(-50%)' }} />
      {children}
    </div>
  )
}

export const paperGrain: React.CSSProperties = {
  backgroundImage: 'radial-gradient(ellipse at 20% 10%, rgba(42,24,16,0.08) 0%, transparent 55%), radial-gradient(ellipse at 80% 60%, rgba(42,24,16,0.06) 0%, transparent 50%), radial-gradient(circle at 45% 35%, rgba(42,24,16,0.04) 0%, transparent 20%)',
}

export const acSerif: React.CSSProperties = {
  fontFamily: 'var(--font-fraunces)',
  fontWeight: 700,
  letterSpacing: '-0.015em',
}

export const acHand: React.CSSProperties = {
  fontFamily: 'var(--font-caveat)',
  fontWeight: 700,
}

export const acSmall: React.CSSProperties = {
  fontFamily: 'var(--font-fraunces)',
  fontWeight: 600,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.18em',
  fontSize: 11,
}
