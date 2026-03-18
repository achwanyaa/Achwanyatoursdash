import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Verify admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky admin nav */}
      <nav className="sticky top-0 z-30 bg-gray-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs">A3T</span>
              </div>
              <span className="font-semibold hidden sm:inline">Admin</span>
            </Link>

            <div className="flex items-center gap-1">
              <Link
                href="/admin"
                className="px-3 py-1.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
              >
                Overview
              </Link>
              <Link
                href="/admin/clients"
                className="px-3 py-1.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
              >
                Clients
              </Link>
              <Link
                href="/admin/bookings"
                className="px-3 py-1.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
              >
                Bookings
              </Link>
              <Link
                href="/admin/leads"
                className="px-3 py-1.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
              >
                Leads
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400 hidden sm:inline">{profile?.full_name || user.email}</span>
            <form action="/auth/signout" method="GET">
              <button
                type="submit"
                className="px-3 py-1.5 text-sm font-medium text-gray-300 hover:text-white border border-gray-600 rounded-md hover:border-gray-400 transition-colors"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </nav>

      {/* Page content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}
