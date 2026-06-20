import { NextResponse } from 'next/server'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import { sendLeadEmail } from '@/lib/email'
import { syncContactToResend } from '@/lib/resendAudience'

const schema = z.object({
  email:             z.string().email(),
  flavorCreationId:  z.string().uuid(),
})

export async function POST(req: Request) {
  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const { email, flavorCreationId } = parsed.data

  // Fetch flavor details for the email
  const { data: flavor, error: flavorErr } = await supabase
    .from('flavor_creations')
    .select('flavor_name, tagline')
    .eq('id', flavorCreationId)
    .single()

  if (flavorErr || !flavor) return NextResponse.json({ error: 'Flavor not found' }, { status: 404 })

  // Upsert lead — silently ignore duplicates
  const { error: insertErr } = await supabase
    .from('leads')
    .upsert({ email, flavor_creation_id: flavorCreationId }, { onConflict: 'email,flavor_creation_id', ignoreDuplicates: true })

  if (insertErr) {
    console.error('Lead insert error:', insertErr.message)
    return NextResponse.json({ error: 'Could not save lead' }, { status: 500 })
  }

  // Send email (non-blocking — don't fail the response on email errors)
  sendLeadEmail({
    email,
    flavorName: flavor.flavor_name,
    tagline:    flavor.tagline,
    flavorId:   flavorCreationId,
  }).catch(err => console.error('Lead email failed:', err))

  // Sync lead into the Resend marketing audience (non-blocking, idempotent).
  // Note: lead emails are unverified — they were typed without confirmation.
  syncContactToResend({ email }).catch(err => console.error('Lead contact sync failed:', err))

  return NextResponse.json({ ok: true })
}
