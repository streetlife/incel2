<template>
  <div class="">
    <main>
      <HeroSection />
      <BookingSearch />
      <LatestPackages />
      <FeaturedPackages />
      <section class="py-16 bg-gradient-to-br from-primary to-primary-dark text-white">
        <div class="container mx-auto px-4 text-center reveal">
          <h2 class="text-3xl md:text-4xl font-bold mb-4">Start Your Journey</h2>
          <h3 class="text-4xl md:text-5xl font-bold mb-6">Explore the World With Us</h3>
          <p class="text-xl text-white/90 mb-8">Exciting flight deals and tour packages!</p>
          <button class="bg-white text-primary font-bold py-4 px-10 rounded-full hover:bg-gray-100 transition-all duration-300 transform hover:scale-105">
            Discover Packages
          </button>
        </div>
      </section>
      <WhyChooseUs />
      <WhatsAppContact />
    </main>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useScrollReveal } from '~/composables/useScrollReveal'

const { revealElements } = useScrollReveal()

onMounted(() => {
  revealElements()
})
</script>
