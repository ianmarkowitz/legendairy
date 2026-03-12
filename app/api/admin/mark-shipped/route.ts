import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase-server'
import { supabase as serviceClient } from '@/lib/supabase'
import { sendShippingNotification } from '@/lib/email'

const BodySchema = z.object({
  orderId:        z.string().uuid(),
  carrier:        z.enum(['UPS', 'USPS', 'FedEx', 'Other']),
  trackingNumber: z.string().min(1, 'Tracking number is required.'),
})

export async function PATCH(req: NextRequest) {
  // 1. Auth check
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Admin role check
  const { data: profile } = await serviceClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // 3. Validate body
  const body = await req.json().catch(() => null)
  const parsed = BodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? 'Invalid request.' },
      { status: 400 },
    )
  }

  const { orderId, carrier, trackingNumber } = parsed.data

  // 4. Fetch order and verify it's in_production
  const { data: order } = await serviceClient
    .from('orders')
    .select(`
      id, status, order_reference, customer_name, customer_email,
      created_at, flavor_creation_id,
      flavor_creations ( flavor_name )
    `)
    .eq('id', orderId)
    .single()

  if (!order) {
    return NextResponse.json({ error: 'Order not found.' }, { status: 404 })
  }

  if (order.status !== 'in_production') {
    return NextResponse.json(
      { error: `Order must be in 'in_production' status to mark as shipped (current: ${order.status}).` },
      { status: 422 },
    )
  }

  // 5. Update order
  const now = new Date().toISOString()
  const { error: updateErr } = await serviceClient
    .from('orders')
    .update({
      status:           'shipped',
      tracking_number:  trackingNumber,
      tracking_carrier: carrier,
      shipped_at:       now,
    })
    .eq('id', orderId)

  if (updateErr) {
    console.error('Failed to mark order as shipped:', updateErr)
    return NextResponse.json({ error: 'Failed to update order.' }, { status: 500 })
  }

  // 6. Send shipping notification email
  const flavorRaw = order.flavor_creations
  const flavor = Array.isArray(flavorRaw) ? flavorRaw[0] : flavorRaw
  const flavorName = flavor?.flavor_name ?? 'Your custom flavor'

  try {
    await sendShippingNotification({
      orderRef:       order.order_reference,
      customerName:   order.customer_name ?? 'Valued Customer',
      customerEmail:  order.customer_email ?? '',
      flavorName,
      carrier,
      trackingNumber,
      shippedAt:      new Date(now),
    })
  } catch (emailErr) {
    // Log but don't fail — order is already marked shipped
    console.error('Shipping notification email failed:', emailErr)
  }

  return NextResponse.json({ status: 'shipped', carrier, trackingNumber })
}
