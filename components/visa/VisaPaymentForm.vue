<script setup lang="ts">
import { ref, computed } from 'vue'
import { useVisaStore } from '../../stores/visa'
import { useCurrency } from '../../composables/useCurrency';

const emit = defineEmits<{ back: [] }>()
const store = useVisaStore()

const BASE_PRICE = 45_000

const pricing = computed(() => {
  const count = store.personCount
  const subtotal = BASE_PRICE * count
  const serviceFee = Math.round(subtotal * 0.05)
  const tax = Math.round(subtotal * 0.075)
  const total = subtotal + serviceFee + tax
  return { count, subtotal, serviceFee, tax, total }
})

const { format } = useCurrency()

const leadApplicant = computed(() => store.applicants[0])

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
  },
  {
    key: 'flutterwave',
    name: 'Flutterwave',
    description: 'Cards, mobile money, USSD',
    color: '#F5A623',
    bgClass: 'bg-[#F5A623]/10 border-[#F5A623]',
  },
]

async function pay() {
  if (!selectedGateway.value) return
  loading.value = true
  error.value   = ''
  try {
    // POST /api/payments/initialize
    // {
    //   gateway:   selectedGateway.value,
    //   amount:    pricing.value.total,
    //   email:     leadApplicant.value.email,
    //   phone:     leadApplicant.value.phone,
    //   metadata: {
    //     type:        'visa',
    //     visaCountry: store.selectedVisa.country,
    //     visaType:    store.selectedVisa.visaType,
    //     applicants:  store.personCount,
    //     travellers:  store.applicants.map(a => ({
    //       firstName: a.firstName, lastName: a.lastName,
    //       passport:  a.passportNumber, nationality: a.nationality,
    //     })),
    //   },
    //   callbackUrl: `${window.location.origin}/travel/visas/booking/confirm`
    // }
    await new Promise(r => setTimeout(r, 1200))

    const mockRedirect = `/travel/visas/booking/confirm?reference=VIS_${Date.now()}&gateway=${selectedGateway.value}`
    globalThis.location.href = mockRedirect
  } catch {
    error.value   = 'Payment initialisation failed. Please try again.'
    loading.value = false
  }
}
</script>

<template>
  <div class="space-y-5">
    <div class="bg-slate-900 rounded-2xl px-6 py-5 flex items-center justify-between">
      <div>
        <p class="text-slate-400 text-sm">Total Amount Due</p>
        <p class="text-3xl font-bold text-white mt-0.5">{{ format(pricing.total) }}</p>
        <p class="text-slate-400 text-xs mt-1">
          {{ store.personCount }} applicant{{ store.personCount > 1 ? 's' : '' }} ·
          Tourist Visa · {{ store.selectedVisa?.country || '—' }}
        </p>
      </div>
      <div class="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center shrink-0">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      </div>
    </div>

    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm px-6 py-5">
      <p class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Price Breakdown</p>
      <div class="space-y-2">
        <div class="flex justify-between text-sm">
          <span class="text-slate-600">
            {{ format(BASE_PRICE) }} × {{ pricing.count }} applicant{{ pricing.count > 1 ? 's' : '' }}
          </span>
          <span class="font-semibold text-slate-800">{{ format(pricing.subtotal) }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-slate-600">Service fee (5%)</span>
          <span class="font-semibold text-slate-800">{{ format(pricing.serviceFee) }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-slate-600">VAT (7.5%)</span>
          <span class="font-semibold text-slate-800">{{ format(pricing.tax) }}</span>
        </div>
        <div class="flex justify-between pt-2 border-t border-slate-100">
          <span class="font-bold text-slate-900">Total</span>
          <span class="font-bold text-slate-900 text-lg">{{ format(pricing.total) }}</span>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <p class="text-sm font-bold text-slate-700 mb-4">Select Payment Method</p>

      <div class="space-y-3">
        <label v-for="gw in gateways" :key="gw.key"
          class="flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all"
          :class="selectedGateway === gw.key ? gw.bgClass : 'border-slate-200 hover:border-slate-300'">
          <input type="radio" v-model="selectedGateway" :value="gw.key" class="sr-only" />

          <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
            :style="selectedGateway === gw.key ? `border-color:${gw.color}` : 'border-color:#cbd5e1'">
            <div v-if="selectedGateway === gw.key" class="w-2.5 h-2.5 rounded-full"
              :style="`background:${gw.color}`"></div>
          </div>

          <div class="flex-1">
            <p class="font-bold text-slate-900 text-sm">{{ gw.name }}</p>
            <p class="text-xs text-slate-500">{{ gw.description }}</p>
          </div>

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
        <svg class="shrink-0 mt-0.5" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <p class="text-sm text-red-700">{{ error }}</p>
      </div>

      <p v-if="selectedGateway" class="text-xs text-slate-400 mt-4 leading-relaxed">
        You'll be taken to
        <span class="font-semibold">{{ selectedGateway === 'paystack' ? 'Paystack' : 'Flutterwave' }}</span>
        to complete payment, then redirected back. Your application confirmation will be emailed to
        <span class="font-semibold">{{ leadApplicant.email || 'your email' }}</span>.
      </p>
    </div>

    <div class="flex justify-between">
      <button
        class="px-5 py-3 border-2 border-slate-200 text-slate-700 font-semibold text-sm rounded-xl hover:bg-slate-50 cursor-pointer bg-white"
        @click="emit('back')">
        ← Back
      </button>

      <button
        class="flex items-center gap-2 px-6 py-3 font-bold text-sm rounded-xl border-none cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        :style="selectedGateway === 'paystack'
          ? 'background:#00C3F7; color:#0f172a'
          : selectedGateway === 'flutterwave'
            ? 'background:#F5A623; color:#0f172a'
            : 'background:#e2e8f0; color:#94a3b8'"
        :disabled="!selectedGateway || loading"
        @click="pay">
        <svg v-if="loading" class="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
        <span v-if="loading">Redirecting…</span>
        <span v-else-if="selectedGateway">
          Pay {{ format(pricing.total) }} with {{ selectedGateway === 'paystack' ? 'Paystack' : 'Flutterwave' }}
        </span>
        <span v-else>Select a payment method</span>
      </button>
    </div>
  </div>
</template>
