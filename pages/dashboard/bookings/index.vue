<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

definePageMeta({
  layout: 'dashboard',
  requiresAuth: true,
  middleware: 'auth',
})

const route = useRoute()
const router = useRouter()

type BookingType = 'all' | 'flight' | 'hotel' | 'tour' | 'visa'
const activeTab = ref<BookingType>((route.query.type as BookingType) || 'all')
const searchQ = ref('')
const statusFilter = ref('all')

watch(() => route.query.type, t => { activeTab.value = (t as BookingType) || 'all' })

const tabs = [
  { key: 'all', label: 'All', count: 12 },
  { key: 'flight', label: 'Flights', count: 5 },
  { key: 'hotel', label: 'Hotels', count: 4 },
  { key: 'tour', label: 'Tours', count: 3 },
  { key: 'visa', label: 'Visa', count: 0 },
]

// TODO: replace with GET /api/bookings?type=&status=&q=
const allBookings = [
  { id: 'BK001', type: 'flight', ref: 'FLT-XQA42B', title: 'Lagos (LOS) → London (LHR)', subtitle: 'Economy · 2 passengers', date: '15 Mar 2025', bookedOn: '02 Mar 2025', status: 'confirmed', amount: '₦285,000' },
  { id: 'BK002', type: 'hotel',  ref: 'HTL-Y8PQ11', title: 'Grand Hyatt Hotel', subtitle: 'Dubai · 3 nights · 2 guests', date: '20 Feb 2025', bookedOn: '10 Feb 2025', status: 'confirmed', amount: '₦142,500' },
  { id: 'BK003', type: 'tour',   ref: 'TUR-K3NZ09', title: 'Dubai City Tour – Full Day', subtitle: '2 adults · 1 child', date: '21 Feb 2025', bookedOn: '10 Feb 2025', status: 'pending', amount: '₦98,000' },
  { id: 'BK004', type: 'flight', ref: 'FLT-MNB87C', title: 'Abuja (ABV) → Istanbul (IST)', subtitle: 'Business · 1 passenger', date: '05 Jan 2025', bookedOn: '28 Dec 2024', status: 'completed', amount: '₦195,000' },
  { id: 'BK005', type: 'hotel',  ref: 'HTL-ZX009K', title: 'Marriott Istanbul', subtitle: 'Istanbul · 4 nights · 2 guests', date: '05 Jan 2025', bookedOn: '28 Dec 2024', status: 'completed', amount: '₦220,000' },
  { id: 'BK006', type: 'flight', ref: 'FLT-CQP23L', title: 'Lagos (LOS) → Paris (CDG)', subtitle: 'Economy · 1 passenger', date: '12 Dec 2024', bookedOn: '01 Dec 2024', status: 'cancelled', amount: '₦185,000' },
  { id: 'BK007', type: 'tour',   ref: 'TUR-BB019Z', title: 'Istanbul Cultural Tour', subtitle: '3 adults · 2 children', date: '06 Jan 2025', bookedOn: '28 Dec 2024', status: 'confirmed', amount: '₦156,000' },
  { id: 'BK008', type: 'hotel',  ref: 'HTL-PQ771R', title: 'Jumeirah Beach Hotel', subtitle: 'Dubai · 5 nights · 4 guests', date: '20 Feb 2025', bookedOn: '08 Feb 2025', status: 'confirmed', amount: '₦380,000' },
  { id: 'BK009', type: 'flight', ref: 'FLT-DXN44W', title: 'Lagos (LOS) → Dubai (DXB)', subtitle: 'Economy · 3 passengers', date: '19 Feb 2025', bookedOn: '08 Feb 2025', status: 'confirmed', amount: '₦420,000' },
  { id: 'BK010', type: 'tour',   ref: 'TUR-RRZ55Y', title: 'Paris Food & Culture Tour', subtitle: '2 adults', date: '13 Dec 2024', bookedOn: '01 Dec 2024', status: 'completed', amount: '₦75,000' },
  { id: 'BK011', type: 'hotel',  ref: 'HTL-OOK88P', title: 'Novotel Paris Centre', subtitle: 'Paris · 2 nights · 2 guests', date: '12 Dec 2024', bookedOn: '01 Dec 2024', status: 'cancelled', amount: '₦96,000' },
  { id: 'BK012', type: 'flight', ref: 'FLT-QXTLB2', title: 'Lagos (LOS) → Cape Town (CPT)', subtitle: 'Economy · 1 passenger', date: '28 Nov 2024', bookedOn: '15 Nov 2024', status: 'completed', amount: '₦167,000' },
]

