<template>
  <div class="">
    <main>
      <HeroSection />
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
      <BlackFridayDeals />
      <ServicesSection />
      <PopularDestinations />
      <WhyChooseUs />
      <LocalTours />
      <WhatsAppContact />
      <Newsletter />
    </main>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useScrollReveal } from '~/composables/useScrollReveal'
import HeroSection from '../components/HeroSection.vue'
import LatestPackages from '../components/LatestPackages.vue'
import FeaturedPackages from '../components/FeaturedPackages.vue'
import BlackFridayDeals from '../components/BlackFridayDeals.vue'
import ServicesSection from '../components/ServicesSection.vue'
import PopularDestinations from '../components/PopularDestinations.vue'
import WhyChooseUs from '../components/WhyChooseUs.vue'
import LocalTours from '../components/LocalTours.vue'
import WhatsAppContact from '../components/WhatsAppContact.vue'
import Newsletter from '../components/Newsletter.vue'
import Footer from '../components/Footer.vue'

const { revealElements } = useScrollReveal()

onMounted(() => {
  revealElements()
})
</script>
