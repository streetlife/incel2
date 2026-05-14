<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { navigateTo, useRoute } from 'nuxt/app'
import PassengerSelect from './PassengerSelect.vue'
import DateInput from './DateInput.vue'
import { useTour } from '../../composables/useTour'

const route = useRoute()

const emit = defineEmits<{
  search: [searchData: any]
}>()

const { countries, cities, countriesLoading, citiesLoading, fetchCountries, fetchCities } = useTour()

const form = ref({
  countryId: 0,
  countryName: '',
  cityId: 0,
  cityName: '',
  guests: { adults: 1, children: 0, infants: 0 },
  date: ''
})

// Validation errors
const errors = ref({
  country: '',
  city: '',
  date: '',
  general: ''
})

// When country changes, load cities and reset city selection
watch(() => form.value.countryId, (id) => {
  form.value.cityId = 0
  form.value.cityName = ''
  if (errors.value.country) errors.value.country = ''
  if (id) fetchCities(id)
})

watch(() => form.value.cityId, () => {
  if (errors.value.city) errors.value.city = ''
})

watch(() => form.value.date, () => {
  if (errors.value.date) errors.value.date = ''
})

watch(() => form.value.guests, () => {
  if (errors.value.general) errors.value.general = ''
}, { deep: true })

// Total guests validation
const totalGuests = computed(() => {
  return form.value.guests.adults + form.value.guests.children + form.value.guests.infants
})

// Clear errors
const clearErrors = () => {
  errors.value = {
    country: '',
    city: '',
    date: '',
    general: ''
  }
}

// Validation functions
const isValidFutureDate = (dateString: string): boolean => {
  const date = new Date(dateString)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date >= today
}

const validateCountry = (): boolean => {
  if (!form.value.countryId) {
    errors.value.country = 'Country is required'
    return false
  }
  return true
}

const validateCity = (): boolean => {
  if (!form.value.cityId) {
    errors.value.city = 'City is required'
    return false
  }
  return true
}

const validateDate = (): boolean => {
  if (!form.value.date) {
    errors.value.date = 'Date is required'
    return false
  }

  if (!isValidFutureDate(form.value.date)) {
    errors.value.date = 'Date must be today or in the future'
    return false
  }

  return true
}

const validateGuests = (): boolean => {
  if (totalGuests.value === 0) {
    errors.value.general = 'At least 1 guest is required'
    return false
  }

  if (totalGuests.value > 50) {
    errors.value.general = 'Maximum 50 guests allowed'
    return false
  }

  return true
}

const validateForm = (): boolean => {
  clearErrors()

  const countryValid = validateCountry()
  const cityValid = validateCity()
  const dateValid = validateDate()
  const guestsValid = validateGuests()

  return countryValid && cityValid && dateValid && guestsValid
}

// Prefill from query params
const prefillFromQuery = async () => {
  const query = route.query

  if (!query || Object.keys(query).length === 0) return

  const countryId = Number.parseInt(query.country_id as string) || 0
  const cityId = Number.parseInt(query.city_id as string) || 0

  form.value.date = (query.date as string) || ''
  form.value.guests = {
    adults: Number.parseInt(query.adults as string) || 1,
    children: Number.parseInt(query.children as string) || 0,
    infants: Number.parseInt(query.infants as string) || 0
  }

  if (countryId) {
    form.value.countryId = countryId
    form.value.countryName = (query.country_name as string) || ''
    await fetchCities(countryId)
    form.value.cityId = cityId
    form.value.cityName = (query.city_name as string) || ''
  }
}

onMounted(async () => {
  await fetchCountries()
  await prefillFromQuery()
})

watch(
  () => route.query,
  async () => {
    await prefillFromQuery()
  },
  { deep: true }
)

// Build query params
const buildQueryParams = () => {
  return {
    country_id: form.value.countryId,
    country_name: form.value.countryName,
    city_id: form.value.cityId,
    city_name: form.value.cityName,
    date: form.value.date,
    adults: form.value.guests.adults,
    children: form.value.guests.children,
    infants: form.value.guests.infants
  }
}

