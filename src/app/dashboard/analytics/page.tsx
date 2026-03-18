export const dynamic = 'force-dynamic'

import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/card'

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const hours = Math.floor(diff / 3600000)
  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'Yesterday'
  return new Date(dateStr).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })
}

export default async function AnalyticsPage() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch all views for this owner (no pagination for MVP, assuming moderate volume)
  const { data: views } = await supabase
    .from('tour_views')
    .select('tour_id, viewed_at, tours!inner(title)')
    .eq('owner_id', user.id)
    .order('viewed_at', { ascending: false })

  const typedViews = (views || []) as any[]

  // Calculate grouped totals for the simple bar chart
  const tourCounts: Record<string, number> = {}
  typedViews.forEach(v => {
    const title = v.tours?.title || 'Unknown Tour'
    tourCounts[title] = (tourCounts[title] || 0) + 1
  })

  // Format array and figure out the max to set 100% boundary
  const chartData = Object.entries(tourCounts)
    .map(([title, count]) => ({ title, count }))
    .sort((a, b) => b.count - a.count)
  
  const maxViews = chartData.length > 0 ? chartData[0].count : 1

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-serif text-[#E8E3D9]">Analytics</h2>
        <p className="text-gray-400 mt-1">Understand your virtual tour performance.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* Performance Bars */}
        <Card className="bg-[#141414] border-[#1E1E1E] p-6">
          <h3 className="text-lg font-serif text-[#C9A84C] mb-6 tracking-tight">Views per Tour</h3>
          
          {chartData.length === 0 ? (
            <p className="text-gray-500 italic">Not enough data to display charts.</p>
          ) : (
            <div className="space-y-6">
              {chartData.map((data, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#E8E3D9] font-medium truncate pr-4">{data.title}</span>
                    <span className="text-gray-400 shrink-0">{data.count} views</span>
                  </div>
                  {/* Pure CSS Bar */}
                  <div className="w-full h-3 bg-[#1E1E1E] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#C9A84C] rounded-full"
                      style={{ width: `${(data.count / maxViews) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Activity Feed */}
        <Card className="bg-[#141414] border-[#1E1E1E] p-6">
          <h3 className="text-lg font-serif text-[#C9A84C] mb-6 tracking-tight">Recent Activity</h3>
          
          {typedViews.length === 0 ? (
            <p className="text-gray-500 italic">No activity recorded yet.</p>
          ) : (
            <div className="space-y-4">
              {typedViews.slice(0, 20).map((view, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-[#C9A84C] mt-1 text-xs">●</span>
                  <div>
                    <p className="text-[#E8E3D9] text-sm">
                      Someone viewed <span className="font-semibold text-white">{view.tours?.title || 'a tour'}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {relativeTime(view.viewed_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
        
      </div>
    </div>
  )
}
