export const useGlobalVisaData = () => {
  const countries = [
    {
      id: 'united-kingdom',
      name: 'United Kingdom',
      flag: '🇬🇧',
      image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800'
    },
    {
      id: 'united-states',
      name: 'United States',
      flag: '🇺🇸',
      image: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800'
    },
    {
      id: 'canada',
      name: 'Canada',
      flag: '🇨🇦',
      image: 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=800'
    },
    {
      id: 'schengen',
      name: 'Schengen Area (Europe)',
      flag: '🇪🇺',
      image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800'
    },
    {
      id: 'australia',
      name: 'Australia',
      flag: '🇦🇺',
      image: 'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=800'
    },
    {
      id: 'new-zealand',
      name: 'New Zealand',
      flag: '🇳🇿',
      image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800'
    },
    {
      id: 'singapore',
      name: 'Singapore',
      flag: '🇸🇬',
      image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800'
    },
    {
      id: 'china',
      name: 'China',
      flag: '🇨🇳',
      image: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800'
    },
    {
      id: 'turkey',
      name: 'Turkey',
      flag: '🇹🇷',
      image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800'
    },
    {
      id: 'egypt',
      name: 'Egypt',
      flag: '🇪🇬',
      image: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=800'
    }
  ]

  const services = {
    column1: [
      'Visa requirement assessment',
      'Document preparation guidance',
      'Application form assistance',
      'Interview preparation tips'
    ],
    column2: [
      'Embassy appointment booking',
      'Application tracking',
      'Travel insurance arrangement',
      'Post-visa travel planning'
    ]
  }

  const nationalities = [
    'Nigerian',
    'Ghanaian',
    'Kenyan',
    'South African',
    'Ugandan',
    'Tanzanian',
    'Rwandan',
    'Ethiopian',
    'Cameroonian',
    'Senegalese',
    'Other'
  ]

  const purposeOfTravel = [
    'Tourism',
    'Business',
    'Work',
    'Study',
    'Medical',
    'Transit',
    'Visit Family/Friends',
    'Conference/Event',
    'Other'
  ]

  return {
    countries,
    services,
    nationalities,
    purposeOfTravel
  }
}
