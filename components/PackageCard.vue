<template>
  <div class="card group cursor-pointer">
    <!-- Image -->
    <div class="relative h-64 overflow-hidden">
      <img 
        :src="package.image" 
        :alt="package.title"
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
      <div class="absolute top-4 left-4">
        <span class="badge-primary">
          {{ package.category }}
        </span>
      </div>
      <div v-if="package.rating" class="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full flex items-center space-x-1">
        <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        <span class="text-sm font-semibold text-gray-900">{{ package.rating }}</span>
      </div>
      <div v-if="package.discount" class="absolute bottom-4 left-4">
        <span class="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
          -{{ package.discount }}%
        </span>
      </div>
    </div>
    
    <!-- Content -->
    <div class="p-6">
      <div v-if="package.location" class="text-sm text-gray-500 mb-2">
        {{ package.location }}
      </div>
      <h3 class="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors">
        {{ package.title }}
      </h3>
      
      <!-- Package Details -->
      <div v-if="package.duration || package.type" class="flex items-center gap-4 text-sm text-gray-600 mb-4">
        <div v-if="package.duration" class="flex items-center space-x-1">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{{ package.duration }}</span>
        </div>
        <div v-if="package.type" class="flex items-center space-x-1">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span>{{ package.type }}</span>
        </div>
      </div>
      
      <!-- Features -->
      <div v-if="package.features" class="space-y-2 mb-4">
        <div v-for="feature in package.features" :key="feature" class="flex items-start space-x-2 text-sm text-gray-600">
          <svg class="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
          <span>{{ feature }}</span>
        </div>
      </div>
      
      <!-- Price -->
      <div class="flex items-center justify-between pt-4 border-t border-gray-100">
        <div>
          <p class="text-sm text-gray-500">Starting from</p>
          <div class="flex items-baseline space-x-2">
            <span v-if="package.oldPrice" class="text-sm text-gray-400 line-through">
              AED {{ package.oldPrice.toLocaleString() }}
            </span>
            <span class="text-2xl font-bold text-primary">
              AED {{ package.price.toLocaleString() }}
            </span>
          </div>
        </div>
        <button v-if="showButton" class="btn-accent text-sm">
          View Details
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  package: {
    type: Object,
    required: true
  },
  showButton: {
    type: Boolean,
    default: true
  }
})
</script>
