<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import PackagesCarousel from "./PackagesCarousel.vue";
import PackageQuoteModal from "./PackageQuoteModal.vue";
import { useGeneralService } from "../services/general.service";
import { mapPackage, type DisplayPackage } from "../utils/packageHelpers";
import type { PackageResponse } from "../types/general";
import AppToast from "../components/toast/AppToast.vue";

const rawPackages = ref<PackageResponse[]>([]);
const loading = ref(true);
const error = ref(false);
const generalService = useGeneralService();

const showQuote = ref(false);
const selectedPkg = ref<DisplayPackage | null>(null);
const showSuccess = ref(false);

function openQuote(pkg: DisplayPackage) {
  selectedPkg.value = pkg;
  showQuote.value = true;
}

function handleSubmitted() {
  showSuccess.value = true;
  setTimeout(() => {
    showSuccess.value = false;
  }, 5000);
}

const latestPackages = computed<DisplayPackage[]>(() =>
  rawPackages.value
    .filter((pkg) => pkg.status === 1)
    .slice(0, 3)
    .map(mapPackage),
);

async function fetchPackages() {
  loading.value = true;
  error.value = false;
  try {
    const data = await generalService.getPackages("recent");
    const list = Array.isArray(data) ? data : [];
    if (!list.length) throw new Error("Empty response");
    rawPackages.value = list;
  } catch (err) {
    console.error("LatestPackages fetch error:", err);
    error.value = true;
    rawPackages.value = samplePackages;
  } finally {
    loading.value = false;
  }
}

onMounted(fetchPackages);

const samplePackages: PackageResponse[] = [
  {
    id: 1,
    package_name: "Premium Umrah Package - Complete Spiritual Journey",
    country_code: "SAU",
    category: "UMRAH",
    location: "SAUDI ARABIA",
    status: 1,
    date_from: "2025-01-01 00:00:00",
    date_to: "2025-12-31 00:00:00",
    inclusions:
      "Return flights\n5 nights in Makkah\n5 nights in Madinah\nZiyarah tours\nVisa processing",
    poster:
      "https://images.unsplash.com/photo-1641108548286-6952aa3e3e3f?w=1080&q=80",
  },
  {
    id: 2,
    package_name: "Abu Dhabi Cultural Journey",
    country_code: "ARE",
    category: "TOURISM",
    location: "ABU DHABI, UAE",
    status: 1,
    date_from: "2025-03-01 00:00:00",
    date_to: "2025-11-30 00:00:00",
    inclusions:
      "4 nights 4* hotel\nDaily breakfast\nCity tour\nAirport transfers",
    poster:
      "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=1080&q=80",
  },
  {
    id: 3,
    package_name: "Maldives Paradise - Luxury Beach Escape",
    country_code: "MDV",
    category: "TOURISM",
    location: "MALDIVES",
    status: 1,
    date_from: "2025-04-01 00:00:00",
    date_to: "2025-10-31 00:00:00",
    inclusions:
      "Return flights\n5 nights overwater villa\nAll-inclusive meals\nSunset cruise",
    poster:
      "https://images.unsplash.com/photo-1637576308588-6647bf80944d?w=1080&q=80",
  },
];
</script>

<template>
  <AppToast />
  <section class="py-20 bg-gray-50 sm:px-14 px-4">
    <div class="container mx-auto px-4">
      <div class="text-center mb-3 relative z-10">
        <p
          class="text-primary font-semibold mb-2 uppercase tracking-widest text-xs"
        >
          Your Journey Awaits
        </p>
        <h2 class="mb-1 text-4xl lg:text-5xl font-bold text-neutral-900">
          Latest
          <span
            class="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent"
            >Packages</span
          >
        </h2>
        <p class="text-xl text-neutral-600 max-w-2xl mx-auto font-light">
          Curate your own travel experience
        </p>
      </div>

      <div v-if="loading" class="flex justify-center items-center h-[550px]">
        <div
          class="w-[520px] h-[550px] rounded-[2rem] bg-gray-200 animate-pulse"
        ></div>
      </div>

      <div
        v-if="error && !loading"
        class="flex items-center justify-between gap-4 bg-amber-50 border border-amber-200 rounded-xl px-5 py-3.5 mb-6 text-sm max-w-xl mx-auto"
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
          <span>Couldn't load live packages — showing default data.</span>
        </div>
        <button
          class="text-primary font-semibold hover:underline shrink-0"
          @click="fetchPackages"
        >
          Retry
        </button>
      </div>

      <div v-if="!loading">
        <PackagesCarousel :packages="latestPackages" @design="openQuote" />
      </div>

      <div class="text-center mt-8">
        <NuxtLink
          to="/packages"
          class="inline-flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-700 font-semibold px-8 py-3.5 rounded-xl text-sm hover:border-primary hover:text-primary transition-colors"
        >
          View All Packages
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
        </NuxtLink>
      </div>
    </div>

    <PackageQuoteModal
      :open="showQuote"
      :pkg="selectedPkg"
      @close="showQuote = false"
      @submitted="handleSubmitted"
    />

    <Transition name="toast">
      <div
        v-if="showSuccess"
        class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] bg-green-600 text-white px-6 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 text-sm font-semibold"
      >
        <svg class="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clip-rule="evenodd"
          />
        </svg>
        Quote request sent! We'll be in touch within 24 hours.
      </div>
    </Transition>
  </section>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(16px) scale(0.95);
}
</style>
