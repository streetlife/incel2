import { reactive, computed, watch } from 'vue'
import { useTourService } from '../services/tour.service'
import { useCurrency } from './useCurrency'
import type { TourBookingRecordPayload, TourBookingTraveller, TourProcessPayload } from '../types/tour'

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
  tourOptionId: number
  transferId: number
  transferName: string
  name: string
  duration: string
  type: string
  highlights: string[]
  includes: string[]
  image: string
  priceAdult: number       // in AED
  priceChild: number       // in AED
  priceInfant: number      // in AED
  finalAmount: number      // total AED for default pax (may be discounted)
  withoutDiscountAmount: number  // total AED before any discount
  availableSpots: number
  cancellationPolicy: string
  departureTime: string
  meetingPoint: string
  disableChild: boolean
  disableInfant: boolean
  minimumPax: number
  startTime: string
}

export interface TourBookingState {
  // Tour context (set from search result)
  tour: any
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
  /** AED → NGN conversion rate */
  ngnRate: number
  taxRate: number

  // Invoice
  invoiceNumber: string
  invoiceDate: string

  // Booking
  bookingCode: string
  bookingRecords: any[]
  bookingReference: string
  voucherUrl: string
  status: 'idle' | 'loading' | 'confirmed' | 'error'
  errorMessage: string
}

/** AED → NGN approximate rate (updated by useCurrency watcher) */
const AED_TO_NGN = 100
const TAX_RATE   = 0.075

const _currency = useCurrency()

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
  ngnRate: AED_TO_NGN,
  taxRate: TAX_RATE,
  invoiceNumber: '',
  invoiceDate: '',
  bookingCode: '',
  bookingRecords: [],
  bookingReference: '',
  voucherUrl: '',
  status: 'idle',
  errorMessage: '',
})

// Keep ngnRate in sync with live exchange rates (must be after state is declared)
watch(_currency.rates, () => {
  const rate = _currency.convert(1, 'AED')
  if (rate > 0) state.ngnRate = Math.round(rate)
}, { immediate: true })

// ── Computed pricing ──────────────────────────────────────────────────────────
const priceBreakdown = computed(() => {
  const pkg = state.selectedPackage
  if (!pkg) return {
    adultTotalAed: 0, childTotalAed: 0, infantTotalAed: 0,
    subtotalAed: 0, taxAed: 0, totalAed: 0,
    adultTotal: 0, childTotal: 0, infantTotal: 0, subtotalNgn: 0, tax: 0, total: 0,
  }

  // AED-based (source of truth)
  const adultTotalAed = pkg.priceAdult * state.adults
  const childTotalAed = pkg.priceChild * state.children
  const infantTotalAed = pkg.priceInfant * state.infants
  const subtotalAed = adultTotalAed + childTotalAed + infantTotalAed
  const taxAed = subtotalAed * state.taxRate
  const totalAed = subtotalAed + taxAed

  // Legacy: converted to selected currency via ngnRate (kept for TourBookingConfirmation etc.)
  const adultTotal = Math.round(adultTotalAed)
  const childTotal = Math.round(childTotalAed)
  const infantTotal = Math.round(infantTotalAed)
  const subtotalNgn = adultTotal + childTotal + infantTotal
  const tax = Math.round(subtotalNgn * state.taxRate)
  const total = subtotalNgn + tax

  return {
    adultTotalAed, childTotalAed, infantTotalAed, subtotalAed, taxAed, totalAed,
    adultTotal, childTotal, infantTotal, subtotalNgn, tax, total,
  }
})

const totalParticipants = computed(() => state.adults + state.children + state.infants)

const fmtNgn = (amount: number) => `₦${Math.round(amount).toLocaleString('en-NG')}`
const fmtAed = (amount: number) => `AED ${Number(amount).toFixed(2)}`

// ── Module-level actions (no API needed) ─────────────────────────────────────

