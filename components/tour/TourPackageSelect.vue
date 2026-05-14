<!-- Step 1: View tour details, set participant counts, choose a transfer option -->
<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useTourBookingStore } from '../../composables/useTourBookingStore'
import { useCurrency } from '../../composables/useCurrency'

const emit = defineEmits<(e: 'next') => void>()
const { state, fetchPackages, selectPackage, updateCounts, createBookingRecords } = useTourBookingStore()
const currency = useCurrency()
const adults = ref(state.adults)
const children = ref(state.children)
const infants = ref(state.infants)

const countError = ref('')
const proceeding = ref(false)

// ── Image gallery ────────────────────────────────────────────────────────────
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800'
const galleryIndex = ref(0)

const galleryImages = computed(() => {
  const imgs: { src: string; caption: string }[] = []
  const tour = state.tour
  if (!tour) return imgs
  const seen = new Set<string>()
  const add = (src: string, caption: string) => {
    if (src && !seen.has(src)) { seen.add(src); imgs.push({ src, caption }) }
  }
  if (tour.tourImages?.length) {
    // front image first
    const front = tour.tourImages.find((i: any) => i.isFrontImage === 1)
    if (front) add(front.imagePath, front.imageCaptionName || '')
    for (const img of tour.tourImages) {
      if (img !== front) add(img.imagePath, img.imageCaptionName || '')
    }
  } else if (tour.image) {
    add(tour.image, tour.name || '')
  }
  return imgs
})

function prevImg() { galleryIndex.value = (galleryIndex.value - 1 + galleryImages.value.length) % galleryImages.value.length }
function nextImg() { galleryIndex.value = (galleryIndex.value + 1) % galleryImages.value.length }
function onImgError(e: Event) { (e.target as HTMLImageElement).src = DEFAULT_IMAGE }

// ── Accordion sections ───────────────────────────────────────────────────────
const openSections = ref<Set<string>>(new Set(['description']))
function toggleSection(key: string) {
  if (openSections.value.has(key)) openSections.value.delete(key)
  else openSections.value.add(key)
}
function isOpen(key: string) { return openSections.value.has(key) }

onMounted(() => {
  currency.fetchRates()
  fetchPackages()
})

watch([adults, children, infants], ([a, c, i]) => {
  countError.value = ''
  updateCounts(a, c, i)
})

/** Strip HTML tags */
function stripHtml(html: string): string {
  return html?.replace(/<[^>]*>/g, '').trim() || ''
}

async function proceed() {
  if (adults.value < 1) { countError.value = 'At least 1 adult is required.'; return }

  proceeding.value = true
  countError.value = ''

  try {
    if (!state.selectedPackage && state.availablePackages.length > 0) {
      selectPackage(state.availablePackages[0])
    }
    createBookingRecords().catch(e => console.warn('[bookings/tour]', e?.message))
  } finally {
    proceeding.value = false
  }

  emit('next')
}
</script>

