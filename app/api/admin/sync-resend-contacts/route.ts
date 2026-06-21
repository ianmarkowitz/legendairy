import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { supabase as serviceClient } from '@/lib/supabase'
import { syncContactsBatch, firstNameOf } from '@/lib/resendAudience'

// One batch (≈100 contacts × ~120ms throttle + Resend round-trips) comfortably
// fits in a single request. The whole list does NOT — for a few hundred
// contacts the naive one-shot loop runs well past Vercel's request timeout
// and gets killed with a 504 before finishing. So this is chunked: each call
// processes one page and returns nextOffset; the caller loops until done.
export const maxDuration = 60
const DEFAULT_BATCH_SIZE = 100

/**
 * Backfill: push emails already in the DB (profiles + leads + order buyers)
 * into the Resend Audience, one batch at a time. Admin-only. Idempotent and
 * resumable — safe to re-run or to re-request the same offset.
 *
 * Easiest path: sign in as admin, open the browser console on the site, and
 * run this loop (it pages through automatically until done):
 *
 *   let offset = 0, totals = { synced: 0, exists: 0, skipped: 0, error: 0 }
 *   while (offset !== null) {
 *     const r = await fetch(`/api/admin/sync-resend-contacts?offset=${offset}`, { method: 'POST' }).then(r => r.json())
 *     console.log(r)
 *     for (const k in totals) totals[k] += r.result[k]
 *     offset = r.nextOffset
 *   }
 *   console.log('done', totals)
 */
export async function POST(req: NextRequest) {
  // 1. Auth + admin check (same pattern as other /api/admin routes)
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

  // 2. Gather emails from every source, deduped by lowercased email.
  //    First name is kept from whichever source supplies one.
  const contacts = new Map<string, { email: string; firstName: string | null }>()

  const add = (rawEmail: string | null | undefined, name?: string | null) => {
    const email = (rawEmail ?? '').trim().toLowerCase()
    if (!email) return
    const existing = contacts.get(email)
    const firstName = firstNameOf(name)
    if (!existing) {
      contacts.set(email, { email, firstName })
    } else if (!existing.firstName && firstName) {
      existing.firstName = firstName
    }
  }

  const [profilesRes, leadsRes, ordersRes] = await Promise.all([
    serviceClient.from('profiles').select('email, full_name'),
    serviceClient.from('leads').select('email'),
    serviceClient.from('orders').select('customer_email, customer_name'),
  ])
  const { data: profiles, error: profilesErr } = profilesRes
  const { data: leads,    error: leadsErr }    = leadsRes
  const { data: orders,   error: ordersErr }   = ordersRes

  for (const p of profiles ?? []) add(p.email, p.full_name)
  for (const l of leads    ?? []) add(l.email)
  for (const o of orders   ?? []) add(o.customer_email, o.customer_name)

  // A failed source (e.g. a table that hasn't been migrated yet) must not be
  // mistaken for "0 contacts found" — surface it as a warning instead.
  const warnings = [
    profilesErr && `profiles: ${profilesErr.message}`,
    leadsErr    && `leads: ${leadsErr.message}`,
    ordersErr   && `orders: ${ordersErr.message}`,
  ].filter((w): w is string => Boolean(w))

  // 3. Sort for a stable order across calls, then take this one batch.
  const allContacts = Array.from(contacts.values()).sort((a, b) => a.email.localeCompare(b.email))

  const offsetParam = Number(req.nextUrl.searchParams.get('offset') ?? '0')
  const offset = Number.isFinite(offsetParam) && offsetParam >= 0 ? offsetParam : 0
  const limitParam = Number(req.nextUrl.searchParams.get('limit') ?? '')
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 200) : DEFAULT_BATCH_SIZE

  const batch = allContacts.slice(offset, offset + limit)
  const nextOffset = offset + limit < allContacts.length ? offset + limit : null

  // 4. Sync this batch only (throttled, idempotent).
  const counts = await syncContactsBatch(batch)

  return NextResponse.json({
    sources: {
      profiles: profilesErr ? null : profiles?.length ?? 0,
      leads:    leadsErr    ? null : leads?.length    ?? 0,
      orders:   ordersErr   ? null : orders?.length   ?? 0,
    },
    ...(warnings.length > 0 && { warnings }),
    uniqueEmails: allContacts.length,
    offset,
    limit,
    nextOffset,
    done: nextOffset === null,
    result: counts,
  })
}
