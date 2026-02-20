<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ToursForm from '../../../components/forms/ToursForm.vue'
import { MapPin } from 'lucide-vue-next'
import Pagination from '../../../components/Pagination.vue'

const route  = useRoute()
const router = useRouter()

const tourResults    = ref<any[]>([])
const isLoading      = ref(false)
const hasSearched    = ref(false)
const showSearchForm = ref(true)
const currentPage    = ref(1)
const itemsPerPage   = 10

const paginatedResults = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return tourResults.value.slice(start, start + itemsPerPage)
})

const popularDestinations = [
  { city: 'Dubai',     country: 'UAE',          image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800', price: 'From ₦150,000' },
  { city: 'Paris',     country: 'France',        image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800', price: 'From ₦200,000' },
  { city: 'Tokyo',     country: 'Japan',         image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800', price: 'From ₦250,000' },
  { city: 'Cape Town', country: 'South Africa',  image: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800', price: 'From ₦120,000' },
  { city: 'Istanbul',  country: 'Turkey',        image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800', price: 'From ₦140,000' },
  { city: 'Bali',      country: 'Indonesia',     image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800', price: 'From ₦180,000' },
]

const benefits = [
  { icon: '✓', title: 'Expert Guides',         description: 'Professional local guides for authentic experiences' },
  { icon: '✓', title: '24/7 Support',           description: 'Our team is available round the clock to assist you' },
  { icon: '✓', title: 'Best Price Guarantee',   description: 'Competitive prices on all tour packages' },
  { icon: '✓', title: 'Flexible Booking',       description: 'Easy modifications and cancellations on your bookings' },
]

const tourTypes = ['City Tour', 'Cultural Tour', 'Adventure Tour', 'Food Tour', 'Historical Tour', 'Nature Tour']
const durations = ['Half Day', 'Full Day', '2 Days', '3 Days']

// ── Search ─────────────────────────────────────────────────────────────────────
const searchTours = async (params?: any) => {
  isLoading.value   = true
  hasSearched.value = true

  const sp = params || {
    country: route.query.country,
    city: route.query.city,
    date: route.query.date,
    adults: Number.parseInt(route.query.adults as string) || 1,
    children: Number.parseInt(route.query.children as string) || 0,
    infants: Number.parseInt(route.query.infants as string) || 0,
  }

  // Replace with real Rayna Tours search API:
  // GET https://api.raynatours.com/tours/search
  // Params: { city, country, date, adults, children, infants }
  // Returns: array of tours; each tour has a tourId used to fetch packages in the booking flow
  setTimeout(() => {
    tourResults.value = Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      name: `${sp.city || 'Dubai'} ${tourTypes[i % tourTypes.length]}`,
      city: sp.city || 'Dubai',
      country: sp.country || 'UAE',
      type: tourTypes[i % tourTypes.length],
      duration: durations[i % durations.length],
      rating: (Math.random() * 2 + 3).toFixed(1),
      reviews: Math.floor(Math.random() * 500) + 50,
      price: Math.floor(Math.random() * 100000) + 50000,
      image: `https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800`,
      highlights: ['Expert Guide', 'Transport', 'Entry Tickets', 'Meals Included'].slice(0, Math.floor(Math.random() * 3) + 2),
      date: sp.date,
      adults: sp.adults,
      children: sp.children,
      infants: sp.infants,
      availableSpots: Math.floor(Math.random() * 15) + 5,
    }))
    isLoading.value = false
    currentPage.value = 1
    setTimeout(() => document.getElementById('search-results')?.scrollIntoView({ behavior: 'smooth' }), 100)
  }, 1500)
}

// ── Navigate to booking flow ───────────────────────────────────────────────────
function bookTour(tour: any) {
  sessionStorage.setItem('selectedTour', JSON.stringify({
    tour,
    searchParams: {
      city: (route.query.city as string) || tour.city,
      country: (route.query.country as string) || tour.country,
      date: (route.query.date as string) || tour.date,
      adults: tour.adults ?? (Number.parseInt(route.query.adults as string) || 1),
      children: tour.children ?? (Number.parseInt(route.query.children as string) || 0),
      infants: tour.infants ?? (Number.parseInt(route.query.infants as string) || 0),
    },
  }))

  router.push({
    path:  '/travel/tours/booking',
    query: { tourId: String(tour.id), step: '1' },
  })
}

const handlePageChange  = (page: number) => { currentPage.value = page }
const toggleSearchForm  = () => { showSearchForm.value = !showSearchForm.value }
const handleTourSearch  = (data: any) => searchTours(data)

watch(
  () => route.query,
  (q) => { if (q.city) searchTours() },
  { immediate: true }
)

onMounted(() => {
  const observer = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('reveal-visible'); observer.unobserve(e.target) }
    }),
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  )
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el))
})

