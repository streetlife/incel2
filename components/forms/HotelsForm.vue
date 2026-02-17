<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { navigateTo, useRoute } from 'nuxt/app'
import DateRangeInput from './DateRangeInput.vue'
import PassengerSelect from './PassengerSelect.vue'

const route = useRoute()

// Define emit
const emit = defineEmits<{
  search: [searchData: any]
}>()

const form = ref({
  country: '',
  city: '',
  nationality: '',
  checkOut: {
    start: '',
    end: ''
  },
  guests: { adults: 1, children: 0, infants: 0 }
})

// Validation errors
const errors = ref({
  country: '',
  city: '',
  nationality: '',
  checkOut: '',
  general: ''
})

const countries = [
  'Nigeria',
  'Ghana',
  'Cameroon',
  'Togo',
  'Congo',
  'Burkina Faso',
  'Benin',
  'Mali',
  'Chad',
  'Guinea',
  'Sierra Leone',
  'Guinea-Bissau',
  'Mauritania',
  'Senegal',
  'Côte d\'Ivoire',
  'Burundi',
  'Rwanda',
  'Uganda',
  'Tanzania',
  'Zambia',
  'Zimbabwe',
  'Namibia',
  'United Arab Emirates',
  'United Kingdom',
  'France',
  'Turkey',
  'South Africa',
  'USA'
]

// Watch form fields and clear errors on change
watch(() => form.value.country, () => {
  if (errors.value.country) errors.value.country = ''
})

watch(() => form.value.city, () => {
  if (errors.value.city) errors.value.city = ''
})

watch(() => form.value.nationality, () => {
  if (errors.value.nationality) errors.value.nationality = ''
})

watch(() => form.value.checkOut, () => {
  if (errors.value.checkOut) errors.value.checkOut = ''
}, { deep: true })

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
    nationality: '',
    checkOut: '',
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
  if (!form.value.country) {
    errors.value.country = 'Country is required'
    return false
  }
  return true
}

const validateCity = (): boolean => {
  if (!form.value.city) {
    errors.value.city = 'City is required'
    return false
  }
  return true
}

const validateNationality = (): boolean => {
  if (!form.value.nationality) {
    errors.value.nationality = 'Nationality is required'
    return false
  }
  return true
}

const validateCheckOut = (): boolean => {
  if (!form.value.checkOut.start || !form.value.checkOut.end) {
    errors.value.checkOut = 'Check-in and check-out dates are required'
    return false
  }

  if (!isValidFutureDate(form.value.checkOut.start)) {
    errors.value.checkOut = 'Check-in date must be today or in the future'
    return false
  }

  if (new Date(form.value.checkOut.end) <= new Date(form.value.checkOut.start)) {
    errors.value.checkOut = 'Check-out date must be after check-in date'
    return false
  }

  return true
}

const validateGuests = (): boolean => {
  if (totalGuests.value === 0) {
    errors.value.general = 'At least 1 guest is required'
    return false
  }

  if (totalGuests.value > 20) {
    errors.value.general = 'Maximum 20 guests allowed'
    return false
  }

  return true
}

const validateForm = (): boolean => {
  clearErrors()

  const countryValid = validateCountry()
  const cityValid = validateCity()
  const nationalityValid = validateNationality()
  const checkOutValid = validateCheckOut()
  const guestsValid = validateGuests()

  return countryValid && cityValid && nationalityValid && checkOutValid && guestsValid
}

// Prefill from query params
const prefillFromQuery = () => {
  const query = route.query

  if (!query || Object.keys(query).length === 0) return

  form.value.country = (query.country as string) || ''
  form.value.city = (query.city as string) || ''
  form.value.nationality = (query.nationality as string) || ''
  
  if (query.checkInStart && query.checkInEnd) {
    form.value.checkOut = {
      start: query.checkInStart as string,
      end: query.checkInEnd as string
    }
  }

  form.value.guests = {
    adults: Number.parseInt(query.adults as string) || 1,
    children: Number.parseInt(query.children as string) || 0,
    infants: Number.parseInt(query.infants as string) || 0
  }
}

onMounted(() => {
  prefillFromQuery()
})

watch(
  () => route.query,
  () => {
    prefillFromQuery()
  },
  { deep: true }
)

// Build query params
const buildQueryParams = () => {
  return {
    country: form.value.country,
    city: form.value.city,
    nationality: form.value.nationality,
    checkInStart: form.value.checkOut.start,
    checkInEnd: form.value.checkOut.end,
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

// Navigate to hotels page
const navigateToHotelsPage = async () => {
  if (route.path === '/travel/hotels') {
    return
  }

  const queryParams = buildQueryParams()
  await navigateTo({
    path: '/travel/hotels',
    query: queryParams
  })
}

const submit = async () => {
  if (!validateForm()) {
    scrollToFirstError()
    return
  }

  const searchData = {
    ...form.value,
    checkInStart: form.value.checkOut.start,
    checkInEnd: form.value.checkOut.end
  }

  emit('search', searchData)
  
  await navigateToHotelsPage()
}
</script>

<template>
  <!-- General Error -->
  <div v-if="errors.general" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
    <p class="text-red-600 text-sm font-medium">{{ errors.general }}</p>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-6 gap-4">
    <div>
      <label for="nationality" class="block text-sm font-medium text-gray-700 mb-2">
        Nationality
      </label>
      <select 
        id="nationality"
        v-model="form.nationality" 
        :class="[
          'input',
          { 'border-red-500 focus:ring-red-500': errors.nationality }
        ]"
      >
        <option value="">Select Nationality</option>
        <option v-for="n in countries" :key="n" :value="n">{{ n }}</option>
      </select>
    </div>

    <div>
      <label for="country" class="block text-sm font-medium text-gray-700 mb-2">
        Country
      </label>
      <select 
        id="country"
        v-model="form.country" 
        :class="[
          'input',
          { 'border-red-500 focus:ring-red-500': errors.country }
        ]"
      >
        <option value="">Select Country</option>
        <option v-for="n in countries" :key="n" :value="n">{{ n }}</option>
      </select>
    </div>
    
    <div>
      <label for="city" class="block text-sm font-medium text-gray-700 mb-2">
        City
      </label>
      <input 
        id="city"
        v-model="form.city"
        type="text"
        :class="[
          'input',
          { 'border-red-500 focus:ring-red-500': errors.city }
        ]"
      />
    </div>

    <div>
      <DateRangeInput
        v-model="form.checkOut"
        label="Check-in / Check-out"
        :allow-past-dates="false"
        :class="{ 'border-red-500 focus:ring-red-500': errors.checkOut }"
      />
      <p v-if="errors.checkOut" class="mt-1 text-xs text-red-600">{{ errors.checkOut }}</p>
    </div>

    <div>
      <PassengerSelect
        v-model="form.guests"
        label="Guests"
        id="hotel-guests"
        mode="hotel"
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
.input {
  @apply w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent;
}
.btn-primary {
  @apply bg-yellow-400 hover:bg-yellow-500 font-bold rounded-lg text-gray-900;
}
</style>