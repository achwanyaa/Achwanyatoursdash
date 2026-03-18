import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = createServerClient()
  const { tourId, ownerId, name, phone, message } = await req.json()

  // Insert lead (RLS: insert is public — no auth required for lead capture)
  const { error } = await supabase.from('leads').insert({
    tour_id: tourId,
    owner_id: ownerId,
    full_name: name,
    phone,
    message: message ?? null,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Trigger edge function / webhook to forward lead to owner's WhatsApp
  // (via Make.com scenario, Supabase Edge Function, or direct Twilio/Vonage call)
  if (process.env.LEAD_WEBHOOK_URL) {
    await fetch(process.env.LEAD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tourId, ownerId, name, phone, message }),
    }).catch(() => {}) // non-blocking — lead is already stored
  }

  return NextResponse.json({ ok: true })
}
