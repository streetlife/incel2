<!-- Step 1: View tour details, set participant counts, choose a transfer option -->
<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
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

onMounted(() => {
  currency.fetchRates()
  // Fetch pricing silently in background — auto-selects default transfer option
  fetchPackages()
})

watch([adults, children, infants], ([a, c, i]) => {
  countError.value = ''
  // Keep store in sync so TourBookingSummary updates live
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
    // Counts already synced to store via watch — just ensure package is selected
    if (!state.selectedPackage && state.availablePackages.length > 0) {
      selectPackage(state.availablePackages[0])
    }
    // Create booking records (non-blocking)
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
      <!-- Hero image -->
      <div class="relative h-40 sm:h-48 bg-slate-200 overflow-hidden">
        <img v-if="state.tour.image" :src="state.tour.image" :alt="state.tour.name"
          class="w-full h-full object-cover" />
        <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <div class="absolute bottom-4 left-5 right-5">
          <p class="text-white font-bold text-lg leading-tight drop-shadow">{{ state.tour.name }}</p>
          <p class="text-white/80 text-xs mt-0.5">{{ state.searchParams.city }}, {{ state.searchParams.country }}</p>
        </div>
      </div>

      <!-- Meta row -->
      <div class="flex flex-wrap items-center gap-x-5 gap-y-2 px-5 py-3 border-b border-slate-100">
        <span v-if="state.tour.duration" class="flex items-center gap-1 text-xs text-slate-600">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
          {{ state.tour.duration }}
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
          :class="state.tour.cancellationPolicyName.includes('Non-refundable') ? 'text-red-600' : 'text-green-700'">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
            :stroke="state.tour.cancellationPolicyName.includes('Non-refundable') ? '#ef4444' : '#16a34a'"
            stroke-width="2">
            <path v-if="!state.tour.cancellationPolicyName.includes('Non-refundable')" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <template v-else><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></template>
          </svg>
          {{ state.tour.cancellationPolicyName }}
        </span>
      </div>

      <!-- Short description -->
      <div v-if="state.tour.tourShortDescription" class="px-5 py-3 border-b border-slate-100">
        <p class="text-sm text-slate-600 leading-relaxed">{{ stripHtml(state.tour.tourShortDescription) }}</p>
      </div>

      <!-- Inclusions / Exclusions -->
      <div v-if="state.tour.tourInclusion || state.tour.tourExclusion" class="px-5 py-3 flex flex-wrap gap-6">
        <div v-if="state.tour.tourInclusion" class="flex-1 min-w-[140px]">
          <p class="text-xs font-semibold text-green-700 mb-1.5">Included</p>
          <p class="text-xs text-slate-600 leading-relaxed line-clamp-4">{{ stripHtml(state.tour.tourInclusion) }}</p>
        </div>
        <div v-if="state.tour.tourExclusion" class="flex-1 min-w-[140px]">
          <p class="text-xs font-semibold text-red-600 mb-1.5">Not Included</p>
          <p class="text-xs text-slate-600 leading-relaxed line-clamp-4">{{ stripHtml(state.tour.tourExclusion) }}</p>
        </div>
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
