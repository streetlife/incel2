<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Package } from 'lucide-vue-next'

const packages = ref([
  {
    id: 1,
    name: 'Dubai Luxury Escape',
    destination: 'Dubai, UAE',
    duration: '5 Days / 4 Nights',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800',
    price: 850000,
    includes: ['Round-trip Flights', '4-Star Hotel', 'City Tours', 'Desert Safari', 'Breakfast Included'],
    rating: 4.8,
    reviews: 234
  },
  {
    id: 2,
    name: 'Paris Romance Package',
    destination: 'Paris, France',
    duration: '7 Days / 6 Nights',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800',
    price: 1200000,
    includes: ['Round-trip Flights', '5-Star Hotel', 'Seine River Cruise', 'Eiffel Tower Dinner', 'All Meals'],
    rating: 4.9,
    reviews: 456
  },
  {
    id: 3,
    name: 'Maldives Beach Paradise',
    destination: 'Maldives',
    duration: '6 Days / 5 Nights',
    image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800',
    price: 1500000,
    includes: ['Round-trip Flights', 'Overwater Villa', 'Water Sports', 'Spa Treatment', 'Full Board'],
    rating: 5,
    reviews: 189
  },
  {
    id: 4,
    name: 'Cape Town Adventure',
    destination: 'Cape Town, South Africa',
    duration: '8 Days / 7 Nights',
    image: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800',
    price: 950000,
    includes: ['Round-trip Flights', '4-Star Hotel', 'Table Mountain Tour', 'Wine Tasting', 'Safari Day Trip'],
    rating: 4.7,
    reviews: 312
  },
  {
    id: 5,
    name: 'Tokyo Experience',
    destination: 'Tokyo, Japan',
    duration: '6 Days / 5 Nights',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
    price: 1100000,
    includes: ['Round-trip Flights', 'Boutique Hotel', 'City Tours', 'Mt. Fuji Excursion', 'Cultural Activities'],
    rating: 4.8,
    reviews: 278
  },
  {
    id: 6,
    name: 'Bali Wellness Retreat',
    destination: 'Bali, Indonesia',
    duration: '7 Days / 6 Nights',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',
    price: 780000,
    includes: ['Round-trip Flights', 'Resort Stay', 'Yoga Classes', 'Spa Treatments', 'Healthy Meals'],
    rating: 4.9,
    reviews: 401
  }
])

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0
  }).format(price)
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
      style="background-image: url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1600')"
    >
      <div class="absolute inset-0 bg-black/40"></div>
      
      <div class="relative z-10 max-w-7xl mx-auto text-center">
        <h1 class="text-4xl md:text-5xl font-bold mb-4 text-white reveal">
          Vacation Packages
        </h1>
        <p class="text-xl text-gray-100 reveal">
          All-inclusive packages for your dream vacation
        </p>
      </div>
    </section>

    <!-- Packages Grid -->
    <section class="py-16 px-6 bg-gray-50">
      <div class="max-w-7xl mx-auto">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div 
            v-for="(pkg, index) in packages" 
            :key="pkg.id"
            class="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden reveal"
            :style="{ transitionDelay: `${index * 100}ms` }"
          >
            <!-- Package Image -->
            <div class="relative h-64 overflow-hidden">
              <img 
                :src="pkg.image" 
                :alt="pkg.name"
                class="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
              />
              <div class="absolute top-4 right-4 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full font-bold text-sm">
                {{ pkg.duration }}
              </div>
            </div>

            <!-- Package Info -->
            <div class="p-6">
              <div class="flex items-start gap-3 mb-3">
                <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Package class="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 class="text-xl font-bold text-gray-900">{{ pkg.name }}</h3>
                  <p class="text-sm text-gray-600">{{ pkg.destination }}</p>
                </div>
              </div>

              <div class="flex items-center gap-2 mb-4">
                <span class="text-yellow-500">★</span>
                <span class="font-semibold">{{ pkg.rating }}</span>
                <span class="text-gray-600 text-sm">({{ pkg.reviews }} reviews)</span>
              </div>

              <div class="mb-4">
                <p class="text-sm font-semibold text-gray-700 mb-2">Package Includes:</p>
                <ul class="space-y-1">
                  <li 
                    v-for="item in pkg.includes" 
                    :key="item"
                    class="text-sm text-gray-600 flex items-start gap-2"
                  >
                    <span class="text-green-600 mt-0.5">✓</span>
                    <span>{{ item }}</span>
                  </li>
                </ul>
              </div>

              <div class="flex items-center justify-between pt-4 border-t">
                <div>
                  <p class="text-sm text-gray-600">Starting from</p>
                  <p class="text-2xl font-bold text-gray-900">{{ formatPrice(pkg.price) }}</p>
                </div>
                <button class="px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors">
                  Book Now
                </button>
              </div>
            </div>
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
