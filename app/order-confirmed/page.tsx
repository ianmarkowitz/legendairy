import Link from 'next/link'

// Stripe redirects here with ?session_id=... after successful payment.
// The actual order processing happens in the webhook — this page is just
// a friendly confirmation. Never use the session_id here to confirm payment.

const C = {
  parchment: '#F1E1BC',
  cream:     '#FBF3D9',
  ink:       '#2A1810',
  rasp:      '#C83A4E',
  pist:      '#6B8E3D',
  marigold:  '#E8A628',
  cherry:    '#8A1F2B',
  grape:     '#6B3A78',
}

const fraunces = 'var(--font-fraunces)'
const caveat   = 'var(--font-caveat)'

const STARS: Array<{
  top?: string; bottom?: string
  left?: string; right?: string
  size: number; opacity: number; rotate: number
}> = [
  { top: '2%',   left: '1.5%', size: 24, opacity: 0.32, rotate: 0   },
  { top: '6%',   left: '4.5%', size: 14, opacity: 0.18, rotate: 22  },
  { top: '2.5%', left: '8%',   size: 10, opacity: 0.13, rotate: 47  },
  { top: '11%',  left: '1%',   size: 9,  opacity: 0.10, rotate: 72  },
  { top: '15%',  left: '3.5%', size: 16, opacity: 0.14, rotate: 10  },
  { top: '1%',   right: '2.5%',size: 20, opacity: 0.28, rotate: 18  },
  { top: '5%',   right: '6.5%',size: 12, opacity: 0.16, rotate: 38  },
  { top: '9%',   right: '3.5%',size: 17, opacity: 0.20, rotate: 6   },
  { top: '14%',  right: '1.5%',size: 10, opacity: 0.12, rotate: 58  },
  { bottom: '3.5%', left: '2.5%', size: 20, opacity: 0.26, rotate: 12 },
  { bottom: '7%',   left: '6%',   size: 11, opacity: 0.14, rotate: 54 },
  { bottom: '2.5%', right: '2%',  size: 26, opacity: 0.30, rotate: 28 },
  { bottom: '6%',   right: '5%',  size: 13, opacity: 0.18, rotate: 42 },
  { bottom: '10%',  right: '8%',  size: 9,  opacity: 0.12, rotate: 68 },
]

const STEPS = [
  { icon: '✓', timeLabel: 'Today · now',          desc: 'Payment confirmed',   done: true  },
  { icon: '◔', timeLabel: 'Tomorrow · 6:30 am',   desc: 'We begin churning',   done: false },
  { icon: '◐', timeLabel: 'Tomorrow · afternoon',  desc: 'Packed on dry ice',  done: false },
  { icon: '✦', timeLabel: '3–5 days',              desc: 'Pint arrives',        done: false },
]

