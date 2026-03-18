'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'

export default function BookShootPage() {
  const [formData, setFormData] = useState({
    property_name: '',
    address: '',
    preferred_date: '',
    property_type: 'apartment',
    bedrooms: '',
    notes: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const supabase = createClient()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      const { error } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          property_name: formData.property_name,
          address: formData.address,
          preferred_date: formData.preferred_date,
          property_type: formData.property_type,
          bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
          notes: formData.notes,
          status: 'requested'
        })

      if (error) throw error

      setMessage('✅ Shoot request submitted! We will contact you to schedule the photo shoot.')
      setFormData({
        property_name: '',
        address: '',
        preferred_date: '',
        property_type: 'apartment',
        bedrooms: '',
        notes: ''
      })
    } catch (error: any) {
      setMessage(`❌ ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Book a Shoot</h1>
            <p className="text-sm text-gray-600">Schedule a professional 3D virtual tour photoshoot</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => router.push('/dashboard')}
          >
            Back to Dashboard
          </Button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-6">Property Details</h2>
          
          {message && (
            <div className={`p-4 rounded-md mb-6 text-sm ${
              message.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Property Name *</label>
              <Input
                value={formData.property_name}
                onChange={(e) => handleInputChange('property_name', e.target.value)}
                placeholder="e.g., Riverside Apartments, Unit 4B"
                required
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Property Address *</label>
              <Input
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="e.g., Riverside Drive, Nairobi, Kenya"
                required
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Preferred Date *</label>
                <Input
                  type="date"
                  value={formData.preferred_date}
                  onChange={(e) => handleInputChange('preferred_date', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Property Type</label>
                <select
                  value={formData.property_type}
                  onChange={(e) => handleInputChange('property_type', e.target.value)}
                  className="w-full h-10 px-3 border border-gray-300 rounded-md"
                >
                  <option value="apartment">Apartment</option>
                  <option value="villa">Villa</option>
                  <option value="townhouse">Townhouse</option>
                  <option value="office">Office</option>
                  <option value="airbnb">Airbnb</option>
                  <option value="land">Land</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Bedrooms</label>
              <Input
                type="number"
                value={formData.bedrooms}
                onChange={(e) => handleInputChange('bedrooms', e.target.value)}
                placeholder="Number of bedrooms"
                min="1"
                max="20"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Additional Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Any special requirements or instructions for the photoshoot..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none"
              />
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h4 className="font-semibold text-orange-800 mb-2">What's Included?</h4>
              <ul className="space-y-1 text-sm text-orange-700">
                <li>• Professional photography equipment</li>
                <li>• 360° camera setup</li>
                <li>• HDR image processing</li>
                <li>• Virtual tour creation</li>
                <li>• Property hosting for 1 year</li>
                <li>• WhatsApp integration setup</li>
              </ul>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            >
              {loading ? 'Submitting...' : 'Submit Shoot Request'}
            </Button>
          </form>
        </Card>

        {/* Info Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">📸 Process</h3>
            <ol className="space-y-2 text-sm text-gray-600">
              <li>1. Submit your shoot request</li>
              <li>2. We contact you within 24 hours</li>
              <li>3. Schedule photoshoot at convenient time</li>
              <li>4. Professional photographer visits property</li>
              <li>5. 3D tour created within 48 hours</li>
              <li>6. Tour goes live on your dashboard</li>
            </ol>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-4">💰 Pricing</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Studio Apartment</span>
                <span className="font-semibold">KSh 15,000</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">1-3 Bedroom House</span>
                <span className="font-semibold">KSh 20,000</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">4+ Bedroom Villa</span>
                <span className="font-semibold">KSh 35,000</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Commercial Property</span>
                <span className="font-semibold">KSh 50,000</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              * Pricing depends on property size and complexity. Final quote provided after consultation.
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}
