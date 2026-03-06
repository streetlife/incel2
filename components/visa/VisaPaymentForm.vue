<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useVisaStore } from '../../stores/visa'
import { useCurrency } from '../../composables/useCurrency';
import AppToast from '../toast/AppToast.vue';
import { normaliseError } from '../../utils/api';
import { useToast } from '../../composables/useToast';
import { useRoute } from 'vue-router';

type GatewayKey = '' | 'paystack' | 'flutterwave'
type Gateway = {
  key: GatewayKey
  name: string
  description: string
  color: string
  bgClass: string
}

const selectedGateway = ref<GatewayKey>('')
const loading = ref(false)
const error = ref('')
const emit = defineEmits<{ back: [] }>()
const store = useVisaStore()
const { format, formatNumber, currentConfig } = useCurrency()
const toast = useToast()
const route = useRoute()

const price = computed(() => {
  const amount = Number(store.selectedVisa?.price)
  return amount === 0 ? 100 : amount
})

const pricing = computed(() => {
  const count = store.personCount
  const subtotal = price.value * count
  const serviceFee = Math.round(subtotal * 0.05)
  const tax = Math.round(subtotal * 0.075)
  const total = subtotal + serviceFee + tax
  return { count, subtotal, serviceFee, tax, total }
})

const leadApplicant = computed(() => store.applicants[0])

const gateways = computed<Gateway[]>(() => {
  if (currentConfig.value?.code === 'NGN') {
    return [
      {
        key: 'paystack',
        name: 'Paystack',
        description: 'Cards, bank transfer, USSD',
        color: '#00C3F7',
        bgClass: 'bg-[#00C3F7]/10 border-[#00C3F7]',
      }
    ]
  }

  return [
    {
      key: 'flutterwave',
      name: 'Flutterwave',
      description: 'Cards, mobile money, USSD',
      color: '#F5A623',
      bgClass: 'bg-[#F5A623]/10 border-[#F5A623]',
    }
  ]
})

function getQueryString(v: unknown): string | null {
  if (!v) return null
  return Array.isArray(v) ? v[0] : String(v)
}

async function pay() {
  if (!selectedGateway.value) return
  loading.value = true
  error.value   = ''

  const bookingCode = store.bookingCode ?? getQueryString(route.query.booking_code)

  if (!bookingCode) {
    error.value = 'Booking code is missing.'
    return
  }

  try {

    const amount = Number(formatNumber(pricing.value.total, 'AED'))
    
    const res = await store.initializePayment({
      amount: amount,
      currency: currentConfig.value?.code,
      booking_code: bookingCode,
      customer_name: `${leadApplicant.value.firstName} ${leadApplicant.value.lastName}`,
      customer_email: leadApplicant.value.email,
      callback_url: `${globalThis.location.origin}/travel/visas/booking/confirm`,
      payment_type: selectedGateway.value,
    })

    if (!res?.link) {
      error.value = store.paymentError
      loading.value = false
      toast.error(error.value)
      return
    }

    globalThis.location.href = res.link
  } catch(e) {
    error.value = normaliseError(e)
    loading.value = false
    toast.error(error.value)
  }
}

watch(gateways, (gws) => {
  if (gws.length) {
    selectedGateway.value = gws[0].key
  }
}, { immediate: true })

function resolveCountryName(codeOrValue: string | undefined): string {
  if (!codeOrValue) return '—'
  const opts = store.countryOptions

  return (
    opts.find(o => o.code === codeOrValue)?.value ??
    opts.find(o => o.value === codeOrValue)?.value ??
    codeOrValue
  )
}
</script>

<template>
  <AppToast />
  <div class="space-y-5">
    <div class="bg-slate-900 rounded-2xl px-6 py-5 flex items-center justify-between">
      <div>
        <p class="text-slate-400 text-sm">Total Amount Due</p>
        <p class="text-3xl font-bold text-white mt-0.5">{{ format(pricing.total, 'AED') }}</p>
        <p class="text-slate-400 text-xs mt-1">
          {{ store.personCount }} applicant{{ store.personCount > 1 ? 's' : '' }} ·
          {{ store.selectedVisa?.visa_type }} · {{ resolveCountryName(store.selectedVisa?.country) }}
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
            {{ format(price, 'AED') }} × {{ pricing.count }} applicant{{ pricing.count > 1 ? 's' : '' }}
          </span>
          <span class="font-semibold text-slate-800">{{ format(pricing.subtotal, 'AED') }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-slate-600">Service fee (5%)</span>
          <span class="font-semibold text-slate-800">{{ format(pricing.serviceFee, 'AED') }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-slate-600">VAT (7.5%)</span>
          <span class="font-semibold text-slate-800">{{ format(pricing.tax, 'AED') }}</span>
        </div>
        <div class="flex justify-between pt-2 border-t border-slate-100">
          <span class="font-bold text-slate-900">Total</span>
          <span class="font-bold text-slate-900 text-lg">{{ format(pricing.total, 'AED') }}</span>
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
          Pay {{ format(pricing.total, 'AED') }} with {{ selectedGateway === 'paystack' ? 'Paystack' : 'Flutterwave' }}
        </span>
        <span v-else>Select a payment method</span>
      </button>
    </div>
  </div>
</template>
