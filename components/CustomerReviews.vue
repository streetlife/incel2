<script setup>
import { ref } from 'vue'

const activeVideo = ref(null)
const openVideo = (video) => { activeVideo.value = video }

const textReviews = [
  {
    name: 'Adaeze Okonkwo', initials: 'AO', avatarColor: '#7c3aed',
    destination: 'Dubai, UAE', date: 'Feb 2025', rating: 5, featured: true, verified: true,
    text: 'Absolutely seamless from start to finish. My visa was processed in 3 days and the hotel they recommended was incredible. Will definitely book again for my Maldives trip!',
  },
  {
    name: 'Emeka Chukwu', initials: 'EC', avatarColor: '#0891b2',
    destination: 'London, UK', date: 'Jan 2025', rating: 5, featured: false, verified: true,
    text: 'The team handled every detail of my business trip including my UK visa. Professional, prompt and very affordable. Highly recommend to anyone travelling from Nigeria.',
  },
  {
    name: 'Fatima Al-Hassan', initials: 'FA', avatarColor: '#059669',
    destination: 'Istanbul, Turkey', date: 'Dec 2024', rating: 5, featured: false, verified: true,
    text: 'I was nervous travelling abroad alone for the first time but the travel package was so well put together. Hotel transfers, tours, everything. Felt completely safe.',
  },
  {
    name: 'Biodun Adeleke', initials: 'BA', avatarColor: '#dc2626',
    destination: 'Maldives', date: 'Nov 2024', rating: 5, featured: true, verified: true,
    text: 'Honeymoon trip to the Maldives — they exceeded every expectation. From the overwater bungalow to the private sunset cruise. Pure magic. Thank you!',
  },
  {
    name: 'Ngozi Peters', initials: 'NP', avatarColor: '#d97706',
    destination: 'Paris, France', date: 'Oct 2024', rating: 5, featured: false, verified: true,
    text: 'Got my Schengen visa approved on first attempt. The documentation guidance was spot on. The Paris itinerary they planned was also absolutely wonderful.',
  },
  {
    name: 'Tunde Williams', initials: 'TW', avatarColor: '#7c3aed',
    destination: 'Saudi Arabia', date: 'Sep 2024', rating: 5, featured: false, verified: true,
    text: 'Umrah package was flawlessly organised. Flights, accommodation in Makkah and Madinah, everything was handled. A deeply spiritual and stress-free experience.',
  },
]

const videoReviews = [
  {
    name: 'Chisom Eze', initials: 'CE', avatarColor: '#7c3aed',
    destination: 'Dubai, UAE', duration: '1:24',
    caption: "I couldn't believe how smooth the whole process was — from booking to landing in Dubai. Watch my full experience!",
    embedUrl: '', // e.g. https://www.youtube.com/embed/VIDEO_ID?autoplay=1
    thumbnail: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80',
  },
  {
    name: 'Olumide Bankole', initials: 'OB', avatarColor: '#0891b2',
    destination: 'London, UK', duration: '2:05',
    caption: 'My UK visa story — rejected twice before, approved first try with their help. This review is long overdue.',
    embedUrl: '',
    thumbnail: 'https://images.unsplash.com/photo-1529655683826-aba9b3e77383?w=600&q=80',
  },
  {
    name: 'Amina Yusuf', initials: 'AY', avatarColor: '#059669',
    destination: 'Istanbul, Turkey', duration: '1:48',
    caption: "A solo female traveller's honest review of the Istanbul tour package. Safe, stunning, and so worth it.",
    embedUrl: '',
    thumbnail: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=600&q=80',
  },
]
</script>

