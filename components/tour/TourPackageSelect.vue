<!-- Step 1: Choose a package + set participant counts -->
<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useTourBookingStore } from '../../composables/useTourBookingStore'

const emit = defineEmits<(e: 'next') => void>()
const { state, priceBreakdown, fmtNgn, fetchPackages, selectPackage, updateCounts } = useTourBookingStore()

// Local counts — committed to store when user clicks "Select"
const adults = ref(state.adults)
const children = ref(state.children)
const infants = ref(state.infants)

const selectedId = ref<string | null>(null)
const countError = ref('')

onMounted(fetchPackages)

watch([adults, children, infants], () => { countError.value = '' })

function choose(pkg: any) {
  if (adults.value < 1) { countError.value = 'At least 1 adult is required.'; return }
  if (infants.value > adults.value) { countError.value = 'Infants cannot exceed number of adults.'; return }
  const total = adults.value + children.value + infants.value
  if (total > pkg.availableSpots) { countError.value = `Only ${pkg.availableSpots} spots available.`; return }
  updateCounts(adults.value, children.value, infants.value)
  selectPackage(pkg)
  emit('next')
}

const inc = (r: any, max = 20) => { if (r.value < max) r.value++ }
const dec = (r: any, min = 0)  => { if (r.value > min) r.value-- }

const boardColors: Record<string, string> = {
  'Standard Package': 'bg-slate-100 text-slate-600',
  'Premium Package':  'bg-amber-50 text-amber-700',
  'VIP Package':      'bg-purple-50 text-purple-700',
  'Shared Group Package': 'bg-blue-50 text-blue-700',
  'Private Package':  'bg-green-50 text-green-700',
}
</script>

