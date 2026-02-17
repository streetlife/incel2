<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import FlightsForm from '../../../components/forms/FlightsForm.vue'
import Pagination from '../../../components/Pagination.vue'
import { Plane } from 'lucide-vue-next'

const route = useRoute()

// Search results state
const flightResults = ref<any[]>([])
const isLoading = ref(false)
const hasSearched = ref(false)
const showSearchForm = ref(true)
const currentPage = ref(1)
const itemsPerPage = 10

// Paginated results
const paginatedResults = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return flightResults.value.slice(start, end)
})

// Popular destinations
const popularDestinations = [
  {
    city: 'Dubai',
    country: 'UAE',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800',
    price: 'From ₦450,000'
  },
  {
    city: 'London',
    country: 'United Kingdom',
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800',
    price: 'From ₦650,000'
  },
  {
    city: 'New York',
    country: 'USA',
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800',
    price: 'From ₦800,000'
  },
  {
    city: 'Paris',
    country: 'France',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800',
    price: 'From ₦700,000'
  },
  {
    city: 'Johannesburg',
    country: 'South Africa',
    image: 'https://images.unsplash.com/photo-1577948000111-9c970dfe3743?w=800',
    price: 'From ₦350,000'
  },
  {
    city: 'Istanbul',
    country: 'Turkey',
    image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800',
    price: 'From ₦500,000'
  }
]

// Services
const services = [
  {
    icon: '💺',
    title: 'Seat Selection',
    description: 'Choose your preferred seat in advance to travel comfortably'
  },
  {
    icon: '🧳',
    title: 'Extra Baggage',
    description: 'Need more space? Add extra baggage to your trip easily'
  },
  {
    icon: '🍽️',
    title: 'In-Flight Meals',
    description: 'Pre-order delicious meals and beverages for your flight'
  },
  {
    icon: '🛡️',
    title: 'Travel Insurance',
    description: 'Secure your trip with comprehensive coverage'
  },
  {
    icon: '🚗',
    title: 'Airport Transfer',
    description: 'Book comfortable transfer service to and from the airport'
  },
  {
    icon: '🤝',
    title: 'Meet & Greet',
    description: 'Enjoy personalized services upon arrival at the airport'
  }
]

// Why choose us
const benefits = [
  {
    icon: '✓',
    title: 'Best Price Guarantee',
    description: 'We offer competitive prices on all flight bookings'
  },
  {
    icon: '✓',
    title: '24/7 Support',
    description: 'Our team is available round the clock to assist you'
  },
  {
    icon: '✓',
    title: 'Flexible Booking',
    description: 'Easy modifications and cancellations on your bookings'
  },
  {
    icon: '✓',
    title: 'Secure Payment',
    description: 'Your payment information is safe and encrypted'
  }
]

// Mock airlines for demo
const airlines = ['Emirates', 'British Airways', 'Air France', 'Turkish Airlines', 'Qatar Airways', 'Lufthansa']

// Function to search flights
const searchFlights = async (params?: any) => {
  console.log('searchFlights called with params:', params)
  
  isLoading.value = true
  hasSearched.value = true
  
  // Get search params - handle both form data and route query
  const searchParams = params || {
    from: route.query.from,
    to: route.query.to,
    departing: route.query.departDate || route.query.departing,
    returning: route.query.returnDate || route.query.returning,
    passengers: route.query.passengers || 1,
    travelClass: route.query.cabinClass || route.query.travelClass || 'economy',
    tripType: route.query.tripType || 'round-trip'
  }

  // Simulate API call
  setTimeout(() => {
    // Generate mock results (50 flights for pagination demo)
    const results = Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      airline: airlines[Math.floor(Math.random() * airlines.length)],
      from: searchParams.from || 'Lagos',
      to: searchParams.to || 'Dubai',
      departTime: `${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}:${['00', '30'][Math.floor(Math.random() * 2)]}`,
      arrivalTime: `${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}:${['00', '30'][Math.floor(Math.random() * 2)]}`,
      duration: `${Math.floor(Math.random() * 5) + 5}h ${['00', '15', '30', '45'][Math.floor(Math.random() * 4)]}m`,
      stops: Math.floor(Math.random() * 3),
      price: Math.floor(Math.random() * 500000) + 300000,
      cabinClass: searchParams.travelClass || 'economy',
      departDate: searchParams.departing || new Date().toISOString().split('T')[0],
      returnDate: searchParams.returning,
      availableSeats: Math.floor(Math.random() * 20) + 5
    }))
    
    flightResults.value = results
    isLoading.value = false
    
    // Scroll to results
    if (flightResults.value.length > 0) {
      setTimeout(() => {
        const resultsElement = document.getElementById('search-results')
        resultsElement?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }, 1500)
}

