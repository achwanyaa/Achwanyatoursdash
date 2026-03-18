import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { tourId, ownerId, name, phone, message } = await req.json()

    if (!name || !phone || phone.replace(/\D/g, '').length < 9) {
      return NextResponse.json(
        { error: 'Valid name and phone (min 9 digits) are required' },
        { status: 400 }
      )
    }

    if (!tourId || !ownerId) {
      return NextResponse.json(
        { error: 'Missing tour or owner context' },
        { status: 400 }
      )
    }

    // Insert lead into DB via server client (triggers insert views RLS policy)
    const supabase = createServerClient()
    const { error } = await supabase.from('leads').insert({
      tour_id: tourId,
      owner_id: ownerId,
      full_name: name,
      phone: phone,
    })

    if (error) {
      console.error('[leads] DB Error:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    // Trigger webhook if it exists (for Make.com / CRM forwarding)
    const webhookUrl = process.env.LEAD_WEBHOOK_URL
    if (webhookUrl) {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tourId, ownerId, name, phone, message }),
      }).catch(() => {}) // Non-blocking
    } else if (process.env.NODE_ENV === 'development') {
      console.warn('[leads] LEAD_WEBHOOK_URL not set — lead saved to DB but not forwarded via webhook')
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[leads] Route error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
