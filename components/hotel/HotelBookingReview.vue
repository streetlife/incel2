<script setup lang="ts">
import { useHotelBookingStore } from '../../composables/useHotelBookingStore'

const emit = defineEmits<{ (e: 'next'): void; (e: 'back'): void }>()
const { state, nights, priceBreakdown, fmtNgn, generateInvoice } = useHotelBookingStore()

const fmtDate = (d: string) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

function proceed() { generateInvoice(); emit('next') }
</script>

<template>
  <div class="space-y-5">

    <!-- ── Proforma invoice card ──────────────────────────────────────────── -->
    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

      <!-- Header -->
      <div class="flex items-start justify-between px-6 py-5 border-b border-slate-100">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <div class="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
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
        <p class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Billed To</p>
        <p class="text-sm font-semibold text-slate-800">{{ state.guests[0]?.title }} {{ state.guests[0]?.firstName }} {{ state.guests[0]?.lastName }}</p>
        <p class="text-xs text-slate-500">{{ state.contactEmail }}</p>
        <p class="text-xs text-slate-500">{{ state.contactPhone }}</p>
      </div>

      <!-- Booking details -->
      <div class="px-6 py-4 border-b border-slate-100">
        <p class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Booking Details</p>
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1">
            <p class="text-sm font-semibold text-slate-800">{{ state.hotel?.name }}</p>
            <p class="text-xs text-slate-500 mt-0.5">{{ state.searchParams.city }}</p>
            <p class="text-xs text-slate-500 mt-1">
              {{ fmtDate(state.searchParams.checkInStart) }} → {{ fmtDate(state.searchParams.checkInEnd) }}
              · {{ nights }} night{{ nights !== 1 ? 's' : '' }}
            </p>
            <p class="text-xs text-slate-500">
              {{ state.searchParams.totalRooms }} × {{ state.selectedRoom?.roomName }} ({{ state.selectedRoom?.boardType }})
            </p>
          </div>
          <p class="text-sm font-semibold text-slate-800 shrink-0">{{ fmtNgn(priceBreakdown.baseNgn) }}</p>
        </div>
      </div>

      <!-- Totals -->
      <div class="px-6 py-4 space-y-2">
        <div class="flex justify-between text-sm text-slate-600">
          <span>Subtotal</span><span>{{ fmtNgn(priceBreakdown.baseNgn) }}</span>
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

    <!-- ── Guest summary ──────────────────────────────────────────────────── -->
    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div class="px-5 py-3.5 bg-slate-50 border-b border-slate-100">
        <p class="text-sm font-semibold text-slate-800">Guest Summary</p>
      </div>
      <div class="divide-y divide-slate-100">
        <div v-for="(g, i) in state.guests" :key="i" class="px-5 py-3.5 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">{{ i + 1 }}</div>
            <div>
              <p class="text-sm font-medium text-slate-800">{{ g.title }} {{ g.firstName }} {{ g.lastName }}</p>
              <p v-if="i === 0" class="text-xs text-slate-400">{{ state.contactEmail }}</p>
            </div>
          </div>
          <span class="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">Room {{ i + 1 }}</span>
        </div>
      </div>
    </div>

    <!-- Email notice -->
    <div class="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3.5">
      <svg class="shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
      <div>
        <p class="text-sm font-semibold text-amber-800">Invoice will be sent to:</p>
        <p class="text-sm text-amber-700 font-mono mt-0.5">{{ state.contactEmail }}</p>
      </div>
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
