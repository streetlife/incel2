<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import AirportSelect from '../AirportSelect.vue'
import DateInput from './DateInput.vue'
import PassengerSelect from './PassengerSelect.vue'
import { navigateTo, useRoute } from 'nuxt/app'

const route = useRoute()

// Define emit
const emit = defineEmits<{
  search: [searchData: any]
}>()

const tripType = ref('round-trip')

const form = ref({
  from: '',
  to: '',
  departing: '',
  returning: '',
  passengers: { adults: 1, children: 0, infants: 0 },
  travelClass: 'economy',
  direct: false,
  flexibleDates: false,
  stops: 'any' // For multi-city
})

// Validation errors
const errors = ref({
  from: '',
  to: '',
  departing: '',
  returning: '',
  general: ''
})

// Multi-city flights array
const multiCityFlights = ref([
  { from: '', to: '', departing: '' },
  { from: '', to: '', departing: '' },
  { from: '', to: '', departing: '' },
  { from: '', to: '', departing: '' },
  { from: '', to: '', departing: '' },
  { from: '', to: '', departing: '' }
])

// Multi-city errors
const multiCityErrors = ref<Array<{ from: string; to: string; departing: string }>>([
  { from: '', to: '', departing: '' },
  { from: '', to: '', departing: '' },
  { from: '', to: '', departing: '' },
  { from: '', to: '', departing: '' },
  { from: '', to: '', departing: '' },
  { from: '', to: '', departing: '' }
])

const airports = [
  "Lagos (LOS)",
  "Abuja (ABV)",
  "Port Harcourt (PHC)",
  "London Heathrow (LHR)",
  "New York (JFK)",
  "Dubai (DXB)",
  "Paris (CDG)"
]

// Total passengers validation
const totalPassengers = computed(() => {
  return form.value.passengers.adults + form.value.passengers.children + form.value.passengers.infants
})

// Watch form fields and clear errors on change
watch(() => form.value.from, () => {
  if (errors.value.from) errors.value.from = ''
})

watch(() => form.value.to, () => {
  if (errors.value.to) errors.value.to = ''
})

watch(() => form.value.departing, () => {
  if (errors.value.departing) errors.value.departing = ''
})

watch(() => form.value.returning, () => {
  if (errors.value.returning) errors.value.returning = ''
})

watch(() => form.value.passengers, () => {
  if (errors.value.general) errors.value.general = ''
}, { deep: true })

// Watch multi-city flights and clear errors on change
watch(() => multiCityFlights.value, (newFlights) => {
  newFlights.forEach((flight, index) => {
    if (flight.from && multiCityErrors.value[index].from) {
      multiCityErrors.value[index].from = ''
    }
    if (flight.to && multiCityErrors.value[index].to) {
      multiCityErrors.value[index].to = ''
    }
    if (flight.departing && multiCityErrors.value[index].departing) {
      multiCityErrors.value[index].departing = ''
    }
  })
}, { deep: true })

// Clear errors
const clearErrors = () => {
  errors.value = {
    from: '',
    to: '',
    departing: '',
    returning: '',
    general: ''
  }
  multiCityErrors.value = multiCityErrors.value.map(() => ({
    from: '',
    to: '',
    departing: ''
  }))
}

// Validate form
// Helper function to validate date is today or future
const isValidFutureDate = (dateString: string): boolean => {
  const date = new Date(dateString)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date >= today
}

// Helper function to validate return date is after departure
const isReturnDateValid = (departDate: string, returnDate: string): boolean => {
  return new Date(returnDate) > new Date(departDate)
}

// Validate a single multi-city flight
const validateMultiCityFlight = (flight: any, index: number): boolean => {
  let isValid = true

  if (!flight.from) {
    multiCityErrors.value[index].from = 'Departure city is required'
    isValid = false
  }

  if (!flight.to) {
    multiCityErrors.value[index].to = 'Arrival city is required'
    isValid = false
  }

  if (flight.from && flight.to && flight.from === flight.to) {
    multiCityErrors.value[index].to = 'Arrival city must be different from departure city'
    isValid = false
  }

  if (!flight.departing) {
    multiCityErrors.value[index].departing = 'Departure date is required'
    isValid = false
  } else if (!isValidFutureDate(flight.departing)) {
    multiCityErrors.value[index].departing = 'Date must be today or in the future'
    isValid = false
  }

  return isValid
}

