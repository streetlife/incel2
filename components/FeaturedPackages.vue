<template>
  <section class="py-20 bg-white sm:px-24 px-4">
    <div class="container mx-auto px-4">
      <div class="text-center mb-4 reveal">
        <p class="text-primary font-semibold mb-2">Featured Packages</p>
        <h2 class="section-title">Handpicked Travel Experiences</h2>
        <p class="section-subtitle">
          Discover our curated collection of premium packages designed for unforgettable journeys.
        </p>
      </div>

      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div
          v-for="i in 3"
          :key="i"
          class="rounded-2xl overflow-hidden bg-gray-100 animate-pulse h-[480px]"
        >
          <div class="h-64 bg-gray-200"></div>
          <div class="p-6 space-y-3">
            <div class="h-3 bg-gray-200 rounded w-1/3"></div>
            <div class="h-5 bg-gray-200 rounded w-4/5"></div>
            <div class="h-5 bg-gray-200 rounded w-3/5"></div>
            <div class="space-y-2 mt-4">
              <div class="h-3 bg-gray-200 rounded w-full"></div>
              <div class="h-3 bg-gray-200 rounded w-5/6"></div>
              <div class="h-3 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="error && !loading"
        class="flex items-center justify-between gap-4 bg-amber-50 border border-amber-200 rounded-xl px-5 py-3.5 mb-8 text-sm"
      >
        <div class="flex items-center gap-2 text-amber-700">
          <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span>Couldn't load live packages — showing sample data.</span>
        </div>
        <button class="text-primary font-semibold hover:underline shrink-0" @click="fetchPackages">
          Retry
        </button>
      </div>

      <div
        v-if="!loading"
        class="relative"
        @mouseenter="pauseCarousel"
        @mouseleave="resumeCarousel"
      >
        <div class="overflow-hidden bg-white py-5">
          <div
            class="flex transition-transform duration-700 ease-in-out"
            :style="{ transform: `translateX(-${currentIndex * (100 / visibleCount)}%)` }"
          >
            <div
              v-for="(pkg, index) in displayPackages"
              :key="`${pkg.id}-${index}`"
              class="flex-shrink-0 px-3"
              :style="{ width: `${100 / visibleCount}%` }"
            >
              <PackageCard :package="pkg" />
            </div>
          </div>
        </div>

        <button
          class="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center text-gray-600 hover:text-primary hover:border-primary transition-colors disabled:opacity-30"
          :disabled="currentIndex === 0"
          @click="prev"
          aria-label="Previous"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>

        <button
          class="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center text-gray-600 hover:text-primary hover:border-primary transition-colors disabled:opacity-30"
          :disabled="currentIndex >= maxIndex"
          @click="next"
          aria-label="Next"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
          </svg>
        </button>

        <div class="flex justify-center gap-2 mt-8">
          <button
            v-for="i in maxIndex + 1"
            :key="i"
            class="h-2 rounded-full transition-all duration-300"
            :class="currentIndex === i - 1 ? 'bg-primary w-6' : 'bg-gray-300 w-2 hover:bg-gray-400'"
            @click="goTo(i - 1)"
            :aria-label="`Go to slide ${i}`"
          />
        </div>
      </div>

      <div class="text-center mt-12 reveal">
        <button class="btn-secondary">Explore All Destinations</button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import PackageCard from './PackageCard.vue'
import { useGeneralService } from '../services/general.service'

const rawPackages = ref([])
const loading = ref(true)
const error = ref(false)
const generalService = useGeneralService()
const currentIndex = ref(0)
const AUTOPLAY_MS = 4000
let timer = null

const visibleCount = computed(() => {
  if (typeof globalThis === 'undefined') return 3
  if (globalThis.innerWidth >= 1024) return 3
  if (globalThis.innerWidth >= 768)  return 2
  return 1
})

const displayPackages = computed(() =>
  displayList.value.length ? displayList.value : samplePackages
)

const maxIndex = computed(() =>
  Math.max(0, displayPackages.value.length - visibleCount.value)
)

function next() { if (currentIndex.value < maxIndex.value) currentIndex.value++ }
function prev() { if (currentIndex.value > 0) currentIndex.value-- }
function goTo(i) { currentIndex.value = i }

function startCarousel() {
  timer = setInterval(() => {
    if (currentIndex.value < maxIndex.value) {
      next()
    } else {
      currentIndex.value = 0
    }
  }, AUTOPLAY_MS)
}

function pauseCarousel() { clearInterval(timer) }
function resumeCarousel() { startCarousel() }

function toTitleCase(str) {
  return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
}

