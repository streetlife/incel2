import { ApiResponse } from "../types/api"
import { AirpotTransferData, AirpotTransferResponse, ContactUsData, ContactUsResponse, TravelInsuranceData, TravelInsuranceResponse } from "../types/general"
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
    }

}
