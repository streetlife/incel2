import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useGeneralService } from '../services/general.service'

export interface HotDeal {
    id: number
    title: string
    deal_includes: string
    price: number
    other_info: string[]
    start_date: string
    end_date: string
    is_active: number
}

export const useHotDealsStore = defineStore('hotDeals', () => {
    const deals = ref<HotDeal[]>([])
    const loading = ref(false)
    const error = ref(false)
    const fetched = ref(false)

    const activeDeals = computed(() => deals.value)

    async function fetchDeals(force = false) {
        if (fetched.value && !force) return

        loading.value = true
        error.value = false

        try {
            const generalService = useGeneralService()
            const data = await generalService.getHotDeals()
            deals.value = Array.isArray(data) ? data : []
            fetched.value = true
        } catch (err) {
            console.error('HotDeals store fetch error:', err)
            error.value = true
        } finally {
            loading.value = false
        }
    }

    function refresh() {
        return fetchDeals(true)
    }

    return { deals, activeDeals, loading, error, fetched, fetchDeals, refresh }
})
