<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useGeneralService } from '../../services/general.service'
import { useToast } from '../../composables/useToast'
import AppToast from '../../components/toast/AppToast.vue'
import { parseApiError } from '../../utils/api'
import type { BookingType, HotelBookingDetail, BookingInfoResponse } from '../../types/booking'
import { useHead } from 'nuxt/app'
import { useCurrency } from '../../composables/useCurrency.ts'
import {
  FileText,
  Search,
  ChevronDown,
  ChevronLeft,
  MapPin,
  Hash,
  CalendarDays,
  Building2,
  Sparkles,
  Users,
  User,
  Baby,
  X,
  CircleCheck,
  TriangleAlert,
  LoaderCircle,
} from 'lucide-vue-next'

useHead({
  title: 'My Booking – Incel Travel',
  meta: [
    {
      name: 'description',
      content:
        'Find and manage your travel bookings with Incel Travel. Look up hotel, flight, tour or visa bookings using your booking code.',
    },
  ],
})

const generalService = useGeneralService()
const toast = useToast()

const bookingCode = ref('')
const bookingType = ref<BookingType>('hotel')
const searching = ref(false)
const searchError = ref('')

const bookingResult = ref<BookingInfoResponse | null>(null)
const resultSection = ref<HTMLElement | null>(null)
const searchSection = ref<HTMLElement | null>(null)

const showCancelModal = ref(false)
const cancelling = ref(false)
const { format } = useCurrency();

const typeOptions: { value: BookingType; label: string }[] = [
  { value: 'hotel', label: 'Hotel' },
  { value: 'flight', label: 'Flight' },
  { value: 'tour', label: 'Tour' },
  { value: 'visa', label: 'Visa' },
]

const hotelBooking = computed<HotelBookingDetail | null>(() => {
  if (!bookingResult.value || bookingResult.value.type !== 'hotel') return null
  return bookingResult.value.booking as HotelBookingDetail
})

const totalGuests = computed(() => {
  if (!hotelBooking.value) return 0
  return hotelBooking.value.guests.length
})

async function handleSearch() {
  if (!bookingCode.value.trim()) {
    searchError.value = 'Please enter a booking code.'
    return
  }
  searchError.value = ''
  bookingResult.value = null
  searching.value = true

  try {
    const result = await generalService.getBookingInfo({
      bookingCode: bookingCode.value.trim(),
      type: bookingType.value,
    })
    bookingResult.value = result
    await nextTick()
    resultSection.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  } catch (err) {
    const apiErr = parseApiError(err)
    searchError.value = apiErr.userMessage || 'Booking not found. Please check your booking code and type.'
  } finally {
    searching.value = false
  }
}

