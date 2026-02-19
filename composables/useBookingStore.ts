/**
 * useBookingStore — shared booking state across all steps.
 * Lives outside components so it survives route changes within the booking flow.
 */
import { reactive, computed } from 'vue'

/** Minimal type for an Amadeus-style flight offer */
export interface FlightOfferSegment {
  carrierCode: string
  number?: string
  departure: { iataCode: string; at: string }
  arrival:   { iataCode: string; at: string }
}

export interface FlightOfferItinerary {
  duration: string
  segments: FlightOfferSegment[]
}

export interface FlightOffer {
  price: {
    total: string
    currency?: string
  }
  itineraries: FlightOfferItinerary[]
  travelerPricings?: {
    fareDetailsBySegment?: {
      cabin?: string
    }[]
  }[]
  [key: string]: unknown   // allow extra Amadeus fields
}

export interface Passenger {
  type: 'ADULT' | 'CHILD' | 'INFANT'
  title: string
  firstName: string
  lastName: string
  dateOfBirth: string
  nationality: string
  passportNumber: string
  passportExpiry: string
  email: string      // primary passenger only
  phone: string      // primary passenger only
}

export interface BookingState {
  // Selected flight offer (Amadeus FlightOffer shape)
  offer: any | null
  // Parsed meta
  passengerCount: number
  cabinClass: string
  // Step data
  passengers: Passenger[]
  contactEmail: string
  contactPhone: string
  // Auth / discount
  isLoggedIn: boolean
  isB2B: boolean
  discountRate: number          // e.g. 0.10 = 10%
  discountCode: string
  // Pricing
  basePrice: number             // USD
  taxAmount: number
  discountAmount: number
  totalPrice: number
  currency: string
  ngnRate: number               // USD → NGN conversion rate
  // Invoice
  invoiceNumber: string
  invoiceDate: string
  // Booking result
  bookingReference: string
  ticketNumbers: string[]
  status: 'idle' | 'loading' | 'confirmed' | 'error'
  errorMessage: string
}

const NGN_RATE = 1650

const state = reactive<BookingState>({
  offer: null,
  passengerCount: 1,
  cabinClass: 'ECONOMY',
  passengers: [],
  contactEmail: '',
  contactPhone: '',
  isLoggedIn: false,
  isB2B: false,
  discountRate: 0,
  discountCode: '',
  basePrice: 0,
  taxAmount: 0,
  discountAmount: 0,
  totalPrice: 0,
  currency: 'USD',
  ngnRate: NGN_RATE,
  invoiceNumber: '',
  invoiceDate: '',
  bookingReference: '',
  ticketNumbers: [],
  status: 'idle',
  errorMessage: '',
})

// ── Computed pricing ──────────────────────────────────────────────────────────
const priceBreakdown = computed(() => {
  const base     = state.basePrice * state.passengerCount
  const tax      = Math.round(base * 0.075)                 // 7.5% VAT
  const discount = Math.round(base * state.discountRate)
  const total    = base + tax - discount
  return { base, tax, discount, total }
})

const fmtNgn = (usd: number) =>
  `₦${Math.round(usd * state.ngnRate).toLocaleString('en-NG')}`

// ── Actions ───────────────────────────────────────────────────────────────────
function selectOffer(offer: any, passengerCount = 1) {
  state.offer = offer
  state.passengerCount = passengerCount
  state.basePrice = Number.parseFloat(offer.price.total)
  state.cabinClass = offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin ?? 'ECONOMY'
  state.currency = offer.price.currency ?? 'USD'

  // Seed empty passenger slots
  state.passengers = Array.from({ length: passengerCount }, (_, i) => ({
    type: 'ADULT',
    title: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    nationality: '',
    passportNumber: '',
    passportExpiry: '',
    email: i === 0 ? state.contactEmail : '',
    phone: i === 0 ? state.contactPhone : '',
  }))

  _recalcPricing()
}

function applyB2BDiscount(rate: number, code: string) {
  state.isB2B        = true
  state.discountRate = rate
  state.discountCode = code
  _recalcPricing()
}

function clearDiscount() {
  state.isB2B        = false
  state.discountRate = 0
  state.discountCode = ''
  _recalcPricing()
}

function _recalcPricing() {
  const p            = priceBreakdown.value
  state.taxAmount    = p.tax
  state.discountAmount = p.discount
  state.totalPrice   = p.total
}

function generateInvoice() {
  state.invoiceNumber = `INV-${Date.now().toString(36).toUpperCase()}`
  state.invoiceDate   = new Date().toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

function reset() {
  Object.assign(state, {
    offer: null, passengerCount: 1, passengers: [],
    contactEmail: '', contactPhone: '',
    isB2B: false, discountRate: 0, discountCode: '',
    basePrice: 0, taxAmount: 0, discountAmount: 0, totalPrice: 0,
    invoiceNumber: '', invoiceDate: '',
    bookingReference: '', ticketNumbers: [],
    status: 'idle', errorMessage: '',
  })
}

// ── Mock Amadeus API calls ─────────────────────────────────────────────────────
async function confirmBooking(): Promise<boolean> {
  state.status = 'loading'
  await new Promise(r => setTimeout(r, 2200))

  // Replace with real Amadeus flight-orders API call:
  // POST /v1/booking/flight-orders
  // Body: { data: { type: 'flight-order', flightOffers: [state.offer], travelers: [...] } }

  state.bookingReference = `BK${Math.random().toString(36).slice(2,8).toUpperCase()}`
  state.ticketNumbers    = state.passengers.map((_, i) =>
    `TK${Math.random().toString(36).slice(2,10).toUpperCase()}${i}`
  )
  state.status = 'confirmed'
  generateInvoice()
  return true
}

export function useBookingStore() {
  return {
    state,
    priceBreakdown,
    fmtNgn,
    selectOffer,
    applyB2BDiscount,
    clearDiscount,
    generateInvoice,
    confirmBooking,
    reset,
  }
}