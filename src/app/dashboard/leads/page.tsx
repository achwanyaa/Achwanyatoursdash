export const dynamic = 'force-dynamic'

import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

interface LeadWithTour {
  id: string
  full_name: string
  phone: string
  message: string | null
  created_at: string
  tours: {
    property_name: string
  } | null
}

function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length <= 6) return digits
  return digits.substring(0, 6) + '****'
}

function cleanPhone(phone: string): string {
  return phone.replace(/\D/g, '')
}

export default async function LeadsPage() {
  const supabase = createServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: leads } = await supabase
    .from('leads')
    .select(`
      id, full_name, phone, message, created_at,
      tours(property_name)
    `)
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  const leadsData = (leads || []) as unknown as LeadWithTour[]

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Your Leads</h1>
          <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-700">
            {leadsData.length}
          </span>
        </div>
      </div>

      {leadsData.length === 0 ? (
        /* Empty state */
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📬</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No leads yet</h3>
          <p className="text-gray-600 mb-6">
            Share your tour link to start capturing leads
          </p>
          <Link
            href="/dashboard"
            className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors inline-block"
          >
            View Your Tours
          </Link>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Lead Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Phone</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Property</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody>
                {leadsData.map((lead) => (
                  <tr key={lead.id} className="border-b last:border-b-0 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{lead.full_name}</td>
                    <td className="py-3 px-4 text-gray-600">{maskPhone(lead.phone)}</td>
                    <td className="py-3 px-4 text-gray-600">
                      {lead.tours?.property_name || 'Unknown'}
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <a
                        href={`https://wa.me/${cleanPhone(lead.phone)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded-full transition-colors"
                      >
                        <WhatsAppIcon />
                        Chat
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {leadsData.map((lead) => (
              <div key={lead.id} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900">{lead.full_name}</h4>
                    <p className="text-sm text-gray-600 mt-0.5">{maskPhone(lead.phone)}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {lead.tours?.property_name || 'Unknown property'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <a
                    href={`https://wa.me/${cleanPhone(lead.phone)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded-full transition-colors shrink-0 ml-3"
                  >
                    <WhatsAppIcon />
                    Chat
                  </a>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function WhatsAppIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}