// Watch for route query changes
watch(
  () => route.query,
  (newQuery) => {
    console.log('Route query changed:', newQuery)
    
    // Update current page from URL
    const pageFromUrl = Number.parseInt(newQuery.page as string) || 1
    currentPage.value = pageFromUrl
    
    if (newQuery.from && newQuery.to) {
      searchFlights()
    }
  },
  { immediate: true }
)

// Handle page change
const handlePageChange = (page: number) => {
  currentPage.value = page
}

// Toggle search form
const toggleSearchForm = () => {
  showSearchForm.value = !showSearchForm.value
}

// Handle search from FlightsForm
const handleFlightSearch = (searchData: any) => {
  console.log('handleFlightSearch received:', searchData)
  currentPage.value = 1 // Reset to first page on new search
  searchFlights(searchData)
}

// Scroll reveal animation
onMounted(() => {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-visible')
        observer.unobserve(entry.target)
      }
    })
  }, observerOptions)

  document.querySelectorAll('.reveal').forEach(el => {
    observer.observe(el)
  })
})

// Format currency
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0
  }).format(price)
}
</script>

<template>
  <div class="min-h-screen">
    <!-- Hero Section with Search Form -->
    <section 
      class="relative py-24 px-6 bg-cover bg-center bg-no-repeat transition-all duration-500"
      :class="{ 'py-12': hasSearched }"
      style="background-image: url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1600')"
    >
      <!-- Overlay -->
      <div class="absolute inset-0 bg-black/40"></div>
      
      <!-- Content -->
      <div class="relative z-10 max-w-7xl mx-auto">
        <div class="text-center mb-12 reveal transition-all duration-500" :class="{ 'mb-6': hasSearched }">
          <h1 class="text-4xl md:text-5xl font-bold mb-4 text-white transition-all duration-500" :class="{ 'text-3xl md:text-4xl': hasSearched }">
            {{ hasSearched ? 'Search Flights' : 'Book Your Flight' }}
          </h1>
          <p class="text-xl text-gray-100 transition-opacity duration-500" v-if="!hasSearched">
            Find the best deals on flights to destinations worldwide
          </p>
        </div>

        <!-- Collapsible Search Form -->
        <div class="mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-500">
          <button
            v-if="hasSearched"
            @click="toggleSearchForm"
            class="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors duration-300 flex items-center justify-between"
          >
            <span class="font-semibold text-gray-900">
              {{ showSearchForm ? 'Hide Search Form' : 'Modify Search' }}
            </span>
            <svg 
              class="w-5 h-5 transition-transform duration-300" 
              :class="{ 'rotate-180': showSearchForm }"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          <div 
            v-show="!hasSearched || showSearchForm"
            class="p-6 md:p-8 transition-all duration-500"
          >
            <FlightsForm @search="handleFlightSearch" />
          </div>
        </div>
      </div>
    </section>

    <!-- Search Results Section -->
    <section v-if="hasSearched" id="search-results" class="py-16 px-6 bg-gray-50">
      <div class="max-w-7xl mx-auto">
        <!-- Loading State -->
        <div v-if="isLoading" class="text-center py-20">
          <div class="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-gray-900"></div>
          <p class="mt-4 text-lg text-gray-600">Searching for the best flights...</p>
        </div>

        <!-- Results Header -->
        <div v-else-if="flightResults.length > 0" class="mb-8">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <h2 class="text-2xl md:text-3xl font-bold text-gray-900">
              Available Flights ({{ flightResults.length }})
            </h2>
            <div class="flex gap-2">
              <select class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900">
                <option>Sort by: Price (Low to High)</option>
                <option>Sort by: Price (High to Low)</option>
                <option>Sort by: Duration</option>
                <option>Sort by: Departure Time</option>
              </select>
            </div>
          </div>
          <p class="text-gray-600">
            Showing flights from {{ paginatedResults[0]?.from || 'Lagos' }} to {{ paginatedResults[0]?.to || 'Dubai' }}
          </p>
        </div>

        <!-- Results Grid -->
        <div v-if="!isLoading && paginatedResults.length > 0" class="grid gap-6">
          <div 
            v-for="(flight, index) in paginatedResults" 
            :key="flight.id"
            class="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6"
            :style="{ transitionDelay: `${index * 50}ms` }"
          >
            <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <!-- Flight Info -->
              <div class="flex-1">
                <div class="flex items-center gap-4 mb-4">
                  <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Plane class="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <h3 class="text-xl font-bold text-gray-900">{{ flight.airline }}</h3>
                    <p class="text-sm text-gray-600 capitalize">{{ flight.cabinClass }}</p>
                  </div>
                </div>

                <div class="grid grid-cols-3 gap-4 items-center">
                  <!-- Departure -->
                  <div>
                    <p class="text-2xl font-bold text-gray-900">{{ flight.departTime }}</p>
                    <p class="text-sm text-gray-600">{{ flight.from }}</p>
                    <p class="text-xs text-gray-500">{{ flight.departDate }}</p>
                  </div>

                  <!-- Duration -->
                  <div class="text-center">
                    <p class="text-sm text-gray-600 mb-2">{{ flight.duration }}</p>
                    <div class="relative">
                      <div class="h-0.5 bg-gray-300"></div>
                      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-2">
                        <span class="text-xs text-gray-600">
                          {{ flight.stops === 0 ? 'Direct' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}` }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- Arrival -->
                  <div class="text-right">
                    <p class="text-2xl font-bold text-gray-900">{{ flight.arrivalTime }}</p>
                    <p class="text-sm text-gray-600">{{ flight.to }}</p>
                    <p class="text-xs text-gray-500">{{ flight.departDate }}</p>
                  </div>
                </div>

                <div class="mt-4 flex items-center gap-4 text-sm text-gray-600">
                  <span>{{ flight.availableSeats }} seats left</span>
                  <span v-if="flight.stops === 0" class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                    Non-stop
                  </span>
                </div>
              </div>

              <!-- Price & Book -->
              <div class="lg:text-right border-t lg:border-t-0 lg:border-l lg:pl-6 pt-4 lg:pt-0">
                <p class="text-sm text-gray-600 mb-1">From</p>
                <p class="text-3xl font-bold text-gray-900 mb-4">{{ formatPrice(flight.price) }}</p>
                <button class="w-full lg:w-auto px-8 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors duration-300">
                  Select Flight
                </button>
                <p class="text-xs text-gray-500 mt-2">Per person</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <Pagination
          v-if="!isLoading && flightResults.length > 0"
          :total-items="flightResults.length"
          :items-per-page="itemsPerPage"
          :current-page="currentPage"
          @page-change="handlePageChange"
        />

        <!-- No Results -->
        <div v-if="!isLoading && flightResults.length === 0 && hasSearched" class="text-center py-20 reveal">
          <div class="text-6xl mb-4">✈️</div>
          <h3 class="text-2xl font-bold text-gray-900 mb-2">No Flights Found</h3>
          <p class="text-gray-600 mb-6">
            We couldn't find any flights matching your search criteria.
            Try adjusting your dates or destinations.
          </p>
          <button 
            @click="toggleSearchForm"
            class="px-8 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors duration-300"
          >
            Modify Search
          </button>
        </div>
      </div>
    </section>

    <!-- Popular Destinations (shown only when no search) -->
    <section v-if="!hasSearched" class="py-16 px-6">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-12 reveal">
          <h2 class="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Popular Destinations</h2>
          <p class="text-lg text-gray-600">Explore our most sought-after flight routes</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="(destination, index) in popularDestinations" 
            :key="destination.city"
            class="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer reveal"
            :style="{ transitionDelay: `${index * 100}ms` }"
          >
            <img 
              :src="destination.image" 
              :alt="destination.city"
              class="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            <div class="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h3 class="text-2xl font-bold mb-1">{{ destination.city }}</h3>
              <p class="text-gray-200 mb-2">{{ destination.country }}</p>
              <p class="text-lg font-semibold">{{ destination.price }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Why Choose Us -->
    <section class="py-16 px-6 bg-gray-50" :class="{ 'bg-white': hasSearched }">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-12 reveal">
          <h2 class="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Why Book With Us</h2>
          <p class="text-lg text-gray-600">Experience hassle-free flight booking with exclusive benefits</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div 
            v-for="(benefit, index) in benefits" 
            :key="benefit.title"
            class="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 reveal"
            :style="{ transitionDelay: `${index * 100}ms` }"
          >
            <div class="text-4xl mb-4 text-gray-900">{{ benefit.icon }}</div>
            <h3 class="text-xl font-bold mb-2 text-gray-900">{{ benefit.title }}</h3>
            <p class="text-gray-600">{{ benefit.description }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* Reveal animation styles */
.reveal {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}

.reveal-visible {
  opacity: 1;
  transform: translateY(0);
}
</style>