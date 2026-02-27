<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useFlightStore } from '../../stores/flight'
import { useCurrency } from '../../composables/useCurrency'
import AppToast from '../toast/AppToast.vue'

const emit = defineEmits<{ (e: 'next'): void; (e: 'back'): void }>()

const flightStore = useFlightStore()
const {
  offer,
  passengers,
  contactEmail,
  contactPhone,
  cabinClass,
  passengerCount,
  isB2B,
  discountRate,
  discountCode,
  invoiceNumber,
  invoiceDate,
  priceBreakdown,
} = storeToRefs(flightStore)

const { format, currentConfig } = useCurrency()

const parseDur = (iso: string) => {
  const h = Number.parseInt(iso.match(/(\d+)H/)?.[1] ?? '0')
  const m = Number.parseInt(iso.match(/(\d+)M/)?.[1] ?? '0')
  return `${h}h ${String(m).padStart(2, '0')}m`
}
const fmtTime = (dt: string) => dt.split('T')[1]?.slice(0, 5) ?? ''
const fmtDate = (dt: string) =>
  new Date(dt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

const CARRIERS: Record<string, string> = {
  BA: 'British Airways', VS: 'Virgin Atlantic', LH: 'Lufthansa', TP: 'TAP Portugal',
  KL: 'KLM', AA: 'American Airlines', DL: 'Delta', IB: 'Iberia', EI: 'Aer Lingus',
}
const cabinLabel = (c: string) =>
  c.replace('_', ' ').toLowerCase().replace(/\b\w/g, (l: string) => l.toUpperCase())
</script>

<template>
  <div class="space-y-5">
    <AppToast />

    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div class="flex items-start justify-between px-6 py-5 border-b border-slate-100">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <div class="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.36 2 2 0 0 1 3.59 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 5.55 5.55l.97-.97a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 15.58Z"/></svg>
            </div>
            <span class="text-lg font-bold text-slate-900">TravelCo</span>
          </div>
          <p class="text-xs text-slate-400">VAT Reg: NG-123456789</p>
        </div>
        <div class="text-right">
          <p class="text-xs text-slate-400 mb-0.5">PROFORMA INVOICE</p>
          <p class="text-sm font-bold text-slate-700">{{ invoiceNumber || 'INV-PREVIEW' }}</p>
          <p class="text-xs text-slate-400 mt-1">
            Date: {{ invoiceDate || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) }}
          </p>
        </div>
      </div>

      <div class="px-6 py-4 bg-slate-50 border-b border-slate-100">
        <p class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Billed To</p>
        <p class="text-sm font-semibold text-slate-800">
          {{ passengers[0]?.title }} {{ passengers[0]?.firstname }} {{ passengers[0]?.surname }}
        </p>
        <p class="text-xs text-slate-500">{{ contactEmail }}</p>
        <p class="text-xs text-slate-500">{{ contactPhone }}</p>
        <p v-if="isB2B" class="text-xs text-green-600 font-medium mt-1">
          B2B Account · Code: {{ discountCode }}
        </p>
      </div>

      <div class="px-6 py-4 border-b border-slate-100">
        <p class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Flight Details</p>
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1">
            <p class="text-sm font-semibold text-slate-800">
              {{ CARRIERS[offer?.itineraries[0].segments[0].carrierCode] ?? '' }} ·
              {{ offer?.itineraries[0].segments[0].departure.iataCode }} →
              {{ offer?.itineraries[0].segments.at(-1).arrival.iataCode }}
            </p>
            <p class="text-xs text-slate-500 mt-0.5">
              {{ fmtDate(offer?.itineraries[0].segments[0].departure.at ?? '') }} ·
              {{ fmtTime(offer?.itineraries[0].segments[0].departure.at ?? '') }} –
              {{ fmtTime(offer?.itineraries[0].segments.at(-1).arrival.at ?? '') }} ·
              {{ parseDur(offer?.itineraries[0].duration ?? 'PT0H') }}
            </p>
            <p class="text-xs text-slate-400 mt-0.5">
              {{ cabinLabel(cabinClass) }} · {{ passengerCount }} passenger{{ passengerCount > 1 ? 's' : '' }}
            </p>
          </div>
          <p class="text-sm font-semibold text-slate-800 shrink-0">{{ format(priceBreakdown.base) }}</p>
        </div>
      </div>

      <div class="px-6 py-4 space-y-2">
        <div class="flex justify-between text-sm text-slate-600">
          <span>Subtotal</span><span>{{ format(priceBreakdown.base) }}</span>
        </div>
        <div class="flex justify-between text-sm text-slate-600">
          <span>VAT (7.5%)</span><span>{{ format(priceBreakdown.tax) }}</span>
        </div>
        <div v-if="priceBreakdown.discount > 0" class="flex justify-between text-sm text-green-600">
          <span>B2B Discount ({{ (discountRate * 100).toFixed(0) }}%)</span>
          <span>−{{ format(priceBreakdown.discount) }}</span>
        </div>
        <div class="flex justify-between items-center pt-3 border-t border-slate-200 font-bold">
          <span class="text-slate-900">Total Due</span>
          <span class="text-xl text-slate-900">{{ format(priceBreakdown.total) }}</span>
        </div>
        <p class="text-[10px] text-slate-400 text-right">
          All amounts in {{ currentConfig.code }} ({{ currentConfig.symbol }})
        </p>
      </div>
    </div>

    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div class="px-5 py-3.5 bg-slate-50 border-b border-slate-100">
        <p class="text-sm font-semibold text-slate-800">Passenger Summary</p>
      </div>
      <div class="divide-y divide-slate-100">
        <div v-for="(p, i) in passengers" :key="i" class="px-5 py-3.5 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
              {{ i + 1 }}
            </div>
            <div>
              <p class="text-sm font-medium text-slate-800">{{ p.title }} {{ p.firstname }} {{ p.surname }}</p>
              <p class="text-xs text-slate-400">{{ p.passport_nationality }} · PP:</p>
            </div>
          </div>
          <span class="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">{{ p.type }}</span>
        </div>
      </div>
    </div>

    <div class="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3.5">
      <svg class="shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
      <div>
        <p class="text-sm font-semibold text-amber-800">Invoice will be emailed to:</p>
        <p class="text-sm text-amber-700 font-mono mt-0.5">{{ contactEmail }}</p>
        <p class="text-xs text-amber-600 mt-1">A copy will also be sent after payment is confirmed.</p>
      </div>
    </div>

    <div class="flex gap-3">
      <button
        class="flex-1 h-12 border-2 border-slate-200 text-slate-700 font-semibold rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer bg-white"
        @click="emit('back')"
      >
        ← Back
      </button>
      <button
        class="flex-[2] h-12 bg-primary hover:opacity-90 text-white font-bold rounded-2xl transition-all border-none cursor-pointer flex items-center justify-center gap-2 shadow-lg"
        @click="emit('next')"
      >
        Proceed to Payment
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </button>
    </div>
  </div>
</template>
