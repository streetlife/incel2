<template>
  <section class="py-20 bg-gray-50">
    <div class="container mx-auto px-4">
      <div class="text-center mb-12 reveal">
        <h2 class="section-title">Latest Packages</h2>
        <p class="section-subtitle">Curated experiences just for you</p>
      </div>
      
      <div class="reveal">
        <PackagesCarousel :packages="latestPackages" />
      </div>
    </div>
  </section>
</template>

<script setup>
const latestPackages = [
  {
    id: 1,
    title: 'Premium Umrah Package - Complete Spiritual Journey',
    category: 'Umrah',
    location: 'Mecca & Medina',
    image: 'https://images.unsplash.com/photo-1641108548286-6952aa3e3e3f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxNZWNjYSUyMHBpbGdyaW1hZ2V8ZW58MXx8fHwxNzYyMzM0Nzc4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    price: 5499,
    rating: 4.9
  },
  {
    id: 2,
    title: 'Abu Dhabi Cultural Journey',
    category: 'Inbound',
    location: 'Abu Dhabi, UAE',
    image: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxBYnUlMjBEaGFiaSUyMG1vc3F1ZXxlbnwxfHx8fDE3NjIzNzIyOTB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    price: 2499,
    rating: 4.9
  },
  {
    id: 3,
    title: 'Maldives Paradise - Luxury Beach Escape',
    category: 'Outbound',
    location: 'Maldives',
    image: 'https://images.unsplash.com/photo-1637576308588-6647bf80944d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxNYWxkaXZlcyUyMG92ZXJ3YXRlciUyMGJ1bmdhbG93fGVufDF8fHx8MTc2MjM3MjI5MHww&ixlib=rb-4.1.0&q=80&w=1080',
    price: 8999,
    rating: 4.9
  },
  {
    id: 4,
    title: 'Egypt Pyramids & Nile Cruise',
    category: 'Outbound',
    location: 'Egypt',
    image: 'https://images.unsplash.com/photo-1758223725156-ee49cc327a46?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjB0cmF2ZWwlMjBmYW1pbHl8ZW58MXx8fHwxNzYyMzcxNjc2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    price: 3799,
    rating: 4.9
  },
  {
    id: 5,
    title: 'Dubai Explorer - 5 Days Ultimate Experience',
    category: 'Inbound',
    location: 'Dubai, UAE',
    image: 'https://images.unsplash.com/photo-1643904736472-8b77e93ca3d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxEdWJhaSUyMHNreWxpbmUlMjBCdXJqJTIwS2hhbGlmYXxlbnwxfHx8fDE3NjIyODc0OTN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    price: 3999,
    rating: 4.9
  }
]
</script>
