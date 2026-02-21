<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useVisaStore } from '../../stores/visa';

const store = useVisaStore()
const router = useRouter()
</script>

<template>
  <div class="max-w-2xl mx-auto space-y-5">

    <!-- Success banner -->
    <div class="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl px-6 py-8 text-center text-white shadow-lg">
      <div class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
          <polyline points="20,6 9,17 4,12"/>
        </svg>
      </div>
      <h1 class="text-2xl font-bold mb-1">Application Submitted!</h1>
      <p class="text-white/80 text-sm mb-4">Payment confirmed · Your visa application is now being processed</p>
      <div class="inline-block bg-white/20 rounded-xl px-5 py-2">
        <p class="text-xs text-white/70">Application Reference</p>
        <p class="font-mono font-bold text-xl tracking-wider">{{ store.applicationRef }}</p>
      </div>
    </div>

    <!-- Email notice -->
    <div class="bg-primary/10 border border-primary/20 rounded-2xl px-5 py-4 flex items-start gap-3">
      <svg class="shrink-0 mt-0.5" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22,6 12,13 2,6"/>
      </svg>
      <div>
        <p class="text-sm font-semibold text-primary">Confirmation sent to your email</p>
        <p class="text-xs text-primary/80 mt-0.5">
          Invoice and application details have been emailed to
          <span class="font-semibold">{{ store.applicant.email }}</span>.
          You will receive another email once your visa is approved and ready.
        </p>
      </div>
    </div>

    <!-- What happens next -->
    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <p class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">What Happens Next</p>

      <div class="space-y-5">
        <div v-for="(step, i) in [
          {
            icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
            color: 'bg-green-100 text-green-600',
            title: 'Payment Confirmed',
            desc:  'Your payment has been received and your application has been submitted.',
            done:  true,
          },
          {
            icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
            color: 'bg-primary/10 text-primary',
            title: 'Application Review',
            desc:  'Our visa specialist will review your application and documents within 1 business day.',
            done:  false,
          },
          {
            icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1',
            color: 'bg-primary/10 text-primary',
            title: 'Embassy Submission',
            desc:  `Your application will be submitted to the ${store.selectedVisa?.country} embassy / visa authority.`,
            done:  false,
          },
          {
            icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
            color: 'bg-purple-100 text-purple-600',
            title: 'Visa Delivered by Email',
            desc:  `Once approved, your ${store.selectedVisa?.visaType} will be emailed directly to ${store.applicant.email}.`,
            done:  false,
          },
        ]" :key="step.title" class="flex items-start gap-4">
          <!-- Step icon -->
          <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" :class="step.color">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path :d="step.icon" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <!-- Step text -->
          <div class="flex-1 pt-1">
            <div class="flex items-center gap-2 mb-0.5">
              <p class="text-sm font-bold text-slate-900">{{ step.title }}</p>
              <span v-if="step.done" class="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Done</span>
              <span v-else class="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">Pending</span>
            </div>
            <p class="text-xs text-slate-500 leading-relaxed">{{ step.desc }}</p>
          </div>
          <!-- Connector line -->
          <div v-if="i < 3" class="absolute ml-5 mt-10 w-0.5 h-5 bg-slate-200" style="display:none"></div>
        </div>
      </div>
    </div>

    <!-- Application summary card -->
    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div class="bg-slate-50 px-6 py-4 border-b border-slate-100">
        <p class="text-xs font-bold uppercase tracking-widest text-slate-400">Application Summary</p>
      </div>
      <div class="px-6 py-5 grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div v-for="row in [
          { label: 'Reference', value: store.applicationRef },
          { label: 'Invoice', value: store.invoiceNumber },
          { label: 'Destination', value: store.selectedVisa?.country },
          { label: 'Visa Type', value: store.selectedVisa?.visaType },
          { label: 'Processing', value: store.selectedVisa?.processingTime },
          { label: 'Applicants', value: `${store.totalApplicants} person${store.totalApplicants > 1 ? 's' : ''}` },
          { label: 'Travel Date', value: store.applicant.departureDate },
          { label: 'Amount Paid', value: store.fmtNgn(store.pricing?.total ?? 0) },
          { label: 'Status', value: 'Submitted' },
        ]" :key="row.label">
          <div>
            <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">{{ row.label }}</p>
            <p class="text-sm font-semibold text-slate-800">{{ row.value }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Processing time note -->
    <div class="flex items-start gap-3 bg-primary/10 border border-primary/20 rounded-2xl px-5 py-4">
      <svg class="shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
      <div>
        <p class="text-sm font-semibold text-primary">Processing Time: {{ store.selectedVisa?.processingTime }}</p>
        <p class="text-xs text-amber-700 mt-0.5 leading-relaxed">
          Processing times are estimates and depend on embassy workload. We'll keep you updated by email.
          For urgent enquiries contact support with reference <span class="font-mono font-bold">{{ store.applicationRef }}</span>.
        </p>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex flex-wrap gap-3">
      <button
        class="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl cursor-pointer transition-colors">
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
        </svg>
        View in Dashboard
      </router-link>

      <button
        class="flex items-center gap-2 px-4 py-2.5 bg-primary hover:opacity-90 text-slate-900 text-sm font-bold rounded-xl border-none cursor-pointer transition-all ml-auto"
        @click="store.reset(); router.push('/travel/visas')">
        Apply for Another Visa →
      </button>
    </div>

  </div>
</template>
