<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBookingStore } from '../../../../composables/useBookingStore'
import PassengerForm from '../../../../components/flight/PassengerForm.vue'
import BookingReview from '../../../../components/flight/BookingReview.vue'
import PaymentForm from '../../../../components/flight/PaymentForm.vue'
import BookingConfirmation from '../../../../components/flight/BookingConfirmation.vue'
import BookingSummary from '../../../../components/flight/BookingSummary.vue'

const route  = useRoute()
const router = useRouter()
const { state, selectOffer, generateInvoice } = useBookingStore()

const STEPS = [
  { id: 1, label: 'Passengers',  icon: '👤' },
  { id: 2, label: 'Review',      icon: '📋' },
  { id: 3, label: 'Payment',     icon: '💳' },
  { id: 4, label: 'Confirmed',   icon: '✅' },
]

const step = ref(Number.parseInt(route.query.step as string) || 1)

// Keep step in URL
watch(step, (s) => {
  router.replace({ query: { ...route.query, step: String(s) } })
})

// Load flight offer from sessionStorage (set by Flights page on "Book Now")
onMounted(() => {
  const raw = sessionStorage.getItem('selectedFlight')
  if (raw) {
    try {
      const { offer, passengerCount } = JSON.parse(raw)
      selectOffer(offer, passengerCount || 1)
    } catch {}
  }
  // If no offer and not on step 4, redirect back
  if (!state.offer && step.value < 4) {
    router.replace('/travel/flights')
  }
})

function goNext() {
  if (step.value === 2) generateInvoice()
  step.value = Math.min(step.value + 1, 4)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function goBack() {
  if (step.value === 1) {
    router.push('/travel/flights')
  } else {
    step.value = Math.max(step.value - 1, 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const showSidebar = computed(() => step.value < 4)
</script>

<template>
  <div class="min-h-screen bg-slate-100 pt-36 pb-16 sm:px-24 px-4">
    <div class="mx-auto">
      <div class="mb-8">
        <button
          class="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors cursor-pointer bg-transparent border-none p-0 mb-4"
          @click="goBack"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          {{ step === 1 ? 'Back to results' : 'Back' }}
        </button>
        <h1 class="text-2xl md:text-3xl font-bold text-slate-900">Complete Your Booking</h1>
        <p class="text-slate-500 text-sm mt-1">Secure checkout · Your data is encrypted</p>
      </div>

      <div v-if="step < 4" class="mb-8">
        <div class="flex items-center gap-0">
          <template v-for="(s, i) in STEPS.slice(0, 3)" :key="s.id">
            <!-- Step bubble -->
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
            <!-- Connector line -->
            <div v-if="i < 2" class="flex-1 h-0.5 mx-2 mb-5 transition-colors" :class="step > s.id ? 'bg-green-400' : 'bg-slate-200'"></div>
          </template>
        </div>
      </div>

      <!-- ── Layout: form + sidebar ─────────────────────────────────────── -->
      <div :class="showSidebar ? 'grid gap-6 lg:grid-cols-[1fr_340px]' : 'max-w-2xl mx-auto'">
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
            <PassengerForm v-if="step === 1" @next="goNext" />
            <BookingReview v-else-if="step === 2" @next="goNext" @back="goBack" />
            <PaymentForm v-else-if="step === 3" @next="goNext" @back="goBack" />
            <BookingConfirmation v-else-if="step === 4" />
          </Transition>
        </div>

        <!-- Sidebar (hidden on step 4) -->
        <div v-if="showSidebar" class="hidden lg:block">
          <BookingSummary />
        </div>
      </div>
    </div>
  </div>
</template>
