<!-- Step 4: Confirmed — ticket issued -->
<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useBookingStore } from '../../composables/useBookingStore'

const router = useRouter()
const { state, fmtNgn, priceBreakdown, reset } = useBookingStore()

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

function bookAnother() {
  reset()
  router.push('/travel/flights')
}

function printTicket() {
    console.log('Print')
}
</script>

<template>
  <div class="space-y-6">

    <!-- ── Success banner ────────────────────────────────────────────────── -->
    <div class="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl px-6 py-8 text-center shadow-xl shadow-green-200">
      <div class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><polyline points="20,6 9,17 4,12"/></svg>
      </div>
      <h2 class="text-2xl font-bold text-white mb-1">Booking Confirmed!</h2>
      <p class="text-green-100 text-sm mb-4">Your flight has been booked successfully.</p>
      <div class="inline-block bg-white/20 rounded-xl px-5 py-2">
        <p class="text-xs text-green-100 mb-0.5">Booking Reference</p>
        <p class="text-2xl font-bold text-white font-mono tracking-widest">{{ state.bookingReference }}</p>
      </div>
    </div>

    <!-- ── Email confirmation notice ─────────────────────────────────────── -->
    <div class="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-2xl px-4 py-4">
      <svg class="shrink-0 mt-0.5" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
      <div>
        <p class="text-sm font-semibold text-blue-900">Confirmation email sent</p>
        <p class="text-sm text-blue-600 mt-0.5">Invoice and e-ticket sent to <span class="font-mono font-bold">{{ state.contactEmail }}</span></p>
        <p class="text-xs text-blue-500 mt-1.5">Check your spam folder if you don't see it within 5 minutes.</p>
      </div>
    </div>

    <!-- ── E-Ticket card ──────────────────────────────────────────────────── -->
    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <!-- Ticket header -->
      <div class="px-5 py-4 bg-slate-800 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.36 2 2 0 0 1 3.59 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          <span class="text-white font-bold">E-TICKET</span>
        </div>
        <span class="text-slate-400 text-xs font-mono">{{ state.invoiceNumber }}</span>
      </div>

      <!-- Flight info -->
      <div class="px-5 py-4 border-b border-slate-100">
        <p class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Flight</p>
        <div class="flex items-center justify-between">
          <div class="text-center">
            <p class="text-3xl font-bold text-slate-900 font-mono">{{ fmtTime(state.offer?.itineraries[0].segments[0].departure.at ?? '') }}</p>
            <p class="text-sm font-bold text-slate-600 mt-1">{{ state.offer?.itineraries[0].segments[0].departure.iataCode }}</p>
            <p class="text-xs text-slate-400">{{ fmtDate(state.offer?.itineraries[0].segments[0].departure.at ?? '') }}</p>
          </div>
          <div class="flex flex-col items-center flex-1 px-4">
            <p class="text-xs text-slate-400 mb-1">{{ parseDur(state.offer?.itineraries[0].duration ?? 'PT0H') }}</p>
            <div class="w-full flex items-center gap-1">
              <div class="h-px flex-1 bg-slate-200"></div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
              <div class="h-px flex-1 bg-slate-200"></div>
            </div>
            <p class="text-xs text-green-600 font-medium mt-1">
              {{ state.offer?.itineraries[0].segments.length === 1 ? 'Non-stop' : `${state.offer?.itineraries[0].segments.length - 1} stop` }}
            </p>
          </div>
          <div class="text-center">
            <p class="text-3xl font-bold text-slate-900 font-mono">{{ fmtTime(state.offer?.itineraries[0].segments.at(-1)?.arrival.at ?? '') }}</p>
            <p class="text-sm font-bold text-slate-600 mt-1">{{ state.offer?.itineraries[0].segments.at(-1)?.arrival.iataCode }}</p>
            <p class="text-xs text-slate-400">{{ fmtDate(state.offer?.itineraries[0].segments.at(-1)?.arrival.at ?? '') }}</p>
          </div>
        </div>
        <p class="text-center text-xs text-slate-400 mt-3">
          {{ CARRIERS[state.offer?.itineraries[0].segments[0].carrierCode] ?? '' }} ·
          Flight {{ state.offer?.itineraries[0].segments[0].carrierCode }}{{ state.offer?.itineraries[0].segments[0].number }}
        </p>
      </div>

      <!-- Dashed ticket tear line -->
      <div class="flex items-center px-5 -my-px relative">
        <div class="w-5 h-5 rounded-full bg-slate-100 -ml-9 border border-slate-200"></div>
        <div class="flex-1 border-t-2 border-dashed border-slate-200 mx-2"></div>
        <div class="w-5 h-5 rounded-full bg-slate-100 -mr-9 border border-slate-200"></div>
      </div>

      <!-- Passengers + ticket numbers -->
      <div class="px-5 py-4">
        <p class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Passengers & Tickets</p>
        <div class="space-y-3">
          <div
            v-for="(p, i) in state.passengers" :key="i"
            class="flex items-center justify-between py-2 border-b border-slate-100 last:border-0"
          >
            <div>
              <p class="text-sm font-semibold text-slate-800">{{ p.title }} {{ p.firstName }} {{ p.lastName }}</p>
              <p class="text-xs text-slate-400">{{ p.passportNumber }}</p>
            </div>
            <div class="text-right">
              <p class="text-[10px] text-slate-400 mb-0.5">Ticket No.</p>
              <p class="font-mono text-xs font-bold text-primary">{{ state.ticketNumbers[i] }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Amount paid -->
      <div class="px-5 py-4 bg-slate-50 flex items-center justify-between border-t border-slate-100">
        <div>
          <p class="text-xs text-slate-400">Amount Paid</p>
          <p class="text-xl font-bold text-slate-900">{{ fmtNgn(priceBreakdown.total) }}</p>
        </div>
        <div class="flex items-center gap-1.5 bg-green-100 border border-green-200 rounded-lg px-3 py-1.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5"><polyline points="20,6 9,17 4,12"/></svg>
          <span class="text-xs font-bold text-green-700">PAID</span>
        </div>
      </div>
    </div>

    <!-- ── Actions ───────────────────────────────────────────────────────── -->
    <div class="grid grid-cols-2 gap-3">
      <button
        class="h-12 border-2 border-slate-200 text-slate-700 font-semibold rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer bg-white flex items-center justify-center gap-2 text-sm"
        @click="printTicket"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
        Print Ticket
      </button>
      <button
        class="h-12 bg-primary hover:opacity-90 text-white font-semibold rounded-2xl transition-all border-none cursor-pointer flex items-center justify-center gap-2 text-sm"
        @click="bookAnother"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
        Book Another Flight
      </button>
    </div>
  </div>
</template>

