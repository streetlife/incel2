import { ApiResponse } from "../types/api"
import { ContactUsData, ContactUsResponse } from "../types/general"
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
    }

}