const formatPrice = (price: number) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price)
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
        <div v-if="isLoading" class="text-center py-20">
          <div class="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-gray-900"></div>
          <p class="mt-4 text-lg text-gray-600">Searching Rayna Tours…</p>
        </div>

        <!-- Results header -->
        <div v-else-if="tourResults.length > 0" class="mb-8">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <h2 class="text-2xl md:text-3xl font-bold text-gray-900">
              Available Tours ({{ tourResults.length }})
            </h2>
            <select class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 self-start md:self-auto">
              <option>Sort by: Price (Low to High)</option>
              <option>Sort by: Price (High to Low)</option>
              <option>Sort by: Rating</option>
              <option>Sort by: Duration</option>
            </select>
          </div>
          <p class="text-gray-600">
            Tours in <strong>{{ paginatedResults[0]?.city }}</strong>, {{ paginatedResults[0]?.country }}
            · {{ paginatedResults[0]?.adults }} adult{{ paginatedResults[0]?.adults !== 1 ? 's' : '' }}
            <template v-if="paginatedResults[0]?.children > 0"> · {{ paginatedResults[0]?.children }} child{{ paginatedResults[0]?.children !== 1 ? 'ren' : '' }}</template>
            <template v-if="paginatedResults[0]?.infants > 0"> · {{ paginatedResults[0]?.infants }} infant{{ paginatedResults[0]?.infants !== 1 ? 's' : '' }}</template>
          </p>
        </div>

        <!-- Tour cards -->
        <div v-if="!isLoading && paginatedResults.length > 0" class="grid gap-6">
          <div
            v-for="(tour, index) in paginatedResults"
            :key="tour.id"
            class="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
            :style="{ transitionDelay: `${index * 50}ms` }"
          >
            <div class="flex flex-col md:flex-row">

              <!-- Image -->
              <div class="md:w-1/3 shrink-0">
                <img :src="tour.image" :alt="tour.name" class="w-full h-64 md:h-full object-cover"/>
              </div>

              <!-- Info -->
              <div class="flex-1 p-6">
                <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div class="flex-1">

                    <div class="flex items-start gap-3 mb-2">
                      <div class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                        <MapPin class="w-6 h-6 text-gray-600"/>
                      </div>
                      <div>
                        <h3 class="text-xl font-bold text-gray-900">{{ tour.name }}</h3>
                        <p class="text-sm text-gray-600">{{ tour.city }}, {{ tour.country }}</p>
                      </div>
                    </div>

                    <div class="flex items-center gap-4 mb-3">
                      <div class="flex items-center gap-1">
                        <span class="text-yellow-500">★</span>
                        <span class="font-semibold">{{ tour.rating }}</span>
                      </div>
                      <span class="text-gray-600 text-sm">({{ tour.reviews }} reviews)</span>
                      <span class="px-3 py-1 bg-purple-50 text-purple-700 text-xs rounded-full">{{ tour.duration }}</span>
                    </div>

                    <!-- Highlights -->
                    <div class="flex flex-wrap gap-2 mb-4">
                      <span
                        v-for="h in tour.highlights" :key="h"
                        class="px-3 py-1 bg-green-50 text-green-700 text-xs rounded-full"
                      >✓ {{ h }}</span>
                    </div>

                    <!-- Meta row -->
                    <div class="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                      <span class="text-green-600 font-medium">{{ tour.availableSpots }} spots left</span>
                      <span class="text-gray-300">·</span>
                      <span class="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">{{ tour.type }}</span>
                      <span class="text-gray-300">·</span>
                      <span>{{ tour.adults }} adult{{ tour.adults !== 1 ? 's' : '' }}<template v-if="tour.children > 0">, {{ tour.children }} child{{ tour.children !== 1 ? 'ren' : '' }}</template><template v-if="tour.infants > 0">, {{ tour.infants }} infant{{ tour.infants !== 1 ? 's' : '' }}</template></span>
                    </div>
                  </div>

                  <!-- Price + CTA -->
                  <div class="md:text-right border-t md:border-t-0 md:border-l md:pl-6 pt-4 md:pt-0 shrink-0">
                    <p class="text-sm text-gray-600 mb-1">From</p>
                    <p class="text-3xl font-bold text-gray-900 mb-1">{{ formatPrice(tour.price) }}</p>
                    <p class="text-xs text-gray-500 mb-4">per adult</p>
                    <button
                      class="w-full md:w-auto px-8 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors cursor-pointer border-none"
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
          v-if="!isLoading && tourResults.length > itemsPerPage"
          :total-items="tourResults.length"
          :items-per-page="itemsPerPage"
          :current-page="currentPage"
          @page-change="handlePageChange"
        />

        <!-- No results -->
        <div v-if="!isLoading && tourResults.length === 0" class="text-center py-20">
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
</style>

