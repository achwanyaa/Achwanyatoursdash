'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface Tour {
  id: string
  realsee_url: string
  properties: {
    title: string
    address: string
    price: number
  } | null
  views: number
  created_at: string
}

interface Lead {
  id: string
  name: string
  phone: string
  message: string
  created_at: string
  tours: {
    properties: {
      title: string
    } | null
  } | null
}

export default function DashboardPage() {
  const [tours, setTours] = useState<Tour[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    try {
      // Fetch user's tours
      const { data: toursData } = await supabase
        .from('tours')
        .select(`
          *,
          properties (title, address, price)
        `)
        .eq('profile_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      // Fetch user's leads
      const { data: leadsData } = await supabase
        .from('leads')
        .select(`
          *,
          tours (properties (title))
        `)
        .eq('profile_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

      setTours(toursData || [])
      setLeads(leadsData || [])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
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
            <Button
              onClick={() => router.push('/admin')}
              variant="outline"
              className="hidden"
            >
              Admin
            </Button>
            <Button onClick={handleLogout} variant="outline">
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-sm font-medium text-gray-600">Active Tours</h3>
            <p className="text-2xl font-bold text-gray-900 mt-2">{tours.length}</p>
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
            <p className="text-2xl font-bold text-green-600 mt-2">Active</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Tours */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Your Tours</h3>
            {tours.length === 0 ? (
              <p className="text-gray-500">No tours yet. Contact admin to add your first tour.</p>
            ) : (
              <div className="space-y-4">
                {tours.map((tour) => (
                  <div key={tour.id} className="border rounded-lg p-4">
                    <h4 className="font-medium">{tour.properties?.title || 'Untitled Property'}</h4>
                    <p className="text-sm text-gray-600">{tour.properties?.address}</p>
                    <p className="text-sm text-gray-600">
                      KSh {tour.properties?.price?.toLocaleString()}
                    </p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-gray-500">{tour.views} views</span>
                      <Button
                        size="sm"
                        onClick={() => router.push(`/tours/${tour.id}`)}
                      >
                        View Tour
                      </Button>
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
              <p className="text-gray-500">No leads yet. Share your tours to get started!</p>
            ) : (
              <div className="space-y-4">
                {leads.map((lead) => (
                  <div key={lead.id} className="border rounded-lg p-4">
                    <h4 className="font-medium">{lead.name}</h4>
                    <p className="text-sm text-gray-600">{lead.phone}</p>
                    <p className="text-sm text-gray-600">
                      Property: {lead.tours?.properties?.title || 'Unknown'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </p>
                    <Button
                      size="sm"
                      className="mt-2"
                      onClick={() => window.open(`https://wa.me/${lead.phone.replace(/\D/g, '')}`, '_blank')}
                    >
                      Contact on WhatsApp
                    </Button>
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
