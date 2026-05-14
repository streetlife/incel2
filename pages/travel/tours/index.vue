<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ToursForm from '../../../components/forms/ToursForm.vue'
import Pagination from '../../../components/Pagination.vue'
import { useTour } from '../../../composables/useTour'

const route = useRoute()
const router = useRouter()

const { searchResults, searchLoading, searchError, hasSearched, fetchCountries, searchTours } = useTour()

const showSearchForm = ref(true)
const currentPage = ref(1)
const itemsPerPage = 10

const paginatedResults = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return searchResults.value.slice(start, start + itemsPerPage)
})

const popularDestinations = [
  { city: 'Dubai', country: 'UAE', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800', price: 'From ₦150,000' },
  { city: 'Paris', country: 'France', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800', price: 'From ₦200,000' },
  { city: 'Tokyo', country: 'Japan', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800', price: 'From ₦250,000' },
  { city: 'Cape Town', country: 'South Africa', image: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800', price: 'From ₦120,000' },
  { city: 'Istanbul',  country: 'Turkey',        image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800', price: 'From ₦140,000' },
  { city: 'Bali',      country: 'Indonesia',     image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800', price: 'From ₦180,000' },
]

const benefits = [
  { icon: '✓', title: 'Expert Guides', description: 'Professional local guides for authentic experiences' },
  { icon: '✓', title: '24/7 Support', description: 'Our team is available round the clock to assist you' },
  { icon: '✓', title: 'Best Price Guarantee', description: 'Competitive prices on all tour packages' },
  { icon: '✓', title: 'Flexible Booking', description: 'Easy modifications and cancellations on your bookings' },
]

// ── Search ─────────────────────────────────────────────────────────────────────
const runSearch = async (params?: any) => {
  const countryId = params?.countryId ?? (Number.parseInt(route.query.country_id as string) || 0)
  const cityId  = params?.cityId ?? (Number.parseInt(route.query.city_id as string) || 0)
  const date = params?.date ?? ((route.query.date as string) || '')

  if (!countryId || !cityId || !date) return

  currentPage.value = 1
  await searchTours({ country_id: countryId, city_id: cityId, date })
  setTimeout(() => document.getElementById('search-results')?.scrollIntoView({ behavior: 'smooth' }), 100)
}

// ── Navigate to booking flow ───────────────────────────────────────────────────
function bookTour(tour: any) {
  sessionStorage.setItem('selectedTour', JSON.stringify({
    tour: {
      id: tour.tourId,
      name: tour.tourName,
      city: tour.cityName,
      country: tour.countryName,
      countryId: tour.countryId,
      cityId: tour.cityId,
      image: getTourImage(tour),
      type: tour.cityTourType,
      duration: tour.duration,
      contractId: tour.contractId,
      cancellationPolicyName: tour.cancellationPolicyName,
      tourDescription: tour.tourDescription,
      tourShortDescription: tour.tourShortDescription,
      tourInclusion: tour.tourInclusion,
      tourExclusion: tour.tourExclusion,
      tourImages: tour.tourImages,
      tourReview: tour.tourReview,
      reportingTime: tour.reportingTime,
      startTime: tour.startTime,
      rating: tour.rating,
      reviewCount: tour.reviewCount,
    },
    searchParams: {
      city: tour.cityName,
      country: tour.countryName,
      date: route.query.date as string || '',
      adults: Number.parseInt(route.query.adults as string) || 1,
      children: Number.parseInt(route.query.children as string) || 0,
      infants: Number.parseInt(route.query.infants as string) || 0,
    },
  }))

  router.push({
    path:  '/travel/tours/booking',
    query: { tourId: String(tour.tourId), step: '1' },
  })
}

const handlePageChange = (page: number) => { currentPage.value = page }
const toggleSearchForm = () => { showSearchForm.value = !showSearchForm.value }
const handleTourSearch = (data: any) => runSearch(data)

// Helper to get the best image for a tour
const getTourImage = (tour: any): string => {
  const front = tour.tourImages?.find((img: any) => img.isFrontImage === 1)
  return front?.imagePath || tour.imagePath || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800'
}

// Strip HTML tags for plain text display
const stripHtml = (html: string) => html?.replace(/<[^>]*>/g, '').trim() || ''

watch(
  () => route.query,
  (q) => { if (q.country_id && q.city_id && q.date) runSearch() },
  { immediate: true }
)

onMounted(async () => {
  await fetchCountries()
  const observer = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('reveal-visible'); observer.unobserve(e.target) }
    }),
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  )
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el))
})
</script>