function setTour(tour: any, searchParams: any) {
  state.tour = tour
  state.searchParams = { ...searchParams }
  state.adults = searchParams.adults   || 1
  state.children = searchParams.children || 0
  state.infants = searchParams.infants  || 0
  state.selectedPackage = null
  state.availablePackages = []
  state.packagesError = ''
  state.status = 'idle'
}

function setBookingCode(code: string) {
  state.bookingCode = code
}

// ── Mock fallback packages (used when pricing API fails or has no tour ID) ────

async function fetchMockPackages() {
  await new Promise(r => setTimeout(r, 800))
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
  state.availablePackages = Array.from({ length: 3 }, (_, i) => ({
    raynaPackageId: `MOCK-${i + 1}`,
    tourOptionId: i + 1,
    transferId: i + 100,
    transferName: ['Without Transfers', 'Shared Transfer', 'Private Transfer'][i],
    name: ['Without Transfers', 'Shared Transfer', 'Private Transfer'][i],
    duration: state.tour?.duration || 'Full Day (8h)',
    type: state.tour?.type || 'Tour',
    highlights: [],
    includes: includes[i % includes.length],
    image: state.tour?.image || '',
    priceAdult: 30 + i * 20,
    priceChild: 20 + i * 10,
    priceInfant: 0,
    finalAmount: 0,
    withoutDiscountAmount: 0,
    availableSpots: 20,
    cancellationPolicy: policies[i % policies.length],
    departureTime: ['09:00 AM', '10:00 AM', '02:00 PM'][i],
    meetingPoint: state.tour?.reportingTime || `${state.searchParams.city} City Centre`,
    disableChild: false,
    disableInfant: true,
    minimumPax: 1,
    startTime: ['09:00:00', '10:00:00', '14:00:00'][i],
  }))
  // Auto-select first mock option
  if (state.availablePackages[0]) selectPackage(state.availablePackages[0])
}

function selectPackage(pkg: TourPackage) {
  state.selectedPackage = pkg
  // Enforce disable flags from pricing
  if (pkg.disableChild) state.children = 0
  if (pkg.disableInfant) state.infants  = 0
  seedParticipants()
}

function updateCounts(adults: number, children: number, infants: number) {
  state.adults = adults
  state.children = children
  state.infants = infants
  seedParticipants()
}

function seedParticipants() {
  // One lead participant form (primary booker); rest tracked by count only
  state.participants = [{
    type: 'ADULT',
    title: state.participants[0]?.title || '',
    firstName: state.participants[0]?.firstName || '',
    lastName: state.participants[0]?.lastName  || '',
    email: state.participants[0]?.email || state.contactEmail,
    phone: state.participants[0]?.phone || state.contactPhone,
  }]
}

