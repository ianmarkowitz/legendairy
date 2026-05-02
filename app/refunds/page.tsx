import { AC, paperGrain } from '@/components/ac-primitives'

const FF = { serif: 'var(--font-fraunces)', hand: 'var(--font-caveat)' }

const h2 = { fontFamily: FF.serif, fontStyle: 'italic' as const, fontSize: 26, fontWeight: 700, color: AC.ink, margin: '40px 0 10px' }
const body = { fontFamily: FF.serif, fontSize: 15, lineHeight: 1.8, color: AC.ink, opacity: 0.82, margin: '0 0 16px' }

export default function RefundsPage() {
  return (
    <div style={{ background: AC.parchment, minHeight: '100vh', ...paperGrain }}>
      <div style={{ maxWidth: 740, margin: '0 auto', padding: 'clamp(48px, 8vw, 88px) clamp(24px, 6vw, 48px)' }}>

        <span style={{ fontFamily: FF.hand, fontSize: 20, color: AC.rasp, display: 'block', marginBottom: 8 }}>— the fine print —</span>
        <h1 style={{ fontFamily: FF.serif, fontStyle: 'italic', fontSize: 'clamp(40px, 7vw, 72px)', fontWeight: 900, color: AC.ink, margin: '0 0 8px', lineHeight: 1 }}>Refund &amp; Cancellation</h1>
        <p style={{ fontFamily: FF.serif, fontSize: 13, color: `${AC.ink}60`, margin: '0 0 48px' }}>Last updated: May 1, 2026</p>

        <p style={body}>Every pint is made specifically for you — we start churning the morning after your order is placed. Because of this, our ability to cancel or refund an order is limited once production begins. Here's exactly how it works.</p>

        <h2 style={h2}>Cancellations</h2>
        <p style={body}>You may cancel your order <strong>within one hour of placing it</strong>, or at any point before it has moved into production — whichever comes first. Once churning has begun, we are unable to cancel your order.</p>
        <p style={body}>To cancel, email us immediately at <a href="mailto:hello@legendairyicecream.com" style={{ color: AC.rasp }}>hello@legendairyicecream.com</a> with your order reference number. We monitor this inbox closely during business hours and will confirm your cancellation as quickly as possible.</p>
        <p style={body}>Approved cancellations receive a full refund to the original payment method. Refunds typically appear within 5–10 business days depending on your bank.</p>

        <h2 style={h2}>Damaged or melted orders</h2>
        <p style={body}>We ship every order on dry ice and pack it carefully to survive transit. In the rare event that your order arrives damaged or melted, you must contact us <strong>on the same day as delivery</strong> — we cannot process claims reported after that.</p>
        <p style={body}>To report a damaged order, email <a href="mailto:hello@legendairyicecream.com" style={{ color: AC.rasp }}>hello@legendairyicecream.com</a> with your order reference number and a photo of the condition of the package and product upon arrival. We will ship a replacement order as soon as possible at no charge to you.</p>

        <h2 style={h2}>What we don't cover</h2>
        <p style={body}>Because every flavor is one-of-one and made to your specification, we are unable to offer refunds or replacements for:</p>
        <ul style={{ ...body, paddingLeft: 24, margin: '0 0 16px' }}>
          <li style={{ marginBottom: 8 }}>Change of mind after production has begun</li>
          <li style={{ marginBottom: 8 }}>Flavor preferences (the recipe is generated from your own prompt)</li>
          <li style={{ marginBottom: 8 }}>Damage reported after the delivery date</li>
          <li style={{ marginBottom: 8 }}>Incorrect shipping addresses provided at checkout</li>
        </ul>

        <h2 style={h2}>Questions</h2>
        <p style={body}>If something isn't right with your order, please reach out — we want to make it right. Email us at <a href="mailto:hello@legendairyicecream.com" style={{ color: AC.rasp }}>hello@legendairyicecream.com</a> with your order reference and we'll get back to you promptly.</p>

        <div style={{ borderTop: `1px solid ${AC.ink}20`, marginTop: 48, paddingTop: 24 }}>
          <p style={{ fontFamily: FF.serif, fontSize: 13, color: `${AC.ink}45`, margin: 0 }}>Legendairy · Massachusetts · hello@legendairyicecream.com</p>
        </div>

      </div>
    </div>
  )
}
