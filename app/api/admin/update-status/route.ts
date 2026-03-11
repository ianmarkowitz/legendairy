import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase-server'
import { supabase as serviceClient } from '@/lib/supabase'

const VALID_TRANSITIONS: Record<string, string[]> = {
  pending:       ['paid', 'cancelled'],
  paid:          ['in_production', 'cancelled'],
  in_production: ['fulfilled', 'cancelled'],
  fulfilled:     [],  // terminal
  cancelled:     [],  // terminal
}

const BodySchema = z.object({
  orderId:   z.string().uuid(),
  newStatus: z.enum(['pending', 'paid', 'in_production', 'fulfilled', 'cancelled']),
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

  const { orderId, newStatus } = parsed.data

  // 4. Fetch current order
  const { data: order, error: fetchErr } = await serviceClient
    .from('orders')
    .select('id, status')
    .eq('id', orderId)
    .single()

  if (fetchErr || !order) {
    return NextResponse.json({ error: 'Order not found.' }, { status: 404 })
  }

  // 5. Validate transition
  const allowed = VALID_TRANSITIONS[order.status] ?? []
  if (!allowed.includes(newStatus)) {
    return NextResponse.json(
      { error: `Cannot transition from '${order.status}' to '${newStatus}'.` },
      { status: 422 },
    )
  }

  // 6. Update status
  const { error: updateErr } = await serviceClient
    .from('orders')
    .update({ status: newStatus })
    .eq('id', orderId)

  if (updateErr) {
    console.error('Failed to update order status:', updateErr)
    return NextResponse.json({ error: 'Failed to update status.' }, { status: 500 })
  }

  return NextResponse.json({ status: newStatus })
}
