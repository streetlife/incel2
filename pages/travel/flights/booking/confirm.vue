<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBookingStore } from '../../../../composables/useBookingStore'
import BookingConfirmation from '../../../../components/flight/BookingConfirmation.vue'

const route  = useRoute()
const router = useRouter()
const { state } = useBookingStore()

const status  = ref<'verifying' | 'success' | 'failed'>('verifying')
const message = ref('')

onMounted(async () => {
  const q = route.query

  const isPaystack     = !!(q.reference || q.trxref)
  const isFlutterwave  = !!(q.transaction_id)
  const fwFailed       = q.status && q.status !== 'successful'

  if (!isPaystack && !isFlutterwave) {
    // No recognised query params — redirect home
    router.replace('/travel/flights')
    return
  }

  if (fwFailed) {
    status.value  = 'failed'
    message.value = 'Payment was cancelled or failed. Please try again.'
    return
  }

  try {
    // ── Ask backend to verify payment + issue ticket ──────────────────────────
    // Backend should:
    //   1. Call Paystack GET /transaction/verify/:reference
    //      OR Flutterwave GET /v3/transactions/:id/verify
    //   2. If paid → call Amadeus POST /v1/booking/flight-orders
    //   3. Store booking in DB, send invoice + ticket email
    //   4. Return { bookingReference, ticketNumbers, invoiceNumber, invoiceDate }
    const body: Record<string, string> = {}
    if (isPaystack)    { body.gateway = 'paystack'; body.reference = String(q.reference || q.trxref) }
    if (isFlutterwave) { body.gateway = 'flutterwave'; body.transactionId = String(q.transaction_id); body.txRef = String(q.tx_ref) }

    const res = await fetch('/api/payments/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!res.ok) throw new Error((await res.json())?.message ?? 'Verification failed')

    const data = await res.json()

    // Populate store with server-confirmed values
    state.bookingReference = data.bookingReference
    state.ticketNumbers = data.ticketNumbers
    state.invoiceNumber = data.invoiceNumber
    state.invoiceDate = data.invoiceDate
    state.status = 'confirmed'

    status.value = 'success'

  } catch (e: any) {
    status.value  = 'failed'
    message.value = e.message ?? 'Could not verify your payment. Contact support with your transaction ID.'
  }
})
</script>

<template>
  <div class="min-h-screen bg-slate-100 pt-24 pb-16 px-4 md:px-6">
    <div class="max-w-2xl mx-auto">

      <!-- Verifying -->
      <div v-if="status === 'verifying'" class="flex flex-col items-center justify-center py-32 gap-5">
        <div class="w-16 h-16 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
        <div class="text-center">
          <p class="text-lg font-semibold text-slate-800">Verifying your payment…</p>
          <p class="text-sm text-slate-500 mt-1">Please don't close this page.</p>
        </div>
      </div>

      <!-- Success → show ticket -->
      <BookingConfirmation v-else-if="status === 'success'" />

      <!-- Failed -->
      <div v-else class="bg-white rounded-2xl border border-red-200 shadow-sm p-8 text-center space-y-4">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <h2 class="text-xl font-bold text-slate-900">Payment Failed</h2>
        <p class="text-slate-500 text-sm max-w-sm mx-auto">{{ message }}</p>
        <div class="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            class="px-6 py-2.5 border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors cursor-pointer bg-white"
            @click="$router.push('/travel/flights')"
          >
            Back to Flights
          </button>
          <button
            class="px-6 py-2.5 bg-primary hover:opacity-90 text-white font-semibold rounded-xl transition-colors cursor-pointer border-none"
            @click="$router.go(-1)"
          >
            Try Again
          </button>
        </div>
        <p class="text-xs text-slate-400 pt-2">
          If money was deducted, contact support with your transaction reference from the query URL.
        </p>
      </div>

    </div>
  </div>
</template>