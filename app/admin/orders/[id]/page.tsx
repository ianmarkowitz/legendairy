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

  // ─── palette ────────────────────────────────────────────────────────────────
  const parchment = '#F1E1BC'
  const cream     = '#FBF3D9'
  const ink       = '#2A1810'
  const rasp      = '#C83A4E'
  const marigold  = '#E8A628'
  const cherry    = '#8A1F2B'

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: parchment,
        backgroundImage: 'radial-gradient(ellipse at 20% 10%, rgba(42,24,16,0.08) 0%, transparent 55%), radial-gradient(ellipse at 80% 60%, rgba(42,24,16,0.06) 0%, transparent 50%)',
        fontFamily: 'var(--font-fraunces), Georgia, serif',
        color: ink,
        padding: '0 0 64px 0',
      }}
    >

      {/* ── Header bar ─────────────────────────────────────────────────────── */}
      <header
        style={{
          borderBottom: `2px solid ${ink}`,
          backgroundColor: parchment,
          padding: '0 32px',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          backgroundImage: 'radial-gradient(ellipse at 20% 10%, rgba(42,24,16,0.08) 0%, transparent 55%)',
        }}
      >
        <div
          style={{
            maxWidth: 960,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            height: 60,
          }}
        >
          {/* Left: wordmark + nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            <Link
              href="/admin/orders"
              style={{
                fontFamily: 'var(--font-fraunces)',
                fontStyle: 'italic',
                fontWeight: 700,
                fontSize: 16,
                color: ink,
                textDecoration: 'none',
                letterSpacing: '-0.01em',
              }}
            >
              Legendairy / Kitchen
            </Link>
            <nav style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
              {[
                { label: 'Queue',      href: '/admin/orders' },
                { label: 'Spec sheet', href: '#', active: true },
                { label: 'Revenue',    href: '/admin' },
                { label: 'Customers',  href: '/admin' },
              ].map(({ label, href, active }) => (
                <Link
                  key={label}
                  href={href}
                  style={{
                    fontFamily: 'var(--font-fraunces)',
                    fontSize: 12,
                    fontVariant: 'small-caps',
                    letterSpacing: '0.06em',
                    textDecoration: 'none',
                    color: active ? rasp : `${ink}80`,
                    borderBottom: active ? `2px solid ${rasp}` : '2px solid transparent',
                    paddingBottom: 2,
                    transition: 'color 0.15s',
                  }}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right: action buttons + status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              style={{
                background: cream,
                border: `1.5px solid ${ink}`,
                color: ink,
                fontFamily: 'var(--font-fraunces)',
                fontSize: 12,
                fontVariant: 'small-caps',
                letterSpacing: '0.05em',
                padding: '6px 14px',
                cursor: 'pointer',
              }}
            >
              Print PDF
            </button>
            <AdminStatusButton orderId={order.id} currentStatus={order.status} />
          </div>
        </div>
      </header>

      {/* ── Main content ───────────────────────────────────────────────────── */}
      <main style={{ maxWidth: 960, margin: '0 auto', padding: '40px 32px 0' }}>

        {/* ── Order title block (2-column) ─────────────────────────────────── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 320px',
            gap: 24,
            marginBottom: 32,
            alignItems: 'start',
          }}
        >
          {/* Left column */}
          <div>
            <p
              style={{
                fontFamily: 'var(--font-fraunces)',
                fontSize: 11,
                fontVariant: 'small-caps',
                letterSpacing: '0.12em',
                opacity: 0.55,
                margin: '0 0 6px 0',
              }}
            >
              {order.order_reference}
            </p>
            <h1
              style={{
                fontFamily: 'var(--font-fraunces)',
                fontStyle: 'italic',
                fontWeight: 900,
                fontSize: 72,
                lineHeight: 0.9,
                color: ink,
                margin: '0 0 10px 0',
                letterSpacing: '-0.03em',
              }}
            >
              {spec.flavorName}
            </h1>
            <p
              style={{
                fontFamily: 'var(--font-fraunces)',
                fontStyle: 'italic',
                fontSize: 18,
                color: `${ink}99`,
                margin: '0 0 20px 0',
              }}
            >
              {spec.tagline}
            </p>

            {/* Customer prompt box */}
            {fc.customer_prompt && (
              <div
                style={{
                  background: cream,
                  border: `1.5px solid ${ink}`,
                  boxShadow: `4px 4px 0 ${marigold}`,
                  padding: '14px 18px',
                  maxWidth: 460,
                }}
              >
                <p
                  style={{
                    fontFamily: 'var(--font-fraunces)',
                    fontSize: 9,
                    fontVariant: 'small-caps',
                    letterSpacing: '0.14em',
                    color: `${ink}80`,
                    margin: '0 0 6px 0',
                  }}
                >
                  Customer&apos;s own words · verbatim
                </p>
                <p
                  style={{
                    fontFamily: 'var(--font-fraunces)',
                    fontStyle: 'italic',
                    fontSize: 15,
                    color: ink,
                    margin: 0,
                    lineHeight: 1.5,
                  }}
                >
                  &ldquo;{fc.customer_prompt}&rdquo;
                </p>
              </div>
            )}
          </div>

          {/* Right column — ink info card */}
          <div
            style={{
              background: ink,
              color: cream,
              padding: '24px 22px',
              position: 'relative',
            }}
          >
            {/* Wax seal badge */}
            <div
              style={{
                position: 'absolute',
                top: -14,
                right: -14,
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: rasp,
                color: cream,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: 'rotate(12deg)',
                fontSize: 9,
                fontFamily: 'var(--font-fraunces)',
                fontVariant: 'small-caps',
                letterSpacing: '0.06em',
                textAlign: 'center',
                lineHeight: 1.2,
                border: `2px solid ${cream}`,
                padding: 6,
              }}
            >
              {order.order_reference?.replace('ORD-', '#') ?? '#—'}
            </div>

            <p
              style={{
                fontFamily: 'var(--font-fraunces)',
                fontStyle: 'italic',
                fontWeight: 700,
                fontSize: 20,
                color: cream,
                margin: '0 0 4px 0',
              }}
            >
              {order.customer_name || '—'}
            </p>
            <p
              style={{
                fontFamily: 'var(--font-fraunces)',
                fontSize: 12,
                color: `${cream}99`,
                margin: '0 0 2px 0',
              }}
            >
              {order.customer_email || '—'}
            </p>

            {deliveryAddr && (
              <p
                style={{
                  fontFamily: 'var(--font-fraunces)',
                  fontSize: 12,
                  color: `${cream}80`,
                  margin: '0 0 16px 0',
                  lineHeight: 1.5,
                }}
              >
                {deliveryAddr.name && <>{deliveryAddr.name}<br /></>}
                {deliveryAddr.line1}<br />
                {deliveryAddr.line2 && <>{deliveryAddr.line2}<br /></>}
                {deliveryAddr.city}, {deliveryAddr.state} {deliveryAddr.postal_code}
              </p>
            )}

            {!deliveryAddr && (
              <p
                style={{
                  fontFamily: 'var(--font-fraunces)',
                  fontSize: 12,
                  color: `${cream}80`,
                  margin: '0 0 16px 0',
                }}
              >
                Pickup
              </p>
            )}

            {/* Quantity */}
            <div
              style={{
                borderTop: `1px solid ${cream}30`,
                paddingTop: 14,
                marginTop: 8,
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-fraunces)',
                  fontSize: 10,
                  fontVariant: 'small-caps',
                  letterSpacing: '0.1em',
                  color: `${cream}60`,
                  margin: '0 0 2px 0',
                }}
              >
                Order quantity
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-fraunces)',
                  fontStyle: 'italic',
                  fontWeight: 700,
                  fontSize: 32,
                  color: cream,
                  margin: '0 0 2px 0',
                  lineHeight: 1,
                }}
              >
                {order.quantity_quarts} qt
                <span
                  style={{
                    fontFamily: 'var(--font-fraunces)',
                    fontStyle: 'normal',
                    fontWeight: 400,
                    fontSize: 14,
                    color: `${cream}80`,
                    marginLeft: 8,
                  }}
                >
                  = {spec.batchCount} batch{spec.batchCount > 1 ? 'es' : ''}
                </span>
              </p>
              {spec.personalNote && (
                <p
                  style={{
                    fontFamily: 'var(--font-caveat)',
                    fontSize: 14,
                    color: marigold,
                    margin: '8px 0 0 0',
                  }}
                >
                  {spec.personalNote}
                </p>
              )}
            </div>

            {/* Ship date + total */}
            <div
              style={{
                borderTop: `1px solid ${cream}30`,
                paddingTop: 12,
                marginTop: 12,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <p
                  style={{
                    fontFamily: 'var(--font-fraunces)',
                    fontSize: 10,
                    fontVariant: 'small-caps',
                    letterSpacing: '0.1em',
                    color: `${cream}60`,
                    margin: '0 0 2px 0',
                  }}
                >
                  Ship by
                </p>
                <p
                  style={{
                    fontFamily: 'var(--font-fraunces)',
                    fontWeight: 700,
                    fontSize: 13,
                    color: cream,
                    margin: 0,
                  }}
                >
                  {formatShipDate(shipDate)}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p
                  style={{
                    fontFamily: 'var(--font-fraunces)',
                    fontSize: 10,
                    fontVariant: 'small-caps',
                    letterSpacing: '0.1em',
                    color: `${cream}60`,
                    margin: '0 0 2px 0',
                  }}
                >
                  Total
                </p>
                <p
                  style={{
                    fontFamily: 'var(--font-fraunces)',
                    fontWeight: 700,
                    fontSize: 16,
                    color: marigold,
                    margin: 0,
                  }}
                >
                  {formatCents(order.total_price_cents)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Allergen banner ───────────────────────────────────────────────── */}
        {spec.allergenFlags.length > 0 && (
          <div
            style={{
              background: cherry,
              color: cream,
              padding: '14px 24px',
              marginBottom: 28,
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            <span style={{ fontSize: 20 }}>⚠</span>
            <p
              style={{
                fontFamily: 'var(--font-fraunces)',
                fontSize: 10,
                fontVariant: 'small-caps',
                letterSpacing: '0.14em',
                color: `${cream}cc`,
                margin: 0,
                flexShrink: 0,
              }}
            >
              Allergen flags
            </p>
            <p
              style={{
                fontFamily: 'var(--font-fraunces)',
                fontStyle: 'italic',
                fontWeight: 700,
                fontSize: 22,
                color: cream,
                margin: 0,
                letterSpacing: '-0.01em',
              }}
            >
              {spec.allergenFlags.join(' · ')}
            </p>
          </div>
        )}

        {/* ── Base specs (3-col grid) ───────────────────────────────────────── */}
        <section style={{ marginBottom: 32 }}>
          <p
            style={{
              fontFamily: 'var(--font-fraunces)',
              fontSize: 10,
              fontVariant: 'small-caps',
              letterSpacing: '0.14em',
              color: `${ink}60`,
              margin: '0 0 10px 0',
            }}
          >
            Base specs
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 10,
            }}
          >
            {[
              {
                label: 'Base type',
                value: spec.baseType,
                note: null,
              },
              {
                label: 'Milkfat %',
                value: spec.milkfatPercent ? `${spec.milkfatPercent}%` : 'N/A',
                note: spec.milkfatRationale ?? null,
              },
              {
                label: 'Liquid base qty',
                value: `${spec.liquidBaseTotalQt} qt`,
                note: `${spec.batchCount} batch${spec.batchCount > 1 ? 'es' : ''}`,
              },
            ].map(({ label, value, note }) => (
              <div
                key={label}
                style={{
                  background: cream,
                  border: `1.5px solid ${ink}`,
                  padding: '14px 16px',
                }}
              >
                <p
                  style={{
                    fontFamily: 'var(--font-fraunces)',
                    fontSize: 9,
                    fontVariant: 'small-caps',
                    letterSpacing: '0.14em',
                    color: `${ink}70`,
                    margin: '0 0 4px 0',
                  }}
                >
                  {label}
                </p>
                <p
                  style={{
                    fontFamily: 'var(--font-fraunces)',
                    fontStyle: 'italic',
                    fontWeight: 700,
                    fontSize: 22,
                    color: ink,
                    margin: 0,
                    lineHeight: 1.1,
                  }}
                >
                  {value}
                </p>
                {note && (
                  <p
                    style={{
                      fontFamily: 'var(--font-fraunces)',
                      fontStyle: 'italic',
                      fontSize: 11,
                      color: `${ink}60`,
                      margin: '4px 0 0 0',
                    }}
                  >
                    {note}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── Mix-ins table ────────────────────────────────────────────────── */}
        <section style={{ marginBottom: 32 }}>
          <p
            style={{
              fontFamily: 'var(--font-fraunces)',
              fontSize: 10,
              fontVariant: 'small-caps',
              letterSpacing: '0.14em',
              color: `${ink}60`,
              margin: '0 0 10px 0',
            }}
          >
            Mix-ins
          </p>
          <div style={{ border: `1.5px solid ${ink}`, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: ink }}>
                  {['Ingredient', 'g / qt', 'Batch total', 'Fold method', 'Prep note'].map(col => (
                    <th
                      key={col}
                      style={{
                        fontFamily: 'var(--font-fraunces)',
                        fontSize: 9,
                        fontVariant: 'small-caps',
                        letterSpacing: '0.12em',
                        color: cream,
                        fontWeight: 500,
                        textAlign: 'left',
                        padding: '10px 14px',
                      }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {spec.mixIns
                  .filter(m => spec.enabledMixIns.includes(m.name))
                  .map((mixIn, i, arr) => (
                    <tr
                      key={mixIn.name}
                      style={{
                        background: cream,
                        borderBottom: i < arr.length - 1 ? `1px dashed ${ink}60` : 'none',
                      }}
                    >
                      <td
                        style={{
                          fontFamily: 'var(--font-fraunces)',
                          fontStyle: 'italic',
                          fontWeight: 700,
                          fontSize: 14,
                          color: ink,
                          padding: '10px 14px',
                        }}
                      >
                        {mixIn.name}
                      </td>
                      <td
                        style={{
                          fontFamily: 'var(--font-fraunces)',
                          fontSize: 13,
                          color: `${ink}90`,
                          padding: '10px 14px',
                        }}
                      >
                        {mixIn.weightGrams}g
                      </td>
                      <td
                        style={{
                          fontFamily: 'var(--font-fraunces)',
                          fontSize: 13,
                          color: `${ink}90`,
                          padding: '10px 14px',
                        }}
                      >
                        {(mixIn.weightGrams * spec.batchCount * 2).toFixed(0)}g
                      </td>
                      <td
                        style={{
                          fontFamily: 'monospace',
                          fontSize: 12,
                          color: `${ink}80`,
                          padding: '10px 14px',
                        }}
                      >
                        {mixIn.foldMethod.replace(/-/g, ' ')}
                      </td>
                      <td
                        style={{
                          fontFamily: 'var(--font-fraunces)',
                          fontStyle: 'italic',
                          fontSize: 12,
                          color: `${ink}60`,
                          padding: '10px 14px',
                        }}
                      >
                        {mixIn.prepNote ?? '—'}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          {spec.mixIns.filter(m => !spec.enabledMixIns.includes(m.name)).length > 0 && (
            <p
              style={{
                fontFamily: 'var(--font-fraunces)',
                fontStyle: 'italic',
                fontSize: 11,
                color: `${ink}40`,
                margin: '8px 0 0 0',
              }}
            >
              Excluded: {spec.mixIns.filter(m => !spec.enabledMixIns.includes(m.name)).map(m => m.name).join(', ')}
            </p>
          )}
        </section>

        {/* ── Maker notes ──────────────────────────────────────────────────── */}
        {spec.makerNotes && (
          <section style={{ marginBottom: 32 }}>
            <div
              style={{
                background: cream,
                border: `1.5px dashed ${ink}`,
                padding: '18px 22px',
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-fraunces)',
                  fontSize: 9,
                  fontVariant: 'small-caps',
                  letterSpacing: '0.14em',
                  color: `${ink}60`,
                  margin: '0 0 8px 0',
                }}
              >
                Maker notes · from the architect
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-fraunces)',
                  fontStyle: 'italic',
                  fontSize: 16,
                  color: ink,
                  margin: 0,
                  lineHeight: 1.6,
                }}
              >
                {spec.makerNotes}
              </p>
            </div>
          </section>
        )}

        {/* ── Label dedication ─────────────────────────────────────────────── */}
        {spec.personalNote && (
          <section style={{ marginBottom: 32 }}>
            <div
              style={{
                background: cream,
                border: `1.5px dashed ${ink}`,
                padding: '18px 22px',
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-fraunces)',
                  fontSize: 9,
                  fontVariant: 'small-caps',
                  letterSpacing: '0.14em',
                  color: `${ink}60`,
                  margin: '0 0 8px 0',
                }}
              >
                Label dedication
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-caveat)',
                  fontSize: 22,
                  color: ink,
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                &ldquo;{spec.personalNote}&rdquo;
              </p>
            </div>
          </section>
        )}

        {/* ── Tracking info (when shipped) ─────────────────────────────────── */}
        {order.status === 'shipped' && order.tracking_number && (
          <section style={{ marginBottom: 32 }}>
            <p
              style={{
                fontFamily: 'var(--font-fraunces)',
                fontSize: 10,
                fontVariant: 'small-caps',
                letterSpacing: '0.14em',
                color: `${ink}60`,
                margin: '0 0 10px 0',
              }}
            >
              Shipping / tracking
            </p>
            <div
              style={{
                background: cream,
                border: `1.5px solid ${ink}`,
                padding: '16px 20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                {order.tracking_carrier && (
                  <span
                    style={{
                      fontFamily: 'var(--font-fraunces)',
                      fontSize: 10,
                      fontVariant: 'small-caps',
                      letterSpacing: '0.08em',
                      background: `${ink}12`,
                      color: `${ink}90`,
                      padding: '3px 8px',
                    }}
                  >
                    {order.tracking_carrier}
                  </span>
                )}
                <span
                  style={{
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    fontSize: 14,
                    color: ink,
                    letterSpacing: '0.05em',
                  }}
                >
                  {order.tracking_number}
                </span>
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
                      style={{
                        fontFamily: 'var(--font-fraunces)',
                        fontSize: 12,
                        color: marigold,
                        textDecoration: 'underline',
                      }}
                    >
                      Track on {order.tracking_carrier} →
                    </a>
                  ) : null
                })()}
              </div>
              {order.shipped_at && (
                <p
                  style={{
                    fontFamily: 'var(--font-fraunces)',
                    fontSize: 11,
                    color: `${ink}50`,
                    margin: '8px 0 0 0',
                    fontStyle: 'italic',
                  }}
                >
                  Shipped {new Date(order.shipped_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              )}
            </div>
          </section>
        )}

        {/* ── Tracking form (when in_production) ───────────────────────────── */}
        {order.status === 'in_production' && (
          <section style={{ marginBottom: 32 }}>
            <div
              style={{
                background: cream,
                border: `1.5px solid ${ink}`,
                padding: '20px 22px',
              }}
            >
              <TrackingForm orderId={order.id} />
            </div>
          </section>
        )}

      </main>
    </div>
  )
}
