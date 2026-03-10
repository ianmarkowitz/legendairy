import { createClient } from '@supabase/supabase-js'

// Server-side only — uses the service role key to bypass RLS.
// Never import this in client components.
const supabaseUrl          = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey   = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase env vars. Check .env.local.')
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey)
