import { Resend } from 'resend'
import { createElement } from 'react'
import type { SpecSheet } from '@/types/flavor'
import { formatCents, formatShipDate, calculateShipDate } from './utils'
import { MAKER_EMAIL } from './constants'
import { OrderConfirmationEmail }    from '@/components/emails/OrderConfirmationEmail'
import { MakerAlertEmail }           from '@/components/emails/MakerAlertEmail'
import { ShippingNotificationEmail } from '@/components/emails/ShippingNotificationEmail'
import { LeadCaptureEmail }          from '@/components/emails/LeadCaptureEmail'

const BASE = 'https://www.legendairyicecream.com'

let _resend: Resend | null = null
function getResend(): Resend {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY
    if (!key) throw new Error('RESEND_API_KEY env var is not set.')
    _resend = new Resend(key)
  }
  return _resend
}

function getTrackingUrl(carrier: string, trackingNumber: string): string | null {
  const n = encodeURIComponent(trackingNumber)
  switch (carrier) {
    case 'UPS':   return `https://www.ups.com/track?tracknum=${n}`
    case 'USPS':  return `https://tools.usps.com/go/TrackConfirmAction?qtc_tLabels1=${n}`
    case 'FedEx': return `https://www.fedex.com/apps/fedextrack/?tracknumbers=${n}`
    default:      return null
  }
}

// ── Maker new-order alert ─────────────────────────────────────────────────────

export async function sendMakerAlert(opts: {
  orderRef:       string
  customerName:   string
  customerEmail:  string
  spec:           SpecSheet
  totalCents:     number
  orderDate:      Date
}) {
  const { orderRef, customerName, customerEmail, spec, totalCents, orderDate } = opts

  return getResend().emails.send({
    from:    'Legendairy Orders <orders@legendairyicecream.com>',
    to:      MAKER_EMAIL,
    subject: `[NEW ORDER] ${orderRef} — ${spec.flavorName} · ${spec.quantityQuarts} qt`,
    react:   createElement(MakerAlertEmail, { orderRef, customerName, customerEmail, spec, totalCents, orderDate }),
  })
}

// ── Customer order confirmation ───────────────────────────────────────────────

export async function sendOrderConfirmation(opts: {
  orderRef:      string
  customerName:  string
  customerEmail: string
  spec:          SpecSheet
  totalCents:    number
  orderDate:     Date
}) {
  const { orderRef, customerName, customerEmail, spec, totalCents, orderDate } = opts
  const flavorUrl = `${BASE}/flavor/${spec.flavorCreationId}`

  return getResend().emails.send({
    from:    'Legendairy Ice Cream <orders@legendairyicecream.com>',
    to:      customerEmail,
    subject: `Your order is confirmed — ${spec.flavorName} ✦`,
    react:   createElement(OrderConfirmationEmail, { orderRef, customerName, spec, totalCents, orderDate, flavorUrl }),
  })
}

// ── Lead capture follow-up ────────────────────────────────────────────────────

export async function sendLeadEmail(opts: {
  email:      string
  flavorName: string
  tagline:    string
  flavorId:   string
}) {
  const { email, flavorName, tagline, flavorId } = opts
  const flavorUrl = `${BASE}/flavor/${flavorId}`

  return getResend().emails.send({
    from:    'Legendairy Ice Cream <orders@legendairyicecream.com>',
    to:      email,
    subject: `Your ${flavorName} is saved — here's your link ✦`,
    react:   createElement(LeadCaptureEmail, { flavorName, tagline, flavorUrl }),
  })
}

// ── Shipping notification ─────────────────────────────────────────────────────

export async function sendShippingNotification(opts: {
  orderRef:       string
  customerName:   string
  customerEmail:  string
  flavorName:     string
  carrier:        string
  trackingNumber: string
  shippedAt:      Date
}) {
  const { orderRef, customerName, customerEmail, flavorName, carrier, trackingNumber, shippedAt } = opts
  const trackingUrl = getTrackingUrl(carrier, trackingNumber)

  return getResend().emails.send({
    from:    'Legendairy Ice Cream <orders@legendairyicecream.com>',
    to:      customerEmail,
    subject: `Your ${flavorName} has shipped ✦`,
    react:   createElement(ShippingNotificationEmail, { orderRef, customerName, flavorName, carrier, trackingNumber, trackingUrl, shippedAt }),
  })
}
