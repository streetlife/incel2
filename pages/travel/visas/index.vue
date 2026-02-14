<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import VisaForm from '../../../components/forms/VisaForm.vue'
import { FileText } from 'lucide-vue-next'

const route = useRoute()

// Search results state
const searchResults = ref<any[]>([])
const isLoading = ref(false)
const hasSearched = ref(false)
const showSearchForm = ref(true)

// Popular visa destinations
const popularDestinations = [
  {
    country: 'United Arab Emirates',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800',
    price: 'From ₦45,000',
    processingTime: '3-5 Days'
  },
  {
    country: 'United Kingdom',
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800',
    price: 'From ₦120,000',
    processingTime: '15-20 Days'
  },
  {
    country: 'United States',
    image: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800',
    price: 'From ₦150,000',
    processingTime: '30-45 Days'
  },
  {
    country: 'Canada',
    image: 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=800',
    price: 'From ₦130,000',
    processingTime: '20-30 Days'
  },
  {
    country: 'Schengen',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800',
    price: 'From ₦95,000',
    processingTime: '10-15 Days'
  },
  {
    country: 'Turkey',
    image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800',
    price: 'From ₦35,000',
    processingTime: '2-3 Days'
  }
]

// Benefits
const benefits = [
  {
    icon: '✓',
    title: 'Expert Assistance',
    description: 'Professional guidance through the entire visa process'
  },
  {
    icon: '✓',
    title: 'Fast Processing',
    description: 'Quick turnaround times for your visa applications'
  },
  {
    icon: '✓',
    title: 'Document Support',
    description: 'Help with document preparation and verification'
  },
  {
    icon: '✓',
    title: 'Track Application',
    description: 'Real-time updates on your visa application status'
  }
]

// Visa types
const visaTypes = ['Tourist Visa', 'Business Visa', 'Transit Visa', 'Student Visa', 'Work Visa']
const validityPeriods = ['30 Days', '60 Days', '90 Days', '180 Days', '1 Year']
const entryTypes = ['Single Entry', 'Multiple Entry']

