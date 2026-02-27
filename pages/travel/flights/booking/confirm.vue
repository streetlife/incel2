<script setup lang="ts">
import { useRouter } from 'vue-router'
import BookingConfirmation from '../../../../components/flight/BookingConfirmation.vue'
import { useFlightBooking } from '../../../../composables/useFlightBooking'
import { onMounted, ref } from 'vue'

const router = useRouter()
const booking = useFlightBooking()

type Status = 'verifying' | 'success' | 'failed'
const status = ref<Status>('verifying')

onMounted(async () => {
  const result = await booking.verifyPayment()
  status.value = result
})
</script>

<template>
  <div class="min-h-screen bg-slate-100 pt-44 pb-16 px-4 md:px-6">
    <div class="max-w-2xl mx-auto">
      <div v-if="status === 'verifying'" class="flex flex-col items-center justify-center py-32 gap-5">
        <div class="w-16 h-16 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
        <div class="text-center">
          <p class="text-lg font-semibold text-slate-800">Verifying your payment…</p>
          <p class="text-sm text-slate-500 mt-1">Please don't close this page.</p>
        </div>
      </div>

      <BookingConfirmation v-else-if="status === 'success'" />

      <div v-else class="bg-white rounded-2xl border border-red-200 shadow-sm p-8 text-center space-y-4">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <h2 class="text-xl font-bold text-slate-900">Payment Failed</h2>
        <p class="text-slate-500 text-sm max-w-sm mx-auto">{{ booking.error.value }}</p>
        <div class="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            class="px-6 py-2.5 border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors cursor-pointer bg-white"
            @click="router.push('/travel/flights')"
          >
            Back to Flights
          </button>
          <button
            class="px-6 py-2.5 bg-primary hover:opacity-90 text-slate-900 font-semibold rounded-xl transition-colors cursor-pointer border-none"
            @click="router.go(-1)"
          >
            Try Again
          </button>
        </div>
        <p class="text-xs text-slate-400 pt-2">
          If money was deducted, contact support with your transaction reference.
        </p>
      </div>
    </div>
  </div>
</template>
