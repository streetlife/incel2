import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AboutUsResponse } from '../types/general'
import { useGeneralService } from '../services/general.service'

const CACHE_KEY = 'about_us_cache'
const CACHE_DURATION_MS = 60 * 60 * 1000 // 1 hour

interface AboutCache {
    data: AboutUsResponse
    cachedAt: number
}

export const useAboutStore = defineStore('about', () => {
    const generalService = useGeneralService()

    const aboutData = ref<AboutUsResponse | null>(null)
    const isLoading = ref(false)
    const error = ref<string | null>(null)

    const isCacheValid = (): boolean => {
        try {
            const raw = localStorage.getItem(CACHE_KEY)
            if (!raw) return false

            const cache: AboutCache = JSON.parse(raw)
            const age = Date.now() - cache.cachedAt
            return age < CACHE_DURATION_MS
        } catch {
            return false
        }
    }

    const loadFromCache = (): AboutUsResponse | null => {
        try {
            const raw = localStorage.getItem(CACHE_KEY)
            if (!raw) return null

            const cache: AboutCache = JSON.parse(raw)
            return cache.data
        } catch {
            return null
        }
    }

    const saveToCache = (data: AboutUsResponse) => {
        const cache: AboutCache = { data, cachedAt: Date.now() }
        localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
    }

    const clearCache = () => {
        localStorage.removeItem(CACHE_KEY)
        aboutData.value = null
    }

    const fetchAbout = async (force = false) => {
        if (!force && aboutData.value) return

        if (!force && isCacheValid()) {
            aboutData.value = loadFromCache()
            return
        }

        try {
            isLoading.value = true
            error.value = null

            const data = await generalService.getAbout() as unknown as AboutUsResponse
            aboutData.value = data
            saveToCache(data)
        } catch (err: any) {
            error.value = err?.message ?? 'Failed to load about data'
        } finally {
            isLoading.value = false
        }
    }

    return {
        aboutData,
        isLoading,
        error,
        fetchAbout,
        clearCache,
    }
})
