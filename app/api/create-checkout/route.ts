import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getStripe } from '@/lib/stripe'
import { supabase } from '@/lib/supabase'
import { createClient } from '@/lib/supabase-server'
import { PRICE_PER_QUART_CENTS, MIN_QUARTS, QUART_INCREMENT } from '@/lib/constants'
import { buildSpecSheet } from '@/lib/utils'
import type { FlavorOutput, FlavorCustomizations } from '@/types/flavor'

const BodySchema = z.object({
  flavorCreationId: z.string().uuid(),
  quantityQuarts:   z.number().int().min(MIN_QUARTS).refine(
    q => q % QUART_INCREMENT === 0,
    { message: `Quantity must be a multiple of ${QUART_INCREMENT}` },
  ),
  customizations: z.object({
    enabledMixIns:    z.array(z.string()).min(1, 'At least one mix-in must be selected'),
    sweetnessLevel:   z.number().int().min(1).max(10),
    customFlavorName: z.string().nullable(),
    personalNote:     z.string().max(200).nullable(),
  }),
})

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const parsed = BodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? 'Invalid request.' },
      { status: 400 },
    )
  }

  const { flavorCreationId, quantityQuarts, customizations } = parsed.data
  const totalCents = quantityQuarts * PRICE_PER_QUART_CENTS

  // Read auth session — include user_id in Stripe metadata if logged in
  const serverSupabase = await createClient()
  const { data: { user } } = await serverSupabase.auth.getUser()

  // Fetch the flavor creation from DB
  const { data: fc, error: fcErr } = await supabase
    .from('flavor_creations')
    .select('*')
    .eq('id', flavorCreationId)
    .single()

  if (fcErr || !fc) {
    return NextResponse.json({ error: 'Flavor not found.' }, { status: 404 })
  }

  const flavor: FlavorOutput = {
    flavorName:       fc.flavor_name,
    tagline:          fc.tagline,
    description:      fc.description,
    whyThisFlavor:    fc.why_this_flavor,
    milkfatPercent:   fc.milkfat_percent,
    milkfatRationale: fc.milkfat_rationale,
    primaryFlavor:    fc.primary_flavor,
    sweetnessLevel:   fc.sweetness_level,
    sweetenerType:    fc.sweetener_type,
    mixIns:           fc.mix_ins,
    allergenFlags:    fc.allergen_flags ?? [],
    suggestedColor:   fc.suggested_color,
    makerNotes:       fc.maker_notes ?? '',
  }

  const spec = buildSpecSheet(
    flavorCreationId,
    fc.customer_prompt,
    flavor,
    customizations as FlavorCustomizations,
    quantityQuarts,
  )

  const displayName = customizations.customFlavorName ?? flavor.flavorName
  const baseUrl     = process.env.NEXT_PUBLIC_BASE_URL!

  // Store spec as JSON string for Stripe metadata (< 500 chars per value)
  // We store the key IDs and pass the rest via DB lookup in the webhook
  const stripeMetadata: Record<string, string> = {
    flavor_creation_id:  flavorCreationId,
    quantity_quarts:     String(quantityQuarts),
    sweetness_level:     String(customizations.sweetnessLevel),
    custom_flavor_name:  customizations.customFlavorName ?? '',
    personal_note:       (customizations.personalNote ?? '').slice(0, 490),
    enabled_mix_ins:     JSON.stringify(customizations.enabledMixIns).slice(0, 490),
    user_id:             user?.id ?? '',
  }

  const session = await getStripe().checkout.sessions.create({
    mode:               'payment',
    line_items: [{
      quantity:   1,
      price_data: {
        currency:     'usd',
        unit_amount:  totalCents,
        product_data: {
          name:        `Legendairy — ${displayName}`,
          description: `${quantityQuarts} quarts · ${spec.batchCount} batch${spec.batchCount > 1 ? 'es' : ''} · ${flavor.tagline}`,
        },
      },
    }],
    // Collect shipping address — saved to orders.delivery_address in webhook
    shipping_address_collection: { allowed_countries: ['US'] },
    billing_address_collection: 'auto',
    // Attach metadata to the payment intent (source of truth per spec)
    payment_intent_data: { metadata: stripeMetadata },
    metadata: stripeMetadata, // Also on session for checkout.session.completed
    success_url: `${baseUrl}/order-confirmed?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:  `${baseUrl}/flavor/${flavorCreationId}`,
  })

  return NextResponse.json({ url: session.url })
}
