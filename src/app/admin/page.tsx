'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { TourAssigner } from '@/components/admin/tour-assigner'
import { Card } from '@/components/ui/card'

interface DashboardStats {
  totalUsers: number
  activeTours: number
  totalLeads: number
  monthlyRevenue: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeTours: 0,
    totalLeads: 0,
    monthlyRevenue: 0
  })
  const [activeTab, setActiveTab] = useState<'overview' | 'tours' | 'users'>('overview')
  const supabase = createClient()

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    const { data: users } = await supabase
      .from('profiles')
      .select('id')
      .eq('subscription_status', 'active')

    const { data: tours } = await supabase
      .from('tours')
      .select('id')
      .eq('status', 'active')

    const { data: leads } = await supabase
      .from('leads')
      .select('id')
      .gte('created_at', new Date(new Date().setDate(new Date().getDate() - 30)).toISOString())

    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('amount')
      .eq('status', 'active')

    setStats({
      totalUsers: users?.length || 0,
      activeTours: tours?.length || 0,
      totalLeads: leads?.length || 0,
      monthlyRevenue: subscriptions?.reduce((sum: number, sub: any) => sum + (sub.amount || 0), 0) || 0
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Navigation tabs */}
        <div className="flex gap-4 mb-6">
          {['overview', 'tours', 'users'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded-lg font-medium capitalize ${
                activeTab === tab
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <h3 className="text-sm font-medium text-gray-600">Total Users</h3>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalUsers}</p>
            </Card>
            <Card className="p-6">
              <h3 className="text-sm font-medium text-gray-600">Active Tours</h3>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.activeTours}</p>
            </Card>
            <Card className="p-6">
              <h3 className="text-sm font-medium text-gray-600">Leads (30 days)</h3>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalLeads}</p>
            </Card>
            <Card className="p-6">
              <h3 className="text-sm font-medium text-gray-600">Monthly Revenue</h3>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                KSh {stats.monthlyRevenue.toLocaleString()}
              </p>
            </Card>
          </div>
        )}

        {/* Tours tab */}
        {activeTab === 'tours' && (
          <TourAssigner onTourAssigned={fetchStats} />
        )}

        {/* Users tab */}
        {activeTab === 'users' && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">User Management</h3>
            <p className="text-gray-600">User management features coming soon...</p>
          </Card>
        )}
      </div>
    </div>
  )
}
