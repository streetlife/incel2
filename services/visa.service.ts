import { ApiResponse } from "../types/api";
import { MetaDataResponse, VisaSearchData, VisaSearchResponse } from "../types/visa";
import { useApi } from "../utils/api";


export function useVisaService() {
    const $api = useApi()

    return {
        /**
         * Visa search.
         */
        async visaSearch(params: VisaSearchData): Promise<VisaSearchResponse> {
            const res = await $api<VisaSearchResponse>('/visas/search', {
                method: 'POST',
                body: params,
            })
            return res
        },

        /**
         * Meta data.
         */
        async getMetaData(): Promise<MetaDataResponse> {
            const res = await $api<ApiResponse<MetaDataResponse>>('/visas/metadata', {
                method: 'GET',
            })
            return res.data
        },

        /**
         * Search result.
         */
        async searchResult(sessionCode: string): Promise<MetaDataResponse> {
            const res = await $api<ApiResponse<MetaDataResponse>>(`/visas/session/${sessionCode}`, {
                method: 'GET',
            })
            return res.data
        },
    }
}