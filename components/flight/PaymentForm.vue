<!-- Step 3: Payment -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useBookingStore } from '../../composables/useBookingStore';

const emit = defineEmits<{ (e: 'next'): void; (e: 'back'): void }>()
const { state, priceBreakdown, fmtNgn, confirmBooking } = useBookingStore()

const method   = ref<'card' | 'bank' | 'ussd'>('card')
const loading  = ref(false)
const error    = ref('')

// Card fields
const card = ref({ number: '', name: '', expiry: '', cvv: '' })
const cardErrors = ref<Record<string, string>>({})

const cardBrand = computed(() => {
  const n = card.value.number.replace(/\s/g, '')
  if (n.startsWith('4'))  return 'Visa'
  if (n.startsWith('5'))  return 'Mastercard'
  if (n.startsWith('3'))  return 'Amex'
  return null
})

const formatCardNumber = (e: Event) => {
  const v = (e.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 16)
  card.value.number = v.replace(/(\d{4})/g, '$1 ').trim()
}

const formatExpiry = (e: Event) => {
  const v = (e.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 4)
  card.value.expiry = v.length > 2 ? `${v.slice(0,2)}/${v.slice(2)}` : v
}

function validateCard(): boolean {
  cardErrors.value = {}
  const n = card.value.number.replace(/\s/g, '')
  if (n.length < 16)              cardErrors.value.number = 'Invalid card number'
  if (!card.value.name.trim())    cardErrors.value.name   = 'Name required'
  if (!card.value.expiry.match(/^\d{2}\/\d{2}$/)) cardErrors.value.expiry = 'Invalid expiry (MM/YY)'
  if (card.value.cvv.length < 3)  cardErrors.value.cvv    = 'Invalid CVV'
  return Object.keys(cardErrors.value).length === 0
}

async function handlePay() {
  error.value = ''
  if (method.value === 'card' && !validateCard()) return

  loading.value = true
  try {
    // Real flow:
    // 1. POST to your backend /api/payments/initialize with { amount, currency, email }
    // 2. Backend calls Paystack / Flutterwave to get a payment reference
    // 3. After payment confirmed, backend calls Amadeus POST /v1/booking/flight-orders
    // 4. Backend emails invoice PDF + ticket to passenger
    await confirmBooking()
    emit('next')
  } catch (e) {
    console.log(e)
    error.value = 'Payment failed. Please try again.'
  } finally {
    loading.value = false
  }
}

const inputClass = (key: string) =>
  `w-full px-3.5 py-2.5 text-sm rounded-xl border transition-colors outline-none focus:ring-2 focus:ring-primary/20 ${
    cardErrors.value[key]
      ? 'border-red-300 bg-red-50 focus:border-red-400'
      : 'border-slate-200 bg-white focus:border-primary'
  }`
</script>

