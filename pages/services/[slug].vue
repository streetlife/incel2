<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import VacationPackages from '../../components/services/VacationPackages.vue'
import TravelInsurance from '../../components/services/TravelInsurance.vue'
import AirportTransfer from '../../components/services/AirportTransfer.vue'
import AirportProtocol from '../../components/services/AirportProtocol.vue'
import TourGuide from '../../components/services/TourGuide.vue'
import Cruises from '../../components/services/Cruises.vue'

const route = useRoute()

// Get the slug from the route
const slug = computed(() => route.params.slug as string)

// Map slugs to components
const componentMap: Record<string, any> = {
  'vacation-packages': VacationPackages,
  'travel-insurance': TravelInsurance,
  'airport-transfer': AirportTransfer,
  'airport-protocol': AirportProtocol,
  'tour-guide': TourGuide,
  'cruises': Cruises
}

// Get the current component
const currentComponent = computed(() => {
  return componentMap[slug.value] || null
})

// Service metadata
const serviceMetadata: Record<string, { title: string; description: string }> = {
  'vacation-packages': {
    title: 'Vacation Packages',
    description: 'Discover amazing all-inclusive vacation packages'
  },
  'travel-insurance': {
    title: 'Travel Insurance',
    description: 'Protect your journey with comprehensive travel insurance'
  },
  'airport-transfer': {
    title: 'Airport Transfer',
    description: 'Comfortable and reliable airport transfer services'
  },
  'airport-protocol': {
    title: 'Airport Protocol',
    description: 'VIP airport assistance and fast-track services'
  },
  'tour-guide': {
    title: 'Tour Guide',
    description: 'Professional tour guides for your destination'
  },
  'cruises': {
    title: 'Cruises',
    description: 'Explore the world with luxury cruise packages'
  }
}

const metadata = computed(() => serviceMetadata[slug.value] || { title: 'Service Not Found', description: '' })
</script>

<template>
  <div class="min-h-screen">
    <!-- Render the appropriate component -->
    <component :is="currentComponent" v-if="currentComponent" />
    
    <!-- 404 for unknown services -->
    <div v-else class="py-20 px-6 text-center">
      <div class="max-w-2xl mx-auto">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">Service Not Found</h1>
        <p class="text-lg text-gray-600 mb-8">
          The service you're looking for doesn't exist.
        </p>
        <NuxtLink
          to="/services/vacation-packages"
          class="inline-block px-8 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
        >
          Browse Services
        </NuxtLink>
      </div>
    </div>
  </div>
</template>