import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Fetch profile for display name
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, company_name')
    .eq('id', user.id)
    .single()

  // Fetch subscription for banner
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  const displayName = profile?.full_name || profile?.company_name || user.email

  const isExpired = subscription && (
    !subscription.is_active ||
    new Date(subscription.current_period_end) < new Date()
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky top nav */}
      <nav className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs">A3T</span>
              </div>
              <span className="font-semibold text-gray-900 hidden sm:inline">Dashboard</span>
            </Link>

            <div className="flex items-center gap-1">
              <Link
                href="/dashboard"
                className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors"
              >
                Tours
              </Link>
              <Link
                href="/dashboard/book"
                className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors"
              >
                Book a Shoot
              </Link>
              <Link
                href="/dashboard/leads"
                className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors"
              >
                Leads
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 hidden sm:inline">{displayName}</span>
            <form action="/auth/signout" method="GET">
              <button
                type="submit"
                className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-red-600 border border-gray-300 rounded-md hover:border-red-300 transition-colors"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </nav>

      {/* Subscription Banner */}
      {isExpired && (
        <div className="bg-red-50 border-b border-red-200">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-red-800 font-medium">⚠️ Your subscription has expired</span>
              <span className="text-red-600 text-sm hidden sm:inline">— Upgrade to continue accessing your tours</span>
            </div>
            <Link
              href="/dashboard/upgrade"
              className="px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-md transition-colors"
            >
              Upgrade Now
            </Link>
          </div>
        </div>
      )}

      {/* Page content */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}
