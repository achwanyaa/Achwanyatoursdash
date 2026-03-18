import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { TourViewer } from '@/components/tours/tour-viewer'
import { LeadCapture } from '@/components/tours/lead-capture'

interface TourPageProps {
  params: {
    id: string
  }
}

export default async function TourPage({ params }: TourPageProps) {
  const supabase = createServerClient()
  
  // Get tour with property and profile data
  const { data: tour, error } = await supabase
    .from('tours')
    .select(`
      *,
      properties (
        id,
        title,
        description,
        address,
        price,
        bedrooms,
        bathrooms,
        area_sqft
      ),
      profiles (
        id,
        company_name,
        whatsapp_number
      )
    `)
    .eq('id', params.id)
    .eq('status', 'active')
    .single()

  if (error || !tour) {
    notFound()
  }

  // Track view analytics
  const { data: { session } } = await supabase.auth.getSession()
  
  // Note: In a real implementation, you'd want to get IP and user agent from headers
  // This is simplified for the MVP
  await supabase
    .from('tour_analytics')
    .insert({
      tour_id: params.id,
      session_id: session?.user?.id || null,
      user_agent: '', // Would get from headers
      referrer: '', // Would get from headers
    })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with property info */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-xl font-semibold text-gray-900">
            {tour.properties?.title}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {tour.properties?.address} • KSh {tour.properties?.price?.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Main tour viewer */}
      <div className="relative">
        <TourViewer 
          realseeUrl={tour.realsee_url}
          tourId={tour.id}
          propertyTitle={tour.properties?.title || 'Property Tour'}
        />
        
        {/* Lead capture overlay */}
        {tour.profiles && (
          <LeadCapture 
            tourId={tour.id}
            propertyTitle={tour.properties?.title || 'Property Tour'}
            agentWhatsApp={tour.profiles.whatsapp_number || ''}
            agentCompany={tour.profiles.company_name || 'Real Estate Agent'}
          />
        )}
      </div>
    </div>
  )
}