// Scroll to first error
const scrollToFirstError = () => {
  const firstErrorField = document.querySelector('.border-red-500')
  if (firstErrorField) {
    firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

// Navigate to tours page
const navigateToToursPage = async () => {
  if (route.path === '/travel/tours') {
    return
  }

  const queryParams = buildQueryParams()
  await navigateTo({
    path: '/travel/tours',
    query: queryParams
  })
}

const submit = async () => {
  if (!validateForm()) {
    scrollToFirstError()
    return
  }

  const searchData = {
    countryId: form.value.countryId,
    countryName: form.value.countryName,
    cityId: form.value.cityId,
    cityName: form.value.cityName,
    date: form.value.date,
    guests: { ...form.value.guests },
  }

  emit('search', searchData)

  await navigateToToursPage()
}
</script>

<template>
  <!-- General Error -->
  <div v-if="errors.general" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
    <p class="text-red-600 text-sm font-medium">{{ errors.general }}</p>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-5 gap-4">
    <!-- Country -->
    <div>
      <label for="country" class="block text-sm font-medium text-gray-700 mb-2">Country</label>
      <div class="relative">
        <select
          id="country"
          v-model="form.countryId"
          :disabled="countriesLoading"
          :class="[
            'w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-colors appearance-none',
            errors.country
              ? 'border-red-500 focus:ring-red-500 border-2'
              : 'border border-gray-300 focus:ring-primary',
            countriesLoading ? 'opacity-60 cursor-not-allowed' : ''
          ]"
          @change="(e) => {
            const sel = countries.find(c => c.id === form.countryId)
            form.countryName = sel?.name ?? ''
          }"
        >
          <option :value="0">{{ countriesLoading ? 'Loading…' : 'Select Country' }}</option>
          <option v-for="c in countries" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
        <svg v-if="!countriesLoading" class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
        <svg v-else class="animate-spin absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
      </div>
      <p v-if="errors.country" class="text-red-500 text-xs mt-1">{{ errors.country }}</p>
    </div>

    <!-- City -->
    <div>
      <label for="city" class="block text-sm font-medium text-gray-700 mb-2">City</label>
      <div class="relative">
        <select
          id="city"
          v-model="form.cityId"
          :disabled="!form.countryId || citiesLoading"
          :class="[
            'w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-colors appearance-none',
            errors.city
              ? 'border-red-500 focus:ring-red-500 border-2'
              : 'border border-gray-300 focus:ring-primary',
            (!form.countryId || citiesLoading) ? 'opacity-60 cursor-not-allowed' : ''
          ]"
          @change="() => {
            const sel = cities.find(c => Number(c.city_id) === form.cityId)
            form.cityName = sel?.city_name ?? ''
          }"
        >
          <option :value="0">
            {{ !form.countryId ? 'Select country first' : citiesLoading ? 'Loading…' : 'Select City' }}
          </option>
          <option v-for="c in cities" :key="c.city_id" :value="Number(c.city_id)">{{ c.city_name }}</option>
        </select>
        <svg v-if="!citiesLoading" class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
        <svg v-else class="animate-spin absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
      </div>
      <p v-if="errors.city" class="text-red-500 text-xs mt-1">{{ errors.city }}</p>
    </div>

    <div>
      <PassengerSelect
        v-model="form.guests"
        label="Guests"
        id="tour-guests"
        mode="tour"
      />
    </div>

    <div>
      <DateInput
        v-model="form.date"
        label="Date"
        id="tour-date"
        :allow-past-dates="false"
        :class="{ 'border-red-500 focus:ring-red-500': errors.date }"
      />
    </div>

    <div class="mt-7">
      <button
        @click="submit"
        class="btn-primary w-full py-3 px-6 flex items-center justify-center gap-2 transform hover:scale-105 transition"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        Search
      </button>
    </div>
  </div>
</template>

<style scoped>
.btn-primary {
  @apply bg-yellow-400 hover:bg-yellow-500 font-bold rounded-lg text-gray-900;
}
</style>