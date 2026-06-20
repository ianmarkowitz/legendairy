import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase-server'
import { supabase as serviceClient } from '@/lib/supabase'
import { sendBroadcast } from '@/lib/resendBroadcast'

const BodySchema = z.object({
  // Deliberate safety latch — must be exactly true. This dispatches real
  // email to the whole audience (minus unsubscribes) and cannot be undone.
  confirm: z.literal(true),
})

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await serviceClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json().catch(() => null)
  const parsed = BodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Refusing to send without { "confirm": true } in the request body.' },
      { status: 400 },
    )
  }

  const result = await sendBroadcast(id)
  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: 502 })
  }

  return NextResponse.json({ sent: true, broadcastId: id })
}
