<!-- Step 3: Review + proforma invoice -->
<script setup lang="ts">
import { useTourBookingStore } from '../../composables/useTourBookingStore'

const emit = defineEmits<{ (e: 'next'): void; (e: 'back'): void }>()
const { state, priceBreakdown, totalParticipants, fmtNgn, generateInvoice } = useTourBookingStore()

const fmtDate = (d: string) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

function proceed() { generateInvoice(); emit('next') }
</script>

<template>
  <div class="space-y-5">

    <!-- Proforma invoice -->
    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

      <!-- Header -->
      <div class="flex items-start justify-between px-6 py-5 border-b border-slate-100">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <div class="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <span class="text-lg font-bold text-slate-900">TravelCo</span>
          </div>
          <p class="text-xs text-slate-400">VAT Reg: NG-123456789</p>
        </div>
        <div class="text-right">
          <p class="text-xs text-slate-400 mb-0.5">PROFORMA INVOICE</p>
          <p class="text-sm font-bold text-slate-700">{{ state.invoiceNumber || 'INV-PREVIEW' }}</p>
          <p class="text-xs text-slate-400 mt-1">{{ state.invoiceDate || new Date().toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }) }}</p>
        </div>
      </div>

      <!-- Billed to -->
      <div class="px-6 py-4 bg-slate-50 border-b border-slate-100">
        <p class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Lead Participant</p>
        <p class="text-sm font-semibold text-slate-800">{{ state.participants[0]?.title }} {{ state.participants[0]?.firstName }} {{ state.participants[0]?.lastName }}</p>
        <p class="text-xs text-slate-500">{{ state.contactEmail }}</p>
        <p class="text-xs text-slate-500">{{ state.contactPhone }}</p>
      </div>

      <!-- Tour line item -->
      <div class="px-6 py-4 border-b border-slate-100">
        <p class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Tour Details</p>
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1">
            <p class="text-sm font-semibold text-slate-800">{{ state.tour?.name }}</p>
            <p class="text-xs text-slate-500 mt-0.5">{{ state.selectedPackage?.name }} · {{ state.selectedPackage?.duration }}</p>
            <p class="text-xs text-slate-500">{{ state.searchParams.city }} · {{ fmtDate(state.searchParams.date) }} · Departs {{ state.selectedPackage?.departureTime }}</p>
            <p class="text-xs text-slate-400 mt-1">{{ totalParticipants }} participant{{ totalParticipants !== 1 ? 's' : '' }}</p>
          </div>
          <p class="text-sm font-semibold text-slate-800 shrink-0">{{ fmtNgn(priceBreakdown.subtotalNgn) }}</p>
        </div>
      </div>

      <!-- Pricing breakdown -->
      <div class="px-6 py-4 space-y-2">
        <div v-if="state.adults > 0" class="flex justify-between text-sm text-slate-600">
          <span>{{ state.adults }} adult{{ state.adults > 1 ? 's' : '' }} × {{ fmtNgn(state.selectedPackage!.priceAdult * state.ngnRate) }}</span>
          <span>{{ fmtNgn(priceBreakdown.adultTotal) }}</span>
        </div>
        <div v-if="state.children > 0" class="flex justify-between text-sm text-slate-600">
          <span>{{ state.children }} child{{ state.children > 1 ? 'ren' : '' }} × {{ fmtNgn(state.selectedPackage!.priceChild * state.ngnRate) }}</span>
          <span>{{ fmtNgn(priceBreakdown.childTotal) }}</span>
        </div>
        <div v-if="state.infants > 0" class="flex justify-between text-sm text-slate-600">
          <span>{{ state.infants }} infant{{ state.infants > 1 ? 's' : '' }}</span>
          <span>{{ state.selectedPackage!.priceInfant === 0 ? '₦0 (free)' : fmtNgn(priceBreakdown.infantTotal) }}</span>
        </div>
        <div class="flex justify-between text-sm text-slate-600">
          <span>VAT (7.5%)</span><span>{{ fmtNgn(priceBreakdown.tax) }}</span>
        </div>
        <div class="flex justify-between items-center pt-3 border-t border-slate-200 font-bold">
          <span class="text-slate-900">Total Due</span>
          <span class="text-xl text-slate-900">{{ fmtNgn(priceBreakdown.total) }}</span>
        </div>
        <p class="text-[10px] text-slate-400 text-right">All amounts in NGN (₦)</p>
      </div>
    </div>

    <!-- What's included -->
    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div class="px-5 py-3.5 bg-slate-50 border-b border-slate-100">
        <p class="text-sm font-semibold text-slate-800">What's Included</p>
      </div>
      <div class="px-5 py-4 flex flex-wrap gap-2">
        <span v-for="inc in state.selectedPackage?.includes" :key="inc"
          class="flex items-center gap-1.5 text-sm text-green-700 bg-green-50 border border-green-100 px-3 py-1.5 rounded-xl">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5"><polyline points="20,6 9,17 4,12"/></svg>
          {{ inc }}
        </span>
      </div>
    </div>

    <!-- Meeting point note -->
    <div class="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3.5">
      <svg class="shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
      <div>
        <p class="text-sm font-semibold text-amber-800">Meeting Point</p>
        <p class="text-sm text-amber-700 mt-0.5">{{ state.selectedPackage?.meetingPoint }}</p>
        <p class="text-xs text-amber-600 mt-1">Departs at {{ state.selectedPackage?.departureTime }} sharp. Please arrive 15 minutes early.</p>
      </div>
    </div>

    <!-- Email -->
    <div class="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-2xl px-4 py-3">
      <svg class="shrink-0 mt-0.5" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
      <p class="text-xs text-primary">Invoice will be sent to <span class="font-mono font-bold">{{ state.contactEmail }}</span></p>
    </div>

    <!-- Actions -->
    <div class="flex gap-3">
      <button class="flex-1 h-12 border-2 border-slate-200 text-slate-700 font-semibold rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer bg-white" @click="emit('back')">← Back</button>
      <button class="flex-[2] h-12 bg-primary hover:opacity-90 text-white font-bold rounded-2xl transition-all border-none cursor-pointer shadow-lg flex items-center justify-center gap-2" @click="proceed">
        Proceed to Payment
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </button>
    </div>
  </div>
</template>
