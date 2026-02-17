<template>
  <header 
    :class="[
      'fixed top-0 w-full z-50 transition-all duration-300',
      scrolled ? 'bg-[#0076ad] backdrop-blur-md shadow-lg' : 'bg-transparent'
    ]"
  >
    <nav class="container mx-auto sm:px-24 px-4 py-2">
      <div class="flex items-center justify-between">
        <!-- Logo - Hidden when mobile menu is open -->
        <NuxtLink 
          to="/" 
          class="flex items-center space-x-2 z-50 relative transition-opacity duration-300"
          :class="{ 'lg:opacity-100': true, 'opacity-0 pointer-events-none': mobileMenuOpen }"
        >
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
                class="absolute left-0 pt-2 w-48 opacity-0 translate-y-[-10px] transition-all duration-200"
                :class="{ '!opacity-100 !translate-y-0': openDropdown === link.name }"
              >
                <div class="bg-white rounded-lg shadow-xl py-2">
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

        <div class="hidden lg:flex items-center gap-4">
          <!-- Currency Dropdown -->
          <div 
            class="relative"
            @mouseenter="currencyDropdownOpen = true"
            @mouseleave="currencyDropdownOpen = false"
          >
            <button
              :class="[
                'flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200',
                scrolled ? 'text-white hover:bg-white/10' : 'text-white hover:bg-white/10'
              ]"
            >
              <img class="w-8 h-8 object-contain" :src="currencies.find(c => c.code === selectedCurrency)?.flag" alt="">
              <span>{{ selectedCurrency }}</span>
              <svg 
                class="w-4 h-4 transition-transform duration-200"
                :class="{ 'rotate-180': currencyDropdownOpen }"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            <!-- Currency Dropdown Menu -->
            <div
              v-show="currencyDropdownOpen"
              class="absolute right-0 pt-2 w-48 opacity-0 translate-y-[-10px] transition-all duration-200"
              :class="{ '!opacity-100 !translate-y-0': currencyDropdownOpen }"
            >
              <div class="bg-white rounded-lg shadow-xl py-2">
                <button
                  v-for="currency in currencies"
                  :key="currency.code"
                  @click="selectCurrency(currency.code)"
                  class="w-full flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                  :class="{ 'bg-gray-50': selectedCurrency === currency.code }"
                >
                  <img class="w-8 h-8 object-contain" :src="currency.flag" alt="">
                  <div class="flex flex-col items-start">
                    <span class="font-medium">{{ currency.code }}</span>
                    <span class="text-xs text-gray-500">{{ currency.name }}</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

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
          class="lg:hidden z-50 relative p-2 rounded-lg transition-colors duration-200"
          :class="mobileMenuOpen ? 'text-gray-800 hover:bg-gray-100' : 'text-white hover:bg-white/10'"
          v-if="!mobileMenuOpen"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </nav>
    
    <!-- Mobile Menu Overlay -->
    <Transition name="fade">
      <div 
        v-if="mobileMenuOpen"
        class="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-40"
        @click="mobileMenuOpen = false"
      ></div>
    </Transition>
    
    <!-- Mobile Menu -->
    <Transition name="slide">
      <div 
        v-if="mobileMenuOpen"
        class="fixed top-0 right-0 h-full w-full sm:w-96 bg-white lg:hidden z-40 overflow-y-auto shadow-2xl"
      >
        <!-- Menu Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 class="text-2xl font-bold text-gray-900">Menu</h2>
          <button 
            @click="mobileMenuOpen = false"
            class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            v-if="mobileMenuOpen"
          >
            <svg class="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="flex flex-col h-full justify-between">
          <!-- Menu Items -->
          <div class="flex flex-col p-6 space-y-2">
            <template v-for="link in navLinks" :key="link.name">
              <!-- Regular Mobile Link -->
              <NuxtLink 
                v-if="!link.dropdown"
                :to="link.path"
                :class="[
                  'flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-200',
                  link.name === 'Home' 
                    ? 'bg-black text-white' 
                    : 'text-gray-900 hover:bg-gray-50'
                ]"
                @click="mobileMenuOpen = false"
              >
                <!-- Icon -->
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path v-if="link.name === 'Home'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  <path v-else-if="link.name === 'About Us'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path v-else-if="link.name === 'Contact'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span class="font-medium text-base">{{ link.name }}</span>
              </NuxtLink>
              
              <!-- Mobile Dropdown -->
              <div v-else>
                <button
                  @click="toggleMobileDropdown(link.name)"
                  class="w-full flex items-center justify-between gap-4 px-5 py-4 rounded-2xl text-gray-900 hover:bg-gray-50 transition-all duration-200"
                >
                  <div class="flex items-center gap-4">
                    <!-- Icon -->
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path v-if="link.name === 'Travel'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      <path v-else-if="link.name === 'Services'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      <path v-else-if="link.name === 'Visa'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span class="font-medium text-base">{{ link.name }}</span>
                  </div>
                  <svg 
                    class="w-5 h-5 transition-transform duration-300"
                    :class="{ 'rotate-180': mobileOpenDropdown === link.name }"
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                <!-- Mobile Dropdown Items -->
                <Transition name="expand">
                  <div
                    v-show="mobileOpenDropdown === link.name"
                    class="ml-14 space-y-1 mt-1"
                  >
                    <NuxtLink
                      v-for="item in link.dropdown"
                      :key="item.name"
                      :to="item.path"
                      class="block px-4 py-2.5 text-gray-600 hover:text-gray-900 transition-colors duration-200 text-sm"
                      @click="mobileMenuOpen = false"
                    >
                      {{ item.name }}
                    </NuxtLink>
                  </div>
                </Transition>
              </div>
            </template>
          </div>

          <!-- Bottom Section -->
          <div class="p-6 space-y-6 border-t border-gray-200">
            <!-- Currency Selector (Mobile) -->
            <div class="bg-gray-50 rounded-xl p-4">
              <p class="text-sm font-medium text-gray-700 mb-3">Currency</p>
              <div class="grid grid-cols-2 gap-2">
                <button
                  v-for="currency in currencies"
                  :key="currency.code"
                  @click="selectCurrency(currency.code)"
                  :class="[
                    'flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200',
                    selectedCurrency === currency.code
                      ? 'bg-black text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  ]"
                >
                  <img class="w-8 h-8 object-contain" :src="currency.flag" alt="">
                  <span>{{ currency.code }}</span>
                </button>
              </div>
            </div>

            <!-- Login & Sign Up Buttons -->
            <div class="flex gap-3">
              <button 
                class="flex-1 px-6 py-3 rounded-full font-medium border-2 border-black text-black hover:bg-gray-50 transition-all"
              >
                Login
              </button>
              <button 
                class="flex-1 px-6 py-3 rounded-full font-medium bg-black text-white hover:bg-gray-800 transition-all"
              >
                Sign Up
              </button>
            </div>

            <!-- Footer Links -->
            <div class="flex items-center justify-center gap-4 text-sm text-gray-600">
              <NuxtLink to="/support" class="hover:text-gray-900 transition-colors" @click="mobileMenuOpen = false">
                Support
              </NuxtLink>
              <span class="text-gray-400">•</span>
              <NuxtLink to="/about" class="hover:text-gray-900 transition-colors" @click="mobileMenuOpen = false">
                About
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const scrolled = ref(false)
const mobileMenuOpen = ref(false)
const openDropdown = ref<string | null>(null)
const mobileOpenDropdown = ref<string | null>(null)
const selectedCurrency = ref('NGN')
const currencyDropdownOpen = ref(false)

const currencies = [
  { code: 'NGN', flag: 'https://i0.wp.com/flag-shop.ca/wp-content/uploads/2024/11/img-flag-shop-flags-of-the-world-nigeria-flag-1-2.webp?fit=1080%2C540&ssl=1', name: 'Nigerian Naira' },
  { code: 'USD', flag: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Flag_of_the_United_States.svg/960px-Flag_of_the_United_States.svg.png?20240524035322', name: 'US Dollar' }
]

const selectCurrency = (code: string) => {
  selectedCurrency.value = code
  currencyDropdownOpen.value = false
}

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
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
/* Vue Transition animations - Required for <Transition> component */

/* Slide animation for mobile menu */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease-in-out;
}

.slide-enter-from {
  transform: translateX(100%);
}

.slide-leave-to {
  transform: translateX(100%);
}

/* Fade animation for overlay */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Expand animation for dropdown items */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}

.expand-enter-to {
  max-height: 500px;
  opacity: 1;
}
</style>