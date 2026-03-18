'use client'

import { useState } from 'react'
import { buildWhatsAppUrl } from '@/lib/whatsapp'

interface LeadFormProps {
  tourId: string
  ownerId: string
  tourTitle: string
  ownerPhone: string
}

export function LeadForm({ tourId, ownerId, tourTitle, ownerPhone }: LeadFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || phone.replace(/\D/g, '').length < 9) return
    
    setSubmitting(true)
    
    try {
      // 1. Save lead to database
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tourId, ownerId, name, phone, message: 'Interested via 3D Tour' }),
      })

      // 2. Open WhatsApp deep link
      const message = `Hi, I viewed the 3D tour for ${tourTitle} and I'm interested. My name is ${name}, number: ${phone}`
      const waUrl = buildWhatsAppUrl(ownerPhone, message)
      
      window.open(waUrl, '_blank')
      setIsOpen(false)
      setName('')
      setPhone('')
    } catch (error) {
      console.error('Error submitting lead:', error)
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-6 px-4 pointer-events-none">
        <button
          onClick={() => setIsOpen(true)}
          className="pointer-events-auto flex items-center gap-2 bg-[#C9A84C] hover:bg-[#B39543] text-[#0A0A0A] px-6 py-3 rounded-full font-serif font-semibold shadow-lg shadow-black/50 transition-transform active:scale-95"
        >
          <span>💬</span> Enquire about this property
        </button>
      </div>
    )
  }

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-black/60 z-40 transition-opacity"
        onClick={() => setIsOpen(false)}
      />
      
      {/* Bottom Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#141414] border-t border-[#1E1E1E] rounded-t-2xl shadow-2xl transition-transform transform translate-y-0">
        <div className="p-6 max-w-lg mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-serif text-[#E8E3D9]">Interested in this property?</h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-white p-2"
            >
              ✕
            </button>
          </div>
          
          <p className="text-gray-400 text-sm mb-6">
            Leave your details and we'll connect you directly with the agent via WhatsApp.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Your Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-4 py-3 text-[#E8E3D9] placeholder:text-gray-600 focus:outline-none focus:border-[#C9A84C]"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">WhatsApp Number</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="0712 345 678"
                className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-4 py-3 text-[#E8E3D9] placeholder:text-gray-600 focus:outline-none focus:border-[#C9A84C]"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !name || phone.length < 9}
              className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-semibold rounded-lg px-4 py-3 mt-4 transition-colors flex justify-center items-center gap-2"
            >
              {submitting ? 'Connecting...' : (
                <>
                  <WhatsAppIcon />
                  Send via WhatsApp
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  )
}

function WhatsAppIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}
