<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
    <div class="max-w-2xl w-full text-center">
      <!-- 404 Number with gradient -->
      <h1 class="text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#0076ad] to-[#0076ad] animate-pulse">
        404
      </h1>
      
      <!-- Error Message -->
      <div class="mt-8 space-y-4">
        <h2 class="text-3xl md:text-4xl font-bold text-gray-800">
          Page Not Found
        </h2>
        
        <!-- URL Display with styling -->
        <div v-if="error?.url" class="mt-4">
          <div class="inline-flex items-center px-4 py-2 rounded-lg bg-gray-100 border border-gray-200">
            <span class="text-sm font-mono text-gray-600 break-all">
              {{ error.url }}
            </span>
          </div>
          <p class="mt-2 text-sm text-gray-500">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <p v-else class="text-gray-600">
          The page you're looking for doesn't exist or has been moved.
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
        <NuxtLink 
          to="/" 
          class="group relative inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-[#0076ad] to-[#0076ad] text-white font-medium rounded-lg hover:from-[#0076ad] hover:to-[#0076ad] transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl w-full sm:w-auto"
        >
          <svg class="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Go Back Home
        </NuxtLink>
        
        <button 
          @click="goBack"
          class="inline-flex items-center justify-center px-6 py-3 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-all duration-200 w-full sm:w-auto"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path>
          </svg>
          Go Back
        </button>
      </div>

      <!-- Additional Help Section -->
      <div class="mt-12 pt-8 border-t border-gray-200">
        <p class="text-gray-600 mb-4">You might want to check:</p>
        <div class="flex flex-wrap gap-3 justify-center">
          <NuxtLink 
            to="/services" 
            class="px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors text-sm"
          >
            Our Services
          </NuxtLink>
          <NuxtLink 
            to="/contact" 
            class="px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors text-sm"
          >
            Contact Us
          </NuxtLink>
          <NuxtLink 
            to="/search" 
            class="px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors text-sm"
          >
            Search
          </NuxtLink>
        </div>
      </div>

      <!-- Copy Success Toast -->
      <div 
        v-if="showToast" 
        class="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg transition-opacity duration-300"
        :class="showToast ? 'opacity-100' : 'opacity-0'"
      >
        URL copied to clipboard!
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  error: Object
})

const showToast = ref(false)

// Handle navigation back
const goBack = () => {
  if (window.history.length > 1) {
    window.history.back()
  } else {
    navigateTo('/')
  }
}

// Copy URL to clipboard
const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    showToast.value = true
    setTimeout(() => {
      showToast.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}

// Log error for debugging
onMounted(() => {
  console.error('404 Error:', props.error)
})

// Clear error if needed
const clearError = () => {
  navigateTo('/')
}
</script>

<style scoped>
/* You can add any custom animations here if needed */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}
</style>