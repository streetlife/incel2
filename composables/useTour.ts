import { ref } from 'vue'
import { useTourService } from '../services/tour.service'
import type { CountryResponse, CityResponse, TourResult, TourSearchPayload } from '../types/tour'

const countries = ref<CountryResponse[]>([])
const cities = ref<CityResponse[]>([])
const countriesLoading = ref(false)
const citiesLoading = ref(false)
const searchResults = ref<TourResult[]>([])
const searchLoading = ref(false)
const searchError = ref('')
const sessionCode = ref('')
const hasSearched = ref(false)

export function useTour() {
    const service = useTourService()

    async function fetchCountries() {
        if (countries.value.length > 0) return
        countriesLoading.value = true
        try {
            countries.value = await service.getCountries()
        } catch {
            // silently fail — form still works with empty list
        } finally {
            countriesLoading.value = false
        }
    }

    // ── Cities ────────────────────────────────────────────────────────────────
    async function fetchCities(countryId: number) {
        cities.value = []
        if (!countryId) return
        citiesLoading.value = true
        try {
            cities.value = await service.cityByCountry(String(countryId))
        } catch {
            cities.value = []
        } finally {
            citiesLoading.value = false
        }
    }

    // ── Search ────────────────────────────────────────────────────────────────
    async function searchTours(payload: TourSearchPayload) {
        searchLoading.value = true
        searchError.value = ''
        searchResults.value = []
        hasSearched.value = true
        try {
            const res = await service.searchTours(payload)
            searchResults.value = res.data?.result ?? []
            sessionCode.value = res.session_code ?? ''
        } catch (e: any) {
            searchError.value = e?.userMessage ?? e?.message ?? 'Failed to search tours. Please try again.'
        } finally {
            searchLoading.value = false
        }
    }

    function clearResults() {
        searchResults.value = []
        searchError.value = ''
        hasSearched.value = false
        sessionCode.value = ''
    }

    return {
        // state
        countries,
        cities,
        countriesLoading,
        citiesLoading,
        searchResults,
        searchLoading,
        searchError,
        sessionCode,
        hasSearched,
        // actions
        fetchCountries,
        fetchCities,
        searchTours,
        clearResults,
    }
}
