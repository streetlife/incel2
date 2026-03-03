<script setup lang="ts">
import { computed } from 'vue'
import { useVisaStore } from '../../stores/visa'
import { useCurrency } from '../../composables/useCurrency';

const emit = defineEmits<{ next: []; back: [] }>()
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

const invoiceNumber = computed(() => {
  const d = new Date()
  return `INV-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`
})

const allUploadedDocs = computed(() => {
  const seen = new Set<string>()
  const result: { key: string; label: string }[] = []
  for (let i = 0; i < store.personCount; i++) {
    for (const doc of store.getDocuments(i)) {
      if (doc.uploaded && !seen.has(doc.key)) {
        seen.add(doc.key)
        result.push({ key: doc.key, label: doc.label })
      }
    }
  }
  return result
})

const missingDocs = computed(() => {
  return store.getDocuments(0)
    .filter(d => d.required)
    .filter(d => {
      const count = Array.from({ length: store.personCount }, (_, i) =>
        store.getDocuments(i).find(x => x.key === d.key)?.uploaded ?? false
      ).filter(Boolean).length
      return count < store.personCount
    })
})

function proceed() {
  emit('next')
}
</script>

<template>
  <div class="space-y-5">
    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div class="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <p class="text-xs font-bold uppercase tracking-widest text-slate-400">Proforma Invoice</p>
          <h2 class="text-xl font-bold text-slate-900 mt-0.5">TravelCo Visa Services</h2>
          <p class="text-xs text-slate-400 mt-0.5">VAT Reg: RC-0000000 · Lagos, Nigeria</p>
        </div>
        <div class="text-right">
          <p class="text-xs text-slate-400">Invoice No.</p>
          <p class="font-mono font-bold text-slate-900">{{ invoiceNumber }}</p>
          <p class="text-xs text-slate-400 mt-1">
            {{ new Date().toLocaleDateString('en-NG', { day: '2-digit', month: 'long', year: 'numeric' }) }}
          </p>
        </div>
      </div>

      <div class="px-6 py-4 bg-slate-50 border-b border-slate-100">
        <p class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Billed To</p>
        <p class="font-semibold text-slate-900">
          {{ leadApplicant.firstName }} {{ leadApplicant.lastName }}
        </p>
        <p class="text-sm text-slate-500">{{ leadApplicant.email || '—' }}</p>
        <p class="text-sm text-slate-500">{{ leadApplicant.phone || '—' }}</p>
      </div>

      <div class="px-6 py-5 border-b border-slate-100">
        <p class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Application Details</p>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div v-for="row in [
            { label: 'Destination', value: store.selectedVisa?.country },
            { label: 'Nationality', value: store.selectedVisa?.nationality },
            { label: 'Travel Date', value: leadApplicant.departureDate
                ? new Date(leadApplicant.departureDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                : '—' },
            { label: 'Return Date',  value: leadApplicant.returnDate
                ? new Date(leadApplicant.returnDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                : '—' },
            { label: 'Travellers',   value: `${store.personCount} person${store.personCount > 1 ? 's' : ''}` },
          ]" :key="row.label">
            <div>
              <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">{{ row.label }}</p>
              <p class="text-sm font-semibold text-slate-800">{{ row.value || '—' }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- All travellers -->
      <div class="px-6 py-5 border-b border-slate-100">
        <p class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Travellers</p>
        <div class="space-y-3">
          <div v-for="(ap, i) in store.applicants" :key="i"
            class="flex items-start gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50">

            <div class="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0 mt-0.5">
              <span class="text-xs font-bold text-slate-600">{{ i + 1 }}</span>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 flex-1">
              <div>
                <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Full Name</p>
                <p class="text-sm font-semibold text-slate-800">
                  {{ ap.firstName }} {{ ap.lastName || '—' }} {{ ap.otherNames || '—' }}
                </p>
              </div>
              <div>
                <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Passport No.</p>
                <p class="text-sm font-semibold text-slate-800 uppercase">{{ ap.passportNumber || '—' }}</p>
              </div>
              <div>
                <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Nationality</p>
                <p class="text-sm font-semibold text-slate-800">{{ ap.nationality || '—' }}</p>
              </div>
              <div>
                <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Date of Birth</p>
                <p class="text-sm font-semibold text-slate-800">{{ ap.dateOfBirth || '—' }}</p>
              </div>
              <div>
                <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Passport Expiry</p>
                <p class="text-sm font-semibold text-slate-800">{{ ap.passportExpiry || '—' }}</p>
              </div>
              <div>
                <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Docs</p>
                <p class="text-sm font-semibold"
                  :class="store.requiredDocsUploaded(i) ? 'text-green-600' : 'text-amber-500'">
                  {{ store.requiredDocsUploaded(i) ? '✓ Complete' : 'Incomplete' }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="px-6 py-5 border-b border-slate-100">
        <p class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Price Breakdown</p>
        <div class="space-y-2.5">
          <div class="flex justify-between text-sm">
            <span class="text-slate-600">
              Visa fee — Tourist Visa
              ({{ format(BASE_PRICE) }} × {{ pricing.count }} applicant{{ pricing.count > 1 ? 's' : '' }})
            </span>
            <span class="font-semibold text-slate-900">{{ format(pricing.subtotal) }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-slate-600">Service & processing fee (5%)</span>
            <span class="font-semibold text-slate-900">{{ format(pricing.serviceFee) }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-slate-600">VAT (7.5%)</span>
            <span class="font-semibold text-slate-900">{{ format(pricing.tax) }}</span>
          </div>
          <div class="flex justify-between pt-3 border-t border-slate-100">
            <span class="font-bold text-slate-900 text-base">Total Due</span>
            <span class="font-bold text-slate-900 text-xl">{{ format(pricing.total) }}</span>
          </div>
        </div>
      </div>

      <div class="px-6 py-5 border-b border-slate-100">
        <p class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Documents Attached</p>
        <div class="flex flex-wrap gap-2">
          <span v-for="doc in allUploadedDocs" :key="doc.key"
            class="flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-100 px-3 py-1.5 rounded-lg">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20,6 9,17 4,12"/></svg>
            {{ doc.label }}
          </span>
          <span v-for="doc in missingDocs" :key="doc.key + '-missing'"
            class="flex items-center gap-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-100 px-3 py-1.5 rounded-lg">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            Missing: {{ doc.label }}
          </span>
        </div>
      </div>

      <div class="px-6 py-4 bg-slate-50">
        <p class="text-xs text-slate-500 leading-relaxed">
          Your invoice and application confirmation will be emailed to
          <span class="font-semibold text-slate-700">{{ leadApplicant.email || 'your email' }}</span>.
          Once your visa is approved by the embassy, it will also be sent to this address.
        </p>
      </div>
    </div>

    <div class="flex justify-between">
      <button
        class="px-5 py-3 border-2 border-slate-200 text-slate-700 font-semibold text-sm rounded-xl hover:bg-slate-50 cursor-pointer bg-white"
        @click="emit('back')">
        ← Edit Application
      </button>
      <button
        class="flex items-center gap-2 px-6 py-3 bg-primary hover:opacity-90 active:scale-95 text-slate-900 font-bold text-sm rounded-xl border-none cursor-pointer transition-all"
        @click="proceed">
        Proceed to Payment →
      </button>
    </div>
  </div>
</template>
