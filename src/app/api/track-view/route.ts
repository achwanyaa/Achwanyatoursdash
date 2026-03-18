import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { tourId, ownerId, sessionId } = await req.json()

    if (!tourId || !ownerId || !sessionId) {
      return NextResponse.json(
        { error: 'Missing required tracking parameters' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()
    
    // Deduplicate: Check if this session already viewed this tour
    const existing = await supabase
      .from('tour_views')
      .select('id')
      .eq('tour_id', tourId)
      .eq('session_id', sessionId)
      .single()

    if (!existing.data) {
      // Record the new view
      const { error } = await supabase.from('tour_views').insert({
        tour_id: tourId,
        owner_id: ownerId,
        session_id: sessionId,
      })

      if (error) {
        console.error('[track-view] Error inserting view:', error)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[track-view] Server error:', err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
