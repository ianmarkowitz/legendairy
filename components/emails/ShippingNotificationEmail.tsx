import {
  Html, Head, Body, Preview, Container,
  Section, Row, Column, Text, Hr, Button,
} from '@react-email/components'

interface Props {
  orderRef:       string
  customerName:   string
  flavorName:     string
  carrier:        string
  trackingNumber: string
  trackingUrl:    string | null
  shippedAt:      Date
}

const C = {
  parchment: '#F1E1BC',
  cream:     '#FBF3D9',
  ink:       '#2A1810',
  rasp:      '#C83A4E',
  marigold:  '#E8A628',
  pist:      '#6B8E3D',
}

const serif = 'Fraunces, Georgia, serif'
const hand  = 'Caveat, cursive'

export function ShippingNotificationEmail({ orderRef, customerName, flavorName, carrier, trackingNumber, trackingUrl, shippedAt }: Props) {
  const firstName  = customerName.split(' ')[0] || customerName
  const shippedStr = shippedAt.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <Html lang="en">
      <Head>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,700;1,9..144,400;1,9..144,700;1,9..144,900&family=Caveat:wght@600;700&display=swap');`}</style>
      </Head>
      <Preview>Your {flavorName} is on its way — keep an eye on the door.</Preview>
      <Body style={{ background: C.parchment, margin: 0, padding: 0 }}>
        <Container style={{ maxWidth: 580, margin: '0 auto', padding: '40px 16px 64px' }}>

          {/* Header */}
          <Section style={{ background: C.pist, padding: '32px 40px', borderRadius: '8px 8px 0 0', textAlign: 'center' }}>
            <Text style={{ fontFamily: serif, fontStyle: 'italic', fontWeight: 900, fontSize: 30, color: C.cream, margin: '0 0 6px', lineHeight: '1' }}>
              Legendairy
            </Text>
            <Text style={{ fontFamily: hand, fontSize: 18, color: C.cream, margin: 0, lineHeight: '1' }}>
              — it&apos;s on its way —
            </Text>
          </Section>

          {/* Body */}
          <Section style={{ background: C.cream, border: `2px solid ${C.ink}`, borderTop: 'none', padding: '36px 40px' }}>

            <Text style={{ fontFamily: serif, fontStyle: 'italic', fontWeight: 900, fontSize: 38, color: C.ink, margin: '0 0 4px', lineHeight: '1.05' }}>
              It&apos;s coming, {firstName}.
            </Text>
            <Text style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 16, color: `${C.ink}88`, margin: '0 0 32px' }}>
              Your {flavorName} has left our hands and is heading to yours.
            </Text>

            {/* Tracking card */}
            <Section style={{ background: C.parchment, border: `2px solid ${C.ink}`, padding: '24px 28px', margin: '0 0 28px', textAlign: 'center' }}>
              <Text style={{ fontFamily: serif, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.2em', color: `${C.ink}66`, margin: '0 0 8px' }}>
                {carrier} Tracking Number
              </Text>
              <Text style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 26, color: C.ink, margin: '0 0 16px', letterSpacing: '0.08em' }}>
                {trackingNumber}
              </Text>
              {trackingUrl ? (
                <Button
                  href={trackingUrl}
                  style={{ background: C.ink, color: C.cream, fontFamily: serif, fontWeight: 700, fontStyle: 'italic', fontSize: 15, padding: '12px 28px', textDecoration: 'none', display: 'inline-block' }}
                >
                  Track with {carrier} →
                </Button>
              ) : (
                <Text style={{ fontFamily: serif, fontSize: 13, color: `${C.ink}66`, margin: 0 }}>
                  Enter your tracking number at your carrier&apos;s website to follow the shipment.
                </Text>
              )}
            </Section>

            {/* Details */}
            <Hr style={{ border: 'none', borderTop: `1px solid ${C.ink}22`, margin: '0 0 20px' }} />
            <Row>
              <Column style={{ width: '50%', paddingRight: 12 }}>
                <Text style={{ fontFamily: serif, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.16em', color: `${C.ink}66`, margin: '0 0 4px' }}>Order ref</Text>
                <Text style={{ fontFamily: serif, fontWeight: 700, fontSize: 15, color: C.ink, margin: '0 0 18px' }}>{orderRef}</Text>
              </Column>
              <Column style={{ width: '50%', paddingLeft: 12 }}>
                <Text style={{ fontFamily: serif, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.16em', color: `${C.ink}66`, margin: '0 0 4px' }}>Shipped</Text>
                <Text style={{ fontFamily: serif, fontWeight: 700, fontSize: 15, color: C.ink, margin: '0 0 18px' }}>{shippedStr}</Text>
              </Column>
            </Row>

            {/* Reminder note */}
            <Section style={{ background: C.parchment, borderLeft: `4px solid ${C.marigold}`, padding: '14px 18px', margin: '8px 0 0' }}>
              <Text style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 14, color: C.ink, margin: 0, lineHeight: '1.6' }}>
                <strong>Heads up:</strong> transfer to the freezer as soon as it arrives — dry ice keeps it cold in transit but won&apos;t last long once at your door. If your order arrives damaged or melted, contact us that same day at hello@legendairyicecream.com.
              </Text>
            </Section>

            <Text style={{ fontFamily: serif, fontSize: 13, color: `${C.ink}55`, margin: '24px 0 0', lineHeight: '1.6' }}>
              Questions? Reply to this email and we&apos;ll sort it out.
            </Text>

          </Section>

          {/* Footer */}
          <Section style={{ background: C.ink, padding: '18px 40px', borderRadius: '0 0 8px 8px', textAlign: 'center' }}>
            <Text style={{ fontFamily: serif, fontSize: 11, color: `${C.cream}55`, margin: 0, letterSpacing: '0.06em' }}>
              Legendairy · Artisan Ice Cream · legendairyicecream.com
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  )
}
