<script setup lang="ts">
import { computed } from 'vue'
import { useCurrency } from '../../composables/useCurrency'
import { useHotelBookingStore } from '../../stores/useHotelBookingStore'
import AppToast from '../toast/AppToast.vue'

const emit = defineEmits<{ (e: 'next'): void; (e: 'back'): void }>()
const store = useHotelBookingStore()
const { format } = useCurrency()

const fmtDate = (d: string) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

const stars = computed(() => {
  const r = store.hotel?.rating ?? 0
  return { filled: r, empty: Math.max(0, 5 - r) }
})

const guestLabels = computed(() => {
  let adultCount = 0
  let childCount = 0

  return store.guests.map((g) => {
    if (g.type === 'adult') {
      adultCount++
      return `Adult ${adultCount}`
    }

    childCount++

    let ageLabel = ''
    if (g.age !== undefined) {
      if (g.age === 0) {
        ageLabel = ' (Under 1)'
      } else {
        ageLabel = ` (Age ${g.age})`
      }
    }

    return `Child ${childCount}${ageLabel}`
  })
})

const guestBreakdown = computed(() => {
  const rooms = store.searchParams.rooms ?? []
  return {
    adults: rooms.reduce((s, r) => s + (r.adults ?? 0), 0),
    children: rooms.reduce((s, r) => s + (r.children ?? 0), 0),
  }
})

function proceed() {
  store.generateInvoice()
  emit('next')
}
</script>

