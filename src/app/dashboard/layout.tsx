import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { EDWARD_WA } from '@/lib/whatsapp'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, plan_type, plan_expires_at')
    .eq('id', user.id)
    .single()

  const isExpired = profile && new Date(profile.plan_expires_at) < new Date()
  const expiresDate = profile ? new Date(profile.plan_expires_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : ''

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#E8E3D9] flex flex-col md:flex-row">
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-[220px] border-r border-[#1E1E1E] bg-[#0A0A0A] h-screen sticky top-0">
        <div className="p-6">
          <h1 className="text-xl font-serif text-[#C9A84C]">Achwanya Tours</h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-[#141414] transition-colors">
            <span>📊</span> Overview
          </Link>
          <Link href="/dashboard#tours" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-[#141414] transition-colors">
            <span>🏠</span> My Tours
          </Link>
          <Link href="/dashboard/leads" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-[#141414] transition-colors">
            <span>📋</span> Leads
          </Link>
          <Link href="/dashboard/analytics" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-[#141414] transition-colors">
            <span>📈</span> Analytics
          </Link>
        </nav>

        <div className="p-4 border-t border-[#1E1E1E]">
          <div className="px-3 py-3 mb-2 rounded-lg bg-[#141414] border border-[#1E1E1E] text-xs">
            <p className="font-semibold text-[#E8E3D9] mb-1">{profile?.full_name}</p>
            <p className="text-gray-400 capitalize">Plan: {profile?.plan_type}</p>
            <p className={`mt-1 ${isExpired ? 'text-red-400' : 'text-gray-400'}`}>
              Expires: {expiresDate}
            </p>
          </div>
          <a href="/api/auth/signout" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-[#141414] transition-colors w-full">
            <span>🚪</span> Sign Out
          </a>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen relative pb-16 md:pb-0">
        {/* Expiry Banner */}
        {isExpired && (
          <div className="bg-red-950/30 border-b border-red-900 px-4 py-3 flex sm:items-center flex-col sm:flex-row justify-between gap-3 text-sm">
            <p className="text-red-200">
              <span className="font-semibold text-red-400">⚠️ Plan Expired on {expiresDate}.</span> Your tours are currently inactive.
            </p>
            <a 
              href={EDWARD_WA}
              target="_blank" 
              rel="noopener noreferrer"
              className="px-4 py-1.5 bg-[#C9A84C] hover:bg-[#B39543] text-[#0A0A0A] font-semibold rounded-md transition-colors text-center whitespace-nowrap"
            >
              Contact to Renew
            </a>
          </div>
        )}

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#141414] border-t border-[#1E1E1E] flex justify-around items-center h-16 px-2 z-50">
        <Link href="/dashboard" className="flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-[#C9A84C]">
          <span className="text-xl mb-1">📊</span>
        </Link>
        <Link href="/dashboard#tours" className="flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-[#C9A84C]">
          <span className="text-xl mb-1">🏠</span>
        </Link>
        <Link href="/dashboard/leads" className="flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-[#C9A84C]">
          <span className="text-xl mb-1">📋</span>
        </Link>
        <Link href="/dashboard/analytics" className="flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-[#C9A84C]">
          <span className="text-xl mb-1">📈</span>
        </Link>
        <a href="/api/auth/signout" className="flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-white">
          <span className="text-xl mb-1">🚪</span>
        </a>
      </nav>
      
    </div>
  )
}
