<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useCurrency } from '../../composables/useCurrency'
import { useHead } from 'nuxt/app'
import { Plane } from 'lucide-vue-next'

const route = useRoute()
const { format, fetchRates } = useCurrency()

const typeLabelMap: Record<string, string> = {
  flight: 'Flight', hotel: 'Hotel', package: 'Package',
}

interface Deal {
  slug: string
  title: string
  description: string
  longDescription: string
  price: number
  originalPrice?: number
  currency: string
  priceNote: string
  type: 'flight' | 'package' | 'hotel'
  image: string
  tags: string[]
  features: string[]
}

const allDeals: Deal[] = [
  {
    slug: 'dubai-escape', title: 'Dubai Escape',
    description: 'Return flights + 5-star hotel included. Experience the city of gold.',
    longDescription: 'Discover the dazzling city of Dubai with our all-inclusive escape package. Fly in comfort with return economy tickets, stay 5 nights in a luxurious 5-star hotel, enjoy daily breakfast, and receive a private airport transfer on arrival and departure.',
    price: 599, originalPrice: 899, currency: 'USD', priceNote: 'per person, twin share',
    type: 'package',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=80',
    tags: ['5★ Hotel', 'Return Flights', 'Breakfast Included', 'Airport Transfer'],
    features: ['Return economy flights', '5-night stay in 5★ hotel', 'Daily breakfast', 'Private airport transfers', 'City tour included', '24/7 concierge support'],
  },
  {
    slug: 'maldives', title: 'Maldives Paradise',
    description: 'All-inclusive overwater bungalow resort. Pure bliss.',
    longDescription: 'Escape to the Maldives for the ultimate tropical getaway. Stay in a stunning overwater bungalow for 7 nights with full board, unlimited water sports, and sunset cruises. Return seaplane transfers included.',
    price: 1299, originalPrice: 1799, currency: 'USD', priceNote: 'per person, twin share',
    type: 'package',
    image: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=1200&q=80',
    tags: ['Overwater Villa', 'All-Inclusive', 'Seaplane Transfer', '7 Nights'],
    features: ['7 nights overwater bungalow', 'Full board (all meals)', 'Unlimited water sports', 'Sunset cruise', 'Seaplane transfers', 'Snorkelling excursion'],
  },
  {
    slug: 'london-flights', title: 'London Direct',
    description: 'Non-stop return flights to London Heathrow.',
    longDescription: 'Fly non-stop to the heart of London with our best-price direct return tickets. Includes 23 kg checked baggage and in-flight meals on board. Available on selected departure dates — grab your seat before they\'re gone.',
    price: 449, originalPrice: 649, currency: 'USD', priceNote: 'per person, return',
    type: 'flight',
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&q=80',
    tags: ['Direct Flight', '23kg Baggage', 'In-flight Meal'],
    features: ['Non-stop return flights', '23 kg checked baggage', 'In-flight meals', 'Flexible date change', 'Seat selection available'],
  },
  {
    slug: 'istanbul-flights', title: 'Istanbul Express',
    description: 'Budget return flights — explore two continents for less.',
    longDescription: 'Discover the crossroads of Europe and Asia with wallet-friendly return tickets to Istanbul. Includes 20 kg baggage and refreshments on board.',
    price: 310, originalPrice: 490, currency: 'USD', priceNote: 'per person, return',
    type: 'flight',
    image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200&q=80',
    tags: ['Budget Fare', 'Return', '20kg Baggage'],
    features: ['Return economy flights', '20 kg checked baggage', 'In-flight refreshments', 'Online check-in'],
  },
  {
    slug: 'nyc-hotel', title: 'New York City',
    description: '3 nights at a luxury midtown hotel, heart of Manhattan.',
    longDescription: 'Experience the magic of New York with 3 nights in a stunning luxury midtown Manhattan hotel. Walking distance to Central Park, Times Square, and top dining. Includes daily breakfast and a welcome cocktail.',
    price: 799, originalPrice: 1199, currency: 'USD', priceNote: 'per room, 3 nights',
    type: 'hotel',
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1200&q=80',
    tags: ['Luxury Hotel', '3 Nights', 'Breakfast', 'Midtown Manhattan'],
    features: ['3 nights luxury hotel', 'Daily breakfast', 'Welcome cocktail', 'Gym & spa access', 'Concierge service', 'Late checkout available'],
  },
  {
    slug: 'bali-retreat', title: 'Bali Retreat',
    description: '5-night wellness resort stay — yoga, spa & infinity pool.',
    longDescription: 'Recharge at one of Bali\'s most celebrated wellness resorts. Enjoy 5 nights with daily yoga sessions, unlimited spa treatments, a private villa with pool, and twice-daily healthy meals prepared by in-house chefs.',
    price: 850, originalPrice: 1100, currency: 'USD', priceNote: 'per person, twin share',
    type: 'hotel',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&q=80',
    tags: ['Wellness', '5 Nights', 'Spa Included', 'Private Villa'],
    features: ['5 nights private villa', 'Daily yoga & meditation', 'Unlimited spa access', 'Twice-daily healthy meals', 'Infinity pool', 'Airport shuttle'],
  },
  {
    slug: 'paris-romance', title: 'Paris Romance',
    description: 'Couples getaway — boutique hotel near the Eiffel Tower.',
    longDescription: 'Treat your partner to the most romantic city in the world. Stay 4 nights in a charming boutique hotel steps from the Eiffel Tower, enjoy a private Seine river cruise, and indulge in a Michelin-starred dinner for two.',
    price: 980, originalPrice: 1400, currency: 'USD', priceNote: 'per couple, 4 nights',
    type: 'package',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=80',
    tags: ['Couples', '4 Nights', 'River Cruise', 'Fine Dining'],
    features: ['4 nights boutique hotel', 'Private Seine river cruise', 'Michelin-starred dinner', 'Champagne on arrival', 'Eiffel Tower view room', 'Airport transfers'],
  },
]