// Function to search visas
const searchVisas = async (params?: any) => {
  console.log('searchVisas called with params:', params)
  
  isLoading.value = true
  hasSearched.value = true
  
  // Get search params
  const searchParams = params || {
    country: route.query.country,
    nationality: route.query.nationality,
    persons: {
      adults: Number.parseInt(route.query.adults as string) || 1,
      children: Number.parseInt(route.query.children as string) || 0
    }
  }

  console.log('Search params:', searchParams)

  // Simulate API call
  setTimeout(() => {
    // Generate mock results
    const results = Array.from({ length: 6 }, (_, i) => ({
      id: i + 1,
      country: searchParams.country || 'United Arab Emirates',
      nationality: searchParams.nationality || 'Nigeria',
      visaType: visaTypes[Math.floor(Math.random() * visaTypes.length)],
      validity: validityPeriods[Math.floor(Math.random() * validityPeriods.length)],
      entryType: entryTypes[Math.floor(Math.random() * entryTypes.length)],
      processingTime: `${Math.floor(Math.random() * 20) + 3}-${Math.floor(Math.random() * 10) + 15} Days`,
      price: Math.floor(Math.random() * 100000) + 30000,
      requirements: ['Valid Passport', 'Passport Photos', 'Bank Statement', 'Flight Booking'].slice(0, Math.floor(Math.random() * 2) + 2),
      success_rate: Math.floor(Math.random() * 20) + 80
    }))
    
    console.log('Generated results:', results)
    searchResults.value = results
    isLoading.value = false
    
    // Scroll to results
    if (searchResults.value.length > 0) {
      setTimeout(() => {
        const resultsElement = document.getElementById('search-results')
        console.log('Scrolling to results element:', resultsElement)
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
    if (newQuery.country && newQuery.nationality) {
      searchVisas()
    }
  },
  { immediate: true }
)

// Toggle search form
const toggleSearchForm = () => {
  showSearchForm.value = !showSearchForm.value
}

// Handle search from VisaForm
const handleVisaSearch = (searchData: any) => {
  console.log('handleVisaSearch received:', searchData)
  searchVisas(searchData)
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
      style="background-image: url('https://images.unsplash.com/photo-1606768666853-403c90a981ad?w=1600')"
    >
      <!-- Overlay -->
      <div class="absolute inset-0 bg-black/50"></div>
      
      <!-- Content -->
      <div class="relative z-10 max-w-7xl mx-auto">
        <div class="text-center mb-12 reveal transition-all duration-500" :class="{ 'mb-6': hasSearched }">
          <h1 class="text-4xl md:text-5xl font-bold mb-4 text-white transition-all duration-500" :class="{ 'text-3xl md:text-4xl': hasSearched }">
            {{ hasSearched ? 'Search Visa Services' : 'Get Your Visa Easily' }}
          </h1>
          <p class="text-xl text-gray-100 transition-opacity duration-500" v-if="!hasSearched">
            Fast and reliable visa processing services worldwide
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
            <VisaForm @search="handleVisaSearch" />
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
          <p class="mt-4 text-lg text-gray-600">Searching for visa services...</p>
        </div>

        <!-- Results Header -->
        <div v-else-if="searchResults.length > 0" class="mb-8">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <h2 class="text-2xl md:text-3xl font-bold text-gray-900">
              Available Visa Services ({{ searchResults.length }})
            </h2>
            <div class="flex gap-2">
              <select class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900">
                <option>Sort by: Price (Low to High)</option>
                <option>Sort by: Price (High to Low)</option>
                <option>Sort by: Processing Time</option>
                <option>Sort by: Success Rate</option>
              </select>
            </div>
          </div>
          <p class="text-gray-600">
            Showing visa services for {{ searchResults[0]?.country || 'United Arab Emirates' }}
          </p>
        </div>

        <!-- Results Grid -->
        <div v-if="!isLoading && searchResults.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div 
            v-for="(visa, index) in searchResults" 
            :key="visa.id"
            class="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6"
            :style="{ transitionDelay: `${index * 50}ms` }"
          >
            <div class="flex items-start gap-3 mb-4">
              <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText class="w-6 h-6 text-blue-600" />
              </div>
              <div class="flex-1">
                <h3 class="text-xl font-bold text-gray-900 mb-1">{{ visa.visaType }}</h3>
                <p class="text-sm text-gray-600">{{ visa.country }} - {{ visa.entryType }}</p>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4 mb-4 pb-4 border-b">
              <div>
                <p class="text-xs text-gray-500 mb-1">Validity</p>
                <p class="font-semibold text-gray-900">{{ visa.validity }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 mb-1">Processing Time</p>
                <p class="font-semibold text-gray-900">{{ visa.processingTime }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 mb-1">Success Rate</p>
                <p class="font-semibold text-green-600">{{ visa.success_rate }}%</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 mb-1">Entry Type</p>
                <p class="font-semibold text-gray-900">{{ visa.entryType }}</p>
              </div>
            </div>

            <div class="mb-4">
              <p class="text-sm font-semibold text-gray-700 mb-2">Requirements:</p>
              <div class="flex flex-wrap gap-2">
                <span 
                  v-for="req in visa.requirements" 
                  :key="req"
                  class="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                >
                  ✓ {{ req }}
                </span>
              </div>
            </div>

            <div class="flex items-center justify-between pt-4 border-t">
              <div>
                <p class="text-sm text-gray-600">Total Cost</p>
                <p class="text-2xl font-bold text-gray-900">{{ formatPrice(visa.price) }}</p>
              </div>
              <button class="px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors duration-300">
                Apply Now
              </button>
            </div>
          </div>
        </div>

        <!-- No Results -->
        <div v-if="!isLoading && searchResults.length === 0 && hasSearched" class="text-center py-20 reveal">
          <div class="text-6xl mb-4">📄</div>
          <h3 class="text-2xl font-bold text-gray-900 mb-2">No Visa Services Found</h3>
          <p class="text-gray-600 mb-6">
            We couldn't find any visa services matching your criteria.
            Try selecting a different destination or nationality.
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
          <h2 class="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Popular Visa Destinations</h2>
          <p class="text-lg text-gray-600">Quick visa processing for popular destinations</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="(destination, index) in popularDestinations" 
            :key="destination.country"
            class="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer reveal"
            :style="{ transitionDelay: `${index * 100}ms` }"
          >
            <img 
              :src="destination.image" 
              :alt="destination.country"
              class="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            <div class="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h3 class="text-2xl font-bold mb-2">{{ destination.country }}</h3>
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-200">Processing Time</p>
                  <p class="font-semibold">{{ destination.processingTime }}</p>
                </div>
                <p class="text-lg font-semibold">{{ destination.price }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Why Choose Us -->
    <section class="py-16 px-6 bg-gray-50" :class="{ 'bg-white': hasSearched }">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-12 reveal">
          <h2 class="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Why Choose Our Visa Services</h2>
          <p class="text-lg text-gray-600">Experience hassle-free visa processing with exclusive benefits</p>
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