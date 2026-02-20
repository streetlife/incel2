/**
 * useTourBookingStore — shared tour booking state across all steps.
 */
import { reactive, computed } from 'vue'

export interface Participant {
  type: 'ADULT' | 'CHILD' | 'INFANT'
  title: string
  firstName: string
  lastName: string
  email: string   // lead participant only
  phone: string   // lead participant only
}

export interface TourPackage {
  raynaPackageId: string
  name: string
  duration: string
  type: string
  highlights: string[]
  includes: string[]   // e.g. "Transport", "Guide", "Entry Tickets"
  image: string
  priceAdult: number   // USD per adult
  priceChild: number   // USD per child
  priceInfant: number  // USD per infant (often 0)
  availableSpots: number
  cancellationPolicy: string
  departureTime: string
  meetingPoint: string
}

export interface TourBookingState {
  // Tour context (set from search result)
  tour: any | null
  searchParams: {
    city: string
    country: string
    date: string
    adults: number
    children: number
    infants: number
  }

  // Selected package (from Step 1)
  selectedPackage: TourPackage | null
  packagesLoading: boolean
  packagesError: string
  availablePackages: TourPackage[]

  // Participant counts (set on Step 1, can adjust)
  adults: number
  children: number
  infants: number

  // Participant details (Step 2)
  participants: Participant[]
  contactEmail: string
  contactPhone: string

  // Auth
  isLoggedIn: boolean
  accountName: string

  // Pricing
  ngnRate: number
  taxRate: number

  // Invoice
  invoiceNumber: string
  invoiceDate: string

  // Booking result
  bookingReference: string
  voucherUrl: string
  status: 'idle' | 'loading' | 'confirmed' | 'error'
  errorMessage: string
}

const NGN_RATE = 1650
const TAX_RATE = 0.075

const state = reactive<TourBookingState>({
  tour: null,
  searchParams: { city: '', country: '', date: '', adults: 1, children: 0, infants: 0 },
  selectedPackage: null,
  packagesLoading: false,
  packagesError: '',
  availablePackages: [],
  adults: 1,
  children: 0,
  infants: 0,
  participants: [],
  contactEmail: '',
  contactPhone: '',
  isLoggedIn: false,
  accountName: '',
  ngnRate: NGN_RATE,
  taxRate: TAX_RATE,
  invoiceNumber: '',
  invoiceDate: '',
  bookingReference: '',
  voucherUrl: '',
  status: 'idle',
  errorMessage: '',
})

// ── Computed pricing ──────────────────────────────────────────────────────────
const priceBreakdown = computed(() => {
  const pkg = state.selectedPackage
  if (!pkg) return { adultTotal: 0, childTotal: 0, infantTotal: 0, subtotalUsd: 0, subtotalNgn: 0, tax: 0, total: 0 }

  const adultTotal  = pkg.priceAdult  * state.adults   * state.ngnRate
  const childTotal  = pkg.priceChild  * state.children  * state.ngnRate
  const infantTotal = pkg.priceInfant * state.infants   * state.ngnRate
  const subtotalNgn = Math.round(adultTotal + childTotal + infantTotal)
  const tax         = Math.round(subtotalNgn * state.taxRate)
  const total       = subtotalNgn + tax

  return {
    adultTotal:  Math.round(adultTotal),
    childTotal:  Math.round(childTotal),
    infantTotal: Math.round(infantTotal),
    subtotalUsd: (pkg.priceAdult * state.adults) + (pkg.priceChild * state.children) + (pkg.priceInfant * state.infants),
    subtotalNgn,
    tax,
    total,
  }
})

const totalParticipants = computed(() => state.adults + state.children + state.infants)

const fmtNgn = (amount: number) => `₦${Math.round(amount).toLocaleString('en-NG')}`

// ── Actions ───────────────────────────────────────────────────────────────────
function setTour(tour: any, searchParams: any) {
  state.tour         = tour
  state.searchParams = { ...searchParams }
  state.adults       = searchParams.adults   || 1
  state.children     = searchParams.children || 0
  state.infants      = searchParams.infants  || 0
  state.selectedPackage  = null
  state.availablePackages = []
  state.status       = 'idle'
}

