<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import HotelsForm from '../../../components/forms/HotelsForm.vue'
import Pagination from '../../../components/Pagination.vue'
import { useHotelService } from '../../../services/hotel.service'
import type { HotelSearchParams, RoomConfig } from '../../../types/hotel'
import { useCurrency } from '../../../composables/useCurrency'
import { useHotelSearchStore } from '../../../stores/hotel'

const route = useRoute()
const router = useRouter()
const { searchHotel } = useHotelService()
const store  = useHotelSearchStore()
const { format } = useCurrency()

const ITEMS_PER_PAGE = 25

const isLoading = ref(false)
const searchError = ref('')
const showSearchForm = ref(true)

const paginatedResults = computed(() => {
  const start = (store.currentPage - 1) * ITEMS_PER_PAGE
  return store.sortedResults.slice(start, start + ITEMS_PER_PAGE)
})

const popularDestinations = [
  { city: 'Dubai', image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800', price: 'From $120/night' },
  { city: 'London', image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', price: 'From $150/night' },
  { city: 'Paris', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800', price: 'From $160/night' },
  { city: 'New York', image: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800', price: 'From $200/night' },
  { city: 'Istanbul', image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800', price: 'From $90/night'  },
  { city: 'Cape Town', image: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800', price: 'From $80/night' },
]

const benefits = [
  { icon: '✓', title: 'Best Price Guarantee', description: 'We offer competitive prices on all hotel bookings' },
  { icon: '✓', title: '24/7 Support', description: 'Our team is available round the clock to assist you' },
  { icon: '✓', title: 'Free Cancellation', description: 'Cancel up to 24 hours before check-in on most hotels' },
  { icon: '✓', title: 'Verified Reviews', description: 'Read authentic reviews from real travelers' },
]

const sortOptions = [
  { key: 'price_asc', label: 'Price ↑' },
  { key: 'price_desc', label: 'Price ↓' },
  { key: 'rating', label: 'Stars' },
]

function buildRoomsFromQuery(): RoomConfig[] {
  const roomCount = Number.parseInt(route.query.rooms as string) || 1
  return Array.from({ length: roomCount }, (_, i) => {
    const children = Number.parseInt(route.query[`r${i}_children`] as string) || 0
    const rawAges  = route.query[`r${i}_child_ages`] as string | undefined
    const childAges = rawAges
      ? rawAges.split(',').map(Number).filter(n => !Number.isNaN(n)).slice(0, children)
      : new Array(children).fill(2)

    while (childAges.length < children) childAges.push(2)
    return {
      adults: Number.parseInt(route.query[`r${i}_adults`] as string) || 1,
      children,
      childAges,
    }
  })
}

const isSearchView = computed(() => store.hasSearched || isLoading.value)

const performSearch = async (params?: HotelSearchParams) => {
  isLoading.value = true
  searchError.value = ''

  store.hasSearched = true

  const sp: HotelSearchParams = params ?? {
    country: (route.query.country as string) || '',
    city: (route.query.city as string) || '',
    nationality: (route.query.nationality as string) || '',
    checkInStart: (route.query.checkInStart as string) || '',
    checkInEnd: (route.query.checkInEnd as string) || '',
    rooms: buildRoomsFromQuery(),
    totalGuests: Number.parseInt(route.query.totalGuests as string) || 1,
    totalRooms: Number.parseInt(route.query.rooms as string) || 1,
  }

  if (
    store.hasSearched &&
    !params &&
    store.lastParams?.city === sp.city &&
    store.lastParams?.checkInStart === sp.checkInStart &&
    store.lastParams?.checkInEnd === sp.checkInEnd
  ) {
    showSearchForm.value = false
    isLoading.value = false
    return
  }

  try {
    if (!sp.city) {
      searchError.value = `We don't have a city code for "${sp.city}" yet. Please contact support or try another city.`
      isLoading.value = false
      return
    }

    const result = await searchHotel(sp)

    store.setResults(
      result.hotels,
      result.search_meta,
      result.filters,
      result.session_code,
      sp,
    )

    sessionStorage.setItem('hotelSessionCode', result.session_code)

    showSearchForm.value = false
    setTimeout(
      () => document.getElementById('search-results')?.scrollIntoView({ behavior: 'smooth' }),
      100,
    )
  } catch (err: any) {
    searchError.value = err?.message ?? 'An unexpected error occurred. Please try again.'
  } finally {
    isLoading.value = false
  }
}

function viewHotelDetails(hotel: any) {
  sessionStorage.setItem(
    'selectedHotel',
    JSON.stringify({
      hotel,
      sessionCode: store.sessionCode,
      searchParams: {
        country: store.lastParams?.country || (route.query.country as string) || '',
        city: store.lastParams?.city || (route.query.city as string) || hotel.city,
        nationality: store.lastParams?.nationality || (route.query.nationality as string) || '',
        checkInStart: store.searchMeta?.arrival_date || (route.query.checkInStart as string),
        checkInEnd: store.searchMeta?.departure_date || (route.query.checkInEnd as string),
        rooms: store.lastParams?.rooms ?? buildRoomsFromQuery(),
        totalGuests: (store.searchMeta?.adults ?? 0) + (store.searchMeta?.children ?? 0) || store.lastParams?.totalGuests || 1,
        totalRooms: store.searchMeta?.rooms || 1,
        currency: store.searchMeta?.currency || 'USD',
      },
    }),
  )
  router.push({
    path: '/travel/hotels/booking',
    query: { hotelId: hotel.hotel_id, step: '1', sessionCode: store.sessionCode },
  })
}

const handleHotelSearch = (data: HotelSearchParams) => performSearch(data)

const handlePageChange = (page: number) => {
  store.setPage(page)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const toggleSearchForm = () => { showSearchForm.value = !showSearchForm.value }

watch(
  () => route.query,
  (q) => {
    if (q.city) {
      isLoading.value = true
      performSearch()
    }
  },
  { immediate: true },
)

onMounted(() => {
  if (store.hasSearched) showSearchForm.value = false

  const observer = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('reveal-visible')
          observer.unobserve(e.target)
        }
      }),
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' },
  )
  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el))
})
</script>

<template>
  <div class="min-h-screen bg-stone-50">
    <section
      class="relative pt-36 pb-24 px-6 bg-cover bg-center bg-no-repeat"
      style="background-image: url('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600')"
    >
      <div class="absolute inset-0 bg-black/50" />
      <div class="relative z-10 max-w-7xl mx-auto">
        <div
          class="text-center reveal transition-all duration-500"
          :class="store.hasSearched ? 'mb-6' : 'mb-12'"
        >
          <h1
            class="font-bold mb-4 text-white transition-all duration-500"
            :class="store.hasSearched ? 'text-3xl md:text-4xl' : 'text-4xl md:text-5xl'"
          >
            {{ store.hasSearched ? 'Search Hotels' : 'Book Your Next Hotel' }}
          </h1>
          <p v-if="!store.hasSearched" class="text-xl text-gray-100 font-light">
            Find the best deals on hotels worldwide
          </p>
        </div>

        <div class="mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
          <button
            v-if="store.hasSearched"
            class="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between cursor-pointer border-none"
            @click="toggleSearchForm"
          >
            <span class="font-semibold text-gray-900">
              {{ showSearchForm ? 'Hide Search Form' : 'Modify Search' }}
            </span>
            <svg
              class="w-5 h-5 transition-transform duration-300"
              :class="{ 'rotate-180': showSearchForm }"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div v-show="!store.hasSearched || showSearchForm" class="p-6 md:p-8">
            <HotelsForm @search="handleHotelSearch" />
          </div>
        </div>
      </div>
    </section>

    <section v-if="isSearchView" id="search-results" class="py-10 px-4 md:px-6 min-h-[60vh]">
      <div class="max-w-6xl mx-auto">
        <div v-if="searchError" class="mb-8 flex items-start gap-3 p-5 bg-red-50 border border-red-200 rounded-xl">
          <span class="text-red-500 text-xl mt-0.5 flex-shrink-0">⚠</span>
          <div>
            <p class="font-semibold text-red-700">Search failed</p>
            <p class="text-sm text-red-600 mt-1">{{ searchError }}</p>
          </div>
        </div>

        <div v-if="isLoading" class="py-14 text-center">
          <div class="inline-block w-12 h-12 rounded-full border-[3px] border-stone-200 border-t-primary animate-spin" />
          <p class="mt-4 text-sm text-stone-400 italic">Curating the finest hotels for you…</p>
          <div class="mt-10 flex flex-col gap-4">
            <div
              v-for="n in 4" :key="n"
              class="h-44 rounded-xl bg-stone-200 animate-pulse"
              :style="{ animationDelay: `${n * 100}ms` }"
            />
          </div>
        </div>

        <template v-else-if="store.results.length > 0">
          <div class="flex flex-wrap items-center gap-4 mb-6 px-5 py-4 bg-white rounded-xl border border-stone-200 shadow-sm">
            <div class="flex items-baseline gap-2 flex-shrink-0">
              <span class="text-3xl font-bold text-primary leading-none tabular-nums">
                {{ store.results.length }}
              </span>
              <span class="text-sm text-stone-500">
                hotels in
                <strong class="font-semibold text-stone-800">
                  {{ store.filters?.cities?.[0] ?? 'your city' }}
                </strong>
              </span>
            </div>

            <div v-if="store.searchMeta" class="flex flex-wrap gap-2 flex-1 min-w-0">
              <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-50 text-primary text-xs font-medium whitespace-nowrap">
                <svg class="w-3 h-3" viewBox="0 0 16 16" fill="none">
                  <rect x="1" y="3" width="14" height="12" rx="2" stroke="currentColor" stroke-width="1.4"/>
                  <path d="M1 7h14M5 1v4M11 1v4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
                </svg>
                {{ store.searchMeta.arrival_date }} → {{ store.searchMeta.departure_date }}
              </span>
              <span class="inline-flex items-center px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium whitespace-nowrap">
                {{ store.nights }} night{{ store.nights !== 1 ? 's' : '' }}
              </span>
              <span class="inline-flex items-center px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium whitespace-nowrap">
                {{ store.searchMeta.rooms }} room{{ store.searchMeta.rooms !== 1 ? 's' : '' }}
              </span>
              <span class="inline-flex items-center px-3 py-1.5 rounded-full bg-violet-50 text-violet-700 text-xs font-medium whitespace-nowrap">
                {{ store.searchMeta.adults + store.searchMeta.children }} guest{{ (store.searchMeta.adults + store.searchMeta.children) !== 1 ? 's' : '' }}
              </span>
            </div>

            <div class="flex items-center gap-2 flex-shrink-0">
              <span class="text-xs font-medium text-stone-400 hidden sm:block">Sort</span>
              <div class="flex gap-1.5">
                <button
                  v-for="opt in sortOptions" :key="opt.key"
                  class="text-xs font-semibold px-3.5 py-1.5 rounded-full border transition-all duration-150 cursor-pointer"
                  :class="store.sortKey === opt.key
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'bg-white text-stone-500 border-stone-200 hover:border-teal-600 hover:text-primary'"
                  @click="store.setSortKey(opt.key as any)"
                >
                  {{ opt.label }}
                </button>
              </div>
            </div>
          </div>

          <div class="flex flex-col gap-4">
            <div
              v-for="(hotel, index) in paginatedResults"
              :key="hotel.hotel_id"
              class="group grid grid-cols-1 md:grid-cols-[260px_1fr] lg:grid-cols-[300px_1fr_210px] bg-white rounded-xl border border-stone-200 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-stone-200/60 hover:-translate-y-px"
              :style="{ animationDelay: `${index * 50}ms` }"
              @click="viewHotelDetails(hotel)"
            >
              <div class="relative overflow-hidden min-h-[200px] md:min-h-0">
                <img
                  :src="hotel.thumbnail"
                  :alt="hotel.hotel_name"
                  class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  @error="($event.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'"
                />
                <div class="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-xs tracking-widest leading-none">
                  <span class="text-amber-400">{{ '★'.repeat(hotel.rating) }}</span>
                  <span class="text-stone-200">{{ '☆'.repeat(5 - hotel.rating) }}</span>
                </div>
                <div v-if="hotel.board_basis?.length" class="absolute bottom-2.5 left-2.5 flex gap-1.5">
                  <span
                    v-for="basis in hotel.board_basis.slice(0, 2)" :key="basis"
                    class="text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full bg-teal-800/85 text-white backdrop-blur-sm"
                  >
                    {{ basis }}
                  </span>
                </div>
              </div>

              <div class="flex flex-col gap-4 p-5 md:border-r border-stone-100">
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0">
                    <h3 class="text-lg font-bold text-stone-900 leading-snug truncate mb-1">
                      {{ hotel.hotel_name }}
                    </h3>
                    <p class="flex items-center gap-1 text-sm text-stone-400 truncate">
                      <svg class="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 16 16" fill="none">
                        <path d="M8 1.5A4.5 4.5 0 0 1 12.5 6c0 3.5-4.5 8.5-4.5 8.5S3.5 9.5 3.5 6A4.5 4.5 0 0 1 8 1.5Z" stroke="currentColor" stroke-width="1.3"/>
                        <circle cx="8" cy="6" r="1.5" stroke="currentColor" stroke-width="1.3"/>
                      </svg>
                      {{ hotel.hotel_address || hotel.city }}
                    </p>
                  </div>
                  <span class="flex-shrink-0 text-[11px] font-semibold text-primary bg-teal-50 px-2.5 py-1 rounded-full whitespace-nowrap">
                    {{ hotel.room_count }} option{{ hotel.room_count !== 1 ? 's' : '' }}
                  </span>
                </div>

                <div v-if="hotel.board_basis?.length" class="flex flex-wrap gap-1.5 lg:hidden">
                  <span
                    v-for="basis in hotel.board_basis" :key="basis"
                    class="text-[11px] font-medium px-2.5 py-1 rounded-full bg-green-50 text-green-700"
                  >
                    {{ basis }}
                  </span>
                </div>

                <div class="flex flex-wrap gap-1.5 mt-auto pt-2">
                  <span class="text-[11px] font-medium text-stone-400 bg-stone-50 border border-stone-100 px-2.5 py-1 rounded-md">Free WiFi</span>
                  <span class="text-[11px] font-medium text-stone-400 bg-stone-50 border border-stone-100 px-2.5 py-1 rounded-md">Air-conditioned</span>
                  <span class="text-[11px] font-medium text-stone-400 bg-stone-50 border border-stone-100 px-2.5 py-1 rounded-md">24h Reception</span>
                </div>
              </div>

              <div class="flex flex-col justify-between gap-4 p-5 bg-gradient-to-br from-stone-50 to-teal-50/20 lg:col-auto col-span-full md:col-span-full lg:border-t-0 border-t border-stone-100">
                <div>
                  <p class="text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-1">Total from</p>
                  <p class="text-[28px] font-bold text-stone-900 leading-none mb-1">
                    {{ format(hotel.price, store.searchMeta?.currency) }}
                  </p>
                  <p class="text-[11px] text-stone-400 mb-3">
                    {{ store.searchMeta?.currency ?? 'USD' }}
                    · {{ store.nights }} night{{ store.nights !== 1 ? 's' : '' }}
                    · {{ store.searchMeta?.rooms ?? 1 }} room{{ (store.searchMeta?.rooms ?? 1) !== 1 ? 's' : '' }}
                  </p>
                  <span class="inline-flex items-baseline gap-1 text-sm font-semibold text-primary bg-teal-50 px-2.5 py-1 rounded-md">
                    ≈ {{ format(Math.round(hotel.price / store.nights), store.searchMeta?.currency) }}
                    <span class="text-[11px] font-normal text-primary/40">/night</span>
                  </span>
                </div>
                <button
                  class="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary/60 text-white text-sm font-semibold transition-all duration-150 hover:-translate-y-px border-none cursor-pointer shadow-sm"
                  @click.stop="viewHotelDetails(hotel)"
                >
                  View Details
                  <svg class="w-4 h-4" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <Pagination
            v-if="store.results.length > ITEMS_PER_PAGE"
            :total-items="store.results.length"
            :items-per-page="ITEMS_PER_PAGE"
            :current-page="store.currentPage"
            @page-change="handlePageChange"
          />
        </template>

        <div
          v-if="!isLoading && !searchError && store.results.length === 0"
          class="max-w-sm mx-auto mt-20 text-center px-10 py-14 bg-white rounded-2xl border border-stone-200 shadow-sm"
        >
          <h3 class="text-2xl font-bold text-stone-800 mb-3">No Hotels Found</h3>
          <p class="text-stone-500 text-sm leading-relaxed mb-7">
            No hotels match your search. Try different dates, another city, or fewer rooms.
          </p>
          <button
            class="px-8 py-2.5 bg-primary hover:bg-primary/10 text-white text-sm font-semibold rounded-lg transition-colors border-none cursor-pointer"
            @click="toggleSearchForm"
          >
            Modify Search
          </button>
        </div>
      </div>
    </section>

    <section v-if="!store.hasSearched" class="py-16 px-6">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-12 reveal">
          <h2 class="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Popular Destinations</h2>
          <p class="text-lg text-gray-600">Explore our most sought-after hotel destinations</p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="(dest, i) in popularDestinations" :key="dest.city"
            class="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer reveal"
            :style="{ transitionDelay: `${i * 100}ms` }"
          >
            <img :src="dest.image" :alt="dest.city"
              class="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            <div class="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h3 class="text-2xl font-bold mb-1">{{ dest.city }}</h3>
              <p class="text-lg font-semibold">{{ dest.price }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="py-16 px-6" :class="store.hasSearched ? 'bg-white' : 'bg-gray-50'">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-12 reveal">
          <h2 class="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Why Book With Us</h2>
          <p class="text-lg text-gray-600">Experience hassle-free hotel booking with exclusive benefits</p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            v-for="(b, i) in benefits" :key="b.title"
            class="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 reveal"
            :style="{ transitionDelay: `${i * 100}ms` }"
          >
            <div class="text-4xl mb-4 text-gray-900">{{ b.icon }}</div>
            <h3 class="text-xl font-bold mb-2 text-gray-900">{{ b.title }}</h3>
            <p class="text-gray-600">{{ b.description }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.reveal { opacity: 0; transform: translateY(30px); transition: opacity 0.6s ease-out, transform 0.6s ease-out; }
.reveal-visible { opacity: 1; transform: translateY(0); }
</style>
