<!-- Step 0: Room selection — Rezlive room options for the chosen hotel -->
<script setup lang="ts">
import { onMounted } from 'vue'
import { useHotelBookingStore } from '../../composables/useHotelBookingStore'

const emit = defineEmits<(e: 'next') => void>()
const { state, nights, priceBreakdown, fmtNgn, fetchRooms, selectRoom } = useHotelBookingStore()

onMounted(fetchRooms)

function choose(room: any) {
  selectRoom(room)
  emit('next')
}

const boardColors: Record<string, string> = {
  'Room Only': 'bg-slate-100 text-slate-600',
  'Bed & Breakfast': 'bg-amber-50 text-amber-700',
  'Half Board': 'bg-blue-50 text-blue-700',
  'Full Board': 'bg-green-50 text-green-700',
}
</script>

<template>
  <div class="space-y-4">

    <!-- Loading -->
    <div v-if="state.roomsLoading" class="flex flex-col items-center py-20 gap-4">
      <div class="w-12 h-12 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
      <p class="text-slate-600 font-medium text-sm">Checking room availability…</p>
    </div>

    <!-- Error -->
    <div v-else-if="state.roomsError" class="flex flex-col items-center py-16 gap-3 text-center">
      <span class="text-4xl">😞</span>
      <p class="font-semibold text-slate-800">Couldn't load rooms</p>
      <p class="text-sm text-slate-500">{{ state.roomsError }}</p>
      <button class="mt-2 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold border-none cursor-pointer" @click="fetchRooms">
        Try Again
      </button>
    </div>

    <!-- Room cards -->
    <template v-else>
      <p class="text-xs text-slate-500">
        {{ state.availableRooms.length }} room option{{ state.availableRooms.length !== 1 ? 's' : '' }} available ·
        {{ state.searchParams.totalRooms }} room{{ state.searchParams.totalRooms !== 1 ? 's' : '' }} needed ·
        {{ nights }} night{{ nights !== 1 ? 's' : '' }}
      </p>

      <div
        v-for="room in state.availableRooms"
        :key="room.rezliveRoomId"
        class="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all overflow-hidden"
      >
        <div class="p-5">
          <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">

            <!-- Room info -->
            <div class="flex-1 min-w-0">
              <div class="flex flex-wrap items-center gap-2 mb-2">
                <h3 class="text-base font-bold text-slate-900">{{ room.roomName }}</h3>
                <span class="text-xs font-semibold px-2 py-0.5 rounded-full" :class="boardColors[room.boardType] ?? 'bg-slate-100 text-slate-600'">
                  {{ room.boardType }}
                </span>
              </div>

              <!-- Amenities -->
              <div class="flex flex-wrap gap-1.5 mb-3">
                <span
                  v-for="a in room.amenities" :key="a"
                  class="flex items-center gap-1 text-xs text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5"><polyline points="20,6 9,17 4,12"/></svg>
                  {{ a }}
                </span>
              </div>

              <!-- Cancellation -->
              <div class="flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                  :stroke="room.cancellationPolicy.includes('Non-refundable') ? '#ef4444' : '#16a34a'"
                  stroke-width="2">
                  <path v-if="!room.cancellationPolicy.includes('Non-refundable')" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <template v-else>
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </template>
                </svg>
                <p class="text-xs font-medium" :class="room.cancellationPolicy.includes('Non-refundable') ? 'text-red-600' : 'text-green-700'">
                  {{ room.cancellationPolicy }}
                </p>
              </div>
            </div>

            <!-- Price + CTA -->
            <div class="sm:text-right sm:min-w-[160px] shrink-0">
              <p class="text-xs text-slate-400 mb-0.5">{{ state.searchParams.totalRooms }} room{{ state.searchParams.totalRooms > 1 ? 's' : '' }} × {{ nights }} nights</p>
              <p class="text-2xl font-bold text-slate-900">
                {{ fmtNgn(room.totalPrice * state.searchParams.totalRooms * state.ngnRate) }}
              </p>
              <p class="text-xs text-slate-400 mb-3">excl. taxes</p>
              <button
                class="w-full sm:w-auto px-6 py-2.5 bg-primary hover:opacity-90 active:scale-95 text-white text-sm font-bold rounded-xl border-none cursor-pointer transition-all"
                @click="choose(room)"
              >
                Select Room
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

