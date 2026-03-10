import { Resend } from 'resend'
import type { SpecSheet } from '@/types/flavor'
import { formatCents, formatShipDate, calculateShipDate } from './utils'
import { MAKER_EMAIL } from './constants'

let _resend: Resend | null = null
function getResend(): Resend {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY
    if (!key) throw new Error('RESEND_API_KEY env var is not set.')
    _resend = new Resend(key)
  }
  return _resend
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
  const shipDate = formatShipDate(calculateShipDate(orderDate))

  const enabledMixIns = spec.mixIns.filter(m => spec.enabledMixIns.includes(m.name))

  const mixInRows = enabledMixIns.map(m => {
    const perQuartG   = m.weightGrams
    const batchTotalG = Math.round(perQuartG * spec.quantityQuarts)
    const prepLine    = m.prepNote ? `<br/><em>Prep: ${m.prepNote}</em>` : ''
    return `
      <tr>
        <td style="padding:6px 12px;border-bottom:1px solid #eee">${m.name}</td>
        <td style="padding:6px 12px;border-bottom:1px solid #eee">${perQuartG}g</td>
        <td style="padding:6px 12px;border-bottom:1px solid #eee">${batchTotalG}g total</td>
        <td style="padding:6px 12px;border-bottom:1px solid #eee">${m.foldMethod}${prepLine}</td>
      </tr>`
  }).join('')

  const allergenHtml = spec.allergenFlags.length > 0
    ? spec.allergenFlags.map(a =>
        `<span style="background:#fee2e2;color:#dc2626;padding:2px 8px;border-radius:4px;margin:2px;display:inline-block;font-weight:600">${a.toUpperCase()}</span>`
      ).join(' ')
    : '<span style="color:#666">None detected</span>'

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="font-family:Georgia,serif;max-width:700px;margin:0 auto;padding:24px;color:#1B1B2F;background:#F5F0E8">

  <div style="background:#1B1B2F;color:#F5F0E8;padding:24px 32px;border-radius:8px 8px 0 0">
    <h1 style="margin:0;font-size:22px;letter-spacing:1px">🍦 LEGENDAIRY ICE CREAM</h1>
    <p style="margin:4px 0 0;font-size:14px;opacity:0.7">Production Spec Sheet</p>
  </div>

  <div style="background:#fff;padding:24px 32px;border:1px solid #ddd">

    <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
      <tr><td style="padding:6px 0;color:#666;width:180px">Order Reference</td>
          <td style="padding:6px 0;font-weight:700;font-size:18px">${orderRef}</td></tr>
      <tr><td style="padding:6px 0;color:#666">Customer</td>
          <td style="padding:6px 0">${customerName} &lt;${customerEmail}&gt;</td></tr>
      <tr><td style="padding:6px 0;color:#666">Ship Date</td>
          <td style="padding:6px 0;font-weight:600">${shipDate}</td></tr>
      <tr><td style="padding:6px 0;color:#666">Order Total</td>
          <td style="padding:6px 0">${formatCents(totalCents)}</td></tr>
    </table>

    <hr style="border:none;border-top:2px solid #1B1B2F;margin:0 0 20px"/>

    <h2 style="font-size:24px;margin:0 0 4px">${spec.flavorName}</h2>
    <p style="color:#666;margin:0 0 16px;font-style:italic">${spec.tagline}</p>

    <div style="background:#F5F0E8;padding:16px;border-radius:6px;margin-bottom:24px">
      <p style="margin:0;font-style:italic;color:#444">"${spec.customerPrompt}"</p>
    </div>

    <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
      <tr><td style="padding:6px 0;color:#666;width:200px">Base Type</td>
          <td style="padding:6px 0;font-weight:600">${spec.baseType}</td></tr>
      ${!spec.baseType.includes('Coconut') ? `
      <tr><td style="padding:6px 0;color:#666">Milkfat</td>
          <td style="padding:6px 0">${spec.milkfatPercent}% — ${spec.milkfatRationale}</td></tr>` : ''}
      <tr><td style="padding:6px 0;color:#666">Primary Flavor</td>
          <td style="padding:6px 0">${spec.primaryFlavor}</td></tr>
      <tr><td style="padding:6px 0;color:#666">Sweetener</td>
          <td style="padding:6px 0">${spec.sweetenerType}, Level ${spec.sweetnessLevel}/10</td></tr>
      <tr><td style="padding:6px 0;color:#666">Sugar (per qt base)</td>
          <td style="padding:6px 0">${spec.sweetenerGramsPerQtBase}g</td></tr>
    </table>

    <hr style="border:none;border-top:1px solid #ddd;margin:0 0 16px"/>

    <h3 style="margin:0 0 12px;font-size:16px">Batch Production</h3>
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
      <tr><td style="padding:6px 0;color:#666;width:200px">Quarts Ordered</td>
          <td style="padding:6px 0;font-weight:600">${spec.quantityQuarts} qt</td></tr>
      <tr><td style="padding:6px 0;color:#666">Batches Required</td>
          <td style="padding:6px 0;font-weight:600">${spec.batchCount}</td></tr>
      <tr><td style="padding:6px 0;color:#666">Total Liquid Base</td>
          <td style="padding:6px 0;font-weight:600">${spec.liquidBaseTotalQt} qt (${Math.round(spec.liquidBaseTotalQt * 946)} ml)</td></tr>
      <tr><td style="padding:6px 0;color:#666">Total Sugar</td>
          <td style="padding:6px 0;font-weight:600">${Math.round(spec.sweetenerGramsPerQtBase * spec.liquidBaseTotalQt)}g</td></tr>
    </table>

    <hr style="border:none;border-top:1px solid #ddd;margin:0 0 16px"/>

    <h3 style="margin:0 0 12px;font-size:16px">Mix-Ins (${enabledMixIns.length} active)</h3>
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
      <thead>
        <tr style="background:#1B1B2F;color:#F5F0E8">
          <th style="padding:8px 12px;text-align:left">Ingredient</th>
          <th style="padding:8px 12px;text-align:left">Per Quart</th>
          <th style="padding:8px 12px;text-align:left">Batch Total</th>
          <th style="padding:8px 12px;text-align:left">Method</th>
        </tr>
      </thead>
      <tbody>${mixInRows}</tbody>
    </table>

    <hr style="border:none;border-top:1px solid #ddd;margin:0 0 16px"/>

    <h3 style="margin:0 0 8px;font-size:16px;color:#dc2626">⚠️ Allergens</h3>
    <div style="margin-bottom:24px">${allergenHtml}</div>

    ${spec.makerNotes ? `
    <hr style="border:none;border-top:1px solid #ddd;margin:0 0 16px"/>
    <h3 style="margin:0 0 8px;font-size:16px">Maker Notes</h3>
    <p style="margin:0 0 24px;color:#444">${spec.makerNotes}</p>` : ''}

    ${spec.personalNote ? `
    <hr style="border:none;border-top:1px solid #ddd;margin:0 0 16px"/>
    <h3 style="margin:0 0 8px;font-size:16px">Label Dedication</h3>
    <p style="margin:0 0 24px;font-style:italic;color:#444">"${spec.personalNote}"</p>` : ''}

  </div>

  <div style="background:#1B1B2F;color:#F5F0E8;padding:16px 32px;border-radius:0 0 8px 8px;font-size:12px;opacity:0.8">
    Legendairy Ice Cream · legendairyicecream.com
  </div>

