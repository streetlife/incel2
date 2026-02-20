<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useHotelBookingStore } from '../../../../composables/useHotelBookingStore'
import HotelBookingSummary from '../../../../components/hotel/HotelBookingSummary.vue'
import HotelRoomSelect from '../../../../components/hotel/HotelRoomSelect.vue'
import HotelGuestForm from '../../../../components/hotel/HotelGuestForm.vue'
import HotelBookingReview from '../../../../components/hotel/HotelBookingReview.vue'
import HotelPaymentForm from '../../../../components/hotel/HotelPaymentForm.vue'
import HotelBookingConfirmation from '../../../../components/hotel/HotelBookingConfirmation.vue'

const route = useRoute()
const router = useRouter()
const { state, setHotel } = useHotelBookingStore()

const STEPS = [
  { id: 1, label: 'Rooms'},
  { id: 2, label: 'Details'},
  { id: 3, label: 'Review'},
  { id: 4, label: 'Payment'},
  { id: 5, label: 'Confirmed'},
]

const step = ref(Number.parseInt(route.query.step as string) || 1)

watch(step, s =>
  router.replace({ query: { ...route.query, step: String(s) } })
)

onMounted(() => {
  const raw = sessionStorage.getItem('selectedHotel')
  if (raw) {
    try {
      const { hotel, searchParams } = JSON.parse(raw)
      setHotel(hotel, searchParams)
    } catch {}
  }
  if (!state.hotel && step.value < 5) {
    router.replace('/travel/hotels')
  }
})

function goNext() {
  step.value = Math.min(step.value + 1, 5)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function goBack() {
  if (step.value === 1) { router.push('/travel/hotels'); return }
  step.value = Math.max(step.value - 1, 1)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const showSidebar = computed(() => step.value < 5)
</script>

<template>
  <div class="min-h-screen bg-slate-100 pt-36 pb-16 sm:px-24 px-4">
    <div class="max-w-6xl mx-auto">

      <!-- Back + heading -->
      <div class="mb-8">
        <button
          class="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors cursor-pointer bg-transparent border-none p-0 mb-4"
          @click="goBack"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          {{ step === 1 ? 'Back to results' : 'Back' }}
        </button>
        <h1 class="text-2xl md:text-3xl font-bold text-slate-900">Complete Your Booking</h1>
        <p class="text-slate-500 text-sm mt-1">{{ state.hotel?.name }} · {{ state.searchParams.city }}</p>
      </div>

      <!-- Stepper -->
      <div v-if="step < 5" class="mb-8">
        <div class="flex items-center gap-0">
          <template v-for="(s, i) in STEPS.slice(0, 4)" :key="s.id">
            <div class="flex flex-col items-center gap-1.5">
              <div
                class="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all border-2"
                :class="step === s.id
                  ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30'
                  : step > s.id
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'bg-white border-slate-200 text-slate-400'"
              >
                <svg v-if="step > s.id" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20,6 9,17 4,12"/></svg>
                <span v-else>{{ s.id }}</span>
              </div>
              <span class="text-xs font-medium hidden sm:block" :class="step >= s.id ? 'text-slate-700' : 'text-slate-400'">{{ s.label }}</span>
            </div>
            <div v-if="i < 3" class="flex-1 h-0.5 mx-2 mb-5 transition-colors" :class="step > s.id ? 'bg-green-400' : 'bg-slate-200'"></div>
          </template>
        </div>
      </div>

      <!-- Layout -->
      <div :class="showSidebar ? 'grid gap-6 lg:grid-cols-[1fr_320px]' : 'max-w-2xl mx-auto'">

        <!-- Main content -->
        <div class="min-w-0">
          <Transition
            mode="out-in"
            enter-active-class="transition-all duration-200 ease-out"
            enter-from-class="opacity-0 translate-x-4"
            enter-to-class="opacity-100 translate-x-0"
            leave-active-class="transition-all duration-150 ease-in"
            leave-from-class="opacity-100 translate-x-0"
            leave-to-class="opacity-0 -translate-x-4"
          >
            <HotelRoomSelect         v-if="step === 1" @next="goNext" />
            <HotelGuestForm          v-else-if="step === 2" @next="goNext" @back="goBack" />
            <HotelBookingReview      v-else-if="step === 3" @next="goNext" @back="goBack" />
            <HotelPaymentForm        v-else-if="step === 4" @back="goBack" />
            <HotelBookingConfirmation v-else-if="step === 5" />
          </Transition>
        </div>

        <!-- Sidebar -->
        <div v-if="showSidebar" class="hidden lg:block">
          <HotelBookingSummary />
        </div>
      </div>

    </div>
  </div>
</template>