<template>
  <div class="space-y-5">

    <!-- ── Tour detail card ───────────────────────────────────────────────────── -->
    <div v-if="state.tour" class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

      <!-- ── Image gallery ──────────────────────────────────────────────────── -->
      <div class="relative bg-slate-200 overflow-hidden" :class="galleryImages.length ? 'h-56 sm:h-72' : 'h-40 sm:h-48'">
        <!-- Gallery slides -->
        <template v-if="galleryImages.length">
          <img
            v-for="(img, idx) in galleryImages"
            :key="img.src"
            :src="img.src"
            :alt="img.caption || state.tour.name"
            class="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
            :class="idx === galleryIndex ? 'opacity-100' : 'opacity-0'"
            @error="onImgError"
          />
          <!-- Prev / Next arrows (only when multiple images) -->
          <template v-if="galleryImages.length > 1">
            <button
              type="button"
              class="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors cursor-pointer border-none"
              @click="prevImg"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <button
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors cursor-pointer border-none"
              @click="nextImg"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 18l6-6-6-6"/></svg>
            </button>
            <!-- Dot indicators -->
            <div class="absolute bottom-12 left-0 right-0 flex justify-center gap-1.5">
              <button
                v-for="(_, idx) in galleryImages"
                :key="idx"
                type="button"
                class="w-1.5 h-1.5 rounded-full transition-colors cursor-pointer border-none p-0"
                :class="idx === galleryIndex ? 'bg-white' : 'bg-white/40'"
                @click="galleryIndex = idx"
              />
            </div>
            <!-- Counter badge -->
            <span class="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
              {{ galleryIndex + 1 }} / {{ galleryImages.length }}
            </span>
          </template>
        </template>
        <!-- Fallback if no images -->
        <img
          v-else
          :src="state.tour.image || DEFAULT_IMAGE"
          :alt="state.tour.name"
          class="w-full h-full object-cover"
          @error="onImgError"
        />

        <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
        <div class="absolute bottom-4 left-5 right-5 pointer-events-none">
          <p class="text-white font-bold text-lg leading-tight drop-shadow">{{ state.tour.name }}</p>
          <p class="text-white/80 text-xs mt-0.5">{{ state.searchParams.city }}, {{ state.searchParams.country }}</p>
        </div>
      </div>

      <!-- Thumbnail strip (when more than 1 image) -->
      <div v-if="galleryImages.length > 1" class="flex gap-2 px-4 py-3 overflow-x-auto border-b border-slate-100 scrollbar-hide">
        <button
          v-for="(img, idx) in galleryImages"
          :key="img.src"
          type="button"
          class="shrink-0 w-14 h-10 rounded-lg overflow-hidden border-2 transition-all cursor-pointer"
          :class="idx === galleryIndex ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'"
          @click="galleryIndex = idx"
        >
          <img :src="img.src" :alt="img.caption" class="w-full h-full object-cover" @error="onImgError" />
        </button>
      </div>

      <!-- Meta row -->
      <div class="flex flex-wrap items-center gap-x-5 gap-y-2 px-5 py-3 border-b border-slate-100">
        <span v-if="state.tour.duration" class="flex items-center gap-1 text-xs text-slate-600">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
          {{ state.tour.duration }}
        </span>
        <span v-if="state.tour.tourLanguage" class="flex items-center gap-1 text-xs text-slate-600">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
          {{ state.tour.tourLanguage }}
        </span>
        <span v-if="state.tour.type" class="flex items-center gap-1 text-xs text-slate-600">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          {{ state.tour.type }}
        </span>
        <span v-if="state.tour.rating" class="flex items-center gap-1 text-xs text-slate-600">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" stroke-width="1"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>
          {{ state.tour.rating }} · {{ state.tour.reviewCount?.toLocaleString() }} reviews
        </span>
        <span v-if="state.tour.cancellationPolicyName" class="flex items-center gap-1 text-xs"
          :class="state.tour.cancellationPolicyName.includes('Non-refundable') || state.tour.cancellationPolicyName.includes('Non Refundable') ? 'text-red-600' : 'text-green-700'">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
            :stroke="state.tour.cancellationPolicyName.includes('Non-refundable') || state.tour.cancellationPolicyName.includes('Non Refundable') ? '#ef4444' : '#16a34a'"
            stroke-width="2">
            <path v-if="!state.tour.cancellationPolicyName.includes('Non-refundable') && !state.tour.cancellationPolicyName.includes('Non Refundable')" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <template v-else><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></template>
          </svg>
          {{ state.tour.cancellationPolicyName }}
        </span>
      </div>

      <!-- Reporting / departure info -->
      <div v-if="state.tour.departurePoint || state.tour.reportingTime" class="px-5 py-3 border-b border-slate-100 space-y-1.5">
        <div v-if="state.tour.departurePoint" class="flex items-start gap-2 text-xs text-slate-600">
          <svg class="shrink-0 mt-0.5" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
          <span><span class="font-semibold text-slate-700">Departure: </span>{{ state.tour.departurePoint }}</span>
        </div>
        <div v-if="state.tour.reportingTime" class="flex items-start gap-2 text-xs text-slate-600">
          <svg class="shrink-0 mt-0.5" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          <span><span class="font-semibold text-slate-700">Meeting point: </span>{{ state.tour.reportingTime }}</span>
        </div>
      </div>

      <!-- Short description -->
      <div v-if="state.tour.tourShortDescription" class="px-5 py-3 border-b border-slate-100">
        <p class="text-sm text-slate-600 leading-relaxed">{{ stripHtml(state.tour.tourShortDescription) }}</p>
      </div>

      <!-- Inclusions / Exclusions -->
      <div v-if="state.tour.tourInclusion || state.tour.tourExclusion" class="px-5 py-3 flex flex-wrap gap-6">
        <div v-if="state.tour.tourInclusion" class="flex-1 min-w-[140px]">
          <p class="text-xs font-semibold text-green-700 mb-1.5">Included</p>
          <div class="text-xs text-slate-600 leading-relaxed tour-html" v-html="state.tour.tourInclusion" />
        </div>
        <div v-if="state.tour.tourExclusion" class="flex-1 min-w-[140px]">
          <p class="text-xs font-semibold text-red-600 mb-1.5">Not Included</p>
          <div class="text-xs text-slate-600 leading-relaxed tour-html" v-html="state.tour.tourExclusion" />
        </div>
      </div>
    </div>

    <!-- ── About this tour (full description) ────────────────────────────────── -->
    <div v-if="state.tour?.tourDescription" class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <button type="button" class="w-full flex items-center justify-between px-5 py-4 cursor-pointer bg-transparent border-none text-left" @click="toggleSection('description')">
        <p class="text-sm font-semibold text-slate-800">About This Tour</p>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" class="transition-transform shrink-0" :class="isOpen('description') ? 'rotate-180' : ''"><path d="M6 9l6 6 6-6"/></svg>
      </button>
      <div v-if="isOpen('description')" class="px-5 pb-5 border-t border-slate-100">
        <div class="text-sm text-slate-600 leading-relaxed tour-html pt-4" v-html="state.tour.tourDescription" />
      </div>
    </div>

    <!-- ── Itinerary ──────────────────────────────────────────────────────────── -->
    <div v-if="state.tour?.itenararyDescription" class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <button type="button" class="w-full flex items-center justify-between px-5 py-4 cursor-pointer bg-transparent border-none text-left" @click="toggleSection('itinerary')">
        <p class="text-sm font-semibold text-slate-800">Itinerary</p>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" class="transition-transform shrink-0" :class="isOpen('itinerary') ? 'rotate-180' : ''"><path d="M6 9l6 6 6-6"/></svg>
      </button>
      <div v-if="isOpen('itinerary')" class="px-5 pb-5 border-t border-slate-100">
        <div class="text-sm text-slate-600 leading-relaxed tour-html pt-4" v-html="state.tour.itenararyDescription" />
      </div>
    </div>

    <!-- ── Important Information ─────────────────────────────────────────────── -->
    <div v-if="state.tour?.importantInformation" class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <button type="button" class="w-full flex items-center justify-between px-5 py-4 cursor-pointer bg-transparent border-none text-left" @click="toggleSection('important')">
        <div class="flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <p class="text-sm font-semibold text-slate-800">Important Information</p>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" class="transition-transform shrink-0" :class="isOpen('important') ? 'rotate-180' : ''"><path d="M6 9l6 6 6-6"/></svg>
      </button>
      <div v-if="isOpen('important')" class="px-5 pb-5 border-t border-slate-100">
        <div class="text-sm text-slate-600 leading-relaxed tour-html pt-4" v-html="state.tour.importantInformation" />
      </div>
    </div>

    <!-- ── How to Redeem ──────────────────────────────────────────────────────── -->
    <div v-if="state.tour?.howToRedeem" class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <button type="button" class="w-full flex items-center justify-between px-5 py-4 cursor-pointer bg-transparent border-none text-left" @click="toggleSection('redeem')">
        <div class="flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          <p class="text-sm font-semibold text-slate-800">How to Redeem</p>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" class="transition-transform shrink-0" :class="isOpen('redeem') ? 'rotate-180' : ''"><path d="M6 9l6 6 6-6"/></svg>
      </button>
      <div v-if="isOpen('redeem')" class="px-5 pb-5 border-t border-slate-100">
        <div class="text-sm text-slate-600 leading-relaxed tour-html pt-4" v-html="state.tour.howToRedeem" />
      </div>
    </div>

    <!-- ── Guest Reviews ──────────────────────────────────────────────────────── -->
    <div v-if="state.tour?.tourReview?.length" class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <button type="button" class="w-full flex items-center justify-between px-5 py-4 cursor-pointer bg-transparent border-none text-left" @click="toggleSection('reviews')">
        <div class="flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" stroke-width="1"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>
          <p class="text-sm font-semibold text-slate-800">Guest Reviews</p>
          <span class="text-xs text-slate-400">({{ state.tour.tourReview.length }})</span>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" class="transition-transform shrink-0" :class="isOpen('reviews') ? 'rotate-180' : ''"><path d="M6 9l6 6 6-6"/></svg>
      </button>
      <div v-if="isOpen('reviews')" class="border-t border-slate-100">
        <!-- Rating summary -->
        <div class="flex items-center gap-4 px-5 py-4 border-b border-slate-100">
          <div class="text-center">
            <p class="text-3xl font-bold text-slate-900">{{ state.tour.rating }}</p>
            <div class="flex gap-0.5 mt-1 justify-center">
              <svg v-for="i in 5" :key="i" width="12" height="12" viewBox="0 0 24 24" :fill="i <= Number(state.tour.rating) ? '#f59e0b' : '#e2e8f0'" stroke="none"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>
            </div>
            <p class="text-xs text-slate-400 mt-0.5">{{ state.tour.reviewCount?.toLocaleString() }} reviews</p>
          </div>
        </div>
        <!-- Review cards -->
        <div class="divide-y divide-slate-100 max-h-96 overflow-y-auto">
          <div v-for="review in state.tour.tourReview" :key="review.reviewId" class="px-5 py-4 flex gap-3">
            <!-- Avatar -->
            <div class="shrink-0">
              <img
                v-if="review.imagePath"
                :src="review.imagePath"
                :alt="review.guestName"
                class="w-9 h-9 rounded-full object-cover bg-slate-100"
                @error="(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).nextElementSibling?.removeAttribute('style') }"
              />
              <div class="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm" :style="review.imagePath ? 'display:none' : ''">
                {{ review.guestName?.charAt(0)?.toUpperCase() || '?' }}
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-2 flex-wrap">
                <p class="text-sm font-semibold text-slate-800">{{ review.guestName }}</p>
                <div class="flex items-center gap-1">
                  <svg v-for="i in 5" :key="i" width="10" height="10" viewBox="0 0 24 24" :fill="i <= Number(review.rating) ? '#f59e0b' : '#e2e8f0'" stroke="none"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>
                  <span v-if="review.visitMonth" class="text-xs text-slate-400 ml-1">{{ review.visitMonth }}</span>
                </div>
              </div>
              <p class="text-xs font-medium text-slate-700 mt-1">{{ review.reviewTitle }}</p>
              <p class="text-xs text-slate-500 mt-1 leading-relaxed">{{ review.reviewContent }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Cancellation Policy ─────────────────────────────────────────────────── -->
    <div v-if="state.tour?.cancellationPolicyName || state.tour?.childCancellationPolicyName" class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <button type="button" class="w-full flex items-center justify-between px-5 py-4 cursor-pointer bg-transparent border-none text-left" @click="toggleSection('cancellation')">
        <div class="flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <p class="text-sm font-semibold text-slate-800">Cancellation Policy</p>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" class="transition-transform shrink-0" :class="isOpen('cancellation') ? 'rotate-180' : ''"><path d="M6 9l6 6 6-6"/></svg>
      </button>
      <div v-if="isOpen('cancellation')" class="px-5 pb-5 border-t border-slate-100 space-y-4 pt-4">
        <div v-if="state.tour.cancellationPolicyName">
          <p class="text-xs font-semibold text-slate-700 mb-1">{{ state.tour.cancellationPolicyName }}</p>
          <div v-if="state.tour.cancellationPolicyDescription" class="text-xs text-slate-600 leading-relaxed tour-html" v-html="state.tour.cancellationPolicyDescription" />
        </div>
        <div v-if="state.tour.childCancellationPolicyName" class="border-t border-slate-100 pt-3">
          <p class="text-xs font-semibold text-slate-700 mb-1">{{ state.tour.childCancellationPolicyName }}</p>
          <div v-if="state.tour.childCancellationPolicyDescription" class="text-xs text-slate-600 leading-relaxed tour-html" v-html="state.tour.childCancellationPolicyDescription" />
        </div>
      </div>
    </div>

    <!-- ── Terms & Conditions ─────────────────────────────────────────────────── -->
    <div v-if="state.tour?.termsAndConditions" class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <button type="button" class="w-full flex items-center justify-between px-5 py-4 cursor-pointer bg-transparent border-none text-left" @click="toggleSection('terms')">
        <p class="text-sm font-semibold text-slate-800">Terms &amp; Conditions</p>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" class="transition-transform shrink-0" :class="isOpen('terms') ? 'rotate-180' : ''"><path d="M6 9l6 6 6-6"/></svg>
      </button>
      <div v-if="isOpen('terms')" class="px-5 pb-5 border-t border-slate-100">
        <div class="text-sm text-slate-600 leading-relaxed tour-html pt-4" v-html="state.tour.termsAndConditions" />
      </div>
    </div>

    <!-- ── Useful Information ─────────────────────────────────────────────────── -->
    <div v-if="state.tour?.usefulInformation" class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <button type="button" class="w-full flex items-center justify-between px-5 py-4 cursor-pointer bg-transparent border-none text-left" @click="toggleSection('useful')">
        <p class="text-sm font-semibold text-slate-800">Useful Information</p>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" class="transition-transform shrink-0" :class="isOpen('useful') ? 'rotate-180' : ''"><path d="M6 9l6 6 6-6"/></svg>
      </button>
      <div v-if="isOpen('useful')" class="px-5 pb-5 border-t border-slate-100">
        <div class="text-sm text-slate-600 leading-relaxed tour-html pt-4" v-html="state.tour.usefulInformation" />
      </div>
    </div>

    <!-- ── FAQ ───────────────────────────────────────────────────────────────── -->
    <div v-if="state.tour?.faqDetails" class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <button type="button" class="w-full flex items-center justify-between px-5 py-4 cursor-pointer bg-transparent border-none text-left" @click="toggleSection('faq')">
        <p class="text-sm font-semibold text-slate-800">FAQ</p>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" class="transition-transform shrink-0" :class="isOpen('faq') ? 'rotate-180' : ''"><path d="M6 9l6 6 6-6"/></svg>
      </button>
      <div v-if="isOpen('faq')" class="px-5 pb-5 border-t border-slate-100">
        <div class="text-sm text-slate-600 leading-relaxed tour-html pt-4" v-html="state.tour.faqDetails" />
      </div>
    </div>

    <!-- ── Participant counter ─────────────────────────────────────────────── -->
    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div class="px-5 py-3.5 bg-slate-50 border-b border-slate-100">
        <p class="text-sm font-semibold text-slate-800">Participants</p>
        <p class="text-xs text-slate-400 mt-0.5">Set counts before selecting a transfer option</p>
      </div>
      <div class="p-5 space-y-4">

        <!-- Adults -->
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-slate-800">Adults</p>
            <p class="text-xs text-slate-500">12 years+</p>
          </div>
          <div class="flex items-center gap-3">
            <button type="button" :disabled="adults <= 1"
              class="w-7 h-7 rounded-full border border-slate-300 flex items-center justify-center hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer bg-white"
              @click="adults > 1 && adults--">
              <span class="text-base font-semibold leading-none">−</span>
            </button>
            <span class="w-5 text-center text-sm font-semibold text-slate-900">{{ adults }}</span>
            <button type="button" :disabled="adults >= 20"
              class="w-7 h-7 rounded-full border border-slate-300 flex items-center justify-center hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer bg-white"
              @click="adults < 20 && adults++">
              <span class="text-base font-semibold leading-none">+</span>
            </button>
          </div>
        </div>

        <!-- Children -->
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-slate-800">Children</p>
            <p class="text-xs text-slate-500">2 to 12 years</p>
          </div>
          <div class="flex items-center gap-3">
            <button type="button" :disabled="children <= 0"
              class="w-7 h-7 rounded-full border border-slate-300 flex items-center justify-center hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer bg-white"
              @click="children > 0 && children--">
              <span class="text-base font-semibold leading-none">−</span>
            </button>
            <span class="w-5 text-center text-sm font-semibold text-slate-900">{{ children }}</span>
            <button type="button" :disabled="children >= 20"
              class="w-7 h-7 rounded-full border border-slate-300 flex items-center justify-center hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer bg-white"
              @click="children < 20 && children++">
              <span class="text-base font-semibold leading-none">+</span>
            </button>
          </div>
        </div>

        <!-- Infants -->
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-slate-800">Infants</p>
            <p class="text-xs text-slate-500">0 to 2 years</p>
          </div>
          <div class="flex items-center gap-3">
            <button type="button" :disabled="infants <= 0"
              class="w-7 h-7 rounded-full border border-slate-300 flex items-center justify-center hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer bg-white"
              @click="infants > 0 && infants--">
              <span class="text-base font-semibold leading-none">−</span>
            </button>
            <span class="w-5 text-center text-sm font-semibold text-slate-900">{{ infants }}</span>
            <button type="button" :disabled="infants >= 20"
              class="w-7 h-7 rounded-full border border-slate-300 flex items-center justify-center hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer bg-white"
              @click="infants < 20 && infants++">
              <span class="text-base font-semibold leading-none">+</span>
            </button>
          </div>
        </div>

        <p v-if="countError" class="text-xs text-red-600 font-medium">{{ countError }}</p>
      </div>
    </div>

    <!-- Continue -->
    <button
      :disabled="proceeding"
      class="w-full py-3.5 bg-primary hover:opacity-90 active:scale-95 text-white font-bold rounded-2xl border-none cursor-pointer transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
      @click="proceed">
      <svg v-if="proceeding" class="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
      {{ proceeding ? 'Please wait…' : 'Continue' }}
    </button>
  </div>
</template>

<style scoped>
/* Normalise API HTML content rendered via v-html */
.tour-html :deep(ul) {
  list-style: disc;
  padding-left: 1.25rem;
  margin: 0.25rem 0;
}
.tour-html :deep(li) {
  margin-bottom: 0.25rem;
}
.tour-html :deep(p) {
  margin: 0.25rem 0;
}
.tour-html :deep(div) {
  margin: 0.125rem 0;
}
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>
