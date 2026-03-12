'use client'

import { useState } from 'react'
import Link from 'next/link'

function renderBold(text: string) {
  const parts = text.split(/\*\*(.+?)\*\*/)
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : part,
  )
}

interface CreationCardProps {
  id:          string
  flavorName:  string
  tagline:     string
  color:       string
  createdAt:   string
  isVaulted:   boolean
  showVault?:  boolean  // hide vault button on vault page itself
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
    setVaulted(!prev) // optimistic

    try {
      const res = await fetch('/api/vault', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flavorCreationId: id }),
      })
      if (!res.ok) {
        setVaulted(prev) // revert on error
        const { error } = await res.json()
        console.error('Vault toggle failed:', error)
      }
    } catch {
      setVaulted(prev)
    } finally {
      setVaulting(false)
    }
  }

  return (
    <div className="bg-[#0D0D0D] rounded-xl border border-white/8 overflow-hidden hover:border-white/15 transition-colors">

      {/* Color band */}
      <div className="h-1.5" style={{ backgroundColor: color }} />

      <div className="p-5">
        {/* Swatch + name */}
        <div className="flex items-start gap-3 mb-1">
          <div
            className="w-8 h-8 rounded-lg flex-shrink-0 mt-0.5"
            style={{ backgroundColor: color }}
          />
          <div className="min-w-0">
            <h3 className="font-serif text-white font-semibold leading-snug truncate">
              {flavorName}
            </h3>
            <p className="text-sm text-white/40 italic leading-snug line-clamp-2 mt-0.5">
              {renderBold(tagline)}
            </p>
          </div>
        </div>

        <p className="text-[10px] text-white/25 uppercase tracking-[0.2em] mt-3">{date}</p>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-4">
          {showVault && (
            <button
              onClick={toggleVault}
              disabled={vaulting}
              title={vaulted ? 'Remove from Vault' : 'Save to Vault'}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                vaulted
                  ? 'bg-[#C9A96E]/10 text-[#C9A96E] border-[#C9A96E]/40'
                  : 'bg-transparent text-white/40 border-white/10 hover:border-white/30 hover:text-white'
              }`}
            >
              {vaulted ? '♥ Vaulted' : '♡ Vault'}
            </button>
          )}

          <Link
            href={`/flavor/${id}`}
            className="flex-1 text-center text-xs px-3 py-1.5 rounded-lg border border-white/10 text-white/40 hover:border-white/30 hover:text-white transition-colors"
          >
            View
          </Link>

          <Link
            href={`/flavor/${id}`}
            className="flex-1 text-center text-xs px-3 py-1.5 rounded-lg bg-[#C9A96E]/10 text-[#C9A96E] border border-[#C9A96E]/20 font-medium hover:bg-[#C9A96E]/20 transition-colors"
          >
            Re-order →
          </Link>
        </div>
      </div>
    </div>
  )
}
