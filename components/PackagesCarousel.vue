<template>
  <div class="relative w-full py-8 md:py-12 overflow-hidden">
    <!-- Navigation Arrows -->
    <button
      @click="prevSlide"
      class="absolute left-2 md:left-4 lg:left-12 top-1/2 -translate-y-1/2 z-[60] w-10 h-10 md:w-14 md:h-14 rounded-full bg-white/90 backdrop-blur-md border border-neutral-200 text-neutral-900 flex items-center justify-center shadow-xl hover:scale-110 hover:bg-white transition-all cursor-pointer"
      aria-label="Previous slide"
    >
      <ArrowLeft class="w-4 h-4 md:w-6 md:h-6" />
    </button>

    <button
      @click="nextSlide"
      class="absolute right-2 md:right-4 lg:right-12 top-1/2 -translate-y-1/2 z-[60] w-10 h-10 md:w-14 md:h-14 rounded-full bg-white/90 backdrop-blur-md border border-neutral-200 text-neutral-900 flex items-center justify-center shadow-xl hover:scale-110 hover:bg-white transition-all cursor-pointer"
      aria-label="Next slide"
    >
      <ArrowRight class="w-4 h-4 md:w-6 md:h-6" />
    </button>

    <!-- Carousel Container -->
    <div class="relative w-full max-w-7xl mx-auto px-4">
      <div 
        :class="carouselHeightClass"
        class="relative w-full"
        style="perspective: 1500px"
      >
        <div
          v-for="(pkg, index) in packages"
          :key="pkg.id"
          :style="getCardStyle(index)"
          :class="getCardClass(index)"
          @click="handleCardClick(index)"
        >
          <img
            :src="pkg.image"
            :alt="pkg.title"
            :class="['w-full h-full object-cover transition-transform duration-700', 
              getOffset(index) === 0 ? 'scale-100' : 'scale-105'
            ]"
          />
          
          <!-- Gradient Overlay -->
          <div 
            :class="['absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent transition-opacity duration-300',
              getOffset(index) === 0 ? 'opacity-100' : 'opacity-70'
            ]" 
          />

          <!-- Content -->
          <Transition name="fade-slide">
            <div
              v-show="getOffset(index) === 0"
              class="absolute bottom-0 left-0 right-0 p-4 md:p-5 lg:p-6 text-white"
            >
              <div class="flex flex-wrap items-center gap-2 mb-2">
                <span class="bg-primary px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  {{ pkg.category }}
                </span>
                <span class="flex items-center text-[10px] font-medium bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full">
                  <MapPin class="w-2.5 h-2.5 mr-1" /> {{ pkg.location }}
                </span>
              </div>

              <h3 class="text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold mb-2 md:mb-3 leading-tight tracking-tight drop-shadow-lg">
                {{ pkg.title }}
              </h3>

              <div class="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 md:gap-4 border-t border-white/20 pt-3 md:pt-4 mt-3 md:mt-4">
                <div>
                  <p class="text-xs text-white/70 mb-1">Starting Price</p>
                  <div class="text-base md:text-lg lg:text-xl font-bold text-primary">
                    AED {{ pkg.price.toLocaleString() }}
                  </div>
                </div>
                <button 
                  size="sm" 
                  class="rounded-full flex items-center py-2 bg-white text-black hover:bg-primary hover:text-white border-0 font-semibold px-3 md:px-4 text-xs md:text-sm"
                >
                  View Details <ArrowRight class="w-3 h-3 md:w-3.5 md:h-3.5 ml-1.5" />
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </div>

    <!-- Dot Indicators -->
    <div class="flex justify-center gap-2 mt-6 md:mt-8">
      <button
        v-for="(pkg, index) in packages"
        :key="index"
        @click="setActiveIndex(index)"
        :class="['w-2 h-2 rounded-full transition-all duration-300',
          index === activeIndex 
            ? 'bg-primary w-6 md:w-8' 
            : 'bg-neutral-300 hover:bg-neutral-400'
        ]"
        :aria-label="`Go to slide ${index + 1}`"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, type CSSProperties } from 'vue'
import { ArrowLeft, ArrowRight, MapPin } from 'lucide-vue-next'
import { navigateTo } from 'nuxt/app'

interface Package {
  id: number | string
  title: string
  location: string
  duration?: string
  image: string
  price: number
  oldPrice?: number
  discount?: number
  category?: string
  highlights?: string[]
}

interface Props {
  packages: Package[]
}

const props = defineProps<Props>()

const activeIndex = ref(0)
const windowWidth = ref(0)

// Responsive breakpoints
const isMobile = computed(() => windowWidth.value < 768)
const isTablet = computed(() => windowWidth.value >= 768 && windowWidth.value < 1024)
const isDesktop = computed(() => windowWidth.value >= 1024)

