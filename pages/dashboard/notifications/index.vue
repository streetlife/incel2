<script setup lang="ts">
import { ref, computed } from 'vue'

definePageMeta({
  layout: 'dashboard',
  requiresAuth: true,
  middleware: 'auth',
})

// GET /api/notifications
const notifications = ref([
  { id: 1, type: 'confirmed', title: 'Booking Confirmed', body: 'Your flight Lagos → London (FLT-XQA42B) has been confirmed. E-ticket sent to your email.', time: '2 hours ago', read: false },
  { id: 2, type: 'reminder', title: 'Upcoming Flight Tomorrow', body: 'Your flight BA076 departs tomorrow at 09:45. Check-in opens now.', time: '1 day ago', read: false },
  { id: 3, type: 'confirmed', title: 'Hotel Booking Confirmed', body: 'Grand Hyatt Dubai (HTL-Y8PQ11) is confirmed for 20 Feb – 23 Feb 2025.', time: '5 days ago', read: true },
  { id: 4, type: 'cancelled', title: 'Booking Cancellation', body: 'Your flight Lagos → Paris (FLT-CQP23L) has been cancelled. Refund processing in 5–7 days.', time: '10 days ago', read: true },
  { id: 5, type: 'promo', title: 'Special Deal: Dubai from ₦189,000', body: 'Limited seats available. Book before Friday to lock in this price.', time: '12 days ago', read: true },
  { id: 6, type: 'confirmed', title: 'Tour Booking Confirmed', body: 'Istanbul Cultural Tour (TUR-BB019Z) for 06 Jan is confirmed. Voucher emailed.', time: '3 weeks ago', read: true },
])

const typeConfig: Record<string, { icon: string; color: string }> = {
  confirmed: { icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'bg-green-100 text-green-600' },
  reminder: { icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', color: 'bg-blue-100 text-blue-600' },
  cancelled: { icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'bg-red-100 text-red-600' },
  promo: { icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z', color: 'bg-amber-100 text-amber-600' },
}

const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)
function markAllRead() { notifications.value.forEach(n => n.read = true) }
function markRead(n: any) { n.read = true }

</script>

<template>
  <div class="space-y-5">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Notifications</h1>
        <p v-if="unreadCount > 0" class="text-sm text-slate-500 mt-0.5">{{ unreadCount }} unread</p>
      </div>
      <button v-if="unreadCount > 0"
        class="text-sm text-primary font-semibold hover:underline cursor-pointer bg-transparent border-none"
        @click="markAllRead">
        Mark all as read
      </button>
    </div>

    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div v-if="notifications.length === 0" class="text-center py-16">
        <div class="text-5xl mb-3">🔔</div>
        <p class="font-semibold text-slate-700">No notifications yet</p>
      </div>

      <div class="divide-y divide-slate-100">
        <div v-for="n in notifications" :key="n.id"
          class="flex items-start gap-4 px-5 py-4 transition-colors cursor-pointer hover:bg-slate-50"
          :class="!n.read ? 'bg-blue-50/50' : ''"
          @click="markRead(n)"
        >
          <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" :class="typeConfig[n.type]?.color">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path :d="typeConfig[n.type]?.icon" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-2">
              <p class="text-sm font-semibold text-slate-900">{{ n.title }}</p>
              <div class="flex items-center gap-2 shrink-0">
                <p class="text-[11px] text-slate-400 whitespace-nowrap">{{ n.time }}</p>
                <div v-if="!n.read" class="w-2 h-2 bg-primary rounded-full shrink-0"></div>
              </div>
            </div>
            <p class="text-xs text-slate-500 mt-0.5 leading-relaxed">{{ n.body }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
