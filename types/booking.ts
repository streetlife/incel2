export type BookingType = 'hotel' | 'flight' | 'tour' | 'visa'

export interface BookingSearchParams {
  bookingCode: string
  type: BookingType
}

export interface HotelGuest {
  title: string
  firstName: string
  lastName: string
}

export interface HotelOccupancy {
  rooms: number
  adultsPerRoom: number[]
  childrenPerRoom: number[]
  childrenAges: number[][]
  totalChildren: number
}

export interface HotelBookingDetail {
  rezliveBookingId: string
  hotelName: string
  location: string
  image: string
  arrival_date: string
  departure_date: string
  amount: number
  roomTypes: string[]
  occupancy: HotelOccupancy
  guests: HotelGuest[]
  rezliveBookingCode: string
}

export interface BookingInfoResponse {
  bookingCode: string
  type: BookingType
  booking: HotelBookingDetail | Record<string, any>
}

export interface CancelBookingData {
  booking_id: string
  booking_code: string
}

export interface CancelBookingResponse {
  message: string
  status: boolean
}
