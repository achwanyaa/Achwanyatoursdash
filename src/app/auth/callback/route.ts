import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = createServerClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Successfully authenticated, redirect to dashboard
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Return the user to an error page with some context
  return NextResponse.redirect(`${origin}/login?message=Could not authenticate user`)
}
