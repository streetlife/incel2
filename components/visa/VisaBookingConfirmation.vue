<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useVisaStore } from '../../stores/visa'
import { useCurrency } from '../../composables/useCurrency'

const store  = useVisaStore()
const router = useRouter()

const BASE_PRICE = 45_000

const pricing = computed(() => {
  const count = store.personCount
  const subtotal   = BASE_PRICE * count
  const serviceFee = Math.round(subtotal * 0.05)
  const tax = Math.round(subtotal * 0.075)
  const total = subtotal + serviceFee + tax
  return { count, subtotal, serviceFee, tax, total }
})

const { format } = useCurrency()
const leadApplicant = computed(() => store.applicants[0])

const applicationRef = computed(() => {
  const d = new Date()
  return `VIS-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}-${Math.floor(10000 + Math.random() * 90000)}`
})

const processingTime = '3–5 Business Days'

const printInvoice = () => {
  globalThis.print()
}

const reset = () => {
  store.resetAll()
  router.push('/travel/visas')
}
</script>

<template>
  <div class="max-w-2xl mx-auto space-y-5">
    <div class="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl px-6 py-8 text-center text-white shadow-lg">
      <div class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
          <polyline points="20,6 9,17 4,12"/>
        </svg>
      </div>
      <h1 class="text-2xl font-bold mb-1">Application Submitted!</h1>
      <p class="text-white/80 text-sm mb-4">
        Payment confirmed · Your visa application{{ store.personCount > 1 ? 's are' : ' is' }} now being processed
      </p>
      <div class="inline-block bg-white/20 rounded-xl px-5 py-2">
        <p class="text-xs text-white/70">Application Reference</p>
        <p class="font-mono font-bold text-xl tracking-wider">{{ applicationRef }}</p>
      </div>
    </div>

    <div class="bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4 flex items-start gap-3">
      <svg class="shrink-0 mt-0.5" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22,6 12,13 2,6"/>
      </svg>
      <div>
        <p class="text-sm font-semibold text-blue-700">Confirmation sent to your email</p>
        <p class="text-xs text-blue-600 mt-0.5 leading-relaxed">
          Invoice and application details have been emailed to
          <span class="font-semibold">{{ leadApplicant.email || 'your email address' }}</span>.
          You will receive another email once your visa is approved and ready.
        </p>
      </div>
    </div>

    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <p class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-5">What Happens Next</p>
      <div class="space-y-5">
        <div v-for="(step, i) in [
          {
            icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
            color: 'bg-green-100 text-green-600',
            title: 'Payment Confirmed',
            desc: 'Your payment has been received and your application has been submitted.',
            done: true,
          },
          {
            icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
            color: 'bg-blue-50 text-blue-600',
            title: 'Application Review',
            desc: 'Our visa specialist will review your application and documents within 1 business day.',
            done: false,
          },
          {
            icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1',
            color: 'bg-blue-50 text-blue-600',
            title: 'Embassy Submission',
            desc: `Your application will be submitted to the ${store.selectedVisa?.country || 'destination'} embassy / visa authority.`,
            done: false,
          },
          {
            icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
            color: 'bg-purple-100 text-purple-600',
            title: 'Visa Delivered by Email',
            desc: `Once approved, your visa${store.personCount > 1 ? 's' : ''} will be emailed directly to ${leadApplicant.email || 'your email'}.`,
            done: false,
          },
        ]" :key="step.title" class="flex items-start gap-4">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" :class="step.color">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path :d="step.icon" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="flex-1 pt-1">
            <div class="flex items-center gap-2 mb-0.5">
              <p class="text-sm font-bold text-slate-900">{{ step.title }}</p>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full"
                :class="step.done ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'">
                {{ step.done ? 'Done' : 'Pending' }}
              </span>
            </div>
            <p class="text-xs text-slate-500 leading-relaxed">{{ step.desc }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div class="bg-slate-50 px-6 py-4 border-b border-slate-100">
        <p class="text-xs font-bold uppercase tracking-widest text-slate-400">Application Summary</p>
      </div>
      <div class="px-6 py-5 grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div v-for="row in [
          { label: 'Reference', value: applicationRef },
          { label: 'Destination', value: store.selectedVisa?.country },
          { label: 'Applicants', value: `${store.personCount} person${store.personCount > 1 ? 's' : ''}` },
          { label: 'Travel Date', value: leadApplicant.departureDate
              ? new Date(leadApplicant.departureDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
              : '—' },
          { label: 'Amount Paid', value: format(pricing.total) },
          { label: 'Status', value: 'Submitted' },
        ]" :key="row.label">
          <div>
            <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">{{ row.label }}</p>
            <p class="text-sm font-semibold text-slate-800">{{ row.value || '—' }}</p>
          </div>
        </div>
      </div>

      <div class="px-6 pb-5 border-t border-slate-100 pt-4">
        <p class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Travellers</p>
        <div class="space-y-2">
          <div v-for="(ap, i) in store.applicants" :key="i"
            class="flex items-center gap-3 py-2 px-3 rounded-lg bg-slate-50 border border-slate-100">
            <div class="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
              <span class="text-[10px] font-bold text-slate-600">{{ i + 1 }}</span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-semibold text-slate-800 truncate">
                {{ ap.firstName ? `${ap.firstName} ${ap.lastName} ${ap.otherNames}`.trim() : `Person ${i + 1}` }}
              </p>
            </div>
            <p class="text-[10px] font-mono text-slate-400 uppercase shrink-0">{{ ap.passportNumber || '—' }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-2xl px-5 py-4">
      <svg class="shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
      <div>
        <p class="text-sm font-semibold text-amber-800">Processing Time: {{ processingTime }}</p>
        <p class="text-xs text-amber-700 mt-0.5 leading-relaxed">
          Processing times are estimates and depend on embassy workload. We'll keep you updated by email.
          For urgent enquiries contact support with reference
          <span class="font-mono font-bold">{{ applicationRef }}</span>.
        </p>
      </div>
    </div>

    <div class="flex flex-wrap gap-3">
      <button
        class="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl cursor-pointer transition-colors"
        @click="printInvoice()">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6 9 6 2 18 2 18 9"/>
          <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/>
          <rect x="6" y="14" width="12" height="8"/>
        </svg>
        Print Confirmation
      </button>

      <router-link to="/dashboard/bookings"
        class="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl no-underline transition-colors">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
          <rect x="9" y="3" width="6" height="4" rx="1"/>
        </svg>
        View in Dashboard
      </router-link>

      <button
        class="flex items-center gap-2 px-4 py-2.5 bg-primary hover:opacity-90 text-slate-900 text-sm font-bold rounded-xl border-none cursor-pointer transition-all ml-auto"
        @click="reset()">
        Apply for Another Visa →
      </button>
    </div>

  </div>
</template>
