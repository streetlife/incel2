<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Anchor } from 'lucide-vue-next'

const cruises = ref([
  {
    id: 1,
    name: 'Mediterranean Grand Voyage',
    cruise_line: 'Royal Caribbean',
    image: 'https://images.unsplash.com/photo-1548574505-5e239809ee19?w=800',
    duration: '14 Days / 13 Nights',
    destinations: ['Barcelona', 'Rome', 'Athens', 'Santorini', 'Venice'],
    departure_date: '2026-06-15',
    ship: 'Symphony of the Seas',
    price: 2500000,
    includes: ['All Meals', 'Entertainment', 'Port Taxes', 'Onboard Activities'],
    rating: 4.9,
    reviews: 567,
    cabin_types: ['Interior', 'Ocean View', 'Balcony', 'Suite']
  },
  {
    id: 2,
    name: 'Caribbean Paradise',
    cruise_line: 'Norwegian Cruise Line',
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
    duration: '7 Days / 6 Nights',
    destinations: ['Miami', 'Cozumel', 'Grand Cayman', 'Jamaica', 'Nassau'],
    departure_date: '2026-07-01',
    ship: 'Norwegian Escape',
    price: 1200000,
    includes: ['All Meals', 'Entertainment', 'Free Wi-Fi', 'Beverage Package'],
    rating: 4.7,
    reviews: 423,
    cabin_types: ['Interior', 'Ocean View', 'Balcony', 'Suite']
  },
  {
    id: 3,
    name: 'Alaska Adventure',
    cruise_line: 'Princess Cruises',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    duration: '10 Days / 9 Nights',
    destinations: ['Seattle', 'Juneau', 'Skagway', 'Glacier Bay', 'Ketchikan'],
    departure_date: '2026-08-10',
    ship: 'Ruby Princess',
    price: 1800000,
    includes: ['All Meals', 'Shore Excursions', 'Photography Class', 'Scenic Views'],
    rating: 5,
    reviews: 312,
    cabin_types: ['Interior', 'Ocean View', 'Balcony', 'Suite']
  },
  {
    id: 4,
    name: 'Asia Explorer',
    cruise_line: 'Celebrity Cruises',
    image: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800',
    duration: '12 Days / 11 Nights',
    destinations: ['Singapore', 'Bangkok', 'Ho Chi Minh', 'Hong Kong', 'Taipei'],
    departure_date: '2026-09-05',
    ship: 'Celebrity Millennium',
    price: 2100000,
    includes: ['All Meals', 'Cultural Shows', 'Spa Access', 'Specialty Dining'],
    rating: 4.8,
    reviews: 289,
    cabin_types: ['Interior', 'Ocean View', 'Balcony', 'Suite']
  },
  {
    id: 5,
    name: 'Northern Europe Capitals',
    cruise_line: 'MSC Cruises',
    image: 'https://images.unsplash.com/photo-1542361345-89e58247f2d5?w=800',
    duration: '11 Days / 10 Nights',
    destinations: ['Copenhagen', 'Stockholm', 'Helsinki', 'St. Petersburg', 'Tallinn'],
    departure_date: '2026-07-20',
    ship: 'MSC Meraviglia',
    price: 1900000,
    includes: ['All Meals', 'City Tours', 'Entertainment', 'Kids Club'],
    rating: 4.6,
    reviews: 401,
    cabin_types: ['Interior', 'Ocean View', 'Balcony', 'Suite']
  },
  {
    id: 6,
    name: 'South Pacific Dream',
    cruise_line: 'Carnival Cruise Line',
    image: 'https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=800',
    duration: '15 Days / 14 Nights',
    destinations: ['Sydney', 'Fiji', 'Bora Bora', 'Moorea', 'Auckland'],
    departure_date: '2026-10-01',
    ship: 'Carnival Splendor',
    price: 2800000,
    includes: ['All Meals', 'Water Sports', 'Island Hopping', 'Spa Package'],
    rating: 4.9,
    reviews: 534,
    cabin_types: ['Interior', 'Ocean View', 'Balcony', 'Suite']
  }
])

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0
  }).format(price)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

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
</script>

