'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { buildBookingConfirmUrl } from '@/lib/whatsapp'
import { Badge } from '@/components/ui/Badge'

interface BookingItem {
  id: string
  property_name: string
  address: string
  preferred_date: string
  property_type: string
  bedrooms: number | null
  notes: string | null
  status: string
  created_at: string
  agent_name: string
  agent_phone: string
  company_name: string
}

interface BookingActionsProps {
  initialBookings: BookingItem[]
}

type StatusFilter = 'all' | 'requested' | 'scheduled' | 'completed' | 'cancelled'

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'requested', label: 'Requested' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

function getStatusBadge(status: string) {
  switch (status) {
    case 'requested':
      return <Badge variant="orange">Requested</Badge>
    case 'scheduled':
      return <Badge variant="blue">Scheduled</Badge>
    case 'completed':
      return <Badge variant="green">Completed</Badge>
    case 'cancelled':
      return <Badge variant="red">Cancelled</Badge>
    default:
      return <Badge variant="gray">{status}</Badge>
  }
}

export default function BookingActions({ initialBookings }: BookingActionsProps) {
  const [bookings, setBookings] = useState(initialBookings)
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [updating, setUpdating] = useState<string | null>(null)
  const supabase = createClient()

  const filtered = filter === 'all'
    ? bookings
    : bookings.filter(b => b.status === filter)

  const updateStatus = async (bookingId: string, newStatus: string) => {
    setUpdating(bookingId)
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId)

      if (error) throw error

      setBookings(prev =>
        prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b)
      )
    } catch (err) {
      console.error('Error updating booking:', err)
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div>
      {/* Status filter pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-1.5 text-sm font-medium rounded-full border transition-colors ${
              filter === f.value
                ? 'bg-orange-500 text-white border-orange-500'
                : 'bg-white text-gray-700 border-gray-300 hover:border-orange-300 hover:text-orange-600'
            }`}
          >
            {f.label}
            {f.value !== 'all' && (
              <span className="ml-1.5 text-xs opacity-75">
                ({bookings.filter(b => b.status === f.value).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Booking cards */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <p className="text-gray-500">No bookings matching this filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-sm transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900">{booking.property_name}</h3>
                    {getStatusBadge(booking.status)}
                  </div>
                  <p className="text-sm text-gray-600">{booking.address}</p>

                  <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-gray-500">
                    <span>🏢 {booking.agent_name}</span>
                    {booking.company_name && (
                      <span className="text-gray-400">({booking.company_name})</span>
                    )}
                    <span>📅 {new Date(booking.preferred_date).toLocaleDateString()}</span>
                    {booking.bedrooms && <span>🛏 {booking.bedrooms} bedrooms</span>}
                    <span className="capitalize">🏠 {booking.property_type}</span>
                  </div>

                  {booking.notes && (
                    <p className="text-sm text-gray-500 mt-2 italic">
                      &quot;{booking.notes}&quot;
                    </p>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap gap-2 shrink-0">
                  {booking.status === 'requested' && (
                    <>
                      {booking.agent_phone && (
                        <a
                          href={buildBookingConfirmUrl({
                            agentPhone: booking.agent_phone,
                            agentName: booking.agent_name,
                            propertyName: booking.property_name,
                            preferredDate: booking.preferred_date,
                          })}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-md transition-colors flex items-center gap-1.5"
                        >
                          <WhatsAppIcon />
                          Confirm via WA
                        </a>
                      )}
                      <button
                        onClick={() => updateStatus(booking.id, 'scheduled')}
                        disabled={updating === booking.id}
                        className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50"
                      >
                        {updating === booking.id ? 'Updating...' : 'Mark Scheduled'}
                      </button>
                    </>
                  )}
                  {booking.status === 'scheduled' && (
                    <button
                      onClick={() => updateStatus(booking.id, 'completed')}
                      disabled={updating === booking.id}
                      className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50"
                    >
                      {updating === booking.id ? 'Updating...' : 'Mark Completed'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function WhatsAppIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}
