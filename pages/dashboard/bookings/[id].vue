<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

definePageMeta({
  layout: 'dashboard',
  requiresAuth: true,
  middleware: 'auth',
})

const route  = useRoute()
const router = useRouter()

// ── Mock data keyed by booking ID ─────────────────────────────────────────────
// TODO: replace with GET /api/bookings/:id
// The API should return a `type` field (flight | hotel | tour | visa)
// and the relevant detail block for that type.
const mockBookings: Record<string, any> = {
  BK001: {
    id: 'BK001', type: 'flight', ref: 'FLT-XQA42B', status: 'confirmed',
    bookedOn: '02 March 2025', amount: '₦285,000', paidVia: 'Paystack',
    invoiceNumber: 'INV-XQ4T2B', contactEmail: 'adaeze@example.com',
    departure: { code: 'LOS', city: 'Lagos',  date: '15 Mar 2025', time: '09:45' },
    arrival:   { code: 'LHR', city: 'London', date: '15 Mar 2025', time: '17:30' },
    airline: 'British Airways', flightNo: 'BA076', cabin: 'Economy',
    duration: '6h 45m', stops: 'Direct',
    passengers: [
      { name: 'Adaeze Okafor', type: 'Adult', ticket: 'TK-00A1' },
      { name: 'Chidi Okafor',  type: 'Adult', ticket: 'TK-00A2' },
    ],
  },
  BK002: {
    id: 'BK002', type: 'hotel', ref: 'HTL-Y8PQ11', status: 'confirmed',
    bookedOn: '10 February 2025', amount: '₦142,500', paidVia: 'Flutterwave',
    invoiceNumber: 'INV-Y8PQ11', contactEmail: 'adaeze@example.com',
    hotelName: 'Grand Hyatt Hotel', city: 'Dubai', country: 'UAE',
    checkIn: '20 Feb 2025', checkOut: '23 Feb 2025', nights: 3,
    roomType: 'Deluxe King Room', boardType: 'Bed & Breakfast',
    rooms: 1, guests: 2,
    cancellationPolicy: 'Free cancellation up to 48h before check-in',
    amenities: ['Free WiFi', 'Pool', 'Gym', 'Breakfast Included'],
    leadGuest: { name: 'Adaeze Okafor', email: 'adaeze@example.com', phone: '+234 802 000 0001' },
  },
  BK003: {
    id: 'BK003', type: 'tour', ref: 'TUR-K3NZ09', status: 'pending',
    bookedOn: '10 February 2025', amount: '₦98,000', paidVia: 'Paystack',
    invoiceNumber: 'INV-K3NZ09', contactEmail: 'adaeze@example.com',
    tourName: 'Dubai City Tour – Full Day', city: 'Dubai', country: 'UAE',
    date: '21 Feb 2025', departureTime: '09:00 AM', duration: 'Full Day (8h)',
    packageName: 'Premium Package',
    meetingPoint: 'Dubai City Centre Hotel Lobby',
    includes: ['Hotel Pickup & Drop-off', 'Professional Guide', 'Entry Tickets', 'Lunch'],
    cancellationPolicy: 'Free cancellation up to 24h before departure',
    adults: 2, children: 1, infants: 0,
    leadParticipant: { name: 'Adaeze Okafor', email: 'adaeze@example.com', phone: '+234 802 000 0001' },
  },
  BK004: {
    id: 'BK004', type: 'flight', ref: 'FLT-MNB87C', status: 'completed',
    bookedOn: '28 December 2024', amount: '₦195,000', paidVia: 'Paystack',
    invoiceNumber: 'INV-MNB87C', contactEmail: 'adaeze@example.com',
    departure: { code: 'ABV', city: 'Abuja',    date: '05 Jan 2025', time: '11:00' },
    arrival:   { code: 'IST', city: 'Istanbul', date: '05 Jan 2025', time: '19:45' },
    airline: 'Turkish Airlines', flightNo: 'TK610', cabin: 'Business',
    duration: '7h 45m', stops: 'Direct',
    passengers: [{ name: 'Adaeze Okafor', type: 'Adult', ticket: 'TK-00B1' }],
  },
  BK007: {
    id: 'BK007', type: 'tour', ref: 'TUR-BB019Z', status: 'confirmed',
    bookedOn: '28 December 2024', amount: '₦156,000', paidVia: 'Flutterwave',
    invoiceNumber: 'INV-BB019Z', contactEmail: 'adaeze@example.com',
    tourName: 'Istanbul Cultural Tour', city: 'Istanbul', country: 'Turkey',
    date: '06 Jan 2025', departureTime: '10:00 AM', duration: 'Full Day (9h)',
    packageName: 'Standard Package',
    meetingPoint: 'Istanbul City Centre Hotel Lobby',
    includes: ['Hotel Pickup & Drop-off', 'Professional Guide', 'Entry Tickets'],
    cancellationPolicy: 'Free cancellation up to 48h before departure',
    adults: 3, children: 2, infants: 0,
    leadParticipant: { name: 'Adaeze Okafor', email: 'adaeze@example.com', phone: '+234 802 000 0001' },
  },
  BK008: {
    id: 'BK008', type: 'hotel', ref: 'HTL-PQ771R', status: 'confirmed',
    bookedOn: '08 February 2025', amount: '₦380,000', paidVia: 'Paystack',
    invoiceNumber: 'INV-PQ771R', contactEmail: 'adaeze@example.com',
    hotelName: 'Jumeirah Beach Hotel', city: 'Dubai', country: 'UAE',
    checkIn: '20 Feb 2025', checkOut: '25 Feb 2025', nights: 5,
    roomType: 'Ocean View Suite', boardType: 'Half Board',
    rooms: 2, guests: 4,
    cancellationPolicy: 'Non-refundable',
    amenities: ['Private Beach', 'Free WiFi', 'Pool', 'Spa', 'Gym'],
    leadGuest: { name: 'Adaeze Okafor', email: 'adaeze@example.com', phone: '+234 802 000 0001' },
  },
  // Visa example — add a visa booking to MyBookings mock to test
  BKVISA: {
    id: 'BKVISA', type: 'visa', ref: 'VIS-ZZ001K', status: 'pending',
    bookedOn: '01 February 2025', amount: '₦45,000', paidVia: 'Paystack',
    invoiceNumber: 'INV-ZZ001K', contactEmail: 'adaeze@example.com',
    visaType: 'Tourist', country: 'United Kingdom', travelDate: '15 Mar 2025',
    applicants: 1, processingType: 'Standard (15 working days)',
    submittedOn: '01 Feb 2025', applicantName: 'Adaeze Okafor',
    documents: [
      { name: 'International Passport', status: 'approved' },
      { name: 'Bank Statement (6 months)', status: 'approved' },
      { name: 'Travel Itinerary', status: 'review' },
      { name: 'Hotel Booking Confirmation', status: 'review' },
    ],
  },
}

