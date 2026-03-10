import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { supabase as serviceClient } from '@/lib/supabase'

// PATCH /api/vault — toggle is_vaulted on a flavor_creation
export async function PATCH(req: NextRequest) {
  // Verify the user is authenticated
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const { flavorCreationId } = body ?? {}

  if (!flavorCreationId || typeof flavorCreationId !== 'string') {
    return NextResponse.json({ error: 'flavorCreationId is required' }, { status: 400 })
  }

  // Fetch current state and verify ownership
  const { data: fc, error: fetchErr } = await serviceClient
    .from('flavor_creations')
    .select('id, is_vaulted, user_id')
    .eq('id', flavorCreationId)
    .single()

  if (fetchErr || !fc) {
    return NextResponse.json({ error: 'Flavor not found' }, { status: 404 })
  }

  if (fc.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Toggle
  const newValue = !fc.is_vaulted
  const { error: updateErr } = await serviceClient
    .from('flavor_creations')
    .update({ is_vaulted: newValue })
    .eq('id', flavorCreationId)

  if (updateErr) {
    console.error('Vault toggle error:', updateErr)
    return NextResponse.json({ error: 'Failed to update vault status' }, { status: 500 })
  }

  return NextResponse.json({ is_vaulted: newValue })
}
