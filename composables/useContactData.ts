import { MapPinCheckInside } from 'lucide-vue-next'


export const useContactData = () => {
  const offices = [
    {
      id: 'dubai',
      title: 'Dubai HQ',
      address: 'Suite 403, Dubai National Insurance Building\nPort Saeed, Dubai, UAE',
      phone: '+971 4 397 7242',
      phoneLink: 'tel:+97143977242',
      email: 'info@inceltourism.com',
      hours: 'Sun - Thu: 9AM - 6PM',
      icon: MapPinCheckInside
    },
    {
      id: 'lagos',
      title: 'Lagos Office',
      address: '4th Floor, Right Wing, Mulliner Towers\nIkoyi, Lagos, Nigeria',
      phone: '+234 818 085 0745',
      phoneLink: 'tel:+2348180850745',
      email: 'info@inceltourism.com',
      hours: 'Mon - Fri: 9AM - 5PM',
      icon: MapPinCheckInside
    }
  ]

  const quickSupport = {
    title: 'Quick Support',
    description: 'Need immediate assistance? Our support team is available 24/7 on WhatsApp to answer your queries.',
    whatsappLink: 'https://wa.me/971543977242',
    phoneLink: 'tel:+97143977242'
  }

  return {
    offices,
    quickSupport
  }
}