const booking = computed(() => {
  const id = route.params.id as string
  // Try exact match first, then fall back so unknown IDs still render something
  return mockBookings[id] ?? { ...mockBookings.BK001, id }
})

const statusConfig: Record<string, { label: string; cls: string }> = {
  confirmed: { label: 'Confirmed', cls: 'bg-green-100 text-green-700' },
  pending: { label: 'Pending', cls: 'bg-amber-100 text-amber-700' },
  completed: { label: 'Completed', cls: 'bg-blue-100 text-blue-700' },
  cancelled: { label: 'Cancelled', cls: 'bg-red-100 text-red-700' },
}

const typeConfig: Record<string, { badge: string; icon: string }> = {
  flight: { badge: 'bg-purple-100 text-purple-700', icon: 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8' },
  hotel: { badge: 'bg-amber-100  text-amber-700', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16' },
  tour: { badge: 'bg-green-100  text-green-700', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' },
  visa: { badge: 'bg-rose-100   text-rose-700', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
}

const bookingTitle = computed(() => {
  const b = booking.value
  switch (b.type) {
    case 'flight': return `${b.departure.city} → ${b.arrival.city}`
    case 'hotel': return b.hotelName
    case 'tour': return b.tourName
    case 'visa': return `${b.visaType} Visa — ${b.country}`
    default: return b.ref
  }
})

const printLabel: Record<string, string> = {
  flight: 'Print Ticket',
  hotel: 'Print Voucher',
  tour: 'Print Voucher',
  visa: 'Print Application',
}

const initials = (name: string) =>
  name.split(' ').map((n: string) => n[0]).join('')
</script>

<template>
  <div class="space-y-5">

    <!-- Back -->
    <button
      class="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors cursor-pointer bg-transparent border-none p-0"
      @click="router.back()">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M19 12H5M12 19l-7-7 7-7"/>
      </svg>
      Back to Bookings
    </button>

    <!-- Shared header -->
    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div class="px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100">
        <div>
          <div class="flex items-center flex-wrap gap-2 mb-1">
            <span class="text-xs font-semibold px-2.5 py-1 rounded-full"
              :class="statusConfig[booking.status]?.cls">
              {{ statusConfig[booking.status]?.label }}
            </span>
            <span class="text-xs font-semibold px-2.5 py-1 rounded-full capitalize flex items-center gap-1"
              :class="typeConfig[booking.type]?.badge">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path :d="typeConfig[booking.type]?.icon" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              {{ booking.type }}
            </span>
            <span class="text-xs text-slate-400 font-mono">{{ booking.ref }}</span>
          </div>
          <h1 class="text-xl font-bold text-slate-900">{{ bookingTitle }}</h1>
          <p class="text-sm text-slate-500 mt-0.5">
            Booked on {{ booking.bookedOn }} · {{ booking.invoiceNumber }}
          </p>
        </div>
        <div class="text-right shrink-0">
          <p class="text-2xl font-bold text-slate-900">{{ booking.amount }}</p>
          <p class="text-xs text-slate-400">Paid via {{ booking.paidVia }}</p>
        </div>
      </div>

      <!-- ══════════════════════════════════════════════════════════════════════
           FLIGHT
      ══════════════════════════════════════════════════════════════════════ -->
      <template v-if="booking.type === 'flight'">
        <div class="px-6 py-5 border-b border-slate-100">
          <p class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Flight Details</p>
          <div class="flex items-center gap-4">
            <div class="text-center shrink-0">
              <p class="text-2xl font-bold text-slate-900">{{ booking.departure.code }}</p>
              <p class="text-xs text-slate-500">{{ booking.departure.city }}</p>
              <p class="text-sm font-semibold text-slate-700 mt-1">{{ booking.departure.time }}</p>
              <p class="text-xs text-slate-400">{{ booking.departure.date }}</p>
            </div>
            <div class="flex-1 flex flex-col items-center">
              <p class="text-xs text-slate-400 mb-1">{{ booking.duration }} · {{ booking.stops }}</p>
              <div class="w-full flex items-center gap-1">
                <div class="w-2 h-2 rounded-full border-2 border-slate-300 shrink-0"></div>
                <div class="flex-1 h-0.5 bg-slate-200"></div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#94a3b8" class="shrink-0">
                  <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                </svg>
              </div>
              <p class="text-xs text-slate-500 mt-1">{{ booking.airline }} · {{ booking.flightNo }}</p>
            </div>
            <div class="text-center shrink-0">
              <p class="text-2xl font-bold text-slate-900">{{ booking.arrival.code }}</p>
              <p class="text-xs text-slate-500">{{ booking.arrival.city }}</p>
              <p class="text-sm font-semibold text-slate-700 mt-1">{{ booking.arrival.time }}</p>
              <p class="text-xs text-slate-400">{{ booking.arrival.date }}</p>
            </div>
          </div>
          <div class="mt-4 flex flex-wrap gap-2">
            <span class="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-lg">{{ booking.cabin }}</span>
            <span class="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-lg">
              {{ booking.passengers.length }} passenger{{ booking.passengers.length > 1 ? 's' : '' }}
            </span>
          </div>
        </div>
        <div class="px-6 py-5">
          <p class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Passengers & E-Tickets</p>
          <div class="space-y-2.5">
            <div v-for="p in booking.passengers" :key="p.ticket"
              class="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
              <div>
                <p class="text-sm font-semibold text-slate-800">{{ p.name }}</p>
                <p class="text-xs text-slate-500">{{ p.type }}</p>
              </div>
              <div class="text-right">
                <p class="text-xs font-mono font-semibold text-slate-700">{{ p.ticket }}</p>
                <p class="text-[10px] text-slate-400">Ticket No.</p>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- ══════════════════════════════════════════════════════════════════════
           HOTEL
      ══════════════════════════════════════════════════════════════════════ -->
      <template v-else-if="booking.type === 'hotel'">
        <div class="px-6 py-5 border-b border-slate-100">
          <p class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Stay Details</p>
          <!-- Check-in / Check-out -->
          <div class="flex items-stretch gap-3 mb-4">
            <div class="bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 flex-1 text-center">
              <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Check-in</p>
              <p class="text-lg font-bold text-slate-900">{{ booking.checkIn }}</p>
              <p class="text-xs text-slate-500 mt-0.5">From 14:00</p>
            </div>
            <div class="flex flex-col items-center justify-center gap-1 shrink-0 py-2">
              <div class="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
              <div class="flex-1 w-px bg-slate-200"></div>
              <p class="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg whitespace-nowrap">
                {{ booking.nights }} night{{ booking.nights > 1 ? 's' : '' }}
              </p>
              <div class="flex-1 w-px bg-slate-200"></div>
              <div class="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
            </div>
            <div class="bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 flex-1 text-center">
              <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Check-out</p>
              <p class="text-lg font-bold text-slate-900">{{ booking.checkOut }}</p>
              <p class="text-xs text-slate-500 mt-0.5">Before 12:00</p>
            </div>
          </div>
          <!-- Room meta -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div v-for="row in [
              { label: 'Room Type', value: booking.roomType  },
              { label: 'Board',     value: booking.boardType },
              { label: 'Rooms',     value: `${booking.rooms} room${booking.rooms > 1 ? 's' : ''}` },
              { label: 'Guests',    value: `${booking.guests} guest${booking.guests > 1 ? 's' : ''}` },
            ]" :key="row.label" class="bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
              <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{{ row.label }}</p>
              <p class="text-sm font-semibold text-slate-800">{{ row.value }}</p>
            </div>
          </div>
        </div>
        <!-- Amenities & cancellation -->
        <div class="px-6 py-5 border-b border-slate-100">
          <p class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Amenities</p>
          <div class="flex flex-wrap gap-2 mb-4">
            <span v-for="a in booking.amenities" :key="a"
              class="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 border border-green-100 px-3 py-1.5 rounded-lg">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20,6 9,17 4,12"/></svg>
              {{ a }}
            </span>
          </div>
          <div class="flex items-center gap-1.5">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
              :stroke="booking.cancellationPolicy.includes('Non-refundable') ? '#ef4444' : '#16a34a'"
              stroke-width="2">
              <path v-if="!booking.cancellationPolicy.includes('Non-refundable')"
                d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <template v-else>
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </template>
            </svg>
            <p class="text-xs font-medium"
              :class="booking.cancellationPolicy.includes('Non-refundable') ? 'text-red-600' : 'text-green-700'">
              {{ booking.cancellationPolicy }}
            </p>
          </div>
        </div>
        <!-- Lead guest -->
        <div class="px-6 py-5">
          <p class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Lead Guest</p>
          <div class="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
            <div class="w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0">
              <span class="text-xs font-bold text-slate-900">{{ initials(booking.leadGuest.name) }}</span>
            </div>
            <div>
              <p class="text-sm font-semibold text-slate-800">{{ booking.leadGuest.name }}</p>
              <p class="text-xs text-slate-500">{{ booking.leadGuest.email }} · {{ booking.leadGuest.phone }}</p>
            </div>
          </div>
        </div>
      </template>

      <!-- ══════════════════════════════════════════════════════════════════════
           TOUR
      ══════════════════════════════════════════════════════════════════════ -->
      <template v-else-if="booking.type === 'tour'">
        <div class="px-6 py-5 border-b border-slate-100">
          <p class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Tour Details</p>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
            <div v-for="row in [
              { label: 'Date',         value: booking.date },
              { label: 'Departure',    value: booking.departureTime },
              { label: 'Duration',     value: booking.duration },
              { label: 'Package',      value: booking.packageName },
              { label: 'City',         value: `${booking.city}, ${booking.country}` },
              { label: 'Participants', value: [
                  booking.adults   ? `${booking.adults} adult${booking.adults > 1 ? 's' : ''}` : null,
                  booking.children ? `${booking.children} child${booking.children > 1 ? 'ren' : ''}` : null,
                  booking.infants  ? `${booking.infants} infant${booking.infants > 1 ? 's' : ''}` : null,
                ].filter(Boolean).join(', ') },
            ]" :key="row.label" class="bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
              <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{{ row.label }}</p>
              <p class="text-sm font-semibold text-slate-800">{{ row.value }}</p>
            </div>
          </div>
          <!-- Meeting point -->
          <div class="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <svg class="shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            <div>
              <p class="text-xs font-semibold text-amber-800">Meeting Point</p>
              <p class="text-xs text-amber-700 mt-0.5">{{ booking.meetingPoint }}</p>
              <p class="text-[11px] text-amber-600 mt-1">Please arrive 15 minutes before departure.</p>
            </div>
          </div>
        </div>
        <!-- Includes & cancellation -->
        <div class="px-6 py-5 border-b border-slate-100">
          <p class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">What's Included</p>
          <div class="flex flex-wrap gap-2 mb-3">
            <span v-for="inc in booking.includes" :key="inc"
              class="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 border border-green-100 px-3 py-1.5 rounded-lg">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20,6 9,17 4,12"/></svg>
              {{ inc }}
            </span>
          </div>
          <div class="flex items-center gap-1.5 mt-2">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <p class="text-xs text-green-700 font-medium">{{ booking.cancellationPolicy }}</p>
          </div>
        </div>
        <!-- Lead participant -->
        <div class="px-6 py-5">
          <p class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Lead Participant</p>
          <div class="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
            <div class="w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0">
              <span class="text-xs font-bold text-slate-900">{{ initials(booking.leadParticipant.name) }}</span>
            </div>
            <div>
              <p class="text-sm font-semibold text-slate-800">{{ booking.leadParticipant.name }}</p>
              <p class="text-xs text-slate-500">{{ booking.leadParticipant.email }} · {{ booking.leadParticipant.phone }}</p>
            </div>
          </div>
        </div>
      </template>

      <!-- ══════════════════════════════════════════════════════════════════════
           VISA
      ══════════════════════════════════════════════════════════════════════ -->
      <template v-else-if="booking.type === 'visa'">
        <div class="px-6 py-5 border-b border-slate-100">
          <p class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Application Details</p>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div v-for="row in [
              { label: 'Visa Type',    value: booking.visaType       },
              { label: 'Country',      value: booking.country        },
              { label: 'Travel Date',  value: booking.travelDate     },
              { label: 'Applicants',   value: `${booking.applicants} person${booking.applicants > 1 ? 's' : ''}` },
              { label: 'Processing',   value: booking.processingType },
              { label: 'Submitted',    value: booking.submittedOn    },
            ]" :key="row.label" class="bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
              <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{{ row.label }}</p>
              <p class="text-sm font-semibold text-slate-800">{{ row.value ?? '—' }}</p>
            </div>
          </div>
        </div>
        <!-- Document checklist -->
        <div v-if="booking.documents" class="px-6 py-5 border-b border-slate-100">
          <p class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Documents Submitted</p>
          <div class="space-y-2">
            <div v-for="doc in booking.documents" :key="doc.name"
              class="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
              <div class="flex items-center gap-2.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="1.8">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
                <p class="text-sm font-medium text-slate-700">{{ doc.name }}</p>
              </div>
              <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                :class="doc.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'">
                {{ doc.status === 'approved' ? 'Approved' : 'Under Review' }}
              </span>
            </div>
          </div>
        </div>
        <!-- Lead applicant -->
        <div class="px-6 py-5">
          <p class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Lead Applicant</p>
          <div class="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
            <div class="w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0">
              <span class="text-xs font-bold text-slate-900">{{ initials(booking.applicantName) }}</span>
            </div>
            <div>
              <p class="text-sm font-semibold text-slate-800">{{ booking.applicantName }}</p>
              <p class="text-xs text-slate-500">{{ booking.contactEmail }}</p>
            </div>
          </div>
        </div>
      </template>

      <!-- Fallback -->
      <template v-else>
        <div class="px-6 py-10 text-center">
          <p class="text-sm text-slate-400">Details not available for this booking type.</p>
        </div>
      </template>
    </div>

    <!-- Shared action bar -->
    <div class="flex flex-wrap gap-3">
      <button
        class="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl cursor-pointer transition-colors">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6 9 6 2 18 2 18 9"/>
          <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/>
          <rect x="6" y="14" width="12" height="8"/>
        </svg>
        {{ printLabel[booking.type] ?? 'Print' }}
      </button>

      <button class="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl cursor-pointer transition-colors">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        Download Invoice
      </button>

      <button v-if="booking.status === 'confirmed'"
        class="flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 hover:bg-red-100 text-red-700 text-sm font-semibold rounded-xl cursor-pointer transition-colors ml-auto">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6m5 0V4a1 1 0 011-1h2a1 1 0 011 1v2"/>
        </svg>
        Cancel Booking
      </button>
    </div>

  </div>
</template>
