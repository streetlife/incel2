import { reactive, computed } from 'vue'
import { useHotelService } from '../services/hotel.service'

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
  boardType: string
  pricePerNight: number  // USD
  totalPrice: number     // USD (pre-computed by Rezlive for the stay duration)
  cancellationPolicy: string
  amenities: string[]
}

export interface HotelBookingState {
  hotel: any | null
  searchParams: {
    country: string
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
    country: '',
    city: '',
    checkInStart: '',
    checkInEnd: '',
    rooms: [],
    totalGuests: 1,
    totalRooms: 1,
    nationality: '',
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

const nights = computed(() => {
  const { checkInStart, checkInEnd } = state.searchParams
  if (!checkInStart || !checkInEnd) return 1
  const diff = Math.ceil(
    (new Date(checkInEnd).getTime() - new Date(checkInStart).getTime()) / 86400000
  )
  return diff > 0 ? diff : 1
})

const priceBreakdown = computed(() => {
  const base = (state.selectedRoom?.totalPrice ?? 0) * state.searchParams.totalRooms
  const baseNgn = Math.round(base)
  const tax = Math.round(baseNgn * state.taxRate)
  const total = baseNgn + tax
  return { baseUsd: base, baseNgn, tax, total }
})

function setHotel(hotel: any, searchParams: any) {
  state.hotel = hotel
  state.searchParams = { ...searchParams }
  state.selectedRoom = null
  state.availableRooms = []
  state.status = 'idle'
}

async function fetchRooms(sessionCode: string, hotelId: string) {
  const { getHotelById } = useHotelService()

  state.roomsLoading = true
  state.roomsError = ''

  try {
    const res = await getHotelById(sessionCode, hotelId)
    const data = res
    const rooms = data?.rooms || []

    state.availableRooms = rooms.map((room: any) => {
      const rates = room.TotalRate.split('|').map(Number)
      const totalPrice = rates.reduce((sum: number, r: number) => sum + r, 0)

      return {
        rezliveRoomId: room.BookingKey,
        roomName: room.Type.split('|')[0],

        boardType: extractBoardType(room.RoomDescription),

        pricePerNight: totalPrice / nights.value,
        totalPrice,

        cancellationPolicy:
          room.CancellationPolicy?.Refundable === 'No'
            ? 'Non-refundable'
            : `Free cancellation until ${room.CancellationPolicy?.TillDate ?? ''}`,

        amenities: extractAmenities(room.RoomDescription),
      }
    })
  } catch (e: any) {
    state.roomsError = e?.message || 'Failed to load rooms'
  } finally {
    state.roomsLoading = false
  }
}

function extractBoardType(desc: string): string {
  if (!desc) return 'Room Only'

  if (desc.toLowerCase().includes('breakfast')) return 'Bed & Breakfast'
  if (desc.toLowerCase().includes('half')) return 'Half Board'
  if (desc.toLowerCase().includes('full')) return 'Full Board'

  return 'Room Only'
}

function extractAmenities(desc: string): string[] {
  if (!desc) return []

  return desc
    .split('-')
    .slice(1)
    .join('-')
    .split(',')
    .map((a: string) => a.trim())
    .filter(Boolean)
}

function selectRoom(room: SelectedRoom) {
  state.selectedRoom = room
  state.guests = Array.from({ length: state.searchParams.totalRooms }, (_, i) => ({
    title: '',
    firstName: '',
    lastName: '',
    email: i === 0 ? state.contactEmail : '',
    phone: i === 0 ? state.contactPhone : '',
  }))
}

function generateInvoice() {
  state.invoiceNumber = `HTL-${Date.now().toString(36).toUpperCase()}`
  state.invoiceDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

async function confirmBooking(): Promise<boolean> {
  state.status = 'loading'
  await new Promise(r => setTimeout(r, 2000))
  state.bookingReference = `HTL${Math.random().toString(36).slice(2, 8).toUpperCase()}`
  state.voucherUrl = '#' // real: URL to PDF voucher from Rezlive response
  state.status = 'confirmed'
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
    state, nights, priceBreakdown,
    setHotel, fetchRooms, selectRoom,
    generateInvoice, confirmBooking, reset,
  }
}