'use client'

import { useState } from 'react'
import Link from 'next/link'

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
    <div className="bg-white rounded-2xl border border-[#1B1B2F]/10 overflow-hidden hover:shadow-md transition-shadow">

      {/* Color band */}
      <div className="h-2" style={{ backgroundColor: color }} />

      <div className="p-5">
        {/* Swatch + name */}
        <div className="flex items-start gap-3 mb-1">
          <div
            className="w-8 h-8 rounded-lg flex-shrink-0 mt-0.5"
            style={{ backgroundColor: color }}
          />
          <div className="min-w-0">
            <h3 className="font-serif text-[#1B1B2F] font-semibold leading-snug truncate">
              {flavorName}
            </h3>
            <p className="text-sm text-[#1B1B2F]/60 italic leading-snug line-clamp-2 mt-0.5">
              {tagline}
            </p>
          </div>
        </div>

        <p className="text-xs text-[#1B1B2F]/40 mt-3">{date}</p>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-4">
          {showVault && (
            <button
              onClick={toggleVault}
              disabled={vaulting}
              title={vaulted ? 'Remove from Vault' : 'Save to Vault'}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                vaulted
                  ? 'bg-[#1B1B2F] text-[#F5F0E8] border-[#1B1B2F]'
                  : 'bg-transparent text-[#1B1B2F]/50 border-[#1B1B2F]/20 hover:border-[#1B1B2F]/50'
              }`}
            >
              {vaulted ? '♥ Vaulted' : '♡ Vault'}
            </button>
          )}

          <Link
            href={`/flavor/${id}`}
            className="flex-1 text-center text-xs px-3 py-1.5 rounded-lg border border-[#1B1B2F]/20 text-[#1B1B2F]/70 hover:border-[#1B1B2F]/50 hover:text-[#1B1B2F] transition-colors"
          >
            View
          </Link>

          <Link
            href={`/flavor/${id}`}
            className="flex-1 text-center text-xs px-3 py-1.5 rounded-lg bg-[#1B1B2F]/5 text-[#1B1B2F] font-medium hover:bg-[#1B1B2F]/10 transition-colors"
          >
            Re-order →
          </Link>
        </div>
      </div>
    </div>
  )
}
