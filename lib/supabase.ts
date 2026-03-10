import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Server-side only — uses the service role key to bypass RLS.
// Never import this in client components.
// Lazy-initialize so the build doesn't fail if env vars are absent at compile time.
let _supabase: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) throw new Error('Missing Supabase env vars. Check .env.local.')
    _supabase = createClient(url, key)
  }
  return _supabase
}

// Convenience alias so existing call sites don't need to change.
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabase() as never)[prop]
  },
})
