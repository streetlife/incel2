<template>
  <section class="py-20 bg-white">
    <div class="container mx-auto px-4">
      <div class="text-center mb-12 reveal">
        <h2 class="section-title">Planning a Trip?</h2>
        <p class="section-subtitle">
          Luckily no destination is too far away. You can travel from country-to-country within hours to experience a wide variety of cultures and landscapes.
        </p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div 
          v-for="(destination, index) in destinations" 
          :key="destination.name"
          class="group cursor-pointer reveal"
          :style="{ animationDelay: `${index * 100}ms` }"
        >
          <div class="relative h-96 rounded-2xl overflow-hidden shadow-lg">
            <img 
              :src="destination.image" 
              :alt="destination.name"
              class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            <div class="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h3 class="text-2xl font-bold mb-2 group-hover:text-accent transition-colors">
                {{ destination.name }}
              </h3>
              <p class="text-white/90 flex items-center space-x-2">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd" />
                </svg>
                <span>{{ destination.packages }} Packages</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const destinations = [
  {
    name: 'Dubai & UAE',
    packages: 15,
    image: 'https://images.unsplash.com/photo-1718789967298-09132d1404bc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxEdWJhaSUyMHNreWxpbmUlMjBjaXR5fGVufDF8fHx8MTc2MjYyOTgzMHww&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    name: 'Maldives',
    packages: 8,
    image: 'https://images.unsplash.com/photo-1698726654862-377c0218dfdc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxNYWxkaXZlcyUyMGJlYWNoJTIwcmVzb3J0fGVufDF8fHx8MTc2MjYyOTgzMHww&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    name: 'Paris, France',
    packages: 12,
    image: 'https://images.unsplash.com/photo-1431274172761-fca41d930114?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxQYXJpcyUyMEVpZmZlbCUyMFRvd2VyfGVufDF8fHx8MTc2MjU4NDc4M3ww&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    name: 'Santorini, Greece',
    packages: 6,
    image: 'https://images.unsplash.com/photo-1673485220135-3554ae67cafd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxTYW50b3JpbmklMjBHcmVlY2UlMjBibHVlfGVufDF8fHx8MTc2MjYyOTgzMnww&ixlib=rb-4.1.0&q=80&w=1080'
  }
]
</script>
