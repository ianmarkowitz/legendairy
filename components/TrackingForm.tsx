'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const CARRIERS = ['UPS', 'USPS', 'FedEx', 'Other'] as const
type Carrier = typeof CARRIERS[number]

interface Props {
  orderId: string
}

export default function TrackingForm({ orderId }: Props) {
  const router = useRouter()
  const [carrier,        setCarrier]        = useState<Carrier>('UPS')
  const [trackingNumber, setTrackingNumber] = useState('')
  const [loading,        setLoading]        = useState(false)
  const [error,          setError]          = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!trackingNumber.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/mark-shipped', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ orderId, carrier, trackingNumber: trackingNumber.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Failed to mark as shipped.')
      } else {
        router.refresh()
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
      <p className="text-sm font-medium text-amber-900 mb-3">Mark as Shipped</p>
      <div className="flex gap-2">
        <select
          value={carrier}
          onChange={e => setCarrier(e.target.value as Carrier)}
          className="
            border border-amber-300 rounded-lg px-3 py-2 text-sm
            bg-white text-[#0F0F1F]
            focus:outline-none focus:border-[#0F0F1F]
          "
        >
          {CARRIERS.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <input
          type="text"
          value={trackingNumber}
          onChange={e => setTrackingNumber(e.target.value)}
          placeholder="Tracking number"
          required
          className="
            flex-1 border border-amber-300 rounded-lg px-3 py-2 text-sm
            bg-white text-[#0F0F1F] placeholder:text-[#0F0F1F]/30
            focus:outline-none focus:border-[#0F0F1F]
          "
        />
        <button
          type="submit"
          disabled={loading || !trackingNumber.trim()}
          className="
            px-4 py-2 bg-[#0F0F1F] text-[#EDE5D5] text-sm font-medium rounded-lg
            hover:bg-[#0F0F1F]/80 disabled:opacity-40 disabled:cursor-not-allowed
            transition-colors whitespace-nowrap
          "
        >
          {loading ? '…' : 'Ship & Notify Customer'}
        </button>
      </div>
      {error && <p className="text-red-600 text-xs mt-2">{error}</p>}
    </form>
  )
}
