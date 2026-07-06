<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, type CSSProperties } from "vue";
import { ArrowLeft, ArrowRight, MapPin } from "lucide-vue-next";
import { useCurrency } from "../composables/useCurrency";

interface Package {
  id: number | string;
  package_name: string;
  location: string;
  category: string;
  inclusions?: string;
  description?: string;
  date_from?: string;
  date_to?: string;
  status?: number;
  poster?: string;
  picture1?: string;
  picture2?: string;
  picture3?: string;
  picture4?: string;
  banner?: string;
  price?: number | string;
  currency?: string;
}

interface Props {
  packages: Package[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: "design", pkg: Package): void;
}>();

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80";

function onImageError(event: Event) {
  const img = event.target as HTMLImageElement;
  if (img.src !== FALLBACK_IMAGE) img.src = FALLBACK_IMAGE;
}

function getHeroImage(pkg: Package): string {
  return (
    pkg.poster ||
    pkg.picture1 ||
    pkg.picture2 ||
    pkg.picture3 ||
    pkg.picture4 ||
    pkg.banner ||
    FALLBACK_IMAGE
  );
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    month: "short",
    year: "numeric",
  });
}

const activeIndex = ref(0);
const windowWidth = ref(0);
const { format } = useCurrency();

const isMobile = computed(() => windowWidth.value < 768);
const isTablet = computed(
  () => windowWidth.value >= 768 && windowWidth.value < 1024,
);

const cardDimensions = computed(() => {
  if (isMobile.value) return { width: 280, height: 400 };
  if (isTablet.value) return { width: 380, height: 480 };
  return { width: 520, height: 550 };
});

const cardOffsets = computed(() => {
  if (isMobile.value) return { adjacent: 200, far: 350, hidden: 500 };
  if (isTablet.value) return { adjacent: 300, far: 480, hidden: 600 };
  return { adjacent: 380, far: 560, hidden: 700 };
});

const carouselHeightClass = computed(() => {
  if (isMobile.value) return "h-[400px]";
  if (isTablet.value) return "h-[480px]";
  return "h-[550px]";
});

const updateWindowWidth = () => {
  windowWidth.value = window.innerWidth;
};
onMounted(() => {
  updateWindowWidth();
  window.addEventListener("resize", updateWindowWidth);
});
onUnmounted(() => {
  window.removeEventListener("resize", updateWindowWidth);
});

const nextSlide = () => {
  activeIndex.value = (activeIndex.value + 1) % props.packages.length;
};
const prevSlide = () => {
  activeIndex.value =
    (activeIndex.value - 1 + props.packages.length) % props.packages.length;
};
const setActiveIndex = (index: number) => {
  activeIndex.value = index;
};

// Clicking a non-active card brings it to focus; clicking the active card opens builder
const handleCardClick = (index: number) => {
  if (getOffset(index) === 0) {
    emit("design", props.packages[index]);
  } else {
    setActiveIndex(index);
  }
};

const getOffset = (index: number) => {
  const total = props.packages.length;
  let offset = index - activeIndex.value;
  if (offset > total / 2) offset -= total;
  if (offset < -total / 2) offset += total;
  return offset;
};

const getCardTransform = (offset: number) => {
  const o = cardOffsets.value;
  if (offset === 0)
    return {
      x: 0,
      scale: 1,
      rotateY: 0,
      zIndex: 50,
      opacity: 1,
      visibility: "visible" as const,
    };

  if (Math.abs(offset) === 1)
    return {
      x: offset * o.adjacent,
      scale: isMobile.value ? 0.75 : 0.8,
      rotateY: offset * (isMobile.value ? -10 : -15),
      zIndex: 30,
      opacity: isMobile.value ? 0.5 : 0.7,
      visibility: "visible" as const,
    };

  if (Math.abs(offset) === 2) {
    if (isMobile.value)
      return {
        x: offset * o.hidden,
        scale: 0.5,
        rotateY: 0,
        zIndex: 0,
        opacity: 0,
        visibility: "hidden" as const,
      };
    return {
      x: offset * o.far,
      scale: isTablet.value ? 0.65 : 0.6,
      rotateY: offset * -25,
      zIndex: 10,
      opacity: 0.4,
      visibility: "visible" as const,
    };
  }

  return {
    x: offset > 0 ? o.hidden : -o.hidden,
    scale: 0.4,
    rotateY: 0,
    zIndex: 0,
    opacity: 0,
    visibility: "hidden" as const,
  };
};

const getCardStyle = (index: number): CSSProperties => {
  const offset = getOffset(index);
  const transform = getCardTransform(offset);
  const dim = cardDimensions.value;
  return {
    position: "absolute",
    transformStyle: "preserve-3d",
    transform: `translateX(${transform.x}px) scale(${transform.scale}) rotateY(${transform.rotateY}deg)`,
    opacity: transform.opacity,
    zIndex: transform.zIndex,
    visibility: transform.visibility,
    transition: "all 0.6s cubic-bezier(0.32, 0.72, 0, 1)",
    top: "50%",
    left: "50%",
    width: `${dim.width}px`,
    height: `${dim.height}px`,
    marginLeft: `${-dim.width / 2}px`,
    marginTop: `${-dim.height / 2}px`,
  };
};

