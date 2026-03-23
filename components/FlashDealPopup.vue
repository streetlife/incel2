<template>
  <Teleport to="body">
    <Transition name="popup">
      <div
        v-if="visible && latestDeal"
        class="fixed inset-0 z-[999] flex items-center justify-center px-4"
        @click.self="close"
      >
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="close" />

        <div class="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl">
          <div
            class="relative px-8 pt-8 pb-10 text-white overflow-hidden"
            style="background: linear-gradient(135deg, #0168a7 0%, #01427a 100%)"
          >
            <span class="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
            <span class="absolute -bottom-12 -left-10 w-52 h-52 rounded-full bg-white/5 pointer-events-none" />

            <div class="inline-flex items-center gap-2 bg-yellow-400 text-neutral-900 text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wider shadow">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13 2L4.09 12.97H11L10 22l8.91-10.97H13L13 2z"/>
              </svg>
              Flash Deal
            </div>

            <h2 class="text-2xl font-extrabold leading-tight mb-1 relative z-10">
              {{ latestDeal.title }}
            </h2>
            <p class="text-blue-200 text-sm relative z-10 leading-relaxed">
              {{ latestDeal.deal_includes }}
            </p>

            <div class="mt-5 inline-flex items-baseline gap-2 relative z-10">
              <span class="text-4xl font-black text-yellow-400">
                {{ format(latestDeal.price) }}
              </span>
              <span class="text-blue-300 text-sm font-medium">per person</span>
            </div>
          </div>

          <div class="px-8 py-6 space-y-4">
            <div class="flex items-center gap-3 text-sm text-gray-600">
              <span class="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 shrink-0">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
              </span>
              <span>
                Valid <strong class="text-gray-800">{{ formatDealDate(latestDeal.start_date) }}</strong>
                &nbsp;–&nbsp;
                <strong class="text-gray-800">{{ formatDealDate(latestDeal.end_date) }}</strong>
              </span>
            </div>

            <div v-if="timeLeft" class="flex items-center gap-3 text-sm">
              <span class="flex items-center justify-center w-8 h-8 rounded-full bg-red-50 text-red-500 shrink-0">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </span>
              <span class="text-gray-600">Expires in&nbsp;
                <strong class="text-red-500 tabular-nums">{{ timeLeft }}</strong>
              </span>
            </div>

            <button
              @click="goToDeal"
              class="w-full mt-2 py-3.5 rounded-2xl font-bold text-neutral-900 bg-yellow-400 hover:bg-yellow-500 transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 text-base"
            >
              Grab This Deal →
            </button>

            <button
              @click="close"
              class="w-full py-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              No thanks, maybe later
            </button>
          </div>

          <button
            @click="close"
            class="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
            aria-label="Close"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { navigateTo } from 'nuxt/app'
import { useHotDealsStore } from '../stores/hotdeal'
import { useCurrency } from '../composables/useCurrency'

const SESSION_KEY = 'flash_deal_dismissed'
const SHOW_DELAY_MS = 2500
const DAYS_UNTIL_RESHOWN = 0 // set to e.g. 1 to re-show after 1 day

const hotDealsStore = useHotDealsStore()
const { format } = useCurrency()

const visible = ref(false)
let timer: ReturnType<typeof setTimeout> | null = null

const latestDeal = computed(() => hotDealsStore.activeDeals?.[0] ?? null)

function formatDealDate(dateStr: string) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

const timeLeft = ref('')
let countdownInterval: ReturnType<typeof setInterval> | null = null

function startCountdown() {
  if (!latestDeal.value?.end_date) return
  const end = new Date(latestDeal.value.end_date).getTime()

  const tick = () => {
    const diff = end - Date.now()
    if (diff <= 0) { timeLeft.value = 'Expired'; return }
    const d = Math.floor(diff / 86_400_000)
    const h = Math.floor((diff % 86_400_000) / 3_600_000)
    const m = Math.floor((diff % 3_600_000) / 60_000)
    const s = Math.floor((diff % 60_000) / 1_000)
    timeLeft.value = d > 0
      ? `${d}d ${h}h ${m}m`
      : `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
  }

  tick()
  countdownInterval = setInterval(tick, 1000)
}

function hasDismissedRecently(): boolean {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return false
    if (DAYS_UNTIL_RESHOWN === 0) return true // session-only dismiss
    const ts = Number.parseInt(raw, 10)
    return Date.now() - ts < DAYS_UNTIL_RESHOWN * 86_400_000
  } catch { return false }
}

function markDismissed() {
  try { sessionStorage.setItem(SESSION_KEY, String(Date.now())) } catch { /* noop */ }
}

function close() {
  visible.value = false
  markDismissed()
  if (countdownInterval) clearInterval(countdownInterval)
}

function goToDeal() {
  close()
  if (latestDeal.value) navigateTo(`/deals/${latestDeal.value.id}`)
}

onMounted(async () => {
  if (hasDismissedRecently()) return

  // Ensure deals are loaded
  if (!hotDealsStore.activeDeals?.length) {
    await hotDealsStore.fetchDeals()
  }

  if (!latestDeal.value) return

  timer = setTimeout(() => {
    visible.value = true
    startCountdown()
  }, SHOW_DELAY_MS)
})

onUnmounted(() => {
  if (timer) clearTimeout(timer)
  if (countdownInterval) clearInterval(countdownInterval)
})
</script>

<style scoped>
.popup-enter-active {
  transition: opacity 0.35s ease, transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.popup-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.popup-enter-from,
.popup-leave-to {
  opacity: 0;
  transform: scale(0.88) translateY(16px);
}
</style>
