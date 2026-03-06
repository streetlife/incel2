<script setup lang="ts">
import { ref, nextTick, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import VisaForm from '../../../components/forms/VisaForm.vue'
import { useVisaStore } from '../../../stores/visa'
import AppToast from '../../../components/toast/AppToast.vue'
import { useToast } from '../../../composables/useToast'
import { normaliseError } from '../../../utils/api'
import type { SearchResultResponse } from '../../../types/visa'
import { useCurrency } from '../../../composables/useCurrency'

const router = useRouter()
const visaStore = useVisaStore()
const isSearching = ref(false)
const searchError = ref('')
const toast = useToast()
const route = useRoute()
const { format } = useCurrency()

const selectorDialog = ref<HTMLDialogElement | null>(null)
const pendingSearch = ref<{ persons: number } | null>(null)
const showSelector = ref(false)
const selectingId = ref<string | number | null>(null)

const popularDestinations = [
  { country: 'United Arab Emirates', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800', price: 'From ₦45,000',  processingTime: '3-5 Days'   },
  { country: 'United Kingdom', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800', price: 'From ₦120,000', processingTime: '15-20 Days' },
  { country: 'United States', image: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800', price: 'From ₦150,000', processingTime: '30-45 Days' },
  { country: 'Canada', image: 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=800', price: 'From ₦130,000', processingTime: '20-30 Days' },
  { country: 'Schengen', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800', price: 'From ₦95,000',  processingTime: '10-15 Days' },
  { country: 'Turkey', image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800', price: 'From ₦35,000', processingTime: '2-3 Days'   },
]

const benefits = [
  { title: 'Expert Assistance', description: 'Professional guidance through the entire visa process' },
  { title: 'Fast Processing', description: 'Quick turnaround times for your visa applications' },
  { title: 'Document Support', description: 'Help with document preparation and verification' },
  { title: 'Track Application', description: 'Real-time updates on your visa application status' },
]

async function openSelector() {
  showSelector.value = true
  await nextTick()
  selectorDialog.value?.showModal()
}

function closeSelector() {
  if (selectingId.value !== null) return
  const el = selectorDialog.value
  if (!el) return
  el.setAttribute('closing', '')
  el.addEventListener('animationend', () => {
    el.removeAttribute('closing')
    el.close()
    showSelector.value  = false
    pendingSearch.value = null
  }, { once: true })
}

async function prepareBooking(result: SearchResultResponse) {
  await visaStore.generateBookingCode()

  visaStore.setSelectedVisaResult({
    country: result.country,
    nationality: result.country_nationality,
    persons: result.adults,
    session_code: result.session_code,
    visa_type: result.visa_name,
    price: result.price,
  })
}

async function selectVisa(result: SearchResultResponse) {
  if (selectingId.value !== null) return
  selectingId.value = result.id

  try {
    await prepareBooking(result)
    closeSelector()
    await navigateToBooking(result, result.adults ?? 1)
  } catch (e) {
    toast.error(normaliseError(e))
    selectingId.value = null
  }
}

async function handleSearch(data: any) {
  isSearching.value = true
  searchError.value = ''

  try {
    await visaStore.search({
      country: data.country,
      nationality: data.nationality,
      persons: Number(data.persons),
    })

    const results = visaStore.searchResults

    if (!results.length) {
      toast.error('No visa options found for your selection.')
      return
    }

    if (results.length === 1) {
      const result = results[0]
      await prepareBooking(result)
      await navigateToBooking(result, Number(data.persons))
      return
    }

    pendingSearch.value = { persons: Number(data.persons) }
    openSelector()
  } catch (e) {
    searchError.value = normaliseError(e)
    toast.error(searchError.value)
  } finally {
    isSearching.value = false
  }
}

async function navigateToBooking(result: SearchResultResponse, persons: number) {
  await router.push({
    path: '/travel/visas/booking',
    query: {
      session_code: result.session_code,
      visa_type: result.visa_name,
      country: result.country_destination,
      nationality: result.country_nationality,
      persons: String(persons),
      booking_code: visaStore.bookingCode,
      step: '1',
    },
  })
}

watch(
  () => route.query,
  (newQuery) => {
    if (
      newQuery.country &&
      newQuery.nationality &&
      newQuery.persons &&
      !visaStore.metaLoading
    ) {
      handleSearch({
        country: String(newQuery.country),
        nationality: String(newQuery.nationality),
        persons: String(newQuery.persons),
      })
    }
  },
  { immediate: true }
)

onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('reveal-visible'); observer.unobserve(e.target) }
    }),
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  )
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el))
})
</script>

