<script setup lang="ts">
import { computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useVisaStore } from '../../../../stores/visa'
import VisaApplicationForm from '../../../../components/visa/VisaApplicationForm.vue'
import VisaBookingReview from '../../../../components/visa/VisaBookingReview.vue'
import VisaPaymentForm from '../../../../components/visa/VisaPaymentForm.vue'
import VisaBookingSummary from '../../../../components/visa/VisaBookingSummary.vue'

const router = useRouter()
const route = useRoute()
const store = useVisaStore()

const step = computed({
  get: () => Number(route.query.step) || 1,
  set: (n: number) => router.replace({ query: { ...route.query, step: String(n) } }),
})

function hydrateStoreFromUrl() {
  const q = route.query

  if (!q.country || !q.nationality || !q.persons) {
    router.replace('/travel/visas')
    return
  }

  const searchParams = {
    country: q.country as string,
    nationality: q.nationality as string,
    persons: Number(q.persons) || 1,
  }

  store.setVisa(searchParams)
}

onMounted(hydrateStoreFromUrl)

watch(() => route.query.country, hydrateStoreFromUrl)

const steps = [
  { n: 1, label: 'Application' },
  { n: 2, label: 'Review' },
  { n: 3, label: 'Payment' },
]

function goBack() {
  if (step.value === 1) {
    router.push({
      path: '/travel/visas',
    })
  } else {
    step.value = step.value - 1
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-100 pt-44 pb-16 sm:px-24 px-4">

    <div class="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div class="mx-auto px-4 md:px-6 py-4 flex items-center gap-4">

        <button
          class="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors cursor-pointer bg-transparent border-none p-0 shrink-0"
          @click="goBack">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back
        </button>

        <!-- Step progress -->
        <div class="flex items-center gap-2 flex-1 justify-center">
          <template v-for="(s, i) in steps" :key="s.n">
            <div class="flex items-center gap-2">
              <div class="flex items-center gap-1.5">
                <div class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all shrink-0"
                  :class="step > s.n
                    ? 'bg-green-500 border-green-500 text-white'
                    : step === s.n
                      ? 'bg-slate-900 border-slate-900 text-white'
                      : 'bg-transparent border-slate-300 text-slate-400'">
                  <svg v-if="step > s.n" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
                    <polyline points="20,6 9,17 4,12"/>
                  </svg>
                  <span v-else>{{ s.n }}</span>
                </div>
                <span class="hidden sm:block text-xs font-semibold transition-colors"
                  :class="step === s.n ? 'text-slate-900' : 'text-slate-400'">
                  {{ s.label }}
                </span>
              </div>
            </div>
            <div v-if="i < steps.length - 1" class="flex-1 h-0.5 max-w-16 transition-colors"
              :class="step > s.n ? 'bg-green-400' : 'bg-slate-200'"></div>
          </template>
        </div>

        <!-- Visa context pill — populated directly from URL params -->
        <div v-if="store.selectedVisa"
          class="shrink-0 hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg max-w-xs truncate">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          <span class="truncate">{{ store.selectedVisa.visaType }} · {{ store.selectedVisa.country }}</span>
        </div>
      </div>
    </div>

    <div class="mx-auto py-6">
      <div class="flex flex-col lg:flex-row gap-6 items-start">

        <div class="flex-1 min-w-0">
          <Transition name="slide" mode="out-in">
            <VisaApplicationForm v-if="step === 1" key="1" @next="step = 2" />
            <VisaBookingReview v-else-if="step === 2" key="2" @next="step = 3" @back="step = 1" />
            <VisaPaymentForm v-else-if="step === 3" key="3" @back="step = 2" />
          </Transition>
        </div>

        <VisaBookingSummary />
      </div>
    </div>

  </div>
</template>

<style scoped>
.slide-enter-active, .slide-leave-active { transition: all .2s ease; }
.slide-enter-from { opacity: 0; transform: translateX(16px);  }
.slide-leave-to   { opacity: 0; transform: translateX(-16px); }
</style>
