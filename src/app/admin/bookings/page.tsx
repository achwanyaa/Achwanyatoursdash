import { createServerClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/Badge'
import BookingActions from './BookingActions'

interface BookingWithProfile {
  id: string
  property_name: string
  address: string
  preferred_date: string
  property_type: string
  bedrooms: number | null
  notes: string | null
  status: string
  created_at: string
  user_id: string
  profiles: {
    full_name: string | null
    whatsapp_number: string | null
    company_name: string | null
  } | null
}

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

export default async function AdminBookingsPage() {
  const supabase = createServerClient()

  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      *,
      profiles!bookings_user_id_fkey(full_name, whatsapp_number, company_name)
    `)
    .order('created_at', { ascending: false })

  const bookingsData = (bookings || []) as unknown as BookingWithProfile[]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
          <Badge variant="gray">{bookingsData.length}</Badge>
        </div>
      </div>

      {bookingsData.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📋</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings yet</h3>
          <p className="text-gray-600">Bookings from clients will appear here.</p>
        </div>
      ) : (
        <BookingActions
          initialBookings={bookingsData.map(b => ({
            id: b.id,
            property_name: b.property_name,
            address: b.address,
            preferred_date: b.preferred_date,
            property_type: b.property_type,
            bedrooms: b.bedrooms,
            notes: b.notes,
            status: b.status,
            created_at: b.created_at,
            agent_name: b.profiles?.full_name || 'Unknown',
            agent_phone: b.profiles?.whatsapp_number || '',
            company_name: b.profiles?.company_name || '',
          }))}
        />
      )}
    </div>
  )
}
