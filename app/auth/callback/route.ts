import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { supabase as serviceSupabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code       = searchParams.get('code')
  const sessionId  = searchParams.get('session_id') // guest session to claim
  const next       = searchParams.get('next') ?? '/account'

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`)
  }

  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          )
        },
      },
    },
  )

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.user) {
    console.error('Auth callback error:', error)
    return NextResponse.redirect(`${origin}/login?error=auth_failed`)
  }

  // Claim any guest flavor_creations created before login
  if (sessionId) {
    const { error: claimErr } = await serviceSupabase
      .from('flavor_creations')
      .update({ user_id: data.user.id })
      .eq('session_id', sessionId)
      .is('user_id', null)

    if (claimErr) {
      console.error('Failed to claim guest flavors:', claimErr)
      // Non-fatal — user still logged in successfully
    }
  }

  const redirectUrl = next.startsWith('/') ? `${origin}${next}` : `${origin}/account`
  return NextResponse.redirect(redirectUrl)
}
