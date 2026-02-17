<template>
  <section class="py-20 bg-white sm:px-24 px-4">
    <div class="container mx-auto px-4">
      <div class="text-center mb-4 reveal">
        <p class="text-primary font-semibold mb-2">Discover Local Gems</p>
        <h2 class="section-title">Experience Dubai & UAE</h2>
        <p class="section-subtitle">
          Immerse yourself in the wonders of the Emirates with our expertly curated local experiences.
        </p>
      </div>
      
      <div class="reveal">
        <swiper
          :modules="modules"
          :slides-per-view="1"
          :space-between="30"
          :loop="true"
          :autoplay="{
            delay: 4000,
            disableOnInteraction: false,
          }"
          :pagination="{ clickable: true }"
          :navigation="true"
          :breakpoints="{
            640: {
              slidesPerView: 2,
            },
            1024: {
              slidesPerView: 3,
            },
            1280: {
              slidesPerView: 4,
            },
          }"
          class="pb-12 local-tours-carousel"
        >
          <swiper-slide v-for="tour in localTours" :key="tour.id">
            <div class="card group cursor-pointer h-full">
              <!-- Image -->
              <div class="relative h-64 overflow-hidden">
                <img 
                  :src="tour.image" 
                  :alt="tour.title"
                  class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div class="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full flex items-center space-x-1">
                  <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span class="text-sm font-semibold text-gray-900">{{ tour.rating }}</span>
                </div>
                <div class="absolute top-4 left-4">
                  <span class="bg-primary/90 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{{ tour.duration }}</span>
                  </span>
                </div>
              </div>
              
              <!-- Content -->
              <div class="p-6">
                <h3 class="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors">
                  {{ tour.title }}
                </h3>
                
                <!-- Features -->
                <div class="space-y-2 mb-4">
                  <div v-for="feature in tour.features" :key="feature" class="flex items-start space-x-2 text-sm text-gray-600">
                    <svg class="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                    <span>{{ feature }}</span>
                  </div>
                </div>
                
                <!-- Price and CTA -->
                <div class="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div>
                    <p class="text-sm text-gray-500">Price per person</p>
                    <span class="text-2xl font-bold text-primary">
                      AED {{ tour.price }}
                    </span>
                  </div>
                  <button class="bg-accent hover:bg-accent-dark text-white font-semibold px-6 py-2 rounded-lg transition-all duration-300">
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          </swiper-slide>
        </swiper>
      </div>
      
      <div class="text-center mt-12 reveal">
        <button class="btn-secondary">
          View All Tours
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

const modules = [Navigation, Pagination, Autoplay]

const localTours = [
  {
    id: 1,
    title: 'Dubai Desert Safari with BBQ Dinner',
    duration: '6 hours',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1624062999726-083e5268525d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNlcnQlMjBzYWZhcmklMjBEdWJhaXxlbnwxfHx8fDE3NjIzMTUzNDZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    price: 299,
    features: ['Dune bashing in 4x4', 'Camel riding']
  },
  {
    id: 2,
    title: 'Burj Khalifa At The Top + Dubai Aquarium',
    duration: '4 hours',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1643904736472-8b77e93ca3d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxEdWJhaSUyMHNreWxpbmUlMjBCdXJqJTIwS2hhbGlmYXxlbnwxfHx8fDE3NjIyODc0OTN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    price: 449,
    features: ['124th & 125th floor access', 'Dubai Aquarium ticket']
  },
  {
    id: 3,
    title: 'Full Day Dubai City Tour',
    duration: '8 hours',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1514315234814-ceafc3e7f19d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaXR5JTIwdG91ciUyMGd1aWRlfGVufDF8fHx8MTc2MjI1ODMxNXww&ixlib=rb-4.1.0&q=80&w=1080',
    price: 199,
    features: ['Burj Al Arab photo stop', 'Old Dubai & souks']
  },
  {
    id: 4,
    title: 'Dubai Marina Luxury Dhow Cruise with Dinner',
    duration: '2 hours',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1749849934727-bc57c0bd9dd2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjB5YWNodCUyMER1YmFpJTIwbWFyaW5hfGVufDF8fHx8MTc2MjM3MjI4OXww&ixlib=rb-4.1.0&q=80&w=1080',
    price: 249,
    features: ['Buffet dinner', 'Live entertainment']
  }
]
</script>

<style scoped>
.local-tours-carousel :deep(.swiper-button-next),
.local-tours-carousel :deep(.swiper-button-prev) {
  background: rgba(26, 115, 232, 0.9);
  width: 48px;
  height: 48px;
  border-radius: 50%;
}

.local-tours-carousel :deep(.swiper-button-next):hover,
.local-tours-carousel :deep(.swiper-button-prev):hover {
  background: rgb(26, 115, 232);
}

.local-tours-carousel :deep(.swiper-button-next):after,
.local-tours-carousel :deep(.swiper-button-prev):after {
  font-size: 16px;
  font-weight: bold;
  color: white;
}

.local-tours-carousel :deep(.swiper-pagination-bullet) {
  background: #cbd5e1;
  opacity: 1;
}

.local-tours-carousel :deep(.swiper-pagination-bullet-active) {
  background: #1a73e8;
}
</style>
