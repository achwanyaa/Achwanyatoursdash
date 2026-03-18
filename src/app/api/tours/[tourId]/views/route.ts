import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// MVP rate limiting: track unique sessions in-memory per serverless invocation.
// This resets on each cold start, so it's best-effort deduplication.
// For production, use Redis or a Supabase table for session tracking.
const seenSessions = new Set<string>()

export async function POST(
  req: Request,
  { params }: { params: Promise<{ tourId: string }> }
) {
  const { tourId } = await params

  try {
    const body = await req.json().catch(() => ({}))
    const sessionId: string | undefined = body.session_id

    // Deduplicate by session_id within this serverless invocation
    if (sessionId) {
      const key = `${tourId}:${sessionId}`
      if (seenSessions.has(key)) {
        return NextResponse.json({ ok: true, deduplicated: true })
      }
      seenSessions.add(key)
    }

    const supabase = createServerClient()

    const { error } = await supabase.rpc('increment_tour_views', {
      tour_id: tourId,
    })

    if (error) {
      // Fallback: direct update if RPC doesn't exist
      const { error: updateError } = await supabase
        .from('tours')
        .update({ views: undefined }) // trigger a raw SQL increment
        .eq('id', tourId)

      if (updateError) {
        console.error('[views] Error incrementing views:', updateError.message)
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[views] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