// Validate all multi-city flights
const validateMultiCityFlights = (): boolean => {
  const filledFlights = multiCityFlights.value.filter(f => f.from || f.to || f.departing)
  
  if (filledFlights.length < 2) {
    errors.value.general = 'Please fill in at least 2 flights for multi-city booking'
    return false
  }

  let isValid = true
  filledFlights.forEach((flight, index) => {
    if (!validateMultiCityFlight(flight, index)) {
      isValid = false
    }
  })

  return isValid
}

// Validate cities
const validateCities = (): boolean => {
  let isValid = true

  if (!form.value.from) {
    errors.value.from = 'Departure city is required'
    isValid = false
  }

  if (!form.value.to) {
    errors.value.to = 'Arrival city is required'
    isValid = false
  }

  if (form.value.from && form.value.to && form.value.from === form.value.to) {
    errors.value.to = 'Arrival city must be different from departure city'
    isValid = false
  }

  return isValid
}

// Validate departure date
const validateDepartureDate = (): boolean => {
  if (!form.value.departing) {
    errors.value.departing = 'Departure date is required'
    return false
  }

  if (!isValidFutureDate(form.value.departing)) {
    errors.value.departing = 'Departure date must be today or in the future'
    return false
  }

  return true
}

// Validate return date for round-trip
const validateReturnDate = (): boolean => {
  if (tripType.value !== 'round-trip') {
    return true
  }

  if (!form.value.returning) {
    errors.value.returning = 'Return date is required for round-trip'
    return false
  }

  if (form.value.departing && !isReturnDateValid(form.value.departing, form.value.returning)) {
    errors.value.returning = 'Return date must be after departure date'
    return false
  }

  return true
}

// Validate single trip (round-trip or one-way)
const validateSingleTrip = (): boolean => {
  const citiesValid = validateCities()
  const departureValid = validateDepartureDate()
  const returnValid = validateReturnDate()

  return citiesValid && departureValid && returnValid
}

// Validate passengers
const validatePassengers = (): boolean => {
  if (totalPassengers.value === 0) {
    errors.value.general = 'At least 1 passenger is required'
    return false
  }

  if (totalPassengers.value > 9) {
    errors.value.general = 'Maximum 9 passengers allowed'
    return false
  }

  return true
}

// Main validation function
const validateForm = (): boolean => {
  clearErrors()

  const isTripValid = tripType.value === 'multi-city' 
    ? validateMultiCityFlights() 
    : validateSingleTrip()

  const arePassengersValid = validatePassengers()

  return isTripValid && arePassengersValid
}

// Function to prefill form from query params
const prefillFromQuery = () => {
  const query = route.query

  if (!query || Object.keys(query).length === 0) return

  // Set trip type
  if (query.tripType) {
    tripType.value = query.tripType as string
  }

  // Handle multi-city
  if (query.tripType === 'multi-city' && query.flights) {
    try {
      const flights = JSON.parse(query.flights as string)
      multiCityFlights.value = flights.map((f: any) => ({
        from: f.from || '',
        to: f.to || '',
        departing: f.departing || ''
      }))
    } catch (e) {
      console.error('Error parsing multi-city flights:', e)
    }

    // Set passengers for multi-city
    form.value.passengers = {
      adults: Number.parseInt(query.adults as string) || 1,
      children: Number.parseInt(query.children as string) || 0,
      infants: Number.parseInt(query.infants as string) || 0
    }
    form.value.travelClass = (query.travelClass as string) || 'economy'
    form.value.stops = (query.stops as string) || 'any'
  } else {
    // Handle round-trip and one-way
    form.value.from = (query.from as string) || ''
    form.value.to = (query.to as string) || ''
    form.value.departing = (query.departing as string) || ''
    form.value.returning = (query.returning as string) || ''
    form.value.travelClass = (query.travelClass as string) || 'economy'
    form.value.direct = query.direct === 'true'
    form.value.flexibleDates = query.flexibleDates === 'true'

    // Set passengers
    form.value.passengers = {
      adults: Number.parseInt(query.adults as string) || 1,
      children: Number.parseInt(query.children as string) || 0,
      infants: Number.parseInt(query.infants as string) || 0
    }
  }
}

// Prefill on mount
onMounted(() => {
  prefillFromQuery()
})

// Watch for route changes
watch(
  () => route.query,
  () => {
    prefillFromQuery()
  },
  { deep: true }
)

