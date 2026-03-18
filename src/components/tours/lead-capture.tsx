'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { WhatsAppService } from '@/lib/utils/whatsapp'

interface LeadCaptureProps {
  tourId: string
  propertyTitle: string
  agentWhatsApp: string
  agentCompany: string
}

export function LeadCapture({ tourId, propertyTitle, agentWhatsApp, agentCompany }: LeadCaptureProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: `I'm interested in ${propertyTitle}`
  })
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Save lead to database
      const { error } = await supabase
        .from('leads')
        .insert({
          tour_id: tourId,
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          message: formData.message,
          source: 'tour'
        })

      if (error) throw error

      // Send WhatsApp notification to agent
      WhatsAppService.sendLeadNotification({
        agentPhone: agentWhatsApp,
        agentCompany: agentCompany,
        propertyTitle: propertyTitle,
        leadName: formData.name,
        leadPhone: formData.phone,
        leadEmail: formData.email,
        message: formData.message
      })

      // Send confirmation to lead
      WhatsAppService.sendLeadConfirmation({
        leadPhone: formData.phone,
        propertyTitle: propertyTitle,
        agentCompany: agentCompany
      })

      setIsOpen(false)
      setFormData({ name: '', phone: '', email: '', message: `I'm interested in ${propertyTitle}` })
    } catch (error) {
      console.error('Error submitting lead:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {/* Floating lead capture button */}
      <div className="fixed bottom-4 left-4 z-20">
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-full shadow-lg"
        >
          📞 Get More Info
        </Button>
      </div>

      {/* Lead capture modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">
              Request Information - {propertyTitle}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Your full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Phone Number *</label>
                <input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="+254 7XX XXX XXX"
                  type="tel"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="your@email.com"
                  type="email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Message</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-orange-500 hover:bg-orange-600"
                >
                  {isSubmitting ? 'Sending...' : 'Send Request'}
                </Button>
              </div>
            </form>

            <p className="text-xs text-gray-500 mt-4 text-center">
              You'll receive an instant WhatsApp confirmation
            </p>
          </div>
        </div>
      )}
    </>
  )
}
