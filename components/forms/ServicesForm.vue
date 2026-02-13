<template>
  <div class="px-4">
    <div class="max-w-7xl mx-auto">
      <!-- Section Title -->
      <h2 class="text-3xl font-bold text-gray-900 mb-8">
        We also offer the following services.
      </h2>
      
      <!-- Empty State -->
      <div v-if="services.length === 0" class="text-center py-12">
        <p class="text-gray-500 text-lg">No services available at the moment.</p>
      </div>
      
      <!-- Services Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          v-for="service in services"
          :key="service.id"
          class="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300"
        >
          <!-- Image -->
          <div class="relative h-64 overflow-hidden">
            <img
              :src="service.image"
              :alt="service.title"
              class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
          
          <!-- Content -->
          <div class="p-6">
            <h3 class="text-xl font-bold text-gray-900 mb-3">
              {{ service.title }}
            </h3>
            
            <p class="text-gray-600 leading-relaxed mb-6 text-sm">
              {{ service.description }}
            </p>
            
            <button
              @click="handleServiceRequest(service)"
              class="px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-sm text-gray-900 font-semibold rounded-lg transition-colors duration-200"
            >
              Request Service
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { navigateTo } from 'nuxt/app'

/* Types */
export interface Service {
  id: string
  title: string
  description: string
  image: string
  slug: string
}

interface Props {
  services: Service[]
}

const props = withDefaults(defineProps<Props>(), {
  services: () => []
})

const emit = defineEmits<{
  'service-request': [service: Service]
}>()

const handleServiceRequest = (service: Service): void => {
  emit('service-request', service)
  navigateTo(`/services/${service.slug}`)
}
</script>