// Reset multi-city flights when switching trip types
watch(tripType, (newType) => {
  clearErrors()
  if (newType === 'multi-city') {
    // Only reset if coming from query params
    if (!route.query.tripType || route.query.tripType !== 'multi-city') {
      multiCityFlights.value = multiCityFlights.value.map(() => ({
        from: '',
        to: '',
        departing: ''
      }))
    }
  }
})

// Build search data based on trip type
const buildSearchData = () => {
  if (tripType.value === 'multi-city') {
    return {
      tripType: tripType.value,
      flights: multiCityFlights.value.filter(f => f.from || f.to || f.departing),
      passengers: form.value.passengers,
      travelClass: form.value.travelClass,
      stops: form.value.stops
    }
  }

  return {
    tripType: tripType.value,
    ...form.value
  }
}

// Build query params for multi-city
const buildMultiCityQueryParams = (searchData: any) => {
  return {
    tripType: searchData.tripType,
    flights: JSON.stringify(searchData.flights),
    adults: searchData.passengers.adults,
    children: searchData.passengers.children,
    infants: searchData.passengers.infants,
    travelClass: searchData.travelClass,
    stops: searchData.stops
  }
}

// Build query params for round-trip/one-way
const buildSingleTripQueryParams = () => {
  const queryParams: any = {
    tripType: tripType.value,
    from: form.value.from,
    to: form.value.to,
    departing: form.value.departing,
    travelClass: form.value.travelClass,
    direct: form.value.direct ? 'true' : 'false',
    flexibleDates: form.value.flexibleDates ? 'true' : 'false',
    adults: form.value.passengers.adults,
    children: form.value.passengers.children,
    infants: form.value.passengers.infants
  }

  if (tripType.value === 'round-trip' && form.value.returning) {
    queryParams.returning = form.value.returning
  }

  return queryParams
}

// Build query params based on trip type
const buildQueryParams = (searchData: any) => {
  return tripType.value === 'multi-city'
    ? buildMultiCityQueryParams(searchData)
    : buildSingleTripQueryParams()
}