function mapPackage(pkg) {
  return {
    id: pkg.id,
    package_name: pkg.package_name,
    location: toTitleCase(pkg.location || pkg.country_code || ''),
    category: toTitleCase(pkg.category || ''),
    poster: pkg.poster,
    picture1: pkg.picture1, picture2: pkg.picture2,
    picture3: pkg.picture3, picture4: pkg.picture4,
    banner: pkg.banner,
    price: pkg.price ?? null,
    oldPrice: pkg.old_price ?? pkg.oldPrice ?? null,
    discount: pkg.discount ?? null,
    rating: pkg.rating ?? null,
    duration: pkg.duration ?? null,
    type: pkg.type ?? null,
    inclusions: pkg.inclusions || '',
    description: pkg.description || '',
    exclusions: pkg.exclusions || '',
    terms: pkg.terms || '',
  }
}

const displayList = computed(() =>
  rawPackages.value
    .filter(pkg => pkg.status === 1)
    .slice(0, 9)
    .map(mapPackage)
)

async function fetchPackages() {
  loading.value = true
  error.value = false
  try {
    const data = await generalService.getPackages('all')
    const list = Array.isArray(data) ? data : (data?.data ?? data ?? [])
    if (!Array.isArray(list) || !list.length) throw new Error('Empty or invalid response')
    rawPackages.value = list
  } catch (err) {
    console.error('FeaturedPackages fetch error:', err)
    error.value = true
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await fetchPackages()
  startCarousel()
})

onUnmounted(() => clearInterval(timer))

const samplePackages = [
  {
    id: 1,
    package_name: 'Explore Dubai: 4 Nights 5 Days',
    country_code: 'ARE', category: 'TOURISM', location: 'UNITED ARAB EMIRATES', status: 1,
    inclusions: `3 Night stay in 4* hotel\nDaily Breakfast\nBurj Khalifa + Dubai Aquarium\nEvening Desert Safari with BBQ Dinner\nDubai city Tours\n2 Hours Dinner cruise Marina Dubai\nAirport transfers\n30 days Visa + Insurance`,
    poster: 'https://images.unsplash.com/photo-1643904736472-8b77e93ca3d7?w=800&q=80',
    picture1: null, picture2: null, picture3: null, picture4: null, banner: null,
    price: 3999, rating: 4.9,
  },
  {
    id: 2,
    package_name: 'Maldives Paradise - Luxury Beach Escape',
    country_code: 'MDV', category: 'TOURISM', location: 'MALDIVES', status: 1,
    inclusions: `6 Nights overwater bungalow\nAll meals included\nSnorkelling & diving excursions\nPrivate sunset cruise\nAirport speedboat transfers\nTravel insurance`,
    poster: 'https://images.unsplash.com/photo-1637576308588-6647bf80944d?w=800&q=80',
    picture1: null, picture2: null, picture3: null, picture4: null, banner: null,
    price: 8999, rating: 4.9,
  },
  {
    id: 3,
    package_name: 'Premium Umrah Package - Complete Spiritual Journey',
    country_code: 'SAU', category: 'UMRAH', location: 'SAUDI ARABIA', status: 1,
    inclusions: `9 Nights hotel in Mecca & Medina\nReturn flights\nVisa processing\nGroup Ziyarah tours\nDaily breakfast & dinner\nDedicated tour guide`,
    poster: 'https://images.unsplash.com/photo-1641108548286-6952aa3e3e3f?w=800&q=80',
    picture1: null, picture2: null, picture3: null, picture4: null, banner: null,
    price: 5499, rating: 4.9,
  },
  {
    id: 4,
    package_name: 'Turkish Delight - Istanbul & Cappadocia',
    country_code: 'TUR', category: 'TOURISM', location: 'TURKEY', status: 1,
    inclusions: `5 Nights hotel accommodation\nHot air balloon ride in Cappadocia\nBosphorus cruise\nGuided city tours\nDaily breakfast\nVisa support`,
    poster: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&q=80',
    picture1: null, picture2: null, picture3: null, picture4: null, banner: null,
    price: 4299, rating: 4.9,
  },
  {
    id: 5,
    package_name: 'Abu Dhabi Cultural Journey',
    country_code: 'ARE', category: 'TOURISM', location: 'ABU DHABI, UAE', status: 1,
    inclusions: `2 Nights 4* hotel\nSheikh Zayed Grand Mosque tour\nLouvre Abu Dhabi entry\nFerrari World ticket\nAirport transfers\nBreakfast daily`,
    poster: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=800&q=80',
    picture1: null, picture2: null, picture3: null, picture4: null, banner: null,
    price: 2499, rating: 4.9,
  },
  {
    id: 6,
    package_name: 'Egypt Pyramids & Nile Cruise',
    country_code: 'EGY', category: 'TOURISM', location: 'EGYPT', status: 1,
    inclusions: `7 Nights accommodation + cruise\nPyramids of Giza & Sphinx entry\n4-Night Nile cruise\nLuxor & Karnak temple tours\nAll meals on cruise\nVisa on arrival support`,
    poster: 'https://images.unsplash.com/photo-1539768942893-daf53e448371?w=800&q=80',
    picture1: null, picture2: null, picture3: null, picture4: null, banner: null,
    price: 3799, rating: 4.9,
  },
]
</script>