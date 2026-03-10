import { createBrowserClient } from '@supabase/ssr'

// Client-side Supabase client — uses the public anon key.
// Safe to use in client components and browser context.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
