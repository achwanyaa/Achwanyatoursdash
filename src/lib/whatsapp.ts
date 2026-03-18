// All WhatsApp interactions flow through this module.
// Rule: the lead always routes to the TOUR OWNER's WhatsApp, never a central number.

interface WhatsAppLinkOptions {
  phone: string           // stored as +254XXXXXXXXX
  propertyName: string
  address: string
  leadName?: string
  leadPhone?: string
}

/**
 * Build a wa.me deep-link with a pre-filled message.
 * Works on both Android and iOS.
 */
export function buildWhatsAppUrl(opts: WhatsAppLinkOptions): string {
  const cleaned = opts.phone.replace(/\D/g, '')   // strip non-digits
  const body = opts.leadName
    ? `Hi, I'm ${opts.leadName}. I viewed the virtual tour for *${opts.propertyName}* (${opts.address}) and I'm interested. Please contact me on ${opts.leadPhone ?? 'the number I provided'}.`
    : `Hi, I viewed the virtual tour for *${opts.propertyName}* (${opts.address}) and I'm interested in scheduling a viewing.`

  return `https://wa.me/${cleaned}?text=${encodeURIComponent(body)}`
}

/**
 * Server-side: store lead in Supabase AND trigger WhatsApp notification
 * to the property owner (via a Supabase Edge Function or Make webhook).
 */
export async function submitLead(payload: {
  tourId: string
  ownerId: string
  ownerPhone: string
  name: string
  phone: string
  message?: string
}) {
  // 1. POST to our API route (which inserts into leads table)
  const res = await fetch('/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) throw new Error('Lead submission failed')

  // 2. Return the wa.me URL so the client can open WhatsApp directly
  return buildWhatsAppUrl({
    phone: payload.ownerPhone,
    propertyName: '',        // populated server-side in real implementation
    address: '',
    leadName: payload.name,
    leadPhone: payload.phone,
  })
}
