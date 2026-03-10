import { NextResponse } from 'next/server'
import { sendMakerAlert, sendOrderConfirmation } from '@/lib/email'
import type { SpecSheet } from '@/types/flavor'

// ⚠️  TEMPORARY — remove before launch
export async function GET() {
  const fakeSpec: SpecSheet = {
    orderRef:               'LD-TEST-001',
    flavorCreationId:       '00000000-0000-0000-0000-000000000000',
    customerPrompt:         'Something with brown butter and sea salt',
    flavorName:             'Brown Butter Sea Salt Caramel',
    tagline:                'Salty, nutty, deeply caramelised.',
    baseType:               'Whole Cream',
    milkfatPercent:         14,
    milkfatRationale:       'Rich base for caramel notes',
    primaryFlavor:          'Brown butter caramel',
    sweetnessLevel:         6,
    sweetenerType:          'Cane sugar',
    sweetenerGramsPerQtBase: 140,
    mixIns: [
      { name: 'Sea salt flakes', weightGrams: 8,  foldMethod: 'fold-frozen',       prepNote: null },
      { name: 'Caramel ribbons', weightGrams: 60, foldMethod: 'swirl-softened',    prepNote: 'Heat to 180°F, cool before folding' },
    ],
    enabledMixIns:     ['Sea salt flakes', 'Caramel ribbons'],
    allergenFlags:     ['dairy'],
    makerNotes:        'Brown butter until golden before incorporating.',
    personalNote:      'For the best ice cream lover I know',
    quantityQuarts:    2,
    batchCount:        1,
    liquidBaseTotalQt: 1.5,
    vegan:             false,
  }

  const opts = {
    orderRef:      'LD-TEST-001',
    customerName:  'Test Customer',
    customerEmail: 'ianbrit@ianmarkowitz.com',
    spec:          fakeSpec,
    totalCents:    3998,
    orderDate:     new Date(),
  }

  try {
    const [maker, confirm] = await Promise.allSettled([
      sendMakerAlert(opts),
      sendOrderConfirmation(opts),
    ])

    return NextResponse.json({
      maker:   maker.status   === 'fulfilled' ? maker.value   : { error: String((maker   as PromiseRejectedResult).reason) },
      confirm: confirm.status === 'fulfilled' ? confirm.value : { error: String((confirm as PromiseRejectedResult).reason) },
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
