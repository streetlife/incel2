<script setup lang="ts">
import { Plane } from 'lucide-vue-next'
import FlightsForm from '../../../components/forms/FlightsForm.vue'
import FlightResult from '../../../components/flight/FlightResult.vue'
import { useFlights } from '../../../composables/useFlights'
import { onMounted, nextTick, watch } from 'vue'
import AppToast from '../../../components/toast/AppToast.vue'
import { useRoute } from 'nuxt/app'

const route = useRoute()

const {
  results,
  meta,
  loading,
  hasSearched,
  showSearchForm,
  bookingLoadingId,
  search,
  navigateToBooking,
} = useFlights()

function scrollToResults() {
  nextTick(() => {
    const el = document.getElementById('search-results')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  })
}

function handleFlightSearch(data: any) {
  search({
    supplier: data.supplier,
    from: data.from,
    to: data.to,
    dateFrom: data.dateFrom,
    dateTo: data.dateTo ?? undefined,
    search_type: data.tripType ?? 'roundtrip',
    flight_class: data.travelClass ?? 'economy',
    adult_number: Number(data.passengers.adult_number) || 1,
    child_number: Number(data.passengers.child_number) || 0,
    infants_number: Number(data.passengers.infants_number) || 0,
  })
  scrollToResults()
}

const toggleSearchForm = () => { showSearchForm.value = !showSearchForm.value }

const popularDestinations = [
  { city: 'Dubai', country: 'UAE', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800', price: 'From ₦450,000' },
  { city: 'London', country: 'United Kingdom', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800', price: 'From ₦650,000' },
  { city: 'New York', country: 'USA', image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800', price: 'From ₦800,000' },
  { city: 'Paris', country: 'France', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800', price: 'From ₦700,000' },
  { city: 'Johannesburg', country: 'South Africa', image: 'https://images.unsplash.com/photo-1577948000111-9c970dfe3743?w=800', price: 'From ₦350,000' },
  { city: 'Istanbul', country: 'Turkey', image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800', price: 'From ₦500,000' },
]

const benefits = [
  { title: 'Best Price Guarantee', description: 'We offer competitive prices on all flight bookings' },
  { title: '24/7 Support', description: 'Our team is available round the clock to assist you' },
  { title: 'Flexible Booking', description: 'Easy modifications and cancellations on your bookings' },
  { title: 'Secure Payment', description: 'Your payment information is safe and encrypted' },
]

function scrollToTopAndShowForm() {
  showSearchForm.value = true
  if (typeof globalThis !== 'undefined') {
    globalThis.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

onMounted(() => {
  const q = route.query

  if (q.from && q.to && q.dateFrom) {
    search({
      supplier: 'amadeus',
      from: String(q.from),
      to: String(q.to),
      dateFrom: String(q.dateFrom),
      dateTo: q.dateTo ? String(q.dateTo) : undefined,
      search_type: String(q.tripType ?? 'roundtrip'),
      flight_class: String(q.travelClass ?? 'economy'),
      adult_number: Number(q.adult_number) || 1,
      child_number: Number(q.child_number) || 0,
      infants_number: Number(q.infants_number) || 0,
    })

    const stopWatch = watch(loading, (isLoading) => {
      if (!isLoading && hasSearched.value) {
        nextTick(() => scrollToResults())
        stopWatch()
      }
    })
  }

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
    <AppToast />
    <section
      class="relative px-6 bg-cover bg-center bg-no-repeat transition-all duration-500 pt-36 pb-24"
      style="background-image: url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1600')"
    >
      <div class="absolute inset-0 bg-black/40"></div>
      <div class="relative z-10 max-w-7xl mx-auto">

        <div class="text-center reveal transition-all duration-500" :class="hasSearched ? 'mb-6' : 'mb-12'">
          <h1 class="font-bold mb-4 text-white transition-all duration-500"
            :class="hasSearched ? 'text-3xl md:text-4xl' : 'text-4xl md:text-5xl'">
            {{ hasSearched ? 'Search Flights' : 'Book Your Flight' }}
          </h1>
          <p v-if="!hasSearched" class="text-xl text-gray-100">
            Find the best deals on flights to destinations worldwide
          </p>
        </div>

        <div class="mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
          <button
            v-if="hasSearched"
            class="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between cursor-pointer border-none"
            @click="toggleSearchForm"
          >
            <span class="font-semibold text-gray-900">{{ showSearchForm ? 'Hide Search Form' : 'Modify Search' }}</span>
            <svg class="w-5 h-5 transition-transform duration-300" :class="{ 'rotate-180': showSearchForm }"
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div v-show="!hasSearched || showSearchForm" class="p-6 md:p-8">
            <FlightsForm @search="handleFlightSearch" />
          </div>
        </div>
      </div>
    </section>

    <section v-if="hasSearched" id="search-results" class="py-10 px-6 bg-slate-100">
      <div class="max-w-7xl mx-auto">

        <div v-if="loading" class="flex flex-col items-center justify-center py-24 gap-4">
          <div class="w-16 h-16 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
          <p class="text-slate-600 font-medium">Searching for the best flights…</p>
        </div>

        <FlightResult
          v-else-if="results.length > 0"
          :flights="results"
          :meta="meta"
          :booking-loading-id="bookingLoadingId"
          @book="navigateToBooking"
        />

        <div v-else class="flex flex-col items-center gap-3 py-20 text-center">
          <Plane class="w-16 h-16 text-slate-300" />
          <h3 class="text-2xl font-bold text-gray-900">No Flights Found</h3>
          <p class="text-gray-600">We couldn't find any flights matching your search criteria.</p>
          <button
            class="mt-2 px-8 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-semibold transition-colors cursor-pointer border-none"
            @click="scrollToTopAndShowForm">
            Modify Search
          </button>
        </div>
      </div>
    </section>

    <section v-if="!hasSearched" class="py-16 px-6">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-12 reveal">
          <h2 class="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Popular Destinations</h2>
          <p class="text-lg text-gray-600">Explore our most sought-after flight routes</p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="(dest, i) in popularDestinations" :key="dest.city"
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

    <section class="py-16 px-6" :class="hasSearched ? 'bg-white' : 'bg-gray-50'">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-12 reveal">
          <h2 class="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Why Book With Us</h2>
          <p class="text-lg text-gray-600">Experience hassle-free flight booking with exclusive benefits</p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div v-for="(b, i) in benefits" :key="b.title"
            class="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 reveal"
            :style="{ transitionDelay: `${i * 100}ms` }"
          >
            <div class="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="20,6 9,17 4,12"/>
              </svg>
            </div>
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
