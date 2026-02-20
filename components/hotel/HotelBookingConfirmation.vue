<!-- Step 5: Confirmed — voucher issued -->
<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useHotelBookingStore } from '../../composables/useHotelBookingStore'

const router = useRouter()
const { state, nights, priceBreakdown, fmtNgn, reset } = useHotelBookingStore()

const fmtDate = (d: string) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

function bookAnother() { reset(); router.push('/travel/hotels') }
</script>

<template>
  <div class="space-y-6">

    <!-- Success banner -->
    <div class="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl px-6 py-8 text-center shadow-xl shadow-green-200">
      <div class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><polyline points="20,6 9,17 4,12"/></svg>
      </div>
      <h2 class="text-2xl font-bold text-white mb-1">Booking Confirmed!</h2>
      <p class="text-green-100 text-sm mb-4">Your hotel has been booked successfully.</p>
      <div class="inline-block bg-white/20 rounded-xl px-5 py-2">
        <p class="text-xs text-green-100 mb-0.5">Booking Reference</p>
        <p class="text-2xl font-bold text-white font-mono tracking-widest">{{ state.bookingReference }}</p>
      </div>
    </div>

    <!-- Email confirmation -->
    <div class="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-2xl px-4 py-4">
      <svg class="shrink-0 mt-0.5" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
      <div>
        <p class="text-sm font-semibold text-blue-900">Confirmation sent</p>
        <p class="text-sm text-blue-600 mt-0.5">Invoice & hotel voucher sent to <span class="font-mono font-bold">{{ state.contactEmail }}</span></p>
        <p class="text-xs text-blue-500 mt-1.5">Check your spam folder if you don't see it within 5 minutes.</p>
      </div>
    </div>

    <!-- Voucher card -->
    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <!-- Card header -->
      <div class="px-5 py-4 bg-slate-800 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          <span class="text-white font-bold text-sm">HOTEL VOUCHER</span>
        </div>
        <span class="text-slate-400 text-xs font-mono">{{ state.invoiceNumber }}</span>
      </div>

      <!-- Hotel -->
      <div class="px-5 py-4 border-b border-slate-100">
        <p class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Hotel</p>
        <p class="text-lg font-bold text-slate-900">{{ state.hotel?.name }}</p>
        <p class="text-sm text-slate-500">{{ state.searchParams.city }}</p>
      </div>

      <!-- Stay summary -->
      <div class="px-5 py-4 border-b border-slate-100">
        <div class="grid grid-cols-3 gap-4 text-center">
          <div>
            <p class="text-xs text-slate-400 mb-1">Check-in</p>
            <p class="text-sm font-bold text-slate-900">{{ fmtDate(state.searchParams.checkInStart) }}</p>
          </div>
          <div class="flex flex-col items-center justify-center">
            <p class="text-xs text-slate-400 mb-1">Duration</p>
            <div class="flex items-center gap-1">
              <div class="h-px w-6 bg-slate-300"></div>
              <p class="text-xs font-bold text-slate-600 whitespace-nowrap">{{ nights }}n</p>
              <div class="h-px w-6 bg-slate-300"></div>
            </div>
          </div>
          <div>
            <p class="text-xs text-slate-400 mb-1">Check-out</p>
            <p class="text-sm font-bold text-slate-900">{{ fmtDate(state.searchParams.checkInEnd) }}</p>
          </div>
        </div>
      </div>

      <!-- Room + guests -->
      <div class="px-5 py-4 border-b border-slate-100 space-y-2">
        <div class="flex justify-between text-sm">
          <span class="text-slate-500">Room type</span>
          <span class="font-medium text-slate-800">{{ state.selectedRoom?.roomName }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-slate-500">Board</span>
          <span class="font-medium text-slate-800">{{ state.selectedRoom?.boardType }}</span>
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

      <!-- Guest names -->
      <div class="px-5 py-4 border-b border-slate-100">
        <p class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Guests</p>
        <div class="space-y-2">
          <div v-for="(g, i) in state.guests" :key="i" class="flex items-center justify-between">
            <p class="text-sm text-slate-700">{{ g.title }} {{ g.firstName }} {{ g.lastName }}</p>
            <span class="text-xs text-slate-400">Room {{ i + 1 }}</span>
          </div>
        </div>
      </div>

      <!-- Tear line + amount -->
      <div class="flex items-center px-5 -my-px relative">
        <div class="w-5 h-5 rounded-full bg-slate-100 -ml-9 border border-slate-200"></div>
        <div class="flex-1 border-t-2 border-dashed border-slate-200 mx-2"></div>
        <div class="w-5 h-5 rounded-full bg-slate-100 -mr-9 border border-slate-200"></div>
      </div>

      <div class="px-5 py-4 bg-slate-50 flex items-center justify-between">
        <div>
          <p class="text-xs text-slate-400">Total Paid</p>
          <p class="text-xl font-bold text-slate-900">{{ fmtNgn(priceBreakdown.total) }}</p>
        </div>
        <div class="flex items-center gap-1.5 bg-green-100 border border-green-200 rounded-lg px-3 py-1.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5"><polyline points="20,6 9,17 4,12"/></svg>
          <span class="text-xs font-bold text-green-700">PAID</span>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="grid grid-cols-2 gap-3">
      <a
        v-if="state.voucherUrl && state.voucherUrl !== '#'"
        :href="state.voucherUrl"
        target="_blank"
        class="h-12 border-2 border-slate-200 text-slate-700 font-semibold rounded-2xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 text-sm no-underline"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        Download Voucher
      </a>
      <button
        class="h-12 border-2 border-slate-200 text-slate-700 font-semibold rounded-2xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 text-sm cursor-pointer bg-white border-none"
        :class="state.voucherUrl && state.voucherUrl !== '#' ? '' : 'col-span-1'"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
        Print
      </button>
      <button
        class="h-12 bg-primary hover:opacity-90 text-white font-semibold rounded-2xl transition-all border-none cursor-pointer flex items-center justify-center gap-2 text-sm"
        :class="state.voucherUrl && state.voucherUrl !== '#' ? 'col-span-2' : 'col-span-1'"
        @click="bookAnother"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
        Book Another Hotel
      </button>
    </div>
  </div>
</template>
