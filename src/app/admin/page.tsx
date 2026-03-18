'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { buildWhatsAppUrl } from '@/lib/whatsapp'
import { lookupClientByEmail, addTourToClient } from './actions'
import Link from 'next/link'

interface ClientProfile {
  id: string
  full_name: string
  whatsapp_number: string
  plan_type: string
  plan_expires_at: string
  tours: { is_active: boolean }[] | null
}

export default function AdminDashboardPage() {
  const [profiles, setProfiles] = useState<ClientProfile[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  // Form State
  const [email, setEmail] = useState('')
  const [ownerId, setOwnerId] = useState('')
  const [clientName, setClientName] = useState('')
  const [lookupLoading, setLookupLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id, full_name, whatsapp_number, plan_type, plan_expires_at,
          tours ( is_active )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProfiles(data || [])
    } catch (err) {
      console.error('Error fetching clients:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleEmailBlur = async () => {
    if (!email || ownerId) return
    setLookupLoading(true)
    setFormError('')
    
    const result = await lookupClientByEmail(email)
    
    if (result.error) {
      setFormError(result.error)
      setClientName('')
      setOwnerId('')
    } else if (result.success && result.id && result.name) {
      setOwnerId(result.id)
      setClientName(result.name)
    }
    
    setLookupLoading(false)
  }

  const handlePreFillClient = (profile: ClientProfile) => {
    setEmail('(Selected from list)')
    setOwnerId(profile.id)
    setClientName(profile.full_name)
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmitTour = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFormError('')
    setFormSuccess('')
    
    if (!ownerId) {
      setFormError('Please lookup a valid client first')
      return
    }

    const formData = new FormData(e.currentTarget)
    formData.append('ownerId', ownerId)
    
    // Checkbox boolean logic
    const isActive = (e.currentTarget.elements.namedItem('isActive') as HTMLInputElement).checked
    formData.append('isActive', isActive.toString())

    const result = await addTourToClient(formData)
    
    if (result.error) {
      setFormError(result.error)
    } else {
      setFormSuccess(`Tour successfully assigned to ${clientName}!`)
      e.currentTarget.reset()
      setEmail('')
      setOwnerId('')
      setClientName('')
      fetchClients() // Refresh list
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
      
      {/* SECTION 1: Add Tour Form */}
      <section>
        <h2 className="text-2xl font-serif text-[#E8E3D9] mb-4">Assign New Tour</h2>
        <Card className="bg-[#141414] border-[#1E1E1E] p-6">
          <form onSubmit={handleSubmitTour} className="space-y-6 max-w-2xl">
            
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-[#C9A84C] uppercase tracking-wide border-b border-[#1E1E1E] pb-2">1. Select Client</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Client Email (or select from list below)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setOwnerId('')
                      setClientName('')
                    }}
                    onBlur={handleEmailBlur}
                    placeholder="client@email.com"
                    className="flex-1 bg-[#0A0A0A] border border-[#1E1E1E] rounded-md px-3 py-2 text-[#E8E3D9] placeholder:text-gray-600 focus:outline-none focus:border-[#C9A84C]"
                  />
                  {lookupLoading && <span className="text-gray-500 self-center text-sm">Searching...</span>}
                </div>
              </div>

              {clientName && (
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-md">
                  <p className="text-sm text-green-400">✅ Adding tour to: <strong className="text-white">{clientName}</strong></p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-[#C9A84C] uppercase tracking-wide border-b border-[#1E1E1E] pb-2 top-6 mt-6">2. Tour Details</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Tour Title</label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="e.g. 2BR Apartment, Westlands"
                  className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-md px-3 py-2 text-[#E8E3D9] placeholder:text-gray-600 focus:outline-none focus:border-[#C9A84C]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Address</label>
                <input
                  type="text"
                  name="address"
                  required
                  placeholder="e.g. Westlands, Nairobi"
                  className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-md px-3 py-2 text-[#E8E3D9] placeholder:text-gray-600 focus:outline-none focus:border-[#C9A84C]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Industry</label>
                <select
                  name="industry"
                  required
                  defaultValue="real_estate"
                  className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-md px-3 py-2 text-[#E8E3D9] focus:outline-none focus:border-[#C9A84C]"
                >
                  <option value="real_estate">Real Estate</option>
                  <option value="restaurant">Restaurant</option>
                  <option value="automotive">Automotive</option>
                  <option value="hotel">Hotel</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Realsee Embed URL</label>
                <input
                  type="url"
                  name="realseeUrl"
                  required
                  placeholder="https://realsee.ai/..."
                  className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-md px-3 py-2 text-[#E8E3D9] placeholder:text-gray-600 focus:outline-none focus:border-[#C9A84C]"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  defaultChecked
                  className="w-4 h-4 bg-[#0A0A0A] border-[#1E1E1E] rounded text-[#C9A84C] focus:ring-[#C9A84C]"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-400">Tour is active immediately</label>
              </div>
            </div>

            {formError && <p className="text-red-400 text-sm">{formError}</p>}
            {formSuccess && <p className="text-green-400 text-sm">{formSuccess}</p>}

            <button
              type="submit"
              disabled={!ownerId}
              className="px-6 py-2.5 bg-[#C9A84C] hover:bg-[#B39543] disabled:bg-gray-700 disabled:text-gray-500 text-[#0A0A0A] font-semibold rounded-md transition-colors"
            >
              Assign Tour
            </button>
          </form>
        </Card>
      </section>

      {/* SECTION 2: Client List */}
      <section>
        <h2 className="text-2xl font-serif text-[#E8E3D9] mb-4">Client List</h2>
        <Card className="bg-[#141414] border-[#1E1E1E] overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading clients...</div>
          ) : profiles.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No clients found in the database.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-[#0A0A0A] text-gray-400 border-b border-[#1E1E1E]">
                  <tr>
                    <th className="px-4 py-3 font-medium">Client Name</th>
                    <th className="px-4 py-3 font-medium">Plan</th>
                    <th className="px-4 py-3 font-medium">Expires</th>
                    <th className="px-4 py-3 font-medium">Active Tours</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E1E1E]">
                  {profiles.map(profile => {
                    const activeTours = profile.tours?.filter(t => t.is_active).length || 0
                    const isExpired = new Date(profile.plan_expires_at) < new Date()
                    const cleanWa = profile.whatsapp_number.replace(/\D/g, '')

                    return (
                      <tr key={profile.id} className="hover:bg-[#1A1A1A] transition-colors">
                        <td className="px-4 py-4">
                          <Link href={`/admin/clients/${profile.id}`} className="font-medium text-[#E8E3D9] hover:text-[#C9A84C] transition-colors">
                            {profile.full_name}
                          </Link>
                          <div className="text-xs text-gray-500 mt-0.5">{profile.whatsapp_number}</div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="capitalize text-gray-300">{profile.plan_type}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={isExpired ? 'text-red-400' : 'text-gray-400'}>
                            {new Date(profile.plan_expires_at).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-flex items-center justify-center bg-[#1E1E1E] text-gray-300 rounded-full h-6 w-6 text-xs font-medium">
                            {activeTours}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right space-x-2">
                          <a 
                            href={`https://wa.me/${cleanWa}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 bg-green-500/10 hover:bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs font-medium border border-green-500/20 transition-colors"
                          >
                            WA
                          </a>
                          <button 
                            onClick={() => handlePreFillClient(profile)}
                            className="inline-flex items-center gap-1 bg-[#C9A84C]/10 hover:bg-[#C9A84C]/20 text-[#C9A84C] px-2 py-1 rounded text-xs font-medium border border-[#C9A84C]/20 transition-colors"
                          >
                            + Tour
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </section>

    </div>
  )
}
