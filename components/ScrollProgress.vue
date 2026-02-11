<script setup lang="ts">
import { useScroll, useWindowSize } from '@vueuse/core'
import { computed } from 'vue'

const { y } = useScroll(window)
const { height } = useWindowSize()

// Scroll progress (0 → 1)
const scrollProgress = computed(() => {
  // Guard against SSR
  if (typeof document === 'undefined' || !height.value) return 0
  return Math.min(y.value / (document.body.scrollHeight - height.value), 1)
})

// Show button after 20% scroll
const showButton = computed(() => scrollProgress.value > 0.2)

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <!-- Top progress bar -->
  <div
    class="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 z-[100] origin-left"
    :style="{ transform: `scaleX(${scrollProgress})` }"
  />

  <!-- Scroll to top button -->
  <Motion
    tag="button"
    class="fixed bottom-24 right-6 z-40 w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent text-white shadow-2xl flex items-center justify-center group hover:shadow-primary/50 transition-shadow"
    :initial="{ opacity: 0, scale: 0 }"
    :animate="showButton ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }"
    :hovered="{ scale: 1.1, y: -2 }"
    :pressed="{ scale: 0.9 }"
    aria-label="Scroll to top"
    @click="scrollToTop"
  >
    <svg
      class="w-6 h-6 group-hover:-translate-y-1 transition-transform"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M5 10l7-7m0 0l7 7m-7-7v18"
      />
    </svg>
  </Motion>
</template>