function generateInvoice() {
  state.invoiceNumber = `TUR-${Date.now().toString(36).toUpperCase()}`
  state.invoiceDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function reset() {
  Object.assign(state, {
    tour: null, selectedPackage: null, availablePackages: [],
    participants: [], contactEmail: '', contactPhone: '',
    isLoggedIn: false, accountName: '',
    invoiceNumber: '', invoiceDate: '',
    bookingCode: '', bookingRecords: [], bookingReference: '', voucherUrl: '',
    status: 'idle', errorMessage: '',
    packagesError: '', packagesLoading: false,
  })
}

// ── Session-storage persistence (survives payment gateway redirect) ──────────

const BOOKING_SESSION_KEY = 'incel_tour_booking_state'

function saveStateToSession() {
  try {
    const snapshot = {
      tour: state.tour,
      searchParams: { ...state.searchParams },
      selectedPackage: state.selectedPackage ? { ...state.selectedPackage } : null,
      adults: state.adults,
      children: state.children,
      infants: state.infants,
      participants: state.participants.map(p => ({ ...p })),
      contactEmail: state.contactEmail,
      contactPhone: state.contactPhone,
      ngnRate: state.ngnRate,
      invoiceNumber: state.invoiceNumber,
      invoiceDate: state.invoiceDate,
      bookingCode: state.bookingCode,
      bookingReference: state.bookingReference,
    }
    sessionStorage.setItem(BOOKING_SESSION_KEY, JSON.stringify(snapshot))
  } catch { /* ignore storage errors */ }
}

function restoreStateFromSession(): boolean {
  try {
    const raw = sessionStorage.getItem(BOOKING_SESSION_KEY)
    if (!raw) return false
    const snapshot = JSON.parse(raw)
    Object.assign(state, snapshot)
    sessionStorage.removeItem(BOOKING_SESSION_KEY)
    return true
  } catch {
    return false
  }
}

// ── Exported store factory ────────────────────────────────────────────────────

export function useTourBookingStore() {
  const service = useTourService()

  /**
   * Create booking record via bookings/tour after a package is selected.
   * Called once per traveller type (adult / child / infant).
   */
  async function createBookingRecords() {
    const pkg  = state.selectedPackage
    const tour = state.tour
    if (!pkg || !tour) return

    const makeCode = () => `TRV${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`

    const fmtSlotName = (raw: string) => {
      if (!raw) return 'Standard Slot'
      const [h, m] = raw.split(':').map(Number)
      if (Number.isNaN(h)) return raw
      const ampm = h >= 12 ? 'PM' : 'AM'
      const hour = h % 12 || 12
      return `${hour}:${String(m).padStart(2, '0')} ${ampm}`
    }

    const base = {
      travel_date: state.searchParams.date,
      currency_code: 'AED',
      status: 'confirmed' as const,
      transfer_id: pkg.transferId,
      transfer_option: String(pkg.tourOptionId),
      transfer_name: pkg.transferName,
      contract_id: tour.contractId  ?? 0,
      tour_option_id: pkg.tourOptionId,
      time_slot_id: 1,
      time_slot_name: fmtSlotName(pkg.startTime),
      tour_id: tour.id,
    }

    const records: TourBookingRecordPayload[] = []
    if (state.adults > 0) {
      records.push({ ...base, traveller_code: makeCode(), traveller_type: 'adult', amount: pkg.priceAdult, amount_display: pkg.priceAdult })
    }
    if (state.children > 0 && !pkg.disableChild) {
      records.push({ ...base, traveller_code: makeCode(), traveller_type: 'child', amount: pkg.priceChild, amount_display: pkg.priceChild })
    }
    if (state.infants > 0 && !pkg.disableInfant) {
      records.push({ ...base, traveller_code: makeCode(), traveller_type: 'infant', amount: pkg.priceInfant, amount_display: pkg.priceInfant })
    }

    const results = await Promise.allSettled(records.map(r => service.createBookingRecord(r)))
    state.bookingRecords = results.flatMap(r => r.status === 'fulfilled' ? [r.value] : [])
  }

  /** Fetches real pricing from tours/pricing; falls back to mock on failure */
  async function fetchPackages() {
    state.packagesLoading = true
    state.packagesError   = ''

    const tourId = state.tour?.id
    const contractId = state.tour?.contractId ?? 0
    const travelDate = state.searchParams.date

    if (!tourId || !travelDate) {
      await fetchMockPackages()
      state.packagesLoading = false
      return
    }

    try {
      const res = await service.getTourPricing({
        tour_id: tourId,
        contract_id: contractId,
        travel_date: travelDate,
      })

      const results = res.data?.result ?? []

      if (!results.length) {
        // No pricing returned — use mock so user can still navigate
        await fetchMockPackages()
        state.packagesLoading = false
        return
      }

      state.availablePackages = results.map(p => ({
        raynaPackageId: String(p.tourOptionId),
        tourOptionId: p.tourOptionId,
        transferId: p.transferId,
        transferName: p.transferName,
        name: p.transferName || 'Tour Package',
        duration: state.tour?.duration || '',
        type: state.tour?.type || 'Tour',
        highlights: [],
        includes: [],
        image: state.tour?.image || '',
        priceAdult: p.adultPrice,
        priceChild: p.disableChild  ? 0 : p.childPrice,
        priceInfant: p.disableInfant ? 0 : p.infantPrice,
        finalAmount: p.finalAmount ?? 0,
        withoutDiscountAmount: p.withoutDiscountAmount ?? 0,
        availableSpots: 999,
        cancellationPolicy: state.tour?.cancellationPolicyName || 'See tour terms',
        departureTime: p.startTime || '10:00:00',
        meetingPoint: state.tour?.reportingTime || state.searchParams.city,
        disableChild: p.disableChild,
        disableInfant: p.disableInfant,
        minimumPax: p.minimumPax || 1,
        startTime: p.startTime,
      }))

      // Auto-select the default transfer, or fall back to the first option
      const defaultIdx = results.findIndex(p => p.isDefaultTransfer === 1)
      const autoSelect = state.availablePackages[Math.max(defaultIdx, 0)]
      if (autoSelect) selectPackage(autoSelect)
    } catch (e: any) {
      state.packagesError = e?.userMessage ?? 'Failed to load pricing. Please try again.'
      // Fall back to mock so the flow is not blocked
      await fetchMockPackages()
    } finally {
      state.packagesLoading = false
    }
  }

  /**
   * Calls tours/process after payment is verified.
   * @param bookingCode - code from payment initialization
   */
  async function processTourBooking(bookingCode: string) {
    const lead = state.participants[0]
    const pkg = state.selectedPackage
    const travelDate = state.searchParams.date

    if (!pkg || !state.tour || !lead) {
      throw new Error('Missing booking data — please restart the booking flow.')
    }

    const buildDetail = () =>
      `BT${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`

    const bookingTours: TourBookingTraveller[] = []

    for (let i = 0; i < state.adults; i++) {
      bookingTours.push({
        tour_id: state.tour.id,
        tour_option_id: pkg.tourOptionId,
        travel_date: travelDate,
        time_slot_id: 1,
        transfer_id: pkg.transferId,
        traveller_type: 'ADULT',
        amount: pkg.priceAdult,
        firstname: lead.firstName,
        surname: lead.lastName,
        emailaddress: state.contactEmail,
        phone_number: state.contactPhone,
        passport_nationality: 'NG',
        booking_detail_code: buildDetail(),
      })
    }

    for (let i = 0; i < state.children; i++) {
      bookingTours.push({
        tour_id: state.tour.id,
        tour_option_id: pkg.tourOptionId,
        travel_date: travelDate,
        time_slot_id: 1,
        transfer_id: pkg.transferId,
        traveller_type: 'CHILD',
        amount: pkg.priceChild,
        firstname: lead.firstName,
        surname: lead.lastName,
        emailaddress: state.contactEmail,
        phone_number: state.contactPhone,
        passport_nationality: 'NG',
        booking_detail_code: buildDetail(),
      })
    }

    for (let i = 0; i < state.infants; i++) {
      bookingTours.push({
        tour_id: state.tour.id,
        tour_option_id: pkg.tourOptionId,
        travel_date: travelDate,
        time_slot_id: 1,
        transfer_id: pkg.transferId,
        traveller_type: 'INFANT',
        amount: pkg.priceInfant,
        firstname: lead.firstName,
        surname: lead.lastName,
        emailaddress: state.contactEmail,
        phone_number: state.contactPhone,
        passport_nationality: 'NG',
        booking_detail_code: buildDetail(),
      })
    }

    const payload: TourProcessPayload = {
      booking_code: bookingCode,
      booking_tours: bookingTours,
    }

    const res = await service.processTourBooking(payload)

    if (res.data?.booking_reference) state.bookingReference = res.data.booking_reference
    if (res.data?.voucher_url) state.voucherUrl = res.data.voucher_url

    state.status = 'confirmed'
    generateInvoice()

    return res
  }

  return {
    state,
    priceBreakdown,
    totalParticipants,
    fmtNgn,
    fmtAed,
    setTour,
    setBookingCode,
    fetchPackages,
    selectPackage,
    updateCounts,
    generateInvoice,
    createBookingRecords,
    processTourBooking,
    saveStateToSession,
    restoreStateFromSession,
    reset,
  }
}