const filtered = computed(() => allBookings.filter(b => {
  if (activeTab.value !== 'all' && b.type !== activeTab.value) return false
  if (statusFilter.value !== 'all' && b.status !== statusFilter.value) return false
  if (searchQ.value) {
    const q = searchQ.value.toLowerCase()
    if (!b.title.toLowerCase().includes(q) && !b.ref.toLowerCase().includes(q)) return false
  }
  return true
}))

const statusConfig: Record<string, { label: string; class: string }> = {
  confirmed: { label: 'Confirmed', class: 'bg-green-100 text-green-700' },
  pending: { label: 'Pending', class: 'bg-amber-100 text-amber-700' },
  completed: { label: 'Completed', class: 'bg-blue-100 text-blue-700' },
  cancelled: { label: 'Cancelled', class: 'bg-red-100 text-red-700' },
}

const typeConfig: Record<string, { icon: string; bg: string }> = {
  flight: { icon: 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8', bg: 'bg-purple-100 text-purple-600' },
  hotel: { icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16', bg: 'bg-amber-100 text-amber-600' },
  tour: { icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z', bg: 'bg-green-100 text-green-600' },
  visa: { icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586', bg: 'bg-rose-100 text-rose-600' },
}

function setTab(key: BookingType) {
  activeTab.value = key
  router.replace({ query: key === 'all' ? {} : { type: key } })
}
</script>

<template>
  <div class="space-y-5">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <h1 class="text-2xl font-bold text-slate-900">My Bookings</h1>
    </div>

    <!-- Tabs -->
    <div class="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 overflow-x-auto">
      <button v-for="tab in tabs" :key="tab.key"
        class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all cursor-pointer border-none shrink-0"
        :class="activeTab === tab.key ? 'bg-slate-900 text-white shadow' : 'text-slate-500 hover:text-slate-800 bg-transparent'"
        @click="setTab(tab.key as BookingType)"
      >
        {{ tab.label }}
        <span class="text-[10px] px-1.5 py-0.5 rounded-full" :class="activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'">{{ tab.count }}</span>
      </button>
    </div>

    <!-- Filters row -->
    <div class="flex flex-col sm:flex-row gap-3">
      <div class="relative flex-1">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input v-model="searchQ" type="text" placeholder="Search by tour name or reference…"
          class="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"/>
      </div>
      <select v-model="statusFilter" class="px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 bg-white text-slate-700">
        <option value="all">All statuses</option>
        <option value="confirmed">Confirmed</option>
        <option value="pending">Pending</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
      </select>
    </div>

    <!-- Booking list -->
    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div v-if="filtered.length === 0" class="text-center py-16">
        <div class="text-5xl mb-3">🗂️</div>
        <p class="font-semibold text-slate-700">No bookings found</p>
        <p class="text-sm text-slate-400 mt-1">Try adjusting your filters or search term.</p>
      </div>

      <div v-else class="divide-y divide-slate-100">
        <div v-for="bk in filtered" :key="bk.id"
          class="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors cursor-pointer"
          @click="router.push(`/dashboard/bookings/${bk.id}`)"
        >
          <!-- Type icon -->
          <div class="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" :class="typeConfig[bk.type]?.bg">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path :d="typeConfig[bk.type]?.icon" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>

          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-slate-900 truncate">{{ bk.title }}</p>
            <p class="text-xs text-slate-500 truncate">{{ bk.subtitle }} · {{ bk.ref }}</p>
            <p class="text-xs text-slate-400 mt-0.5">{{ bk.date }} · Booked {{ bk.bookedOn }}</p>
          </div>

          <div class="text-right shrink-0 space-y-1">
            <p class="text-sm font-bold text-slate-900">{{ bk.amount }}</p>
            <span class="inline-block text-xs font-semibold px-2 py-0.5 rounded-full" :class="statusConfig[bk.status]?.class">
              {{ statusConfig[bk.status]?.label }}
            </span>
          </div>

          <svg class="text-slate-300 shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
        </div>
      </div>
    </div>

    <p class="text-xs text-slate-400 text-right">{{ filtered.length }} booking{{ filtered.length !== 1 ? 's' : '' }}</p>
  </div>
</template>
