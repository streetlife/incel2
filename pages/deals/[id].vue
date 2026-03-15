<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useCurrency } from '../../composables/useCurrency'
import { useHead } from 'nuxt/app'
import { useGeneralService } from '../../services/general.service'
import { HotDeal, useHotDealsStore } from '../../stores/hotdeal'

const route = useRoute()
const { format, fetchRates } = useCurrency()
const hotDealsStore = useHotDealsStore()
const generalService = useGeneralService()

const deal = ref<HotDeal | null>(null)
const loading = ref(true)
const error = ref(false)

const otherDeals = computed(() =>
  hotDealsStore.activeDeals.filter(d => d.id !== deal.value?.id).slice(0, 3)
)

async function fetchDeal() {
  loading.value = true
  error.value = false
  try {
    const id = Number(route.params.id)
    const data = await generalService.getHotDeal(id)
    deal.value  = data ?? null
    if (!deal.value) throw new Error('No data')
  } catch (err) {
    console.error('HotDeal detail fetch error:', err)
    error.value = true
  } finally {
    loading.value = false
  }
}

function formatDealDate(dateStr: string) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function isDealLive() {
  if (!deal.value) return false
  const now = Date.now()
  const start = deal.value.start_date ? new Date(deal.value.start_date).getTime() : 0
  const end = deal.value.end_date ? new Date(deal.value.end_date).getTime() : Infinity
  return now >= start && now <= end
}

const countdown = ref([
  { label: 'DAY', value: '00' },
  { label: 'HRS', value: '00' },
  { label: 'MIN', value: '00' },
  { label: 'SEC', value: '00' },
])
const dealExpired = ref(false)
let timer: ReturnType<typeof setInterval> | null = null

const tick = () => {
  const endDate = deal.value?.end_date
  if (!endDate) return
  const diff = Math.max(0, new Date(endDate).getTime() - Date.now())
  if (diff === 0) dealExpired.value = true
  countdown.value = [
    { label: 'DAY', value: String(Math.floor(diff / 86_400_000)).padStart(2, '0') },
    { label: 'HRS', value: String(Math.floor((diff % 86_400_000) / 3_600_000)).padStart(2, '0') },
    { label: 'MIN', value: String(Math.floor((diff % 3_600_000) / 60_000)).padStart(2, '0') },
    { label: 'SEC', value: String(Math.floor((diff % 60_000) / 1_000)).padStart(2, '0') },
  ]
}

const whatsappLink = computed(() => {
  if (!deal.value) return '#'
  const text = `Hi, I'm interested in the deal: ${deal.value.title} (${format(deal.value.price)})`
  return `https://wa.me/?text=${encodeURIComponent(text)}`
})

onMounted(async () => {
  await Promise.all([
    fetchRates(),
    fetchDeal(),
    hotDealsStore.fetchDeals(),
  ])
  tick()
  timer = setInterval(tick, 1_000)
})
onUnmounted(() => { if (timer) clearInterval(timer) })

