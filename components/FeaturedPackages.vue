<template>
  <section class="py-20 bg-white sm:px-24 px-4">
    <div class="container mx-auto px-4">
      <div class="text-center mb-4 reveal">
        <p class="text-primary font-semibold mb-2">Featured Packages</p>
        <h2 class="section-title">Handpicked Travel Experiences</h2>
        <p class="section-subtitle">
          Discover our curated collection of premium packages designed for unforgettable journeys.
        </p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div v-for="(pkg, index) in featuredPackages" :key="pkg.id" class="reveal" :style="{ animationDelay: `${index * 100}ms` }">
          <PackageCard :package="pkg" />
        </div>
      </div>
      
      <div class="text-center mt-12 reveal">
        <button class="btn-secondary">
          Explore All Destinations
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
const featuredPackages = [
  {
    id: 1,
    title: 'Dubai Explorer - 5 Days Ultimate Experience',
    category: 'Inbound',
    location: 'Dubai, UAE',
    duration: '5 Days / 4 Nights',
    type: 'Group Tour',
    image: 'https://images.unsplash.com/photo-1643904736472-8b77e93ca3d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxEdWJhaSUyMHNreWxpbmUlMjBCdXJqJTIwS2hhbGlmYXxlbnwxfHx8fDE3NjIyODc0OTN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    price: 3999,
    rating: 4.9
  },
  {
    id: 2,
    title: 'Maldives Paradise - Luxury Beach Escape',
    category: 'Outbound',
    location: 'Maldives',
    duration: '7 Days / 6 Nights',
    type: 'Group Tour',
    image: 'https://images.unsplash.com/photo-1637576308588-6647bf80944d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxNYWxkaXZlcyUyMG92ZXJ3YXRlciUyMGJ1bmdhbG93fGVufDF8fHx8MTc2MjM3MjI5MHww&ixlib=rb-4.1.0&q=80&w=1080',
    price: 8999,
    rating: 4.9
  },
  {
    id: 3,
    title: 'Premium Umrah Package - Complete Spiritual Journey',
    category: 'Umrah',
    location: 'Mecca & Medina',
    duration: '10 Days / 9 Nights',
    type: 'Group Tour',
    image: 'https://images.unsplash.com/photo-1641108548286-6952aa3e3e3f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxNZWNjYSUyMHBpbGdyaW1hZ2V8ZW58MXx8fHwxNzYyMzM0Nzc4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    price: 5499,
    rating: 4.9
  },
  {
    id: 4,
    title: 'Turkish Delight - Istanbul & Cappadocia',
    category: 'Outbound',
    location: 'Turkey',
    duration: '6 Days / 5 Nights',
    type: 'Group Tour',
    image: 'https://images.unsplash.com/photo-1659698867162-b6dc18792802?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxJc3RhbmJ1bCUyMFR1cmtleSUyMGFyY2hpdGVjdHVyZXxlbnwxfHx8fDE3NjIzNzIyOTB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    price: 4299,
    rating: 4.9
  },
  {
    id: 5,
    title: 'Abu Dhabi Cultural Journey',
    category: 'Inbound',
    location: 'Abu Dhabi, UAE',
    duration: '3 Days / 2 Nights',
    type: 'Group Tour',
    image: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxBYnUlMjBEaGFiaSUyMG1vc3F1ZXxlbnwxfHx8fDE3NjIzNzIyOTB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    price: 2499,
    rating: 4.9
  },
  {
    id: 6,
    title: 'Egypt Pyramids & Nile Cruise',
    category: 'Outbound',
    location: 'Egypt',
    duration: '8 Days / 7 Nights',
    type: 'Group Tour',
    image: 'https://images.unsplash.com/photo-1758223725156-ee49cc327a46?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjB0cmF2ZWwlMjBmYW1pbHl8ZW58MXx8fHwxNzYyMzcxNjc2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    price: 3799,
    rating: 4.9
  }
]
</script>
