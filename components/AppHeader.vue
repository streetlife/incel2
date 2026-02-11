<template>
  <header 
    :class="[
      'fixed top-0 w-full z-50 transition-all duration-300',
      scrolled ? 'bg-[#0076ad] backdrop-blur-md shadow-lg' : 'bg-transparent'
    ]"
  >
    <nav class="container mx-auto sm:px-24 px-4 py-2">
      <div class="flex items-center justify-between">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center space-x-2">
          <div class="text-2xl font-bold">
            <img 
                src="https://inceltourism.com/wp-content/uploads/elementor/thumbs/logowhite-qhzbd7e4e3m50i16db2lblzaxkieai6seqqrl7p81s.png" 
                class="w-auto h-16 object-contain"
                alt="Incel Tourism Logo"
            />
          </div>
        </NuxtLink>
        
        <!-- Desktop Navigation -->
        <div class="hidden lg:flex justify-center items-center space-x-8">
          <NuxtLink 
            v-for="link in navLinks" 
            :key="link.name"
            :to="link.path"
            :class="[
              'font-medium transition-colors duration-200',
              scrolled ? 'text-white hover:text-gray-700' : 'text-white hover:text-accent'
            ]"
          >
            {{ link.name }}
          </NuxtLink>
          
        </div>

        <div class="hidden lg:flex">
            <button 
            :class="[
              'px-6 py-2 rounded-full font-semibold transition-all duration-300 bg-yellow-400 hover:bg-yellow-500 text-neutral-900 shadow-lg hover:shadow-xl',
            ]"
          >
            Login
          </button>
        </div>
        
        <!-- Mobile Menu Button -->
        <button 
          @click="mobileMenuOpen = !mobileMenuOpen"
          class="lg:hidden"
          :class="scrolled ? 'text-white' : 'text-white'"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path v-if="!mobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <!-- Mobile Menu -->
      <div 
        v-if="mobileMenuOpen"
        class="lg:hidden mt-4 pb-4 animate-slide-up bg-gray-800 px-5"
      >
        <div class="flex flex-col space-y-4">
          <NuxtLink 
            v-for="link in navLinks" 
            :key="link.name"
            :to="link.path"
            :class="[
              'font-medium transition-colors duration-200 py-2',
              scrolled ? 'text-gray-700 hover:text-[#0076ad]' : 'text-white hover:text-accent'
            ]"
            @click="mobileMenuOpen = false"
          >
            {{ link.name }}
          </NuxtLink>
          <button 
            class="bg-yellow-400 hover:bg-yellow-500 text-neutral-900 px-6 rounded-full shadow-lg hover:shadow-xl transition-all"
          >
            Login
          </button>
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const scrolled = ref(false)
const mobileMenuOpen = ref(false)

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'About Us', path: '/about-us' },
  { name: 'Packages', path: '/packages' },
  { name: 'Local Tours', path: '/local-tours' },
  { name: 'Visa', path: '/uae-visa' },
  { name: 'Contact', path: '/contact' }
]

const handleScroll = () => {
  scrolled.value = window.scrollY > 50
}

onMounted(() => {
  if (process.client) {
    window.addEventListener('scroll', handleScroll)
  }
})

onUnmounted(() => {
  if (process.client) {
    window.removeEventListener('scroll', handleScroll)
  }
})
</script>
