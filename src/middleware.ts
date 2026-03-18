import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  // Create a Supabase client for the middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          res.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          res.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Refresh session if expired
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protected routes
  const protectedRoutes = ['/dashboard', '/tours', '/properties', '/leads', '/analytics', '/settings']
  const adminRoutes = ['/admin']
  const authRoutes = ['/login', '/register']

  const isProtectedRoute = protectedRoutes.some(route => req.nextUrl.pathname.startsWith(route))
  const isAdminRoute = adminRoutes.some(route => req.nextUrl.pathname.startsWith(route))
  const isAuthRoute = authRoutes.some(route => req.nextUrl.pathname.startsWith(route))

  // Redirect unauthenticated users from protected routes
  if (isProtectedRoute && !session) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('redirectedFrom', req.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect authenticated users from auth routes
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Check admin access
  if (isAdminRoute) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', session.user.id)
      .single()

    if (profile?.email !== 'admin@achwanya.co.ke') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  // Check subscription limits for trial users
  if (session && isProtectedRoute) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan_type, trial_ends_at, subscription_ends_at')
      .eq('id', session.user.id)
      .single()

    if (profile) {
      const now = new Date()
      
      // Check if trial has expired
      if (profile.plan_type === 'trial' && profile.trial_ends_at && new Date(profile.trial_ends_at) < now) {
        const expiredUrl = new URL('/subscription-expired', req.url)
        return NextResponse.redirect(expiredUrl)
      }

      // Check if subscription has expired
      if (profile.plan_type !== 'trial' && profile.subscription_ends_at && new Date(profile.subscription_ends_at) < now) {
        const expiredUrl = new URL('/subscription-expired', req.url)
        return NextResponse.redirect(expiredUrl)
      }
    }
  }

  return res
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
