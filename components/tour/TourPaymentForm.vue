<!-- Step 4: Payment — matches visa payment pattern -->
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useTourBookingStore } from '../../composables/useTourBookingStore'
import { useCurrency } from '../../composables/useCurrency'
import { useTourService } from '../../services/tour.service'
import AppToast from '../toast/AppToast.vue'
import { useToast } from '../../composables/useToast'

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

const { state, priceBreakdown, totalParticipants, setBookingCode, saveStateToSession } = useTourBookingStore()
const { format, formatNumber, currentConfig } = useCurrency()
const service = useTourService()
const toast = useToast()

const gateways = computed<Gateway[]>(() => {
  if (currentConfig.value?.code === 'NGN') {
    return [{
      key: 'paystack',
      name: 'Paystack',
      description: 'Cards, bank transfer, USSD',
      color: '#00C3F7',
      bgClass: 'bg-[#00C3F7]/10 border-[#00C3F7]',
    }]
  }
  return [{
    key: 'flutterwave',
    name: 'Flutterwave',
    description: 'Cards, mobile money, USSD',
    color: '#F5A623',
    bgClass: 'bg-[#F5A623]/10 border-[#F5A623]',
  }]
})

watch(gateways, (gws) => {
  if (gws.length) selectedGateway.value = gws[0].key
}, { immediate: true })

async function pay() {
  if (!selectedGateway.value) return
  loading.value = true
  error.value = ''

  try {
    const amount = Number(formatNumber(priceBreakdown.value.total))
    const currency = currentConfig.value?.code ?? 'NGN'
    const leadGuest = state.participants[0]

    const res = await service.initializePayment(selectedGateway.value, {
      amount,
      currency,
      invoice_code: state.invoiceNumber,
      customer_name:  `${leadGuest?.firstName ?? ''} ${leadGuest?.lastName ?? ''}`.trim(),
      customer_email: state.contactEmail,
      callback_url: `${globalThis.location.origin}/travel/tours/booking/confirm`,
    })

    const redirectUrl = res?.payment_link
    if (!redirectUrl) throw new Error('No payment URL returned from server.')

    saveStateToSession()
    globalThis.location.href = redirectUrl
  } catch (e: any) {
    error.value = e?.message ?? 'Could not connect to payment gateway.'
    loading.value = false
    toast.error(error.value)
  }
}
</script>

<template>
  <div class="space-y-5">
    <AppToast />

    <!-- Amount due -->
    <div class="bg-slate-900 rounded-2xl px-6 py-5 flex items-center justify-between">
      <div>
        <p class="text-slate-400 text-sm">Total Amount Due</p>
        <p class="text-3xl font-bold text-white mt-0.5">{{ format(priceBreakdown.total) }}</p>
        <p class="text-slate-400 text-xs mt-1">
          {{ totalParticipants }} participant{{ totalParticipants !== 1 ? 's' : '' }} ·
          {{ state.selectedPackage?.name }} · {{ state.searchParams.city }}
        </p>
      </div>
      <div class="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center shrink-0">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      </div>
    </div>

    <!-- Price breakdown -->
    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm px-6 py-5">
      <p class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Price Breakdown</p>
      <div class="space-y-2">
        <div v-if="state.adults > 0" class="flex justify-between text-sm">
          <span class="text-slate-600">
            {{ format(state.selectedPackage!.priceAdult * state.ngnRate) }} × {{ state.adults }} adult{{ state.adults > 1 ? 's' : '' }}
          </span>
          <span class="font-semibold text-slate-800">{{ format(priceBreakdown.adultTotal) }}</span>
        </div>
        <div v-if="state.children > 0" class="flex justify-between text-sm">
          <span class="text-slate-600">
            {{ format(state.selectedPackage!.priceChild * state.ngnRate) }} × {{ state.children }} child{{ state.children > 1 ? 'ren' : '' }}
          </span>
          <span class="font-semibold text-slate-800">{{ format(priceBreakdown.childTotal) }}</span>
        </div>
        <div v-if="state.infants > 0" class="flex justify-between text-sm">
          <span class="text-slate-600">{{ state.infants }} infant{{ state.infants > 1 ? 's' : '' }}</span>
          <span class="font-semibold text-slate-800">
            {{ state.selectedPackage!.priceInfant === 0 ? '₦0 (free)' : format(priceBreakdown.infantTotal) }}
          </span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-slate-600">VAT (7.5%)</span>
          <span class="font-semibold text-slate-800">{{ format(priceBreakdown.tax) }}</span>
        </div>
        <div class="flex justify-between pt-2 border-t border-slate-100">
          <span class="font-bold text-slate-900">Total</span>
          <span class="font-bold text-slate-900 text-lg">{{ format(priceBreakdown.total) }}</span>
        </div>
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
        to complete payment, then redirected back. Your booking voucher will be emailed to
        <span class="font-semibold">{{ state.contactEmail || 'your email' }}</span>.
      </p>
    </div>

    <div v-if="error" class="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3.5">
      <svg class="shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <p class="text-sm text-red-700">{{ error }}</p>
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
          Pay {{ format(priceBreakdown.total) }} with {{ selectedGateway === 'paystack' ? 'Paystack' : 'Flutterwave' }}
        </span>
        <span v-else>Select a payment method</span>
      </button>
    </div>
    <p class="text-center text-xs text-slate-400">We never store your card details</p>
  </div>
</template>
