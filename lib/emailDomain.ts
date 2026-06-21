import dns from 'dns'

// ─────────────────────────────────────────────────────────────────────────────
// Free, no-account-needed check that an email's domain can plausibly receive
// mail: does it have MX records, or (per RFC 5321's implicit-MX fallback) at
// least an A/AAAA record. Catches typo'd or made-up domains (gmial.com,
// asdf.com) without a third-party verification service.
//
// This does NOT confirm the mailbox itself exists — only that the domain has
// somewhere to deliver to. Pair with Resend bounce webhooks to catch the rest.
// ─────────────────────────────────────────────────────────────────────────────

const LOOKUP_TIMEOUT_MS = 3000

async function withTimeout<T>(promise: Promise<T>): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(Object.assign(new Error('timeout'), { code: 'ETIMEOUT' })), LOOKUP_TIMEOUT_MS)),
  ])
}

type LookupResult = { ok: true; found: boolean } | { ok: false; code?: string }

async function tryResolve(fn: () => Promise<unknown[]>): Promise<LookupResult> {
  try {
    const data = await withTimeout(fn())
    return { ok: true, found: data.length > 0 }
  } catch (err) {
    return { ok: false, code: (err as NodeJS.ErrnoException)?.code }
  }
}

/**
 * Returns true unless the domain definitively has nowhere to deliver mail.
 * Fails OPEN on any inconclusive result (timeout, DNS server error, etc.) so
 * transient lookup issues never block a real signup — only a domain that
 * truly doesn't exist (ENOTFOUND/ENODATA on every lookup) is rejected.
 */
export async function domainAcceptsMail(domain: string): Promise<boolean> {
  const mx = await tryResolve(() => dns.promises.resolveMx(domain))
  if (mx.ok && mx.found) return true

  const a4 = await tryResolve(() => dns.promises.resolve4(domain))
  if (a4.ok && a4.found) return true

  const a6 = await tryResolve(() => dns.promises.resolve6(domain))
  if (a6.ok && a6.found) return true

  const definitivelyMissing = (r: LookupResult) => !r.ok && (r.code === 'ENOTFOUND' || r.code === 'ENODATA')
  const allDefinitivelyMissing = [mx, a4, a6].every(definitivelyMissing)

  return !allDefinitivelyMissing
}

/** Convenience wrapper: extracts the domain from an email and checks it. */
export async function emailDomainAcceptsMail(email: string): Promise<boolean> {
  const domain = email.split('@')[1]?.trim()
  if (!domain) return false
  return domainAcceptsMail(domain)
}
