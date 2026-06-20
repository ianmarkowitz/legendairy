import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase-server'
import { supabase as serviceClient } from '@/lib/supabase'
import { createBroadcastDraft } from '@/lib/resendBroadcast'

const BodySchema = z.object({
  variant:     z.enum(['personal', 'designed']).default('designed'),
  subject:     z.string().min(1),
  previewText: z.string().min(1),
  heading:     z.string().optional(),
  greeting:    z.string().optional(),
  paragraphs:  z.array(z.string().min(1)).min(1),
  ctaText:     z.string().optional(),
  ctaUrl:      z.string().url().optional(),
  signOff:     z.string().optional(),
  name:        z.string().optional(),
})

/**
 * Creates a DRAFT broadcast in Resend. Does not send anything — review it in
 * the Resend dashboard (link returned below) or POST to
 * /api/admin/broadcasts/[id]/send to dispatch it for real.
 */
export async function POST(req: NextRequest) {
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
      { error: parsed.error.errors[0]?.message ?? 'Invalid request.' },
      { status: 400 },
    )
  }

  const result = await createBroadcastDraft(parsed.data)
  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: 502 })
  }

  return NextResponse.json({ ...result, status: 'draft — nothing has been sent yet' })
}
