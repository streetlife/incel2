<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

definePageMeta({
  layout: 'dashboard',
  requiresAuth: true,
  middleware: 'auth',
})

const router = useRouter()
const auth = useAuthStore()

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
})

const stats = [
  { label: 'Total Bookings', value: '12', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', color: 'bg-blue-50 text-blue-600' },
  { label: 'Flights', value: '5', icon: 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8', color: 'bg-purple-50 text-purple-600' },
  { label: 'Hotels', value: '4', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1', color: 'bg-amber-50 text-amber-600' },
  { label: 'Tours', value: '3', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z', color: 'bg-green-50 text-green-600' },
]

const quickLinks = [
  { label: 'Book a Flight', to: '/travel/flights', icon: 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8', bg: 'bg-purple-600' },
  { label: 'Book a Hotel', to: '/travel/hotels', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16', bg: 'bg-amber-500' },
  { label: 'Book a Tour', to: '/travel/tours', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z', bg: 'bg-green-600' },
  { label: 'Apply for Visa', to: '/travel/visas', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0121 8v11a2 2 0 01-2 2z', bg: 'bg-rose-600' },
]

// GET /api/bookings?limit=5&sort=recent
const recentBookings = [
  { id: 'BK001', type: 'flight', ref: 'FLT-XQA42B', route: 'Lagos → London', date: '15 Mar 2025', status: 'confirmed', amount: '₦285,000' },
  { id: 'BK002', type: 'hotel', ref: 'HTL-Y8PQ11', route: 'Grand Hyatt, Dubai', date: '20 Feb 2025', status: 'confirmed', amount: '₦142,500' },
  { id: 'BK003', type: 'tour', ref: 'TUR-K3NZ09', route: 'Dubai City Tour', date: '21 Feb 2025', status: 'pending', amount: '₦98,000' },
  { id: 'BK004', type: 'flight', ref: 'FLT-MNB87C', route: 'Abuja → Istanbul', date: '05 Jan 2025', status: 'completed', amount: '₦195,000' },
]

const statusCls: Record<string, string> = {
  confirmed: 'bg-green-100 text-green-700',
  pending: 'bg-amber-100 text-amber-700',
  completed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-700',
}
const typeIcon: Record<string, string> = {
  flight: 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8',
  hotel: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16',
  tour: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z',
  visa: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586',
}
</script>

<template>
  <div class="space-y-6">

    <!-- Greeting -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">
          {{ greeting }}, {{ auth.displayName.split(' ')[0] }}
        </h1>
        <p class="text-slate-500 text-sm mt-0.5">Here's what's happening with your bookings today.</p>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="s in stats" :key="s.label" class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center mb-3" :class="s.color">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path :d="s.icon" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <p class="text-3xl font-bold text-slate-900">{{ s.value }}</p>
        <p class="text-xs text-slate-500 mt-0.5">{{ s.label }}</p>
      </div>
    </div>

    <!-- Quick book -->
    <div>
      <h2 class="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Quick Book</h2>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <NuxtLink v-for="ql in quickLinks" :key="ql.to" :to="ql.to"
          class="flex flex-col items-center gap-3 p-4 rounded-2xl text-white font-semibold text-sm no-underline hover:opacity-90 active:scale-95 transition-all text-center shadow-sm"
          :class="ql.bg">
          <div class="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path :d="ql.icon" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          {{ ql.label }}
        </NuxtLink>
      </div>
    </div>

    <!-- Recent bookings -->
    <div>
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-xs font-bold uppercase tracking-widest text-slate-500">Recent Bookings</h2>
        <NuxtLink to="/dashboard/bookings" class="text-xs text-primary font-semibold hover:underline">View all →</NuxtLink>
      </div>
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="divide-y divide-slate-100">
          <div v-for="bk in recentBookings" :key="bk.id"
            class="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 cursor-pointer transition-colors"
            @click="router.push(`/dashboard/bookings/${bk.id}`)">
            <div class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="1.8">
                <path :d="typeIcon[bk.type]" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-slate-900 truncate">{{ bk.route }}</p>
              <p class="text-xs text-slate-500">{{ bk.ref }} · {{ bk.date }}</p>
            </div>
            <div class="text-right shrink-0">
              <p class="text-sm font-bold text-slate-900">{{ bk.amount }}</p>
              <span class="text-xs font-semibold px-2 py-0.5 rounded-full" :class="statusCls[bk.status]">
                {{ bk.status.charAt(0).toUpperCase() + bk.status.slice(1) }}
              </span>
            </div>
          </div>
        </div>
        <div class="px-5 py-3 bg-slate-50 border-t border-slate-100">
          <NuxtLink to="/dashboard/bookings" class="text-xs text-primary font-semibold hover:underline">View all 12 bookings →</NuxtLink>
        </div>
      </div>
    </div>

  </div>
</template>
