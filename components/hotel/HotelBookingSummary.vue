<script setup lang="ts">
import { useHotelBookingStore } from '../../composables/useHotelBookingStore'

const { state, nights, priceBreakdown, fmtNgn } = useHotelBookingStore()

const fmtDate = (d: string) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
</script>

<template>
  <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden sticky top-6">

    <!-- Hotel image + name -->
    <div class="relative h-36 bg-slate-200 overflow-hidden">
      <img
        v-if="state.hotel?.image"
        :src="state.hotel.image"
        :alt="state.hotel.name"
        class="w-full h-full object-cover"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
      <div class="absolute bottom-3 left-4 right-4">
        <p class="text-white font-bold text-base leading-tight">{{ state.hotel?.name }}</p>
        <p class="text-white/70 text-xs mt-0.5">{{ state.searchParams.city }}</p>
      </div>
    </div>

    <!-- Stay details -->
    <div class="px-5 py-4 border-b border-slate-100 space-y-2.5">
      <p class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Stay Details</p>

      <div class="flex justify-between text-sm">
        <span class="text-slate-500">Check-in</span>
        <span class="font-medium text-slate-800">{{ fmtDate(state.searchParams.checkInStart) }}</span>
      </div>
      <div class="flex justify-between text-sm">
        <span class="text-slate-500">Check-out</span>
        <span class="font-medium text-slate-800">{{ fmtDate(state.searchParams.checkInEnd) }}</span>
      </div>
      <div class="flex justify-between text-sm">
        <span class="text-slate-500">Duration</span>
        <span class="font-medium text-slate-800">{{ nights }} night{{ nights !== 1 ? 's' : '' }}</span>
      </div>
      <div class="flex justify-between text-sm">
        <span class="text-slate-500">Rooms</span>
        <span class="font-medium text-slate-800">{{ state.searchParams.totalRooms }}</span>
      </div>
      <div class="flex justify-between text-sm">
        <span class="text-slate-500">Guests</span>
        <span class="font-medium text-slate-800">{{ state.searchParams.totalGuests }}</span>
      </div>
    </div>

    <!-- Selected room -->
    <div v-if="state.selectedRoom" class="px-5 py-4 border-b border-slate-100 space-y-2">
      <p class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Selected Room</p>
      <p class="text-sm font-semibold text-slate-800">{{ state.selectedRoom.roomName }}</p>
      <p class="text-xs text-slate-500">{{ state.selectedRoom.boardType }}</p>
      <div class="flex items-center gap-1.5 mt-2">
        <svg class="shrink-0" width="12" height="12" viewBox="0 0 24 24" fill="none"
          :stroke="state.selectedRoom.cancellationPolicy.includes('Non-refundable') ? '#ef4444' : '#16a34a'"
          stroke-width="2">
          <path v-if="!state.selectedRoom.cancellationPolicy.includes('Non-refundable')" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <template v-else>
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </template>
        </svg>
        <p class="text-xs" :class="state.selectedRoom.cancellationPolicy.includes('Non-refundable') ? 'text-red-600' : 'text-green-700'">
          {{ state.selectedRoom.cancellationPolicy }}
        </p>
      </div>
    </div>

    <!-- Price breakdown -->
    <div v-if="state.selectedRoom" class="px-5 py-4 space-y-2.5">
      <p class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Price Breakdown</p>

      <div class="flex justify-between text-sm text-slate-600">
        <span>{{ fmtNgn(state.selectedRoom.pricePerNight * state.ngnRate) }}/night × {{ nights }} night{{ nights !== 1 ? 's' : '' }} × {{ state.searchParams.totalRooms }} room{{ state.searchParams.totalRooms !== 1 ? 's' : '' }}</span>
      </div>
      <div class="flex justify-between text-sm text-slate-600">
        <span>Subtotal</span>
        <span>{{ fmtNgn(priceBreakdown.baseNgn) }}</span>
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

    <!-- Email note -->
    <div class="mx-5 mb-5 flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2.5">
      <svg class="shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
      </svg>
      <p class="text-xs text-primary">Invoice & booking voucher will be emailed after payment.</p>
    </div>
  </div>
</template>
