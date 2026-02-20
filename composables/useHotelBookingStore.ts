import { reactive, computed } from 'vue'

export interface GuestDetail {
  title: string
  firstName: string
  lastName: string
  email: string   // primary guest only
  phone: string   // primary guest only
}

export interface SelectedRoom {
  rezliveRoomId: string
  roomName: string
  boardType: string      // e.g. "Bed & Breakfast", "Room Only"
  pricePerNight: number  // USD
  totalPrice: number     // USD (pre-computed by Rezlive for the stay duration)
  cancellationPolicy: string
  amenities: string[]
}

export interface HotelBookingState {
  // Hotel context (set from search result)
  hotel: any | null
  searchParams: {
    city: string
    checkInStart: string
    checkInEnd: string
    rooms: { adults: number; children: number; infants: number }[]
    totalGuests: number
    totalRooms: number
    nationality: string
  }
  // Rezlive room options (fetched per hotel)
  availableRooms: SelectedRoom[]
  roomsLoading: boolean
  roomsError: string

  // Selected room combination (one per requested room)
  selectedRoom: SelectedRoom | null

  // Guest details
  guests: GuestDetail[]
  contactEmail: string
  contactPhone: string

  // Auth / discount
  isLoggedIn: boolean
  accountName: string

  // Pricing (NGN)
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

const state = reactive<HotelBookingState>({
  hotel: null,
  searchParams: {
    city: '', checkInStart: '', checkInEnd: '',
    rooms: [], totalGuests: 1, totalRooms: 1, nationality: '',
  },
  availableRooms: [],
  roomsLoading: false,
  roomsError: '',
  selectedRoom: null,
  guests: [],
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
const nights = computed(() => {
  const { checkInStart, checkInEnd } = state.searchParams
  if (!checkInStart || !checkInEnd) return 1
  const diff = Math.ceil(
    (new Date(checkInEnd).getTime() - new Date(checkInStart).getTime()) / 86400000
  )
  return diff > 0 ? diff : 1
})

const priceBreakdown = computed(() => {
  const base     = (state.selectedRoom?.totalPrice ?? 0) * state.searchParams.totalRooms
  const baseNgn  = Math.round(base * state.ngnRate)
  const tax      = Math.round(baseNgn * state.taxRate)
  const total    = baseNgn + tax
  return { baseUsd: base, baseNgn, tax, total }
})

const fmtNgn = (amount: number) =>
  `₦${Math.round(amount).toLocaleString('en-NG')}`

// ── Actions ───────────────────────────────────────────────────────────────────
function setHotel(hotel: any, searchParams: any) {
  state.hotel        = hotel
  state.searchParams = { ...searchParams }
  state.selectedRoom = null
  state.availableRooms = []
  state.status       = 'idle'
}

// Replace with real Rezlive availability API call:
// POST https://api.rezlive.com/hotel/availability
// Headers: { Authorization: 'Bearer <token>' }
// Body: { hotelId, checkIn, checkOut, rooms, nationality }
async function fetchRooms() {
  state.roomsLoading = true
  state.roomsError   = ''

  await new Promise(r => setTimeout(r, 1400))

  const mockBoards = ['Room Only', 'Bed & Breakfast', 'Half Board', 'Full Board']
  const mockPolicies = [
    'Free cancellation until 24h before check-in',
    'Non-refundable',
    'Free cancellation until 48h before check-in',
  ]

  state.availableRooms = Array.from({ length: 6 }, (_, i) => ({
    rezliveRoomId: `RZ-${Math.random().toString(36).slice(2,8).toUpperCase()}`,
    roomName: ['Standard Room', 'Deluxe Room', 'Superior Suite', 'Executive Suite', 'Junior Suite', 'Presidential Suite'][i] ?? 'Standard Room',
    boardType: mockBoards[i % mockBoards.length],
    pricePerNight: 80 + i * 35,
    totalPrice: (80 + i * 35) * nights.value,
    cancellationPolicy: mockPolicies[i % mockPolicies.length],
    amenities: ['Free WiFi', 'Air conditioning', 'Flat-screen TV', 'Mini bar', 'City view', 'King bed'].slice(0, 3 + (i % 3)),
  }))

  state.roomsLoading = false
}

function selectRoom(room: SelectedRoom) {
  state.selectedRoom = room
  // Seed guest slots — one lead guest per room
  state.guests = Array.from({ length: state.searchParams.totalRooms }, (_, i) => ({
    title:     '',
    firstName: '',
    lastName:  '',
    email:     i === 0 ? state.contactEmail : '',
    phone:     i === 0 ? state.contactPhone : '',
  }))
}

function generateInvoice() {
  state.invoiceNumber = `HTL-${Date.now().toString(36).toUpperCase()}`
  state.invoiceDate   = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

// Replace with real Rezlive booking API:
// POST https://api.rezlive.com/hotel/book
// Body: { rezliveRoomId, guests, contactEmail, checkIn, checkOut, paymentReference }
async function confirmBooking(): Promise<boolean> {
  state.status = 'loading'
  await new Promise(r => setTimeout(r, 2000))
  state.bookingReference = `HTL${Math.random().toString(36).slice(2,8).toUpperCase()}`
  state.voucherUrl       = '#' // real: URL to PDF voucher from Rezlive response
  state.status           = 'confirmed'
  generateInvoice()
  return true
}

function reset() {

  Object.assign(state, {
    hotel: null, selectedRoom: null, availableRooms: [],
    guests: [], contactEmail: '', contactPhone: '',
    isLoggedIn: false, accountName: '',
    invoiceNumber: '', invoiceDate: '',
    bookingReference: '', voucherUrl: '',
    status: 'idle', errorMessage: '',
  })
}

export function useHotelBookingStore() {
  return {
    state, nights, priceBreakdown, fmtNgn,
    setHotel, fetchRooms, selectRoom,
    generateInvoice, confirmBooking, reset,
  }
}