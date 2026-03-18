'use client'

import { useState, useEffect, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { updateClientProfile, toggleTourStatus, deleteTour } from '../../actions'

interface Profile {
  id: string
  full_name: string
  whatsapp_number: string
  plan_type: string
  plan_expires_at: string
}

interface Tour {
  id: string
  title: string
  realsee_url: string
  is_active: boolean
}

export default function ClientMgmtPage({
  params
}: {
  params: Promise<{ clientId: string }>
}) {
  const { clientId } = use(params)
  const supabase = createClient()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [tours, setTours] = useState<Tour[]>([])
  const [loading, setLoading] = useState(true)
  
  // Edit Profile Form State
  const [editingProfile, setEditingProfile] = useState(false)
  const [editForm, setEditForm] = useState<Partial<Profile>>({})
  const [profileSubmitting, setProfileSubmitting] = useState(false)

  const fetchClientData = async () => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', clientId)
        .single()
        
      if (profileError) throw profileError
      
      const { data: toursData, error: toursError } = await supabase
        .from('tours')
        .select('*')
        .eq('owner_id', clientId)
        .order('created_at', { ascending: false })
        
      if (toursError) throw toursError

      setProfile(profileData)
      setEditForm(profileData)
      setTours(toursData || [])
    } catch (err) {
      console.error('Error fetching client data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClientData()
  }, [clientId])

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileSubmitting(true)

    // Convert local datetime-local to ISO string
    const payload = {
      ...editForm,
      plan_expires_at: new Date(editForm.plan_expires_at!).toISOString()
    }
    
    const result = await updateClientProfile(clientId, payload)
    
    if (result.success) {
      setEditingProfile(false)
      fetchClientData()
    } else {
      alert(result.error)
    }
    
    setProfileSubmitting(false)
  }

  const handleToggleTour = async (tourId: string, currentStatus: boolean) => {
    if (!confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this tour?`)) return
    
    const result = await toggleTourStatus(tourId, currentStatus)
    if (result.success) {
      fetchClientData()
    } else {
      alert(result.error)
    }
  }

  const handleDeleteTour = async (tourId: string) => {
    if (!confirm('Are you absolutely sure you want to permanently delete this tour? This cannot be undone.')) return
    
    const result = await deleteTour(tourId)
    if (result.success) {
      fetchClientData()
    } else {
      alert(result.error)
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading client details...</div>
  }

  if (!profile) {
    return <div className="p-8 text-center text-red-500">Client not found.</div>
  }

  // Formatting date for the native HTML date input
  const dateObj = new Date(editForm.plan_expires_at || profile.plan_expires_at)
  // local ISO string for datetime-local e.g. 2024-05-01T14:30
  const localIsoString = new Date(dateObj.getTime() - (dateObj.getTimezoneOffset() * 60000)).toISOString().slice(0, 16)

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      
      <div className="flex items-center gap-4">
        <Link href="/admin" className="text-gray-400 hover:text-white transition-colors">
          ← Back to Admin
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        
        {/* Profile Card */}
        <Card className="bg-[#141414] border-[#1E1E1E] p-6 relative">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-xl font-serif text-[#C9A84C]">Client Profile</h2>
            {!editingProfile && (
              <button 
                onClick={() => setEditingProfile(true)}
                className="text-sm text-gray-400 hover:text-white underline underline-offset-4"
              >
                Edit
              </button>
            )}
          </div>

          {editingProfile ? (
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Full Name</label>
                <input 
                  type="text" required
                  value={editForm.full_name || ''}
                  onChange={e => setEditForm({...editForm, full_name: e.target.value})}
                  className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded px-3 py-2 text-[#E8E3D9]"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">WhatsApp Number</label>
                <input 
                  type="text" required
                  value={editForm.whatsapp_number || ''}
                  onChange={e => setEditForm({...editForm, whatsapp_number: e.target.value})}
                  className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded px-3 py-2 text-[#E8E3D9]"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Plan Type</label>
                <select
                  value={editForm.plan_type || 'basic'}
                  onChange={e => setEditForm({...editForm, plan_type: e.target.value})}
                  className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded px-3 py-2 text-[#E8E3D9]"
                >
                  <option value="basic">Basic</option>
                  <option value="pro">Pro</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Expiry Date</label>
                <input 
                  type="datetime-local" required
                  value={localIsoString}
                  onChange={e => setEditForm({...editForm, plan_expires_at: e.target.value})}
                  className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded px-3 py-2 text-[#E8E3D9]"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setEditingProfile(false)} className="flex-1 px-4 py-2 border border-[#1E1E1E] text-gray-300 rounded hover:bg-[#1E1E1E]">Cancel</button>
                <button type="submit" disabled={profileSubmitting} className="flex-1 px-4 py-2 bg-[#C9A84C] text-[#0A0A0A] font-medium rounded hover:bg-[#B39543]">Save</button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 uppercase">Name</p>
                <p className="text-[#E8E3D9] font-medium text-lg">{profile.full_name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">WhatsApp</p>
                <p className="text-[#E8E3D9]">{profile.whatsapp_number}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Plan</p>
                <p className="text-[#E8E3D9] capitalize">{profile.plan_type}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Expires</p>
                <p className={new Date(profile.plan_expires_at) < new Date() ? 'text-red-400' : 'text-gray-300'}>
                  {new Date(profile.plan_expires_at).toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </Card>

        {/* Assigned Tours List */}
        <Card className="bg-[#141414] border-[#1E1E1E] p-6 h-full">
          <h2 className="text-xl font-serif text-[#C9A84C] mb-6">Assigned Tours</h2>
          
          {tours.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-[#1E1E1E] rounded-lg">
              <p className="text-gray-500">No tours assigned yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tours.map(tour => (
                <div key={tour.id} className="p-4 border border-[#1E1E1E] rounded-lg bg-[#0A0A0A]">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-[#E8E3D9] break-all pr-4">{tour.title}</h3>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`h-2 w-2 rounded-full ${tour.is_active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      <span className="text-xs text-gray-500">{tour.is_active ? 'Active' : 'Inactive'}</span>
                    </div>
                  </div>
                  
                  <a href={tour.realsee_url} target="_blank" rel="noreferrer" className="text-xs text-[#C9A84C] hover:underline break-all mb-4 block">
                    {tour.realsee_url}
                  </a>

                  <div className="flex gap-2 pt-3 border-t border-[#1E1E1E]">
                    <button 
                      onClick={() => handleToggleTour(tour.id, tour.is_active)}
                      className="px-3 py-1.5 text-xs font-medium border border-[#1E1E1E] text-gray-300 hover:text-white hover:bg-[#1E1E1E] rounded transition-colors"
                    >
                      {tour.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button 
                      onClick={() => handleDeleteTour(tour.id)}
                      className="px-3 py-1.5 text-xs font-medium border border-red-900 text-red-400 hover:bg-red-950/30 rounded transition-colors ml-auto"
                    >
                      Delete
                    </button>
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
