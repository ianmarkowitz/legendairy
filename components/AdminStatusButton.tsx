'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const NEXT_STATUS: Record<string, string> = {
  paid:          'in_production',
  in_production: 'fulfilled',
}

const BUTTON_LABELS: Record<string, string> = {
  paid:          'Mark In Production',
  in_production: 'Mark Fulfilled',
}

interface Props {
  orderId:       string
  currentStatus: string
  compact?:      boolean  // smaller button for list view
}

export default function AdminStatusButton({ orderId, currentStatus, compact }: Props) {
  const router  = useRouter()
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  const nextStatus = NEXT_STATUS[currentStatus]
  const label      = BUTTON_LABELS[currentStatus]

  if (!nextStatus) return null // fulfilled or cancelled — no action

  async function handleAdvance() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/update-status', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ orderId, newStatus: nextStatus }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Failed to update status.')
      } else {
        router.refresh()
      }
    } catch {
      setError('Network error.')
    } finally {
      setLoading(false)
    }
  }

  if (compact) {
    return (
      <div>
        <button
          onClick={handleAdvance}
          disabled={loading}
          className="
            text-xs font-medium px-3 py-1.5 rounded-lg
            bg-[#0F0F1F] text-[#EDE5D5]
            hover:bg-[#0F0F1F]/80 disabled:opacity-40 disabled:cursor-not-allowed
            transition-colors
          "
        >
          {loading ? '…' : label}
        </button>
        {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
      </div>
    )
  }

  return (
    <div>
      <button
        onClick={handleAdvance}
        disabled={loading}
        className="
          px-5 py-2.5 rounded-xl font-medium text-sm
          bg-[#0F0F1F] text-[#EDE5D5]
          hover:bg-[#0F0F1F]/80 disabled:opacity-40 disabled:cursor-not-allowed
          transition-colors
        "
      >
        {loading ? 'Updating…' : label}
      </button>
      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
    </div>
  )
}
