import { ApiResponse } from "../types/api"
import {
    CityResponse,
    CountryResponse,
    TourBookingRecordPayload,
    TourBookingRecordResponse,
    TourPaymentPayload,
    TourPaymentResponse,
    TourPricingApiResponse,
    TourPricingPayload,
    TourProcessApiResponse,
    TourProcessPayload,
    TourSearchApiResponse,
    TourSearchPayload,
} from "../types/tour"
import { useApi } from "../utils/api"



export function useTourService() {
    const $api = useApi()

    return {
        async getCountries(): Promise<CountryResponse[]> {
            const res = await $api<ApiResponse<CountryResponse[]>>('/tours/countries', {
                method: 'GET'
            })
            return res.data
        },

        async cityByCountry(countryId: string): Promise<CityResponse[]> {
            const res = await $api<ApiResponse<CityResponse[]>>(`/tours/cities-by-country/${countryId}`, {
                method: 'GET'
            })
            return res.data
        },

        async searchTours(payload: TourSearchPayload): Promise<TourSearchApiResponse> {
            return await $api<TourSearchApiResponse>('/tours/search', {
                method: 'POST',
                body: payload,
            })
        },

        async getTourPricing(payload: TourPricingPayload): Promise<TourPricingApiResponse> {
            return await $api<TourPricingApiResponse>('/tours/pricing', {
                method: 'POST',
                body: payload,
            })
        },

        async createBookingRecord(payload: TourBookingRecordPayload): Promise<TourBookingRecordResponse> {
            return await $api<TourBookingRecordResponse>('/bookings/tour', {
                method: 'POST',
                body: payload,
            })
        },

        async processTourBooking(payload: TourProcessPayload): Promise<TourProcessApiResponse> {
            return await $api<TourProcessApiResponse>('/tours/process', {
                method: 'POST',
                body: payload,
            })
        },

        async initializePayment(gateway: 'paystack' | 'flutterwave', payload: TourPaymentPayload): Promise<TourPaymentResponse> {
            const res = await $api<TourPaymentResponse>(`/${gateway}/payment/initialize`, {
                method: 'POST',
                body: payload,
            })
            return res
        },
    }
}