async function handleCancel() {
  if (!hotelBooking.value || !bookingResult.value) return
  cancelling.value = true
  try {
    await generalService.cancelHotelBooking({
      booking_id: hotelBooking.value.rezliveBookingId,
      booking_code: hotelBooking.value.rezliveBookingCode,
    })
    
    showCancelModal.value = false
    bookingResult.value = null
    toast.success('Booking cancelled successfully.')
  } catch (err) {
    const apiErr = parseApiError(err)
    toast.error(apiErr.userMessage || 'Failed to cancel booking. Please try again.')
  } finally {
    cancelling.value = false
  }
}

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const [day, month, year] = dateStr.split('/').map(Number)
  if (!day || !month || !year) return dateStr

  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function resetSearch() {
  bookingResult.value = null
  bookingCode.value = ''
  searchError.value = ''
  nextTick(() => {
    searchSection.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <AppToast />

    <section
      ref="searchSection"
      class="relative overflow-hidden"
      style="background: linear-gradient(135deg, #0168a7 0%, #01427a 100%)"
    >
      <div
        class="absolute -top-20 -right-20 w-96 h-96 rounded-full opacity-10"
        style="background: radial-gradient(circle, #fff 0%, transparent 70%)"
      />
      <div
        class="absolute bottom-0 -left-10 w-72 h-72 rounded-full opacity-10"
        style="background: radial-gradient(circle, #fff 0%, transparent 70%)"
      />

      <div class="relative container mx-auto sm:px-24 px-4 pt-48 pb-16 flex flex-col lg:flex-row items-center gap-12">
        <div class="w-full lg:w-[44%] text-white">
          <p class="text-yellow-400 text-sm font-semibold tracking-widest uppercase mb-3">
            Incel Travel Self Service
          </p>
          <h1 class="text-4xl sm:text-5xl font-extrabold leading-tight mb-4">
            Manage My Booking
          </h1>
          <p class="text-blue-100 text-lg leading-relaxed">
            Find your trip using your booking code, then view details, travel
            documents and support options.
          </p>
        </div>

        <div class="w-full lg:w-[46%]">
          <div class="bg-white rounded-2xl shadow-2xl p-8">
            <div class="flex items-center gap-3 mb-6">
              <div
                class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style="background: #e8f3fb"
              >
                <FileText class="w-5 h-5" style="color: #0168a7" />
              </div>
              <div>
                <h2 class="text-lg font-bold text-gray-900">Find your booking</h2>
                <p class="text-sm text-gray-500">Enter your booking code to look up your booking.</p>
              </div>
            </div>

            <form @submit.prevent="handleSearch" class="space-y-5">
              <div>
                <label for="booking-code" class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Booking Code
                </label>
                <input
                  id="booking-code"
                  v-model="bookingCode"
                  type="text"
                  placeholder="e.g. B260803123337"
                  :class="[
                    'w-full border rounded-lg px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none transition',
                    searchError
                      ? 'border-red-400 focus:border-red-400 bg-red-50/30'
                      : 'border-gray-200 focus:border-transparent'
                  ]"
                  @input="searchError = ''"
                />
                <p v-if="searchError" class="flex items-center gap-1.5 text-red-500 text-xs mt-1.5">
                  <TriangleAlert class="w-3.5 h-3.5 flex-shrink-0" />
                  {{ searchError }}
                </p>
              </div>

              <div>
                <label for="booking-type" class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Booking Type
                </label>
                <div class="relative">
                  <select
                    id="booking-type"
                    v-model="bookingType"
                    class="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-800 appearance-none focus:outline-none focus:border-transparent transition pr-10 bg-white"
                  >
                    <option v-for="opt in typeOptions" :key="opt.value" :value="opt.value">
                      {{ opt.label }}
                    </option>
                  </select>
                  <ChevronDown class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <button
                type="submit"
                :disabled="searching"
                class="w-full py-3.5 rounded-xl font-bold text-neutral-900 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60"
                style="background: linear-gradient(135deg, #f5a623 0%, #f0861a 100%); box-shadow: 0 4px 15px rgba(245,166,35,0.4)"
              >
                <LoaderCircle v-if="searching" class="animate-spin w-5 h-5" />
                <Search v-else class="w-5 h-5" />
                {{ searching ? 'Searching...' : 'Search Booking' }}
              </button>
            </form>
          </div>
        </div>

      </div>
    </section>

    <section ref="resultSection" class="container mx-auto sm:px-24 px-4 py-16">
      <div
        v-if="!bookingResult && !searching"
        class="max-w-lg mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center"
      >
        <div
          class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
          style="background: #e8f3fb"
        >
          <FileText class="w-8 h-8" style="color: #0168a7" />
        </div>
        <h3 class="text-xl font-bold text-gray-900 mb-2">Enter your booking details to begin</h3>
        <p class="text-gray-500 text-sm leading-relaxed">
          Once found, the booking workspace will show change options, travel
          documents, payment summary and support information.
        </p>
      </div>

      <div v-if="bookingResult && hotelBooking" class="max-w-4xl mx-auto">
        <button
          @click="resetSearch"
          class="flex items-center gap-2 text-sm font-medium mb-6 transition-colors"
          style="color: #0168a7"
        >
          <ChevronLeft class="w-4 h-4" />
          Back to search
        </button>

        <div
          class="rounded-2xl overflow-hidden shadow-lg mb-6"
          style="background: linear-gradient(135deg, #0168a7 0%, #01427a 100%)"
        >
          <div class="p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start">
            <img
              :src="hotelBooking.image"
              :alt="hotelBooking.hotelName"
              class="w-full sm:w-40 h-40 object-cover rounded-xl shadow-md flex-shrink-0 bg-white/10"
              @error="(e: any) => (e.target.src = 'https://placehold.co/160x160/0168a7/fff?text=Hotel')"
            />
            <div class="flex-1 text-white">
              <div class="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <span
                    class="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3"
                    style="background: rgba(255,255,255,0.15)"
                  >
                    {{ bookingResult.type }} Booking
                  </span>
                  <h2 class="text-2xl sm:text-3xl font-extrabold leading-tight">
                    {{ hotelBooking.hotelName }}
                  </h2>
                  <p class="text-blue-100 text-sm mt-1 flex items-start gap-1.5">
                    <MapPin class="w-4 h-4 mt-0.5 flex-shrink-0" />
                    {{ hotelBooking.location }}
                  </p>
                </div>
                <span
                  class="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full"
                  style="background: rgba(74,222,128,0.2); color: #4ade80"
                >
                  <span class="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  Confirmed
                </span>
              </div>

              <div
                class="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg text-sm font-semibold"
                style="background: rgba(255,255,255,0.12)"
              >
                <Hash class="w-4 h-4" />
                {{ bookingResult.bookingCode }}
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-9 h-9 rounded-full flex items-center justify-center" style="background:#e8f3fb">
                <CalendarDays class="w-4 h-4" style="color:#0168a7" />
              </div>
              <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Check-In</span>
            </div>
            <p class="text-2xl font-bold text-gray-900">{{ formatDate(hotelBooking.arrival_date) }}</p>
          </div>
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-9 h-9 rounded-full flex items-center justify-center" style="background:#fff3e0">
                <CalendarDays class="w-4 h-4" style="color:#f5a623" />
              </div>
              <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Check-Out</span>
            </div>
            <p class="text-2xl font-bold text-gray-900">{{ formatDate(hotelBooking.departure_date) }}</p>
          </div>
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-9 h-9 rounded-full flex items-center justify-center" style="background:#f0fdf4">
                <Building2 class="w-4 h-4" style="color:#16a34a" />
              </div>
              <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Rooms</span>
            </div>
            <p class="text-2xl font-bold text-gray-900">{{ hotelBooking.occupancy.rooms }}</p>
            <p class="text-xs text-gray-400 mt-1">{{ totalGuests }} guest{{ totalGuests !== 1 ? 's' : '' }} total</p>
          </div>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 class="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Sparkles class="w-5 h-5" style="color:#0168a7" />
              Room Types
            </h3>
            <ul class="space-y-2">
              <li
                v-for="(room, i) in hotelBooking.roomTypes"
                :key="i"
                class="flex items-start gap-2 text-sm text-gray-700"
              >
                <span
                  class="flex-shrink-0 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center mt-0.5"
                  style="background:#e8f3fb; color:#0168a7"
                >{{ i + 1 }}</span>
                {{ room }}
              </li>
            </ul>
          </div>
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 class="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Users class="w-5 h-5" style="color:#0168a7" />
              Occupancy
            </h3>
            <div class="space-y-3">
              <div
                v-for="(_, roomIdx) in hotelBooking.occupancy.adultsPerRoom"
                :key="roomIdx"
                class="rounded-xl p-3 text-sm"
                style="background:#f8fafc"
              >
                <p class="font-semibold text-gray-700 mb-1">Room {{ roomIdx + 1 }}</p>
                <div class="flex gap-4 text-gray-500 text-xs">
                  <span class="flex items-center gap-1">
                    <User class="w-3.5 h-3.5" />
                    {{ hotelBooking.occupancy.adultsPerRoom[roomIdx] }} adult{{ hotelBooking.occupancy.adultsPerRoom[roomIdx] !== 1 ? 's' : '' }}
                  </span>
                  <span v-if="hotelBooking.occupancy.childrenPerRoom[roomIdx] > 0" class="flex items-center gap-1">
                    <Baby class="w-3.5 h-3.5" />
                    {{ hotelBooking.occupancy.childrenPerRoom[roomIdx] }} child{{ hotelBooking.occupancy.childrenPerRoom[roomIdx] !== 1 ? 'ren' : '' }}
                    <span v-if="hotelBooking.occupancy.childrenAges[roomIdx]?.length">
                      (ages: {{ hotelBooking.occupancy.childrenAges[roomIdx].join(', ') }})
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 class="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <User class="w-5 h-5" style="color:#0168a7" />
            Guests
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div
              v-for="(guest, i) in hotelBooking.guests"
              :key="i"
              class="flex items-center gap-3 rounded-xl p-3"
              style="background:#f8fafc"
            >
              <div
                class="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                style="background: linear-gradient(135deg, #0168a7, #01427a); color: white"
              >
                {{ (guest.firstName[0] ?? '').toUpperCase() }}{{ (guest.lastName[0] ?? '').toUpperCase() }}
              </div>
              <div>
                <p class="text-sm font-semibold text-gray-800">
                  {{ guest.title }} {{ guest.firstName }} {{ guest.lastName }}
                </p>
                <p class="text-xs text-gray-400">Guest {{ i + 1 }}</p>
              </div>
            </div>
          </div>
        </div>
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div>
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Total Amount</p>
            <p class="text-3xl font-extrabold" style="color:#0168a7">
              {{ hotelBooking.amount === 0 ? 'Included' : `${format(hotelBooking.amount)}` }}
            </p>
          </div>
          <button
            @click="showCancelModal = true"
            class="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all duration-300"
            style="background: linear-gradient(135deg, #ef4444, #dc2626); box-shadow: 0 4px 15px rgba(239,68,68,0.3)"
          >
            <X class="w-5 h-5" />
            Cancel Booking
          </button>
        </div>
      </div>

      <div
        v-if="bookingResult && !hotelBooking"
        class="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center"
      >
        <div
          class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
          style="background: #e8f3fb"
        >
          <CircleCheck class="w-8 h-8" style="color:#0168a7" />
        </div>
        <h3 class="text-xl font-bold text-gray-900 mb-2">Booking Found</h3>
        <p class="text-gray-500 text-sm mb-1">Code: <span class="font-semibold text-gray-700">{{ bookingResult.bookingCode }}</span></p>
        <p class="text-gray-500 text-sm">Type: <span class="font-semibold text-gray-700 capitalize">{{ bookingResult.type }}</span></p>
        <button @click="resetSearch" class="mt-6 text-sm font-semibold" style="color:#0168a7">← Search again</button>
      </div>
    </section>

    <!-- ── Cancel Confirmation Modal ───────────────────────────────── -->
    <Transition name="fade">
      <div
        v-if="showCancelModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        style="background: rgba(0,0,0,0.5); backdrop-filter: blur(4px)"
        @click.self="showCancelModal = false"
      >
        <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
          <div
            class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
            style="background:#fef2f2"
          >
            <TriangleAlert class="w-8 h-8 text-red-500" />
          </div>
          <h3 class="text-xl font-extrabold text-gray-900 mb-2">Cancel Booking?</h3>
          <p class="text-gray-500 text-sm mb-2">
            Are you sure you want to cancel booking
            <span class="font-semibold text-gray-700">{{ bookingResult?.bookingCode }}</span>?
          </p>
          <p class="text-red-500 text-xs mb-6">This action cannot be undone.</p>

          <div class="flex gap-3">
            <button
              @click="showCancelModal = false"
              class="flex-1 px-6 py-3 rounded-xl font-semibold border-2 border-gray-200 text-gray-700 hover:bg-gray-50 transition-all"
            >
              Keep Booking
            </button>
            <button
              @click="handleCancel"
              :disabled="cancelling"
              class="flex-1 px-6 py-3 rounded-xl font-bold text-white transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60"
              style="background: linear-gradient(135deg, #ef4444, #dc2626)"
            >
              <LoaderCircle v-if="cancelling" class="animate-spin w-4 h-4" />
              {{ cancelling ? 'Cancelling...' : 'Yes, Cancel' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
input:focus,
select:focus {
  ring: 2px solid #0168a7;
  outline: none;
  border-color: #0168a7;
  box-shadow: 0 0 0 3px rgba(1, 104, 167, 0.15);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
