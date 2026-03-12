import { createClient } from '@/lib/supabase-server'
import { supabase as serviceClient } from '@/lib/supabase'
import Link from 'next/link'

export const revalidate = 0

const STATUS_STYLES: Record<string, string> = {
  paid:          'bg-amber-100 text-amber-800',
  in_production: 'bg-blue-100 text-blue-800',
  shipped:       'bg-purple-100 text-purple-800',
  fulfilled:     'bg-green-100 text-green-800',
  cancelled:     'bg-red-100 text-red-800',
  pending:       'bg-gray-100 text-gray-600',
}

const STATUS_LABELS: Record<string, string> = {
  paid:          'Paid',
  in_production: 'In Production',
  shipped:       'Shipped',
  fulfilled:     'Fulfilled',
  cancelled:     'Cancelled',
  pending:       'Pending',
}

function formatCents(cents: number) {
  return `$${(cents / 100).toFixed(2)}`
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

export default async function OrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Match orders by email (covers pre-auth orders) and by user_id
  const { data: orders } = await serviceClient
    .from('orders')
    .select(`
      id, order_reference, quantity_quarts, total_price_cents,
      status, created_at, flavor_creation_id,
      flavor_creations ( flavor_name, suggested_color )
    `)
    .eq('customer_email', user.email!)
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-serif text-[#0F0F1F]">My Orders</h1>
        <p className="text-sm text-[#0F0F1F]/50 mt-0.5">Your order history</p>
      </div>

      {!orders || orders.length === 0 ? (
        <div className="text-center py-20 text-[#0F0F1F]/40">
          <p className="text-4xl mb-4">📦</p>
          <p className="text-lg font-serif mb-2">No orders yet</p>
          <p className="text-sm mb-6">Your orders will appear here after checkout.</p>
          <Link href="/" className="text-[#0F0F1F] underline underline-offset-2 text-sm">
            Create your first flavor →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => {
            // Supabase returns joined rows as an array; unwrap the first (and only) row
            const flavorRaw = order.flavor_creations
            const flavor = Array.isArray(flavorRaw) ? flavorRaw[0] : flavorRaw
            const statusStyle = STATUS_STYLES[order.status] ?? STATUS_STYLES.pending
            const statusLabel = STATUS_LABELS[order.status] ?? order.status

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-[#0F0F1F]/10 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Color swatch */}
                    <div
                      className="w-10 h-10 rounded-xl flex-shrink-0"
                      style={{ backgroundColor: flavor?.suggested_color ?? '#C4922A' }}
                    />
                    <div className="min-w-0">
                      <p className="font-serif font-semibold text-[#0F0F1F] truncate">
                        {flavor?.flavor_name ?? 'Custom Flavor'}
                      </p>
                      <p className="text-xs text-[#0F0F1F]/50 mt-0.5">
                        {order.order_reference} · {order.quantity_quarts} qt · {formatCents(order.total_price_cents)}
                      </p>
                      <p className="text-xs text-[#0F0F1F]/40 mt-0.5">
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusStyle}`}>
                      {statusLabel}
                    </span>
                    {order.flavor_creation_id && (
                      <Link
                        href={`/flavor/${order.flavor_creation_id}`}
                        className="text-xs text-[#0F0F1F]/50 hover:text-[#0F0F1F] underline underline-offset-2 transition-colors"
                      >
                        Re-order →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
