<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import FlightCard from './FlightCard.vue';
import Pagination from '../Pagination.vue';

// ── Props / emits ─────────────────────────────────────────────────────────────
const props = withDefaults(defineProps<{
  flights?: any[]
  origin?: string
  destination?: string
}>(), {
  flights: () => [],
  origin: 'London Heathrow (LHR)',
  destination: 'New York JFK (JFK)',
})
defineEmits<{ (e: 'book', id: string): void }>()

// ── Router ────────────────────────────────────────────────────────────────────
const route  = useRoute()
const router = useRouter()

// ── Lookup tables ─────────────────────────────────────────────────────────────
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

// ── Helpers ───────────────────────────────────────────────────────────────────
const parseDuration = (iso: string) => {
  const h = parseInt(iso.match(/(\d+)H/)?.[1] ?? '0')
  const m = parseInt(iso.match(/(\d+)M/)?.[1] ?? '0')
  return h * 60 + m
}
const carrierOf = (f: any) => f.itineraries[0].segments[0].carrierCode
const allCarriers = computed(() => [...new Set(props.flights.map(carrierOf))])
const allCabins = computed(() => [...new Set(props.flights.flatMap((f: any) => f.travelerPricings[0].fareDetailsBySegment.map((s: any) => s.cabin)))])
const cabinLabel = (c: string) => c.replace('_', ' ').toLowerCase().replace(/\b\w/g, (l: string) => l.toUpperCase())

// ── Filters ───────────────────────────────────────────────────────────────────
const filters = reactive({ airlines: [] as string[], stops: [] as number[], cabin: [] as string[] })
const toggleFilter = <T>(arr: T[], v: T) => { const i = arr.indexOf(v); i >= 0 ? arr.splice(i, 1) : arr.push(v) }
const clearFilters = () => { filters.airlines = []; filters.stops = []; filters.cabin = [] }
const hasFilters = computed(() => filters.airlines.length || filters.stops.length || filters.cabin.length)

const filteredFlights = computed(() => props.flights.filter(f => {
  const code = carrierOf(f)
  const stops = f.itineraries[0].segments.length - 1
  const cabin = f.travelerPricings[0].fareDetailsBySegment[0].cabin
  if (filters.airlines.length && !filters.airlines.includes(code))  return false
  if (filters.stops.length   && !filters.stops.includes(stops))     return false
  if (filters.cabin.length   && !filters.cabin.includes(cabin))     return false
  return true
}))

// ── Highlighted picks ─────────────────────────────────────────────────────────
const recommended = computed(() => [...filteredFlights.value].sort((a, b) => parseFloat(a.price.total) - parseFloat(b.price.total))[0])
const timeSaver = computed(() => [...filteredFlights.value].sort((a, b) => parseDuration(a.itineraries[0].duration) - parseDuration(b.itineraries[0].duration))[0])
const specials = computed(() => new Set([recommended.value?.id, timeSaver.value?.id].filter(Boolean)))
const otherFlights = computed(() => filteredFlights.value.filter(f => !specials.value.has(f.id)))

// ── Expand/collapse — plain reactive record avoids Set reactivity pitfalls ────
const expanded = reactive<Record<string, boolean>>({})
const toggleExpand = (id: string) => { expanded[id] = !expanded[id] }

// ── Sort ──────────────────────────────────────────────────────────────────────
const sortBy = ref<'price' | 'duration'>('price')
const sortedOthers = computed(() => [...otherFlights.value].sort((a, b) => {
  if (sortBy.value === 'price')    return parseFloat(a.price.total) - parseFloat(b.price.total)
  if (sortBy.value === 'duration') return parseDuration(a.itineraries[0].duration) - parseDuration(b.itineraries[0].duration)
  return 0
}))

// ── Pagination
const itemsPerPage = 10
const currentPage = ref(parseInt(route.query.page as string) || 1)

// Keep currentPage in sync with URL (handles back/forward navigation too)
watch(() => route.query.page, (page) => {
  currentPage.value = parseInt(page as string) || 1
})

// Reset to page 1 when filters or sort change
watch([filters, sortBy], () => {
  currentPage.value = 1
})

const paginatedResults = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return sortedOthers.value.slice(start, start + itemsPerPage)
})

const handlePageChange = (page: number) => {
  currentPage.value = page
}
</script>