</body>
</html>`

  return getResend().emails.send({
    from:    'Legendairy Orders <orders@legendairyicecream.com>',
    to:      MAKER_EMAIL,
    subject: `[NEW ORDER] ${orderRef} — ${spec.flavorName} · ${spec.quantityQuarts} qt`,
    html,
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
  const shipDate = formatShipDate(calculateShipDate(orderDate))
  const enabledMixIns = spec.mixIns.filter(m => spec.enabledMixIns.includes(m.name))

  const allergenWarning = spec.allergenFlags.length > 0
    ? `<p style="color:#dc2626;font-weight:600;margin:16px 0">
        ⚠️ Allergens: ${spec.allergenFlags.map(a => a.toUpperCase()).join(', ')}
       </p>`
    : ''

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:24px;color:#1B1B2F;background:#F5F0E8">

  <div style="background:#1B1B2F;color:#F5F0E8;padding:32px;border-radius:8px 8px 0 0;text-align:center">
    <h1 style="margin:0;font-size:28px">🍦 Your dream is in the making.</h1>
  </div>

  <div style="background:#fff;padding:32px;border:1px solid #ddd">
    <p style="margin:0 0 16px">Hi ${customerName},</p>
    <p style="margin:0 0 24px">
      Your order is confirmed and we're already thinking about how to make
      <strong>${spec.flavorName}</strong> perfect for you.
    </p>

    <div style="background:#F5F0E8;border-left:4px solid #1B1B2F;padding:16px 20px;margin-bottom:24px">
      <h2 style="margin:0 0 4px;font-size:20px">${spec.flavorName}</h2>
      <p style="margin:0;color:#666;font-style:italic">${spec.tagline}</p>
    </div>

    <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
      <tr><td style="padding:6px 0;color:#666;width:160px">Order</td>
          <td style="padding:6px 0;font-weight:600">${orderRef}</td></tr>
      <tr><td style="padding:6px 0;color:#666">Quantity</td>
          <td style="padding:6px 0">${spec.quantityQuarts} quarts (${spec.batchCount} batch${spec.batchCount > 1 ? 'es' : ''})</td></tr>
      <tr><td style="padding:6px 0;color:#666">Total</td>
          <td style="padding:6px 0">${formatCents(totalCents)}</td></tr>
      <tr><td style="padding:6px 0;color:#666">Ships</td>
          <td style="padding:6px 0;font-weight:600">${shipDate}</td></tr>
    </table>

    <h3 style="font-size:15px;margin:24px 0 10px">What's inside</h3>
    <p style="margin:0 0 4px;color:#444">${spec.primaryFlavor}</p>
    <ul style="margin:0 0 16px;padding-left:20px;color:#444">
      ${enabledMixIns.map(m => `<li>${m.name}</li>`).join('')}
    </ul>

    ${allergenWarning}

    ${spec.personalNote ? `
    <div style="border:1px dashed #aaa;padding:16px;border-radius:6px;margin-top:24px">
      <p style="margin:0;color:#666;font-size:13px">Your label dedication:</p>
      <p style="margin:4px 0 0;font-style:italic">"${spec.personalNote}"</p>
    </div>` : ''}

    <p style="margin:32px 0 0;color:#666;font-size:14px">
      Questions? Just reply to this email.
    </p>
  </div>

  <div style="background:#1B1B2F;color:#F5F0E8;padding:16px 32px;border-radius:0 0 8px 8px;font-size:12px;text-align:center;opacity:0.8">
    Legendairy Ice Cream · legendairyicecream.com
  </div>

</body>
</html>`

  return getResend().emails.send({
    from:    'Legendairy Ice Cream <orders@legendairyicecream.com>',
    to:      customerEmail,
    subject: `Your order is confirmed — ${spec.flavorName} 🍦`,
    html,
  })
}
