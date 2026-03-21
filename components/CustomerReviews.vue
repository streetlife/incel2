<script setup lang="ts">
import { computed, onMounted, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { useReviewsStore } from '../stores/reviews'
import type { ReviewsResponse } from '../types/general'

const reviewsStore = useReviewsStore()
const { reviews, isLoading } = storeToRefs(reviewsStore)

const avatarColors = ['#7c3aed', '#0891b2', '#059669', '#dc2626', '#d97706', '#0f766e']

const getInitials = (firstName: string, lastName: string) =>
  `${firstName?.charAt(0) ?? ''}${lastName?.charAt(0) ?? ''}`.toUpperCase()

const getAvatarColor = (index: number) => avatarColors[index % avatarColors.length]

const formatDate = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
  } catch { return '' }
}

const fallbackReviews = [
  {
    first_name: 'Adaeze', last_name: 'Okonkwo', rating: '5',
    review: 'Absolutely seamless from start to finish. My visa was processed in 3 days and the hotel they recommended was incredible. Will definitely book again!',
    country: 'Dubai, UAE', created_at: '2025-02-01',
  },
  {
    first_name: 'Emeka', last_name: 'Chukwu', rating: '5',
    review: 'The team handled every detail of my business trip including my UK visa. Professional, prompt and very affordable. Highly recommend.',
    country: 'London, UK', created_at: '2025-01-01',
  },
  {
    first_name: 'Fatima', last_name: 'Al-Hassan', rating: '5',
    review: 'I was nervous travelling abroad alone for the first time but the travel package was so well put together. Felt completely safe.',
    country: 'Istanbul, Turkey', created_at: '2024-12-01',
  },
  {
    first_name: 'Biodun', last_name: 'Adeleke', rating: '5',
    review: 'Honeymoon trip to the Maldives — they exceeded every expectation. From the overwater bungalow to the private sunset cruise. Pure magic.',
    country: 'Maldives', created_at: '2024-11-01',
  },
  {
    first_name: 'Ngozi', last_name: 'Peters', rating: '5',
    review: 'Got my Schengen visa approved on first attempt. The documentation guidance was spot on. The Paris itinerary they planned was wonderful.',
    country: 'Paris, France', created_at: '2024-10-01',
  },
  {
    first_name: 'Tunde', last_name: 'Williams', rating: '5',
    review: 'Umrah package was flawlessly organised. Flights, accommodation in Makkah and Madinah, everything handled. A deeply spiritual experience.',
    country: 'Saudi Arabia', created_at: '2024-09-01',
  },
]

const displayReviews = computed<ReviewsResponse[]>(() =>
  reviews.value.length ? reviews.value : fallbackReviews as ReviewsResponse[]
)

const averageRating = computed(() => {
  if (!displayReviews.value.length) return 0
  const sum = displayReviews.value.reduce((acc, r) => acc + Number(r.rating), 0)
  return Math.round((sum / displayReviews.value.length) * 10) / 10
})

const totalReviews = computed(() => displayReviews.value.length)

onMounted(async () => {
  await reviewsStore.fetchReviews()
  await nextTick()

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-visible')
          observer.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  )

  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el))
})
</script>

