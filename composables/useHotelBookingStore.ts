import { reactive, computed } from 'vue'
import { useHotelService } from '../services/hotel.service'
import type { RoomConfig } from '../types/hotel'

export interface GuestDetail {
  type: 'adult' | 'child'
  age?: number       // populated for children from childAges
  title: string
  firstName: string
  lastName: string
  email: string      // primary guest only (first adult)
  phone: string      // primary guest only (first adult)
}

export interface SelectedRoom {
  rezliveRoomId: string
  roomName: string
  boardType: string
  pricePerNight: number
  totalPrice: number
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
    rooms: RoomConfig[]
    totalGuests: number
    totalRooms: number
    nationality: string
    currency?: string
  }
  availableRooms: SelectedRoom[]
  roomsLoading: boolean
  roomsError: string
  selectedRoom: SelectedRoom | null
  guests: GuestDetail[]
  contactEmail: string
  contactPhone: string
  isLoggedIn: boolean
  accountName: string
  ngnRate: number
  taxRate: number
  invoiceNumber: string
  invoiceDate: string
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
    currency: 'USD',
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
    (new Date(checkInEnd).getTime() - new Date(checkInStart).getTime()) / 86_400_000,
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

// ── Guest list helpers ────────────────────────────────────────────────────────

/**
 * Builds a flat, ordered guest list from the room configuration:
 *   Room 1: Adult 1, Adult 2, Child 1
 *   Room 2: Adult 3, Child 2
 * The very first entry is always the "primary guest" and collects email/phone.
 */
function buildGuestList(rooms: RoomConfig[]): GuestDetail[] {
  const list: GuestDetail[] = []

  for (const room of rooms) {
    for (let a = 0; a < (room.adults ?? 1); a++) {
      list.push({
        type: 'adult',
        title: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
      })
    }
    for (let c = 0; c < (room.children ?? 0); c++) {
      list.push({
        type: 'child',
        age: room.childAges?.[c] ?? 2,
        title: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
      })
    }
  }

  return list
}

// ── Actions ───────────────────────────────────────────────────────────────────

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
    const rooms = res?.rooms ?? []

    state.availableRooms = rooms.map((room: any) => {
      const rates = room.TotalRate.split('|').map(Number)
      const totalPrice = rates.reduce((s: number, r: number) => s + r, 0)

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
  const d = desc.toLowerCase()
  if (d.includes('breakfast')) return 'Bed & Breakfast'
  if (d.includes('half')) return 'Half Board'
  if (d.includes('full')) return 'Full Board'
  return 'Room Only'
}

function extractAmenities(desc: string): string[] {
  if (!desc) return []
  return desc.split('-').slice(1).join('-').split(',').map((a: string) => a.trim()).filter(Boolean)
}

function selectRoom(room: SelectedRoom) {
  state.selectedRoom = room
  // Build guest list from the actual room config (adults + children per room)
  state.guests = buildGuestList(state.searchParams.rooms)
  // Pre-fill contact details from previous session if logged in
  if (state.guests[0]) {
    state.guests[0].email = state.contactEmail
    state.guests[0].phone = state.contactPhone
  }
}

function generateInvoice() {
  state.invoiceNumber = `HTL-${Date.now().toString(36).toUpperCase()}`
  state.invoiceDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

async function confirmBooking(): Promise<boolean> {
  state.status = 'loading'
  await new Promise(r => setTimeout(r, 2000))
  state.bookingReference = `HTL${Math.random().toString(36).slice(2, 8).toUpperCase()}`
  state.voucherUrl = '#'
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
