import { AC, paperGrain } from '@/components/ac-primitives'

const FF = { serif: 'var(--font-fraunces)', hand: 'var(--font-caveat)' }

const h2 = { fontFamily: FF.serif, fontStyle: 'italic' as const, fontSize: 26, fontWeight: 700, color: AC.ink, margin: '40px 0 10px' }
const body = { fontFamily: FF.serif, fontSize: 15, lineHeight: 1.8, color: AC.ink, opacity: 0.82, margin: '0 0 16px' }

export default function PrivacyPage() {
  return (
    <div style={{ background: AC.parchment, minHeight: '100vh', ...paperGrain }}>
      <div style={{ maxWidth: 740, margin: '0 auto', padding: 'clamp(48px, 8vw, 88px) clamp(24px, 6vw, 48px)' }}>

        <span style={{ fontFamily: FF.hand, fontSize: 20, color: AC.rasp, display: 'block', marginBottom: 8 }}>— the fine print —</span>
        <h1 style={{ fontFamily: FF.serif, fontStyle: 'italic', fontSize: 'clamp(40px, 7vw, 72px)', fontWeight: 900, color: AC.ink, margin: '0 0 8px', lineHeight: 1 }}>Privacy Policy</h1>
        <p style={{ fontFamily: FF.serif, fontSize: 13, color: `${AC.ink}60`, margin: '0 0 48px' }}>Last updated: May 1, 2026</p>

        <p style={body}>Legendairy ("we," "us," or "our") is committed to protecting your privacy. This policy explains what information we collect, how we use it, and your rights regarding your data.</p>

        <h2 style={h2}>What we collect</h2>
        <p style={body}><strong>Information you provide:</strong> When you use Legendairy, we collect the email address you sign in with, the flavor prompts you describe, any personal dedication notes you add to your label, and billing and shipping information you enter at checkout (processed directly by Stripe — we never see your full card number).</p>
        <p style={body}><strong>Information collected automatically:</strong> We collect standard usage data including pages visited, browser type, and general location via Google Analytics and Vercel Analytics. This data is aggregated and anonymous.</p>

        <h2 style={h2}>How we use it</h2>
        <p style={body}>We use your information solely to fulfill your orders, send order-related emails, improve the service, and communicate with you if you reach out to us. We do not sell your data. We do not send marketing emails without your consent.</p>

        <h2 style={h2}>Third-party services</h2>
        <p style={body}>We rely on a small number of trusted services to operate:</p>
        <ul style={{ ...body, paddingLeft: 24, margin: '0 0 16px' }}>
          <li style={{ marginBottom: 8 }}><strong>Stripe</strong> — payment processing. Your card details go directly to Stripe and are never stored on our servers.</li>
          <li style={{ marginBottom: 8 }}><strong>Supabase</strong> — database and authentication. Your account and order data is stored securely here.</li>
          <li style={{ marginBottom: 8 }}><strong>Google Analytics</strong> — anonymous site usage analytics.</li>
          <li style={{ marginBottom: 8 }}><strong>Vercel</strong> — hosting and performance analytics.</li>
        </ul>

        <h2 style={h2}>Data retention</h2>
        <p style={body}>We retain your account and order data for as long as your account is active or as needed to fulfill orders and comply with legal obligations. You may request deletion of your data at any time by emailing us.</p>

        <h2 style={h2}>Your rights</h2>
        <p style={body}>You have the right to access, correct, or delete your personal data. To exercise any of these rights, contact us at <a href="mailto:hello@legendairyicecream.com" style={{ color: AC.rasp }}>hello@legendairyicecream.com</a>.</p>

        <h2 style={h2}>Cookies</h2>
        <p style={body}>We use cookies and similar technologies for authentication and analytics. By using the site, you consent to their use.</p>

        <h2 style={h2}>Changes</h2>
        <p style={body}>We may update this policy from time to time. Continued use of the site after changes constitutes your acceptance of the new policy.</p>

        <h2 style={h2}>Contact</h2>
        <p style={body}>Questions about this policy? Email us at <a href="mailto:hello@legendairyicecream.com" style={{ color: AC.rasp }}>hello@legendairyicecream.com</a>. We're a small team and we'll respond promptly.</p>

        <div style={{ borderTop: `1px solid ${AC.ink}20`, marginTop: 48, paddingTop: 24 }}>
          <p style={{ fontFamily: FF.serif, fontSize: 13, color: `${AC.ink}45`, margin: 0 }}>Legendairy · Massachusetts · hello@legendairyicecream.com</p>
        </div>

      </div>
    </div>
  )
}