<template>
  <div class="flex gap-5 font-sans text-slate-800">

    <!-- ── Sidebar ───────────────────────────────────────────────────────── -->
    <aside class="w-[220px] shrink-0 bg-white rounded-2xl p-4 h-fit sticky top-6 shadow-sm border border-slate-200 flex flex-col">

      <div class="flex items-center justify-between mb-4 pb-3.5 border-b border-slate-100">
        <span class="flex items-center gap-1.5 text-sm font-bold text-slate-900">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="4" y1="6" x2="20" y2="6"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
            <line x1="11" y1="18" x2="13" y2="18"/>
          </svg>
          Filters
        </span>
        <button
          v-if="hasFilters"
          class="text-xs text-primary underline font-medium bg-transparent border-none cursor-pointer p-0"
          @click="clearFilters"
        >
          Clear all
        </button>
      </div>

      <!-- Airlines -->
      <div class="py-3.5 border-b border-slate-100">
        <h4 class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2.5">Airlines</h4>
        <label
          v-for="code in allCarriers" :key="code"
          class="flex items-center gap-2 py-1 text-sm text-slate-600 cursor-pointer hover:text-slate-900 transition-colors"
        >
          <input
            type="checkbox"
            class="w-3.5 h-3.5 accent-primary cursor-pointer"
            :checked="filters.airlines.includes(code)"
            @change="toggleFilter(filters.airlines, code)"
          />
          <span class="w-2 h-2 rounded-full shrink-0" :style="{ background: CARRIER_COLORS[code] ?? '#64748b' }"></span>
          <span>{{ CARRIERS[code] ?? code }}</span>
        </label>
      </div>

      <!-- Stops -->
      <div class="py-3.5 border-b border-slate-100">
        <h4 class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2.5">Stops</h4>
        <label
          v-for="s in [0, 1, 2]" :key="s"
          class="flex items-center gap-2 py-1 text-sm text-slate-600 cursor-pointer hover:text-slate-900 transition-colors"
        >
          <input
            type="checkbox"
            class="w-3.5 h-3.5 accent-primary cursor-pointer"
            :checked="filters.stops.includes(s)"
            @change="toggleFilter(filters.stops, s)"
          />
          <span>{{ ['Non-stop', '1 Stop', '2+ Stops'][s] }}</span>
        </label>
      </div>

      <!-- Cabin -->
      <div class="py-3.5">
        <h4 class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2.5">Cabin Class</h4>
        <label
          v-for="c in allCabins" :key="c"
          class="flex items-center gap-2 py-1 text-sm text-slate-600 cursor-pointer hover:text-slate-900 transition-colors"
        >
          <input
            type="checkbox"
            class="w-3.5 h-3.5 accent-primary cursor-pointer"
            :checked="filters.cabin.includes(c)"
            @change="toggleFilter(filters.cabin, c)"
          />
          <span>{{ cabinLabel(c) }}</span>
        </label>
      </div>
    </aside>

    <!-- ── Main ──────────────────────────────────────────────────────────── -->
    <div class="flex-1 min-w-0 flex flex-col gap-4">

      <!-- Meta bar -->
      <div class="flex items-center justify-between bg-white rounded-xl px-5 py-3 border border-slate-200 shadow-sm">
        <div class="flex items-center gap-3">
          <span class="text-[15px] font-bold text-slate-900">{{ filteredFlights.length }} flights</span>
          <span class="text-sm text-slate-500">{{ origin }} → {{ destination }}</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="text-xs text-slate-400 font-medium mr-1">Sort:</span>
          <button
            class="text-xs font-medium px-3.5 py-1.5 rounded-lg transition-all cursor-pointer border border-slate-200"
            :class="sortBy === 'price' ? 'bg-primary text-white border-primary' : 'bg-slate-50 text-slate-500 hover:border-slate-400'"
            @click="sortBy = 'price'"
          >Cheapest</button>
          <button
            class="text-xs font-medium px-3.5 py-1.5 rounded-lg transition-all cursor-pointer border border-slate-200"
            :class="sortBy === 'duration' ? 'bg-primary text-white border-primary' : 'bg-slate-50 text-slate-500 hover:border-slate-400'"
            @click="sortBy = 'duration'"
          >Fastest</button>
        </div>
      </div>

      <!-- ── Highlighted flights ─────────────────────────────────────────── -->
      <div v-if="filteredFlights.length" class="grid grid-cols-1 gap-3.5">

        <!-- Recommended -->
        <div v-if="recommended" class="flex flex-col min-w-0">
          <div class="self-start flex items-center gap-1.5 text-xs font-bold bg-primary text-white px-3 py-1.5 rounded-t-lg">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            Recommended · Best Value
          </div>
          <FlightCard
            :flight="recommended"
            :expanded="!!expanded[recommended.id]"
            highlight="recommended"
            @toggle="toggleExpand(recommended.id)"
            @book="(id) => $emit('book', id)"
          />
        </div>

        <!-- Time Saver -->
        <div v-if="timeSaver && timeSaver.id !== recommended?.id" class="flex flex-col min-w-0">
          <div class="self-start flex items-center gap-1.5 text-xs font-bold bg-sky-700 text-white px-3 py-1.5 rounded-t-lg">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/>
            </svg>
            Time Saver · Fastest Flight
          </div>
          <FlightCard
            :flight="timeSaver"
            :expanded="!!expanded[timeSaver.id]"
            highlight="timesaver"
            @toggle="toggleExpand(timeSaver.id)"
            @book="(id) => $emit('book', id)"
          />
        </div>
      </div>

      <!-- ── All other flights ───────────────────────────────────────────── -->
      <template v-if="sortedOthers.length">

        <div class="flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">
          <div class="flex-1 h-px bg-slate-200"></div>
          <span>All Available Flights</span>
          <div class="flex-1 h-px bg-slate-200"></div>
        </div>

        <div class="flex flex-col gap-2.5">
          <FlightCard
            v-for="flight in paginatedResults"
            :key="flight.id"
            :flight="flight"
            :expanded="!!expanded[flight.id]"
            @toggle="toggleExpand(flight.id)"
            @book="(id) => $emit('book', id)"
          />
        </div>

        <!-- Pagination -->
         <Pagination
          v-if="filteredFlights.length > 0"
          :total-items="filteredFlights.length"
          :items-per-page="itemsPerPage"
          :current-page="currentPage"
          @page-change="handlePageChange"
        />
      </template>

      <!-- Empty state -->
      <div v-if="filteredFlights.length === 0" class="flex flex-col items-center gap-3 py-20 text-center">
        <span class="text-5xl">✈️</span>
        <h3 class="text-lg font-bold text-slate-800">No flights found</h3>
        <p class="text-sm text-slate-500">Try adjusting your filters to see more options.</p>
        <button
          class="mt-2 px-6 py-2.5 bg-primary hover:bg-primary text-white text-sm font-semibold rounded-xl border-none cursor-pointer transition-colors"
          @click="clearFilters"
        >
          Clear all filters
        </button>
      </div>
    </div>
  </div>
</template>