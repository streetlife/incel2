import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { HeroSectionResponse } from '../types/general'
import { useGeneralService } from '../services/general.service'

const CACHE_KEY = 'hero_section_cache'
const CACHE_DURATION_MS = 60 * 60 * 1000

interface HeroCache {
    data: HeroSectionResponse
    cachedAt: number
}

export const useHeroStore = defineStore('hero', () => {
    const generalService = useGeneralService()

    const heroData = ref<HeroSectionResponse | null>(null)
    const isLoading = ref(false)
    const error = ref<string | null>(null)

    const isCacheValid = (): boolean => {
        try {
            const raw = localStorage.getItem(CACHE_KEY)
            if (!raw) return false
            const cache: HeroCache = JSON.parse(raw)
            return Date.now() - cache.cachedAt < CACHE_DURATION_MS
        } catch {
            return false
        }
    }

    const loadFromCache = (): HeroSectionResponse | null => {
        try {
            const raw = localStorage.getItem(CACHE_KEY)
            if (!raw) return null
            const cache: HeroCache = JSON.parse(raw)
            return cache.data
        } catch {
            return null
        }
    }

    const saveToCache = (data: HeroSectionResponse) => {
        const cache: HeroCache = { data, cachedAt: Date.now() }
        localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
    }

    const clearCache = () => {
        localStorage.removeItem(CACHE_KEY)
        heroData.value = null
    }

    const fetchHero = async (force = false) => {
        if (!force && heroData.value) return

        if (!force && isCacheValid()) {
            heroData.value = loadFromCache()
            return
        }

        try {
            isLoading.value = true
            error.value = null
            const data = await generalService.getHeroSection()
            heroData.value = data
            saveToCache(data)
        } catch (err: any) {
            error.value = err?.message ?? 'Failed to load hero data'
        } finally {
            isLoading.value = false
        }
    }

    return { heroData, isLoading, error, fetchHero, clearCache }
})