<template>
  <div class="space-y-5">

    <!-- ── Participant counter ─────────────────────────────────────────────── -->
    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div class="px-5 py-3.5 bg-slate-50 border-b border-slate-100">
        <p class="text-sm font-semibold text-slate-800">Participants</p>
        <p class="text-xs text-slate-400 mt-0.5">Adjust before selecting a package — pricing updates automatically</p>
      </div>
      <div class="p-5 space-y-4">
        <div v-for="row in [
          { label: 'Adults', sub: '12 years+', r: adults, min: 1 },
          { label: 'Children', sub: '2 to 12 years', r: children, min: 0 },
          { label: 'Infants', sub: '0 to 2 years', r: infants, min: 0 },
        ]" :key="row.label" class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-slate-800">{{ row.label }}</p>
            <p class="text-xs text-slate-500">{{ row.sub }}</p>
          </div>
          <div class="flex items-center gap-3">
            <button type="button" :disabled="row.r <= row.min"
              class="w-7 h-7 rounded-full border border-slate-300 flex items-center justify-center hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer bg-white"
              @click="dec(row.r, row.min)">
              <span class="text-base font-semibold leading-none">−</span>
            </button>
            <span class="w-5 text-center text-sm font-semibold text-slate-900">{{ row.r }}</span>
            <button type="button"
              class="w-7 h-7 rounded-full border border-slate-300 flex items-center justify-center hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer bg-white"
              @click="inc(row.r)">
              <span class="text-base font-semibold leading-none">+</span>
            </button>
          </div>
        </div>
        <p v-if="countError" class="text-xs text-red-600 font-medium">{{ countError }}</p>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="state.packagesLoading" class="flex flex-col items-center py-20 gap-4">
      <div class="w-12 h-12 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
      <p class="text-slate-600 font-medium text-sm">Loading packages from Rayna Tours…</p>
    </div>

    <!-- Error -->
    <div v-else-if="state.packagesError" class="flex flex-col items-center py-16 gap-3 text-center">
      <span class="text-4xl">😞</span>
      <p class="font-semibold text-slate-800">Couldn't load packages</p>
      <p class="text-sm text-slate-500">{{ state.packagesError }}</p>
      <button class="mt-2 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold border-none cursor-pointer" @click="fetchPackages">Try Again</button>
    </div>

    <!-- Package cards -->
    <template v-else>
      <p class="text-xs text-slate-500">{{ state.availablePackages.length }} packages available for {{ state.searchParams.date || 'selected date' }}</p>

      <div v-for="pkg in state.availablePackages" :key="pkg.raynaPackageId"
        class="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all overflow-hidden"
      >
        <div class="p-5">
          <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">

            <!-- Package info -->
            <div class="flex-1 min-w-0">
              <div class="flex flex-wrap items-center gap-2 mb-2">
                <h3 class="text-base font-bold text-slate-900">{{ pkg.name }}</h3>
                <span class="text-xs font-semibold px-2 py-0.5 rounded-full" :class="boardColors[pkg.name] ?? 'bg-slate-100 text-slate-600'">
                  {{ pkg.duration }}
                </span>
              </div>

              <!-- What's included -->
              <div class="flex flex-wrap gap-1.5 mb-3">
                <span v-for="inc in pkg.includes" :key="inc"
                  class="flex items-center gap-1 text-xs text-slate-500 bg-green-50 border border-green-100 px-2 py-0.5 rounded-md">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5"><polyline points="20,6 9,17 4,12"/></svg>
                  {{ inc }}
                </span>
              </div>

              <!-- Departure + meeting point -->
              <div class="flex flex-col gap-1 mb-3">
                <p class="text-xs text-slate-500 flex items-center gap-1">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
                  Departs: <strong class="text-slate-700">{{ pkg.departureTime }}</strong>
                </p>
                <p class="text-xs text-slate-500 flex items-center gap-1">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  {{ pkg.meetingPoint }}
                </p>
              </div>

              <!-- Cancellation -->
              <div class="flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                  :stroke="pkg.cancellationPolicy.includes('Non-refundable') ? '#ef4444' : '#16a34a'"
                  stroke-width="2">
                  <path v-if="!pkg.cancellationPolicy.includes('Non-refundable')" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <template v-else><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></template>
                </svg>
                <p class="text-xs font-medium" :class="pkg.cancellationPolicy.includes('Non-refundable') ? 'text-red-600' : 'text-green-700'">
                  {{ pkg.cancellationPolicy }}
                </p>
              </div>
            </div>

            <!-- Price + CTA -->
            <div class="sm:text-right sm:min-w-[170px] shrink-0 border-t sm:border-t-0 sm:border-l sm:pl-5 pt-4 sm:pt-0">
              <div class="space-y-0.5 mb-3 sm:text-right">
                <p class="text-xs text-slate-400">from</p>
                <p class="text-2xl font-bold text-slate-900">{{ fmtNgn(pkg.priceAdult * state.ngnRate) }}</p>
                <p class="text-xs text-slate-400">per adult · excl. taxes</p>
                <div v-if="adults > 0 || children > 0" class="text-xs text-slate-500 mt-2 space-y-0.5 sm:text-right">
                  <p v-if="adults > 0">{{ adults }} adult{{ adults > 1 ? 's' : '' }}: {{ fmtNgn(pkg.priceAdult * adults * state.ngnRate) }}</p>
                  <p v-if="children > 0">{{ children }} child{{ children > 1 ? 'ren' : '' }}: {{ fmtNgn(pkg.priceChild * children * state.ngnRate) }}</p>
                  <p v-if="infants > 0">{{ infants }} infant{{ infants > 1 ? 's' : '' }}: {{ pkg.priceInfant === 0 ? 'Free' : fmtNgn(pkg.priceInfant * infants * state.ngnRate) }}</p>
                </div>
              </div>
              <p class="text-xs text-slate-400 mb-3">{{ pkg.availableSpots }} spots left</p>
              <button
                class="w-full px-5 py-2.5 bg-primary hover:opacity-90 active:scale-95 text-white text-sm font-bold rounded-xl border-none cursor-pointer transition-all"
                @click="choose(pkg)"
              >
                Select Package
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
