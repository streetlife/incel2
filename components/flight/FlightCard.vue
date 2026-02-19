<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  flight: any
  expanded: boolean
  highlight?: 'recommended' | 'timesaver' | null
}>()
const emit = defineEmits<{ (e: 'toggle'): void; (e: 'book', id: string): void }>()

const CARRIERS: Record<string, string> = {
  BA:'British Airways', VS:'Virgin Atlantic', LH:'Lufthansa', TP:'TAP Portugal',
  KL:'KLM', AA:'American Airlines', DL:'Delta', IB:'Iberia',
  LO:'LOT Polish', AV:'Avianca', WS:'WestJet', EI:'Aer Lingus',
}
const CARRIER_COLORS: Record<string, string> = {
  BA:'#075AAA', VS:'#E31837', LH:'#05164D', TP:'#00843D',
  KL:'#00A1DE', AA:'#0078D2', DL:'#E51937', IB:'#C8102E',
  LO:'#003087', AV:'#E2001A', WS:'#00447C', EI:'#006272',
}
const AIRPORTS: Record<string, string> = {
  LHR:'London Heathrow', JFK:'New York JFK', FRA:'Frankfurt', AMS:'Amsterdam',
  MUC:'Munich', MAD:'Madrid', LIS:'Lisbon', BOS:'Boston', ATL:'Atlanta',
  MIA:'Miami', DFW:'Dallas', ORD:"Chicago O'Hare", IAD:'Washington Dulles',
  DUB:'Dublin', BOG:'Bogotá', WAW:'Warsaw', BCN:'Barcelona', YYC:'Calgary', MAN:'Manchester',
}

