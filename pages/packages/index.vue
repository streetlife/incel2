<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useHead } from "nuxt/app";
import { useGeneralService } from "../../services/general.service";
import { PackageResponse } from "../../types/general";
import {
  DisplayPackage,
  formatPackageDate,
  mapPackage,
} from "../../utils/packageHelpers";
import { useCurrency } from "../../composables/useCurrency";

useHead({ title: "All Packages" });

const generalService = useGeneralService();
const rawPackages = ref<PackageResponse[]>([]);
const loading = ref(true);
const error = ref(false);

const showQuote = ref(false);
const selectedPkg = ref<DisplayPackage | null>(null);
const showSuccess = ref(false);
const { format } = useCurrency();

const displayPackages = computed<DisplayPackage[]>(() =>
  rawPackages.value.filter((pkg) => pkg.status === 1).map(mapPackage),
);

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

async function fetchPackages() {
  loading.value = true;
  error.value = false;
  try {
    const data = await generalService.getPackages("all");
    const list = Array.isArray(data) ? data : [];
    if (!list.length) throw new Error("Empty response");
    rawPackages.value = list;
  } catch (err) {
    console.error("All packages fetch error:", err);
    error.value = true;
  } finally {
    loading.value = false;
  }
}

onMounted(fetchPackages);
</script>

<template>
  <section class="py-44 sm:py-44 bg-white px-4 sm:px-24">
    <div class="container mx-auto px-4">
      <div class="text-center mb-14">
        <p
          class="text-primary font-semibold mb-3 uppercase tracking-widest text-xs"
        >
          All Destinations
        </p>
        <h1
          class="text-4xl lg:text-5xl font-bold text-neutral-900 leading-tight mb-4"
        >
          Browse Every
          <span
            class="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent"
            >Package</span
          >
        </h1>
        <p class="text-lg text-neutral-500 max-w-xl mx-auto font-light">
          Pick a package, review what's included, and get a quote in minutes.
        </p>
      </div>

      <div
        v-if="loading"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <div
          v-for="i in 6"
          :key="i"
          class="rounded-2xl overflow-hidden bg-gray-100 animate-pulse h-[360px]"
        ></div>
      </div>

      <div
        v-if="error && !loading"
        class="flex items-center justify-between gap-4 bg-amber-50 border border-amber-200 rounded-xl px-5 py-3.5 mb-8 text-sm max-w-xl mx-auto"
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
          <span>Couldn't load packages right now.</span>
        </div>
        <button
          class="text-primary font-semibold hover:underline shrink-0"
          @click="fetchPackages"
        >
          Retry
        </button>
      </div>

      <div
        v-if="!loading && !error"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <div
          v-for="pkg in displayPackages"
          :key="pkg.id"
          class="group relative rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500 bg-white border border-gray-100"
          @click="openQuote(pkg)"
        >
          <div class="relative h-52 overflow-hidden">
            <img
              :src="
                pkg.poster ||
                'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80'
              "
              :alt="pkg.package_name"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div
              class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"
            ></div>
            <span
              v-if="pkg.category"
              class="absolute top-3 left-3 bg-white/20 backdrop-blur-sm text-white text-[11px] font-semibold px-3 py-1 rounded-full border border-white/30"
            >
              {{ pkg.category }}
            </span>
          </div>

          <div class="p-5">
            <div
              v-if="pkg.location"
              class="flex items-center gap-1 text-gray-400 text-xs mb-2"
            >
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
              {{ pkg.location }}
            </div>
            <h3
              class="font-bold text-gray-900 text-base leading-snug mb-1 line-clamp-2"
            >
              {{ pkg.package_name }}
            </h3>

            <div class="flex items-center justify-between mb-4">
              <p v-if="pkg.date_from" class="text-xs text-gray-400">
                Available {{ formatPackageDate(pkg.date_from) }}
              </p>
              <span
                v-if="pkg.price"
                class="inline-flex items-center bg-neutral-900 text-white text-xs font-bold px-3 py-1 rounded-full"
              >
                From {{ format(Number(pkg.price)) }}
              </span>
            </div>

            <button
              class="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-accent text-white font-semibold py-2.5 rounded-xl text-sm hover:opacity-90 transition-opacity group-hover:shadow-md mt-2"
            >
              View Details & Get Quote
            </button>
          </div>
        </div>
      </div>

      <div
        v-if="!loading && !error && !displayPackages.length"
        class="text-center text-gray-500 py-16"
      >
        No packages available right now — check back soon.
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
