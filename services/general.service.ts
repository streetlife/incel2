import { ApiResponse } from "../types/api"
import { AirportProtocolData, AirportProtocolResponse, AirpotTransferData, AirpotTransferResponse, ContactUsData, ContactUsResponse, HotDealResponse, NewsLetterData, NewsLetterResponse, PackageResponse, TourGuideData, TourGuideResponse, TravelInsuranceData, TravelInsuranceResponse } from "../types/general"
import { useApi } from "../utils/api"

export function useGeneralService() {
    const $api = useApi()

    return {
        async contactUs(data: ContactUsData): Promise<ContactUsResponse> {
            const res = await $api<ApiResponse<ContactUsResponse>>('/services/contact', {
                method: 'POST',
                body: data,
            })
            return res.data
        },

        async saveTravelInsurance(data: TravelInsuranceData): Promise<TravelInsuranceResponse> {
            const res = await $api<ApiResponse<TravelInsuranceResponse>>('/services/insurance', {
                method: 'POST',
                body: data,
            })
            return res.data
        },

        async saveAirportTransfer(data: AirpotTransferData): Promise<AirpotTransferResponse> {
            const res = await $api<ApiResponse<AirpotTransferResponse>>('/services/airport-transfer', {
                method: 'POST',
                body: data,
            })
            return res.data
        },

        async saveTourGuide(data: TourGuideData): Promise<TourGuideResponse> {
            const res = await $api<ApiResponse<TourGuideResponse>>('/services/tour-guide', {
                method: 'POST',
                body: data,
            })
            return res.data
        },

        async saveAirportProtocol(data: AirportProtocolData): Promise<AirportProtocolResponse> {
            const res = await $api<ApiResponse<AirportProtocolResponse>>('/services/airport-protocol', {
                method: 'POST',
                body: data,
            })
            return res.data
        },

        async getPackages(mode: string): Promise<PackageResponse[]> {
            const res = await $api<ApiResponse<PackageResponse[]>>(`/services/packages?mode=${mode}`, {
                method: 'GET'
            })

            return res.data
        },

        async getPackage(id: string | number) {
            const response = await $api<ApiResponse<PackageResponse>>(`/services/travel-package/${id}`)
            return response.data
        },

        async getHotDeals(): Promise<HotDealResponse[]> {
            const res = await $api<ApiResponse<HotDealResponse[]>>('/services/hotdeals', {
                method: 'GET'
            })

            return res.data
        },

        async getHotDeal(id: number): Promise<HotDealResponse> {
            const res = await $api<ApiResponse<HotDealResponse>>(`/services/hot-deal/${id}`, {
                method: 'GET'
            })

            return res.data
        },

        async saveNewsLetter(data: NewsLetterData): Promise<NewsLetterResponse> {
            const res = await $api<ApiResponse<NewsLetterResponse>>('/subscribe', {
                method: 'POST',
                body: data,
            })
            return res.data
        },
    }

}
