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
          <template v-for="link in navLinks" :key="link.name">
            <!-- Regular Link -->
            <NuxtLink 
              v-if="!link.dropdown"
              :to="link.path"
              :class="[
                'font-medium transition-colors duration-200',
                scrolled ? 'text-white hover:text-gray-200' : 'text-white hover:text-gray-200'
              ]"
            >
              {{ link.name }}
            </NuxtLink>
            
            <!-- Dropdown Link -->
            <div 
              v-else
              class="relative group py-2"
              @mouseenter="openDropdown = link.name"
              @mouseleave="openDropdown = null"
            >
              <button
                :class="[
                  'font-medium transition-colors duration-200 flex items-center gap-1',
                  scrolled ? 'text-white hover:text-gray-200' : 'text-white hover:text-gray-200'
                ]"
              >
                {{ link.name }}
                <svg 
                  class="w-4 h-4 transition-transform duration-200"
                  :class="{ 'rotate-180': openDropdown === link.name }"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <!-- Dropdown Menu -->
              <div
                v-show="openDropdown === link.name"
                class="absolute left-0 pt-2 w-48"
              >
                <div class="bg-white rounded-lg shadow-xl py-2 animate-fade-in">
                  <NuxtLink
                    v-for="item in link.dropdown"
                    :key="item.name"
                    :to="item.path"
                    class="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                  >
                    {{ item.name }}
                  </NuxtLink>
                </div>
              </div>
            </div>
          </template>
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
        class="lg:hidden mt-4 pb-4 animate-slide-up bg-gray-800 px-5 rounded-lg"
      >
        <div class="flex flex-col space-y-2">
          <template v-for="link in navLinks" :key="link.name">
            <!-- Regular Mobile Link -->
            <NuxtLink 
              v-if="!link.dropdown"
              :to="link.path"
              class="font-medium text-white hover:text-gray-200 transition-colors duration-200 py-2"
              @click="mobileMenuOpen = false"
            >
              {{ link.name }}
            </NuxtLink>
            
            <!-- Mobile Dropdown -->
            <div v-else class="py-2">
              <button
                @click="toggleMobileDropdown(link.name)"
                class="w-full flex items-center justify-between font-medium text-white hover:text-gray-200 transition-colors duration-200"
              >
                {{ link.name }}
                <svg 
                  class="w-4 h-4 transition-transform duration-200"
                  :class="{ 'rotate-180': mobileOpenDropdown === link.name }"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <!-- Mobile Dropdown Items -->
              <div
                v-show="mobileOpenDropdown === link.name"
                class="mt-2 ml-4 space-y-2"
              >
                <NuxtLink
                  v-for="item in link.dropdown"
                  :key="item.name"
                  :to="item.path"
                  class="block text-gray-300 hover:text-white transition-colors duration-200 py-1"
                  @click="mobileMenuOpen = false"
                >
                  {{ item.name }}
                </NuxtLink>
              </div>
            </div>
          </template>
          
          <button 
            class="bg-yellow-400 hover:bg-yellow-500 text-neutral-900 px-6 py-2 rounded-full shadow-lg hover:shadow-xl transition-all mt-4"
          >
            Login
          </button>
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const scrolled = ref(false)
const mobileMenuOpen = ref(false)
const openDropdown = ref<string | null>(null)
const mobileOpenDropdown = ref<string | null>(null)

interface NavLink {
  name: string
  path?: string
  dropdown?: Array<{
    name: string
    path: string
  }>
}

const navLinks: NavLink[] = [
  { name: 'Home', path: '/' },
  { name: 'About Us', path: '/about-us' },
  { 
    name: 'Travel',
    dropdown: [
      { name: 'Flights', path: '/travel/flights' },
      { name: 'Hotels', path: '/travel/hotels' },
      { name: 'Tours', path: '/travel/tours' },
      { name: 'Visas', path: '/travel/visas' }
    ]
  },
  { 
    name: 'Services',
    dropdown: [
      { name: 'Vacation Packages', path: '/services/vacation-packages' },
      { name: 'Travel Insurance', path: '/services/travel-insurance' },
      { name: 'Airport Transfer', path: '/services/airport-transfer' },
      { name: 'Airport Protocol', path: '/services/airport-protocol' },
      { name: 'Tour Guide', path: '/services/tour-guide' },
      { name: 'Cruises', path: '/services/cruises' }
    ]
  },
  { 
    name: 'Visa',
    dropdown: [
      { name: 'UAE Visa', path: '/visa/uae' },
      { name: 'Global Visa', path: '/visa/global' },
    ]
  },
  { name: 'Contact', path: '/contact' }
]

const handleScroll = () => {
  scrolled.value = window.scrollY > 50
}

const toggleMobileDropdown = (name: string) => {
  mobileOpenDropdown.value = mobileOpenDropdown.value === name ? null : name
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

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.2s ease-out;
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}
</style>