import { useRuntimeConfig } from 'nuxt/app'
import type {
    CreateBookingData,
    FlutterwavePaymentData,
    FlutterwavePaymentResponse,
    HotelCountryCodeResponse,
    HotelCountryResponse,
    HotelDetailResponse,
    HotelSearchParams,
    HotelSearchResponse,
    PaystackPaymentData,
    PaystackPaymentResponse,
} from '../types/hotel'
import { useApi } from '../utils/api'
import { toSlashDate } from '../utils/date'

export function useHotelService() {
    const $api = useApi()
    const config = useRuntimeConfig()

    return {
        async searchHotel(params: HotelSearchParams): Promise<HotelSearchResponse> {
            const apiKey = config.public.hotel

            if (!isString(apiKey)) {
                throw new Error('Hotel API key must be a string')
            }

            const payload = buildPayload(params)
            return $api<HotelSearchResponse>('/hotels/search', {
                method: 'POST',
                body: payload,
                headers: { 'x-api-key': apiKey },
            })
        },

        async getHotelCountry(): Promise<HotelCountryResponse[]> {
            return $api<HotelCountryResponse[]>('/hotels/countries', { method: 'GET' })
        },

        async getHotelCountryCode(code: string): Promise<HotelCountryCodeResponse[]> {
            return $api<HotelCountryCodeResponse[]>(`/hotels/cities/${code}`, { method: 'GET' })
        },

        async getHotelById(sessionCode: string, hotelId: string): Promise<HotelDetailResponse> {
            const res = await $api<HotelDetailResponse>(`/hotels/${sessionCode}/${hotelId}`, {
                method: 'GET'
            })

            return res
        },

        async createBooking(params: CreateBookingData): Promise<HotelSearchResponse> {
            return $api<HotelSearchResponse>('/hotels/create-booking', {
                method: 'POST',
                body: params,
            })
        },

        async paystackPayment(params: PaystackPaymentData): Promise<PaystackPaymentResponse> {
            return $api<PaystackPaymentResponse>('/paystack/payment/initialize', {
                method: 'POST',
                body: params,
            })
        },

        async flutterwavePayment(params: FlutterwavePaymentData): Promise<FlutterwavePaymentResponse> {
            return $api<FlutterwavePaymentResponse>('/flutterwave/payment/initialize', {
                method: 'POST',
                body: params,
            })
        },
    }
}

function isString(value: unknown): value is string {
    return typeof value === 'string'
}

function buildPayload(params: HotelSearchParams): Record<string, unknown> {
    if (!params.city) {
        throw new Error(
            `City "${params.city}" is not found.`,
        )
    }

    const totalAdults = params.rooms.reduce((s, r) => s + (r.adults ?? 0), 0)
    const totalChildren = params.rooms.reduce((s, r) => s + (r.children ?? 0), 0)

    const childAges: number[] = params.rooms.flatMap((r) => {
        const ages = r.childAges ?? []
        const missing = Math.max(0, (r.children ?? 0) - ages.length)
        return [...ages, ...new Array(missing).fill(2)]
    })

    const payload: Record<string, unknown> = {
        search_hotel_country: params.country,
        search_hotel_city: params.city,
        search_hotel_nationality: params.nationality,
        arrival_date: toSlashDate(params.checkInStart),
        departure_date: toSlashDate(params.checkInEnd),
        room_number: params.rooms.length,
        adult_number: totalAdults,
        child_number: totalChildren,
    }

    params.rooms.forEach((room, i) => {
        const n = i + 1
        payload[`room${n}_adults`] = room.adults ?? 1
        payload[`room${n}_children`] = room.children ?? 0
    })

    if (childAges.length > 0) {
        payload.child = childAges
    }

    return payload
}
