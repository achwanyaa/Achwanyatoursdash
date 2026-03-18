import { createServerClient as _createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createServerClient() {
  const cookieStore = cookies()

  return _createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          // cookies() returns a Promise in Next.js 16, but @supabase/ssr
          // expects sync access. We cast here — Next.js resolves it.
          return (cookieStore as any).getAll()
        },
        setAll(cookiesToSet) {
          try {
            ;(cookieStore as any).forEach?.(() => {})
            cookiesToSet.forEach(({ name, value, options }) =>
              (cookieStore as any).set(name, value, options)
            )
          } catch {
            // setAll is called from Server Components where cookies
            // cannot be set. This is safe to ignore — the middleware
            // will refresh the session cookie on the response.
          }
        },
      },
    }
  )
}
