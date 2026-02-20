<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTourBookingStore } from '../../../../composables/useTourBookingStore'
import TourBookingConfirmation from '../../../../components/tour/TourBookingConfirmation.vue'

const route  = useRoute()
const router = useRouter()
const { state, confirmBooking } = useTourBookingStore()

const verifyStatus = ref<'verifying' | 'success' | 'failed'>('verifying')
const errorMessage = ref('')

onMounted(async () => {
  const q = route.query
  const isPaystack = !!(q.reference || q.trxref)
  const isFlutterwave = !!(q.transaction_id)
  const fwFailed = q.status && q.status !== 'successful'

  if (!isPaystack && !isFlutterwave) { router.replace('/travel/tours'); return }
  if (fwFailed) {
    verifyStatus.value = 'failed'
    errorMessage.value = 'Payment was cancelled or did not complete. Please try again.'
    return
  }

  try {
    // POST /api/payments/verify
    // Backend should:
    //   1. Verify payment with Paystack or Flutterwave
    //   2. POST to Rayna Tours API:
    //        POST https://api.raynatours.com/bookings
    //        { raynaPackageId, date, adults, children, infants, leadGuest, paymentRef }
    //   3. Receive { bookingReference, voucherUrl } from Rayna
    //   4. Email invoice PDF + voucher to contactEmail
    //   5. Return { bookingReference, invoiceNumber, invoiceDate, voucherUrl }

    const body: Record<string, string> = {}
    if (isPaystack) { body.gateway = 'paystack'; body.reference = String(q.reference || q.trxref) }
    if (isFlutterwave) { body.gateway = 'flutterwave'; body.transactionId = String(q.transaction_id); body.txRef = String(q.tx_ref ?? '') }

    const res = await fetch('/api/payments/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...body, type: 'tour' }),
    })

    if (!res.ok) throw new Error((await res.json())?.message ?? 'Verification failed.')

    const data = await res.json()
    state.bookingReference = data.bookingReference
    state.invoiceNumber = data.invoiceNumber
    state.invoiceDate = data.invoiceDate
    state.voucherUrl = data.voucherUrl ?? '#'
    state.status = 'confirmed'
    verifyStatus.value = 'success'
  } catch (e: any) {
    verifyStatus.value = 'failed'
    errorMessage.value = e.message ?? 'Could not verify your payment. Please contact support.'
  }
})
</script>

<template>
  <div class="min-h-screen bg-slate-100 pt-24 pb-16 px-4 md:px-6">
    <div class="max-w-2xl mx-auto">

      <!-- Verifying spinner -->
      <div v-if="verifyStatus === 'verifying'" class="flex flex-col items-center justify-center py-32 gap-5">
        <div class="w-16 h-16 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
        <div class="text-center">
          <p class="text-lg font-semibold text-slate-800">Verifying your payment…</p>
          <p class="text-sm text-slate-500 mt-1">Confirming your booking with Rayna Tours. Please don't close this page.</p>
        </div>
      </div>

      <!-- Success -->
      <TourBookingConfirmation v-else-if="verifyStatus === 'success'" />

      <!-- Failed -->
      <div v-else class="bg-white rounded-2xl border border-red-200 shadow-sm p-8 text-center space-y-4">
        <div class="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <h2 class="text-xl font-bold text-slate-900">Payment Failed</h2>
        <p class="text-slate-500 text-sm max-w-sm mx-auto">{{ errorMessage }}</p>
        <div class="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            class="px-6 py-2.5 border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 cursor-pointer bg-white"
            @click="$router.push('/travel/tours')"
          >
            Back to Tours
          </button>
          <button
            class="px-6 py-2.5 bg-primary hover:opacity-90 text-white font-semibold rounded-xl cursor-pointer border-none"
            @click="$router.go(-1)"
          >
            Try Again
          </button>
        </div>
        <p class="text-xs text-slate-400 pt-2">
          If money was deducted from your account, please contact support with your transaction reference.
        </p>
      </div>

    </div>
  </div>
</template>