useHead({
  title: computed(() => deal.value ? `${deal.value.title} — Incel Tourism` : 'Deal — Incel Tourism'),
  link: [{ rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap' }],
})
</script>

<template>
  <div class="min-h-screen bg-[#040d1a]">
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div class="w-12 h-12 border-4 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin mx-auto mb-4" />
        <p class="text-slate-400 text-sm">Loading deal…</p>
      </div>
    </div>

    <div v-else-if="error" class="flex flex-col items-center justify-center min-h-screen gap-6 px-4 text-center">
      <div class="text-6xl mb-2">⚠️</div>
      <h1 class="text-3xl font-black text-white">Failed to load deal</h1>
      <p class="text-slate-400 max-w-sm">Something went wrong fetching this deal. Please try again.</p>
      <button
        @click="fetchDeal"
        class="px-8 py-3 rounded-full font-extrabold text-sm bg-yellow-400 text-[#040d1a] hover:bg-yellow-300 transition-all duration-200"
      >
        Retry
      </button>
    </div>

    <div v-else-if="!deal" class="flex flex-col items-center justify-center min-h-screen gap-6 px-4 text-center">
      <div class="text-6xl mb-2">✈️</div>
      <h1 class="text-4xl font-black text-white">Deal Not Found</h1>
      <p class="text-slate-400 max-w-sm">This deal may have expired or the link is incorrect.</p>
      <NuxtLink
        to="/deals"
        class="px-8 py-3 rounded-full font-extrabold text-sm bg-yellow-400 text-[#040d1a] hover:bg-yellow-300 hover:-translate-y-0.5 transition-all duration-200 shadow-[0_4px_20px_rgba(255,193,7,0.35)] flex gap-1"
      >
        <ArrowLeft /> View All Deals
      </NuxtLink>
    </div>

    <template v-else>
      <section class="relative overflow-hidden">
        <div class="absolute inset-0"
          style="background:
            radial-gradient(ellipse 80% 60% at 20% 30%, rgba(1,104,167,0.4) 0%, transparent 65%),
            radial-gradient(ellipse 60% 60% at 80% 70%, rgba(1,66,122,0.35) 0%, transparent 60%),
            #040d1a;"
        />
        <div class="absolute inset-0"
          style="background-image: linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px); background-size: 40px 40px;"
        />

        <div class="relative z-10 container mx-auto sm:px-24 px-4 pt-36 pb-16">
          <NuxtLink to="/deals" class="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-8 transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            All Deals
          </NuxtLink>

          <div v-if="isDealLive()" class="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase text-green-400 border border-green-400/30 bg-green-400/10">
            <span class="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Live Deal
          </div>

          <h1 class="text-white leading-none mb-4" style="font-family: 'Bebas Neue', sans-serif; font-size: clamp(3.5rem, 9vw, 7rem); letter-spacing: 0.02em;">
            {{ deal.title }}
          </h1>

          <p class="text-slate-300 text-lg max-w-2xl leading-relaxed mb-6">
            {{ deal.deal_includes }}
          </p>

          <div v-if="deal.start_date" class="inline-flex items-center gap-2 text-sm text-slate-400 bg-white/[0.06] border border-white/[0.08] px-4 py-2 rounded-full">
            <svg class="w-4 h-4 text-yellow-400 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            {{ formatDealDate(deal.start_date) }} → {{ formatDealDate(deal.end_date) }}
          </div>
        </div>

        <div class="absolute bottom-0 left-0 w-full">
          <svg viewBox="0 0 1440 40" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" class="block w-full">
            <path d="M0,20 C360,40 1080,0 1440,20 L1440,40 L0,40 Z" fill="#040d1a"/>
          </svg>
        </div>
      </section>

      <section class="container mx-auto sm:px-24 px-4 py-12">
        <div class="grid lg:grid-cols-3 gap-8">
          <div class="lg:col-span-2 flex flex-col gap-6">
            <div class="rounded-2xl bg-white/[0.04] border border-white/[0.08] p-6 sm:p-8">
              <h2 class="text-xl font-bold text-white mb-5 flex items-center gap-2">
                <span class="w-1 h-5 bg-yellow-400 rounded-full block"></span>
                What's Included
              </h2>
              <p class="text-slate-300 leading-relaxed whitespace-pre-line">{{ deal.deal_includes }}</p>
            </div>

            <div v-if="deal.other_info?.length" class="rounded-2xl bg-white/[0.04] border border-white/[0.08] p-6 sm:p-8">
              <h2 class="text-xl font-bold text-white mb-5 flex items-center gap-2">
                <span class="w-1 h-5 bg-[#0168a7] rounded-full block"></span>
                Highlights
              </h2>
              <div class="grid sm:grid-cols-2 gap-3">
                <div
                  v-for="info in deal.other_info"
                  :key="info"
                  class="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]"
                >
                  <span class="w-6 h-6 rounded-full bg-yellow-400/20 flex items-center justify-center shrink-0">
                    <svg class="w-3.5 h-3.5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
                    </svg>
                  </span>
                  <span class="text-sm text-slate-300">{{ info }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="lg:col-span-1">
            <div class="sticky top-28 rounded-2xl bg-white/[0.06] border border-white/[0.10] p-6 flex flex-col gap-5">
              <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase text-yellow-400 border border-yellow-400/30 bg-yellow-400/10 self-start">
                <span class="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                Flash Sale
              </div>

              <div>
                <p class="text-slate-500 text-xs mb-1">Deal Price</p>
                <div class="text-5xl font-black text-yellow-400" style="font-family: 'Bebas Neue', sans-serif;">
                  {{ format(deal.price) }}
                </div>
              </div>

              <div v-if="deal.end_date" class="rounded-xl bg-[#0168a7]/20 border border-[#0168a7]/30 p-4">
                <p class="text-xs text-slate-400 mb-2 flex items-center gap-1.5">
                  <svg class="w-3.5 h-3.5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span v-if="dealExpired" class="text-red-400">This deal has expired</span>
                  <span v-else>Offer expires {{ formatDealDate(deal.end_date) }}</span>
                </p>
                <div v-if="!dealExpired" class="flex items-center gap-2">
                  <template v-for="(unit, i) in countdown" :key="i">
                    <div class="text-center flex-1 bg-white/[0.05] rounded-lg py-2">
                      <div class="text-yellow-400 font-black text-xl leading-none" style="font-family: 'Bebas Neue', sans-serif;">{{ unit.value }}</div>
                      <div class="text-[0.55rem] text-slate-500 tracking-widest mt-0.5">{{ unit.label }}</div>
                    </div>
                    <span v-if="i < countdown.length - 1" class="text-yellow-400 font-bold">:</span>
                  </template>
                </div>
                <p v-else class="text-xs text-slate-500 mt-1">Contact us to check availability.</p>
              </div>

              <a
                :href="whatsappLink"
                target="_blank"
                rel="noopener"
                class="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#1ebe5d] text-white font-semibold py-3 rounded-xl transition-colors duration-200 text-sm"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Enquire on WhatsApp
              </a>

              <a
                href="tel:+2348000000000"
                class="flex items-center justify-center gap-2 w-full bg-yellow-400 hover:bg-yellow-300 text-[#040d1a] font-extrabold py-3 rounded-xl transition-colors duration-200 text-sm"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
                Call to Book
              </a>

              <p class="text-center text-xs text-slate-500">
                ✓ Secure payment &nbsp;·&nbsp; ✓ Instant confirmation &nbsp;·&nbsp; ✓ 24/7 support
              </p>
            </div>
          </div>
        </div>
      </section>

      <section v-if="otherDeals.length" class="container mx-auto sm:px-24 px-4 pb-24">
        <h2 class="text-2xl font-black text-white mb-6">More Hot Deals</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <NuxtLink
            v-for="other in otherDeals"
            :key="other.id"
            :to="`/deals/${other.id}`"
            class="rounded-2xl overflow-hidden group bg-white/[0.04] border border-white/[0.08] hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)] transition-all duration-300"
          >
            <div class="h-12 bg-gradient-to-br from-[#0168a7]/50 to-[#051020]"></div>
            <div class="p-4">
              <h3 class="text-white font-bold text-lg group-hover:text-yellow-300 transition-colors mb-1 leading-tight">{{ other.title }}</h3>
              <p class="text-slate-400 text-xs mb-3 line-clamp-2">{{ other.deal_includes }}</p>
              <div class="flex items-end justify-between">
                <div class="text-xl font-black text-yellow-400" style="font-family: 'Bebas Neue', sans-serif;">{{ format(other.price) }}</div>
                <span class="text-xs font-bold text-yellow-400">View Deal →</span>
              </div>
            </div>
          </NuxtLink>
        </div>
      </section>
    </template>
  </div>
</template>