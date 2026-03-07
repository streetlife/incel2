<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import BookingConfirmation from '../../../../components/flight/BookingConfirmation.vue'
import { useFlightBooking } from '../../../../composables/useFlightBooking'
import { computed, onMounted, ref } from 'vue'
import { useFlightStore } from '../../../../stores/flight'

const router = useRouter()
const booking = useFlightBooking()
const flightStore = useFlightStore()
const copied = ref(false)

type Status = 'verifying' | 'success' | 'failed' | 'booking_failed'
const status = ref<Status>('verifying')

const route = useRoute()

const transactionRef = computed(() =>
  String(route.query.reference ?? route.query.tx_ref ?? route.query.transaction_id ?? '')
)

async function copyRef() {
  if (!transactionRef.value) return
  await navigator.clipboard.writeText(transactionRef.value)
  copied.value = true
  setTimeout(() => (copied.value = false), 2000)
}

function getQueryString(v: unknown): string | null {
  if (!v) return null
  return Array.isArray(v) ? v[0] : String(v)
}

onMounted(async () => {

  const bookingCode = flightStore.bookCode ?? getQueryString(route.query.booking_code)

  if (!bookingCode) {
    status.value = 'booking_failed'
    return
  }

  const result = await booking.verifyPayment(bookingCode)
  status.value = result
})

function goBack() {
  flightStore.resetAll()
  router.push('/travel/flights')
}
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

      <div v-else-if="status === 'failed'" class="bg-white rounded-2xl border border-red-200 shadow-sm p-8 text-center space-y-4">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <h2 class="text-xl font-bold text-slate-900">Payment Unsuccessful</h2>
        <p class="text-sm text-slate-500 max-w-sm mx-auto">
          Your payment was declined or cancelled. <strong>No charge was made</strong> to your account.
        </p>
        <div class="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            class="px-6 py-2.5 border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors cursor-pointer bg-white"
            @click="goBack()"
          >
            Try Again
          </button>
        </div>
      </div>

      <div v-else-if="status === 'booking_failed'" class="bg-white rounded-2xl border border-amber-200 shadow-sm p-8 text-center space-y-4">
        <div class="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
        <h2 class="text-xl font-bold text-slate-900">Payment Received — Booking Pending</h2>
        <p class="text-sm text-slate-500 max-w-sm mx-auto">
          Your payment went through successfully, but we couldn't confirm your flight booking with the airline.
          <strong>You have not lost your money.</strong>
        </p>
        <p class="text-sm text-slate-500 max-w-sm mx-auto">
          Our support team will reach out shortly to complete your booking or issue a full refund.
        </p>
        <div v-if="transactionRef" class="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center justify-between gap-3 text-left">
          <div class="min-w-0">
            <p class="text-xs text-amber-700 font-medium mb-0.5">Transaction Reference</p>
            <p class="text-sm font-mono text-slate-800 truncate">{{ transactionRef }}</p>
          </div>
          <button
            @click="copyRef"
            class="shrink-0 flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-900 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            {{ copied ? 'Copied!' : 'Copy' }}
          </button>
        </div>
        <div class="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            class="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors cursor-pointer"
            @click="goBack()"
          >
            Back to Flights
          </button>
        </div>
        <p class="text-xs text-slate-400 pt-2">
          Please save your transaction reference in case you need to contact support.
        </p>
      </div>
    </div>
  </div>
</template>
