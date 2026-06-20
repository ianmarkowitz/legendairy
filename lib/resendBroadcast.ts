import { Resend } from 'resend'
import { createElement } from 'react'
import { MarketingBroadcastEmail } from '@/components/emails/MarketingBroadcastEmail'
import { MARKETING_FROM_PERSONAL, MARKETING_FROM_DESIGNED, MARKETING_REPLY_TO } from './constants'

// ─────────────────────────────────────────────────────────────────────────────
// LEGENDAIRY — RESEND BROADCASTS (marketing sends to the Audience)
// Separate from lib/email.ts (transactional) and lib/resendAudience.ts (list sync).
//
// Two-step by design, mirroring Resend's own dashboard flow:
//   1. createBroadcastDraft() — writes a draft in Resend. Sends nothing.
//   2. sendBroadcast()        — actually dispatches it to the whole audience
//                                (minus unsubscribes). Cannot be undone.
// Keeping these separate means no code path can blast the list by accident —
// dispatch always requires a deliberate, second, explicit call.
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

export interface BroadcastContent {
  variant?:    'personal' | 'designed'
  subject:     string
  previewText: string
  heading?:    string
  greeting?:   string
  paragraphs:  string[]
  ctaText?:    string
  ctaUrl?:     string
  signOff?:    string
  /** Internal label shown in the Resend dashboard only — never seen by recipients. */
  name?:       string
}

export async function createBroadcastDraft(content: BroadcastContent): Promise<
  { id: string; dashboardUrl: string } | { error: string }
> {
  const audienceId = process.env.RESEND_AUDIENCE_ID
  if (!audienceId) return { error: 'RESEND_AUDIENCE_ID env var is not set.' }

  const variant = content.variant ?? 'designed'
  const from    = variant === 'personal' ? MARKETING_FROM_PERSONAL : MARKETING_FROM_DESIGNED

  const { data, error } = await getResend().broadcasts.create({
    audienceId,
    from,
    replyTo:     MARKETING_REPLY_TO,
    subject:     content.subject,
    previewText: content.previewText,
    name:        content.name ?? content.subject,
    react: createElement(MarketingBroadcastEmail, {
      variant,
      preheader:  content.previewText,
      heading:    content.heading,
      greeting:   content.greeting,
      paragraphs: content.paragraphs,
      ctaText:    content.ctaText,
      ctaUrl:     content.ctaUrl,
      signOff:    content.signOff,
    }),
  })

  if (error || !data) return { error: error?.message ?? 'Broadcast draft creation failed.' }
  return { id: data.id, dashboardUrl: `https://resend.com/broadcasts/${data.id}` }
}

/**
 * Dispatches a draft broadcast to the entire audience (minus unsubscribes).
 * IRREVERSIBLE — there is no unsend. Callers must gate this behind an
 * explicit, deliberate confirmation; never call it automatically.
 */
export async function sendBroadcast(broadcastId: string): Promise<{ ok: true } | { error: string }> {
  const { error } = await getResend().broadcasts.send(broadcastId)
  if (error) return { error: error.message }
  return { ok: true }
}
