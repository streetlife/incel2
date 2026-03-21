import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ReviewsResponse } from '../types/general'
import { useGeneralService } from '../services/general.service'

const CACHE_KEY = 'reviews_cache'
const CACHE_DURATION_MS = 60 * 60 * 1000 // 1 hour

interface ReviewsCache { data: ReviewsResponse[]; cachedAt: number }

export const useReviewsStore = defineStore('reviews', () => {
    const generalService = useGeneralService()

    const reviews = ref<ReviewsResponse[]>([])
    const isLoading = ref(false)
    const error = ref<string | null>(null)

    const isCacheValid = (): boolean => {
        try {
            const raw = localStorage.getItem(CACHE_KEY)
            if (!raw) return false
            const cache: ReviewsCache = JSON.parse(raw)
            return Date.now() - cache.cachedAt < CACHE_DURATION_MS
        } catch { return false }
    }

    const loadFromCache = (): ReviewsResponse[] | null => {
        try {
            const raw = localStorage.getItem(CACHE_KEY)
            if (!raw) return null
            return (JSON.parse(raw) as ReviewsCache).data
        } catch { return null }
    }

    const saveToCache = (data: ReviewsResponse[]) => {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ data, cachedAt: Date.now() }))
    }

    const fetchReviews = async (force = false) => {
        if (!force && reviews.value.length) return
        if (!force && isCacheValid()) {
            reviews.value = loadFromCache() ?? []
            return
        }
        try {
            isLoading.value = true
            error.value = null
            const data = await generalService.getReviews()
            reviews.value = data
            saveToCache(data)
        } catch (err: any) {
            error.value = err?.message ?? 'Failed to load reviews'
        } finally {
            isLoading.value = false
        }
    }

    const clearCache = () => {
        localStorage.removeItem(CACHE_KEY)
        reviews.value = []
    }

    return { reviews, isLoading, error, fetchReviews, clearCache }
})