export default function OrderConfirmed() {
  return (
    <div style={{
      minHeight:   '100vh',
      background:  C.parchment,
      position:    'relative',
      overflowX:   'hidden',
    }}>

      {/* Scattered confetti stars */}
      {STARS.map((s, i) => (
        <span key={i} aria-hidden="true" style={{
          position:      'absolute',
          top:           s.top,
          bottom:        s.bottom,
          left:          s.left,
          right:         s.right,
          fontSize:      s.size,
          opacity:       s.opacity,
          color:         C.ink,
          transform:     `rotate(${s.rotate}deg)`,
          lineHeight:    1,
          pointerEvents: 'none',
          userSelect:    'none',
        }}>
          ✦
        </span>
      ))}

      {/* Center column */}
      <div style={{
        maxWidth: 920,
        margin:   '0 auto',
        padding:  '72px 24px 120px',
      }}>

        {/* Handwritten subtitle */}
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <span style={{
            display:       'inline-block',
            fontFamily:    caveat,
            fontSize:      28,
            fontWeight:    600,
            color:         C.rasp,
            letterSpacing: '0.04em',
            transform:     'rotate(-2deg)',
          }}>
            — order confirmed —
          </span>
        </div>

        {/* Giant heading */}
        <h1 style={{
          fontFamily:    fraunces,
          fontSize:      'clamp(72px, 12vw, 140px)',
          fontWeight:    900,
          fontStyle:     'italic',
          color:         C.ink,
          lineHeight:    0.92,
          textAlign:     'center',
          margin:        '10px 0 18px',
          letterSpacing: '-0.02em',
        }}>
          Thank you.
        </h1>

        {/* Sub-heading */}
        <p style={{
          fontFamily:    fraunces,
          fontSize:      'clamp(22px, 3.5vw, 36px)',
          fontStyle:     'italic',
          color:         C.ink,
          opacity:       0.58,
          textAlign:     'center',
          margin:        '0 0 64px',
          letterSpacing: '0.01em',
        }}>
          We begin at sunrise.
        </p>

        {/* ── Two-column body ── */}
        <div style={{
          display:             'grid',
          gridTemplateColumns: '60fr 40fr',
          gap:                 52,
          alignItems:          'start',
        }}>

          {/* ── LEFT ── */}
          <div>

            {/* Churning paragraph */}
            <p style={{
              fontFamily:   fraunces,
              fontSize:     17,
              lineHeight:   1.80,
              color:        C.ink,
              opacity:      0.76,
              marginBottom: 36,
            }}>
              Your pint is already on our minds. Tomorrow morning we&apos;ll fire up the
              churn, fold in every ingredient by hand, and pack it straight onto dry ice
              before it ever sees a freezer. What arrives at your door is as close to the
              moment of creation as we can possibly get.
            </p>

            {/* Action buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 52 }}>

              {/* Primary — ink fill */}
              <Link href="/" style={{
                display:        'inline-flex',
                alignItems:     'center',
                justifyContent: 'center',
                gap:            8,
                padding:        '14px 28px',
                background:     C.ink,
                color:          C.cream,
                fontFamily:     fraunces,
                fontSize:       15,
                fontWeight:     700,
                letterSpacing:  '0.04em',
                textDecoration: 'none',
                border:         `2px solid ${C.ink}`,
                textTransform:  'uppercase' as const,
              }}>
                Add to Vault ♥
              </Link>

              {/* Outlined */}
              <button style={{
                display:        'inline-flex',
                alignItems:     'center',
                justifyContent: 'center',
                padding:        '13px 28px',
                background:     'transparent',
                color:          C.ink,
                fontFamily:     fraunces,
                fontSize:       15,
                fontWeight:     600,
                letterSpacing:  '0.03em',
                border:         `2px solid ${C.ink}`,
                cursor:         'pointer',
                opacity:        0.70,
                textTransform:  'uppercase' as const,
              }}>
                Share this flavor
              </button>

              {/* Outlined */}
              <Link href="/" style={{
                display:        'inline-flex',
                alignItems:     'center',
                justifyContent: 'center',
                padding:        '13px 28px',
                background:     'transparent',
                color:          C.ink,
                fontFamily:     fraunces,
                fontSize:       15,
                fontWeight:     600,
                letterSpacing:  '0.03em',
                textDecoration: 'none',
                border:         `2px solid ${C.ink}`,
                opacity:        0.70,
                textTransform:  'uppercase' as const,
              }}>
                Create account
              </Link>
            </div>

            {/* Timeline */}
            <div style={{
              borderLeft:  `2px solid ${C.ink}`,
              paddingLeft: 32,
            }}>
              {STEPS.map((step, i) => (
                <div key={i} style={{
                  position:     'relative',
                  marginBottom: i < STEPS.length - 1 ? 32 : 0,
                }}>
                  {/* Icon dot on the line */}
                  <div style={{
                    position:       'absolute',
                    left:           -42,
                    top:            2,
                    width:          22,
                    height:         22,
                    background:     step.done ? C.ink : C.parchment,
                    border:         `2px solid ${C.ink}`,
                    display:        'flex',
                    alignItems:     'center',
                    justifyContent: 'center',
                    fontSize:       10,
                    color:          step.done ? C.cream : C.ink,
                    fontFamily:     fraunces,
                  }}>
                    {step.icon}
                  </div>

                  {/* Time label — small caps */}
                  <p style={{
                    fontFamily:    fraunces,
                    fontSize:      10,
                    textTransform: 'uppercase',
                    letterSpacing: '0.15em',
                    color:         C.ink,
                    opacity:       0.42,
                    margin:        '0 0 3px',
                  }}>
                    {step.timeLabel}
                  </p>

                  {/* Step description */}
                  <p style={{
                    fontFamily: fraunces,
                    fontSize:   16,
                    fontWeight: step.done ? 700 : 500,
                    color:      C.ink,
                    opacity:    step.done ? 1 : 0.58,
                    margin:     0,
                  }}>
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>

          </div>

          {/* ── RIGHT — label preview card ── */}
          <div style={{
            position:       'sticky',
            top:            48,
            display:        'flex',
            justifyContent: 'center',
          }}>
            <div style={{
              position:  'relative',
              width:     '100%',
              maxWidth:  300,
              background: C.cream,
              border:    `2px solid ${C.ink}`,
              padding:   '40px 28px 32px',
              transform: 'rotate(-2deg)',
              boxShadow: `16px 16px 0 ${C.marigold}`,
            }}>

              {/* Wax seal — top-left */}
              <div style={{
                position:       'absolute',
                top:            -18,
                left:           -18,
                width:          50,
                height:         50,
                background:     C.cherry,
                borderRadius:   '50%',
                border:         `2px solid ${C.ink}`,
                boxShadow:      `2px 2px 0 ${C.ink}`,
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
              }}>
                <span style={{
                  fontFamily: fraunces,
                  fontSize:   22,
                  fontWeight: 900,
                  fontStyle:  'italic',
                  color:      C.cream,
                }}>
                  L
                </span>
              </div>

              {/* Starburst badge — top-right */}
              <div style={{
                position:       'absolute',
                top:            -16,
                right:          -16,
                width:          58,
                height:         58,
                background:     C.pist,
                clipPath:       'polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                flexDirection:  'column',
              }}>
                <span style={{
                  fontFamily:    caveat,
                  fontSize:      8.5,
                  fontWeight:    700,
                  color:         C.cream,
                  textAlign:     'center',
                  lineHeight:    1.2,
                  letterSpacing: '0.01em',
                  whiteSpace:    'pre-line',
                }}>
                  {`order\nplaced!`}
                </span>
              </div>

              {/* Flavor name */}
              <h2 style={{
                fontFamily:    fraunces,
                fontSize:      27,
                fontStyle:     'italic',
                fontWeight:    900,
                color:         C.ink,
                lineHeight:    1.06,
                margin:        '8px 0 10px',
                letterSpacing: '-0.01em',
              }}>
                Bonfire on the<br />Boardwalk
              </h2>

              {/* Tagline */}
              <p style={{
                fontFamily: fraunces,
                fontSize:   13,
                fontStyle:  'italic',
                color:      C.ink,
                opacity:    0.52,
                margin:     '0 0 18px',
                lineHeight: 1.45,
              }}>
                Brown sugar · sea salt · driftwood smoke
              </p>

              {/* Divider */}
              <div style={{
                borderTop:    `1px solid ${C.ink}`,
                opacity:      0.16,
                marginBottom: 16,
              }} />

              {/* Handwritten dedication */}
              <p style={{
                fontFamily: caveat,
                fontSize:   19,
                color:      C.rasp,
                lineHeight: 1.42,
                margin:     0,
                transform:  'rotate(-1deg)',
              }}>
                &ldquo;For the last night of summer — may it linger.&rdquo;
              </p>

              {/* Footer labels */}
              <div style={{
                marginTop:      24,
                display:        'flex',
                justifyContent: 'space-between',
                alignItems:     'center',
              }}>
                <span style={{
                  fontFamily:    fraunces,
                  fontSize:      9,
                  textTransform: 'uppercase',
                  letterSpacing: '0.18em',
                  color:         C.ink,
                  opacity:       0.36,
                }}>
                  Small-batch · Handcrafted
                </span>
                <span style={{
                  fontFamily:    fraunces,
                  fontSize:      9,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  color:         C.ink,
                  opacity:       0.36,
                }}>
                  ✦ Atelier
                </span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
