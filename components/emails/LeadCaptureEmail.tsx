import {
  Html, Head, Body, Preview, Container,
  Section, Text, Hr, Button,
} from '@react-email/components'

interface Props {
  flavorName: string
  tagline:    string
  flavorUrl:  string
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

export function LeadCaptureEmail({ flavorName, tagline, flavorUrl }: Props) {
  return (
    <Html lang="en">
      <Head>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,700;1,9..144,400;1,9..144,700;1,9..144,900&family=Caveat:wght@600;700&display=swap');`}</style>
      </Head>
      <Preview>Your {flavorName} has a permanent home — here&apos;s your link back.</Preview>
      <Body style={{ background: C.parchment, margin: 0, padding: 0 }}>
        <Container style={{ maxWidth: 540, margin: '0 auto', padding: '40px 16px 64px' }}>

          {/* Header */}
          <Section style={{ background: C.ink, padding: '28px 40px', borderRadius: '8px 8px 0 0', textAlign: 'center' }}>
            <Text style={{ fontFamily: serif, fontStyle: 'italic', fontWeight: 900, fontSize: 28, color: C.cream, margin: '0 0 4px', lineHeight: '1' }}>
              Legendairy
            </Text>
            <Text style={{ fontFamily: hand, fontSize: 16, color: C.marigold, margin: 0, lineHeight: '1' }}>
              — saved forever —
            </Text>
          </Section>

          {/* Body */}
          <Section style={{ background: C.cream, border: `2px solid ${C.ink}`, borderTop: 'none', padding: '36px 40px' }}>

            <Text style={{ fontFamily: serif, fontStyle: 'italic', fontWeight: 900, fontSize: 34, color: C.ink, margin: '0 0 6px', lineHeight: '1.05' }}>
              Your flavor has a permanent home.
            </Text>
            <Text style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 15, color: `${C.ink}77`, margin: '0 0 28px', lineHeight: '1.5' }}>
              Bookmark this email or click below anytime to come back to it — no account needed.
            </Text>

            {/* Flavor card */}
            <Section style={{ background: C.parchment, borderLeft: `5px solid ${C.rasp}`, padding: '18px 22px', margin: '0 0 28px' }}>
              <Text style={{ fontFamily: serif, fontStyle: 'italic', fontWeight: 900, fontSize: 22, color: C.ink, margin: '0 0 5px', lineHeight: '1.1' }}>
                {flavorName}
              </Text>
              <Text style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 14, color: C.rasp, margin: 0, lineHeight: '1.4' }}>
                {tagline}
              </Text>
            </Section>

            <Button
              href={flavorUrl}
              style={{ background: C.rasp, color: C.cream, fontFamily: serif, fontWeight: 700, fontStyle: 'italic', fontSize: 16, padding: '15px 36px', border: `2px solid ${C.ink}`, textDecoration: 'none', display: 'inline-block' }}
            >
              Order it now — $39.98 →
            </Button>

            <Hr style={{ border: 'none', borderTop: `1px solid ${C.ink}18`, margin: '28px 0 20px' }} />

            <Text style={{ fontFamily: serif, fontSize: 13, color: `${C.ink}55`, margin: 0, lineHeight: '1.7' }}>
              This flavor was made specifically for your prompt and will never be recreated for anyone else.
              It&apos;s yours whenever you&apos;re ready. Questions? Reply to this email.
            </Text>

          </Section>

          {/* Footer */}
          <Section style={{ background: C.ink, padding: '16px 40px', borderRadius: '0 0 8px 8px', textAlign: 'center' }}>
            <Text style={{ fontFamily: serif, fontSize: 11, color: `${C.cream}55`, margin: 0, letterSpacing: '0.06em' }}>
              Legendairy · Artisan Ice Cream · legendairyicecream.com
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  )
}
