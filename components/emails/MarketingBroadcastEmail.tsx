import {
  Html, Head, Body, Preview, Container,
  Section, Text, Hr, Button, Link,
} from '@react-email/components'

// ─────────────────────────────────────────────────────────────────────────────
// Shared template for Resend Broadcasts (marketing sends to the Audience).
// Two variants:
//   'personal' — looks like a real 1:1 note, minimal styling
//   'designed' — full Atelier Carnival branding
// Both end with an unsubscribe footer required for non-transactional email.
// The {{{RESEND_UNSUBSCRIBE_URL}}} merge tag is filled in per-recipient by
// Resend at send time — it must appear verbatim in the rendered HTML.
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  variant?:    'personal' | 'designed'
  preheader:   string
  heading?:    string        // designed variant only
  greeting?:   string        // personal variant only, e.g. "Hey there,"
  paragraphs:  string[]
  ctaText?:    string
  ctaUrl?:     string
  signOff?:    string        // e.g. "— Ian"
}

const C = {
  parchment: '#F1E1BC',
  cream:     '#FBF3D9',
  ink:       '#2A1810',
  rasp:      '#C83A4E',
  marigold:  '#E8A628',
}

const serif = 'Fraunces, Georgia, serif'
const hand  = 'Caveat, cursive'
const sans  = '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif'

function UnsubscribeFooter({ dark }: { dark: boolean }) {
  const color = dark ? `${C.cream}66` : '#8a8a8a'
  return (
    <Text style={{ fontFamily: sans, fontSize: 12, color, margin: '0', lineHeight: '1.6' }}>
      Legendairy Ice Cream · legendairyicecream.com
      <br />
      Don&apos;t want these emails?{' '}
      <Link href="{{{RESEND_UNSUBSCRIBE_URL}}}" style={{ color, textDecoration: 'underline' }}>
        Unsubscribe
      </Link>
    </Text>
  )
}

export function MarketingBroadcastEmail({
  variant = 'designed',
  preheader,
  heading,
  greeting,
  paragraphs,
  ctaText,
  ctaUrl,
  signOff,
}: Props) {
  if (variant === 'personal') {
    return (
      <Html lang="en">
        <Head />
        <Preview>{preheader}</Preview>
        <Body style={{ background: '#ffffff', margin: 0, padding: 0, fontFamily: sans }}>
          <Container style={{ maxWidth: 480, margin: '0 auto', padding: '32px 20px' }}>
            {greeting && (
              <Text style={{ fontSize: 15, color: '#111', margin: '0 0 16px', lineHeight: '1.6' }}>
                {greeting}
              </Text>
            )}
            {paragraphs.map((p, i) => (
              <Text key={i} style={{ fontSize: 15, color: '#111', margin: '0 0 16px', lineHeight: '1.6' }}>
                {p}
              </Text>
            ))}
            {ctaUrl && ctaText && (
              <Text style={{ fontSize: 15, margin: '0 0 16px', lineHeight: '1.6' }}>
                <Link href={ctaUrl} style={{ color: C.rasp }}>{ctaText}</Link>
              </Text>
            )}
            {signOff && (
              <Text style={{ fontSize: 15, color: '#111', margin: '24px 0 32px', lineHeight: '1.6' }}>
                {signOff}
              </Text>
            )}
            <Hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '0 0 16px' }} />
            <UnsubscribeFooter dark={false} />
          </Container>
        </Body>
      </Html>
    )
  }

  return (
    <Html lang="en">
      <Head>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,700;1,9..144,400;1,9..144,700;1,9..144,900&family=Caveat:wght@600;700&display=swap');`}</style>
      </Head>
      <Preview>{preheader}</Preview>
      <Body style={{ background: C.parchment, margin: 0, padding: 0 }}>
        <Container style={{ maxWidth: 540, margin: '0 auto', padding: '40px 16px 64px' }}>

          <Section style={{ background: C.ink, padding: '28px 40px', borderRadius: '8px 8px 0 0', textAlign: 'center' }}>
            <Text style={{ fontFamily: serif, fontStyle: 'italic', fontWeight: 900, fontSize: 28, color: C.cream, margin: '0 0 4px', lineHeight: '1' }}>
              Legendairy
            </Text>
            <Text style={{ fontFamily: hand, fontSize: 16, color: C.marigold, margin: 0, lineHeight: '1' }}>
              — artisan ice cream, dreamed up by you —
            </Text>
          </Section>

          <Section style={{ background: C.cream, border: `2px solid ${C.ink}`, borderTop: 'none', padding: '36px 40px' }}>
            {heading && (
              <Text style={{ fontFamily: serif, fontStyle: 'italic', fontWeight: 900, fontSize: 30, color: C.ink, margin: '0 0 18px', lineHeight: '1.1' }}>
                {heading}
              </Text>
            )}

            {paragraphs.map((p, i) => (
              <Text key={i} style={{ fontFamily: serif, fontSize: 16, color: `${C.ink}cc`, margin: '0 0 16px', lineHeight: '1.6' }}>
                {p}
              </Text>
            ))}

            {ctaUrl && ctaText && (
              <Button
                href={ctaUrl}
                style={{ background: C.rasp, color: C.cream, fontFamily: serif, fontWeight: 700, fontStyle: 'italic', fontSize: 16, padding: '15px 36px', border: `2px solid ${C.ink}`, textDecoration: 'none', display: 'inline-block', marginTop: 8 }}
              >
                {ctaText}
              </Button>
            )}

            {signOff && (
              <Text style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 16, color: C.ink, margin: '28px 0 0', lineHeight: '1.5' }}>
                {signOff}
              </Text>
            )}
          </Section>

          <Section style={{ background: C.ink, padding: '20px 40px', borderRadius: '0 0 8px 8px', textAlign: 'center' }}>
            <UnsubscribeFooter dark={true} />
          </Section>

        </Container>
      </Body>
    </Html>
  )
}