// Responsive card dimensions
const cardDimensions = computed(() => {
  if (isMobile.value) {
    return { width: 280, height: 400 }
  } else if (isTablet.value) {
    return { width: 380, height: 480 }
  } else {
    return { width: 520, height: 550 }
  }
})

// Responsive offsets
const cardOffsets = computed(() => {
  if (isMobile.value) {
    return {
      adjacent: 200,  // ±1
      far: 350,       // ±2
      hidden: 500
    }
  } else if (isTablet.value) {
    return {
      adjacent: 300,
      far: 480,
      hidden: 600
    }
  } else {
    return {
      adjacent: 380,
      far: 560,
      hidden: 700
    }
  }
})

// Carousel height class
const carouselHeightClass = computed(() => {
  if (isMobile.value) {
    return 'h-[400px]'
  } else if (isTablet.value) {
    return 'h-[480px]'
  } else {
    return 'h-[550px]'
  }
})

const updateWindowWidth = () => {
  windowWidth.value = window.innerWidth
}

onMounted(() => {
  updateWindowWidth()
  window.addEventListener('resize', updateWindowWidth)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateWindowWidth)
})

const nextSlide = () => {
  activeIndex.value = (activeIndex.value + 1) % props.packages.length
}

const prevSlide = () => {
  activeIndex.value = (activeIndex.value - 1 + props.packages.length) % props.packages.length
}

const setActiveIndex = (index: number) => {
  activeIndex.value = index
}

const handleCardClick = (index: number) => {
  const offset = getOffset(index)
  if (offset === 0) {
    navigateTo(`/packages/${props.packages[index].id}`)
  }
}

const getOffset = (index: number) => {
  const total = props.packages.length
  let offset = index - activeIndex.value
  
  if (offset > total / 2) {
    offset -= total
  } else if (offset < -total / 2) {
    offset += total
  }
  
  return offset
}

const getCardTransform = (offset: number) => {
  const offsets = cardOffsets.value
  
  // Center card
  if (offset === 0) {
    return {
      x: 0,
      scale: 1,
      rotateY: 0,
      zIndex: 50,
      opacity: 1,
      visibility: 'visible' as const
    }
  }
  
  // Adjacent cards (offset = ±1)
  if (Math.abs(offset) === 1) {
    return {
      x: offset * offsets.adjacent,
      scale: isMobile.value ? 0.75 : 0.8,
      rotateY: offset * (isMobile.value ? -10 : -15),
      zIndex: 30,
      opacity: isMobile.value ? 0.5 : 0.7,
      visibility: 'visible' as const
    }
  }
  
  // Far cards (offset = ±2) - hide on mobile
  if (Math.abs(offset) === 2) {
    if (isMobile.value) {
      return {
        x: offset * offsets.hidden,
        scale: 0.5,
        rotateY: 0,
        zIndex: 0,
        opacity: 0,
        visibility: 'hidden' as const
      }
    }
    return {
      x: offset * offsets.far,
      scale: isTablet.value ? 0.65 : 0.6,
      rotateY: offset * -25,
      zIndex: 10,
      opacity: 0.4,
      visibility: 'visible' as const
    }
  }
  
  // Hidden cards
  return {
    x: offset > 0 ? offsets.hidden : -offsets.hidden,
    scale: 0.4,
    rotateY: 0,
    zIndex: 0,
    opacity: 0,
    visibility: 'hidden' as const
  }
}

const getCardStyle = (index: number): CSSProperties => {
  const offset = getOffset(index)
  const transform = getCardTransform(offset)
  const dimensions = cardDimensions.value
  
  return {
    position: 'absolute' as const,
    transformStyle: 'preserve-3d' as const,
    transform: `translateX(${transform.x}px) scale(${transform.scale}) rotateY(${transform.rotateY}deg)`,
    opacity: transform.opacity,
    zIndex: transform.zIndex,
    visibility: transform.visibility,
    transition: 'all 0.6s cubic-bezier(0.32, 0.72, 0, 1)',
    top: '50%',
    left: '50%',
    width: `${dimensions.width}px`,
    height: `${dimensions.height}px`,
    marginLeft: `${-dimensions.width / 2}px`,
    marginTop: `${-dimensions.height / 2}px`,
  }
}

const getCardClass = (index: number) => {
  const offset = getOffset(index)
  const isCenter = offset === 0
  const isVisible = Math.abs(offset) <= 2
  
  return [
    'rounded-2xl md:rounded-[2rem] overflow-hidden shadow-2xl',
    isCenter ? 'shadow-black/50 cursor-pointer' : 'shadow-black/20 pointer-events-none',
    !isCenter && isVisible ? 'grayscale-[0.2]' : ''
  ].filter(Boolean).join(' ')
}
</script>

<style scoped>
.fade-slide-enter-active {
  transition: all 0.4s ease;
  transition-delay: 0.15s;
}

.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-slide-enter-to {
  opacity: 1;
  transform: translateY(0);
}

.fade-slide-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>