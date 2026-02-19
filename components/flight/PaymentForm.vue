<!-- Step 3: Payment — choose Paystack or Flutterwave, redirect to hosted page -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useBookingStore } from '../../composables/useBookingStore'

const emit = defineEmits<{ (e: 'back'): void }>()
const { state, priceBreakdown, fmtNgn } = useBookingStore()

const gateway  = ref<'paystack' | 'flutterwave' | null>(null)
const loading  = ref(false)
const error    = ref('')

const canPay = computed(() => gateway.value !== null && !loading.value)

// ── Initiate payment via your backend ─────────────────────────────────────────
// Backend should:
//   1. Create a pending booking record in DB
//   2. Call Paystack /transaction/initialize  OR  Flutterwave /v3/payments
//   3. Return { authorization_url } (Paystack) or { link } (Flutterwave)
//   4. On webhook confirmation → call Amadeus POST /v1/booking/flight-orders
//   5. Email invoice + ticket to passenger
async function handlePay() {
  if (!gateway.value) return
  loading.value = true
  error.value   = ''

  try {
    const response = await fetch('/api/payments/initialize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gateway: gateway.value,
        amount:  priceBreakdown.value.total, // NGN, in kobo/cents multiply on backend
        email:   state.contactEmail,
        phone:   state.contactPhone,
        metadata: {
          bookingReference: state.bookingReference || null,
          invoiceNumber:    state.invoiceNumber,
          discountCode:     state.discountCode || null,
          passengerCount:   state.passengerCount,
          flightOfferId:    state.offer?.id,
          passengers: state.passengers.map(p => ({
            firstName: p.firstName,
            lastName:  p.lastName,
            passport:  p.passportNumber,
          })),
        },
        // callback URL — backend sets this, but we include desired redirect
        callbackUrl: `${window.location.origin}/travel/flights/booking/confirm`,
      }),
    })

    if (!response.ok) throw new Error('Server error — please try again.')

    const data = await response.json()

    // Paystack returns data.authorization_url
    // Flutterwave returns data.link
    const redirectUrl = data.authorization_url ?? data.link
    if (!redirectUrl) throw new Error('No payment URL returned from server.')

    // Redirect to hosted payment page
    window.location.href = redirectUrl

  } catch (e: any) {
    error.value   = e.message ?? 'Could not connect to payment gateway.'
    loading.value = false
  }
}
</script>