<template>
  <AppToast />
  <div class="min-h-screen">
    <section
      class="relative pt-36 pb-24 px-6 bg-cover bg-center bg-no-repeat"
      style="background-image: url('https://images.unsplash.com/photo-1606768666853-403c90a981ad?w=1600')"
    >
      <div class="absolute inset-0 bg-black/50"></div>

      <div class="relative z-10 max-w-7xl mx-auto">
        <div class="text-center mb-12 reveal">
          <h1 class="text-4xl md:text-5xl font-bold mb-4 text-white">Get Your Visa Easily</h1>
          <p class="text-xl text-gray-100">Fast and reliable visa processing services worldwide</p>
        </div>

        <div class="mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div v-if="isSearching" class="flex flex-col items-center justify-center py-12 gap-4 px-8">
            <div class="w-14 h-14 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
            <div class="text-center">
              <p class="text-gray-800 font-semibold text-lg">Finding visa services…</p>
              <p class="text-gray-400 text-sm mt-1">Checking availability and pricing</p>
            </div>
          </div>

          <div v-else class="p-6 md:p-8">
            <VisaForm @search="handleSearch" />
          </div>
        </div>
      </div>
    </section>

    <section class="py-16 px-6">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-12 reveal">
          <h2 class="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Popular Visa Destinations</h2>
          <p class="text-lg text-gray-600">Quick visa processing for popular destinations</p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="(destination, index) in popularDestinations"
            :key="destination.country"
            class="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer reveal"
            :style="{ transitionDelay: `${index * 100}ms` }"
          >
            <img
              :src="destination.image" :alt="destination.country"
              class="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            <div class="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h3 class="text-2xl font-bold mb-2">{{ destination.country }}</h3>
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-200">Processing Time</p>
                  <p class="font-semibold">{{ destination.processingTime }}</p>
                </div>
                <p class="text-lg font-semibold">{{ destination.price }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="py-16 px-6 bg-gray-50">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-12 reveal">
          <h2 class="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Why Choose Our Visa Services</h2>
          <p class="text-lg text-gray-600">Experience hassle-free visa processing with exclusive benefits</p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            v-for="(benefit, index) in benefits"
            :key="benefit.title"
            class="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 reveal"
            :style="{ transitionDelay: `${index * 100}ms` }"
          >
            <div class="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="20,6 9,17 4,12"/>
              </svg>
            </div>
            <h3 class="text-xl font-bold mb-2 text-gray-900">{{ benefit.title }}</h3>
            <p class="text-gray-600">{{ benefit.description }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>

  <Teleport to="body">
    <dialog
      v-if="showSelector"
      ref="selectorDialog"
      class="visa-dialog bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col max-h-[90dvh] sm:max-h-[80dvh] p-0 m-0 sm:m-auto mt-auto"
      aria-labelledby="visa-selector-title"
      @click.self="closeSelector"
      @cancel.prevent="closeSelector"
    >
      <div class="flex items-start justify-between px-6 pt-6 pb-4 border-b border-slate-100 shrink-0">
        <div>
          <h2 id="visa-selector-title" class="text-lg font-bold text-slate-900">
            Select a Visa Type
          </h2>
          <p class="text-sm text-slate-500 mt-0.5">
            {{ visaStore.searchResults.length }} options available for
            <span class="font-medium text-slate-700">{{ visaStore.searchResults[0]?.country }}</span>
          </p>
        </div>
        <button
          class="ml-4 shrink-0 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center text-slate-500 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Close"
          :disabled="selectingId !== null"
          @click="closeSelector"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <ul class="visa-options-list flex-1 px-4 py-4 space-y-3">
        <li v-for="result in visaStore.searchResults" :key="result.id">
          <button
            type="button"
            class="group w-full flex items-center justify-between gap-4 px-4 py-4 rounded-xl border-2 transition-all duration-150 text-left relative overflow-hidden"
            :class="selectingId === result.id
              ? 'border-slate-900 bg-slate-900 text-white cursor-wait'
              : selectingId !== null
                ? 'border-slate-100 bg-slate-50 opacity-40 cursor-not-allowed'
                : 'border-slate-100 hover:border-slate-900 hover:bg-slate-50 cursor-pointer'"
            :disabled="selectingId !== null"
            @click="selectVisa(result)"
          >
            <div
              v-if="selectingId === result.id"
              class="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"
            ></div>

            <div class="flex items-center gap-3 min-w-0">
              <div
                class="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-colors"
                :class="selectingId === result.id ? 'bg-white/20' : 'bg-slate-100 group-hover:bg-slate-200'"
              >
                <svg v-if="selectingId === result.id"
                  class="animate-spin"
                  width="18" height="18" viewBox="0 0 24 24" fill="none"
                  :stroke="selectingId === result.id ? 'white' : 'currentColor'" stroke-width="2.5">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                </svg>
                <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="text-slate-600">
                  <rect x="2" y="5" width="20" height="14" rx="2"/>
                  <path d="M2 10h20"/>
                  <path d="M6 15h4"/>
                </svg>
              </div>
              <div class="min-w-0">
                <p class="font-semibold text-sm leading-tight truncate"
                  :class="selectingId === result.id ? 'text-white' : 'text-slate-900'">
                  {{ result.visa_name }}
                </p>
                <p class="text-xs mt-0.5"
                  :class="selectingId === result.id ? 'text-white/60' : 'text-slate-400'">
                  {{ selectingId === result.id ? 'Preparing your booking…' : `${result.adults} adult${result.adults !== 1 ? 's' : ''}` }}
                </p>
              </div>
            </div>

            <div class="flex items-center gap-3 shrink-0">
              <span class="text-sm font-bold"
                :class="selectingId === result.id ? 'text-white' : 'text-slate-900'">
                {{ format(result.price, result.currency_code) }}
              </span>
              <svg
                width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                class="transition-all"
                :class="selectingId === result.id
                  ? 'text-white/50'
                  : 'text-slate-300 group-hover:text-slate-700 group-hover:translate-x-0.5'"
              >
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </div>
          </button>
        </li>
      </ul>

      <div class="px-6 py-4 border-t border-slate-100 shrink-0">
        <p class="text-xs text-center text-slate-400">
          {{ selectingId !== null ? 'Generating your booking reference…' : 'Prices are per person and may vary at checkout' }}
        </p>
      </div>
    </dialog>
  </Teleport>
</template>

<style scoped>
.reveal { opacity: 0; transform: translateY(30px); transition: opacity 0.6s ease-out, transform 0.6s ease-out; }
.reveal-visible { opacity: 1; transform: translateY(0); }

.visa-options-list {
  overflow-y: auto;
}

.visa-dialog {
  border: none;
  padding: 0;
  position: fixed;
  inset: 0;
  margin: auto auto 0 auto;
  animation: dialog-slide-up 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

.visa-dialog::backdrop {
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  animation: backdrop-in 0.2s ease both;
}

.visa-dialog[closing] {
  animation: dialog-slide-down 0.18s ease-in both;
}
.visa-dialog[closing]::backdrop {
  animation: backdrop-out 0.18s ease-in both;
}

@keyframes dialog-slide-up {
  from { opacity: 0; transform: translateY(32px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0)    scale(1);    }
}
@keyframes dialog-slide-down {
  from { opacity: 1; transform: translateY(0)    scale(1);    }
  to   { opacity: 0; transform: translateY(16px) scale(0.98); }
}
@keyframes backdrop-in  { from { opacity: 0; } to { opacity: 1; } }
@keyframes backdrop-out { from { opacity: 1; } to { opacity: 0; } }

@keyframes shimmer {
  from { transform: translateX(-100%); }
  to   { transform: translateX(200%); }
}
.animate-shimmer { animation: shimmer 1.4s ease-in-out infinite; }

@media (min-width: 640px) {
  .visa-dialog {
    margin: auto;
    animation: dialog-pop-in 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  }
  .visa-dialog[closing] {
    animation: dialog-pop-out 0.18s ease-in both;
  }
  @keyframes dialog-pop-in  {
    from { opacity: 0; transform: scale(0.95) translateY(8px); }
    to   { opacity: 1; transform: scale(1)    translateY(0);   }
  }
  @keyframes dialog-pop-out {
    from { opacity: 1; transform: scale(1)    translateY(0);   }
    to   { opacity: 0; transform: scale(0.97) translateY(4px); }
  }
}
</style>