import { Resend } from 'resend'

// ─────────────────────────────────────────────────────────────────────────────
// LEGENDAIRY — RESEND AUDIENCE SYNC
// Server-side only. Pushes contacts into a Resend Audience (the marketing list),
// which is SEPARATE from Resend's transactional sending in lib/email.ts.
// ─────────────────────────────────────────────────────────────────────────────

let _resend: Resend | null = null
function getResend(): Resend {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY
    if (!key) throw new Error('RESEND_API_KEY env var is not set.')
    _resend = new Resend(key)
  }
  return _resend
}

export type ContactSyncResult = 'synced' | 'exists' | 'skipped' | 'error'

/**
 * Add a contact to the Resend Audience identified by RESEND_AUDIENCE_ID.
 *
 * - Idempotent: an email already in the audience returns 'exists', so this is
 *   safe to call on every login, not just first sign-up.
 * - Non-throwing: all errors are caught and logged, returning 'error'. Callers
 *   can `await` it without risking the surrounding request (e.g. login redirect).
 * - Returns 'skipped' when RESEND_AUDIENCE_ID is unset, so the feature is
 *   opt-in via env.
 */
export async function syncContactToResend(opts: {
  email:      string
  firstName?: string | null
  lastName?:  string | null
}): Promise<ContactSyncResult> {
  try {
    const audienceId = process.env.RESEND_AUDIENCE_ID
    if (!audienceId) {
      console.warn('RESEND_AUDIENCE_ID not set — skipping Resend contact sync.')
      return 'skipped'
    }

    const { email, firstName, lastName } = opts
    if (!email) return 'skipped'

    const { error } = await getResend().contacts.create({
      audienceId,
      email,
      firstName:    firstName ?? undefined,
      lastName:     lastName  ?? undefined,
      unsubscribed: false,
    })

    if (!error) return 'synced'

    // A contact already in the audience is the expected case on repeat logins
    // and during backfills — Resend returns an error for it; treat as success.
    if (/already (exists|a contact)/i.test(error.message ?? '')) return 'exists'

    console.error('Resend contact sync failed:', error.message)
    return 'error'
  } catch (err) {
    console.error('Resend contact sync threw:', err)
    return 'error'
  }
}

export interface BatchSyncCounts {
  total: number
  synced: number
  exists: number
  skipped: number
  error: number
}

/**
 * Sync many contacts sequentially with a small delay to stay under Resend's
 * request-rate limits. Used by the backfill route. Idempotent — safe to re-run.
 */
export async function syncContactsBatch(
  contacts: { email: string; firstName?: string | null }[],
  delayMs = 120,
): Promise<BatchSyncCounts> {
  const counts: BatchSyncCounts = { total: contacts.length, synced: 0, exists: 0, skipped: 0, error: 0 }
  for (const c of contacts) {
    const result = await syncContactToResend(c)
    counts[result]++
    if (delayMs) await new Promise(res => setTimeout(res, delayMs))
  }
  return counts
}

/** Best-effort first-name extraction from a full name. */
export function firstNameOf(fullName: string | null | undefined): string | null {
  return (fullName ?? '').trim().split(/\s+/)[0] || null
}