<template>
  <AppToast />
  <div class="space-y-5">
    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div class="relative h-44 bg-slate-200 overflow-hidden">
        <img
          v-if="store.hotel?.thumbnail"
          :src="store.hotel.thumbnail"
          :alt="store.hotel.hotel_name"
          class="w-full h-full object-cover"
          @error="($event.target as HTMLImageElement).style.display = 'none'"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        <div class="absolute bottom-4 left-5 right-5">
          <div class="flex gap-0.5 mb-1.5">
            <span v-for="_ in stars.filled" :key="`f${_}`" class="text-amber-400 text-sm leading-none">★</span>
            <span v-for="_ in stars.empty"  :key="`e${_}`" class="text-white/30 text-sm leading-none">★</span>
          </div>
          <p class="text-white font-bold text-lg leading-snug">{{ store.hotel?.hotel_name }}</p>
          <p class="text-white/70 text-xs mt-0.5 flex items-center gap-1">
            <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
              <path d="M8 1.5A4.5 4.5 0 0 1 12.5 6c0 3.5-4.5 8.5-4.5 8.5S3.5 9.5 3.5 6A4.5 4.5 0 0 1 8 1.5Z"
                stroke="currentColor" stroke-width="1.3"/>
              <circle cx="8" cy="6" r="1.5" stroke="currentColor" stroke-width="1.3"/>
            </svg>
            {{ store.hotel?.hotel_address || store.searchParams.city }}
          </p>
        </div>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-100 border-b border-slate-100">
        <div class="px-4 py-3.5">
          <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Check-in</p>
          <p class="text-sm font-semibold text-slate-800">{{ fmtDate(store.searchParams.checkInStart) }}</p>
        </div>
        <div class="px-4 py-3.5">
          <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Check-out</p>
          <p class="text-sm font-semibold text-slate-800">{{ fmtDate(store.searchParams.checkInEnd) }}</p>
        </div>
        <div class="px-4 py-3.5">
          <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Duration</p>
          <p class="text-sm font-semibold text-slate-800">{{ store.nights }} night{{ store.nights !== 1 ? 's' : '' }}</p>
        </div>
        <div class="px-4 py-3.5">
          <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Guests</p>
          <p class="text-sm font-semibold text-slate-800">
            {{ guestBreakdown.adults + guestBreakdown.children }}
            <span class="text-xs font-normal text-slate-400">
              ({{ guestBreakdown.adults }}A<template v-if="guestBreakdown.children > 0">, {{ guestBreakdown.children }}C</template>)
            </span>
          </p>
        </div>
      </div>

      <!-- Selected room -->
      <div class="px-5 py-4 border-b border-slate-100">
        <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Selected Room</p>
        <div class="flex items-start justify-between gap-4">
          <div class="min-w-0">
            <p class="text-sm font-bold text-slate-800">{{ store.selectedRoom?.roomName }}</p>
            <div class="flex flex-wrap gap-1.5 mt-2">
              <span class="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-green-50 text-green-700">
                {{ store.selectedRoom?.boardType }}
              </span>
              <span
                class="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full"
                :class="store.selectedRoom?.cancellationPolicy.includes('Non-refundable')
                  ? 'bg-red-50 text-red-600'
                  : 'bg-teal-50 text-teal-700'"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                  :stroke="store.selectedRoom?.cancellationPolicy.includes('Non-refundable') ? '#dc2626' : '#0d9488'"
                  stroke-width="2.5">
                  <path v-if="!store.selectedRoom?.cancellationPolicy.includes('Non-refundable')"
                    d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <template v-else>
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </template>
                </svg>
                {{ store.selectedRoom?.cancellationPolicy }}
              </span>
              <span class="inline-flex items-center text-[11px] font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
                {{ store.searchParams.totalRooms }} room{{ store.searchParams.totalRooms !== 1 ? 's' : '' }}
              </span>
            </div>

            <!-- Amenities -->
            <div v-if="store.selectedRoom?.amenities?.length" class="flex flex-wrap gap-1.5 mt-2">
              <span
                v-for="a in store.selectedRoom.amenities.slice(0, 4)" :key="a"
                class="text-[10px] text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md"
              >
                {{ a }}
              </span>
            </div>
          </div>

          <div class="text-right shrink-0">
            <p class="text-[10px] text-slate-400 mb-0.5">per night</p>
            <p class="text-base font-bold text-slate-900">{{ format(store.selectedRoom?.pricePerNight ?? 0) }}</p>
          </div>
        </div>
      </div>

      <!-- Price breakdown -->
      <div class="px-5 py-4 space-y-2.5">
        <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Price Breakdown</p>

        <div class="flex justify-between text-sm text-slate-600">
          <span>
            {{ format(store.selectedRoom?.pricePerNight ?? 0) }}/night
            × {{ store.nights }} night{{ store.nights !== 1 ? 's' : '' }}
            × {{ store.searchParams.totalRooms }} room{{ store.searchParams.totalRooms !== 1 ? 's' : '' }}
          </span>
          <span>{{ format(store.priceBreakdown.baseNgn) }}</span>
        </div>
        <div class="flex justify-between text-sm text-slate-600">
          <span>VAT (7.5%)</span>
          <span>{{ format(store.priceBreakdown.tax) }}</span>
        </div>
        <div class="flex justify-between items-center pt-3 border-t border-dashed border-slate-200">
          <span class="font-bold text-slate-900">Total Due</span>
          <div class="text-right">
            <p class="text-xl font-bold text-primary">{{ format(store.priceBreakdown.total) }}</p>
            <p class="text-[10px] text-slate-400">incl. VAT · {{ store.searchParams.currency ?? 'NGN' }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Proforma invoice header ─────────────────────────────────────────── -->
    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div class="flex items-start justify-between px-6 py-5 border-b border-slate-100">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <div class="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <span class="text-lg font-bold text-slate-900">TravelCo</span>
          </div>
          <p class="text-xs text-slate-400">VAT Reg: NG-123456789</p>
        </div>
        <div class="text-right">
          <p class="text-xs text-slate-400 mb-0.5">PROFORMA INVOICE</p>
          <p class="text-sm font-bold text-slate-700">{{ store.invoiceNumber || 'INV-PREVIEW' }}</p>
          <p class="text-xs text-slate-400 mt-1">
            {{ store.invoiceDate || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) }}
          </p>
        </div>
      </div>

      <!-- Billed to -->
      <div class="px-6 py-4 bg-slate-50 border-b border-slate-100">
        <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Billed To</p>
        <p class="text-sm font-semibold text-slate-800">
          {{ store.guests[0]?.title }} {{ store.guests[0]?.firstName }} {{ store.guests[0]?.lastName }}
        </p>
        <p class="text-xs text-slate-500 mt-0.5">{{ store.contactEmail }}</p>
        <p class="text-xs text-slate-500">{{ store.contactPhone }}</p>
      </div>

      <!-- Line item -->
      <div class="px-6 py-4 border-b border-slate-100">
        <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Booking Details</p>
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-slate-800">{{ store.hotel?.hotel_name }}</p>
            <p class="text-xs text-slate-500 mt-0.5">
              {{ store.hotel?.hotel_address || store.searchParams.city }}
            </p>
            <p class="text-xs text-slate-500 mt-1.5">
              {{ fmtDate(store.searchParams.checkInStart) }} → {{ fmtDate(store.searchParams.checkInEnd) }}
              · {{ store.nights }} night{{ store.nights !== 1 ? 's' : '' }}
            </p>
            <p class="text-xs text-slate-500">
              {{ store.searchParams.totalRooms }} × {{ store.selectedRoom?.roomName }}
              <span v-if="store.selectedRoom?.boardType" class="text-slate-400">({{ store.selectedRoom.boardType }})</span>
            </p>
          </div>
          <p class="text-sm font-semibold text-slate-800 shrink-0">{{ format(store.priceBreakdown.baseNgn) }}</p>
        </div>
      </div>

      <!-- Totals -->
      <div class="px-6 py-4 space-y-2">
        <div class="flex justify-between text-sm text-slate-600">
          <span>Subtotal</span><span>{{ format(store.priceBreakdown.baseNgn) }}</span>
        </div>
        <div class="flex justify-between text-sm text-slate-600">
          <span>VAT (7.5%)</span><span>{{ format(store.priceBreakdown.tax) }}</span>
        </div>
        <div class="flex justify-between items-center pt-3 border-t border-slate-200 font-bold">
          <span class="text-slate-900">Total Due</span>
          <span class="text-xl text-slate-900">{{ format(store.priceBreakdown.total) }}</span>
        </div>
        <p class="text-[10px] text-slate-400 text-right">All amounts in NGN (₦)</p>
      </div>
    </div>

    <!-- ── Guest summary ───────────────────────────────────────────────────── -->
    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div class="px-5 py-3.5 bg-slate-50 border-b border-slate-100">
        <p class="text-sm font-semibold text-slate-800">
          Guest Summary
          <span class="ml-2 text-xs font-normal text-slate-400">{{ store.guests.length }} traveller{{ store.guests.length !== 1 ? 's' : '' }}</span>
        </p>
      </div>
      <div class="divide-y divide-slate-100">
        <div
          v-for="(g, i) in store.guests"
          :key="i"
          class="px-5 py-3.5 flex items-center justify-between"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
              :class="g.type === 'child' ? 'bg-amber-500' : 'bg-primary'"
            >
              {{ i + 1 }}
            </div>
            <div>
              <p class="text-sm font-medium text-slate-800">
                {{ g.title }} {{ g.firstName }} {{ g.lastName }}
              </p>
              <p class="text-xs text-slate-400">
                {{ guestLabels[i] }}
                <span v-if="i === 0" class="ml-1.5 text-primary">· {{ store.contactEmail }}</span>
              </p>
            </div>
          </div>
          <!-- Type badge -->
          <span
            class="text-[11px] font-medium px-2.5 py-1 rounded-full"
            :class="g.type === 'child' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-500'"
          >
            {{ g.type === 'child' ? 'Child' : 'Adult' }}
          </span>
        </div>
      </div>
    </div>

    <!-- Email notice -->
    <div class="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3.5">
      <svg class="shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22,6 12,13 2,6"/>
      </svg>
      <div>
        <p class="text-sm font-semibold text-amber-800">Invoice will be sent to:</p>
        <p class="text-sm text-amber-700 font-mono mt-0.5">{{ store.contactEmail }}</p>
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
        class="flex-[2] h-12 bg-primary hover:opacity-90 text-white font-bold rounded-2xl transition-all border-none cursor-pointer shadow-lg flex items-center justify-center gap-2"
        @click="proceed"
      >
        Proceed to Payment
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </button>
    </div>

  </div>
</template>
