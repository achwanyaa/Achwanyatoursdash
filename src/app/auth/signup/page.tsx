'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    companyName: '',
    whatsappNumber: '',
    email: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const supabase = createClient()
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      // Validate WhatsApp number (Kenyan format)
      const phoneRegex = /^\+254[17]\d{8}$/
      if (!phoneRegex.test(formData.whatsappNumber)) {
        throw new Error('Please enter a valid Kenyan WhatsApp number (+254 7XX XXX XXX)')
      }

      // Sign up with magic link
      const { error } = await supabase.auth.signInWithOtp({
        email: formData.email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            full_name: formData.fullName,
            company_name: formData.companyName,
            whatsapp_number: formData.whatsappNumber
          }
        }
      })

      if (error) throw error

      setMessage('✅ Check your email for the magic link to complete your registration!')
    } catch (error: any) {
      setMessage(`❌ ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const formatWhatsAppNumber = (value: string) => {
    // Remove all non-digits
    let cleaned = value.replace(/\D/g, '')
    
    // Handle different formats
    if (cleaned.startsWith('254')) {
      return `+254${cleaned.substring(3)}`
    } else if (cleaned.startsWith('07') || cleaned.startsWith('01')) {
      return `+254${cleaned.substring(1)}`
    } else if (cleaned.startsWith('7') || cleaned.startsWith('1')) {
      return `+254${cleaned}`
    }
    
    return value
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-500 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">A3T</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Start Free Trial</h1>
          <p className="text-gray-600 mt-2">Join Nairobi's leading 3D tour service</p>
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-6">Create Your Account</h2>
          
          {message && (
            <div className={`p-3 rounded-md mb-4 text-sm ${
              message.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name *</label>
              <Input
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="John Doe"
                required
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Company Name</label>
              <Input
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                placeholder="Your Real Estate Agency"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">WhatsApp Number *</label>
              <Input
                value={formData.whatsappNumber}
                onChange={(e) => setFormData({ ...formData, whatsappNumber: formatWhatsAppNumber(e.target.value) })}
                placeholder="+254 7XX XXX XXX"
                required
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">Format: +254 712 345 678</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email Address *</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your@email.com"
                required
                className="w-full"
              />
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <p className="text-sm text-orange-800">
                <strong>Free Trial Includes:</strong><br/>
                • 1 active property tour<br/>
                • Up to 3 bedrooms<br/>
                • 7 days full access<br/>
                • WhatsApp lead notifications
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600"
            >
              {loading ? 'Creating Account...' : 'Start Free Trial'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-orange-500 hover:text-orange-600 font-medium">
                Sign in here
              </Link>
            </p>
          </div>
        </Card>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>📧 support@achwanya.co.ke</p>
          <p>📍 Nairobi, Kenya</p>
        </div>
      </div>
    </div>
  )
}
