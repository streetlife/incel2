<script setup lang="ts">
import PassengerForm from '../../../../components/flight/PassengerForm.vue'
import BookingReview from '../../../../components/flight/BookingReview.vue'
import PaymentForm from '../../../../components/flight/PaymentForm.vue'
import BookingConfirmation from '../../../../components/flight/BookingConfirmation.vue'
import BookingSummary from '../../../../components/flight/BookingSummary.vue'
import { useFlightBooking } from '../../../../composables/useFlightBooking'
import { useRoute, useRouter } from 'vue-router'
import { computed, onMounted } from 'vue'
import { useFlightStore } from '../../../../stores/flight'

const router = useRouter()
const booking = useFlightBooking()
const flightStore = useFlightStore()

const STEPS = [
  { id: 1, label: 'Passengers' },
  { id: 2, label: 'Review' },
  { id: 3, label: 'Payment' },
]

const route = useRoute()

const step  = computed({
  get: () => Number(route.query.step) || 1,
  set: (n: number) => router.replace({ query: { ...route.query, step: String(n) } }),
})

function goNext() {
  if (step.value === 2) flightStore.generateInvoice()
  step.value = Math.min(step.value + 1, 3)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function goBack() {
  if (step.value === 1) {
    router.push({
      path: '/travel/flights',
      query: {
        from: flightStore.searchParams.from,
        to: flightStore.searchParams.to,
        dateFrom: flightStore.searchParams.dateFrom,
        dateTo: flightStore.searchParams.dateTo,
        tripType: flightStore.searchParams.tripType,
        travelClass: flightStore.searchParams.travelClass,
        adult_number: flightStore.searchParams.adult_number,
        child_number: flightStore.searchParams.child_number,
        infants_number: flightStore.searchParams.infants_number,
        session_code: flightStore.searchParams.session_code,
      },
    })
  } else {
    step.value--; window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const showSidebar = computed(() => step.value < 4)

onMounted(() => {
  booking.hydrateFromSession()
})
</script>

<template>
  <div class="min-h-screen bg-slate-100 pt-36 pb-16 sm:px-24 px-4">
    <div class="mx-auto">
      <div class="mb-8">
        <button
          class="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors cursor-pointer bg-transparent border-none p-0 mb-4"
          @click="goBack"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          {{ step === 1 ? 'Back to results' : 'Back' }}
        </button>
        <h1 class="text-2xl md:text-3xl font-bold text-slate-900">Complete Your Booking</h1>
        <p class="text-slate-500 text-sm mt-1">Secure checkout · Your data is encrypted</p>
      </div>

      <div class="mb-8">
        <div class="flex items-center gap-0">
          <template v-for="(s, i) in STEPS" :key="s.id">
            <div class="flex flex-col items-center gap-1.5">
              <div class="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all border-2"
                :class="step === s.id
                  ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30'
                  : step > s.id
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'bg-white border-slate-200 text-slate-400'">
                <svg v-if="step > s.id" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <polyline points="20,6 9,17 4,12"/>
                </svg>
                <span v-else>{{ s.id }}</span>
              </div>
              <span class="text-xs font-medium hidden sm:block"
                :class="step >= s.id ? 'text-slate-700' : 'text-slate-400'">
                {{ s.label }}
              </span>
            </div>
            <div v-if="i < STEPS.length - 1"
              class="flex-1 h-0.5 mx-2 mb-5 transition-colors"
              :class="step > s.id ? 'bg-green-400' : 'bg-slate-200'">
            </div>
          </template>
        </div>
      </div>

      <div v-if="booking.error.value && !booking.loading.value"
        class="mb-6 flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
        <svg class="shrink-0 mt-0.5" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <p class="text-sm text-red-700">{{ booking.error.value }}</p>
      </div>

      <div :class="showSidebar ? 'grid gap-6 lg:grid-cols-[1fr_340px]' : 'max-w-2xl mx-auto'">
        <div class="min-w-0">
          <Transition
            mode="out-in"
            enter-active-class="transition-all duration-200 ease-out"
            enter-from-class="opacity-0 translate-x-4"
            leave-active-class="transition-all duration-150 ease-in"
            leave-to-class="opacity-0 -translate-x-4"
          >
            <PassengerForm v-if="step === 1" @next="goNext" />
            <BookingReview v-else-if="step === 2" @next="goNext" @back="goBack" />
            <PaymentForm v-else-if="step === 3" @back="goBack" />
            <BookingConfirmation v-else-if="step === 4" />
          </Transition>
        </div>

        <div v-if="showSidebar" class="hidden lg:block">
          <BookingSummary />
        </div>
      </div>
    </div>
  </div>
</template>
