import type { FlightMeta, FlightOffer, FlightSearchParams } from '../types/flight'
import { useFlightService } from '../services/flight.service'
import { normaliseError } from '../utils/api'
import { useRoute, useRouter } from 'vue-router'
import { Ref, ref, computed, watch } from 'vue'
import { useToast } from './useToast'
import { buildSearchKey, useFlightStore } from '../stores/flight'

export function useFlights() {
    const route = useRoute()
    const router = useRouter()
    const service = useFlightService()
    const toast = useToast()
    const { selectOffer } = useFlightStore()
    const flightStore = useFlightStore()

    const showSearchForm = ref(true)
    const results: Ref<FlightOffer[]> = ref([])
    const meta = ref<FlightMeta>({
        count: 0,
        airlines: {},
        recommended: null,
        fastest: null,
    })
    const loading: Ref<boolean> = ref(false)
    const error: Ref<string> = ref('')
    const hasSearched: Ref<boolean> = ref(false)

    function rehydrateFromStore(key: string, params: any): boolean {
        if (flightStore.hasCachedResults(key)) {
            results.value = flightStore.cachedResults
            meta.value = flightStore.cachedMeta
            hasSearched.value = true
            showSearchForm.value = false

            router.replace({
                query: {
                    ...params,
                    session_code: flightStore.session_code
                },
            })

            return true
        }
        return false
    }

    const paramsFromUrl = computed<Partial<FlightSearchParams>>(() => ({
        from: route.query.from as string | undefined,
        to: route.query.to as string | undefined,
        dateFrom: route.query.dateFrom as string | undefined,
        dateTo: route.query.dateTo as string | undefined,
        search_type: (route.query.tripType as FlightSearchParams['search_type']) ?? 'round-trip',
        flight_class: (route.query.travelClass as FlightSearchParams['flight_class']) ?? 'economy',
        adults: Number(route.query.passengers) || 1,
    }))

    async function search(params: FlightSearchParams) {
        const key = buildSearchKey(params)

        if (rehydrateFromStore(key, params)) return

        loading.value = true
        error.value = ''
        hasSearched.value = true

        await router.replace({
            query: {
                from: params.from,
                to: params.to,
                dateFrom: params.dateFrom,
                dateTo: params.dateTo ?? undefined,
                tripType: params.search_type,
                travelClass: params.flight_class,
                adult_number: params.adult_number,
                child_number: params.child_number,
                infants_number: params.infants_number,
                session_code: flightStore.session_code
            },
        })

        try {
            const res = await service.search(params)
            results.value = res.flights ?? []
            flightStore.setSessionCode(res.session_code)

            meta.value = {
                count: res.flight_count ?? res.flights?.length ?? 0,
                airlines: res.filter?.airlines ?? {},
                recommended: res.recommended?.cheapest ?? null,
                fastest: res.recommended?.fastest ?? null,
            }

            flightStore.setCachedResults(key, results.value, meta.value, res.session_code)

            await router.replace({
                query: {
                    ...route.query,
                    session_code: res.session_code ?? undefined,
                },
            })

            showSearchForm.value = false
        } catch (err) {
            error.value = normaliseError(err)
            results.value = []
            meta.value = { count: 0, airlines: {}, recommended: null, fastest: null }
            showSearchForm.value = true
            toast.error(error.value)
        } finally {
            loading.value = false
        }
    }

    watch(
        () => route.query,
        async (q) => {
            if (!q.from || !q.to) return

            if (q.session_code) {
                hasSearched.value = true
                showSearchForm.value = false

                if (flightStore.cachedResults.length > 0) {
                    results.value = flightStore.cachedResults
                    meta.value = flightStore.cachedMeta
                    return
                }

                const unwatch = watch(
                    () => flightStore.cachedResults,
                    (val) => {
                        if (val.length > 0) {
                            results.value = val
                            meta.value = flightStore.cachedMeta
                            unwatch()
                        }
                    },
                    { immediate: true }
                )
                return
            }

            const params = {
                supplier: q.supplier as FlightSearchParams['supplier'] ?? 'amadeus',
                from: q.from as string,
                to: q.to as string,
                dateFrom: q.dateFrom as string,
                dateTo: q.dateTo as string | undefined,
                search_type: (q.tripType as FlightSearchParams['search_type']) ?? 'round-trip',
                flight_class: (q.travelClass as FlightSearchParams['flight_class']) ?? 'economy',
                adult_number: Number(q.adult_number) || 1,
                child_number: Number(q.child_number) || 0,
                infants_number: Number(q.infants_number) || 0,
            }

            const key = buildSearchKey(params)

            if (rehydrateFromStore(key, params)) return

            if (results.value.length === 0 && !loading.value) {
                hasSearched.value = true
                await search(params)
            }
        },
        { immediate: true }
    )

    function hydrateStoreFromUrl() {
        const q = route.query

        if (!q.from || !q.to) {
            router.replace('/travel/flights')
            return
        }

        const searchParams = {
            from: q.from as string,
            to: q.to as string,
            dateFrom: q.dateFrom as string,
            dateTo: q.dateTo as string,
            tripType: q.tripType as string,
            travelClass: q.travelClass as string,
            adult_number: Number(q.adult_number) || 1,
            child_number: Number(q.child_number) || 0,
            infants_number: Number(q.infants_number) || 0,
            session_code: q.session_code as string
        }

        flightStore.setFlight(searchParams)
    }

    function navigateToBooking(offerId: string) {
        const offer = results.value.find(f => f.id === offerId)
        if (!offer) return

        hydrateStoreFromUrl()

        const adults = Number(route.query.adult_number || 0)
        const children = Number(route.query.child_number || 0)
        const infants = Number(route.query.infants_number || 0)

        const buildTypes = (count: number, type: 'ADULT' | 'CHILD' | 'INFANT') =>
            new Array(Math.max(0, count)).fill(type)

        const passengerTypes = [
            ...buildTypes(adults, 'ADULT'),
            ...buildTypes(children, 'CHILD'),
            ...buildTypes(infants, 'INFANT'),
        ]

        selectOffer(offer, passengerTypes)

        router.push({
            path: '/travel/flights/booking',
            query: {
                offerId: offerId,
                adult_number: route.query.adult_number,
                child_number: route.query.child_number,
                infants_number: route.query.infants_number,
                session_code: route.query.session_code ?? undefined,
                step: '1',
            },
        })
    }

    return {
        results,
        meta,
        loading,
        error,
        hasSearched,
        paramsFromUrl,
        showSearchForm,
        search,
        navigateToBooking,
    }
}
