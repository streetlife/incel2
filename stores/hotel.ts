// stores/useHotelSearchStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
    HotelResult,
    HotelSearchFilters,
    HotelSearchMeta,
    HotelSearchParams,
} from '../types/hotel'

export const useHotelSearchStore = defineStore(
    'hotelSearch',
    () => {
        const results = ref<HotelResult[]>([])
        const searchMeta = ref<HotelSearchMeta | null>(null)
        const filters = ref<HotelSearchFilters | null>(null)
        const sessionCode = ref<string>('')
        const lastParams = ref<HotelSearchParams | null>(null)
        const hasSearched = ref(false)
        const currentPage = ref(1)
        const sortKey = ref<'price_asc' | 'price_desc' | 'rating'>('price_asc')

        const sortedResults = computed(() => {
            const list = [...results.value]
            if (sortKey.value === 'price_asc') return list.sort((a, b) => a.price - b.price)
            if (sortKey.value === 'price_desc') return list.sort((a, b) => b.price - a.price)
            if (sortKey.value === 'rating') return list.sort((a, b) => b.rating - a.rating)
            return list
        })

        const nights = computed(() => {
            if (!searchMeta.value) return 1
            const diff = Math.ceil(
                (new Date(searchMeta.value.departure_date).getTime() -
                    new Date(searchMeta.value.arrival_date).getTime()) /
                86_400_000,
            )
            return diff > 0 ? diff : 1
        })

        function setResults(
            hotels: HotelResult[],
            meta: HotelSearchMeta,
            searchFilters: HotelSearchFilters,
            code: string,
            params: HotelSearchParams,
        ) {
            results.value = hotels
            searchMeta.value = meta
            filters.value = searchFilters
            sessionCode.value = code
            lastParams.value = params
            hasSearched.value = true
            currentPage.value = 1
        }

        function setPage(page: number) {
            currentPage.value = page
        }

        function setSortKey(key: 'price_asc' | 'price_desc' | 'rating') {
            sortKey.value = key
            currentPage.value = 1
        }

        function clearResults() {
            results.value = []
            searchMeta.value = null
            filters.value = null
            sessionCode.value = ''
            lastParams.value = null
            hasSearched.value = false
            currentPage.value = 1
            sortKey.value = 'price_asc'
        }

        return {
            results,
            searchMeta,
            filters,
            sessionCode,
            lastParams,
            hasSearched,
            currentPage,
            sortKey,
            sortedResults,
            nights,
            setResults,
            setPage,
            setSortKey,
            clearResults,
        }
    },

    {
        unstorage: {
            pick: [
                'results',
                'searchMeta',
                'filters',
                'sessionCode',
                'lastParams',
                'hasSearched',
                'currentPage',
                'sortKey',
            ],
        },
    },
)
