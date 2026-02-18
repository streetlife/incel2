<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import FlightsForm from '../../../components/forms/FlightsForm.vue'
import FlightResult from '../../../components/flight/FlightResult.vue'
import { Plane } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()

const flightResults = ref<any[]>([])
const isLoading = ref(false)
const hasSearched = ref(false)
const showSearchForm = ref(true)
const searchOrigin = ref('')
const searchDest = ref('')

// ── Static content ────────────────────────────────────────────────────────────
const popularDestinations = [
  { city: 'Dubai', country: 'UAE', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800', price: 'From ₦450,000' },
  { city: 'London', country: 'United Kingdom', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800', price: 'From ₦650,000' },
  { city: 'New York', country: 'USA', image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800', price: 'From ₦800,000' },
  { city: 'Paris', country: 'France', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800', price: 'From ₦700,000' },
  { city: 'Johannesburg', country: 'South Africa', image: 'https://images.unsplash.com/photo-1577948000111-9c970dfe3743?w=800', price: 'From ₦350,000' },
  { city: 'Istanbul', country: 'Turkey', image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800', price: 'From ₦500,000' },
]
const benefits = [
  { icon: '✓', title: 'Best Price Guarantee', description: 'We offer competitive prices on all flight bookings' },
  { icon: '✓', title: '24/7 Support', description: 'Our team is available round the clock to assist you' },
  { icon: '✓', title: 'Flexible Booking', description: 'Easy modifications and cancellations on your bookings' },
  { icon: '✓', title: 'Secure Payment', description: 'Your payment information is safe and encrypted' },
]

// ── Mock data generator (Amadeus FlightOffer shape) ───────────────────────────
const generateMockFlights = (sp: Record<string, string>) => {
  const carrierCodes = ['BA', 'VS', 'LH', 'TP', 'EI']
  const cabins = ['ECONOMY', 'ECONOMY', 'ECONOMY', 'PREMIUM_ECONOMY']
  return Array.from({ length: 12 }, (_, i) => {
    const code = carrierCodes[i % carrierCodes.length]
    const cabin = cabins[i % cabins.length]
    const depH = 6 + (i * 2) % 16
    const durMins = 420 + (i * 45) % 480
    const durH = Math.floor(durMins / 60)
    const durM = durMins % 60
    const depAt = `2026-05-20T${String(depH).padStart(2, '0')}:00:00`
    const arrAt = new Date(new Date(depAt).getTime() + durMins * 60000).toISOString()
    return {
      id: String(i + 1),
      numberOfBookableSeats: 3 + (i % 8),
      itineraries: [{
        duration: `PT${durH}H${durM > 0 ? durM + 'M' : ''}`,
        segments: [{
          departure: { iataCode: sp.from || 'LHR', terminal: '5', at: depAt },
          arrival: { iataCode: sp.to || 'JFK', terminal: '8', at: arrAt },
          carrierCode: code,
          number: String(100 + i),
          duration: `PT${durH}H${durM > 0 ? durM + 'M' : ''}`,
          numberOfStops: 0,
        }],
      }],
      price: {
        currency: 'USD',
        total: String((350 + i * 45).toFixed(2)),
        grandTotal: String((350 + i * 45).toFixed(2)),
      },
      travelerPricings: [{
        fareDetailsBySegment: [{
          cabin,
          includedCheckedBags: { quantity: cabin === 'PREMIUM_ECONOMY' ? 2 : 0 },
          includedCabinBags: { quantity: 1 },
        }],
      }],
    }
  })
}

// ── Core search function ──────────────────────────────────────────────────────
// Always reads from URL query — single source of truth.
// Call pushSearchToUrl() first when initiating a new search from the form.
const runSearch = () => {
  const q = route.query
  if (!q.from || !q.to) return

  isLoading.value = true
  hasSearched.value = true
  showSearchForm.value = false
  searchOrigin.value = String(q.from)
  searchDest.value = String(q.to)

  // replace setTimeout block with real Amadeus API call using route.query params
  setTimeout(() => {
    flightResults.value = generateMockFlights({
      from: String(q.from),
      to: String(q.to),
      departing: String(q.departing ?? ''),
      returning: String(q.returning ?? ''),
      travelClass: String(q.travelClass ?? 'economy'),
      tripType: String(q.tripType ?? 'round-trip'),
    })
    isLoading.value = false
    setTimeout(() => document.getElementById('search-results')?.scrollIntoView({ behavior: 'smooth' }), 100)
  }, 1500)
}

// ── Push form data into URL, then runSearch via watcher ──────────────────────
const handleFlightSearch = (data: any) => {
  // Write every search param to the URL. page is reset to 1 on a new search.
  router.push({
    query: {
      from: data.from ?? undefined,
      to: data.to ?? undefined,
      departing: data.departing ?? undefined,
      returning: data.returning ?? undefined,
      travelClass: data.travelClass ?? undefined,
      tripType: data.tripType ?? undefined,
      passengers: data.passengers ?? undefined,
    },
  })
}

// ── Single watcher — runs on load AND on every URL change (incl. refresh) ────
watch(
  () => route.query,
  (q) => { if (q.from && q.to) runSearch() },
  { immediate: true }
)

const handleBooking = (id: string) => console.log('Book flight', id)
const toggleSearchForm = () => { showSearchForm.value = !showSearchForm.value }

onMounted(() => {
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

    <!-- ── Hero + search form ──────────────────────────────────────────────── -->
    <section
      class="relative px-6 bg-cover bg-center bg-no-repeat transition-all duration-500 pt-36 pb-24"
      style="background-image: url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1600')"
    >
      <div class="absolute inset-0 bg-black/40"></div>

      <div class="relative z-10 max-w-7xl mx-auto">
        <!-- Heading -->
        <div class="text-center reveal transition-all duration-500" :class="hasSearched ? 'mb-6' : 'mb-12'">
          <h1
            class="font-bold mb-4 text-white transition-all duration-500"
            :class="hasSearched ? 'text-3xl md:text-4xl' : 'text-4xl md:text-5xl'"
          >
            {{ hasSearched ? 'Search Flights' : 'Book Your Flight' }}
          </h1>
          <p v-if="!hasSearched" class="text-xl text-gray-100">
            Find the best deals on flights to destinations worldwide
          </p>
        </div>

        <!-- Search card -->
        <div class="mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
          <!-- Collapse toggle (only after first search) -->
          <button
            v-if="hasSearched"
            class="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between cursor-pointer border-none"
            @click="toggleSearchForm"
          >
            <span class="font-semibold text-gray-900">
              {{ showSearchForm ? 'Hide Search Form' : 'Modify Search' }}
            </span>
            <svg
              class="w-5 h-5 transition-transform duration-300"
              :class="{ 'rotate-180': showSearchForm }"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <div v-show="!hasSearched || showSearchForm" class="p-6 md:p-8">
            <FlightsForm @search="handleFlightSearch" />
          </div>
        </div>
      </div>
    </section>

    <!-- ── Search results ──────────────────────────────────────────────────── -->
    <section v-if="hasSearched" id="search-results" class="py-10 px-6 bg-slate-100">
      <div class="max-w-7xl mx-auto">

        <!-- Loading -->
        <div v-if="isLoading" class="flex flex-col items-center justify-center py-24 gap-4">
          <div class="w-16 h-16 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p class="text-slate-600 font-medium">Searching for the best flights…</p>
        </div>

        <!-- Results -->
        <FlightResult
          v-else-if="flightResults.length > 0"
          :flights="flightResults"
          :origin="searchOrigin"
          :destination="searchDest"
          @book="handleBooking"
        />

        <!-- No results -->
        <div v-else class="flex flex-col items-center gap-3 py-20 text-center">
          <span class="text-5xl"><Plane /></span>
          <h3 class="text-2xl font-bold text-gray-900">No Flights Found</h3>
          <p class="text-gray-600">We couldn't find any flights matching your search criteria.</p>
          <button
            class="mt-2 px-8 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-semibold transition-colors cursor-pointer border-none"
            @click="toggleSearchForm"
          >
            Modify Search
          </button>
        </div>
      </div>
    </section>

    <!-- ── Popular destinations (pre-search only) ──────────────────────────── -->
    <section v-if="!hasSearched" class="py-16 px-6">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-12 reveal">
          <h2 class="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Popular Destinations</h2>
          <p class="text-lg text-gray-600">Explore our most sought-after flight routes</p>
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
              <p class="text-gray-200 mb-2">{{ dest.country }}</p>
              <p class="text-lg font-semibold">{{ dest.price }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Why choose us ───────────────────────────────────────────────────── -->
    <section class="py-16 px-6" :class="hasSearched ? 'bg-white' : 'bg-gray-50'">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-12 reveal">
          <h2 class="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Why Book With Us</h2>
          <p class="text-lg text-gray-600">Experience hassle-free flight booking with exclusive benefits</p>
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