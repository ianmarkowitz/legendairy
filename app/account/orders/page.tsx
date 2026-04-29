import { createClient } from '@/lib/supabase-server'
import { supabase as serviceClient } from '@/lib/supabase'
import Link from 'next/link'
import { AC, paperGrain, Stamp, ScoopDoodle } from '@/components/ac-primitives'

export const revalidate = 0

const FF = { serif: 'var(--font-fraunces)', hand: 'var(--font-caveat)' }

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  paid:          { bg: AC.marigold,  color: AC.ink   },
  in_production: { bg: AC.sky,       color: AC.ink   },
  shipped:       { bg: AC.pist,      color: AC.cream },
  fulfilled:     { bg: AC.pist,      color: AC.cream },
  cancelled:     { bg: AC.cherry,    color: AC.cream },
  pending:       { bg: `${AC.ink}22`, color: AC.ink  },
}

const STATUS_LABELS: Record<string, string> = {
  paid:          'Paid',
  in_production: 'In Production',
  shipped:       'Shipped',
  fulfilled:     'Fulfilled',
  cancelled:     'Cancelled',
  pending:       'Pending',
}

function formatCents(cents: number) { return `$${(cents / 100).toFixed(2)}` }
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default async function OrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

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
    <div style={{ ...paperGrain }}>

      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <span style={{ fontFamily: FF.hand, fontSize: 20, color: AC.rasp, display: 'block', transform: 'rotate(-1deg)', marginBottom: 4 }}>
          — every pint you&apos;ve ordered —
        </span>
        <h1 style={{ fontFamily: FF.serif, fontStyle: 'italic', fontSize: 'clamp(40px, 6vw, 64px)', color: AC.ink, margin: 0, lineHeight: 0.95, letterSpacing: '-0.02em' }}>
          My Orders
        </h1>
      </div>

      {!orders || orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 24px' }}>
          <ScoopDoodle size={80} fill={AC.parchment} color={`${AC.ink}44`} />
          <h2 style={{ fontFamily: FF.serif, fontStyle: 'italic', fontSize: 28, color: AC.ink, margin: '20px 0 10px' }}>
            No orders yet
          </h2>
          <p style={{ fontFamily: FF.hand, fontSize: 20, color: AC.rasp, margin: '0 0 28px', transform: 'rotate(-1deg)', display: 'inline-block' }}>
            Your orders will appear here after checkout.
          </p>
          <div>
            <Link href="/" style={{ fontFamily: FF.serif, fontSize: 14, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: AC.ink, textDecoration: 'none', borderBottom: `2px solid ${AC.marigold}`, paddingBottom: 2 }}>
              Create your first flavor →
            </Link>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {orders.map((order, i) => {
            const flavorRaw = order.flavor_creations
            const flavor = Array.isArray(flavorRaw) ? flavorRaw[0] : flavorRaw
            const sc = STATUS_COLORS[order.status] ?? STATUS_COLORS.pending
            const label = STATUS_LABELS[order.status] ?? order.status

            return (
              <div key={order.id} style={{ background: AC.cream, border: `2px solid ${AC.ink}`, padding: '20px 24px', boxShadow: `4px 4px 0 ${AC.ink}`, transform: `rotate(${['-0.4deg', '0.3deg', '-0.2deg'][i % 3]})`, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>

                {/* Color swatch */}
                <div style={{ width: 48, height: 48, flexShrink: 0, borderRadius: 4, border: `2px solid ${AC.ink}`, background: flavor?.suggested_color ?? AC.marigold }} />

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: FF.serif, fontStyle: 'italic', fontSize: 18, fontWeight: 700, color: AC.ink, margin: '0 0 4px', lineHeight: 1.1 }}>
                    {flavor?.flavor_name ?? 'Custom Flavor'}
                  </p>
                  <p style={{ fontFamily: FF.hand, fontSize: 14, color: `${AC.ink}77`, margin: 0 }}>
                    {order.order_reference} · {order.quantity_quarts} qt · {formatCents(order.total_price_cents)}
                  </p>
                  <p style={{ fontFamily: FF.hand, fontSize: 13, color: `${AC.ink}55`, margin: '2px 0 0' }}>
                    {formatDate(order.created_at)}
                  </p>
                </div>

                {/* Status + re-order */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                  <Stamp color={sc.color === AC.ink ? AC.ink : sc.bg} rotate={[-1.5, 1, -0.8][i % 3]} style={{ fontSize: 10, background: sc.bg, color: sc.color, borderColor: AC.ink }}>
                    {label}
                  </Stamp>
                  {order.flavor_creation_id && (
                    <Link href={`/flavor/${order.flavor_creation_id}`} style={{ fontFamily: FF.hand, fontSize: 14, color: AC.rasp, textDecoration: 'none' }}>
                      Re-order →
                    </Link>
                  )}
                </div>

              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
