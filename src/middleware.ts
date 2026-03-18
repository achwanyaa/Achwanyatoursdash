// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/', '/auth/login', '/auth/signup', '/auth/callback']

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_anon_key',
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname

  // 1. Unauthenticated → redirect to login (except public paths)
  if (!user && !PUBLIC_PATHS.some(p => path.startsWith(p))) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  if (!user) return response

  // 2. Fetch subscription in one query
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('is_active, current_period_end, tier')
    .eq('user_id', user.id)
    .single()

  // 3. Trial/subscription expired → lock dashboard (except upgrade page)
  const expired = sub && (
    !sub.is_active ||
    new Date(sub.current_period_end) < new Date()
  )

  if (expired && path.startsWith('/dashboard') && path !== '/dashboard/upgrade') {
    return NextResponse.redirect(new URL('/dashboard/upgrade', request.url))
  }

  // 4. Admin guard
  if (path.startsWith('/admin')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
}
