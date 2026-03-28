import { notFound } from 'next/navigation'
import Link from 'next/link'
import { supabase as serviceClient } from '@/lib/supabase'
import { buildSpecSheet, calculateShipDate, formatShipDate, formatCents } from '@/lib/utils'
import { SUGAR_SCALE_GRAMS } from '@/lib/constants'
import AllergenBadges from '@/components/AllergenBadges'
import AdminStatusButton from '@/components/AdminStatusButton'
import TrackingForm from '@/components/TrackingForm'
import type { FlavorOutput, FlavorCustomizations } from '@/types/flavor'

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

interface Props { params: { id: string } }

export default async function AdminOrderDetailPage({ params }: Props) {
  const { data: order } = await serviceClient
    .from('orders')
    .select('*, flavor_creations(*)')
    .eq('id', params.id)
    .single()

  if (!order) notFound()

  const flavorRaw = order.flavor_creations
  const fc = Array.isArray(flavorRaw) ? flavorRaw[0] : flavorRaw

  if (!fc) notFound()

  // Reconstruct FlavorOutput from DB row
  const flavor: FlavorOutput = {
    flavorName:       fc.flavor_name,
    tagline:          fc.tagline,
    description:      fc.description,
    whyThisFlavor:    fc.why_this_flavor,
    milkfatPercent:   fc.milkfat_percent,
    milkfatRationale: fc.milkfat_rationale,
    primaryFlavor:    fc.primary_flavor,
    sweetnessLevel:   fc.sweetness_level,
    sweetenerType:    fc.sweetener_type,
    mixIns:           fc.mix_ins ?? [],
    allergenFlags:    fc.allergen_flags ?? [],
    suggestedColor:   fc.suggested_color ?? '#C4922A',
    makerNotes:       fc.maker_notes ?? '',
  }

  // Use enabled_mix_ins saved on the order (customer's selection at checkout).
  // Fall back to all mix-ins for legacy orders created before this column existed.
  const enabledMixInNames: string[] =
    (order.enabled_mix_ins as string[] | null) ??
    fc.mix_ins?.map((m: { name: string }) => m.name) ?? []

  const customizations: FlavorCustomizations = {
    vegan:            false,
    enabledMixIns:    enabledMixInNames,
    sweetnessLevel:   fc.sweetness_level,
    customFlavorName: fc.flavor_name !== flavor.flavorName ? fc.flavor_name : null,
    personalNote:     fc.personal_note ?? null,
  }

  const spec      = buildSpecSheet(fc.id, fc.customer_prompt, flavor, customizations, order.quantity_quarts)
  const shipDate  = calculateShipDate(new Date(order.created_at))
  const sugarGrams = SUGAR_SCALE_GRAMS[spec.sweetnessLevel] ?? SUGAR_SCALE_GRAMS[5]

  const deliveryAddr = order.delivery_address as {
    name?: string; line1: string; line2?: string;
    city: string; state: string; postal_code: string;
  } | null

  return (
    <div className="max-w-3xl">
      {/* Back + header */}
      <div className="mb-6">
        <Link
          href="/admin/orders"
          className="text-sm text-[#0F0F1F]/50 hover:text-[#0F0F1F] transition-colors"
        >
          ← All orders
        </Link>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div
              className="w-8 h-8 rounded-lg flex-shrink-0"
              style={{ backgroundColor: flavor.suggestedColor }}
            />
            <h1 className="font-serif text-2xl text-[#0F0F1F]">{spec.flavorName}</h1>
          </div>
          <p className="font-serif italic text-[#0F0F1F]/50">{spec.tagline}</p>
          <p className="text-sm text-[#0F0F1F]/50 mt-1">{order.order_reference}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-sm font-medium px-3 py-1.5 rounded-full ${STATUS_STYLES[order.status] ?? STATUS_STYLES.pending}`}>
            {STATUS_LABELS[order.status] ?? order.status}
          </span>
          <AdminStatusButton orderId={order.id} currentStatus={order.status} />
        </div>
      </div>

      <div className="space-y-6">

        {/* Customer & delivery */}
        <section className="bg-white rounded-2xl border border-[#0F0F1F]/10 p-6">
          <h2 className="font-serif text-lg text-[#0F0F1F] mb-4">Customer</h2>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <dt className="text-[#0F0F1F]/40 text-xs uppercase tracking-wide mb-0.5">Name</dt>
              <dd className="text-[#0F0F1F]">{order.customer_name || '—'}</dd>
            </div>
            <div>
              <dt className="text-[#0F0F1F]/40 text-xs uppercase tracking-wide mb-0.5">Email</dt>
              <dd className="text-[#0F0F1F]">{order.customer_email || '—'}</dd>
            </div>
            <div>
              <dt className="text-[#0F0F1F]/40 text-xs uppercase tracking-wide mb-0.5">Order Date</dt>
              <dd className="text-[#0F0F1F]">
                {new Date(order.created_at).toLocaleDateString('en-US', {
                  month: 'long', day: 'numeric', year: 'numeric',
                })}
              </dd>
            </div>
            <div>
              <dt className="text-[#0F0F1F]/40 text-xs uppercase tracking-wide mb-0.5">Ship Date</dt>
              <dd className="text-[#0F0F1F] font-medium">{formatShipDate(shipDate)}</dd>
            </div>
            <div>
              <dt className="text-[#0F0F1F]/40 text-xs uppercase tracking-wide mb-0.5">Quantity</dt>
              <dd className="text-[#0F0F1F]">{order.quantity_quarts} qt ({spec.batchCount} batch{spec.batchCount > 1 ? 'es' : ''})</dd>
            </div>
            <div>
              <dt className="text-[#0F0F1F]/40 text-xs uppercase tracking-wide mb-0.5">Total</dt>
              <dd className="text-[#0F0F1F] font-medium">{formatCents(order.total_price_cents)}</dd>
            </div>
            {deliveryAddr ? (
              <div className="col-span-2">
                <dt className="text-[#0F0F1F]/40 text-xs uppercase tracking-wide mb-0.5">Delivery Address</dt>
                <dd className="text-[#0F0F1F]">
                  {deliveryAddr.name && <span className="block">{deliveryAddr.name}</span>}
                  <span className="block">{deliveryAddr.line1}</span>
                  {deliveryAddr.line2 && <span className="block">{deliveryAddr.line2}</span>}
                  <span className="block">{deliveryAddr.city}, {deliveryAddr.state} {deliveryAddr.postal_code}</span>
                </dd>
              </div>
            ) : (
              <div>
                <dt className="text-[#0F0F1F]/40 text-xs uppercase tracking-wide mb-0.5">Fulfillment</dt>
                <dd className="text-[#0F0F1F]">Pickup</dd>
              </div>
            )}

            {/* Tracking info — shown when shipped */}
            {order.status === 'shipped' && order.tracking_number && (
              <div className="col-span-2">
                <dt className="text-[#0F0F1F]/40 text-xs uppercase tracking-wide mb-1">Tracking</dt>
                <dd className="flex items-center gap-3 flex-wrap">
                  {order.tracking_carrier && (
                    <span className="text-xs font-medium bg-[#0F0F1F]/5 text-[#0F0F1F]/70 px-2 py-0.5 rounded">
                      {order.tracking_carrier}
                    </span>
                  )}
                  <span className="text-[#0F0F1F] font-mono font-semibold">{order.tracking_number}</span>
                  {order.tracking_carrier && order.tracking_carrier !== 'Other' && (() => {
                    const n = encodeURIComponent(order.tracking_number)
                    const urls: Record<string, string> = {
                      UPS:   `https://www.ups.com/track?tracknum=${n}`,
                      USPS:  `https://tools.usps.com/go/TrackConfirmAction?qtc_tLabels1=${n}`,
                      FedEx: `https://www.fedex.com/apps/fedextrack/?tracknumbers=${n}`,
                    }
                    const url = urls[order.tracking_carrier]
                    return url ? (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[#D4A843] hover:underline"
                      >
                        Track on {order.tracking_carrier} →
                      </a>
                    ) : null
                  })()}
                </dd>
                {order.shipped_at && (
                  <dd className="text-[#0F0F1F]/40 text-xs mt-1">
                    Shipped {new Date(order.shipped_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </dd>
                )}
              </div>
            )}
          </dl>

          {/* Mark as Shipped form — shown when in_production */}
          {order.status === 'in_production' && (
            <TrackingForm orderId={order.id} />
          )}
        </section>

        {/* Spec sheet */}
        <section className="bg-white rounded-2xl border border-[#0F0F1F]/10 p-6">
          <h2 className="font-serif text-lg text-[#0F0F1F] mb-1">Production Spec</h2>
          <p className="text-xs text-[#0F0F1F]/40 mb-6 italic">"{fc.customer_prompt}"</p>

          {/* Base */}
          <div className="mb-5">
            <h3 className="text-xs text-[#0F0F1F]/40 uppercase tracking-wide mb-3">Base</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: 'Type',          value: spec.baseType },
                { label: 'Milkfat',       value: spec.milkfatPercent ? `${spec.milkfatPercent}%` : 'N/A' },
                { label: 'Primary Flavor',value: spec.primaryFlavor },
                { label: 'Sweetener',     value: spec.sweetenerType },
                { label: 'Sweetness',     value: `Level ${spec.sweetnessLevel} / 10` },
                { label: 'Sugar / qt base', value: `${sugarGrams}g` },
              ].map(({ label, value }) => (
                <div key={label} className="bg-[#EDE5D5] rounded-xl px-3 py-2.5">
                  <p className="text-xs text-[#0F0F1F]/50 mb-0.5">{label}</p>
                  <p className="text-sm font-medium text-[#0F0F1F]">{value}</p>
                </div>
              ))}
            </div>
            {spec.milkfatRationale && (
              <p className="text-xs text-[#0F0F1F]/40 mt-2 italic">{spec.milkfatRationale}</p>
            )}
          </div>

          {/* Production quantities */}
          <div className="mb-5">
            <h3 className="text-xs text-[#0F0F1F]/40 uppercase tracking-wide mb-3">Production</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Quarts',       value: `${spec.quantityQuarts} qt` },
                { label: 'Batches',      value: `${spec.batchCount}` },
                { label: 'Liquid Base',  value: `${spec.liquidBaseTotalQt} qt` },
              ].map(({ label, value }) => (
                <div key={label} className="bg-[#EDE5D5] rounded-xl px-3 py-2.5 text-center">
                  <p className="font-serif text-2xl text-[#0F0F1F]">{value}</p>
                  <p className="text-xs text-[#0F0F1F]/50 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Mix-ins */}
          <div className="mb-5">
            <h3 className="text-xs text-[#0F0F1F]/40 uppercase tracking-wide mb-3">Mix-Ins</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-[#0F0F1F]/40 border-b border-[#0F0F1F]/10">
                    <th className="pb-2 pr-4 font-medium">Ingredient</th>
                    <th className="pb-2 pr-4 font-medium">g / qt</th>
                    <th className="pb-2 pr-4 font-medium">Batch total</th>
                    <th className="pb-2 pr-4 font-medium">Method</th>
                    <th className="pb-2 font-medium">Prep Note</th>
                  </tr>
                </thead>
                <tbody>
                  {spec.mixIns
                    .filter(m => spec.enabledMixIns.includes(m.name))
                    .map(mixIn => (
                      <tr key={mixIn.name} className="border-b border-[#0F0F1F]/5 last:border-0">
                        <td className="py-2.5 pr-4 font-medium text-[#0F0F1F]">{mixIn.name}</td>
                        <td className="py-2.5 pr-4 text-[#0F0F1F]/70">{mixIn.weightGrams}g</td>
                        <td className="py-2.5 pr-4 text-[#0F0F1F]/70">
                          {(mixIn.weightGrams * spec.batchCount * 2).toFixed(0)}g
                        </td>
                        <td className="py-2.5 pr-4 text-[#0F0F1F]/70">
                          {mixIn.foldMethod.replace(/-/g, ' ')}
                        </td>
                        <td className="py-2.5 text-[#0F0F1F]/50 text-xs italic">
                          {mixIn.prepNote ?? '—'}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            {spec.mixIns.filter(m => !spec.enabledMixIns.includes(m.name)).length > 0 && (
              <p className="text-xs text-[#0F0F1F]/30 mt-2 italic">
                Excluded: {spec.mixIns.filter(m => !spec.enabledMixIns.includes(m.name)).map(m => m.name).join(', ')}
              </p>
            )}
          </div>

          {/* Allergens */}
          {spec.allergenFlags.length > 0 && (
            <div className="mb-5">
              <AllergenBadges flags={spec.allergenFlags} />
            </div>
          )}

          {/* Maker notes */}
          {spec.makerNotes && (
            <div className="mb-5">
              <h3 className="text-xs text-[#0F0F1F]/40 uppercase tracking-wide mb-2">Maker Notes</h3>
              <p className="text-sm text-[#0F0F1F]/70 bg-[#EDE5D5] rounded-xl px-4 py-3 italic">
                {spec.makerNotes}
              </p>
            </div>
          )}

          {/* Label dedication */}
          {spec.personalNote && (
            <div>
              <h3 className="text-xs text-[#0F0F1F]/40 uppercase tracking-wide mb-2">Label Dedication</h3>
              <p className="text-sm text-[#0F0F1F]/70 bg-[#EDE5D5] rounded-xl px-4 py-3 italic">
                "{spec.personalNote}"
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
