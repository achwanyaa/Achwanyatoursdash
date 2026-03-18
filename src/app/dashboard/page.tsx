'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Tour {
  id: string
  property_name: string
  address: string
  property_type: string
  bedrooms: number
  status: string
  views: number
  created_at: string
}

interface Lead {
  id: string
  full_name: string
  phone: string
  message: string
  created_at: string
  tours: {
    property_name: string
  } | null
}

interface Subscription {
  tier: string
  max_active_tours: number
  current_period_end: string
  is_active: boolean
}

export default function DashboardPage() {
  const [tours, setTours] = useState<Tour[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
      return
    }

    try {
      // Fetch user's tours
      const { data: toursData } = await supabase
        .from('tours')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      // Fetch user's leads
      const { data: leadsData } = await supabase
        .from('leads')
        .select(`
          *,
          tours!inner(property_name)
        `)
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

      // Fetch subscription info
      const { data: subData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single()

      setTours(toursData || [])
      setLeads(leadsData || [])
      setSubscription(subData)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBookShoot = () => {
    router.push('/dashboard/book')
  }

  const handleViewTour = (tourId: string) => {
    router.push(`/dashboard/tour/${tourId}`)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const isTrialExpired = subscription && new Date(subscription.current_period_end) < new Date()
  const tourUsage = tours.length
  const tourLimit = subscription?.max_active_tours || 1

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-600">Manage your 3D virtual tours</p>
          </div>
          <div className="flex gap-4">
            <Button onClick={handleBookShoot} className="bg-orange-500 hover:bg-orange-600">
              📸 Book a Shoot
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Subscription Status Banner */}
      {isTrialExpired && (
        <div className="bg-red-50 border-b border-red-200">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-red-800 font-medium">⚠️ Trial Expired</span>
              <span className="text-red-600 ml-2">Upgrade to continue accessing your tours</span>
            </div>
            <Link href="/dashboard/upgrade">
              <Button className="bg-red-500 hover:bg-red-600 text-white">
                Upgrade Now
              </Button>
            </Link>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-sm font-medium text-gray-600">Active Tours</h3>
            <p className="text-2xl font-bold text-gray-900 mt-2">{tourUsage}/{tourLimit}</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(tourUsage / tourLimit) * 100}%` }}
              />
            </div>
          </Card>
          <Card className="p-6">
            <h3 className="text-sm font-medium text-gray-600">Total Views</h3>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {tours.reduce((sum, tour) => sum + tour.views, 0)}
            </p>
          </Card>
          <Card className="p-6">
            <h3 className="text-sm font-medium text-gray-600">Total Leads</h3>
            <p className="text-2xl font-bold text-gray-900 mt-2">{leads.length}</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-sm font-medium text-gray-600">Plan Status</h3>
            <p className="text-lg font-bold text-green-600 mt-2 capitalize">
              {subscription?.tier || 'Trial'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {subscription?.current_period_end && 
                `Expires: ${new Date(subscription.current_period_end).toLocaleDateString()}`
              }
            </p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tours Section */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Your Tours</h3>
              <Button onClick={handleBookShoot} size="sm">
                + Book New Shoot
              </Button>
            </div>
            
            {tours.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No tours yet</p>
                <p className="text-sm text-gray-400 mb-4">Book your first photo shoot to get started</p>
                <Button onClick={handleBookShoot} className="bg-orange-500 hover:bg-orange-600">
                  📸 Book Your First Shoot
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {tours.map((tour) => (
                  <div key={tour.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{tour.property_name}</h4>
                        <p className="text-sm text-gray-600">{tour.address}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {tour.property_type}
                          </span>
                          {tour.bedrooms && (
                            <span className="text-xs bg-blue-100 px-2 py-1 rounded">
                              {tour.bedrooms} bed{tour.bedrooms > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-sm text-gray-500">{tour.views} views</span>
                        <Button
                          size="sm"
                          onClick={() => handleViewTour(tour.id)}
                          className="bg-orange-500 hover:bg-orange-600"
                        >
                          View Tour
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Recent Leads */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Leads</h3>
            
            {leads.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No leads yet</p>
                <p className="text-sm text-gray-400">
                  Share your tour links to start capturing leads
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {leads.map((lead) => (
                  <div key={lead.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{lead.full_name}</h4>
                        <p className="text-sm text-gray-600">{lead.phone}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Property: {lead.tours?.property_name || 'Unknown'}
                        </p>
                        {lead.message && (
                          <p className="text-sm text-gray-600 mt-2 italic">
                            "{lead.message}"
                          </p>
                        )}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(lead.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
