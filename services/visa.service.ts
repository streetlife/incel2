import type { ApiResponse } from '../types/api'
import type {
    MetaDataResponse,
    VisaSearchData,
    VisaSearchResponse,
    SearchResultResponse,
    CountryResponse,
    BookingCodeResponse,
    CreateVisaData,
    CreateVisaResponse,
    InitializePaymentData,
    InitializePaymentResponse,
} from '../types/visa'
import { useApi } from '../utils/api'


export function useVisaService() {
    const $api = useApi()

    return {

        /**
         * Fetch all dropdown metadata
         * Called once on app load — result is cached in Pinia.
         *
         * GET /api/visa/metadata
         */
        async getMetaData(): Promise<MetaDataResponse> {
            const res = await $api<ApiResponse<MetaDataResponse>>('/visas/metadata')
            return res.data
        },

        /**
         * Returns a session_code that identifies this search session.
         *
         * POST /api/visa/search
         */
        async visaSearch(payload: VisaSearchData): Promise<VisaSearchResponse> {
            const res = await $api<VisaSearchResponse>('/visas/search', {
                method: 'POST',
                body: payload,
            })
            return res
        },

        /**
         * Returns an array of available visa types with prices.
         *
         * GET /api/visa/search-result/:session_code
         */
        async getSearchResults(sessionCode: string): Promise<SearchResultResponse[]> {
            const res = await $api<ApiResponse<SearchResultResponse[]>>(
                `/visas/session/${sessionCode}`
            )
            return res.data
        },

        async getCountries(): Promise<CountryResponse[]> {
            const res = await $api<CountryResponse[]>('/countries/all-countries', {
                method: 'GET'
            })

            return res
        },

        /**
         * Generate booking code.
         */
        async generateBookingCode(): Promise<BookingCodeResponse> {
            const res = await $api<ApiResponse<BookingCodeResponse>>('/visas/travellers/generate/booking-code', {
                method: 'GET',
            })
            return res.data
        },

        /**
         * Create visa (Travellers)
         */
        async createVisa(payload: CreateVisaData): Promise<CreateVisaResponse> {
            const res = await $api<CreateVisaResponse>('/visas/create-visa', {
                method: 'POST',
                body: payload,
            })
            return res
        },

        /**
         * Initialize payment.
         */
        async initializePayment(payload: InitializePaymentData): Promise<InitializePaymentResponse> {
            const res = await $api<ApiResponse<InitializePaymentResponse>>('/visas/payment', {
                method: 'POST',
                body: payload,
            })
            return res.data
        },

    }
}