// Replace with real Rayna Tours API:
// GET https://api.raynatours.com/tours/packages
// Params: { tourId, date, adults, children, infants, currency }
// Returns array of package options with pricing per pax type
async function fetchPackages() {
  state.packagesLoading = true
  state.packagesError   = ''

  await new Promise(r => setTimeout(r, 1300))

  const policies = [
    'Free cancellation up to 24h before departure',
    'Non-refundable',
    'Free cancellation up to 48h before departure',
  ]
  const includes = [
    ['Hotel Pickup & Drop-off', 'Professional Guide', 'Entry Tickets'],
    ['Hotel Pickup & Drop-off', 'Professional Guide', 'Lunch Included'],
    ['Professional Guide', 'Entry Tickets', 'Bottled Water'],
    ['Hotel Pickup & Drop-off', 'Professional Guide', 'Entry Tickets', 'Lunch Included'],
  ]
  const times = ['07:00 AM', '09:00 AM', '10:00 AM', '02:00 PM']

  state.availablePackages = Array.from({ length: 5 }, (_, i) => ({
    raynaPackageId:     `RT-${Math.random().toString(36).slice(2,8).toUpperCase()}`,
    name:               ['Standard', 'Premium', 'VIP', 'Shared Group', 'Private'][i] + ' Package',
    duration:           ['Half Day (4h)', 'Full Day (8h)', 'Half Day (5h)', 'Full Day (9h)', '2 Days'][i],
    type:               state.tour?.type || 'City Tour',
    highlights:         state.tour?.highlights || [],
    includes:           includes[i % includes.length],
    image:              state.tour?.image || '',
    priceAdult:         60 + i * 25,
    priceChild:         35 + i * 12,
    priceInfant:        i < 2 ? 0 : 10,
    availableSpots:     15 - i * 2,
    cancellationPolicy: policies[i % policies.length],
    departureTime:      times[i % times.length],
    meetingPoint:       `${state.searchParams.city} City Centre Hotel Lobby`,
  }))

  state.packagesLoading = false
}

function selectPackage(pkg: TourPackage) {
  state.selectedPackage = pkg
  seedParticipants()
}

function updateCounts(adults: number, children: number, infants: number) {
  state.adults   = adults
  state.children = children
  state.infants  = infants
  seedParticipants()
}

function seedParticipants() {
  // One lead participant form (primary booker); rest tracked by count only
  state.participants = [{
    type:      'ADULT',
    title:     state.participants[0]?.title     || '',
    firstName: state.participants[0]?.firstName || '',
    lastName:  state.participants[0]?.lastName  || '',
    email:     state.participants[0]?.email     || state.contactEmail,
    phone:     state.participants[0]?.phone     || state.contactPhone,
  }]
}

function generateInvoice() {
  state.invoiceNumber = `TUR-${Date.now().toString(36).toUpperCase()}`
  state.invoiceDate   = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

// Replace with real Rayna booking API:
// POST https://api.raynatours.com/bookings
// Body: { packageId, date, adults, children, infants, leadGuest, paymentReference }
// Response: { bookingReference, voucherUrl }
async function confirmBooking(): Promise<boolean> {
  state.status = 'loading'
  await new Promise(r => setTimeout(r, 2000))
  state.bookingReference = `TUR${Math.random().toString(36).slice(2,8).toUpperCase()}`
  state.voucherUrl = '#'
  state.status = 'confirmed'
  generateInvoice()
  return true
}

function reset() {
  Object.assign(state, {
    tour: null, selectedPackage: null, availablePackages: [],
    participants: [], contactEmail: '', contactPhone: '',
    isLoggedIn: false, accountName: '',
    invoiceNumber: '', invoiceDate: '',
    bookingReference: '', voucherUrl: '',
    status: 'idle', errorMessage: '',
  })
}

export function useTourBookingStore() {
  return {
    state, priceBreakdown, totalParticipants, fmtNgn,
    setTour, fetchPackages, selectPackage, updateCounts,
    generateInvoice, confirmBooking, reset,
  }
}
