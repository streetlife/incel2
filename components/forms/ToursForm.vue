<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { navigateTo, useRoute } from 'nuxt/app'
import PassengerSelect from './PassengerSelect.vue'
import DateInput from './DateInput.vue'

const route = useRoute()

// Define emit
const emit = defineEmits<{
  search: [searchData: any]
}>()

const form = ref({
  country: '',
  city: '',
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
  'USA',
  'Japan',
  'Indonesia'
]

// Watch form fields and clear errors on change
watch(() => form.value.country, () => {
  if (errors.value.country) errors.value.country = ''
})

watch(() => form.value.city, () => {
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
const prefillFromQuery = () => {
  const query = route.query

  if (!query || Object.keys(query).length === 0) return

  form.value.country = (query.country as string) || ''
  form.value.city = (query.city as string) || ''
  form.value.date = (query.date as string) || ''

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

  const searchData = { ...form.value }

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
    <div>
      <label for="country" class="block text-sm font-medium text-gray-700 mb-2">
        Country
      </label>
      <select 
        id="country"
        v-model="form.country" 
        :class="[
          'w-full px-4 py-3 rounded-lg focus:border-transparent',
          errors.country 
            ? 'border-red-500 focus:ring-red-500 border-2' 
            : 'border border-gray-300'
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
          'w-full px-4 py-3 rounded-lg focus:ring-2 focus:border-transparent',
          errors.city 
            ? 'border-red-500 focus:ring-red-500 border-2' 
            : 'border border-gray-300 focus:ring-primary'
        ]"
      />
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