<template>
  <div>
    <!-- Hero Section -->
    <section 
      class="relative py-24 px-6 bg-cover bg-center bg-no-repeat"
      style="background-image: url('https://images.unsplash.com/photo-1540946485063-a40da27545f8?w=1600')"
    >
      <div class="absolute inset-0 bg-black/50"></div>
      
      <div class="relative z-10 max-w-7xl mx-auto text-center">
        <h1 class="text-4xl md:text-5xl font-bold mb-4 text-white reveal">
          Luxury Cruise Packages
        </h1>
        <p class="text-xl text-gray-100 reveal">
          Sail the world's most beautiful destinations in comfort and style
        </p>
      </div>
    </section>

    <!-- Cruises Grid -->
    <section class="py-16 px-6 bg-gray-50">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-12 reveal">
          <h2 class="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Featured Cruise Packages</h2>
          <p class="text-lg text-gray-600">Experience unforgettable voyages across the world's oceans</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div 
            v-for="(cruise, index) in cruises" 
            :key="cruise.id"
            class="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden reveal"
            :style="{ transitionDelay: `${index * 100}ms` }"
          >
            <!-- Cruise Image -->
            <div class="relative h-64 overflow-hidden">
              <img 
                :src="cruise.image" 
                :alt="cruise.name"
                class="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
              />
              <div class="absolute top-4 left-4 bg-cyan-600 text-white px-3 py-1 rounded-full font-bold text-sm">
                {{ cruise.duration }}
              </div>
              <div class="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-gray-900 px-3 py-1 rounded-full font-bold text-sm">
                {{ cruise.cruise_line }}
              </div>
            </div>

            <!-- Cruise Info -->
            <div class="p-6">
              <div class="flex items-start gap-3 mb-3">
                <div class="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Anchor class="w-5 h-5 text-cyan-600" />
                </div>
                <div>
                  <h3 class="text-xl font-bold text-gray-900">{{ cruise.name }}</h3>
                  <p class="text-sm text-gray-600">{{ cruise.ship }}</p>
                </div>
              </div>

              <div class="flex items-center gap-2 mb-4">
                <span class="text-yellow-500">★</span>
                <span class="font-semibold">{{ cruise.rating }}</span>
                <span class="text-gray-600 text-sm">({{ cruise.reviews }} reviews)</span>
              </div>

              <div class="mb-4">
                <p class="text-sm font-semibold text-gray-700 mb-2">Destinations:</p>
                <div class="flex flex-wrap gap-1">
                  <span 
                    v-for="dest in cruise.destinations" 
                    :key="dest"
                    class="px-2 py-1 bg-cyan-50 text-cyan-700 text-xs rounded-full"
                  >
                    {{ dest }}
                  </span>
                </div>
              </div>

              <div class="mb-4">
                <p class="text-sm font-semibold text-gray-700 mb-2">Package Includes:</p>
                <ul class="space-y-1">
                  <li 
                    v-for="item in cruise.includes.slice(0, 3)" 
                    :key="item"
                    class="text-sm text-gray-600 flex items-start gap-2"
                  >
                    <span class="text-green-600 mt-0.5">✓</span>
                    <span>{{ item }}</span>
                  </li>
                </ul>
              </div>

              <div class="mb-4 pb-4 border-b">
                <p class="text-xs text-gray-600">Departure Date</p>
                <p class="font-semibold text-gray-900">{{ formatDate(cruise.departure_date) }}</p>
              </div>

              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-600">Starting from</p>
                  <p class="text-2xl font-bold text-cyan-600">{{ formatPrice(cruise.price) }}</p>
                  <p class="text-xs text-gray-500">per person</p>
                </div>
                <button class="px-6 py-3 bg-cyan-600 text-white rounded-lg font-semibold hover:bg-cyan-700 transition-colors">
                  Book Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Why Choose Cruises -->
    <section class="py-16 px-6 bg-white">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-12 reveal">
          <h2 class="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Why Choose a Cruise</h2>
          <p class="text-lg text-gray-600">Experience the ultimate vacation at sea</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div class="text-center reveal">
            <div class="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-3xl">🌊</span>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Multiple Destinations</h3>
            <p class="text-gray-600">Visit several countries in one trip without packing and unpacking</p>
          </div>

          <div class="text-center reveal" style="transition-delay: 100ms">
            <div class="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-3xl">🍽️</span>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">All-Inclusive</h3>
            <p class="text-gray-600">Meals, entertainment, and activities included in your package</p>
          </div>

          <div class="text-center reveal" style="transition-delay: 200ms">
            <div class="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-3xl">🎭</span>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Entertainment</h3>
            <p class="text-gray-600">World-class shows, casinos, pools, and activities onboard</p>
          </div>

          <div class="text-center reveal" style="transition-delay: 300ms">
            <div class="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-3xl">👨‍👩‍👧‍👦</span>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Family Friendly</h3>
            <p class="text-gray-600">Activities and programs for all ages, from kids to seniors</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
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