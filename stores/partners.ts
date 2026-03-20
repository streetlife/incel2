import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { StatsResponse, PartnersResponse } from '../types/general'
import { useGeneralService } from '../services/general.service'

const STATS_CACHE_KEY = 'stats_cache'
const PARTNERS_CACHE_KEY = 'partners_cache'
const CACHE_DURATION_MS = 60 * 60 * 1000 // 1 hour

interface StatsCache { data: StatsResponse; cachedAt: number }
interface PartnersCache { data: PartnersResponse[]; cachedAt: number }

const isCacheValid = (key: string): boolean => {
    try {
        const raw = localStorage.getItem(key)
        if (!raw) return false
        const cache: { cachedAt: number } = JSON.parse(raw)
        return Date.now() - cache.cachedAt < CACHE_DURATION_MS
    } catch { return false }
}

const loadFromCache = <T>(key: string): T | null => {
    try {
        const raw = localStorage.getItem(key)
        if (!raw) return null
        return (JSON.parse(raw) as { data: T }).data
    } catch { return null }
}

const saveToCache = <T>(key: string, data: T) => {
    localStorage.setItem(key, JSON.stringify({ data, cachedAt: Date.now() }))
}

export const usePartnersStore = defineStore('partners', () => {
    const generalService = useGeneralService()

    const stats = ref<StatsResponse | null>(null)
    const partners = ref<PartnersResponse[]>([])
    const isLoading = ref(false)
    const error = ref<string | null>(null)

    const fetchStats = async (force = false) => {
        if (!force && stats.value) return
        if (!force && isCacheValid(STATS_CACHE_KEY)) {
            stats.value = loadFromCache<StatsResponse>(STATS_CACHE_KEY)
            return
        }
        try {
            const data = await generalService.getStats()
            stats.value = data
            saveToCache(STATS_CACHE_KEY, data)
        } catch (err: any) {
            error.value = err?.message ?? 'Failed to load stats'
        }
    }

    const fetchPartners = async (force = false) => {
        if (!force && partners.value.length) return
        if (!force && isCacheValid(PARTNERS_CACHE_KEY)) {
            partners.value = loadFromCache<PartnersResponse[]>(PARTNERS_CACHE_KEY) ?? []
            return
        }
        try {
            const data = await generalService.getPartners()
            partners.value = data
            saveToCache(PARTNERS_CACHE_KEY, data)
        } catch (err: any) {
            error.value = err?.message ?? 'Failed to load partners'
        }
    }

    const fetchAll = async (force = false) => {
        isLoading.value = true
        await Promise.all([fetchStats(force), fetchPartners(force)])
        isLoading.value = false
    }

    const clearCache = () => {
        localStorage.removeItem(STATS_CACHE_KEY)
        localStorage.removeItem(PARTNERS_CACHE_KEY)
        stats.value = null
        partners.value = []
    }

    const airlines = computed(() => partners.value.filter(p => p.type === 'airline'))
    const platforms = computed(() => partners.value.filter(p => p.type === 'partner'))

    return { stats, partners, airlines, platforms, isLoading, error, fetchAll, clearCache }
})