const parseDuration = (iso: string) => {
  const h = Number.parseInt(iso.match(/(\d+)H/)?.[1] ?? '0')
  const m = Number.parseInt(iso.match(/(\d+)M/)?.[1] ?? '0')
  return { hours: h, minutes: m }
}
const fmtDuration = (iso: string) => {
  const { hours, minutes } = parseDuration(iso)
  return `${hours}h ${minutes.toString().padStart(2, '0')}m`
}
const fmtTime  = (dt: string) => dt.split('T')[1]?.slice(0, 5) ?? ''
const fmtDate  = (dt: string) => new Date(dt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
const fmtPrice = (usd: string, rate = 1650) => `NGN ${Math.round(Number.parseFloat(usd) * rate).toLocaleString()}`

const itin = computed(() => props.flight.itineraries[0])
const segs = computed(() => itin.value.segments)
const first = computed(() => segs.value[0])
const last = computed(() => segs.value[segs.value.length - 1])
const carrier = computed(() => first.value.carrierCode)
const carrierName = computed(() => CARRIERS[carrier.value] ?? carrier.value)
const color = computed(() => CARRIER_COLORS[carrier.value] ?? '#475569')
const fare = computed(() => props.flight.travelerPricings[0].fareDetailsBySegment[0])
const bags = computed(() => props.flight.price.additionalServices?.find((s: any) => s.type === 'CHECKED_BAGS'))
const stops = computed(() => segs.value.length - 1)
const via = computed(() => segs.value.slice(0, -1).map((s: any) => s.arrival.iataCode).join(' · '))
const stopPrefix = stops.value > 1 ? 's' : ''
const stopLabel = computed(() => stops.value === 0 ? 'Non-stop' : `${stops.value} stop${stopPrefix} via ${via.value}`)
const cabinLabel = computed(() => fare.value.cabin.replace('_', ' ').toLowerCase().replace(/\b\w/g, (l: string) => l.toUpperCase()))
</script>

<template>
  <article
    class="bg-white rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-lg"
    :class="highlight ? 'border-2 border-blue-300 shadow-md shadow-blue-50' : 'border border-slate-200 hover:border-slate-300'"
  >
    <div class="md:hidden p-4 flex flex-col gap-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold tracking-wide shrink-0"
            :style="{ background: color }"
          >{{ carrier }}</div>
          <div>
            <div class="text-sm font-semibold text-slate-800 leading-tight">{{ carrierName }}</div>
            <div class="text-xs text-slate-400 mt-0.5">{{ cabinLabel }}</div>
          </div>
        </div>
        <div class="text-right">
          <div class="text-base font-bold text-slate-900">{{ fmtPrice(flight.price.total) }}</div>
          <div class="text-xs text-slate-400">per person</div>
          <div v-if="bags" class="text-xs text-amber-600 mt-0.5">+{{ fmtPrice(bags.amount) }} bags</div>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <!-- Departure -->
        <div class="flex flex-col items-start min-w-[52px]">
          <div class="text-xl font-bold text-slate-900 leading-none font-mono">{{ fmtTime(first.departure.at) }}</div>
          <div class="text-xs font-semibold text-slate-500 mt-0.5">{{ first.departure.iataCode }}</div>
          <div class="text-[10px] text-slate-400">{{ fmtDate(first.departure.at) }}</div>
        </div>

        <!-- Line -->
        <div class="flex-1 flex flex-col items-center gap-1 min-w-0">
          <span class="text-[10px] text-slate-500 font-medium">{{ fmtDuration(itin.duration) }}</span>
          <div class="flex items-center gap-1 w-full">
            <div class="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0"></div>
            <div class="flex-1 h-px bg-slate-200"></div>
            <svg v-if="stops > 0" class="shrink-0" width="10" height="10" viewBox="0 0 24 24" fill="#f59e0b"><circle cx="12" cy="12" r="6"/></svg>
            <div class="flex-1 h-px bg-slate-200"></div>
            <div class="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0"></div>
          </div>
          <span class="text-[10px] font-medium truncate max-w-full" :class="stops === 0 ? 'text-green-600' : 'text-amber-600'">
            {{ stopLabel }}
          </span>
        </div>

        <!-- Arrival -->
        <div class="flex flex-col items-end min-w-[52px]">
          <div class="text-xl font-bold text-slate-900 leading-none font-mono">{{ fmtTime(last.arrival.at) }}</div>
          <div class="text-xs font-semibold text-slate-500 mt-0.5">{{ last.arrival.iataCode }}</div>
          <div class="text-[10px] text-slate-400">{{ fmtDate(last.arrival.at) }}</div>
        </div>
      </div>

      <div class="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide">
        <span class="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md whitespace-nowrap">
          {{ fare.includedCabinBags.quantity }} cabin bag
        </span>
        <span
          class="inline-flex shrink-0 items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md whitespace-nowrap border"
          :class="fare.includedCheckedBags.quantity === 0 ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-slate-50 border-slate-200 text-slate-500'"
        >
          {{ fare.includedCheckedBags.quantity > 0 ? `${fare.includedCheckedBags.quantity} checked` : 'No checked bag' }}
        </span>
        <span class="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-md whitespace-nowrap">
          {{ flight.numberOfBookableSeats }} seats left
        </span>
      </div>

      <div class="flex items-center gap-2 pt-1">
        <button
          class="flex-1 py-2.5 bg-primary hover:opacity-90 active:scale-95 text-white text-sm font-semibold rounded-xl transition-all cursor-pointer border-none"
          @click.stop="emit('book', flight.id)"
        >Book Now</button>
        <button
          class="flex items-center gap-1 text-xs font-medium text-primary transition-colors cursor-pointer bg-transparent border-none p-0 font-[inherit] shrink-0"
          @click="emit('toggle')"
        >
          {{ expanded ? 'Hide' : 'Details' }}
          <svg class="transition-transform duration-200" :class="expanded ? 'rotate-180' : ''" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
      </div>
    </div>

    <div class="hidden md:grid md:items-center md:gap-5 md:p-5" style="grid-template-columns: 130px 1fr auto auto;">

      <!-- Carrier -->
      <div class="flex flex-col items-center gap-1.5 text-center">
        <div class="w-11 h-11 rounded-xl flex items-center justify-center text-white text-xs font-bold tracking-wide shrink-0" :style="{ background: color }">
          {{ carrier }}
        </div>
        <span class="text-xs text-slate-500 font-medium leading-tight">{{ carrierName }}</span>
      </div>

      <!-- Route timeline -->
      <div class="grid items-center gap-4" style="grid-template-columns: auto 1fr auto;">
        <div class="flex flex-col items-start">
          <div class="text-2xl font-bold text-slate-900 leading-none font-mono">{{ fmtTime(first.departure.at) }}</div>
          <div class="text-sm font-semibold text-slate-500 mt-0.5">{{ first.departure.iataCode }}</div>
          <div class="text-xs text-slate-400 mt-0.5">{{ fmtDate(first.departure.at) }}</div>
        </div>
        <div class="flex flex-col items-center gap-1 min-w-0">
          <span class="text-xs text-slate-500 font-medium">{{ fmtDuration(itin.duration) }}</span>
          <div class="flex items-center gap-1 w-full">
            <div class="w-2 h-2 rounded-full bg-slate-300 shrink-0"></div>
            <div class="flex-1 h-px bg-slate-200"></div>
            <svg v-if="stops > 0" class="shrink-0" width="12" height="12" viewBox="0 0 24 24" fill="#f59e0b"><circle cx="12" cy="12" r="6"/></svg>
            <div class="flex-1 h-px bg-slate-200"></div>
            <div class="w-2 h-2 rounded-full bg-slate-300 shrink-0"></div>
          </div>
          <span class="text-xs font-medium truncate max-w-full text-center" :class="stops === 0 ? 'text-green-600' : 'text-amber-600'">
            {{ stopLabel }}
          </span>
        </div>
        <div class="flex flex-col items-end">
          <div class="text-2xl font-bold text-slate-900 leading-none font-mono">{{ fmtTime(last.arrival.at) }}</div>
          <div class="text-sm font-semibold text-slate-500 mt-0.5">{{ last.arrival.iataCode }}</div>
          <div class="text-xs text-slate-400 mt-0.5">{{ fmtDate(last.arrival.at) }}</div>
        </div>
      </div>

      <!-- Chips -->
      <div class="flex flex-col gap-1.5 items-start">
        <span class="inline-flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md whitespace-nowrap">{{ cabinLabel }}</span>
        <span class="inline-flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md whitespace-nowrap">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="7" width="16" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/></svg>
          {{ fare.includedCabinBags.quantity }} cabin
        </span>
        <span
          class="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md whitespace-nowrap border"
          :class="fare.includedCheckedBags.quantity === 0 ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-slate-50 border-slate-200 text-slate-500'"
        >
          {{ fare.includedCheckedBags.quantity > 0 ? `${fare.includedCheckedBags.quantity} checked` : 'No checked bag' }}
        </span>
        <span class="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-md whitespace-nowrap">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          {{ flight.numberOfBookableSeats }} seats
        </span>
      </div>

      <!-- Price + CTA -->
      <div class="flex flex-col items-end gap-1 min-w-[148px]">
        <div class="text-xl font-bold text-slate-900 leading-tight">{{ fmtPrice(flight.price.total) }}</div>
        <div class="text-xs text-slate-400">per person</div>
        <div v-if="bags" class="text-xs text-amber-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded">+{{ fmtPrice(bags.amount) }} bags</div>
        <button
          class="mt-1 w-full px-5 py-2.5 bg-primary hover:opacity-90 active:scale-95 text-white text-sm font-semibold rounded-xl transition-all duration-150 cursor-pointer border-none"
          @click.stop="emit('book', flight.id)"
        >Book Now</button>
        <button
          class="flex items-center gap-1 text-xs font-medium text-primary transition-colors cursor-pointer bg-transparent border-none p-0 font-[inherit]"
          @click="emit('toggle')"
        >
          {{ expanded ? 'Hide details' : 'View details' }}
          <svg class="transition-transform duration-200" :class="expanded ? 'rotate-180' : ''" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
      </div>
    </div>

    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <div v-if="expanded" class="border-t border-slate-100 bg-slate-50/70 p-4 md:p-5">

        <p class="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">Flight Itinerary</p>

        <div v-for="(seg, idx) in segs" :key="idx" class="mb-4 last:mb-0">

          <!-- Segment carrier -->
          <div class="flex items-center gap-2 mb-2.5">
            <div class="w-2 h-2 rounded-full shrink-0" :style="{ background: CARRIER_COLORS[seg.carrierCode] ?? '#475569' }"></div>
            <span class="text-xs font-semibold text-slate-500">{{ CARRIERS[seg.carrierCode] ?? seg.carrierCode }} · Flight {{ seg.carrierCode }}{{ seg.number }}</span>
          </div>

          <!-- Segment route card -->
          <div class="grid items-center gap-3 bg-white border border-slate-200 rounded-xl px-3 py-3 md:px-4 md:py-3.5" style="grid-template-columns: 1fr auto 1fr;">
            <div class="flex flex-col gap-0.5">
              <div class="text-lg md:text-xl font-bold text-slate-900 font-mono leading-none">{{ fmtTime(seg.departure.at) }}</div>
              <div class="text-sm font-semibold text-slate-700 mt-1">{{ seg.departure.iataCode }}</div>
              <div class="text-xs text-slate-500 hidden sm:block">{{ AIRPORTS[seg.departure.iataCode] ?? seg.departure.iataCode }}</div>
              <div v-if="seg.departure.terminal" class="text-xs text-slate-400">T{{ seg.departure.terminal }}</div>
            </div>
            <div class="flex flex-col items-center gap-1.5 px-2">
              <span class="text-xs font-medium text-slate-500 whitespace-nowrap">{{ fmtDuration(seg.duration) }}</span>
              <div class="w-12 md:w-20 h-px bg-slate-200"></div>
              <span class="text-xs font-medium text-green-600 whitespace-nowrap">Non-stop</span>
            </div>
            <div class="flex flex-col gap-0.5 items-end text-right">
              <div class="text-lg md:text-xl font-bold text-slate-900 font-mono leading-none">{{ fmtTime(seg.arrival.at) }}</div>
              <div class="text-sm font-semibold text-slate-700 mt-1">{{ seg.arrival.iataCode }}</div>
              <div class="text-xs text-slate-500 hidden sm:block">{{ AIRPORTS[seg.arrival.iataCode] ?? seg.arrival.iataCode }}</div>
              <div v-if="seg.arrival.terminal" class="text-xs text-slate-400">T{{ seg.arrival.terminal }}</div>
            </div>
          </div>

          <!-- Layover -->
          <div
            v-if="Number(idx) < segs.length - 1"
            class="flex items-center gap-2 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-2"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
            Layover in {{ AIRPORTS[seg.arrival.iataCode] ?? seg.arrival.iataCode }} ({{ seg.arrival.iataCode }})
          </div>
        </div>

        <!-- Fare rules -->
        <div class="flex flex-wrap gap-3 mt-4 pt-4 border-t border-dashed border-slate-200">
          <div class="flex items-center gap-1.5 text-xs text-slate-600">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2"><polyline points="20,6 9,17 4,12"/></svg>
            Changes allowed (fee may apply)
          </div>
          <div class="flex items-center gap-1.5 text-xs text-red-500">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            Non-refundable
          </div>
          <div class="flex items-center gap-1.5 text-xs text-slate-600">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2"><rect x="4" y="7" width="16" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/></svg>
            {{ fare.includedCabinBags.quantity }} carry-on bag included
          </div>
        </div>

      </div>
    </Transition>
  </article>
</template>