<template>
  <section class="py-20 bg-gray-50 overflow-hidden">
    <div class="container mx-auto px-4">
      <div class="text-center mb-14 reveal">
        <p class="text-xs font-semibold tracking-[0.25em] uppercase text-primary mb-3">What Travellers Say</p>
        <h2 class="text-3xl md:text-4xl font-bold text-gray-900">
          Real Stories, <span class="text-primary">Real Journeys</span>
        </h2>
        <p class="mt-3 text-gray-500 max-w-lg mx-auto text-sm leading-relaxed">
          Thousands of satisfied travellers have trusted us to plan their perfect trips.
        </p>

        <div class="inline-flex items-center gap-2 mt-6 bg-white border border-gray-200 rounded-full px-5 py-2 shadow-sm">
          <div class="flex">
            <svg v-for="i in 5" :key="i" class="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
          </div>
          <span class="text-sm font-semibold text-gray-800">4.9 out of 5</span>
          <span class="text-sm text-gray-400">· 1,200+ reviews</span>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 reveal">
        <div
          v-for="(review, i) in textReviews"
          :key="i"
          class="flex flex-col bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
          :class="review.featured ? 'border-[1.5px] border-primary' : 'border border-gray-200'"
        >
          <svg class="w-8 h-8 text-primary/20 mb-4 shrink-0" fill="currentColor" viewBox="0 0 32 32">
            <path d="M10 8C5.6 8 2 11.6 2 16v8h8v-8H5.8C5.9 13.8 7.7 12 10 12V8zm14 0c-4.4 0-8 3.6-8 8v8h8v-8h-4.2c.1-2.2 1.9-4 4.2-4V8z"/>
          </svg>

          <div class="flex mb-3">
            <svg v-for="s in review.rating" :key="s" class="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
          </div>

          <p class="text-gray-700 text-sm leading-relaxed flex-1 mb-5">"{{ review.text }}"</p>

          <div class="flex items-center gap-3 pt-4 border-t border-gray-100">
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              :style="{ background: review.avatarColor }"
            >
              <span class="text-white font-bold text-sm">{{ review.initials }}</span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-gray-900 truncate">{{ review.name }}</p>
              <p class="text-xs text-gray-400 truncate">{{ review.destination }} · {{ review.date }}</p>
            </div>
            <span
              v-if="review.verified"
              class="shrink-0 text-[0.65rem] font-semibold text-green-600 bg-green-50 rounded-full px-2 py-0.5 whitespace-nowrap"
            >
              ✓ Verified
            </span>
          </div>
        </div>
      </div>

      <div class="reveal">
        <p class="text-center text-xs font-semibold tracking-[0.2em] uppercase text-gray-400 mb-6">
          Video Testimonials
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="(video, i) in videoReviews"
            :key="i"
            class="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
            @click="openVideo(video)"
          >
            <div class="relative aspect-video overflow-hidden">
              <img
                :src="video.thumbnail"
                :alt="`Video review by ${video.name}`"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent"></div>
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/60 flex items-center justify-center hover:bg-primary hover:border-primary transition-all duration-200">
                  <svg class="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.841z"/>
                  </svg>
                </div>
              </div>
              <span class="absolute bottom-2.5 right-2.5 text-[0.72rem] font-semibold text-white bg-black/55 backdrop-blur-sm rounded px-1.5 py-0.5">
                {{ video.duration }}
              </span>
            </div>

            <div class="p-4">
              <div class="flex items-center gap-2 mb-2">
                <div
                  class="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  :style="{ background: video.avatarColor }"
                >
                  <span class="text-white font-bold text-xs">{{ video.initials }}</span>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold text-gray-900 truncate">{{ video.name }}</p>
                  <p class="text-xs text-gray-400 truncate">{{ video.destination }}</p>
                </div>
                <div class="flex shrink-0">
                  <svg v-for="s in 5" :key="s" class="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                </div>
              </div>
              <p class="text-xs text-gray-500 leading-relaxed line-clamp-2">{{ video.caption }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="text-center mt-14 reveal">
        <p class="text-sm text-gray-500 mb-4">Join thousands of happy travellers</p>
        <NuxtLink
          to="/travel/flights"
          class="inline-flex items-center gap-2 bg-primary text-white font-semibold px-8 py-3.5 rounded-full hover:bg-primary-dark hover:scale-105 transition-all duration-300 shadow-md shadow-primary/20"
        >
          Book Your Trip Today
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
          </svg>
        </NuxtLink>
      </div>
    </div>

    <Transition
      enter-active-class="transition-opacity duration-200"
      leave-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="activeVideo"
        class="fixed inset-0 bg-black/85 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
        @click.self="activeVideo = null"
      >
        <div class="relative w-full max-w-3xl aspect-video bg-black rounded-2xl overflow-hidden">
          <button
            class="absolute -top-10 right-0 w-8 h-8 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center text-white transition-colors duration-200 z-10"
            @click="activeVideo = null"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>

          <iframe
            v-if="activeVideo.embedUrl"
            :src="activeVideo.embedUrl"
            class="w-full h-full"
            allow="autoplay; fullscreen"
            allowfullscreen
            title="video"
          />
          <div v-else class="w-full h-full flex flex-col items-center justify-center text-white">
            <svg class="w-16 h-16 opacity-30 mb-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm12.553 1.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"/>
            </svg>
            <p class="text-sm opacity-60">Set <code class="opacity-80">embedUrl</code> on this video to display it here</p>
          </div>
        </div>
      </div>
    </Transition>
  </section>
</template>
