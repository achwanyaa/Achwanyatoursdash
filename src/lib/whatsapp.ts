export const EDWARD_WA = "https://wa.me/254712345678"

/**
 * Build a wa.me deep-link with a pre-filled message.
 * Works on both Android and iOS.
 */
export function buildWhatsAppUrl(phone: string, message: string): string {
  const cleaned = phone.replace(/\D/g, '') // strip non-digits
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`
}
