export const dynamic = 'force-dynamic'

import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { EDWARD_WA } from '@/lib/whatsapp'
import { Card } from '@/components/ui/card'

function getIndustryBadge(industry: string) {
  switch (industry) {
    case 'real_estate':
      return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#C9A84C]/10 text-[#C9A84C] border border-[#C9A84C]/20">Real Estate</span>
    case 'restaurant':
      return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">Restaurant</span>
    case 'automotive':
      return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">Automotive</span>
    case 'hotel':
      return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">Hotel</span>
    default:
      return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-500/10 text-gray-400 border border-gray-500/20">{industry}</span>
  }
}

export default async function DashboardPage() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [toursResponse, viewsResponse, leadsResponse] = await Promise.all([
    supabase
      .from('tours')
      .select('*')
      .eq('owner_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false }),
    supabase.from('tour_views').select('id', { count: 'exact' }).eq('owner_id', user.id),
    supabase.from('leads').select('id', { count: 'exact' }).eq('owner_id', user.id),
  ])

  const tours = toursResponse.data || []
  const totalViews = viewsResponse.count || 0
  const totalLeads = leadsResponse.count || 0

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
      {/* Overview Stats */}
      <div>
        <h2 className="text-2xl font-serif text-[#E8E3D9] mb-4">Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-[#141414] border-[#1E1E1E] p-6 text-center">
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">Active Tours</h3>
            <p className="text-4xl font-serif text-[#E8E3D9] mt-3">{tours.length}</p>
          </Card>
          <Card className="bg-[#141414] border-[#1E1E1E] p-6 text-center">
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">Total Views</h3>
            <p className="text-4xl font-serif text-[#C9A84C] mt-3">{totalViews}</p>
          </Card>
          <Card className="bg-[#141414] border-[#1E1E1E] p-6 text-center">
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">Total Leads</h3>
            <p className="text-4xl font-serif text-green-400 mt-3">{totalLeads}</p>
          </Card>
        </div>
      </div>

      {/* Tours Grid */}
      <div id="tours" className="pt-4 scroll-mt-6">
        <h2 className="text-2xl font-serif text-[#E8E3D9] mb-4">My Tours</h2>
        
        {tours.length === 0 ? (
          <div className="w-full rounded-xl border border-dashed border-[#333] bg-[#141414]/50 p-12 text-center flex flex-col items-center justify-center space-y-4">
            <span className="text-4xl mb-2">📸</span>
            <div className="space-y-1">
              <p className="text-[#E8E3D9] font-medium text-lg">No tours assigned yet.</p>
              <p className="text-gray-400">Edward will add your first tour after your shoot.</p>
            </div>
            <a 
              href={EDWARD_WA}
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-4 px-6 py-2 bg-[#C9A84C] hover:bg-[#B39543] text-[#0A0A0A] font-semibold rounded-md transition-colors"
            >
              Contact Edward →
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-wrap">
            {tours.map((tour) => (
              <Card key={tour.id} className="bg-[#141414] border-[#1E1E1E] p-5 flex flex-col justify-between hover:border-[#333] transition-colors group">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    {getIndustryBadge(tour.industry)}
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                  </div>
                  <h3 className="text-xl font-serif text-[#E8E3D9] mb-1 leading-tight group-hover:text-[#C9A84C] transition-colors">{tour.title}</h3>
                  <p className="text-sm text-gray-500 flex items-start gap-1">
                    <span>📍</span> {tour.address}
                  </p>
                </div>
                
                <div className="mt-6 pt-4 border-t border-[#1E1E1E] flex justify-between items-center">
                  <div className="text-xs text-gray-400">
                    Active Tour
                  </div>
                  <Link 
                    href={`/dashboard/tour/${tour.id}`}
                    className="text-sm font-semibold text-[#C9A84C] hover:text-[#E8E3D9] transition-colors"
                  >
                    View Tour →
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
