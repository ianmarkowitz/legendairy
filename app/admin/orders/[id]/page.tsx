import { notFound } from 'next/navigation'
import Link from 'next/link'
import { supabase as serviceClient } from '@/lib/supabase'
import { buildSpecSheet, calculateShipDate, formatShipDate, formatCents } from '@/lib/utils'
import { SUGAR_SCALE_GRAMS } from '@/lib/constants'
import AllergenBadges from '@/components/AllergenBadges'
import AdminStatusButton from '@/components/AdminStatusButton'
import type { FlavorOutput, FlavorCustomizations } from '@/types/flavor'

export const revalidate = 0

const STATUS_STYLES: Record<string, string> = {
  paid:          'bg-amber-100 text-amber-800',
  in_production: 'bg-blue-100 text-blue-800',
  fulfilled:     'bg-green-100 text-green-800',
  cancelled:     'bg-red-100 text-red-800',
  pending:       'bg-gray-100 text-gray-600',
}

const STATUS_LABELS: Record<string, string> = {
  paid:          'Paid',
  in_production: 'In Production',
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

  // For the spec sheet, use the stored sweetness level and all mix-ins as enabled
  // (the "final" customizations are already baked into the DB at order time)
  const customizations: FlavorCustomizations = {
    vegan:            order.delivery_type === 'pickup' ? false : false, // stored in order metadata
    enabledMixIns:    fc.mix_ins?.map((m: { name: string }) => m.name) ?? [],
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
          className="text-sm text-[#1B1B2F]/50 hover:text-[#1B1B2F] transition-colors"
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
            <h1 className="font-serif text-2xl text-[#1B1B2F]">{spec.flavorName}</h1>
          </div>
          <p className="font-serif italic text-[#1B1B2F]/50">{spec.tagline}</p>
          <p className="text-sm text-[#1B1B2F]/50 mt-1">{order.order_reference}</p>
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
        <section className="bg-white rounded-2xl border border-[#1B1B2F]/10 p-6">
          <h2 className="font-serif text-lg text-[#1B1B2F] mb-4">Customer</h2>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <dt className="text-[#1B1B2F]/40 text-xs uppercase tracking-wide mb-0.5">Name</dt>
              <dd className="text-[#1B1B2F]">{order.customer_name || '—'}</dd>
            </div>
            <div>
              <dt className="text-[#1B1B2F]/40 text-xs uppercase tracking-wide mb-0.5">Email</dt>
              <dd className="text-[#1B1B2F]">{order.customer_email || '—'}</dd>
            </div>
            <div>
              <dt className="text-[#1B1B2F]/40 text-xs uppercase tracking-wide mb-0.5">Order Date</dt>
              <dd className="text-[#1B1B2F]">
                {new Date(order.created_at).toLocaleDateString('en-US', {
                  month: 'long', day: 'numeric', year: 'numeric',
                })}
              </dd>
            </div>
            <div>
              <dt className="text-[#1B1B2F]/40 text-xs uppercase tracking-wide mb-0.5">Ship Date</dt>
              <dd className="text-[#1B1B2F] font-medium">{formatShipDate(shipDate)}</dd>
            </div>
            <div>
              <dt className="text-[#1B1B2F]/40 text-xs uppercase tracking-wide mb-0.5">Quantity</dt>
              <dd className="text-[#1B1B2F]">{order.quantity_quarts} qt ({spec.batchCount} batch{spec.batchCount > 1 ? 'es' : ''})</dd>
            </div>
            <div>
              <dt className="text-[#1B1B2F]/40 text-xs uppercase tracking-wide mb-0.5">Total</dt>
              <dd className="text-[#1B1B2F] font-medium">{formatCents(order.total_price_cents)}</dd>
            </div>
            {deliveryAddr ? (
              <div className="col-span-2">
                <dt className="text-[#1B1B2F]/40 text-xs uppercase tracking-wide mb-0.5">Delivery Address</dt>
                <dd className="text-[#1B1B2F]">
                  {deliveryAddr.name && <span className="block">{deliveryAddr.name}</span>}
                  <span className="block">{deliveryAddr.line1}</span>
                  {deliveryAddr.line2 && <span className="block">{deliveryAddr.line2}</span>}
                  <span className="block">{deliveryAddr.city}, {deliveryAddr.state} {deliveryAddr.postal_code}</span>
                </dd>
              </div>
            ) : (
              <div>
                <dt className="text-[#1B1B2F]/40 text-xs uppercase tracking-wide mb-0.5">Fulfillment</dt>
                <dd className="text-[#1B1B2F]">Pickup</dd>
              </div>
            )}
          </dl>
        </section>

        {/* Spec sheet */}
        <section className="bg-white rounded-2xl border border-[#1B1B2F]/10 p-6">
          <h2 className="font-serif text-lg text-[#1B1B2F] mb-1">Production Spec</h2>
          <p className="text-xs text-[#1B1B2F]/40 mb-6 italic">"{fc.customer_prompt}"</p>

          {/* Base */}
          <div className="mb-5">
            <h3 className="text-xs text-[#1B1B2F]/40 uppercase tracking-wide mb-3">Base</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: 'Type',          value: spec.baseType },
                { label: 'Milkfat',       value: spec.milkfatPercent ? `${spec.milkfatPercent}%` : 'N/A' },
                { label: 'Primary Flavor',value: spec.primaryFlavor },
                { label: 'Sweetener',     value: spec.sweetenerType },
                { label: 'Sweetness',     value: `Level ${spec.sweetnessLevel} / 10` },
                { label: 'Sugar / qt base', value: `${sugarGrams}g` },
              ].map(({ label, value }) => (
                <div key={label} className="bg-[#F5F0E8] rounded-xl px-3 py-2.5">
                  <p className="text-xs text-[#1B1B2F]/50 mb-0.5">{label}</p>
                  <p className="text-sm font-medium text-[#1B1B2F]">{value}</p>
                </div>
              ))}
            </div>
            {spec.milkfatRationale && (
              <p className="text-xs text-[#1B1B2F]/40 mt-2 italic">{spec.milkfatRationale}</p>
            )}
          </div>

          {/* Production quantities */}
          <div className="mb-5">
            <h3 className="text-xs text-[#1B1B2F]/40 uppercase tracking-wide mb-3">Production</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Quarts',       value: `${spec.quantityQuarts} qt` },
                { label: 'Batches',      value: `${spec.batchCount}` },
                { label: 'Liquid Base',  value: `${spec.liquidBaseTotalQt} qt` },
              ].map(({ label, value }) => (
                <div key={label} className="bg-[#F5F0E8] rounded-xl px-3 py-2.5 text-center">
                  <p className="font-serif text-2xl text-[#1B1B2F]">{value}</p>
                  <p className="text-xs text-[#1B1B2F]/50 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Mix-ins */}
          <div className="mb-5">
            <h3 className="text-xs text-[#1B1B2F]/40 uppercase tracking-wide mb-3">Mix-Ins</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-[#1B1B2F]/40 border-b border-[#1B1B2F]/10">
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
                      <tr key={mixIn.name} className="border-b border-[#1B1B2F]/5 last:border-0">
                        <td className="py-2.5 pr-4 font-medium text-[#1B1B2F]">{mixIn.name}</td>
                        <td className="py-2.5 pr-4 text-[#1B1B2F]/70">{mixIn.weightGrams}g</td>
                        <td className="py-2.5 pr-4 text-[#1B1B2F]/70">
                          {(mixIn.weightGrams * spec.batchCount * 2).toFixed(0)}g
                        </td>
                        <td className="py-2.5 pr-4 text-[#1B1B2F]/70">
                          {mixIn.foldMethod.replace(/-/g, ' ')}
                        </td>
                        <td className="py-2.5 text-[#1B1B2F]/50 text-xs italic">
                          {mixIn.prepNote ?? '—'}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            {spec.mixIns.filter(m => !spec.enabledMixIns.includes(m.name)).length > 0 && (
              <p className="text-xs text-[#1B1B2F]/30 mt-2 italic">
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
              <h3 className="text-xs text-[#1B1B2F]/40 uppercase tracking-wide mb-2">Maker Notes</h3>
              <p className="text-sm text-[#1B1B2F]/70 bg-[#F5F0E8] rounded-xl px-4 py-3 italic">
                {spec.makerNotes}
              </p>
            </div>
          )}

          {/* Label dedication */}
          {spec.personalNote && (
            <div>
              <h3 className="text-xs text-[#1B1B2F]/40 uppercase tracking-wide mb-2">Label Dedication</h3>
              <p className="text-sm text-[#1B1B2F]/70 bg-[#F5F0E8] rounded-xl px-4 py-3 italic">
                "{spec.personalNote}"
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
