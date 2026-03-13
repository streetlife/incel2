<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useHead } from 'nuxt/app'
import { useCurrency } from '../../composables/useCurrency'

const { format, fetchRates } = useCurrency()

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
  featured?: boolean
}

const filterTabs = [
  { label: 'All Deals', value: 'all' },
  { label: 'Flights',   value: 'flight' },
  { label: 'Hotels',    value: 'hotel' },
  { label: 'Packages',  value: 'package' },
]
const activeFilter = ref('all')
const typeLabelMap: Record<string, string> = {
  flight: 'Flight', hotel: 'Hotel', package: 'Package',
}

const allDeals = ref<Deal[]>([
  {
    slug: 'dubai-escape', title: 'Dubai Escape',
    description: 'Return flights + 5-star hotel included. Experience the city of gold.',
    longDescription: 'Discover the dazzling city of Dubai with our all-inclusive escape package. Fly in comfort with return economy tickets, stay 5 nights in a luxurious 5-star hotel, enjoy daily breakfast, and receive a private airport transfer on arrival and departure.',
    price: 599, originalPrice: 899, currency: 'USD', priceNote: 'per person, twin share',
    type: 'package',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=900&q=80',
    tags: ['5★ Hotel', 'Return Flights', 'Breakfast Included', 'Airport Transfer'],
    features: ['Return economy flights', '5-night stay in 5★ hotel', 'Daily breakfast', 'Private airport transfers', 'City tour included', '24/7 concierge support'],
    featured: true,
  },
  {
    slug: 'maldives', title: 'Maldives Paradise',
    description: 'All-inclusive overwater bungalow resort. Pure bliss.',
    longDescription: 'Escape to the Maldives for the ultimate tropical getaway. Stay in a stunning overwater bungalow for 7 nights with full board, unlimited water sports, and sunset cruises. Return seaplane transfers included.',
    price: 1299, originalPrice: 1799, currency: 'USD', priceNote: 'per person, twin share',
    type: 'package',
    image: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=900&q=80',
    tags: ['Overwater Villa', 'All-Inclusive', 'Seaplane Transfer', '7 Nights'],
    features: ['7 nights overwater bungalow', 'Full board (all meals)', 'Unlimited water sports', 'Sunset cruise', 'Seaplane transfers', 'Snorkelling excursion'],
    featured: true,
  },
  {
    slug: 'london-flights', title: 'London Direct',
    description: 'Non-stop return flights to London Heathrow.',
    longDescription: 'Fly non-stop to the heart of London with our best-price direct return tickets. Includes 23 kg checked baggage and in-flight meals. Available on selected departure dates.',
    price: 449, originalPrice: 649, currency: 'USD', priceNote: 'per person, return',
    type: 'flight',
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=900&q=80',
    tags: ['Direct Flight', '23kg Baggage', 'In-flight Meal'],
    features: ['Non-stop return flights', '23 kg checked baggage', 'In-flight meals', 'Flexible date change', 'Seat selection available'],
  },
  {
    slug: 'istanbul-flights', title: 'Istanbul Express',
    description: 'Budget return flights — explore two continents for less.',
    longDescription: 'Discover the crossroads of Europe and Asia with wallet-friendly return tickets to Istanbul. Includes 20 kg baggage and refreshments on board.',
    price: 310, originalPrice: 490, currency: 'USD', priceNote: 'per person, return',
    type: 'flight',
    image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=900&q=80',
    tags: ['Budget Fare', 'Return', '20kg Baggage'],
    features: ['Return economy flights', '20 kg checked baggage', 'In-flight refreshments', 'Online check-in'],
  },
  {
    slug: 'nyc-hotel', title: 'New York City',
    description: '3 nights at a luxury midtown hotel, heart of Manhattan.',
    longDescription: 'Experience the magic of New York with 3 nights in a stunning luxury midtown Manhattan hotel. Walking distance to Central Park, Times Square, and top dining. Includes daily breakfast and a welcome cocktail.',
    price: 799, originalPrice: 1199, currency: 'USD', priceNote: 'per room, 3 nights',
    type: 'hotel',
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=900&q=80',
    tags: ['Luxury Hotel', '3 Nights', 'Breakfast', 'Midtown Manhattan'],
    features: ['3 nights luxury hotel', 'Daily breakfast', 'Welcome cocktail', 'Gym & spa access', 'Concierge service', 'Late checkout available'],
  },
  {
    slug: 'bali-retreat', title: 'Bali Retreat',
    description: '5-night wellness resort stay — yoga, spa & infinity pool.',
    longDescription: 'Recharge at one of Bali\'s most celebrated wellness resorts. Enjoy 5 nights with daily yoga sessions, unlimited spa treatments, a private villa with pool, and twice-daily healthy meals.',
    price: 850, originalPrice: 1100, currency: 'USD', priceNote: 'per person, twin share',
    type: 'hotel',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=900&q=80',
    tags: ['Wellness', '5 Nights', 'Spa Included', 'Private Villa'],
    features: ['5 nights private villa', 'Daily yoga & meditation', 'Unlimited spa access', 'Twice-daily healthy meals', 'Infinity pool', 'Airport shuttle'],
  },
  {
    slug: 'paris-romance', title: 'Paris Romance',
    description: 'Couples getaway — boutique hotel near the Eiffel Tower.',
    longDescription: 'Treat your partner to the most romantic city in the world. Stay 4 nights in a charming boutique hotel steps from the Eiffel Tower, enjoy a private Seine river cruise, and indulge in a Michelin-starred dinner for two.',
    price: 980, originalPrice: 1400, currency: 'USD', priceNote: 'per couple, 4 nights',
    type: 'package',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=900&q=80',
    tags: ['Couples', '4 Nights', 'River Cruise', 'Fine Dining'],
    features: ['4 nights boutique hotel', 'Private Seine river cruise', 'Michelin-starred dinner', 'Champagne on arrival', 'Eiffel Tower view room', 'Airport transfers'],
  },
])