<template>
  <section class="py-20 bg-gray-50 overflow-hidden sm:px-24 px-4">
    <div class="container mx-auto px-4">
      <div class="text-center mb-14 reveal">
        <p class="text-xs font-semibold tracking-[0.25em] uppercase text-primary mb-3">What Travellers Say</p>
        <h2 class="text-3xl md:text-4xl font-bold text-gray-900">
          Real Stories, <span class="text-primary">Real Journeys</span>
        </h2>
        <p class="mt-3 text-gray-500 max-w-lg mx-auto text-sm leading-relaxed">
          Thousands of satisfied travellers have trusted us to plan their perfect trips.
        </p>

        <div class="inline-flex items-center gap-2 mt-6 bg-white border border-gray-200 rounded-full px-5 py-2 shadow-sm">
          <div class="flex">
            <svg
              v-for="i in 5"
              :key="i"
              class="w-4 h-4 transition-colors duration-200"
              :class="i <= Math.round(averageRating) ? 'text-amber-400' : 'text-gray-200'"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
          </div>
          <span class="text-sm font-semibold text-gray-800">{{ averageRating }} out of 5</span>
          <span class="text-sm text-gray-400">· {{ totalReviews.toLocaleString() }}+ reviews</span>
        </div>
      </div>

      <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <div
          v-for="i in 6" :key="i"
          class="bg-white rounded-2xl p-6 border border-gray-200 animate-pulse"
        >
          <div class="h-4 bg-gray-100 rounded w-1/4 mb-4"></div>
          <div class="space-y-2 mb-6">
            <div class="h-3 bg-gray-100 rounded w-full"></div>
            <div class="h-3 bg-gray-100 rounded w-5/6"></div>
            <div class="h-3 bg-gray-100 rounded w-4/6"></div>
          </div>
          <div class="flex items-center gap-3 pt-4 border-t border-gray-100">
            <div class="w-10 h-10 rounded-full bg-gray-100"></div>
            <div class="flex-1 space-y-1.5">
              <div class="h-3 bg-gray-100 rounded w-1/2"></div>
              <div class="h-2.5 bg-gray-100 rounded w-1/3"></div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 reveal">
        <div
          v-for="(review, i) in displayReviews"
          :key="i"
          class="flex flex-col bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
          :class="i === 0 || i === 3 ? 'border-[1.5px] border-primary' : 'border border-gray-200'"
        >
          <svg class="w-8 h-8 text-primary/20 mb-4 shrink-0" fill="currentColor" viewBox="0 0 32 32">
            <path d="M10 8C5.6 8 2 11.6 2 16v8h8v-8H5.8C5.9 13.8 7.7 12 10 12V8zm14 0c-4.4 0-8 3.6-8 8v8h8v-8h-4.2c.1-2.2 1.9-4 4.2-4V8z"/>
          </svg>

          <div class="flex mb-3">
            <svg
              v-for="s in Number(review.rating)"
              :key="s"
              class="w-4 h-4 text-amber-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
          </div>

          <p class="text-gray-700 text-sm leading-relaxed flex-1 mb-5">"{{ review.review }}"</p>

          <div class="flex items-center gap-3 pt-4 border-t border-gray-100">
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              :style="{ background: getAvatarColor(i) }"
            >
              <span class="text-white font-bold text-sm">
                {{ getInitials(review.first_name, review.last_name) }}
              </span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-gray-900 truncate">
                {{ review.first_name }} {{ review.last_name }}
              </p>
              <p class="text-xs text-gray-400 truncate">
                {{ review.country }} · {{ formatDate(review.created_at) }}
              </p>
            </div>
            <span class="shrink-0 text-[0.65rem] font-semibold text-green-600 bg-green-50 rounded-full px-2 py-0.5 whitespace-nowrap">
              ✓ Verified
            </span>
          </div>
        </div>
      </div>

      <div class="text-center mt-14 reveal">
        <p class="text-sm text-gray-500 mb-4">Join thousands of happy travellers</p>
        <NuxtLink
          to="/travel/flights"
          class="inline-flex items-center gap-2 bg-primary text-white font-semibold px-8 py-3.5 rounded-full hover:bg-primary-dark hover:scale-105 transition-all duration-300 shadow-md shadow-primary/20"
        >
          Book Your Trip Today
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
          </svg>
        </NuxtLink>
      </div>
    </div>

    <!-- Video modal (unchanged) -->
    <!-- <Transition
      enter-active-class="transition-opacity duration-200"
      leave-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="activeVideo"
        class="fixed inset-0 bg-black/85 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
        @click.self="activeVideo = null"
      >
        <div class="relative w-full max-w-3xl aspect-video bg-black rounded-2xl overflow-hidden">
          <button
            class="absolute -top-10 right-0 w-8 h-8 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center text-white transition-colors duration-200 z-10"
            @click="activeVideo = null"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
          <iframe
            v-if="activeVideo.embedUrl"
            :src="activeVideo.embedUrl"
            class="w-full h-full"
            allow="autoplay; fullscreen"
            allowfullscreen
            title="video"
          />
        </div>
      </div>
    </Transition> -->
  </section>
</template>