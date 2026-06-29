<template>
  <section class="relative h-[75vh] w-full overflow-hidden pb-5">
    <div class="absolute inset-0 w-full h-full">
      <video
        ref="videoEl"
        autoplay
        muted
        loop
        playsinline
        class="absolute inset-0 w-full h-full object-cover"
        aria-describedby="dubai-video-desc"
      >
        <source :src="videoSrc" type="video/mp4" />
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
      <h1 class="text-[2rem] sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tighter leading-[0.9] mix-blend-overlay opacity-90">
        {{ heroData?.title ?? 'DISCOVER' }}
        <br />
      </h1>
      <p class="text-base sm:text-lg md:text-xl text-white/70 max-w-xs sm:max-w-xl mx-auto font-light leading-relaxed mt-4 mb-6 animate-slide-up animation-delay-400">
        {{ heroData?.description ?? 'Visas, tours & curated packages at the best value' }}
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { useHeroStore } from '../stores/hero'

const heroStore = useHeroStore()
const { heroData } = storeToRefs(heroStore)

const videoEl = ref<HTMLVideoElement | null>(null)

const DEFAULT_VIDEO_URL = 'https://res.cloudinary.com/dvnx0es3u/video/upload/v1782748184/tourism_landing_page_video_vjshv9.mp4'

const videoSrc = computed(() => heroData.value?.video_url ?? DEFAULT_VIDEO_URL)

watch(videoSrc, async () => {
  await nextTick()
  if (videoEl.value) {
    videoEl.value.load()
    videoEl.value.play().catch(() => {
      // Browser may block autoplay until user interaction — safe to ignore here
    })
  }
})

onMounted(async () => {
  await heroStore.fetchHero()
})
</script>
