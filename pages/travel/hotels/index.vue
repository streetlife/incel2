<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import HotelsForm from '../../../components/forms/HotelsForm.vue'
import { Building2 } from 'lucide-vue-next'
import Pagination from '../../../components/Pagination.vue'

const route  = useRoute()
const router = useRouter()

const hotelResults   = ref<any[]>([])
const isLoading      = ref(false)
const hasSearched    = ref(false)
const showSearchForm = ref(true)
const currentPage    = ref(1)
const itemsPerPage   = 10

const paginatedResults = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return hotelResults.value.slice(start, start + itemsPerPage)
})

const popularDestinations = [
  { city: 'Dubai', image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800', price: 'From ₦25,000/night' },
  { city: 'London', image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', price: 'From ₦35,000/night' },
  { city: 'Paris', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800', price: 'From ₦40,000/night' },
  { city: 'New York', image: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800', price: 'From ₦50,000/night' },
  { city: 'Istanbul', image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800', price: 'From ₦20,000/night' },
  { city: 'Cape Town', image: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800', price: 'From ₦18,000/night' },
]

const benefits = [
  { icon: '✓', title: 'Best Price Guarantee', description: 'We offer competitive prices on all hotel bookings' },
  { icon: '✓', title: '24/7 Support', description: 'Our team is available round the clock to assist you' },
  { icon: '✓', title: 'Free Cancellation', description: 'Cancel up to 24 hours before check-in on most hotels' },
  { icon: '✓', title: 'Verified Reviews', description: 'Read authentic reviews from real travelers' },
]

const hotelNames = ['Grand Hotel', 'Luxury Suites', 'Royal Palace', 'City View Hotel', 'Beach Resort', 'Mountain Lodge']
const hotelTypes = ['Hotel', 'Resort', 'Apartment', 'Villa', 'Guesthouse']

const searchHotels = async (params?: any) => {
  isLoading.value   = true
  hasSearched.value = true

  const buildRoomsFromQuery = () => {
    const roomCount = Number.parseInt(route.query.rooms as string) || 1
    return Array.from({ length: roomCount }, (_, i) => ({
      adults:   Number.parseInt(route.query[`r${i}_adults`]   as string) || 1,
      children: Number.parseInt(route.query[`r${i}_children`] as string) || 0,
      infants:  Number.parseInt(route.query[`r${i}_infants`]  as string) || 0,
    }))
  }

  const sp = params || {
    city:         route.query.city,
    nationality:  route.query.nationality,
    checkInStart: route.query.checkInStart,
    checkInEnd:   route.query.checkInEnd,
    rooms:        buildRoomsFromQuery(),
    totalGuests:  Number.parseInt(route.query.totalGuests as string) || 1,
    totalRooms:   Number.parseInt(route.query.rooms as string) || 1,
  }

  // Replace setTimeout with real Rezlive availability call:
  // POST https://api.rezlive.com/hotel/availability
  // { city, checkIn, checkOut, rooms, nationality }
  // Response includes hotels with all possible room/board combinations pre-attached.
  // The room combinations are shown in Step 1 of the booking flow (HotelRoomSelect).
  setTimeout(() => {
    hotelResults.value = Array.from({ length: 50 }, (_, i) => ({
      id:          i + 1,
      name:        `${hotelNames[i % hotelNames.length]} ${hotelTypes[i % hotelTypes.length]}`,
      city:        sp.city || 'Dubai',
      rating:      (Math.random() * 2 + 3).toFixed(1),
      reviews:     Math.floor(Math.random() * 1000) + 100,
      price:       Math.floor(Math.random() * 50000) + 20000,
      image:       'https://www.orchidhotel.com/static/website/img/hotels/panchgani/homepage_slider/homepage_slider.webp',
      amenities:   ['Free WiFi', 'Pool', 'Gym', 'Breakfast'].slice(0, Math.floor(Math.random() * 3) + 2),
      checkIn:     sp.checkInStart,
      checkOut:    sp.checkInEnd,
      rooms:       sp.rooms,
      totalGuests: sp.totalGuests,
      totalRooms:  sp.totalRooms,
    }))
    isLoading.value   = false
    currentPage.value = 1
    setTimeout(() => document.getElementById('search-results')?.scrollIntoView({ behavior: 'smooth' }), 100)
  }, 1500)
}

// ── Navigate to booking flow ───────────────────────────────────────────────────
// Stores the selected hotel + search context in sessionStorage so the booking
// page can hydrate the store on mount (survives hard refresh within the flow).
function viewHotelDetails(hotel: any) {
  sessionStorage.setItem('selectedHotel', JSON.stringify({
    hotel,
    searchParams: {
      city: (route.query.city as string) || hotel.city,
      nationality: (route.query.nationality as string) || '',
      checkInStart: (route.query.checkInStart as string) || hotel.checkIn,
      checkInEnd: (route.query.checkInEnd as string) || hotel.checkOut,
      rooms: hotel.rooms || [{ adults: 1, children: 0, infants: 0 }],
      totalGuests: hotel.totalGuests || 1,
      totalRooms:   hotel.totalRooms  || 1,
    },
  }))
  router.push({
    path:  '/travel/hotels/booking',
    query: { hotelId: String(hotel.id), step: '1' },
  })
}

const handlePageChange = (page: number) => { currentPage.value = page }
const toggleSearchForm = () => { showSearchForm.value = !showSearchForm.value }
const handleHotelSearch = (data: any) => searchHotels(data)

watch(
  () => route.query,
  (q) => { if (q.city) searchHotels() },
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

const calculateNights = (checkIn: string, checkOut: string) => {
  if (!checkIn || !checkOut) return 1
  const diff = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000)
  return diff > 0 ? diff : 1
}
</script>

<template>
  <div class="min-h-screen">

    <!-- ── Hero + Search Form ──────────────────────────────────────────────── -->
    <section
      class="relative pt-36 pb-24 px-6 bg-cover bg-center bg-no-repeat transition-all duration-500"
      style="background-image: url('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600')"
    >
      <div class="absolute inset-0 bg-black/40"></div>

      <div class="relative z-10 max-w-7xl mx-auto">
        <div class="text-center reveal transition-all duration-500" :class="hasSearched ? 'mb-6' : 'mb-12'">
          <h1
            class="font-bold mb-4 text-white transition-all duration-500"
            :class="hasSearched ? 'text-3xl md:text-4xl' : 'text-4xl md:text-5xl'"
          >
            {{ hasSearched ? 'Search Hotels' : 'Book Your Next Hotel' }}
          </h1>
          <p v-if="!hasSearched" class="text-xl text-gray-100">Find the best deals on hotels worldwide</p>
        </div>

        <div class="mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
          <button
            v-if="hasSearched"
            class="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between cursor-pointer border-none"
            @click="toggleSearchForm"
          >
            <span class="font-semibold text-gray-900">{{ showSearchForm ? 'Hide Search Form' : 'Modify Search' }}</span>
            <svg class="w-5 h-5 transition-transform duration-300" :class="{ 'rotate-180': showSearchForm }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <div v-show="!hasSearched || showSearchForm" class="p-6 md:p-8">
            <HotelsForm @search="handleHotelSearch" />
          </div>
        </div>
      </div>
    </section>

    <!-- ── Search Results ──────────────────────────────────────────────────── -->
    <section v-if="hasSearched" id="search-results" class="py-16 px-6 bg-gray-50">
      <div class="max-w-7xl mx-auto">

        <!-- Loading -->
        <div v-if="isLoading" class="text-center py-20">
          <div class="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-gray-900"></div>
          <p class="mt-4 text-lg text-gray-600">Searching for the best hotels…</p>
        </div>

        <!-- Results header -->
        <div v-else-if="hotelResults.length > 0" class="mb-8">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
            <h2 class="text-2xl md:text-3xl font-bold text-gray-900">
              Available Hotels ({{ hotelResults.length }})
            </h2>
            <select class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 self-start md:self-auto">
              <option>Sort by: Price (Low to High)</option>
              <option>Sort by: Price (High to Low)</option>
              <option>Sort by: Rating</option>
              <option>Sort by: Reviews</option>
            </select>
          </div>
          <p class="text-gray-600">
            Showing hotels in <strong>{{ paginatedResults[0]?.city }}</strong>
            · {{ paginatedResults[0]?.totalRooms }} room{{ paginatedResults[0]?.totalRooms !== 1 ? 's' : '' }}
            · {{ paginatedResults[0]?.totalGuests }} guest{{ paginatedResults[0]?.totalGuests !== 1 ? 's' : '' }}
          </p>
        </div>

        <!-- Hotel cards -->
        <div v-if="!isLoading && paginatedResults.length > 0" class="grid gap-6">
          <div
            v-for="(hotel, index) in paginatedResults"
            :key="hotel.id"
            class="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
            :style="{ transitionDelay: `${index * 50}ms` }"
          >
            <div class="flex flex-col md:flex-row">
              <div class="md:w-1/3 shrink-0">
                <img :src="hotel.image" :alt="hotel.name" class="w-full h-64 md:h-full object-cover" />
              </div>

              <div class="flex-1 p-6">
                <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div class="flex-1">
                    <div class="flex items-start gap-3 mb-2">
                      <div class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                        <Building2 class="w-6 h-6 text-gray-600" />
                      </div>
                      <div>
                        <h3 class="text-xl font-bold text-gray-900">{{ hotel.name }}</h3>
                        <p class="text-sm text-gray-600">{{ hotel.city }}</p>
                      </div>
                    </div>

                    <div class="flex items-center gap-2 mb-3">
                      <span class="text-yellow-500">★</span>
                      <span class="font-semibold">{{ hotel.rating }}</span>
                      <span class="text-gray-600 text-sm">({{ hotel.reviews }} reviews)</span>
                    </div>

                    <div class="flex flex-wrap gap-2 mb-4">
                      <span
                        v-for="amenity in hotel.amenities" :key="amenity"
                        class="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                      >{{ amenity }}</span>
                    </div>

                    <div class="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                      <span>{{ calculateNights(hotel.checkIn, hotel.checkOut) }} night{{ calculateNights(hotel.checkIn, hotel.checkOut) > 1 ? 's' : '' }}</span>
                      <span class="text-gray-300">·</span>
                      <span>{{ hotel.totalRooms }} room{{ hotel.totalRooms !== 1 ? 's' : '' }}</span>
                      <span class="text-gray-300">·</span>
                      <span>{{ hotel.totalGuests }} guest{{ hotel.totalGuests !== 1 ? 's' : '' }}</span>
                    </div>
                  </div>

                  <!-- Price & CTA -->
                  <div class="md:text-right border-t md:border-t-0 md:border-l md:pl-6 pt-4 md:pt-0 shrink-0">
                    <p class="text-sm text-gray-600 mb-1">From</p>
                    <p class="text-3xl font-bold text-gray-900 mb-1">{{ formatPrice(hotel.price) }}</p>
                    <p class="text-xs text-gray-500 mb-4">per night</p>
                    <button
                      class="w-full md:w-auto px-8 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors cursor-pointer border-none"
                      @click="viewHotelDetails(hotel)"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <Pagination
          v-if="!isLoading && hotelResults.length > itemsPerPage"
          :total-items="hotelResults.length"
          :items-per-page="itemsPerPage"
          :current-page="currentPage"
          @page-change="handlePageChange"
        />

        <!-- No results -->
        <div v-if="!isLoading && hotelResults.length === 0" class="text-center py-20">
          <div class="text-6xl mb-4">🏨</div>
          <h3 class="text-2xl font-bold text-gray-900 mb-2">No Hotels Found</h3>
          <p class="text-gray-600 mb-6">We couldn't find any hotels matching your search. Try adjusting your dates or city.</p>
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
          <h2 class="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Popular Destinations</h2>
          <p class="text-lg text-gray-600">Explore our most sought-after hotel destinations</p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="(dest, i) in popularDestinations" :key="dest.city"
            class="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer reveal"
            :style="{ transitionDelay: `${i * 100}ms` }"
          >
            <img :src="dest.image" :alt="dest.city" class="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            <div class="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h3 class="text-2xl font-bold mb-1">{{ dest.city }}</h3>
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
          <p class="text-lg text-gray-600">Experience hassle-free hotel booking with exclusive benefits</p>
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

