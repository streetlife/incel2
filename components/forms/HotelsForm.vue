<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { navigateTo, useRoute } from 'nuxt/app'
import DateRangeInput from './DateRangeInput.vue'
import GuestsRooms from './GuestsRooms.vue';

const route = useRoute()

const emit = defineEmits<{
  search: [searchData: any]
}>()

const form = ref({
  city: '',
  nationality: '',
  checkOut: {
    start: '',
    end: ''
  },
  accommodation: {
    rooms: [{ adults: 1, children: 0, infants: 0 }]
  }
})

const errors = ref({
  city: '',
  nationality: '',
  checkOut: '',
  general: ''
})

const countries = [
  'Nigeria', 'Ghana', 'Cameroon', 'Togo', 'Congo', 'Burkina Faso', 'Benin',
  'Mali', 'Chad', 'Guinea', 'Sierra Leone', 'Guinea-Bissau', 'Mauritania',
  'Senegal', "Côte d'Ivoire", 'Burundi', 'Rwanda', 'Uganda', 'Tanzania',
  'Zambia', 'Zimbabwe', 'Namibia', 'United Arab Emirates', 'United Kingdom',
  'France', 'Turkey', 'South Africa', 'USA'
]

// ── Derived totals ─────────────────────────────────────────────────────────────
const totalGuests = computed(() =>
  form.value.accommodation.rooms.reduce(
    (sum, r) => sum + (r.adults ?? 0) + (r.children ?? 0) + (r.infants ?? 0),
    0
  )
)

const totalRooms = computed(() => form.value.accommodation.rooms.length)

// ── Watchers — clear errors on input ─────────────────────────────────────────
watch(() => form.value.city, () => { if (errors.value.city) errors.value.city = '' })
watch(() => form.value.nationality, () => { if (errors.value.nationality) errors.value.nationality = '' })
watch(() => form.value.checkOut, () => { if (errors.value.checkOut) errors.value.checkOut = '' }, { deep: true })
watch(() => form.value.accommodation, () => { if (errors.value.general) errors.value.general = '' }, { deep: true })

// ── Validation ────────────────────────────────────────────────────────────────
const isValidFutureDate = (d: string) => new Date(d) >= Object.assign(new Date(), { hours: 0, minutes: 0, seconds: 0, ms: 0 })

const clearErrors = () => {
  errors.value = { city: '', nationality: '', checkOut: '', general: '' }
}

const validateForm = (): boolean => {
  clearErrors()
  let valid = true

  if (!form.value.city) { errors.value.city = 'City is required'; valid = false }
  if (!form.value.nationality) { errors.value.nationality = 'Nationality is required'; valid = false }

  if (!form.value.checkOut.start || !form.value.checkOut.end) {
    errors.value.checkOut = 'Check-in and check-out dates are required'; valid = false
  } else if (!isValidFutureDate(form.value.checkOut.start)) {
    errors.value.checkOut = 'Check-in date must be today or in the future'; valid = false
  } else if (new Date(form.value.checkOut.end) <= new Date(form.value.checkOut.start)) {
    errors.value.checkOut = 'Check-out date must be after check-in date'; valid = false
  }

  if (totalGuests.value === 0) { errors.value.general = 'At least 1 guest is required'; valid = false }
  if (totalGuests.value > 20)  { errors.value.general = 'Maximum 20 guests allowed';    valid = false }

  return valid
}

// ── Query param helpers ───────────────────────────────────────────────────────
// Serialise rooms → flat query: rooms=2&r0_adults=2&r0_children=1&r1_adults=1…
const buildQueryParams = () => {
  const q: Record<string, any> = {
    city: form.value.city,
    nationality: form.value.nationality,
    checkInStart: form.value.checkOut.start,
    checkInEnd: form.value.checkOut.end,
    rooms: totalRooms.value,
  }

  form.value.accommodation.rooms.forEach((r, i) => {
    q[`r${i}_adults`]   = r.adults   ?? 1
    q[`r${i}_children`] = r.children ?? 0
    q[`r${i}_infants`]  = r.infants  ?? 0
  })
  return q
}

