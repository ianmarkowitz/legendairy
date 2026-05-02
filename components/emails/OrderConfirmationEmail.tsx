import {
  Html, Head, Body, Preview, Container,
  Section, Row, Column, Text, Hr, Button,
} from '@react-email/components'
import type { SpecSheet } from '@/types/flavor'
import { formatCents, formatShipDate, calculateShipDate } from '@/lib/utils'

interface Props {
  orderRef:      string
  customerName:  string
  spec:          SpecSheet
  totalCents:    number
  orderDate:     Date
  flavorUrl:     string
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

export function OrderConfirmationEmail({ orderRef, customerName, spec, totalCents, orderDate, flavorUrl }: Props) {
  const shipDate      = formatShipDate(calculateShipDate(orderDate))
  const firstName     = customerName.split(' ')[0] || customerName
  const enabledMixIns = spec.mixIns.filter(m => spec.enabledMixIns.includes(m.name))

  return (
    <Html lang="en">
      <Head>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,700;1,9..144,400;1,9..144,700;1,9..144,900&family=Caveat:wght@600;700&display=swap');`}</style>
      </Head>
      <Preview>Your {spec.flavorName} is confirmed — we begin churning tomorrow morning.</Preview>
      <Body style={{ background: C.parchment, margin: 0, padding: 0 }}>
        <Container style={{ maxWidth: 580, margin: '0 auto', padding: '40px 16px 64px' }}>

          {/* Header */}
          <Section style={{ background: C.ink, padding: '32px 40px', borderRadius: '8px 8px 0 0', textAlign: 'center' }}>
            <Text style={{ fontFamily: serif, fontStyle: 'italic', fontWeight: 900, fontSize: 30, color: C.cream, margin: '0 0 6px', lineHeight: '1' }}>
              Legendairy
            </Text>
            <Text style={{ fontFamily: hand, fontSize: 18, color: C.marigold, margin: 0, lineHeight: '1' }}>
              — order confirmed —
            </Text>
          </Section>

          {/* Body */}
          <Section style={{ background: C.cream, border: `2px solid ${C.ink}`, borderTop: 'none', padding: '36px 40px' }}>

            <Text style={{ fontFamily: serif, fontStyle: 'italic', fontWeight: 900, fontSize: 38, color: C.ink, margin: '0 0 4px', lineHeight: '1.05' }}>
              Thank you, {firstName}.
            </Text>
            <Text style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 16, color: C.ink, margin: '0 0 32px', lineHeight: '1' }}>
              We begin at sunrise.
            </Text>

            {/* Flavor card */}
            <Section style={{ background: C.parchment, borderLeft: `5px solid ${C.rasp}`, padding: '18px 22px', margin: '0 0 30px' }}>
              <Text style={{ fontFamily: serif, fontStyle: 'italic', fontWeight: 900, fontSize: 22, color: C.ink, margin: '0 0 5px', lineHeight: '1.1' }}>
                {spec.flavorName}
              </Text>
              <Text style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 14, color: C.rasp, margin: 0, lineHeight: '1.4' }}>
                {spec.tagline}
              </Text>
            </Section>

            {/* Order details — 2 col */}
            <Hr style={{ border: 'none', borderTop: `1px solid ${C.ink}22`, margin: '0 0 20px' }} />
            <Row>
              <Column style={{ width: '50%', paddingRight: 12 }}>
                <Text style={{ fontFamily: serif, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.16em', color: `${C.ink}66`, margin: '0 0 4px' }}>Order ref</Text>
                <Text style={{ fontFamily: serif, fontWeight: 700, fontSize: 15, color: C.ink, margin: '0 0 18px' }}>{orderRef}</Text>
              </Column>
              <Column style={{ width: '50%', paddingLeft: 12 }}>
                <Text style={{ fontFamily: serif, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.16em', color: `${C.ink}66`, margin: '0 0 4px' }}>Est. ship date</Text>
                <Text style={{ fontFamily: serif, fontWeight: 700, fontSize: 15, color: C.ink, margin: '0 0 18px' }}>{shipDate}</Text>
              </Column>
            </Row>
            <Row>
              <Column style={{ width: '50%', paddingRight: 12 }}>
                <Text style={{ fontFamily: serif, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.16em', color: `${C.ink}66`, margin: '0 0 4px' }}>Quantity</Text>
                <Text style={{ fontFamily: serif, fontWeight: 700, fontSize: 15, color: C.ink, margin: 0 }}>{spec.quantityQuarts} quarts</Text>
              </Column>
              <Column style={{ width: '50%', paddingLeft: 12 }}>
                <Text style={{ fontFamily: serif, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.16em', color: `${C.ink}66`, margin: '0 0 4px' }}>Total</Text>
                <Text style={{ fontFamily: serif, fontWeight: 700, fontSize: 15, color: C.ink, margin: 0 }}>{formatCents(totalCents)}</Text>
              </Column>
            </Row>

            {/* What's inside */}
            <Hr style={{ border: 'none', borderTop: `1px solid ${C.ink}22`, margin: '24px 0 18px' }} />
            <Text style={{ fontFamily: serif, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.16em', color: `${C.ink}66`, margin: '0 0 12px' }}>What&apos;s inside</Text>
            <Text style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 15, color: C.ink, margin: '0 0 8px' }}>
              {spec.primaryFlavor}
            </Text>
            {enabledMixIns.map(m => (
              <Text key={m.name} style={{ fontFamily: serif, fontSize: 14, color: `${C.ink}88`, margin: '0 0 5px', paddingLeft: 14 }}>
                ✦ {m.name}
              </Text>
            ))}

            {/* Allergen warning */}
            {spec.allergenFlags.length > 0 && (
              <Section style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', padding: '12px 16px', margin: '20px 0 0', borderRadius: 4 }}>
                <Text style={{ fontFamily: serif, fontWeight: 700, fontSize: 13, color: '#DC2626', margin: 0 }}>
                  ⚠ Contains: {spec.allergenFlags.map(a => a.toUpperCase()).join(', ')}
                </Text>
              </Section>
            )}

            {/* Personal note / dedication */}
            {spec.personalNote && (
              <>
                <Hr style={{ border: 'none', borderTop: `1px dashed ${C.ink}33`, margin: '24px 0 18px' }} />
                <Text style={{ fontFamily: serif, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.16em', color: `${C.ink}55`, margin: '0 0 8px' }}>Your label dedication</Text>
                <Text style={{ fontFamily: hand, fontSize: 21, color: C.rasp, margin: 0, lineHeight: '1.45' }}>
                  &ldquo;{spec.personalNote}&rdquo;
                </Text>
              </>
            )}

            {/* CTA */}
            <Hr style={{ border: 'none', borderTop: `1px solid ${C.ink}22`, margin: '28px 0 24px' }} />
            <Button
              href={flavorUrl}
              style={{ background: C.rasp, color: C.cream, fontFamily: serif, fontWeight: 700, fontStyle: 'italic', fontSize: 15, padding: '14px 32px', border: `2px solid ${C.ink}`, textDecoration: 'none', display: 'inline-block' }}
            >
              View your flavor →
            </Button>

            <Text style={{ fontFamily: serif, fontSize: 13, color: `${C.ink}55`, margin: '24px 0 0', lineHeight: '1.6' }}>
              Questions? Reply to this email and we&apos;ll get back to you quickly.
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
