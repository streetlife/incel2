<script setup lang="ts">
import { useVisaStore } from '../../stores/visa';


const emit = defineEmits<{ next: []; back: [] }>()
const store = useVisaStore()

function proceed() {
  store.generateInvoice()
  emit('next')
}
</script>

<template>
  <div class="space-y-5">

    <!-- Invoice card -->
    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

      <!-- Invoice header -->
      <div class="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <p class="text-xs font-bold uppercase tracking-widest text-slate-400">Proforma Invoice</p>
          <h2 class="text-xl font-bold text-slate-900 mt-0.5">TravelCo Visa Services</h2>
          <p class="text-xs text-slate-400 mt-0.5">VAT Reg: RC-0000000 · Lagos, Nigeria</p>
        </div>
        <div class="text-right">
          <p class="text-xs text-slate-400">Invoice No.</p>
          <p class="font-mono font-bold text-slate-900">{{ store.invoiceNumber || 'PREVIEW' }}</p>
          <p class="text-xs text-slate-400 mt-1">{{ new Date().toLocaleDateString('en-NG', { day: '2-digit', month: 'long', year: 'numeric' }) }}</p>
        </div>
      </div>

      <!-- Billed to -->
      <div class="px-6 py-4 bg-slate-50 border-b border-slate-100">
        <p class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Billed To</p>
        <p class="font-semibold text-slate-900">{{ store.applicant.title }} {{ store.applicant.firstName }} {{ store.applicant.lastName }}</p>
        <p class="text-sm text-slate-500">{{ store.applicant.email }}</p>
        <p class="text-sm text-slate-500">{{ store.applicant.phone }}</p>
      </div>

      <!-- Application summary -->
      <div class="px-6 py-5 border-b border-slate-100">
        <p class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Application Details</p>

        <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div v-for="row in [
            { label: 'Destination', value: store.selectedVisa?.country },
            { label: 'Visa Type', value: store.selectedVisa?.visaType },
            { label: 'Entry Type', value: store.selectedVisa?.entryType },
            { label: 'Validity', value: store.selectedVisa?.validity },
            { label: 'Processing', value: store.selectedVisa?.processingTime },
            { label: 'Travel Date', value: store.applicant.departureDate },
          ]" :key="row.label">
            <div>
              <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">{{ row.label }}</p>
              <p class="text-sm font-semibold text-slate-800">{{ row.value || '—' }}</p>
            </div>
          </div>
        </div>

        <!-- Applicant info -->
        <div class="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div v-for="row in [
            { label: 'Lead Applicant', value: `${store.applicant.firstName} ${store.applicant.lastName}` },
            { label: 'Passport No.', value: store.applicant.passportNumber || '—' },
            { label: 'Nationality', value: store.applicant.nationality },
            { label: 'Adults', value: store.searchParams.adults.toString() },
            { label: 'Children', value: store.searchParams.children.toString() },
            { label: 'Total People', value: store.totalApplicants.toString() },
          ]" :key="row.label">
            <div>
              <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">{{ row.label }}</p>
              <p class="text-sm font-semibold text-slate-800">{{ row.value }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Price breakdown -->
      <div class="px-6 py-5 border-b border-slate-100">
        <p class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Price Breakdown</p>
        <div class="space-y-2.5">
          <div class="flex justify-between text-sm">
            <span class="text-slate-600">
              Visa fee — {{ store.selectedVisa?.visaType }}
              ({{ store.fmtNgn(store.pricing?.perPerson ?? 0) }} × {{ store.pricing?.applicants }} applicant{{ (store.pricing?.applicants ?? 1) > 1 ? 's' : '' }})
            </span>
            <span class="font-semibold text-slate-900">{{ store.fmtNgn(store.pricing?.subtotal ?? 0) }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-slate-600">Service & processing fee (5%)</span>
            <span class="font-semibold text-slate-900">{{ store.fmtNgn(store.pricing?.serviceFee ?? 0) }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-slate-600">VAT (7.5%)</span>
            <span class="font-semibold text-slate-900">{{ store.fmtNgn(store.pricing?.tax ?? 0) }}</span>
          </div>
          <div class="flex justify-between pt-3 border-t border-slate-100">
            <span class="font-bold text-slate-900 text-base">Total Due</span>
            <span class="font-bold text-slate-900 text-xl">{{ store.fmtNgn(store.pricing?.total ?? 0) }}</span>
          </div>
        </div>
      </div>

      <!-- Documents uploaded -->
      <div class="px-6 py-5 border-b border-slate-100">
        <p class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Documents Attached</p>
        <div class="flex flex-wrap gap-2">
          <span v-for="doc in store.documents.filter(d => d.uploaded)" :key="doc.key"
            class="flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-100 px-3 py-1.5 rounded-lg">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20,6 9,17 4,12"/></svg>
            {{ doc.label }}
          </span>
          <span v-for="doc in store.documents.filter(d => !d.uploaded && d.required)" :key="doc.key + '-missing'"
            class="flex items-center gap-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-100 px-3 py-1.5 rounded-lg">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            Missing: {{ doc.label }}
          </span>
        </div>
      </div>

      <!-- Email notice -->
      <div class="px-6 py-4 bg-slate-50">
        <p class="text-xs text-slate-500 leading-relaxed">
          Your invoice and application confirmation will be emailed to
          <span class="font-semibold text-slate-700">{{ store.applicant.email }}</span>.
          Once your visa is approved by the embassy, it will also be sent to this email.
        </p>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex justify-between">
      <button class="px-5 py-3 border-2 border-slate-200 text-slate-700 font-semibold text-sm rounded-xl hover:bg-slate-50 cursor-pointer bg-white"
        @click="emit('back')">← Edit Application</button>
      <button class="flex items-center gap-2 px-6 py-3 bg-primary hover:opacity-90 active:scale-95 text-slate-900 font-bold text-sm rounded-xl border-none cursor-pointer transition-all"
        @click="proceed">
        Proceed to Payment →
      </button>
    </div>
  </div>
</template>