// Restore rooms from flat query params
const prefillFromQuery = () => {
  const q = route.query
  if (!q || Object.keys(q).length === 0) return

  form.value.city = (q.city as string) || ''
  form.value.nationality = (q.nationality as string) || ''

  if (q.checkInStart && q.checkInEnd) {
    form.value.checkOut = { start: q.checkInStart as string, end: q.checkInEnd as string }
  }

  const roomCount = Number.parseInt(q.rooms as string) || 1
  form.value.accommodation = {
    rooms: Array.from({ length: roomCount }, (_, i) => ({
      adults: Number.parseInt(q[`r${i}_adults`]   as string) || 1,
      children: Number.parseInt(q[`r${i}_children`] as string) || 0,
      infants: Number.parseInt(q[`r${i}_infants`]  as string) || 0,
    }))
  }
}

onMounted(prefillFromQuery)
watch(() => route.query, prefillFromQuery, { deep: true })

// ── Submit ────────────────────────────────────────────────────────────────────
const scrollToFirstError = () =>
  document.querySelector('.border-red-500')?.scrollIntoView({ behavior: 'smooth', block: 'center' })

const submit = async () => {
  if (!validateForm()) { scrollToFirstError(); return }

  const searchData = {
    city:         form.value.city,
    nationality:  form.value.nationality,
    checkInStart: form.value.checkOut.start,
    checkInEnd:   form.value.checkOut.end,
    rooms:        form.value.accommodation.rooms,
    totalGuests:  totalGuests.value,
    totalRooms:   totalRooms.value,
  }

  emit('search', searchData)

  if (route.path !== '/travel/hotels') {
    await navigateTo({ path: '/travel/hotels', query: buildQueryParams() })
  }
}
</script>

<template>
  <!-- General Error -->
  <div v-if="errors.general" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
    <p class="text-red-600 text-sm font-medium">{{ errors.general }}</p>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-5 gap-4">

    <!-- Nationality -->
    <div>
      <label for="nationality" class="block text-sm font-medium text-gray-700 mb-2">Nationality</label>
      <select
        id="nationality"
        v-model="form.nationality"
        :class="['input', { 'border-red-500 focus:ring-red-500': errors.nationality }]"
      >
        <option value="">Select Nationality</option>
        <option v-for="n in countries" :key="n" :value="n">{{ n }}</option>
      </select>
      <p v-if="errors.nationality" class="mt-1 text-xs text-red-600">{{ errors.nationality }}</p>
    </div>

    <!-- City -->
    <div>
      <label for="city" class="block text-sm font-medium text-gray-700 mb-2">City</label>
      <input
        id="city"
        v-model="form.city"
        type="text"
        :class="['input', { 'border-red-500 focus:ring-red-500': errors.city }]"
      />
      <p v-if="errors.city" class="mt-1 text-xs text-red-600">{{ errors.city }}</p>
    </div>

    <!-- Check-in / Check-out -->
    <div>
      <DateRangeInput
        v-model="form.checkOut"
        label="Check-in / Check-out"
        :allow-past-dates="false"
        :class="{ 'border-red-500': errors.checkOut }"
      />
      <p v-if="errors.checkOut" class="mt-1 text-xs text-red-600">{{ errors.checkOut }}</p>
    </div>

    <!-- Guests & Rooms -->
    <div>
      <GuestsRooms
        v-model="form.accommodation"
        label="Guests & Rooms"
        id="hotel-guests-rooms"
      />
    </div>

    <!-- Search button -->
    <div class="mt-7">
      <button
        class="btn-primary w-full py-3 px-6 flex items-center justify-center gap-2 transform hover:scale-105 transition"
        @click="submit"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        Search
      </button>
    </div>
  </div>
</template>

<style scoped>
.input {
  @apply w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent;
}
.btn-primary {
  @apply bg-yellow-400 hover:bg-yellow-500 font-bold rounded-lg text-gray-900;
}
</style>