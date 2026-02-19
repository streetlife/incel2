<!-- Sticky sidebar: flight snapshot + live price breakdown -->
<script setup lang="ts">
import { computed } from 'vue'
import { useBookingStore } from '../../composables/useBookingStore'

const { state, priceBreakdown, fmtNgn } = useBookingStore()

const offer = computed(() => state.offer)

const parseDur = (iso: string) => {
  const h = Number.parseInt(iso.match(/(\d+)H/)?.[1] ?? '0')
  const m = Number.parseInt(iso.match(/(\d+)M/)?.[1] ?? '0')
  return `${h}h ${String(m).padStart(2,'0')}m`
}
const fmtTime = (dt: string) => dt.split('T')[1]?.slice(0,5) ?? ''
const fmtDate = (dt: string) => new Date(dt).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })

const CARRIERS: Record<string,string> = {
  BA:'British Airways', VS:'Virgin Atlantic', LH:'Lufthansa', TP:'TAP Portugal',
  KL:'KLM', AA:'American Airlines', DL:'Delta', IB:'Iberia', EI:'Aer Lingus',
}
const CARRIER_COLORS: Record<string,string> = {
  BA:'#075AAA', VS:'#E31837', LH:'#05164D', TP:'#00843D',
  KL:'#00A1DE', AA:'#0078D2', DL:'#E51937', IB:'#C8102E', EI:'#006272',
}

const seg   = computed(() => offer.value?.itineraries[0].segments[0])
const itin  = computed(() => offer.value?.itineraries[0])
const code  = computed(() => seg.value?.carrierCode ?? '')
const color = computed(() => CARRIER_COLORS[code.value] ?? '#475569')
const pb    = priceBreakdown

const cabinLabel = (c: string) => c.replace('_',' ').toLowerCase().replace(/\b\w/g, l=>l.toUpperCase())
</script>

<template>
  <div v-if="offer" class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden sticky top-6">

    <!-- Header -->
    <div class="bg-gradient-to-r from-slate-800 to-slate-700 px-5 py-4">
      <p class="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">Your Flight</p>
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold" :style="{ background: color }">
          {{ code }}
        </div>
        <div>
          <p class="text-white font-semibold text-sm">{{ CARRIERS[code] ?? code }}</p>
          <p class="text-slate-400 text-xs">{{ cabinLabel(state.cabinClass) }}</p>
        </div>
      </div>
    </div>

    <!-- Route -->
    <div class="px-5 py-4 border-b border-slate-100">
      <div class="flex items-center justify-between mb-3">
        <div>
          <p class="text-2xl font-bold text-slate-900 font-mono">{{ fmtTime(seg?.departure.at ?? '') }}</p>
          <p class="text-sm font-semibold text-slate-500">{{ seg?.departure.iataCode }}</p>
          <p class="text-xs text-slate-400">{{ fmtDate(seg?.departure.at ?? '') }}</p>
        </div>
        <div class="flex-1 flex flex-col items-center px-3">
          <p class="text-xs text-slate-400 mb-1">{{ parseDur(itin?.duration ?? 'PT0H') }}</p>
          <div class="w-full h-px bg-slate-200 relative">
            <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </div>
          </div>
          <p class="text-xs text-green-600 font-medium mt-1">
            {{ itin?.segments.length === 1 ? 'Non-stop' : `${itin!.segments.length - 1} stop` }}
          </p>
        </div>
        <div class="text-right">
          <p class="text-2xl font-bold text-slate-900 font-mono">{{ fmtTime(itin?.segments.at(-1)?.arrival.at ?? '') }}</p>
          <p class="text-sm font-semibold text-slate-500">{{ itin?.segments.at(-1)?.arrival.iataCode }}</p>
          <p class="text-xs text-slate-400">{{ fmtDate(itin?.segments.at(-1)?.arrival.at ?? '') }}</p>
        </div>
      </div>
      <div class="flex items-center gap-3 text-xs text-slate-500 pt-1">
        <span class="flex items-center gap-1">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          {{ state.passengerCount }} passenger{{ state.passengerCount > 1 ? 's' : '' }}
        </span>
        <span>·</span>
        <span>{{ cabinLabel(state.cabinClass) }}</span>
      </div>
    </div>

    <!-- Price breakdown -->
    <div class="px-5 py-4 space-y-2.5">
      <p class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Price Breakdown</p>

      <div class="flex justify-between text-sm text-slate-600">
        <span>Base fare × {{ state.passengerCount }}</span>
        <span>{{ fmtNgn(pb.base) }}</span>
      </div>
      <div class="flex justify-between text-sm text-slate-600">
        <span>Taxes & fees (7.5%)</span>
        <span>{{ fmtNgn(pb.tax) }}</span>
      </div>
      <div v-if="pb.discount > 0" class="flex justify-between text-sm text-green-600">
        <span class="flex items-center gap-1">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20,6 9,17 4,12"/></svg>
          B2B Discount ({{ (state.discountRate * 100).toFixed(0) }}%)
        </span>
        <span>−{{ fmtNgn(pb.discount) }}</span>
      </div>

      <div class="border-t border-dashed border-slate-200 pt-3 flex justify-between items-baseline">
        <span class="font-bold text-slate-900">Total</span>
        <div class="text-right">
          <p class="text-xl font-bold text-slate-900">{{ fmtNgn(pb.total) }}</p>
          <p class="text-xs text-slate-400">incl. VAT</p>
        </div>
      </div>
    </div>

    <!-- B2B discount badge -->
    <div v-if="state.isB2B" class="mx-5 mb-4 flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
      <div>
        <p class="text-xs font-semibold text-green-700">B2B Rate Applied</p>
        <p class="text-[10px] text-green-600">Code: {{ state.discountCode }}</p>
      </div>
    </div>

    <!-- Invoice note -->
    <div class="mx-5 mb-5 flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2.5">
      <svg class="shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
      <p class="text-xs text-primary">An invoice will be emailed to the primary passenger after booking.</p>
    </div>
  </div>
</template>

