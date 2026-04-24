'use client'

import { useState } from 'react'
import Link from 'next/link'

const C = {
  parchment: '#F1E1BC',
  cream:     '#FBF3D9',
  ink:       '#2A1810',
  rasp:      '#C83A4E',
  pist:      '#6B8E3D',
  marigold:  '#E8A628',
  cherry:    '#8A1F2B',
}

const fraunces = 'var(--font-fraunces)'
const caveat   = 'var(--font-caveat)'

// Build a lighter tint of a hex color for the radial gradient top
function lightenHex(hex: string, amount = 60): string {
  const h = hex.replace('#', '')
  const r = Math.min(255, parseInt(h.slice(0, 2), 16) + amount)
  const g = Math.min(255, parseInt(h.slice(2, 4), 16) + amount)
  const b = Math.min(255, parseInt(h.slice(4, 6), 16) + amount)
  return `rgb(${r},${g},${b})`
}

interface CreationCardProps {
  id:          string
  flavorName:  string
  tagline:     string
  color:       string
  createdAt:   string
  isVaulted:   boolean
  showVault?:  boolean
}

export default function CreationCard({
  id, flavorName, tagline, color, createdAt, isVaulted, showVault = true,
}: CreationCardProps) {
  const [vaulted,  setVaulted]  = useState(isVaulted)
  const [vaulting, setVaulting] = useState(false)

  const date = new Date(createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })

  async function toggleVault() {
    setVaulting(true)
    const prev = vaulted
    setVaulted(!prev)

    try {
      const res = await fetch('/api/vault', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ flavorCreationId: id }),
      })
      if (!res.ok) {
        setVaulted(prev)
        const { error } = await res.json()
        console.error('Vault toggle failed:', error)
      }
    } catch {
      setVaulted(prev)
    } finally {
      setVaulting(false)
    }
  }

  const lightColor = lightenHex(color, 55)

  return (
    <div style={{
      background:  C.cream,
      border:      `2px solid ${C.ink}`,
      transform:   'rotate(1deg)',
      boxShadow:   `4px 4px 0 ${C.ink}`,
      overflow:    'hidden',
    }}>

      {/* ── Color image area (aspect-ratio 3/4) ── */}
      <div style={{
        aspectRatio: '3/4',
        position:    'relative',
        background:  `radial-gradient(ellipse at 40% 30%, ${lightColor} 0%, ${color} 100%)`,
        overflow:    'hidden',
      }}>

        {/* Hatch-line overlay — CSS repeating-linear-gradient */}
        <div style={{
          position:   'absolute',
          inset:      0,
          background: 'repeating-linear-gradient(135deg, transparent 0px, transparent 6px, rgba(42,24,16,0.07) 6px, rgba(42,24,16,0.07) 7px)',
          pointerEvents: 'none',
        }} />

        {/* Top-left label: "Vol. I" */}
        <div style={{
          position:      'absolute',
          top:            10,
          left:           10,
          background:    C.cream,
          border:        `1.5px solid ${C.ink}`,
          padding:       '3px 8px',
          display:       'flex',
          alignItems:    'center',
          gap:            6,
        }}>
          <span style={{
            fontFamily:    fraunces,
            fontSize:      9,
            textTransform: 'uppercase',
            letterSpacing: '0.18em',
            color:         C.ink,
            fontWeight:    700,
          }}>
            Vol. I
          </span>
        </div>

        {/* Vault stamp — top-right, only when vaulted */}
        {vaulted && (
          <div style={{
            position:       'absolute',
            top:             10,
            right:           10,
            background:     C.rasp,
            border:         `1.5px solid ${C.ink}`,
            padding:        '3px 7px',
            transform:      'rotate(2deg)',
          }}>
            <span style={{
              fontFamily:    fraunces,
              fontSize:      8,
              textTransform: 'uppercase',
              letterSpacing: '0.16em',
              color:         C.cream,
              fontWeight:    700,
            }}>
              ♥ Vaulted
            </span>
          </div>
        )}

        {/* Bottom gradient scrim + text */}
        <div style={{
          position:   'absolute',
          bottom:     0,
          left:       0,
          right:      0,
          padding:    '32px 14px 14px',
          background: 'linear-gradient(to top, rgba(42,24,16,0.72) 0%, transparent 100%)',
        }}>
          {/* Flavor name */}
          <h3 style={{
            fontFamily:    fraunces,
            fontSize:      18,
            fontStyle:     'italic',
            fontWeight:    900,
            color:         C.cream,
            lineHeight:    1.1,
            margin:        '0 0 4px',
            letterSpacing: '-0.01em',
          }}>
            {flavorName}
          </h3>

          {/* Tagline */}
          <p style={{
            fontFamily: caveat,
            fontSize:   13,
            color:      C.cream,
            opacity:    0.78,
            margin:     0,
            lineHeight: 1.3,
          }}>
            {tagline}
          </p>
        </div>
      </div>

      {/* ── Card footer ── */}
      <div style={{ padding: '12px 14px 14px' }}>

        {/* Date + Re-churn row */}
        <div style={{
          display:        'flex',
          justifyContent: 'space-between',
          alignItems:     'center',
          marginBottom:   10,
        }}>
          <span style={{
            fontFamily:    fraunces,
            fontSize:      9,
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            color:         C.ink,
            opacity:       0.42,
          }}>
            {date}
          </span>
          <Link href={`/flavor/${id}`} style={{
            fontFamily:    fraunces,
            fontSize:      12,
            fontWeight:    600,
            color:         C.rasp,
            textDecoration: 'none',
            letterSpacing: '0.02em',
          }}>
            Re-churn ↻
          </Link>
        </div>

        {/* Vault toggle button */}
        {showVault && (
          <button
            onClick={toggleVault}
            disabled={vaulting}
            title={vaulted ? 'Remove from Vault' : 'Save to Vault'}
            style={{
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              width:          '100%',
              padding:        '8px 12px',
              fontFamily:     fraunces,
              fontSize:       12,
              fontWeight:     700,
              letterSpacing:  '0.06em',
              textTransform:  'uppercase',
              cursor:         vaulting ? 'wait' : 'pointer',
              transition:     'opacity 0.15s',
              opacity:        vaulting ? 0.5 : 1,
              ...(vaulted ? {
                background: 'transparent',
                color:      C.rasp,
                border:     `1.5px solid ${C.rasp}`,
              } : {
                background: 'transparent',
                color:      C.ink,
                border:     `1.5px solid ${C.ink}`,
                opacity:    vaulting ? 0.5 : 0.55,
              }),
            }}
          >
            {vaulted ? '♥ Vaulted' : '♡ Vault'}
          </button>
        )}

      </div>
    </div>
  )
}
