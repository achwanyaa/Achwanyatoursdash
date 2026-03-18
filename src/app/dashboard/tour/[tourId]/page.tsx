import { createServerClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ViewTracker } from '@/components/ViewTracker'
import { LeadForm } from '@/components/LeadForm'

interface TourWithProfile {
  id: string
  owner_id: string
  title: string
  address: string
  realsee_url: string
  profiles: {
    whatsapp_number: string
  }
}

export default async function TourViewerPage({
  params,
}: {
  params: Promise<{ tourId: string }>
}) {
  const { tourId } = await params
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: tour } = await supabase
    .from('tours')
    .select('*, profiles!inner(whatsapp_number)')
    .eq('id', tourId)
    .single()

  if (!tour || tour.owner_id !== user.id) notFound()

  const tourData = tour as unknown as TourWithProfile

  return (
    // Fixed inset-0 breaks this out of the dashboard layout to take over the full screen
    <div className="fixed inset-0 z-[100] bg-[#0A0A0A] flex flex-col">
      <ViewTracker tourId={tourData.id} ownerId={tourData.owner_id} />

      {/* Header Bar */}
      <div className="h-[52px] bg-[#141414] border-b border-[#1E1E1E] flex items-center justify-between px-4 shrink-0 shadow-sm">
        <div className="flex items-center gap-4 truncate">
          <Link 
            href="/dashboard"
            className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
          >
            ←<span className="hidden sm:inline">Back</span>
          </Link>
          <div className="h-4 w-px bg-[#333] hidden sm:block"></div>
          <div className="truncate">
            <h1 className="text-[#E8E3D9] font-serif font-medium truncate leading-none">{tourData.title}</h1>
            <p className="text-xs text-gray-500 truncate mt-0.5">{tourData.address}</p>
          </div>
        </div>
      </div>

      {/* Realsee Iframe */}
      <iframe
        src={tourData.realsee_url}
        allow="xr-spatial-tracking; fullscreen; gyroscope; accelerometer; magnetometer"
        allowFullScreen
        className="flex-1 w-full border-0"
        title={tourData.title}
      />

      {/* Lead Capture Bottom Sheet */}
      <LeadForm 
        tourId={tourData.id} 
        ownerId={tourData.owner_id} 
        tourTitle={tourData.title} 
        ownerPhone={tourData.profiles.whatsapp_number}
      />
    </div>
  )
}
