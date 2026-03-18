interface WhatsAppMessage {
  to: string
  message: string
  isAgent?: boolean
}

export class WhatsAppService {
  private static formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '')
    
    // Handle Kenyan numbers
    if (cleaned.startsWith('254')) {
      return cleaned
    }
    if (cleaned.startsWith('07') || cleaned.startsWith('01')) {
      return '254' + cleaned.substring(1)
    }
    
    return cleaned
  }

  static sendLeadNotification(leadData: {
    agentPhone: string
    agentCompany: string
    propertyTitle: string
    leadName: string
    leadPhone: string
    leadEmail?: string
    message: string
  }): void {
    const { agentPhone, agentCompany, propertyTitle, leadName, leadPhone, leadEmail, message } = leadData
    
    const whatsappMessage = `🏠 *NEW LEAD ALERT - ${agentCompany.toUpperCase()}* 🏠\n\n` +
      `📍 *Property:* ${propertyTitle}\n` +
      `👤 *Name:* ${leadName}\n` +
      `📞 *Phone:* ${leadPhone}\n` +
      `${leadEmail ? `📧 *Email:* ${leadEmail}\n` : ''}` +
      `💬 *Message:* ${message}\n\n` +
      `⚡ *Contact them ASAP!* ⚡\n` +
      `📊 Lead sent via Achwanya 3D Tours`

    const formattedPhone = this.formatPhoneNumber(agentPhone)
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(whatsappMessage)}`
    
    // Open WhatsApp in new tab
    window.open(whatsappUrl, '_blank')
  }

  static sendLeadConfirmation(leadData: {
    leadPhone: string
    propertyTitle: string
    agentCompany: string
  }): void {
    const { leadPhone, propertyTitle, agentCompany } = leadData
    
    const confirmationMessage = `✅ *Thank you for your interest!* ✅\n\n` +
      `🏠 *Property:* ${propertyTitle}\n` +
      `🏢 *Agent:* ${agentCompany}\n\n` +
      `Your inquiry has been received and ${agentCompany} will contact you shortly.\n\n` +
      `For immediate assistance, feel free to call or WhatsApp them directly.\n\n` +
      `🌐 Powered by Achwanya 3D Tours`

    const formattedPhone = this.formatPhoneNumber(leadPhone)
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(confirmationMessage)}`
    
    // Open WhatsApp in new tab (delayed)
    setTimeout(() => {
      window.open(whatsappUrl, '_blank')
    }, 2000)
  }

  static generateShareLink(propertyTitle: string, tourUrl: string): string {
    const shareMessage = `🏠 Check out this amazing property: ${propertyTitle}\n\n` +
      `📱 View the 3D Virtual Tour here: ${tourUrl}\n\n` +
      `🌐 Brought to you by Achwanya 3D Tours - Nairobi's Premier Virtual Tour Service`
    
    return `https://wa.me/?text=${encodeURIComponent(shareMessage)}`
  }
}
