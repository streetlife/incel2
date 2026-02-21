<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useVisaStore } from '../../../../stores/visa'
import VisaBookingConfirmation from '../../../../components/visa/VisaBookingConfirmation.vue'

const route = useRoute()
const router = useRouter()
const store = useVisaStore()

type Status = 'verifying' | 'success' | 'failed'
const status = ref<Status>('verifying')
const errorMessage = ref('')

onMounted(async () => {
  const gateway = (route.query.gateway as string)
  const reference = route.query.reference as string // Paystack
  const transId = route.query.transaction_id as string // Flutterwave
  const txRef = route.query.tx_ref as string
  const gwStatus = route.query.status as string

  // Flutterwave sends status=cancelled when user abandons
  if (gateway === 'flutterwave' && gwStatus === 'cancelled') {
    status.value = 'failed'
    errorMessage.value = 'Payment was cancelled. No charge was made.'
    return
  }

  try {
    // TODO: POST /api/payments/verify
    // Request: { gateway, reference, transactionId: transId, txRef, type: 'visa' }
    // Response: { applicationRef, invoiceNumber, invoiceDate }
    await new Promise(r => setTimeout(r, 2000)) // remove when wired up

    // Mock success
    const applicationRef = 'VIS' + Date.now().toString(36).toUpperCase()
    store.confirmApplication(applicationRef)
    if (!store.invoiceNumber) store.generateInvoice()

    status.value = 'success'
  } catch (e: any) {
    status.value = 'failed'
    errorMessage.value = e?.message || 'Payment verification failed. Please contact support.'
  }
})
</script>

<template>
  <div class="min-h-screen bg-slate-100 flex items-center justify-center pt-44 pb-16 px-4 md:px-6">

    <!-- ── Verifying ──────────────────────────────────────────────────────────── -->
    <div v-if="status === 'verifying'" class="text-center">
      <div class="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-6">
        <svg class="animate-spin text-primary" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
      </div>
      <h2 class="text-xl font-bold text-slate-900 mb-2">Verifying your payment…</h2>
      <p class="text-slate-500 text-sm">Please wait, do not close this page.</p>
    </div>

    <!-- ── Success ────────────────────────────────────────────────────────────── -->
    <div v-else-if="status === 'success'" class="w-full max-w-2xl">
      <VisaBookingConfirmation />
    </div>

    <!-- ── Failed ─────────────────────────────────────────────────────────────── -->
    <div v-else class="text-center max-w-md">
      <div class="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="15" y1="9" x2="9" y2="15"/>
          <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
      </div>
      <h2 class="text-xl font-bold text-slate-900 mb-2">Payment Failed</h2>
      <p class="text-slate-500 text-sm mb-6">{{ errorMessage }}</p>
      <div class="flex flex-col sm:flex-row gap-3 justify-center">
        <router-link to="/travel/visa"
          class="px-5 py-3 border-2 border-slate-200 text-slate-700 font-semibold text-sm rounded-xl hover:bg-slate-50 no-underline text-center">
          Back to Visa Search
        </router-link>
        <button
          class="px-5 py-3 bg-primary hover:opacity-90 text-slate-900 font-bold text-sm rounded-xl border-none cursor-pointer"
          @click="router.push('/travel/visa/booking?step=3')">
          Try Payment Again
        </button>
      </div>
    </div>

  </div>
</template>
