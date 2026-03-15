<template>
  <section class="py-20 bg-gray-50 sm:px-24 px-4">
    <div class="container mx-auto px-4">
      <div class="text-center mb-16 reveal">
        <h2 class="section-title">Why Travel With Incel?</h2>
        <p class="section-subtitle">
          We don't just plan trips; we craft unforgettable experiences.
        </p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
        <div 
          v-for="(feature, index) in features" 
          :key="feature.title"
          class="text-center reveal"
          :style="{ animationDelay: `${index * 100}ms` }"
        >
          <div class="mb-6 flex justify-center">
            <div
              class="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300 transform hover:scale-110"
            >
              <component :is="feature.icon" class="w-10 h-10 text-primary" />
            </div>
          </div>
          <h3 class="text-lg font-bold text-gray-900 mb-2">
            {{ feature.title }}
          </h3>
          <p class="text-gray-600 text-sm leading-relaxed">
            {{ feature.description }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Plane, ShieldCheck, Lock, FileText, Headphones } from 'lucide-vue-next'

const features = [
  {
    title: 'UAE-licensed DMC',
    description: 'Fully licensed and regulated destination management company.',
    icon: ShieldCheck
  },
  {
    title: 'Flights/Curated Itineraries',
    description: 'Expertly designed travel experiences tailored to you.',
    icon: Plane
  },
  {
    title: 'Secure payments',
    description: 'Safe and encrypted processing.',
    icon: Lock
  },
  {
    title: 'Visa support',
    description: 'Expert assistance with all visa requirements.',
    icon: FileText
  },
  {
    title: '24/7 assistance',
    description: 'Round-the-clock support for your peace of mind.',
    icon: Headphones
  }
]
</script>
