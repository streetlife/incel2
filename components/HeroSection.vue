<template>
  <section class="relative h-screen w-full overflow-hidden pb-5">
    <div class="absolute inset-0 w-full h-full">
      <video
        autoplay
        muted
        loop
        playsinline
        class="absolute inset-0 w-full h-full object-cover"
        aria-describedby="dubai-video-desc"
      >
        <source
          :src="heroData?.video_url ?? 'https://ik.imagekit.io/7ptk19utb/istockphoto-2171202163-640_adpp_is.mp4'"
          type="video/mp4"
        />
        <track
          kind="descriptions"
          src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1920"
          srclang="en"
          label="Audio descriptions"
        />
        <img
          src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1920"
          alt="Aerial view of Dubai skyline with modern skyscrapers"
          class="w-full h-full object-cover"
        />
      </video>
      <div class="absolute inset-0 bg-black/20"></div>
    </div>

    <div class="relative z-20 h-full flex flex-col items-center justify-center text-center px-4 max-w-7xl mx-auto">
      <h1 class="text-[3.5rem] sm:text-6xl md:text-7xl lg:text-[8rem] font-bold text-white tracking-tighter leading-[0.9] mix-blend-overlay opacity-90">
        {{ heroData?.title ?? 'DISCOVER' }}
        <br />
      </h1>
      <p class="text-base sm:text-lg md:text-xl text-white/70 max-w-xs sm:max-w-xl mx-auto font-light leading-relaxed mt-6 mb-10 animate-slide-up animation-delay-400">
        {{ heroData?.description ?? 'Visas, tours & curated packages at the best value' }}
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useHeroStore } from '../stores/hero'

const heroStore = useHeroStore()
const { heroData } = storeToRefs(heroStore)

onMounted(async () => {
  await heroStore.fetchHero()
})
</script>
