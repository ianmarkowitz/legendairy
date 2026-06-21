import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { supabase as serviceClient } from '@/lib/supabase'
import { syncContactsBatch, firstNameOf } from '@/lib/resendAudience'

// 400-ish contacts × ~120ms throttle ≈ under a minute. Give the function headroom.
// (Idempotent — if it ever times out, just call it again.)
export const maxDuration = 60

/**
 * One-off backfill: push every email already in the DB (profiles + leads +
 * order buyers) into the Resend Audience. Admin-only. Safe to re-run.
 *
 *   curl -X POST https://<host>/api/admin/sync-resend-contacts \
 *        -H "cookie: <your admin session cookie>"
 *
 * Easiest path: sign in as admin, open the browser console on the site, and run
 *   fetch('/api/admin/sync-resend-contacts', { method: 'POST' }).then(r => r.json()).then(console.log)
 */
export async function POST() {
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

  // 3. Sync them all (throttled, idempotent).
  const counts = await syncContactsBatch(Array.from(contacts.values()))

  return NextResponse.json({
    sources: {
      profiles: profilesErr ? null : profiles?.length ?? 0,
      leads:    leadsErr    ? null : leads?.length    ?? 0,
      orders:   ordersErr   ? null : orders?.length   ?? 0,
    },
    ...(warnings.length > 0 && { warnings }),
    uniqueEmails: contacts.size,
    result: counts,
  })
}
