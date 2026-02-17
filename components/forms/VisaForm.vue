<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { navigateTo, useRoute } from 'nuxt/app'
import PassengerSelect from './PassengerSelect.vue'

const route = useRoute()

// Define emit
const emit = defineEmits<{
  search: [searchData: any]
}>()

const form = ref({
  country: '',
  nationality: '',
  persons: { persons: 0 }
})

// Validation errors
const errors = ref({
  country: '',
  nationality: '',
  general: '',
  persons: ''
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
  'United States',
  'Canada',
  'France',
  'Germany',
  'Italy',
  'Spain',
  'Turkey',
  'South Africa'
]

// Watch form fields and clear errors on change
watch(() => form.value.country, () => {
  if (errors.value.country) errors.value.country = ''
})

watch(() => form.value.nationality, () => {
  if (errors.value.nationality) errors.value.nationality = ''
})

watch(() => form.value.persons, () => {
  if (errors.value.general) errors.value.general = ''
}, { deep: true })

// Total persons validation
const totalPersons = computed(() => {
  return form.value.persons.persons
})

// Clear errors
const clearErrors = () => {
  errors.value = {
    country: '',
    nationality: '',
    general: '',
    persons: ''
  }
}

// Validation functions
const validateCountry = (): boolean => {
  if (!form.value.country) {
    errors.value.country = 'Destination country is required'
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

const validatePersons = (): boolean => {
  if (totalPersons.value === 0) {
    errors.value.general = 'At least 1 person is required'
    return false
  }

  if (totalPersons.value > 10) {
    errors.value.general = 'Maximum 10 persons allowed per application'
    return false
  }

  return true
}

const validateForm = (): boolean => {
  clearErrors()

  const countryValid = validateCountry()
  const nationalityValid = validateNationality()
  const personsValid = validatePersons()

  return countryValid && nationalityValid && personsValid
}

// Prefill from query params
const prefillFromQuery = () => {
  const query = route.query

  if (!query || Object.keys(query).length === 0) return

  form.value.country = (query.country as string) || ''
  form.value.nationality = (query.nationality as string) || ''

  form.value.persons = {
    persons: Number.parseInt(query.persons as string) || 1,
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
    nationality: form.value.nationality,
    persons: form.value.persons.persons,
  }
}

// Scroll to first error
const scrollToFirstError = () => {
  const firstErrorField = document.querySelector('.border-red-500')
  if (firstErrorField) {
    firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

// Navigate to visa page
const navigateToVisaPage = async () => {
  if (route.path === '/travel/visas') {
    return
  }

  const queryParams = buildQueryParams()
  await navigateTo({
    path: '/travel/visas',
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
  
  await navigateToVisaPage()
}
</script>

<template>
  <!-- General Error -->
  <div v-if="errors.general" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
    <p class="text-red-600 text-sm font-medium">{{ errors.general }}</p>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-4 gap-4">
    <div>
      <label for="destination" class="block text-sm font-medium text-gray-700 mb-2">
        Destination
      </label>
      <select 
        id="destination"
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
      <label for="nationality" class="block text-sm font-medium text-gray-700 mb-2">
        Nationality
      </label>
      <select 
        id="nationality"
        v-model="form.nationality" 
        :class="[
          'w-full px-4 py-3 rounded-lg focus:border-transparent',
          errors.nationality 
            ? 'border-red-500 focus:ring-red-500 border-2' 
            : 'border border-gray-300'
        ]"
      >
        <option value="">Select Nationality</option>
        <option v-for="n in countries" :key="n" :value="n">{{ n }}</option>
      </select>
    </div>

    <div>
      <PassengerSelect
        v-model="form.persons"
        label="Applicants"
        id="persons"
        mode="visa"
        :class="{ 'border-red-500 focus:ring-red-500': errors.persons }"
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