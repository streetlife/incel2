<script setup lang="ts">
import { ref } from 'vue'
import { useVisaStore } from '../../stores/visa';

const emit = defineEmits<{ back: [] }>()
const store = useVisaStore()

const selectedGateway = ref<'paystack' | 'flutterwave' | ''>('')
const loading = ref(false)
const error = ref('')

const gateways = [
  {
    key: 'paystack',
    name: 'Paystack',
    description: 'Cards, bank transfer, USSD',
    color: '#00C3F7',
    bgClass: 'bg-[#00C3F7]/10 border-[#00C3F7]',
    logo: `<svg viewBox="0 0 80 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text x="0" y="16" font-family="Arial Black" font-size="16" font-weight="900" fill="#00C3F7">Paystack</text>
    </svg>`,
  },
  {
    key: 'flutterwave',
    name: 'Flutterwave',
    description: 'Cards, mobile money, USSD',
    color: '#F5A623',
    bgClass: 'bg-[#F5A623]/10 border-[#F5A623]',
    logo: '',
  },
]

async function pay() {
  if (!selectedGateway.value) return
  loading.value = true
  error.value   = ''
  try {
    // TODO: POST /api/payments/initialize
    // Request:
    // {
    //   gateway:    selectedGateway.value,
    //   amount:     store.pricing.total,
    //   email:      store.applicant.email,
    //   phone:      store.applicant.phone,
    //   metadata: {
    //     type:           'visa',
    //     invoiceNumber:  store.invoiceNumber,
    //     visaCountry:    store.selectedVisa.country,
    //     visaType:       store.selectedVisa.visaType,
    //     visaServiceId:  store.selectedVisa.id,
    //     applicants:     store.totalApplicants,
    //     leadApplicant: { title, firstName, lastName, email, phone, passportNumber }
    //   },
    //   callbackUrl: `${window.location.origin}/travel/visa/booking/confirm`
    // }
    // Response: { authorization_url } (Paystack) or { link } (Flutterwave)
    await new Promise(r => setTimeout(r, 1200))

    // Simulate redirect
    const mockRedirect = `/travel/visas/booking/confirm?reference=VIS_${Date.now()}&gateway=${selectedGateway.value}`
    globalThis.location.href = mockRedirect
  } catch {
    error.value = 'Payment initialisation failed. Please try again.'
    loading.value = false
  }
}
</script>

<template>
  <div class="space-y-5">

    <!-- Amount banner -->
    <div class="bg-slate-900 rounded-2xl px-6 py-5 flex items-center justify-between">
      <div>
        <p class="text-slate-400 text-sm">Total Amount Due</p>
        <p class="text-3xl font-bold text-white mt-0.5">{{ store.fmtNgn(store.pricing?.total ?? 0) }}</p>
        <p class="text-slate-400 text-xs mt-1">
          {{ store.totalApplicants }} applicant{{ store.totalApplicants > 1 ? 's' : '' }} ·
          {{ store.selectedVisa?.visaType }} · {{ store.selectedVisa?.country }}
        </p>
      </div>
      <div class="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center shrink-0">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      </div>
    </div>

    <!-- Gateway selection -->
    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <p class="text-sm font-bold text-slate-700 mb-4">Select Payment Method</p>

      <div class="space-y-3">
        <label v-for="gw in gateways" :key="gw.key"
          class="flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all"
          :class="selectedGateway === gw.key ? gw.bgClass : 'border-slate-200 hover:border-slate-300'">
          <input type="radio" v-model="selectedGateway" :value="gw.key" class="sr-only" />

          <!-- Custom radio -->
          <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
            :style="selectedGateway === gw.key ? `border-color:${gw.color}` : 'border-color:#cbd5e1'">
            <div v-if="selectedGateway === gw.key" class="w-2.5 h-2.5 rounded-full"
              :style="`background:${gw.color}`"></div>
          </div>

          <!-- Gateway info -->
          <div class="flex-1">
            <p class="font-bold text-slate-900 text-sm">{{ gw.name }}</p>
            <p class="text-xs text-slate-500">{{ gw.description }}</p>
          </div>

          <!-- Checkmark if selected -->
          <div v-if="selectedGateway === gw.key"
            class="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
            :style="`background:${gw.color}`">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
              <polyline points="20,6 9,17 4,12"/>
            </svg>
          </div>
        </label>
      </div>

      <div v-if="error" class="mt-4 flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
        <svg class="shrink-0 mt-0.5" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <p class="text-sm text-red-700">{{ error }}</p>
      </div>

      <p v-if="selectedGateway" class="text-xs text-slate-400 mt-4 leading-relaxed">
        You'll be taken to <span class="font-semibold">{{ selectedGateway === 'paystack' ? 'Paystack' : 'Flutterwave' }}</span>
        to complete payment, then redirected back.
        Your application confirmation will be emailed to
        <span class="font-semibold">{{ store.applicant.email }}</span>.
      </p>
    </div>

    <!-- Actions -->
    <div class="flex justify-between">
      <button class="px-5 py-3 border-2 border-slate-200 text-slate-700 font-semibold text-sm rounded-xl hover:bg-slate-50 cursor-pointer bg-white"
        @click="emit('back')">← Back</button>

      <button
        class="flex items-center gap-2 px-6 py-3 font-bold text-sm rounded-xl border-none cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        :style="selectedGateway === 'paystack'
          ? 'background:#00C3F7; color:#0f172a'
          : selectedGateway === 'flutterwave'
            ? 'background:#F5A623; color:#0f172a'
            : 'background:#e2e8f0; color:#94a3b8'"
        :disabled="!selectedGateway || loading"
        @click="pay">
        <svg v-if="loading" class="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
        <span v-if="loading">Redirecting…</span>
        <span v-else-if="selectedGateway">
          Pay {{ store.fmtNgn(store.pricing?.total ?? 0) }} with {{ selectedGateway === 'paystack' ? 'Paystack' : 'Flutterwave' }}
        </span>
        <span v-else>Select a payment method</span>
      </button>
    </div>

  </div>
</template>
