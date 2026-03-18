import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const adminUserId = process.env.NEXT_PUBLIC_ADMIN_USER_ID
  if (!adminUserId || user.id !== adminUserId) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#E8E3D9] flex flex-col">
      {/* Admin Navbar */}
      <nav className="bg-[#141414] border-b border-[#1E1E1E] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-serif text-[#C9A84C]">Achwanya Admin</h1>
            <div className="hidden sm:flex items-center gap-6">
              <Link href="/admin" className="text-sm font-medium hover:text-[#C9A84C] transition-colors">
                Control Panel
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a 
              href="/api/auth/signout" 
              className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              Sign Out
            </a>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto w-full">
        {children}
      </main>
    </div>
  )
}
