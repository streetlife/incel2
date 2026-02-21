<script setup lang="ts">
import { useVisaStore } from '../../stores/visa';


const store = useVisaStore()
</script>

<template>
  <aside class="w-full lg:w-80 shrink-0">
    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden sticky top-6">

      <!-- Visa header -->
      <div class="bg-slate-900 px-5 py-4">
        <div class="flex items-center gap-2 mb-1">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#eab308" stroke-width="2">
            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          <span class="text-xs font-bold uppercase tracking-widest text-slate-400">Visa Application</span>
        </div>
        <p class="text-white font-bold text-lg leading-tight">{{ store.selectedVisa?.country }}</p>
        <p class="text-slate-400 text-sm">{{ store.selectedVisa?.visaType }} · {{ store.selectedVisa?.entryType }}</p>
      </div>

      <div class="px-5 py-4 space-y-4">

        <!-- Visa details -->
        <div class="grid grid-cols-2 gap-3">
          <div v-for="row in [
            { label: 'Validity', value: store.selectedVisa?.validity },
            { label: 'Processing', value: store.selectedVisa?.processingTime },
            { label: 'Nationality', value: store.searchParams.nationality },
            { label: 'Applicants', value: store.totalApplicants + ' person' + (store.totalApplicants > 1 ? 's' : '') },
          ]" :key="row.label">
            <div>
              <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">{{ row.label }}</p>
              <p class="text-sm font-semibold text-slate-800 mt-0.5">{{ row.value || '—' }}</p>
            </div>
          </div>
        </div>

        <div class="border-t border-slate-100 pt-4" v-if="store.pricing">
          <p class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Price Breakdown</p>

          <div class="space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-slate-600">
                {{ store.fmtNgn(store.pricing.perPerson) }} × {{ store.pricing.applicants }} applicant{{ store.pricing.applicants > 1 ? 's' : '' }}
              </span>
              <span class="font-semibold text-slate-800">{{ store.fmtNgn(store.pricing.subtotal) }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-slate-600">Service fee (5%)</span>
              <span class="font-semibold text-slate-800">{{ store.fmtNgn(store.pricing.serviceFee) }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-slate-600">VAT (7.5%)</span>
              <span class="font-semibold text-slate-800">{{ store.fmtNgn(store.pricing.tax) }}</span>
            </div>
            <div class="flex justify-between pt-2 border-t border-slate-100">
              <span class="font-bold text-slate-900">Total</span>
              <span class="font-bold text-slate-900 text-lg">{{ store.fmtNgn(store.pricing.total) }}</span>
            </div>
          </div>
        </div>

        <!-- Required docs checklist -->
        <div class="border-t border-slate-100 pt-4">
          <p class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Required Documents</p>
          <div class="space-y-1.5">
            <div v-for="doc in store.documents.filter(d => d.required)" :key="doc.key"
              class="flex items-center gap-2 text-xs">
              <div class="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                :class="doc.uploaded ? 'bg-green-100' : 'bg-slate-100'">
                <svg v-if="doc.uploaded" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="3"><polyline points="20,6 9,17 4,12"/></svg>
                <div v-else class="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
              </div>
              <span :class="doc.uploaded ? 'text-green-700 font-medium' : 'text-slate-500'">{{ doc.label }}</span>
            </div>
          </div>
        </div>

        <!-- Email notice -->
        <div class="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
          <p class="text-xs text-primary leading-relaxed">
            <span class="font-semibold">Visa delivery:</span> Once approved, your visa will be emailed to
            <span class="font-semibold">{{ store.applicant.email || 'your email' }}</span>.
          </p>
        </div>

      </div>
    </div>
  </aside>
</template>
