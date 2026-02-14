export const useVisaData = () => {
  const visaTypes = [
    {
      id: 'tourist-30',
      title: 'Tourist Visa - 30 Days',
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800',
      processingTime: '3-5 working days',
      documentsCount: 4,
      documents: [
        'Passport copy (valid 6 months)',
        'Passport size photo',
        'Confirmed flight tickets',
        'Hotel booking confirmation'
      ],
      price: 120000
    },
    {
      id: 'tourist-60',
      title: 'Tourist Visa - 60 Days',
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800',
      processingTime: '3-5 working days',
      documentsCount: 3,
      documents: [
        'Passport copy (valid 6 months)',
        'Passport size photo',
        'Travel insurance'
      ],
      price: 180000
    },
    {
      id: 'multiple-90',
      title: 'Multiple Entry - 90 Days',
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800',
      processingTime: '5-7 working days',
      documentsCount: 4,
      documents: [
        'Passport copy (valid 6 months)',
        'Passport size photo',
        'Employment letter',
        'Travel insurance'
      ],
      price: 250000
    }
  ]

  const countries = [
    'Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Uganda', 'Tanzania',
    'Rwanda', 'Ethiopia', 'Cameroon', 'Senegal', 'Côte d\'Ivoire',
    'Other'
  ]

  const benefits = [
    'Expert guidance throughout the application process',
    'Fast processing with 95% approval rate',
    'Document verification and review',
    '24/7 customer support',
    'Transparent pricing with no hidden fees'
  ]

  const steps = [
    { number: 1, title: 'Nationality', id: 'nationality' },
    { number: 2, title: 'Visa Type', id: 'visa-type' },
    { number: 3, title: 'Documents', id: 'documents' },
    { number: 4, title: 'Details', id: 'details' }
  ]

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(price)
  }

  return {
    visaTypes,
    countries,
    benefits,
    steps,
    formatPrice
  }
}