const slug = computed(() => route.params.slug as string)
const deal = computed<Deal | 'not-found' | null>(() => {
  const found = allDeals.find(d => d.slug === slug.value)
  return found ?? 'not-found'
})

const otherDeals = computed(() =>
  typeof deal.value === 'object' && deal.value !== null
    ? allDeals.filter(d => d.slug !== slug.value).slice(0, 3)
    : []
)

const bookingPath = computed(() => {
  if (typeof deal.value !== 'object' || deal.value === null) return '/deals'
  if (deal.value.type === 'flight') return `/travel/flights?deal=${deal.value.slug}`
  if (deal.value.type === 'hotel')  return `/travel/hotels?deal=${deal.value.slug}`
  return `/services/vacation-packages?deal=${deal.value.slug}`
})

const endTime = new Date()
endTime.setHours(endTime.getHours() + 11, endTime.getMinutes() + 47, endTime.getSeconds() + 32)
const countdown = ref([
  { label: 'HRS', value: '11' },
  { label: 'MIN', value: '47' },
  { label: 'SEC', value: '32' },
])
let timer: ReturnType<typeof setInterval> | null = null
const tick = () => {
  const diff = Math.max(0, endTime.getTime() - Date.now())
  countdown.value = [
    { label: 'HRS', value: String(Math.floor(diff / 3_600_000)).padStart(2, '0') },
    { label: 'MIN', value: String(Math.floor((diff % 3_600_000) / 60_000)).padStart(2, '0') },
    { label: 'SEC', value: String(Math.floor((diff % 60_000) / 1_000)).padStart(2, '0') },
  ]
}
onMounted(() => { fetchRates(); tick(); timer = setInterval(tick, 1_000) })
onUnmounted(() => { if (timer) clearInterval(timer) })

const dealTitle = computed(() =>
  typeof deal.value === 'object' && deal.value ? `${deal.value.title} — Incel Tourism` : 'Deal Not Found'
)

