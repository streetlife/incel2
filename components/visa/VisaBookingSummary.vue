<script setup lang="ts">
import { computed } from 'vue'
import { useVisaStore } from '../../stores/visa'
import { useCurrency } from '../../composables/useCurrency'

const store = useVisaStore()

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

const { format } = useCurrency()

const requiredDocs = computed(() => store.getDocuments(0).filter(d => d.required))

function uploadedCount(key: string): number {
  return Array.from({ length: store.personCount }, (_, i) =>
    store.getDocuments(i).find(d => d.key === key)?.uploaded ?? false
  ).filter(Boolean).length
}

const leadEmail = computed(() => store.applicants[0]?.email || '')

function resolveCountryName(codeOrValue: string | undefined): string {
  if (!codeOrValue) return '—'
  const opts = store.countryOptions

  return (
    opts.find(o => o.code === codeOrValue)?.value ??
    opts.find(o => o.value === codeOrValue)?.value ??
    codeOrValue
  )
}

function toTitleCase(str: string): string {
  return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
}

const countryName = computed(() => toTitleCase(resolveCountryName(store.selectedVisa?.country)))
const nationalityName = computed(() => toTitleCase(resolveCountryName(store.selectedVisa?.nationality)))
</script>

<template>
  <aside class="w-full lg:w-80 shrink-0">
    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden sticky top-6">
      <div class="bg-slate-900 px-5 py-4">
        <div class="flex items-center gap-2 mb-1">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#eab308" stroke-width="2">
            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          <span class="text-xs font-bold uppercase tracking-widest text-slate-400">Visa Application</span>
        </div>
        <p class="text-white font-bold text-lg leading-tight capitalize">{{ countryName }}</p>
        <p class="text-slate-400 text-sm">{{ store.selectedVisa?.visa_type }}</p>
      </div>

      <div class="px-5 py-4 space-y-4">
        <div class="grid grid-cols-2 gap-x-4 gap-y-3">
          <div>
            <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Nationality</p>
            <p class="text-sm font-semibold text-slate-800 mt-0.5">{{ nationalityName || '—' }}</p>
          </div>
          <div>
            <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Applicants</p>
            <p class="text-sm font-semibold text-slate-800 mt-0.5">
              {{ store.personCount }} person{{ store.personCount > 1 ? 's' : '' }}
            </p>
          </div>
        </div>

        <div class="border-t border-slate-100 pt-4" v-if="store.personCount > 0">
          <p class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Travellers</p>
          <div class="space-y-1.5">
            <div v-for="(ap, i) in store.applicants" :key="i"
              class="flex items-center gap-2.5 py-1.5 px-3 rounded-lg bg-slate-50 border border-slate-100">
              <div class="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                <span class="text-[10px] font-bold text-slate-600">{{ i + 1 }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-xs font-semibold text-slate-800 truncate">
                  {{ ap.firstName ? `${ap.firstName} ${ap.lastName}`.trim() : `Person ${i + 1}` }}
                </p>
                <p v-if="ap.passportNumber" class="text-[10px] text-slate-400 truncate uppercase">
                  {{ ap.passportNumber }}
                </p>
              </div>
              <div class="w-2 h-2 rounded-full shrink-0"
                :class="store.requiredDocsUploaded(i) && ap.firstName && ap.passportNumber
                  ? 'bg-green-400'
                  : 'bg-amber-300'">
              </div>
            </div>
          </div>
        </div>

        <div class="border-t border-slate-100 pt-4">
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

        <div class="border-t border-slate-100 pt-4">
          <p class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Required Documents</p>
          <div class="space-y-1.5">
            <div v-for="doc in requiredDocs" :key="doc.key" class="flex items-center gap-2 text-xs">
              <div class="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                :class="uploadedCount(doc.key) === store.personCount ? 'bg-green-100' : 'bg-slate-100'">
                <svg v-if="uploadedCount(doc.key) === store.personCount"
                  width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="3">
                  <polyline points="20,6 9,17 4,12"/>
                </svg>
                <div v-else class="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
              </div>
              <span class="flex-1"
                :class="uploadedCount(doc.key) === store.personCount ? 'text-green-700 font-medium' : 'text-slate-500'">
                {{ doc.label }}
              </span>
              <span v-if="store.personCount > 1"
                class="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                :class="uploadedCount(doc.key) === store.personCount
                  ? 'bg-green-100 text-green-700'
                  : 'bg-slate-100 text-slate-400'">
                {{ uploadedCount(doc.key) }}/{{ store.personCount }}
              </span>
            </div>
          </div>
        </div>

        <div class="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
          <p class="text-xs text-primary leading-relaxed">
            <span class="font-semibold">Visa delivery:</span> Once approved, your visa will be emailed to
            <span class="font-semibold">{{ leadEmail || 'your email address' }}</span>.
          </p>
        </div>
      </div>
    </div>
  </aside>
</template>