<template>
  <div class="min-h-screen">

    <!-- ── Hero + Search ───────────────────────────────────────────────────── -->
    <section
      class="relative pt-36 pb-24 px-6 bg-cover bg-center bg-no-repeat transition-all duration-500"
      style="background-image: url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600')"
    >
      <div class="absolute inset-0 bg-black/40"></div>
      <div class="relative z-10 max-w-7xl mx-auto">

        <div class="text-center reveal transition-all duration-500" :class="hasSearched ? 'mb-6' : 'mb-12'">
          <h1
            class="font-bold mb-4 text-white transition-all duration-500"
            :class="hasSearched ? 'text-3xl md:text-4xl' : 'text-4xl md:text-5xl'"
          >
            {{ hasSearched ? 'Search Tours' : 'Discover Amazing Tours' }}
          </h1>
          <p v-if="!hasSearched" class="text-xl text-gray-100">Explore the world with our curated tour experiences</p>
        </div>

        <div class="mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
          <button
            v-if="hasSearched"
            class="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between cursor-pointer border-none"
            @click="toggleSearchForm"
          >
            <span class="font-semibold text-gray-900">{{ showSearchForm ? 'Hide Search Form' : 'Modify Search' }}</span>
            <svg class="w-5 h-5 transition-transform duration-300" :class="{ 'rotate-180': showSearchForm }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
          <div v-show="!hasSearched || showSearchForm" class="p-6 md:p-8">
            <ToursForm @search="handleTourSearch" />
          </div>
        </div>
      </div>
    </section>

    <!-- ── Search Results ─────────────────────────────────────────────────── -->
    <section v-if="hasSearched" id="search-results" class="py-16 px-6 bg-gray-50">
      <div class="max-w-7xl mx-auto">

        <!-- Loading -->
        <div v-if="searchLoading" class="text-center py-20">
          <div class="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-gray-900"></div>
          <p class="mt-4 text-lg text-gray-600">Searching tours…</p>
        </div>

        <!-- Error -->
        <div v-else-if="searchError" class="text-center py-20">
          <div class="text-6xl mb-4">⚠️</div>
          <h3 class="text-2xl font-bold text-gray-900 mb-2">Search Failed</h3>
          <p class="text-gray-600 mb-6">{{ searchError }}</p>
          <button class="px-8 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors cursor-pointer border-none" @click="toggleSearchForm">
            Try Again
          </button>
        </div>

        <!-- Results header -->
        <div v-else-if="searchResults.length > 0" class="mb-8">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
            <h2 class="text-2xl md:text-3xl font-bold text-gray-900">
              {{ searchResults.length }} Tour{{ searchResults.length !== 1 ? 's' : '' }} Found
            </h2>
          </div>
          <p class="text-gray-600">
            In <strong>{{ searchResults[0]?.cityName }}</strong>, {{ searchResults[0]?.countryName }}
            · {{ route.query.date }}
          </p>
        </div>

        <!-- Tour cards -->
        <div v-if="!searchLoading && paginatedResults.length > 0" class="grid gap-6">
          <div
            v-for="(tour, index) in paginatedResults"
            :key="tour.tourId"
            class="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
            :style="{ transitionDelay: `${index * 40}ms` }"
          >
            <div class="flex flex-col md:flex-row">

              <!-- Image -->
              <div class="md:w-72 shrink-0 relative overflow-hidden">
                <img
                  :src="getTourImage(tour)"
                  :alt="tour.tourName"
                  class="w-full h-56 md:h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <!-- Category badge -->
                <span class="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-xs font-semibold text-gray-800 px-2.5 py-1 rounded-full">
                  {{ tour.cityTourType }}
                </span>
              </div>

              <!-- Info -->
              <div class="flex-1 p-6 flex flex-col justify-between">
                <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div class="flex-1 min-w-0">

                    <!-- Name + location -->
                    <div class="mb-3">
                      <h3 class="text-xl font-bold text-gray-900 leading-snug mb-1">{{ tour.tourName }}</h3>
                      <p class="text-sm text-gray-500 flex items-center gap-1">
                        <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                        {{ tour.cityName }}, {{ tour.countryName }}
                      </p>
                    </div>

                    <!-- Rating + duration -->
                    <div class="flex flex-wrap items-center gap-3 mb-3">
                      <div class="flex items-center gap-1">
                        <div class="flex">
                          <span v-for="i in 5" :key="i" class="text-sm" :class="i <= Math.round(tour.rating) ? 'text-yellow-400' : 'text-gray-200'">★</span>
                        </div>
                        <span class="text-sm font-semibold text-gray-800 ml-1">{{ tour.rating }}</span>
                        <span class="text-xs text-gray-500">({{ tour.reviewCount }} reviews)</span>
                      </div>
                      <span class="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full flex items-center gap-1">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
                        {{ tour.duration }}
                      </span>
                      <span v-if="tour.tourLanguage" class="px-2.5 py-1 bg-slate-50 text-slate-600 text-xs font-medium rounded-full">
                        🌐 {{ tour.tourLanguage }}
                      </span>
                    </div>

                    <!-- Short description -->
                    <p class="text-sm text-gray-600 mb-4 line-clamp-2">{{ stripHtml(tour.tourShortDescription) }}</p>

                    <!-- Key info chips -->
                    <div class="flex flex-wrap gap-2 mb-2">
                      <span v-if="tour.startTime" class="flex items-center gap-1 text-xs text-green-700 bg-green-50 border border-green-100 px-2.5 py-1 rounded-lg">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
                        Starts {{ tour.startTime }}
                      </span>
                      <span class="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-lg">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                        {{ tour.cancellationPolicyName }}
                      </span>
                    </div>
                  </div>

                  <!-- CTA -->
                  <div class="shrink-0 md:text-right md:border-l md:pl-6 border-t md:border-t-0 pt-4 md:pt-0 min-w-[160px]">
                    <p class="text-xs text-gray-500 mb-1">Starting from</p>
                    <p class="text-lg font-bold text-gray-500 mb-1 italic text-xs">Contact for price</p>
                    <button
                      class="w-full mt-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-primary transition-colors cursor-pointer border-none text-sm"
                      @click="bookTour(tour)"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <Pagination
          v-if="!searchLoading && searchResults.length > itemsPerPage"
          :total-items="searchResults.length"
          :items-per-page="itemsPerPage"
          :current-page="currentPage"
          @page-change="handlePageChange"
        />

        <!-- No results -->
        <div v-if="!searchLoading && !searchError && searchResults.length === 0" class="text-center py-20">
          <div class="text-6xl mb-4">🗺️</div>
          <h3 class="text-2xl font-bold text-gray-900 mb-2">No Tours Found</h3>
          <p class="text-gray-600 mb-6">We couldn't find any tours matching your search. Try adjusting your date or location.</p>
          <button class="px-8 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors cursor-pointer border-none" @click="toggleSearchForm">
            Modify Search
          </button>
        </div>
      </div>
    </section>

    <!-- ── Popular Destinations ─────────────────────────────────────────────── -->
    <section v-if="!hasSearched" class="py-16 px-6">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-12 reveal">
          <h2 class="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Popular Tour Destinations</h2>
          <p class="text-lg text-gray-600">Explore our most sought-after tour experiences</p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="(dest, i) in popularDestinations" :key="dest.city"
            class="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer reveal"
            :style="{ transitionDelay: `${i * 100}ms` }"
          >
            <img :src="dest.image" :alt="dest.city" class="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"/>
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            <div class="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h3 class="text-2xl font-bold mb-1">{{ dest.city }}</h3>
              <p class="text-gray-200 mb-1">{{ dest.country }}</p>
              <p class="text-lg font-semibold">{{ dest.price }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Why Choose Us ───────────────────────────────────────────────────── -->
    <section class="py-16 px-6" :class="hasSearched ? 'bg-white' : 'bg-gray-50'">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-12 reveal">
          <h2 class="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Why Book With Us</h2>
          <p class="text-lg text-gray-600">Experience unforgettable tours with exclusive benefits</p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            v-for="(b, i) in benefits" :key="b.title"
            class="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 reveal"
            :style="{ transitionDelay: `${i * 100}ms` }"
          >
            <div class="text-4xl mb-4 text-gray-900">{{ b.icon }}</div>
            <h3 class="text-xl font-bold mb-2 text-gray-900">{{ b.title }}</h3>
            <p class="text-gray-600">{{ b.description }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.reveal { opacity: 0; transform: translateY(30px); transition: opacity 0.6s ease-out, transform 0.6s ease-out; }
.reveal-visible { opacity: 1; transform: translateY(0); }
.line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
</style>

