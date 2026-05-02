import {
  Html, Head, Body, Preview, Container,
  Section, Row, Column, Text, Hr,
} from '@react-email/components'
import type { SpecSheet } from '@/types/flavor'
import { formatCents, formatShipDate, calculateShipDate } from '@/lib/utils'

interface Props {
  orderRef:      string
  customerName:  string
  customerEmail: string
  spec:          SpecSheet
  totalCents:    number
  orderDate:     Date
}

const C = {
  parchment: '#F1E1BC',
  cream:     '#FBF3D9',
  ink:       '#2A1810',
  rasp:      '#C83A4E',
  marigold:  '#E8A628',
}

const serif = 'Fraunces, Georgia, serif'

export function MakerAlertEmail({ orderRef, customerName, customerEmail, spec, totalCents, orderDate }: Props) {
  const shipDate      = formatShipDate(calculateShipDate(orderDate))
  const enabledMixIns = spec.mixIns.filter(m => spec.enabledMixIns.includes(m.name))

  return (
    <Html lang="en">
      <Head>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,700;1,9..144,400;1,9..144,700;1,9..144,900&display=swap');`}</style>
      </Head>
      <Preview>[NEW ORDER] {orderRef} — {spec.flavorName} · {String(spec.quantityQuarts)} qt · {customerName}</Preview>
      <Body style={{ background: C.parchment, margin: 0, padding: 0 }}>
        <Container style={{ maxWidth: 680, margin: '0 auto', padding: '40px 16px 64px' }}>

          {/* Header */}
          <Section style={{ background: C.ink, padding: '24px 32px', borderRadius: '8px 8px 0 0' }}>
            <Row>
              <Column>
                <Text style={{ fontFamily: serif, fontStyle: 'italic', fontWeight: 900, fontSize: 20, color: C.cream, margin: 0 }}>
                  Legendairy — Production Spec
                </Text>
              </Column>
              <Column style={{ textAlign: 'right' }}>
                <Text style={{ fontFamily: serif, fontSize: 11, color: `${C.cream}66`, margin: 0, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                  {orderRef}
                </Text>
              </Column>
            </Row>
          </Section>

          <Section style={{ background: C.cream, border: `2px solid ${C.ink}`, borderTop: 'none', padding: '28px 32px' }}>

            {/* Top order summary */}
            <Row>
              <Column style={{ width: '25%', paddingRight: 8 }}>
                <Text style={{ fontFamily: serif, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.14em', color: `${C.ink}60`, margin: '0 0 4px' }}>Customer</Text>
                <Text style={{ fontFamily: serif, fontWeight: 700, fontSize: 14, color: C.ink, margin: 0 }}>{customerName}</Text>
                <Text style={{ fontFamily: serif, fontSize: 12, color: `${C.ink}66`, margin: '2px 0 0' }}>{customerEmail}</Text>
              </Column>
              <Column style={{ width: '25%', paddingRight: 8 }}>
                <Text style={{ fontFamily: serif, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.14em', color: `${C.ink}60`, margin: '0 0 4px' }}>Ship Date</Text>
                <Text style={{ fontFamily: serif, fontWeight: 700, fontSize: 14, color: C.rasp, margin: 0 }}>{shipDate}</Text>
              </Column>
              <Column style={{ width: '25%', paddingRight: 8 }}>
                <Text style={{ fontFamily: serif, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.14em', color: `${C.ink}60`, margin: '0 0 4px' }}>Quantity</Text>
                <Text style={{ fontFamily: serif, fontWeight: 700, fontSize: 14, color: C.ink, margin: 0 }}>{spec.quantityQuarts} qt · {spec.batchCount} batch{spec.batchCount > 1 ? 'es' : ''}</Text>
              </Column>
              <Column style={{ width: '25%' }}>
                <Text style={{ fontFamily: serif, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.14em', color: `${C.ink}60`, margin: '0 0 4px' }}>Total</Text>
                <Text style={{ fontFamily: serif, fontWeight: 700, fontSize: 14, color: C.ink, margin: 0 }}>{formatCents(totalCents)}</Text>
              </Column>
            </Row>

            <Hr style={{ border: 'none', borderTop: `2px solid ${C.ink}`, margin: '20px 0' }} />

            {/* Flavor */}
            <Text style={{ fontFamily: serif, fontStyle: 'italic', fontWeight: 900, fontSize: 26, color: C.ink, margin: '0 0 4px', lineHeight: '1.05' }}>
              {spec.flavorName}
            </Text>
            <Text style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 14, color: C.rasp, margin: '0 0 16px' }}>
              {spec.tagline}
            </Text>

            {/* Customer prompt */}
            <Section style={{ background: C.parchment, borderLeft: `4px solid ${C.marigold}`, padding: '12px 16px', margin: '0 0 20px' }}>
              <Text style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 13, color: `${C.ink}88`, margin: 0, lineHeight: '1.6' }}>
                &ldquo;{spec.customerPrompt}&rdquo;
              </Text>
            </Section>

            <Hr style={{ border: 'none', borderTop: `1px solid ${C.ink}22`, margin: '0 0 18px' }} />

            {/* Recipe base */}
            <Text style={{ fontFamily: serif, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.14em', color: `${C.ink}60`, margin: '0 0 12px' }}>Recipe Base</Text>
            <Row style={{ marginBottom: 6 }}>
              <Column style={{ width: '40%' }}><Text style={{ fontFamily: serif, fontSize: 13, color: `${C.ink}66`, margin: 0 }}>Base Type</Text></Column>
              <Column><Text style={{ fontFamily: serif, fontWeight: 700, fontSize: 13, color: C.ink, margin: 0 }}>{spec.baseType}</Text></Column>
            </Row>
            <Row style={{ marginBottom: 6 }}>
              <Column style={{ width: '40%' }}><Text style={{ fontFamily: serif, fontSize: 13, color: `${C.ink}66`, margin: 0 }}>Milkfat</Text></Column>
              <Column><Text style={{ fontFamily: serif, fontSize: 13, color: C.ink, margin: 0 }}>{spec.milkfatPercent}% — {spec.milkfatRationale}</Text></Column>
            </Row>
            <Row style={{ marginBottom: 6 }}>
              <Column style={{ width: '40%' }}><Text style={{ fontFamily: serif, fontSize: 13, color: `${C.ink}66`, margin: 0 }}>Primary Flavor</Text></Column>
              <Column><Text style={{ fontFamily: serif, fontSize: 13, color: C.ink, margin: 0 }}>{spec.primaryFlavor}</Text></Column>
            </Row>
            <Row style={{ marginBottom: 6 }}>
              <Column style={{ width: '40%' }}><Text style={{ fontFamily: serif, fontSize: 13, color: `${C.ink}66`, margin: 0 }}>Sweetener</Text></Column>
              <Column><Text style={{ fontFamily: serif, fontSize: 13, color: C.ink, margin: 0 }}>{spec.sweetenerType}, level {spec.sweetnessLevel}/10 — {spec.sweetenerGramsPerQtBase}g/qt base</Text></Column>
            </Row>

            <Hr style={{ border: 'none', borderTop: `1px solid ${C.ink}22`, margin: '18px 0' }} />

            {/* Batch numbers */}
            <Text style={{ fontFamily: serif, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.14em', color: `${C.ink}60`, margin: '0 0 12px' }}>Batch Production</Text>
            <Row style={{ marginBottom: 6 }}>
              <Column style={{ width: '40%' }}><Text style={{ fontFamily: serif, fontSize: 13, color: `${C.ink}66`, margin: 0 }}>Total Liquid Base</Text></Column>
              <Column><Text style={{ fontFamily: serif, fontWeight: 700, fontSize: 13, color: C.ink, margin: 0 }}>{spec.liquidBaseTotalQt} qt ({Math.round(spec.liquidBaseTotalQt * 946)} ml)</Text></Column>
            </Row>
            <Row style={{ marginBottom: 6 }}>
              <Column style={{ width: '40%' }}><Text style={{ fontFamily: serif, fontSize: 13, color: `${C.ink}66`, margin: 0 }}>Total Sugar</Text></Column>
              <Column><Text style={{ fontFamily: serif, fontWeight: 700, fontSize: 13, color: C.ink, margin: 0 }}>{Math.round(spec.sweetenerGramsPerQtBase * spec.liquidBaseTotalQt)}g</Text></Column>
            </Row>

            <Hr style={{ border: 'none', borderTop: `1px solid ${C.ink}22`, margin: '18px 0' }} />

            {/* Mix-ins */}
            <Text style={{ fontFamily: serif, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.14em', color: `${C.ink}60`, margin: '0 0 12px' }}>
              Mix-Ins ({enabledMixIns.length} active)
            </Text>

            {/* Mix-in header row */}
            <Section style={{ background: C.ink, padding: '8px 12px', margin: '0 0 2px' }}>
              <Row>
                <Column style={{ width: '30%' }}><Text style={{ fontFamily: serif, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.cream, margin: 0 }}>Ingredient</Text></Column>
                <Column style={{ width: '18%' }}><Text style={{ fontFamily: serif, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.cream, margin: 0 }}>Per Qt</Text></Column>
                <Column style={{ width: '20%' }}><Text style={{ fontFamily: serif, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.cream, margin: 0 }}>Batch Total</Text></Column>
                <Column><Text style={{ fontFamily: serif, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.cream, margin: 0 }}>Method</Text></Column>
              </Row>
            </Section>

            {enabledMixIns.map((m, i) => (
              <Section key={m.name} style={{ background: i % 2 === 0 ? C.cream : C.parchment, padding: '8px 12px', margin: 0 }}>
                <Row>
                  <Column style={{ width: '30%' }}><Text style={{ fontFamily: serif, fontWeight: 700, fontSize: 13, color: C.ink, margin: 0 }}>{m.name}</Text></Column>
                  <Column style={{ width: '18%' }}><Text style={{ fontFamily: serif, fontSize: 13, color: C.ink, margin: 0 }}>{m.weightGrams}g</Text></Column>
                  <Column style={{ width: '20%' }}><Text style={{ fontFamily: serif, fontSize: 13, color: C.ink, margin: 0 }}>{Math.round(m.weightGrams * spec.quantityQuarts)}g</Text></Column>
                  <Column>
                    <Text style={{ fontFamily: serif, fontSize: 13, color: C.ink, margin: 0 }}>
                      {m.foldMethod}{m.prepNote ? ` · ${m.prepNote}` : ''}
                    </Text>
                  </Column>
                </Row>
              </Section>
            ))}

            {/* Allergens */}
            <Hr style={{ border: 'none', borderTop: `1px solid ${C.ink}22`, margin: '18px 0' }} />
            <Text style={{ fontFamily: serif, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.14em', color: `${C.ink}60`, margin: '0 0 10px' }}>Allergens</Text>
            {spec.allergenFlags.length > 0 ? (
              <Section style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', padding: '10px 14px', borderRadius: 4 }}>
                <Text style={{ fontFamily: serif, fontWeight: 700, fontSize: 13, color: '#DC2626', margin: 0 }}>
                  ⚠ {spec.allergenFlags.map(a => a.toUpperCase()).join(' · ')}
                </Text>
              </Section>
            ) : (
              <Text style={{ fontFamily: serif, fontSize: 13, color: `${C.ink}55`, margin: 0 }}>None detected</Text>
            )}

            {/* Maker notes */}
            {spec.makerNotes && (
              <>
                <Hr style={{ border: 'none', borderTop: `1px solid ${C.ink}22`, margin: '18px 0' }} />
                <Text style={{ fontFamily: serif, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.14em', color: `${C.ink}60`, margin: '0 0 8px' }}>Maker Notes</Text>
                <Text style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 14, color: C.ink, margin: 0, lineHeight: '1.6' }}>
                  {spec.makerNotes}
                </Text>
              </>
            )}

            {/* Label dedication */}
            {spec.personalNote && (
              <>
                <Hr style={{ border: 'none', borderTop: `1px dashed ${C.ink}33`, margin: '18px 0' }} />
                <Text style={{ fontFamily: serif, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.14em', color: `${C.ink}60`, margin: '0 0 8px' }}>Label Dedication</Text>
                <Text style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 14, color: C.ink, margin: 0, lineHeight: '1.6' }}>
                  &ldquo;{spec.personalNote}&rdquo;
                </Text>
              </>
            )}

          </Section>

          {/* Footer */}
          <Section style={{ background: C.ink, padding: '16px 32px', borderRadius: '0 0 8px 8px', textAlign: 'center' }}>
            <Text style={{ fontFamily: serif, fontSize: 11, color: `${C.cream}55`, margin: 0, letterSpacing: '0.06em' }}>
              Legendairy · Internal Production Spec · {orderRef}
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  )
}