<template>
  <div class="space-y-5">

    <!-- Amount due -->
    <div class="bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl px-5 py-4 flex items-center justify-between">
      <div>
        <p class="text-xs text-slate-400 mb-0.5">Amount Due</p>
        <p class="text-2xl font-bold text-white">{{ fmtNgn(priceBreakdown.total) }}</p>
        <p class="text-xs text-slate-400 mt-0.5">incl. VAT · {{ state.passengerCount }} passenger{{ state.passengerCount > 1 ? 's' : '' }}</p>
      </div>
      <div class="flex items-center gap-1.5 bg-green-500/20 border border-green-400/30 rounded-lg px-3 py-1.5">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        <span class="text-xs font-semibold text-green-300">Secure Payment</span>
      </div>
    </div>

    <!-- Payment method tabs -->
    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div class="flex border-b border-slate-100">
        <button
          v-for="m in [
            { id: 'card', label: 'Card', icon: '💳' },
            { id: 'bank', label: 'Bank Transfer', icon: '🏦' },
            { id: 'ussd', label: 'USSD', icon: '📱' },
          ]"
          :key="m.id"
          class="flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-medium transition-colors cursor-pointer border-none border-b-2"
          :class="method === m.id
            ? 'text-primary border-primary bg-blue-50/50'
            : 'text-slate-500 border-transparent hover:bg-slate-50'"
          @click="method = m.id as any"
        >
          <span>{{ m.icon }}</span>
          <span class="hidden sm:inline">{{ m.label }}</span>
        </button>
      </div>

      <!-- ── Card payment ─────────────────────────────────────────────── -->
      <div v-if="method === 'card'" class="p-5 space-y-4">
        <div>
          <label for="" class="text-xs font-semibold text-slate-500 mb-1.5 block">Card Number</label>
          <div class="relative">
            <input
              :value="card.number"
              type="text"
              inputmode="numeric"
              maxlength="19"
              placeholder="0000 0000 0000 0000"
              :class="inputClass('number')"
              class="pr-16"
              @input="formatCardNumber"
            />
            <span v-if="cardBrand" class="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">{{ cardBrand }}</span>
          </div>
          <p v-if="cardErrors.number" class="text-xs text-red-500 mt-1">{{ cardErrors.number }}</p>
        </div>

        <div>
          <label for="" class="text-xs font-semibold text-slate-500 mb-1.5 block">Cardholder Name</label>
          <input v-model="card.name" type="text" placeholder="Name as on card" :class="inputClass('name')" style="text-transform:uppercase" />
          <p v-if="cardErrors.name" class="text-xs text-red-500 mt-1">{{ cardErrors.name }}</p>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="" class="text-xs font-semibold text-slate-500 mb-1.5 block">Expiry Date</label>
            <input
              :value="card.expiry"
              type="text"
              inputmode="numeric"
              maxlength="5"
              placeholder="MM/YY"
              :class="inputClass('expiry')"
              @input="formatExpiry"
            />
            <p v-if="cardErrors.expiry" class="text-xs text-red-500 mt-1">{{ cardErrors.expiry }}</p>
          </div>
          <div>
            <label for="" class="text-xs font-semibold text-slate-500 mb-1.5 block">CVV</label>
            <input v-model="card.cvv" type="password" inputmode="numeric" maxlength="4" placeholder="•••" :class="inputClass('cvv')" />
            <p v-if="cardErrors.cvv" class="text-xs text-red-500 mt-1">{{ cardErrors.cvv }}</p>
          </div>
        </div>

        <!-- Accepted cards -->
        <div class="flex items-center gap-2 pt-1">
          <span class="text-xs text-slate-400">Accepted:</span>
          <span v-for="b in ['Visa', 'Mastercard', 'Verve', 'Amex']" :key="b" class="text-xs font-semibold px-2 py-0.5 bg-slate-100 rounded text-slate-500">{{ b }}</span>
        </div>
      </div>

      <!-- ── Bank transfer ─────────────────────────────────────────────── -->
      <div v-else-if="method === 'bank'" class="p-5 space-y-4">
        <div class="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
          <p class="text-xs font-bold uppercase tracking-widest text-slate-400">Transfer Details</p>
          <div class="flex justify-between text-sm">
            <span class="text-slate-500">Bank</span><span class="font-semibold text-slate-800">Guaranty Trust Bank</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-slate-500">Account Number</span><span class="font-mono font-bold text-slate-800">0123456789</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-slate-500">Account Name</span><span class="font-semibold text-slate-800">TravelCo Ltd</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-slate-500">Reference</span>
            <span class="font-mono text-primary font-bold">{{ state.passengers[0]?.lastName?.toUpperCase() || 'PAX' }}-{{ Date.now().toString().slice(-6) }}</span>
          </div>
          <div class="flex justify-between text-sm font-bold">
            <span class="text-slate-900">Amount</span><span class="text-slate-900">{{ fmtNgn(priceBreakdown.total) }}</span>
          </div>
        </div>
        <div class="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
          <svg class="shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <p class="text-xs text-amber-700">Include the reference code in your transfer narration. Your ticket will be issued within 30 minutes of payment confirmation.</p>
        </div>
      </div>

      <!-- ── USSD ──────────────────────────────────────────────────────── -->
      <div v-else class="p-5 space-y-3">
        <p class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Dial from your registered bank line</p>
        <div v-for="bank in [
          { name: 'GTBank',   code: '*737*' },
          { name: 'Access',   code: '*901*' },
          { name: 'Zenith',   code: '*966*' },
          { name: 'First Bank',code: '*894*' },
        ]" :key="bank.name" class="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
          <span class="text-sm font-medium text-slate-700">{{ bank.name }}</span>
          <span class="font-mono font-bold text-primary text-sm">{{ bank.code }}{{ Math.round(priceBreakdown.total) }}#</span>
        </div>
        <p class="text-xs text-slate-400 text-center pt-2">USSD charges may apply. Ticket issued after bank confirmation.</p>
      </div>
    </div>

    <!-- Error -->
    <div v-if="error" class="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <p class="text-sm text-red-700">{{ error }}</p>
    </div>

    <!-- Actions -->
    <div class="flex gap-3">
      <button
        class="flex-1 h-14 border-2 border-slate-200 text-slate-700 font-semibold rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer bg-white"
        :disabled="loading"
        @click="emit('back')"
      >
        ← Back
      </button>
      <button
        class="flex-[2] h-14 bg-primary hover:opacity-90 text-white font-bold rounded-2xl transition-all border-none cursor-pointer shadow-lg disabled:opacity-60 flex items-center justify-center gap-2"
        :disabled="loading"
        @click="handlePay"
      >
        <template v-if="loading">
          <svg class="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
          Processing…
        </template>
        <template v-else>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          Pay {{ fmtNgn(priceBreakdown.total) }}
        </template>
      </button>
    </div>

    <p class="text-center text-xs text-slate-400">
      🔒 256-bit SSL encryption · PCI DSS compliant · Your card details are never stored
    </p>
  </div>
</template>
