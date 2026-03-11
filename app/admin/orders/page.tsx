import Link from 'next/link'
import { supabase as serviceClient } from '@/lib/supabase'
import { formatCents } from '@/lib/utils'
import AdminStatusButton from '@/components/AdminStatusButton'

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

const FILTER_TABS = [
  { label: 'All',           value: ''             },
  { label: 'Paid',          value: 'paid'         },
  { label: 'In Production', value: 'in_production'},
  { label: 'Shipped',       value: 'shipped'      },
  { label: 'Cancelled',     value: 'cancelled'    },
]

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

interface Props {
  searchParams: { status?: string }
}

export default async function AdminOrdersPage({ searchParams }: Props) {
  const statusFilter = searchParams.status ?? ''

  // Fetch all orders for stats (always unfiltered)
  const { data: allOrders } = await serviceClient
    .from('orders')
    .select('status, total_price_cents')

  const totalOrders   = allOrders?.length ?? 0
  const totalRevenue  = allOrders
    ?.filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (o.total_price_cents ?? 0), 0) ?? 0
  const needsAction   = allOrders?.filter(o => o.status === 'paid').length ?? 0
  const fulfilledCount = allOrders?.filter(o => o.status === 'fulfilled').length ?? 0

  // Fetch filtered orders for the table
  let query = serviceClient
    .from('orders')
    .select(`
      id, order_reference, customer_name, customer_email,
      quantity_quarts, total_price_cents, status, created_at,
      flavor_creation_id,
      flavor_creations ( flavor_name, suggested_color )
    `)
    .order('created_at', { ascending: false })

  if (statusFilter) {
    query = query.eq('status', statusFilter)
  }

  const { data: orders } = await query

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-serif text-[#1B1B2F]">Orders</h1>
        <p className="text-sm text-[#1B1B2F]/50 mt-0.5">Manage and fulfill incoming ice cream orders</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-[#1B1B2F]/10 px-5 py-4">
          <p className="text-xs text-[#1B1B2F]/50 uppercase tracking-wide mb-1">Total Orders</p>
          <p className="font-serif text-3xl text-[#1B1B2F]">{totalOrders}</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#1B1B2F]/10 px-5 py-4">
          <p className="text-xs text-[#1B1B2F]/50 uppercase tracking-wide mb-1">Revenue</p>
          <p className="font-serif text-3xl text-[#1B1B2F]">{formatCents(totalRevenue)}</p>
        </div>
        <div className={`rounded-2xl border px-5 py-4 ${
          needsAction > 0
            ? 'bg-amber-50 border-amber-200'
            : 'bg-white border-[#1B1B2F]/10'
        }`}>
          <p className={`text-xs uppercase tracking-wide mb-1 ${needsAction > 0 ? 'text-amber-700' : 'text-[#1B1B2F]/50'}`}>
            Needs Action
          </p>
          <p className={`font-serif text-3xl ${needsAction > 0 ? 'text-amber-800' : 'text-[#1B1B2F]'}`}>
            {needsAction}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-[#1B1B2F]/10 px-5 py-4">
          <p className="text-xs text-[#1B1B2F]/50 uppercase tracking-wide mb-1">Fulfilled</p>
          <p className="font-serif text-3xl text-[#1B1B2F]">{fulfilledCount}</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-6 border-b border-[#1B1B2F]/10 pb-0">
        {FILTER_TABS.map(tab => (
          <Link
            key={tab.value}
            href={tab.value ? `/admin/orders?status=${tab.value}` : '/admin/orders'}
            className={`
              px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 -mb-px transition-colors
              ${statusFilter === tab.value
                ? 'border-[#1B1B2F] text-[#1B1B2F]'
                : 'border-transparent text-[#1B1B2F]/50 hover:text-[#1B1B2F]'}
            `}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Order table */}
      {!orders || orders.length === 0 ? (
        <div className="text-center py-20 text-[#1B1B2F]/40">
          <p className="text-4xl mb-3">📋</p>
          <p className="font-serif text-lg">No orders {statusFilter ? `with status "${STATUS_LABELS[statusFilter]}"` : 'yet'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => {
            const flavorRaw = order.flavor_creations
            const flavor = Array.isArray(flavorRaw) ? flavorRaw[0] : flavorRaw

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-[#1B1B2F]/10 p-5"
              >
                <div className="flex items-start gap-4">
                  {/* Color swatch */}
                  <div
                    className="w-12 h-12 rounded-xl flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: flavor?.suggested_color ?? '#C4922A' }}
                  />

                  {/* Main info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start gap-x-4 gap-y-1">
                      <div>
                        <p className="font-serif font-semibold text-[#1B1B2F]">
                          {flavor?.flavor_name ?? 'Custom Flavor'}
                        </p>
                        <p className="text-xs text-[#1B1B2F]/50 mt-0.5">
                          {order.order_reference} · {formatDate(order.created_at)}
                        </p>
                      </div>
                      <div className="text-sm text-[#1B1B2F]/70">
                        <p>{order.customer_name}</p>
                        <p className="text-[#1B1B2F]/40 text-xs">{order.customer_email}</p>
                      </div>
                      <div className="text-sm text-[#1B1B2F]/70">
                        <p>{order.quantity_quarts} qt</p>
                        <p className="text-[#1B1B2F]/40 text-xs">{formatCents(order.total_price_cents)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLES[order.status] ?? STATUS_STYLES.pending}`}>
                      {STATUS_LABELS[order.status] ?? order.status}
                    </span>
                    <div className="flex items-center gap-2">
                      <AdminStatusButton orderId={order.id} currentStatus={order.status} compact />
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-xs text-[#1B1B2F]/50 hover:text-[#1B1B2F] underline underline-offset-2 transition-colors"
                      >
                        View Spec →
                      </Link>
                    </div>
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