useHead({
  title: dealTitle,
  link: [{ rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap' }],
})
</script>

<template>
  <div class="min-h-screen bg-[#040d1a]">
    <div v-if="!deal" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div class="w-12 h-12 border-4 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin mx-auto mb-4" />
        <p class="text-slate-400 text-sm">Loading deal...</p>
      </div>
    </div>

    <div v-else-if="deal === 'not-found'" class="flex flex-col items-center justify-center min-h-screen gap-6 px-4 text-center">
      <div class="text-yellow-400"><Plane class="w-16 h-16" /></div>
      <h1 class="text-4xl font-black text-white">Deal Not Found</h1>
      <p class="text-slate-400 max-w-sm">This deal may have expired or the link is incorrect.</p>
      <NuxtLink
        to="/deals"
        class="px-8 py-3 rounded-full font-extrabold text-sm bg-yellow-400 text-[#040d1a] hover:bg-yellow-300 hover:-translate-y-0.5 transition-all duration-200 shadow-[0_4px_20px_rgba(255,193,7,0.35)]"
      >
        ← View All Deals
      </NuxtLink>
    </div>

    <template v-else>
      <section class="relative overflow-hidden py-28 px-6 text-center bg-cover bg-center bg-no-repeat">
        <div
          class="absolute inset-0 bg-cover bg-center transition-transform duration-[8s] scale-105"
          :style="{ backgroundImage: `url(${deal.image})` }"
        />
        <div class="absolute inset-0"
          style="background: linear-gradient(to top, rgba(4,13,26,1) 0%, rgba(4,13,26,0.55) 45%, rgba(4,13,26,0.25) 100%);"
        />

        <div class="relative z-10 container mx-auto sm:px-24 px-4 pb-14 pt-16 text-center">
          <span class="inline-block mb-4 text-[0.7rem] font-bold tracking-widest uppercase px-3 py-1 rounded-full bg-[#0168a7]/70 text-blue-100 backdrop-blur-sm">
            {{ typeLabelMap[deal.type] }}
          </span>
          <h1 class="text-5xl sm:text-7xl font-black text-white mb-3 leading-none" style="font-family: 'Bebas Neue', sans-serif; letter-spacing: 0.02em;">
            {{ deal.title }}
          </h1>
          <p class="text-slate-300 text-lg">{{ deal.description }}</p>
        </div>
      </section>

      <section class="container mx-auto sm:px-24 px-4 py-12">
        <div class="grid lg:grid-cols-3 gap-8">
          <div class="lg:col-span-2 flex flex-col gap-8">
            <div class="rounded-2xl bg-white/[0.04] border border-white/[0.08] p-6 sm:p-8">
              <h2 class="text-xl font-bold text-black dark:text-white mb-4">About This Deal</h2>
              <p class="text-slate-700 leading-relaxed">{{ deal.longDescription }}</p>
            </div>
            <div class="rounded-2xl bg-white/[0.04] border border-white/[0.08] p-6 sm:p-8">
              <h2 class="text-xl font-bold text-black dark:text-white mb-5">What's Included</h2>
              <div class="grid sm:grid-cols-2 gap-3">
                <div
                  v-for="feature in deal.features"
                  :key="feature"
                  class="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]"
                >
                  <span class="w-6 h-6 rounded-full bg-yellow-400/20 flex items-center justify-center shrink-0">
                    <svg class="w-3.5 h-3.5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
                    </svg>
                  </span>
                  <span class="text-sm text-slate-700">{{ feature }}</span>
                </div>
              </div>
            </div>

            <div class="flex flex-wrap gap-2">
              <span
                v-for="tag in deal.tags"
                :key="tag"
                class="text-sm px-4 py-1.5 rounded-full bg-white/[0.06] text-slate-700 border border-white/10"
              >
                {{ tag }}
              </span>
            </div>
          </div>

          <div class="lg:col-span-1">
            <div class="sticky top-28 rounded-2xl bg-white/[0.06] border border-white/[0.10] p-6 flex flex-col gap-5">
              <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase text-yellow-400 border border-yellow-400/30 bg-yellow-400/10 self-start">
                <span class="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                Flash Sale
              </div>

              <div>
                <div v-if="deal.originalPrice" class="flex items-center gap-2 mb-1">
                  <span class="line-through text-slate-700 text-sm">{{ format(deal.originalPrice, deal.currency) }}</span>
                  <span class="text-xs font-extrabold px-2 py-0.5 rounded-full bg-yellow-400 text-[#040d1a]">
                    -{{ Math.round((1 - deal.price / deal.originalPrice) * 100) }}%
                  </span>
                </div>
                <div class="text-5xl font-black text-yellow-400" style="font-family: 'Bebas Neue', sans-serif;">
                  {{ format(deal.price, deal.currency) }}
                </div>
                <div class="text-slate-700 text-xs mt-1">{{ deal.priceNote }}</div>
              </div>

              <div class="rounded-xl bg-[#0168a7]/20 border border-[#0168a7]/30 p-4">
                <p class="text-xs text-slate-400 mb-2 flex items-center gap-1.5">
                  <svg class="w-3.5 h-3.5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  Offer expires in
                </p>
                <div class="flex items-center gap-2">
                  <template v-for="(unit, i) in countdown" :key="i">
                    <div class="text-center flex-1 bg-white/[0.05] rounded-lg py-2">
                      <div class="text-yellow-400 font-black text-xl leading-none" style="font-family: 'Bebas Neue', sans-serif;">{{ unit.value }}</div>
                      <div class="text-[0.55rem] text-slate-500 tracking-widest mt-0.5">{{ unit.label }}</div>
                    </div>
                    <span v-if="i < countdown.length - 1" class="text-yellow-400 font-bold">:</span>
                  </template>
                </div>
              </div>

              <NuxtLink
                :to="bookingPath"
                class="w-full text-center px-8 py-4 rounded-full font-extrabold text-base bg-yellow-400 text-[#040d1a] shadow-[0_4px_20px_rgba(255,193,7,0.4)] hover:bg-yellow-300 hover:shadow-[0_6px_28px_rgba(255,193,7,0.6)] hover:-translate-y-0.5 transition-all duration-200 block"
              >
                Book This Deal →
              </NuxtLink>

              <p class="text-center text-xs text-slate-500">
                ✓ Secure payment &nbsp;·&nbsp; ✓ Instant confirmation &nbsp;·&nbsp; ✓ 24/7 support
              </p>
            </div>
          </div>
        </div>
      </section>

      <section class="container mx-auto sm:px-24 px-4 pb-24">
        <h2 class="text-2xl font-black text-black dark:text-white mb-6">More Hot Deals</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <NuxtLink
            v-for="other in otherDeals"
            :key="other.slug"
            :to="`/deals/${other.slug}`"
            class="rounded-2xl overflow-hidden group bg-white/[0.04] border border-white/[0.08] hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)] transition-all duration-300"
          >
            <div class="relative overflow-hidden h-44">
              <div
                class="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                :style="{ backgroundImage: `url(${other.image})` }"
              />
              <div class="absolute inset-0" style="background: linear-gradient(to top, rgba(4,13,26,0.7) 0%, transparent 60%);" />
              <div v-if="other.originalPrice"
                class="absolute top-3 right-3 text-[0.7rem] font-extrabold px-2.5 py-0.5 rounded-full bg-yellow-400 text-[#040d1a]">
                -{{ Math.round((1 - other.price / other.originalPrice) * 100) }}%
              </div>
            </div>
            <div class="p-4 bg-[#040d1a]/60">
              <h3 class="text-black dark:text-white font-bold text-lg group-hover:text-yellow-300 transition-colors">{{ other.title }}</h3>
              <p class="text-slate-400 text-xs mt-1 mb-3">{{ other.description }}</p>
              <div class="flex items-end justify-between">
                <div>
                  <div v-if="other.originalPrice" class="line-through text-slate-500 text-xs">{{ format(other.originalPrice, other.currency) }}</div>
                  <div class="text-xl font-black text-yellow-400">{{ format(other.price, other.currency) }}</div>
                </div>
                <span class="text-xs font-bold text-yellow-400">View Deal →</span>
              </div>
            </div>
          </NuxtLink>
        </div>
      </section>
    </template>
  </div>
</template>
