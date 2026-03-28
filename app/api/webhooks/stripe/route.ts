import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getStripe } from '@/lib/stripe'
import { supabase } from '@/lib/supabase'
import { sendMakerAlert, sendOrderConfirmation } from '@/lib/email'
import { buildSpecSheet, buildOrderRef } from '@/lib/utils'
import type { FlavorOutput, FlavorCustomizations } from '@/types/flavor'

// Raw body is read via req.text() below — no config needed in App Router.
export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const sig     = req.headers.get('stripe-signature')

  if (!sig) return NextResponse.json({ error: 'No signature' }, { status: 400 })

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // ── Handle checkout.session.completed ───────────────────────────────────────
  // This fires when the customer finishes checkout. The underlying
  // payment_intent.succeeded has already fired at this point.
  // We use checkout.session.completed because it gives us the customer
  // email and session metadata in a single event.
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    // Idempotency guard — skip if order already exists for this session
    const { data: existing } = await supabase
      .from('orders')
      .select('id')
      .eq('stripe_session_id', session.id)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ received: true }) // already processed
    }

    const meta = session.metadata ?? {}
    const flavorCreationId = meta.flavor_creation_id
    const quantityQuarts   = parseInt(meta.quantity_quarts ?? '2', 10)
    const vegan            = meta.vegan === 'true'
    const sweetnessLevel   = parseInt(meta.sweetness_level ?? '5', 10)
    const customFlavorName = meta.custom_flavor_name || null
    const personalNote     = meta.personal_note || null
    const enabledMixIns: string[] = JSON.parse(meta.enabled_mix_ins ?? '[]')
    const userId           = meta.user_id || null

    if (!flavorCreationId) {
      console.error('Webhook missing flavor_creation_id in metadata')
      return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
    }

    // Fetch the flavor creation
    const { data: fc, error: fcErr } = await supabase
      .from('flavor_creations')
      .select('*')
      .eq('id', flavorCreationId)
      .single()

    if (fcErr || !fc) {
      console.error('Flavor creation not found for ID:', flavorCreationId)
      return NextResponse.json({ error: 'Flavor not found' }, { status: 404 })
    }

    // Update flavor_creations with final customized values
    await supabase
      .from('flavor_creations')
      .update({
        flavor_name:     customFlavorName ?? fc.flavor_name,
        sweetness_level: sweetnessLevel,
        personal_note:   personalNote,
      })
      .eq('id', flavorCreationId)

    const flavor: FlavorOutput = {
      flavorName:       fc.flavor_name,
      tagline:          fc.tagline,
      description:      fc.description,
      whyThisFlavor:    fc.why_this_flavor,
      milkfatPercent:   fc.milkfat_percent,
      milkfatRationale: fc.milkfat_rationale,
      primaryFlavor:    fc.primary_flavor,
      sweetnessLevel:   sweetnessLevel,
      sweetenerType:    fc.sweetener_type,
      mixIns:           fc.mix_ins,
      allergenFlags:    fc.allergen_flags ?? [],
      suggestedColor:   fc.suggested_color,
      makerNotes:       fc.maker_notes ?? '',
    }

    const customizations: FlavorCustomizations = {
      vegan, enabledMixIns, sweetnessLevel, customFlavorName, personalNote,
    }

    const orderDate  = new Date()
    const totalCents = quantityQuarts * 100 * 19.99 // safety recalc

    // Generate sequential order ref for today
    const today = new Date()
    const dateStr = `${today.getFullYear()}${String(today.getMonth()+1).padStart(2,'0')}${String(today.getDate()).padStart(2,'0')}`
    const { count: todayCount } = await supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .like('order_reference', `LD-${dateStr}-%`)

    const orderRef = buildOrderRef(today, (todayCount ?? 0) + 1)

    // Extract customer + shipping details from Stripe session
    const customerEmail    = session.customer_details?.email ?? ''
    const customerName     = session.customer_details?.name  ?? 'Valued Customer'
    const shippingDetails  = session.shipping_details
    const deliveryAddress  = shippingDetails?.address
      ? {
          name:        shippingDetails.name ?? customerName,
          line1:       shippingDetails.address.line1  ?? '',
          line2:       shippingDetails.address.line2  ?? null,
          city:        shippingDetails.address.city   ?? '',
          state:       shippingDetails.address.state  ?? '',
          postal_code: shippingDetails.address.postal_code ?? '',
          country:     shippingDetails.address.country ?? 'US',
        }
      : null

    const spec = buildSpecSheet(
      flavorCreationId,
      fc.customer_prompt,
      flavor,
      customizations,
      quantityQuarts,
    )

    // Save order to DB
    // Note: batch_count is a GENERATED ALWAYS AS column — do NOT insert it.
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({
        order_reference:          orderRef,
        flavor_creation_id:       flavorCreationId,
        quantity_quarts:          quantityQuarts,
        unit_price_cents:         1999,
        total_price_cents:        quantityQuarts * 1999,
        stripe_payment_intent_id: session.payment_intent as string,
        stripe_session_id:        session.id,
        customer_name:            customerName,
        customer_email:           customerEmail,
        user_id:                  userId,
        status:                   'paid',
        delivery_type:            deliveryAddress ? 'delivery' : 'pickup',
        delivery_address:         deliveryAddress,
        enabled_mix_ins:          enabledMixIns,
        spec_sheet_sent:          false,
      })
      .select('id')
      .single()

    if (orderErr || !order) {
      console.error('Failed to save order:', orderErr)
      // Return 200 to prevent Stripe retries on DB errors — log and investigate manually
      return NextResponse.json({ received: true })
    }

    // Send emails (non-blocking — don't fail the webhook on email errors)
    const emailOpts = {
      orderRef, customerName, customerEmail, spec,
      totalCents: quantityQuarts * 1999,
      orderDate,
    }

    const [makerResult, confirmResult] = await Promise.allSettled([
      sendMakerAlert(emailOpts),
      sendOrderConfirmation(emailOpts),
    ])
    if (makerResult.status   === 'rejected') console.error('Maker alert email failed:',        makerResult.reason)
    if (confirmResult.status === 'rejected') console.error('Customer confirm email failed:', confirmResult.reason)

    // Mark spec sheet sent
    await supabase
      .from('orders')
      .update({ spec_sheet_sent: true })
      .eq('id', order.id)
  }

  return NextResponse.json({ received: true })
}