<template>
  <div class="space-y-5">

    <!-- Amount due -->
    <div class="bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl px-5 py-5 flex items-center justify-between">
      <div>
        <p class="text-xs text-slate-400 mb-0.5">Amount Due</p>
        <p class="text-2xl font-bold text-white">{{ fmtNgn(priceBreakdown.total) }}</p>
        <p class="text-xs text-slate-400 mt-0.5">
          incl. 7.5% VAT ·
          {{ state.passengerCount }} passenger{{ state.passengerCount > 1 ? 's' : '' }}
          <span v-if="state.isB2B" class="text-green-400 ml-1">· B2B discount applied</span>
        </p>
      </div>
      <div class="flex items-center gap-1.5 bg-green-500/20 border border-green-400/30 rounded-lg px-3 py-1.5">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2.5">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
        <span class="text-xs font-semibold text-green-300">Secure</span>
      </div>
    </div>

    <!-- Gateway selection -->
    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div class="px-5 py-4 border-b border-slate-100">
        <p class="text-sm font-semibold text-slate-800">Choose Payment Gateway</p>
        <p class="text-xs text-slate-400 mt-0.5">You'll be redirected to complete payment securely</p>
      </div>

      <div class="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">

        <!-- Paystack -->
        <button
          class="relative flex flex-col items-center justify-center gap-3 p-5 rounded-xl border-2 transition-all cursor-pointer text-left group"
          :class="gateway === 'paystack'
            ? 'border-[#00C3F7] bg-[#00C3F7]/5 shadow-md shadow-[#00C3F7]/10'
            : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'"
          @click="gateway = 'paystack'"
        >
          <!-- Selected tick -->
          <div
            class="absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
            :class="gateway === 'paystack' ? 'bg-[#00C3F7] border-[#00C3F7]' : 'border-slate-300'"
          >
            <svg v-if="gateway === 'paystack'" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3.5">
              <polyline points="20,6 9,17 4,12"/>
            </svg>
          </div>

          <!-- Paystack wordmark (text-based since we can't fetch logo) -->
          <div class="w-12 h-12 rounded-xl flex items-center justify-center" style="background: #00C3F7;">
            <span class="text-white font-black text-lg">P</span>
          </div>
          <div class="text-center">
            <p class="font-bold text-slate-800 text-sm">Paystack</p>
            <p class="text-xs text-slate-400 mt-0.5">Card · Bank · USSD · QR</p>
          </div>
          <div class="flex flex-wrap justify-center gap-1">
            <span v-for="tag in ['Visa', 'Mastercard', 'Verve']" :key="tag"
              class="text-[10px] font-semibold px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded">{{ tag }}</span>
          </div>
        </button>

        <!-- Flutterwave -->
        <button
          class="relative flex flex-col items-center justify-center gap-3 p-5 rounded-xl border-2 transition-all cursor-pointer text-left group"
          :class="gateway === 'flutterwave'
            ? 'border-[#F5A623] bg-[#F5A623]/5 shadow-md shadow-[#F5A623]/10'
            : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'"
          @click="gateway = 'flutterwave'"
        >
          <!-- Selected tick -->
          <div
            class="absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
            :class="gateway === 'flutterwave' ? 'bg-[#F5A623] border-[#F5A623]' : 'border-slate-300'"
          >
            <svg v-if="gateway === 'flutterwave'" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3.5">
              <polyline points="20,6 9,17 4,12"/>
            </svg>
          </div>

          <div class="w-12 h-12 rounded-xl flex items-center justify-center" style="background: #F5A623;">
            <span class="text-white font-black text-lg">F</span>
          </div>
          <div class="text-center">
            <p class="font-bold text-slate-800 text-sm">Flutterwave</p>
            <p class="text-xs text-slate-400 mt-0.5">Card · Bank · M-Pesa · USSD</p>
          </div>
          <div class="flex flex-wrap justify-center gap-1">
            <span v-for="tag in ['Visa', 'Mastercard', 'Mobile Money']" :key="tag"
              class="text-[10px] font-semibold px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded">{{ tag }}</span>
          </div>
        </button>
      </div>

      <!-- What happens next -->
      <div class="px-5 pb-5">
        <div class="flex items-start gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5">
          <svg class="shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          <div class="text-xs text-slate-500 space-y-1">
            <p>You'll be taken to <strong class="text-slate-700">{{ gateway === 'paystack' ? 'Paystack' : gateway === 'flutterwave' ? 'Flutterwave' : 'your chosen gateway' }}</strong> to complete payment.</p>
            <p>After payment, you'll be redirected back here automatically.</p>
            <p>Your ticket and invoice will be emailed to <span class="font-mono font-medium text-slate-600">{{ state.contactEmail || 'your email' }}</span>.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Error -->
    <div v-if="error" class="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3.5">
      <svg class="shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <div>
        <p class="text-sm font-semibold text-red-700">Payment could not be initiated</p>
        <p class="text-xs text-red-600 mt-0.5">{{ error }}</p>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex gap-3">
      <button
        class="flex-1 h-14 border-2 border-slate-200 text-slate-700 font-semibold rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer bg-white disabled:opacity-50"
        :disabled="loading"
        @click="emit('back')"
      >
        ← Back
      </button>
      <button
        class="flex-[2] h-14 font-bold rounded-2xl transition-all border-none cursor-pointer shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-white"
        :style="gateway === 'flutterwave'
          ? 'background: #F5A623;'
          : 'background: #00C3F7;'"
        :class="!canPay ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'"
        :disabled="!canPay"
        @click="handlePay"
      >
        <template v-if="loading">
          <svg class="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
          </svg>
          Redirecting…
        </template>
        <template v-else-if="!gateway">
          Select a gateway above
        </template>
        <template v-else>
          Pay {{ fmtNgn(priceBreakdown.total) }} with {{ gateway === 'paystack' ? 'Paystack' : 'Flutterwave' }}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
        </template>
      </button>
    </div>

    <p class="text-center text-xs text-slate-400">
      🔒 Payments are processed by {{ gateway === 'paystack' ? 'Paystack' : gateway === 'flutterwave' ? 'Flutterwave' : 'your chosen gateway' }} · We never store your card details
    </p>
  </div>
</template>