const getCardClass = (index: number) => {
  const offset = getOffset(index);
  const isCenter = offset === 0;
  const isVisible = Math.abs(offset) <= 2;
  return [
    "rounded-2xl md:rounded-[2rem] overflow-hidden shadow-2xl",
    isCenter
      ? "shadow-black/50 cursor-pointer"
      : "shadow-black/20 cursor-pointer",
    !isCenter && isVisible ? "grayscale-[0.2]" : "",
  ]
    .filter(Boolean)
    .join(" ");
};
</script>

<template>
  <div class="relative w-full py-8 md:py-12 overflow-hidden">
    <button
      @click="prevSlide"
      class="absolute left-2 md:left-4 lg:left-12 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-14 md:h-14 rounded-full bg-white/90 backdrop-blur-md border border-neutral-200 text-neutral-900 flex items-center justify-center shadow-xl hover:scale-110 hover:bg-white transition-all cursor-pointer"
      aria-label="Previous slide"
    >
      <ArrowLeft class="w-4 h-4 md:w-6 md:h-6" />
    </button>

    <button
      @click="nextSlide"
      class="absolute right-2 md:right-4 lg:right-12 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-14 md:h-14 rounded-full bg-white/90 backdrop-blur-md border border-neutral-200 text-neutral-900 flex items-center justify-center shadow-xl hover:scale-110 hover:bg-white transition-all cursor-pointer"
      aria-label="Next slide"
    >
      <ArrowRight class="w-4 h-4 md:w-6 md:h-6" />
    </button>

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
            :src="getHeroImage(pkg)"
            :alt="pkg.package_name"
            :class="[
              'w-full h-full object-cover transition-transform duration-700',
              getOffset(index) === 0 ? 'scale-100' : 'scale-105',
            ]"
            @error="onImageError"
          />

          <div
            :class="[
              'absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent transition-opacity duration-300',
              getOffset(index) === 0 ? 'opacity-100' : 'opacity-70',
            ]"
          />

          <div
            v-if="pkg.price"
            class="absolute top-3 right-3 md:top-5 md:right-5 z-10 bg-white/95 backdrop-blur-md text-neutral-900 rounded-xl md:rounded-2xl px-3 py-1.5 md:px-4 md:py-2 shadow-lg text-right"
          >
            <p
              class="text-[9px] md:text-[10px] uppercase tracking-wider text-neutral-500 leading-none mb-0.5"
            >
              From
            </p>
            <p class="text-sm md:text-lg font-bold leading-none text-primary">
              {{ format(Number(pkg.price)) }}
            </p>
          </div>

          <Transition name="fade-slide">
            <div
              v-show="getOffset(index) === 0"
              class="absolute bottom-0 left-0 right-0 p-4 md:p-5 lg:p-6 text-white"
            >
              <div class="flex flex-wrap items-center gap-2 mb-2">
                <span
                  class="bg-primary px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                >
                  {{ pkg.category }}
                </span>
                <span
                  class="flex items-center text-[10px] font-medium bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full"
                >
                  <MapPin class="w-2.5 h-2.5 mr-1" /> {{ pkg.location }}
                </span>
              </div>

              <h3
                class="text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold mb-2 md:mb-3 leading-tight tracking-tight drop-shadow-lg line-clamp-2"
              >
                {{ pkg.package_name }}
              </h3>

              <div
                v-if="pkg.date_from || pkg.date_to"
                class="flex items-center gap-1.5 text-xs text-white/70 mb-3"
              >
                <svg
                  class="w-3.5 h-3.5 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>{{ formatDate(pkg.date_from) }}</span>
                <span v-if="pkg.date_to"> → {{ formatDate(pkg.date_to) }}</span>
              </div>

              <!-- Updated CTA — triggers builder instead of navigating -->
              <div
                class="flex items-center justify-between border-t border-white/20 pt-3 md:pt-4 mt-3 md:mt-4 gap-3"
              >
                <p class="text-white/70 text-[11px] leading-tight max-w-[55%]">
                  Design your experience from this destination
                </p>
                <button
                  @click.stop="emit('design', pkg)"
                  class="shrink-0 rounded-full flex items-center py-2 bg-white text-black hover:bg-primary hover:text-white border-0 font-semibold px-3 md:px-4 text-xs md:text-sm transition-colors duration-200"
                >
                  Buy Now
                  <ArrowRight class="w-3 h-3 md:w-3.5 md:h-3.5 ml-1.5" />
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </div>

    <div class="flex justify-center gap-2 mt-6 md:mt-8">
      <button
        v-for="(pkg, index) in packages"
        :key="index"
        @click="setActiveIndex(index)"
        :class="[
          'h-2 rounded-full transition-all duration-300',
          index === activeIndex
            ? 'bg-primary w-6 md:w-8'
            : 'bg-neutral-300 hover:bg-neutral-400 w-2',
        ]"
        :aria-label="`Go to slide ${index + 1}`"
      />
    </div>
  </div>
</template>

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
