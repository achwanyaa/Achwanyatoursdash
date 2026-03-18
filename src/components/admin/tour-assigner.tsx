'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

interface Tour {
  id: string
  realsee_url: string
  realsee_id: string
  profile_id: string | null
  status: string
  properties: {
    title: string
    address: string
  } | null
  profiles: {
    full_name: string
    email: string
  } | null
}

interface User {
  id: string
  full_name: string
  email: string
  plan_type: string
  max_tours: number
}

interface TourAssignerProps {
  onTourAssigned: () => void
}

export function TourAssigner({ onTourAssigned }: TourAssignerProps) {
  const [tours, setTours] = useState<Tour[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [selectedTour, setSelectedTour] = useState<string>('')
  const [selectedUser, setSelectedUser] = useState<string>('')
  const [newTourUrl, setNewTourUrl] = useState('')
  const [isAssigning, setIsAssigning] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchTours()
    fetchUsers()
  }, [])

  const fetchTours = async () => {
    const { data } = await supabase
      .from('tours')
      .select(`
        *,
        properties (title, address),
        profiles (full_name, email)
      `)
      .order('created_at', { ascending: false })

    setTours(data || [])
  }

  const fetchUsers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('subscription_status', 'active')
      .order('created_at', { ascending: false })

    setUsers(data || [])
  }

  const addNewTour = async () => {
    if (!newTourUrl) return

    setIsAssigning(true)
    try {
      // Extract Realsee ID from URL
      const realseeId = newTourUrl.split('/').pop()?.split('?')[0]
      if (!realseeId) throw new Error('Invalid Realsee URL')

      const { error } = await supabase
        .from('tours')
        .insert({
          realsee_url: newTourUrl,
          realsee_id: realseeId,
          status: 'processing', // Will be updated when assigned to user
          profile_id: null,
          property_id: null
        })

      if (error) throw error

      setNewTourUrl('')
      fetchTours()
    } catch (error) {
      console.error('Error adding tour:', error)
    } finally {
      setIsAssigning(false)
    }
  }

  const assignTourToUser = async () => {
    if (!selectedTour || !selectedUser) return

    setIsAssigning(true)
    try {
      const { error } = await supabase
        .from('tours')
        .update({
          profile_id: selectedUser,
          status: 'active'
        })
        .eq('id', selectedTour)

      if (error) throw error

      setSelectedTour('')
      setSelectedUser('')
      fetchTours()
      onTourAssigned()
    } catch (error) {
      console.error('Error assigning tour:', error)
    } finally {
      setIsAssigning(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Add new tour */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Add New Tour</h3>
        <div className="flex gap-4">
          <Input
            value={newTourUrl}
            onChange={(e) => setNewTourUrl(e.target.value)}
            placeholder="Paste Realsee tour URL here..."
            className="flex-1"
          />
          <Button
            onClick={addNewTour}
            disabled={!newTourUrl || isAssigning}
            className="bg-orange-500 hover:bg-orange-600"
          >
            Add Tour
          </Button>
        </div>
      </Card>

      {/* Assign tour to user */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Assign Tour to Client</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Select Tour</label>
            <select
              value={selectedTour}
              onChange={(e) => setSelectedTour(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Choose a tour...</option>
              {tours
                .filter(tour => !tour.profile_id) // Only show unassigned tours
                .map(tour => (
                  <option key={tour.id} value={tour.id}>
                    {tour.realsee_id} - {tour.properties?.title || 'No property assigned'}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Select Client</label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Choose a client...</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.full_name} ({user.email}) - {user.plan_type}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Button
          onClick={assignTourToUser}
          disabled={!selectedTour || !selectedUser || isAssigning}
          className="mt-4 bg-green-500 hover:bg-green-600"
        >
          Assign Tour
        </Button>
      </Card>

      {/* Existing tours */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">All Tours</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Realsee ID</th>
                <th className="text-left py-2">Property</th>
                <th className="text-left py-2">Client</th>
                <th className="text-left py-2">Status</th>
                <th className="text-left py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tours.map(tour => (
                <tr key={tour.id} className="border-b">
                  <td className="py-2">{tour.realsee_id}</td>
                  <td className="py-2">
                    {tour.properties?.title || 'No property'}
                  </td>
                  <td className="py-2">
                    {tour.profiles?.full_name || 'Unassigned'}
                  </td>
                  <td className="py-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      tour.status === 'active' ? 'bg-green-100 text-green-800' :
                      tour.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {tour.status}
                    </span>
                  </td>
                  <td className="py-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(`/tours/${tour.id}`, '_blank')}
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
