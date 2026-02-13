<script setup lang="ts">
import { onMounted } from 'vue'

const coreValues = [
  {
    title: 'Trust',
    description: 'We build lasting relationships through transparency and reliability'
  },
  {
    title: 'Value',
    description: 'Competitive pricing without compromising on quality or experience'
  },
  {
    title: 'Service',
    description: 'Dedicated support team available 24/7 for your peace of mind'
  },
  {
    title: 'Expertise',
    description: 'Deep destination knowledge and industry partnerships worldwide'
  }
]

const features = [
  { label: 'Licensed DMC' },
  { label: 'Expert Team' },
  { label: '24/7 Support' },
  { label: 'Global Network' }
]

const stats = [
  { value: '6+ Years', label: 'Industry Experience' },
  { value: 'UAE Licensed', label: 'Fully Regulated DMC' },
  { value: '10,000+', label: 'Happy Travelers' },
  { value: '95%', label: 'Customer Satisfaction' }
]

// Scroll reveal animation
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

  // Observe all elements with reveal class
  document.querySelectorAll('.reveal').forEach(el => {
    observer.observe(el)
  })
})
</script>

<template>
  <div class="min-h-screen">
    <main>
      <!-- Hero Section -->
      <section 
        class="relative py-32 px-6 text-center bg-cover bg-center bg-no-repeat"
        style="background-image: url('https://images.unsplash.com/photo-1643904736472-8b77e93ca3d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxEdWJhaSUyMHNreWxpbmUlMjBCdXJqJTIwS2hhbGlmYXxlbnwxfHx8fDE3NjIyODc0OTN8MA&ixlib=rb-4.1.0&q=80&w=1080')"
      >
        <!-- Overlay -->
        <div class="absolute inset-0 bg-black/50"></div>
        
        <!-- Content -->
        <div class="relative z-10 max-w-7xl mx-auto reveal">
          <h1 class="text-4xl md:text-5xl font-bold mb-4 text-white">About Incel Tourism</h1>
          <p class="text-xl text-gray-100 mb-2">Your trusted partner in creating unforgettable travel experiences</p>
          <p class="text-base text-gray-200 italic">Establishing Excellence Since 2018</p>
        </div>
      </section>

      <!-- About Section -->
      <section class="py-16 px-6">
        <div class="max-w-7xl mx-auto">
          <h2 class="text-3xl md:text-4xl font-bold mb-8 text-gray-900 reveal">Global Reach, Local Expertise</h2>
          
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div class="reveal">
              <p class="mb-6 leading-relaxed text-gray-700">
                Incel Tourism is a fully licensed Destination Management Company (DMC) based in Dubai, UAE, 
                with a comprehensive office in Lagos, Nigeria, strategically positioned to serve travelers 
                across Sub-Saharan Africa.
              </p>
              
              <p class="mb-6 leading-relaxed text-gray-700">
                Since our establishment, we have been committed to delivering exceptional travel experiences, 
                from visa processing and curated tour packages to local excursions and comprehensive travel support.
              </p>
              
              <p class="mb-6 leading-relaxed text-gray-700">
                Our expert team combines deep destination knowledge with personalized service, ensuring every 
                journey exceeds expectations. Whether you're planning a family vacation, business trip, or 
                spiritual pilgrimage, we're here to make it seamless and memorable.
              </p>

              <div class="grid grid-cols-2 gap-4 mt-8">
                <div 
                  v-for="(feature, index) in features" 
                  :key="feature.label" 
                  class="p-4 bg-gray-100 rounded-lg text-center font-semibold text-gray-800 reveal"
                  :style="{ transitionDelay: `${index * 100}ms` }"
                >
                  {{ feature.label }}
                </div>
              </div>
            </div>

            <div class="reveal">
              <img 
                src="https://images.unsplash.com/photo-1758223725156-ee49cc327a46?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjB0cmF2ZWwlMjBmYW1pbHl8ZW58MXx8fHwxNzYyMzcxNjc2fDA&ixlib=rb-4.1.0&q=80&w=1080" 
                alt="Travel experience"
                class="w-full h-auto rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      <!-- Promise Section -->
      <section class="py-16 px-6 bg-gray-50">
        <div class="max-w-7xl mx-auto">
          <h3 class="text-2xl md:text-3xl font-bold text-center mb-2 reveal">Our Promise</h3>
          <p class="text-center text-lg text-gray-600 mb-12 reveal">Creating memories that last a lifetime.</p>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div 
              v-for="(stat, index) in stats" 
              :key="stat.label" 
              class="text-center reveal"
              :style="{ transitionDelay: `${index * 150}ms` }"
            >
              <div class="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{{ stat.value }}</div>
              <div class="text-sm text-gray-600">{{ stat.label }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Core Values Section -->
      <section class="py-16 px-6">
        <div class="max-w-7xl mx-auto">
          <h2 class="text-3xl md:text-4xl font-bold mb-4 text-gray-900 reveal">Our Core Values</h2>
          <p class="text-lg text-gray-600 mb-8 text-center reveal">
            The principles that guide everything we do and define our commitment to excellence
          </p>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            <div 
              v-for="(value, index) in coreValues" 
              :key="value.title" 
              class="p-8 bg-white border border-gray-200 rounded-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-xl reveal"
              :style="{ transitionDelay: `${index * 100}ms` }"
            >
              <h3 class="text-2xl font-bold mb-4 text-gray-900">{{ value.title }}</h3>
              <p class="text-gray-600 leading-relaxed">{{ value.description }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Mission Section -->
      <section class="py-16 px-6 bg-gray-50">
        <div class="max-w-7xl mx-auto">
          <h2 class="text-3xl md:text-4xl font-bold mb-8 text-gray-900 reveal">Our Mission</h2>
          <blockquote class="text-2xl italic text-gray-800 text-center max-w-4xl mx-auto p-8 border-l-4 border-gray-900 bg-white reveal">
            "To be the leading DMC connecting Africa to the world, delivering exceptional travel 
            experiences through expert guidance."
          </blockquote>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
/* Reveal animation styles */
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