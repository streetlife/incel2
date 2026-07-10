<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useGeneralService } from "../services/general.service";
import type { PackageResponse } from "../types/general";
import { useCurrency } from "../composables/useCurrency";

interface DisplaySlide {
  id: PackageResponse["id"];
  package_name: string;
  location: string;
  category: string;
  poster?: string;
  price?: number | string;
  currency?: string;
}

const rawPackages = ref<PackageResponse[]>([]);
const loading = ref(true);
const error = ref(false);
const generalService = useGeneralService();
const { format } = useCurrency();

const activeIndex = ref(0);
let autoplayTimer: ReturnType<typeof setInterval> | null = null;

const fallbackImage =
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&q=80";

function toTitleCase(str = ""): string {
  return str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

function mapPackage(pkg: PackageResponse): DisplaySlide {
  return {
    id: pkg.id,
    package_name: pkg.package_name,
    location: toTitleCase(pkg.location || pkg.country_code || ""),
    category: toTitleCase(pkg.category || ""),
    poster: pkg.poster,
    price: pkg.price,
    currency: pkg.currency,
  };
}

const displayPackages = computed<DisplaySlide[]>(() =>
  rawPackages.value
    .filter((pkg) => pkg.status === 1)
    .slice(0, 6)
    .map(mapPackage),
);

const currentSlide = computed(
  () => displayPackages.value[activeIndex.value] || null,
);

const designExperienceLink = computed(() => ({
  path: "/design-experience",
  query: currentSlide.value?.location
    ? { country: currentSlide.value.location }
    : {},
}));

function goToSlide(i: number) {
  activeIndex.value = i;
  startAutoplay();
}

function nextSlide() {
  if (!displayPackages.value.length) return;
  activeIndex.value = (activeIndex.value + 1) % displayPackages.value.length;
}

function prevSlide() {
  if (!displayPackages.value.length) return;
  activeIndex.value =
    (activeIndex.value - 1 + displayPackages.value.length) %
    displayPackages.value.length;
}

function stopAutoplay() {
  if (autoplayTimer) {
    clearInterval(autoplayTimer);
    autoplayTimer = null;
  }
}

function startAutoplay() {
  stopAutoplay();
  if (displayPackages.value.length <= 1) return;
  autoplayTimer = setInterval(nextSlide, 4500);
}

function pauseAutoplay() {
  stopAutoplay();
}

function resumeAutoplay() {
  startAutoplay();
}

async function fetchPackages() {
  loading.value = true;
  error.value = false;
  try {
    const data = await generalService.getPackages("all");
    const list = Array.isArray(data) ? data : [];
    if (!list.length) throw new Error("Empty response");
    rawPackages.value = list;
  } catch (err) {
    console.error("FeaturedPackages fetch error:", err);
    error.value = true;
    rawPackages.value = samplePackages;
  } finally {
    loading.value = false;
    activeIndex.value = 0;
    startAutoplay();
  }
}

const samplePackages: PackageResponse[] = [
  {
    id: 1,
    package_name: "Explore Dubai: 4 Nights 5 Days",
    country_code: "ARE",
    category: "TOURISM",
    location: "United Arab Emirates",
    status: 1,
    poster:
      "https://images.unsplash.com/photo-1643904736472-8b77e93ca3d7?w=1200&q=80",
  },
  {
    id: 2,
    package_name: "Maldives Paradise – Luxury Beach Escape",
    country_code: "MDV",
    category: "TOURISM",
    location: "Maldives",
    status: 1,
    poster:
      "https://images.unsplash.com/photo-1637576308588-6647bf80944d?w=1200&q=80",
  },
  {
    id: 3,
    package_name: "Premium Umrah Package – Complete Spiritual Journey",
    country_code: "SAU",
    category: "UMRAH",
    location: "Saudi Arabia",
    status: 1,
    poster:
      "https://images.unsplash.com/photo-1641108548286-6952aa3e3e3f?w=1200&q=80",
  },
  {
    id: 4,
    package_name: "Turkish Delight – Istanbul & Cappadocia",
    country_code: "TUR",
    category: "TOURISM",
    location: "Turkey",
    status: 1,
    poster:
      "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200&q=80",
  },
  {
    id: 5,
    package_name: "Abu Dhabi Cultural Journey",
    country_code: "ARE",
    category: "TOURISM",
    location: "Abu Dhabi, UAE",
    status: 1,
    poster:
      "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=1200&q=80",
  },
  {
    id: 6,
    package_name: "Egypt Pyramids & Nile Cruise",
    country_code: "EGY",
    category: "TOURISM",
    location: "Egypt",
    status: 1,
    poster:
      "https://images.unsplash.com/photo-1539768942893-daf53e448371?w=1200&q=80",
  },
];

onMounted(fetchPackages);
onUnmounted(stopAutoplay);
</script>

<template>
  <section class="py-24 bg-white sm:px-24 px-4 overflow-hidden">
    <div class="container mx-auto px-4">
      <div class="text-center mb-14 reveal">
        <p
          class="text-primary font-semibold mb-3 uppercase tracking-widest text-xs"
        >
          Build Your Journey
        </p>
        <h2
          class="text-4xl lg:text-5xl font-bold text-neutral-900 leading-tight mb-4"
        >
          Curate Your Own<br />
          <span
            class="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent"
            >Travel Experience</span
          >
        </h2>
        <p class="text-lg text-neutral-500 max-w-xl mx-auto font-light">
          Pick a destination that inspires you — then tell us exactly how you
          want to experience it.
        </p>
      </div>

      <div
        v-if="loading"
        class="rounded-3xl overflow-hidden bg-gray-100 animate-pulse h-[420px] sm:h-[480px]"
      ></div>

      <!-- Error banner -->
      <div
        v-if="error && !loading"
        class="flex items-center justify-between gap-4 bg-amber-50 border border-amber-200 rounded-xl px-5 py-3.5 mb-6 text-sm"
      >
        <div class="flex items-center gap-2 text-amber-700">
          <svg
            class="w-4 h-4 shrink-0"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>Couldn't load live packages — showing sample data.</span>
        </div>
        <button
          class="text-primary font-semibold hover:underline shrink-0"
          @click="fetchPackages"
        >
          Retry
        </button>
      </div>

      <div
        v-if="!loading"
        class="relative rounded-3xl overflow-hidden h-[420px] sm:h-[480px] shadow-xl group"
        @mouseenter="pauseAutoplay"
        @mouseleave="resumeAutoplay"
      >
        <Transition name="slide-fade" mode="out-in">
          <div :key="currentSlide?.id" class="absolute inset-0">
            <img
              :src="currentSlide?.poster || fallbackImage"
              :alt="currentSlide?.package_name"
              class="w-full h-full object-cover"
            />
            <div
              class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
            ></div>

            <div class="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
              <span
                v-if="currentSlide?.category"
                class="inline-block bg-white/20 backdrop-blur-sm text-white text-[11px] font-semibold px-3 py-1 rounded-full border border-white/30 mb-3"
              >
                {{ currentSlide.category }}
              </span>
              <h3
                class="text-white text-2xl sm:text-3xl font-bold leading-snug mb-1 max-w-lg"
              >
                {{ currentSlide?.package_name }}
              </h3>
              <p class="text-white/80 text-sm flex items-center gap-1.5">
                <svg
                  class="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {{ currentSlide?.location }}
              </p>
              <p
                v-if="currentSlide?.price"
                class="inline-flex items-center bg-white text-neutral-900 text-sm font-bold px-3.5 py-1.5 rounded-full shadow-sm mt-3"
              >
                From
                {{ format(Number(currentSlide.price)) }}
              </p>
            </div>
          </div>
        </Transition>

        <!-- Prev / Next -->
        <button
          v-if="displayPackages.length > 1"
          @click="prevSlide"
          aria-label="Previous destination"
          class="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white flex items-center justify-center hover:bg-white/30 transition-all opacity-0 group-hover:opacity-100"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <button
          v-if="displayPackages.length > 1"
          @click="nextSlide"
          aria-label="Next destination"
          class="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white flex items-center justify-center hover:bg-white/30 transition-all opacity-0 group-hover:opacity-100"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

        <!-- Dots -->
        <div
          v-if="displayPackages.length > 1"
          class="absolute top-5 right-5 flex gap-1.5"
        >
          <button
            v-for="(slide, i) in displayPackages"
            :key="slide.id"
            @click="goToSlide(i)"
            :aria-label="`Go to slide ${i + 1}`"
            class="h-1.5 rounded-full transition-all duration-300"
            :class="
              i === activeIndex
                ? 'w-6 bg-white'
                : 'w-1.5 bg-white/40 hover:bg-white/60'
            "
          ></button>
        </div>
      </div>

      <div class="text-center mt-10">
        <NuxtLink
          :to="designExperienceLink"
          class="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-accent text-white font-semibold px-8 py-3.5 rounded-xl text-sm hover:opacity-90 transition-opacity shadow-md"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 4v16m8-8H4"
            />
          </svg>
          Design My Experience
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: opacity 0.6s ease;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
}
</style>