const featuredDeals = computed(() => allDeals.value.filter(d => d.featured))
const regularDeals  = computed(() => allDeals.value.filter(d => !d.featured))
const visibleCount  = computed(() => allDeals.value.filter(d => d.type === activeFilter.value || activeFilter.value === 'all').length)

const selectedDeal = ref<Deal | null>(null)
const openDeal     = (deal: Deal) => { selectedDeal.value = deal }
const bookingPath  = (deal: Deal) => {
  if (deal.type === 'flight') return `/travel/flights?deal=${deal.slug}`
  if (deal.type === 'hotel')  return `/travel/hotels?deal=${deal.slug}`
  return `/services/vacation-packages?deal=${deal.slug}`
}

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

useHead({
  title: 'Hot Deals — Incel Tourism',
  meta: [{ name: 'description', content: 'Exclusive travel deals on flights, hotels and packages.' }],
  link: [{ rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap' }],
})
</script>

<template>
  <div class="min-h-screen bg-[#040d1a] font-sans">
    <section class="relative min-h-[520px] flex flex-col justify-end overflow-hidden">
      <div class="absolute inset-0 z-0"
        style="background:
          radial-gradient(ellipse 80% 60% at 10% 20%, rgba(1,104,167,0.45) 0%, transparent 70%),
          radial-gradient(ellipse 60% 80% at 90% 80%, rgba(1,66,122,0.4) 0%, transparent 60%),
          radial-gradient(ellipse 40% 40% at 50% 50%, rgba(255,193,7,0.06) 0%, transparent 70%),
          #040d1a;"
      />
      <div class="absolute inset-0 z-0"
        style="background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px); background-size: 40px 40px;"
      />

      <div class="relative z-10 container mx-auto sm:px-24 px-4 pt-36 pb-24 flex flex-col items-start gap-6">
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase text-yellow-400 border border-yellow-400/30 bg-yellow-400/10">
          <span class="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
          Limited-Time Offers
        </div>

        <h1 class="leading-none text-white" style="font-family: 'Bebas Neue', sans-serif; font-size: clamp(5rem, 14vw, 10rem); line-height: 0.9; letter-spacing: 0.02em;">
          <span class="block">Hot</span>
          <span class="block" style="-webkit-text-stroke: 2px #ffc107; color: transparent;">Deals</span>
        </h1>

        <p class="text-lg text-slate-300 max-w-lg leading-relaxed">
          Exclusive fares and packages curated for you — flights, hotels, and all-inclusive escapes at prices that won't last long.
        </p>

        <div class="flex flex-wrap gap-2 mt-2">
          <button
            v-for="tab in filterTabs"
            :key="tab.value"
            @click="activeFilter = tab.value"
            :class="[
              'px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300',
              activeFilter === tab.value
                ? 'bg-yellow-400 text-[#040d1a] shadow-[0_0_20px_rgba(255,193,7,0.4)]'
                : 'bg-white/[0.07] text-slate-400 border border-white/10 hover:bg-white/[0.12] hover:text-white'
            ]"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>

      <div class="absolute bottom-0 left-0 w-full z-10">
        <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" class="block w-full">
          <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill="#040d1a"/>
        </svg>
      </div>
    </section>

    <div class="container mx-auto sm:px-24 px-4 -mt-2 mb-10">
      <div class="rounded-2xl px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border border-[#0168a7]/40 bg-[#0168a7]/20">
        <div class="flex items-center gap-3">
          <svg class="w-5 h-5 text-yellow-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span class="text-white text-sm font-medium">Flash sale ends in:</span>
        </div>

        <div class="flex items-center gap-3">
          <template v-for="(unit, i) in countdown" :key="i">
            <div class="text-center">
              <div class="text-yellow-400 min-w-[2.5rem] text-center leading-none" style="font-family: 'Bebas Neue', sans-serif; font-size: 2rem;">
                {{ unit.value }}
              </div>
              <div class="text-[0.6rem] text-slate-500 tracking-widest text-center mt-0.5">{{ unit.label }}</div>
            </div>
            <span v-if="i < countdown.length - 1" class="text-yellow-400 font-bold text-xl">:</span>
          </template>
        </div>

        <div class="text-sm text-slate-400">Book now · Pay securely · Instant confirmation</div>
      </div>
    </div>

    <section class="container mx-auto sm:px-24 px-4 pb-24">
      <div class="mb-8 flex flex-col gap-6">
        <div
          v-for="deal in featuredDeals"
          :key="deal.slug"
          v-show="deal.type === activeFilter || activeFilter === 'all'"
          class="relative rounded-3xl overflow-hidden cursor-pointer group min-h-[340px] flex flex-col justify-end"
          @click="openDeal(deal)"
        >
          <div
            class="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            :style="{ backgroundImage: `url(${deal.image})` }"
          />
          <div class="absolute inset-0"
            style="background: linear-gradient(to top, rgba(4,13,26,0.92) 0%, rgba(4,13,26,0.4) 50%, transparent 100%);"
          />
          <div class="relative z-10 p-8 sm:p-12 flex flex-wrap items-end justify-between gap-6">
            <div>
              <span class="inline-block mb-3 text-[0.7rem] font-bold tracking-widest uppercase px-3 py-1 rounded-full bg-[#0168a7]/70 text-blue-100 backdrop-blur-sm">
                {{ typeLabelMap[deal.type] }}
              </span>
              <h2 class="text-3xl sm:text-4xl font-black text-white mb-2 group-hover:text-yellow-300 transition-colors">
                {{ deal.title }}
              </h2>
              <p class="text-slate-300 text-base max-w-md">{{ deal.description }}</p>
              <div class="flex flex-wrap gap-2 mt-4">
                <span v-for="tag in deal.tags" :key="tag"
                  class="text-[0.7rem] px-3 py-0.5 rounded-full bg-white/[0.08] text-slate-400 border border-white/10">
                  {{ tag }}
                </span>
              </div>
            </div>
            <div class="text-right shrink-0">
              <div v-if="deal.originalPrice" class="line-through text-slate-400 text-sm mb-1">
                Was {{ format(deal.originalPrice, deal.currency) }}
              </div>
              <div class="text-4xl font-black text-yellow-400">{{ format(deal.price, deal.currency) }}</div>
              <div class="text-slate-300 text-xs mt-1">{{ deal.priceNote }}</div>
              <button class="mt-4 px-8 py-3 rounded-full font-extrabold text-sm bg-yellow-400 text-[#040d1a] shadow-[0_4px_20px_rgba(255,193,7,0.35)] hover:bg-yellow-300 hover:shadow-[0_6px_28px_rgba(255,193,7,0.5)] hover:-translate-y-0.5 transition-all duration-200">
                Book Now →
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="deal in regularDeals"
          :key="deal.slug"
          v-show="deal.type === activeFilter || activeFilter === 'all'"
          class="rounded-2xl overflow-hidden cursor-pointer group bg-white/[0.04] border border-white/[0.08] hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)] transition-all duration-300"
          @click="openDeal(deal)"
        >
          <div class="relative overflow-hidden h-52">
            <div
              class="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
              :style="{ backgroundImage: `url(${deal.image})` }"
            />
            <div class="absolute inset-0" style="background: linear-gradient(to top, rgba(4,13,26,0.7) 0%, transparent 60%);" />
            <span class="absolute top-4 left-4 text-[0.7rem] font-bold tracking-widest uppercase px-3 py-1 rounded-full bg-[#0168a7]/70 text-blue-100 backdrop-blur-sm">
              {{ typeLabelMap[deal.type] }}
            </span>
            <div v-if="deal.originalPrice"
              class="absolute top-4 right-4 text-[0.75rem] font-extrabold px-3 py-1 rounded-full bg-yellow-400 text-[#040d1a]">
              -{{ Math.round((1 - deal.price / deal.originalPrice) * 100) }}%
            </div>
          </div>

          <div class="p-5 bg-[#040d1a]/60">
            <h3 class="text-white font-bold text-xl mb-1 group-hover:text-yellow-300 transition-colors">{{ deal.title }}</h3>
            <p class="text-slate-400 text-sm mb-4 leading-relaxed">{{ deal.description }}</p>
            <div class="flex flex-wrap gap-2 mb-4">
              <span v-for="tag in deal.tags" :key="tag"
                class="text-[0.7rem] px-3 py-0.5 rounded-full bg-white/[0.08] text-slate-400 border border-white/10">
                {{ tag }}
              </span>
            </div>
            <div class="flex items-end justify-between">
              <div>
                <div v-if="deal.originalPrice" class="line-through text-slate-500 text-xs">
                  {{ format(deal.originalPrice, deal.currency) }}
                </div>
                <div class="text-2xl font-black text-yellow-400">{{ format(deal.price, deal.currency) }}</div>
                <div class="text-slate-500 text-xs">{{ deal.priceNote }}</div>
              </div>
              <button class="px-5 py-2.5 rounded-full font-extrabold text-sm bg-yellow-400 text-[#040d1a] shadow-[0_4px_20px_rgba(255,193,7,0.3)] hover:bg-yellow-300 hover:shadow-[0_6px_28px_rgba(255,193,7,0.5)] hover:-translate-y-0.5 transition-all duration-200">
                Book →
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="visibleCount === 0" class="text-center py-24">
        <div class="text-6xl mb-4">✈️</div>
        <p class="text-slate-400 text-lg">No deals in this category right now.</p>
      </div>
    </section>

    <Transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-300"
      leave-to-class="opacity-0"
    >
      <div
        v-if="selectedDeal"
        class="fixed inset-0 z-[200] flex items-center justify-center p-4"
      >
        <div class="absolute inset-0 bg-[#040d1a]/85 backdrop-blur-md" @click="selectedDeal = null" />

        <div class="relative z-10 w-full max-w-2xl rounded-3xl overflow-hidden bg-[#0a1628] border border-white/10 shadow-2xl">
          <div
            class="relative h-64 bg-cover bg-center"
            :style="{ backgroundImage: `url(${selectedDeal.image})` }"
          >
            <div class="absolute inset-0" style="background: linear-gradient(to top, rgba(10,22,40,0.95) 0%, rgba(4,13,26,0.3) 100%);" />
            <button
              @click="selectedDeal = null"
              class="absolute top-4 right-4 z-10 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 transition-all"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
            <div class="absolute bottom-6 left-6 z-10">
              <span class="inline-block mb-2 text-[0.7rem] font-bold tracking-widest uppercase px-3 py-1 rounded-full bg-[#0168a7]/70 text-blue-100 backdrop-blur-sm">
                {{ typeLabelMap[selectedDeal.type] }}
              </span>
              <h2 class="text-3xl font-black text-white">{{ selectedDeal.title }}</h2>
            </div>
          </div>

          <div class="p-8">
            <p class="text-slate-300 mb-6 leading-relaxed">{{ selectedDeal.longDescription }}</p>

            <div class="grid grid-cols-2 gap-3 mb-6">
              <div
                v-for="feature in selectedDeal.features"
                :key="feature"
                class="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/[0.07]"
              >
                <svg class="w-4 h-4 text-yellow-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
                </svg>
                <span class="text-sm text-slate-300">{{ feature }}</span>
              </div>
            </div>

            <div class="flex items-end justify-between">
              <div>
                <div v-if="selectedDeal.originalPrice" class="line-through text-slate-500 text-sm">
                  {{ format(selectedDeal.originalPrice, selectedDeal.currency) }}
                </div>
                <div class="text-4xl font-black text-yellow-400">{{ format(selectedDeal.price, selectedDeal.currency) }}</div>
                <div class="text-slate-500 text-xs mt-0.5">{{ selectedDeal.priceNote }}</div>
              </div>
              <NuxtLink
                :to="bookingPath(selectedDeal)"
                class="inline-block px-8 py-3 rounded-full font-extrabold text-base bg-yellow-400 text-[#040d1a] shadow-[0_4px_20px_rgba(255,193,7,0.35)] hover:bg-yellow-300 hover:shadow-[0_6px_28px_rgba(255,193,7,0.5)] hover:-translate-y-0.5 transition-all duration-200"
                @click="selectedDeal = null"
              >
                Proceed to Booking →
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>