// Scroll to first error
const scrollToFirstError = () => {
  // Try to find the first field with error (red border)
  const firstErrorField = document.querySelector('.border-red-500')
  if (firstErrorField) {
    firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

// Navigate to flights page if not already there
const navigateToFlightsPage = async (searchData: any) => {
  if (route.path === '/travel/flights') {
    return
  }

  const queryParams = buildQueryParams(searchData)
  await navigateTo({
    path: '/travel/flights',
    query: queryParams
  })
}

// Main submit function
const submit = async () => {
  if (!validateForm()) {
    scrollToFirstError()
    return
  }

  const searchData = buildSearchData()
  
  emit('search', searchData)
  
  await navigateToFlightsPage(searchData)
}
</script>

<template>
  <!-- General Error -->
  <div v-if="errors.general" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
    <p class="text-red-600 text-sm font-medium">{{ errors.general }}</p>
  </div>

  <!-- Trip type -->
  <div class="flex flex-wrap gap-6 mb-6">
    <label
      v-for="type in [
        { value: 'round-trip', label: 'Round-trip' },
        { value: 'one-way', label: 'One way' },
        // { value: 'multi-city', label: 'Multi-city' }
      ]"
      :key="type.value"
      class="flex items-center space-x-2 cursor-pointer"
    >
      <input
        v-model="tripType"
        type="radio"
        :value="type.value"
        class="w-4 h-4 text-primary focus:ring-primary"
      />
      <span class="text-gray-700 font-medium">{{ type.label }}</span>
    </label>
  </div>

  <!-- Multi-City Layout -->
  <template v-if="tripType === 'multi-city'">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Left: Flight Segments (6 rows) -->
      <div class="lg:col-span-9 space-y-4">
        <div
          v-for="(flight, index) in multiCityFlights"
          :key="index"
          class="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <!-- Flying From -->
          <div>
            <AirportSelect
              v-model="flight.from"
              :label="index === 0 ? 'Flying from' : ''"
              placeholder="City or airport"
              :options="airports"
              :class="{ 'border-red-500 focus:ring-red-500': multiCityErrors[index].from }"
            />
          </div>

          <!-- Flying To -->
          <div>
            <AirportSelect
              v-model="flight.to"
              :label="index === 0 ? 'Flying to' : ''"
              placeholder="City or airport"
              :options="airports"
              :class="{ 'border-red-500 focus:ring-red-500': multiCityErrors[index].to }"
            />
          </div>

          <!-- Departing -->
          <div>
            <DateInput
              v-model="flight.departing"
              :label="index === 0 ? 'Departing' : ''"
              :id="`multi-departing-${index}`"
              :class="{ 'border-red-500 focus:ring-red-500': multiCityErrors[index].departing }"
            />
          </div>
        </div>
      </div>

      <!-- Right: Passengers, Connection, Search -->
      <div class="lg:col-span-3 space-y-4 relative">
        <!-- Passengers -->
        <div>
          <PassengerSelect
            v-model="form.passengers"
            label="Passengers"
            id="flight-passengers"
            mode="flight"
          />
        </div>

        <div>
          <label for="multi-class" class="block text-sm font-medium text-gray-700 mb-2">
            Class
          </label>
          <select v-model="form.travelClass" id="multi-class" class="input">
            <option value="economy">Economy</option>
            <option value="premium-economy">Premium Economy</option>
            <option value="business">Business</option>
            <option value="first">First Class</option>
            <option value="any">Any Class</option>
          </select>
        </div>

        <!-- Connection/Stops -->
        <div>
          <label for="multi-stops" class="block text-sm font-medium text-gray-700 mb-2">
            Connection
          </label>
          <select v-model="form.stops" id="multi-stops" class="input">
            <option value="any">Any Number of Stops</option>
            <option value="max-2">Max 2 stops</option>
            <option value="max-1">Max 1 stop</option>
            <option value="direct">Direct Flights Only</option>
          </select>
        </div>

        <!-- Search Button -->
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

  <!-- Round-trip / One-way Layout -->
  <template v-else>
    <!-- Search Inputs -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <!-- Flying From -->
      <div class="lg:col-span-2">
        <AirportSelect
          v-model="form.from"
          label="Flying from"
          :options="airports"
          :class="{ 'border-red-500 focus:ring-red-500': errors.from }"
        />
      </div>

      <!-- Flying To -->
      <div class="lg:col-span-2">
        <AirportSelect
          v-model="form.to"
          label="Flying to"
          :options="airports"
          :class="{ 'border-red-500 focus:ring-red-500': errors.to }"
        />
      </div>

      <!-- Departing -->
      <div class="lg:col-span-2">
        <DateInput
          v-model="form.departing"
          label="Departing"
          id="departing-date"
          :class="{ 'border-red-500 focus:ring-red-500': errors.departing }"
        />
      </div>

      <!-- Returning -->
      <div class="lg:col-span-2">
        <DateInput
          v-model="form.returning"
          label="Returning"
          id="flight-returning"
          :disabled="tripType !== 'round-trip'"
          :class="{ 'border-red-500 focus:ring-red-500': errors.returning }"
        />
      </div>

      <!-- Passengers -->
      <div class="lg:col-span-2 relative">
        <PassengerSelect
          v-model="form.passengers"
          label="Passengers"
          id="flight-passenger"
          mode="flight"
        />
      </div>

      <!-- Search Button -->
      <div class="lg:col-span-2 flex items-center justify-center sm:mt-5 mt-0">
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

    <div
      class="
        mt-6
        flex flex-col gap-4
        sm:flex-row sm:items-center sm:justify-end sm:gap-5
      "
    >
      <!-- Travel Class -->
      <select
        v-model="form.travelClass"
        class="
          w-full sm:w-auto
          px-4 py-3
          border border-gray-300 rounded-lg
          focus:ring-2 focus:ring-primary focus:border-transparent
        "
      >
        <option value="economy">Economy</option>
        <option value="premium-economy">Premium Economy</option>
        <option value="business">Business</option>
        <option value="first">First Class</option>
      </select>

      <!-- Direct -->
      <label class="flex items-center gap-2 cursor-pointer">
        <input
          v-model="form.direct"
          type="checkbox"
          class="w-5 h-5"
        />
        <span class="text-gray-700 font-medium">Direct</span>
      </label>

      <!-- Flexible Dates -->
      <label class="flex items-center gap-2 cursor-pointer">
        <input
          v-model="form.flexibleDates"
          type="checkbox"
          class="w-5 h-5"
        />
        <span class="text-gray-700 font-medium">± 3 days</span>
      </label>
    </div>

  </template>
</template>

<style scoped>
.input {
  @apply w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent;
}

.btn-primary {
  @apply bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold rounded-lg;
}
</style>