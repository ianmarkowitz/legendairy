import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { supabase as serviceClient } from '@/lib/supabase'
import { listAudienceContacts } from '@/lib/resendAudience'

// ─────────────────────────────────────────────────────────────────────────────
// READ-ONLY admin diagnostic. Connects to Supabase + Resend automatically and
// answers "are leads captured, and is the marketing list consistent with the DB?"
// Writes nothing. Safe to hit any time.
//
//   fetch('/api/admin/leads-health').then(r => r.json()).then(console.log)
// ─────────────────────────────────────────────────────────────────────────────
export async function GET() {
  // Auth + admin check (same pattern as other /api/admin routes).
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

  // Pull every email source from the DB (same union the backfill syncs from).
  const [profilesRes, leadsRes, ordersRes] = await Promise.all([
    serviceClient.from('profiles').select('email'),
    serviceClient.from('leads').select('email'),
    serviceClient.from('orders').select('customer_email'),
  ])

  const warnings: string[] = []
  const norm = (e: string | null | undefined) => (e ?? '').trim().toLowerCase()

  // The leads table is the one that may not be migrated yet — flag it loudly.
  const leadsTableMissing = leadsRes.error?.code === '42P01'
  if (leadsTableMissing) {
    warnings.push('leads table does not exist — run the Phase 3 migration in supabase/schema.sql')
  } else if (leadsRes.error) {
    warnings.push(`leads query failed: ${leadsRes.error.message}`)
  }
  if (profilesRes.error) warnings.push(`profiles query failed: ${profilesRes.error.message}`)
  if (ordersRes.error)   warnings.push(`orders query failed: ${ordersRes.error.message}`)

  const dbEmails = new Set<string>()
  for (const p of profilesRes.data ?? []) { const e = norm(p.email);          if (e) dbEmails.add(e) }
  for (const l of leadsRes.data    ?? []) { const e = norm(l.email);          if (e) dbEmails.add(e) }
  for (const o of ordersRes.data   ?? []) { const e = norm(o.customer_email); if (e) dbEmails.add(e) }

  // Pull the marketing list from Resend and compare.
  const audienceRes = await listAudienceContacts()
  let audienceEmails: Set<string> | null = null
  let audienceTotal: number | null = null
  let audienceSubscribed: number | null = null
  if ('error' in audienceRes) {
    warnings.push(`resend audience: ${audienceRes.error}`)
  } else {
    audienceEmails = new Set(audienceRes.contacts.map(c => c.email).filter(Boolean))
    audienceTotal = audienceRes.contacts.length
    audienceSubscribed = audienceRes.contacts.filter(c => !c.unsubscribed).length
  }

  // Drift = DB emails not yet on the marketing list. These are what a backfill
  // would push. Only meaningful when we successfully read both sides.
  const missingFromAudience =
    audienceEmails === null
      ? null
      : Array.from(dbEmails).filter(e => !audienceEmails!.has(e))

  const consistent =
    warnings.length === 0 && missingFromAudience !== null && missingFromAudience.length === 0

  return NextResponse.json({
    consistent,
    leadsTableExists: !leadsTableMissing,
    db: {
      uniqueEmails: dbEmails.size,
      sources: {
        profiles: profilesRes.error ? null : profilesRes.data?.length ?? 0,
        leads:    leadsRes.error    ? null : leadsRes.data?.length    ?? 0,
        orders:   ordersRes.error   ? null : ordersRes.data?.length   ?? 0,
      },
    },
    audience: {
      total:      audienceTotal,
      subscribed: audienceSubscribed,
    },
    drift: {
      missingFromAudienceCount: missingFromAudience?.length ?? null,
      // A small sample so you can eyeball it without dumping the whole list.
      sample: missingFromAudience ? missingFromAudience.slice(0, 20) : null,
    },
    ...(warnings.length > 0 && { warnings }),
    remedy:
      missingFromAudience && missingFromAudience.length > 0
        ? 'POST /api/admin/sync-resend-contacts to push the missing emails to Resend.'
        : undefined,
  })
}
