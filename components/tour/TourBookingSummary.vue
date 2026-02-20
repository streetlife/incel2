<!-- Sticky sidebar: tour snapshot + live pricing -->
<script setup lang="ts">
import { useTourBookingStore } from '../../composables/useTourBookingStore'

const { state, priceBreakdown, fmtNgn } = useTourBookingStore()

const fmtDate = (d: string) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
</script>

<template>
  <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden sticky top-6">

    <!-- Tour image + name -->
    <div class="relative h-36 bg-slate-200 overflow-hidden">
      <img v-if="state.tour?.image" :src="state.tour.image" :alt="state.tour.name" class="w-full h-full object-cover" />
      <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
      <div class="absolute bottom-3 left-4 right-4">
        <p class="text-white font-bold text-base leading-tight">{{ state.tour?.name }}</p>
        <p class="text-white/70 text-xs mt-0.5">{{ state.searchParams.city }}</p>
      </div>
    </div>

    <!-- Tour details -->
    <div class="px-5 py-4 border-b border-slate-100 space-y-2.5">
      <p class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Tour Details</p>
      <div class="flex justify-between text-sm">
        <span class="text-slate-500">Date</span>
        <span class="font-medium text-slate-800">{{ fmtDate(state.searchParams.date) }}</span>
      </div>
      <div class="flex justify-between text-sm">
        <span class="text-slate-500">Adults</span>
        <span class="font-medium text-slate-800">{{ state.adults }}</span>
      </div>
      <div v-if="state.children > 0" class="flex justify-between text-sm">
        <span class="text-slate-500">Children</span>
        <span class="font-medium text-slate-800">{{ state.children }}</span>
      </div>
      <div v-if="state.infants > 0" class="flex justify-between text-sm">
        <span class="text-slate-500">Infants</span>
        <span class="font-medium text-slate-800">{{ state.infants }}</span>
      </div>
    </div>

    <!-- Selected package -->
    <div v-if="state.selectedPackage" class="px-5 py-4 border-b border-slate-100 space-y-2">
      <p class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Package</p>
      <p class="text-sm font-semibold text-slate-800">{{ state.selectedPackage.name }}</p>
      <p class="text-xs text-slate-500">{{ state.selectedPackage.duration }}</p>
      <p class="text-xs text-slate-500">Departs: {{ state.selectedPackage.departureTime }}</p>
      <div class="flex items-center gap-1.5 mt-1">
        <svg class="shrink-0" width="12" height="12" viewBox="0 0 24 24" fill="none"
          :stroke="state.selectedPackage.cancellationPolicy.includes('Non-refundable') ? '#ef4444' : '#16a34a'"
          stroke-width="2">
          <path v-if="!state.selectedPackage.cancellationPolicy.includes('Non-refundable')" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <template v-else><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></template>
        </svg>
        <p class="text-xs" :class="state.selectedPackage.cancellationPolicy.includes('Non-refundable') ? 'text-red-600' : 'text-green-700'">
          {{ state.selectedPackage.cancellationPolicy }}
        </p>
      </div>
    </div>

    <!-- Price breakdown -->
    <div v-if="state.selectedPackage" class="px-5 py-4 space-y-2.5">
      <p class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Price Breakdown</p>

      <div v-if="state.adults > 0" class="flex justify-between text-sm text-slate-600">
        <span>{{ fmtNgn(state.selectedPackage.priceAdult * state.ngnRate) }} × {{ state.adults }} adult{{ state.adults > 1 ? 's' : '' }}</span>
        <span>{{ fmtNgn(priceBreakdown.adultTotal) }}</span>
      </div>
      <div v-if="state.children > 0" class="flex justify-between text-sm text-slate-600">
        <span>{{ fmtNgn(state.selectedPackage.priceChild * state.ngnRate) }} × {{ state.children }} child{{ state.children > 1 ? 'ren' : '' }}</span>
        <span>{{ fmtNgn(priceBreakdown.childTotal) }}</span>
      </div>
      <div v-if="state.infants > 0" class="flex justify-between text-sm text-slate-600">
        <span>{{ state.selectedPackage.priceInfant === 0 ? 'Infant (free)' : `${fmtNgn(state.selectedPackage.priceInfant * state.ngnRate)} × ${state.infants}` }}</span>
        <span>{{ state.selectedPackage.priceInfant === 0 ? '₦0' : fmtNgn(priceBreakdown.infantTotal) }}</span>
      </div>
      <div class="flex justify-between text-sm text-slate-600">
        <span>Taxes & fees (7.5%)</span>
        <span>{{ fmtNgn(priceBreakdown.tax) }}</span>
      </div>

      <div class="border-t border-dashed border-slate-200 pt-3 flex justify-between items-baseline">
        <span class="font-bold text-slate-900">Total</span>
        <div class="text-right">
          <p class="text-xl font-bold text-slate-900">{{ fmtNgn(priceBreakdown.total) }}</p>
          <p class="text-xs text-slate-400">incl. VAT</p>
        </div>
      </div>
    </div>

    <div class="mx-5 mb-5 flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2.5">
      <svg class="shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
      <p class="text-xs text-primary">Invoice & booking voucher will be emailed after payment.</p>
    </div>
  </div>
</template>
