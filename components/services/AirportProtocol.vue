<script setup lang="ts">
import { ref, watch } from 'vue'
import { useToast } from '../../composables/useToast'
import { useGeneralService } from '../../services/general.service'
import { normaliseError } from '../../utils/api'
import AppToast from '../toast/AppToast.vue'

const form = ref({
  booking_code: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  numberOfPassengers: 1,
  airport: '',
  flightNumber: '',
  airline: '',
  serviceType: 'arrival',
  assistanceTypes: [] as string[],
  additionalInformation: '',
  terms_and_conditions: false
})

const errors = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  numberOfPassengers: '',
  airport: '',
  flightNumber: '',
  airline: '',
  assistanceTypes: '',
  terms_and_conditions: '',
  general: ''
})

const loading = ref(false)
const toast = useToast()
const generalService = useGeneralService()

const airports = [
  'Murtala Muhammed International Airport (LOS)',
  'Nnamdi Azikiwe International Airport (ABV)',
  'Port Harcourt International Airport (PHC)',
  'Mallam Aminu Kano International Airport (KAN)',
  'Akanu Ibiam International Airport (ENU)'
]

const assistanceOptions = [
  { value: 'fast-track', label: 'Fast Track Immigration' },
  { value: 'meet-greet', label: 'Meet & Greet' },
  { value: 'lounge-access', label: 'VIP Lounge Access' },
  { value: 'porter-service', label: 'Porter Service' },
  { value: 'wheelchair', label: 'Wheelchair Assistance' },
  { value: 'unaccompanied-minor', label: 'Unaccompanied Minor Service' }
]

const watchField = (field: keyof typeof errors.value, source: () => any) => {
  watch(source, () => {
    if (errors.value[field]) (errors.value as any)[field] = ''
  })
}

watchField('firstName', () => form.value.firstName)
watchField('lastName', () => form.value.lastName)
watchField('email', () => form.value.email)
watchField('phone', () => form.value.phone)
watchField('numberOfPassengers', () => form.value.numberOfPassengers)
watchField('airport', () => form.value.airport)
watchField('flightNumber', () => form.value.flightNumber)
watchField('airline', () => form.value.airline)
watchField('assistanceTypes', () => form.value.assistanceTypes)
watchField('terms_and_conditions', () => form.value.terms_and_conditions)

const validateForm = (): boolean => {
  errors.value = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    numberOfPassengers: '',
    airport: '',
    flightNumber: '',
    airline: '',
    assistanceTypes: '',
    terms_and_conditions: '',
    general: ''
  }

  let isValid = true

  if (!form.value.firstName.trim()) {
    errors.value.firstName = 'First name is required'
    isValid = false
  }

  if (!form.value.lastName.trim()) {
    errors.value.lastName = 'Last name is required'
    isValid = false
  }

  if (!form.value.email) {
    errors.value.email = 'Email is required'
    isValid = false
  } else if (!/\S+@\S+\.\S+/.test(form.value.email)) {
    errors.value.email = 'Invalid email format'
    isValid = false
  }

  if (!form.value.phone) {
    errors.value.phone = 'Phone number is required'
    isValid = false
  }

  if (!form.value.numberOfPassengers || form.value.numberOfPassengers < 1) {
    errors.value.numberOfPassengers = 'At least 1 passenger is required'
    isValid = false
  }

  if (!form.value.airport) {
    errors.value.airport = 'Airport is required'
    isValid = false
  }

  if (!form.value.flightNumber.trim()) {
    errors.value.flightNumber = 'Flight number is required'
    isValid = false
  }

  if (!form.value.airline.trim()) {
    errors.value.airline = 'Airline is required'
    isValid = false
  }

  if (form.value.assistanceTypes.length === 0) {
    errors.value.assistanceTypes = 'Please select at least one assistance type'
    isValid = false
  }

  if (!form.value.terms_and_conditions) {
    errors.value.terms_and_conditions = 'You must accept the terms and conditions'
    isValid = false
  }

  return isValid
}

const resetForm = () => {
  form.value = {
    booking_code: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    numberOfPassengers: 1,
    airport: '',
    flightNumber: '',
    airline: '',
    serviceType: 'arrival',
    assistanceTypes: [],
    additionalInformation: '',
    terms_and_conditions: false
  }
}

const submit = async () => {
  if (!validateForm()) {
    const firstError = document.querySelector('.border-red-500')
    if (firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
    return
  }

  const payload = {
    service_type: 'arrival',
    airport_name: form.value.airport,
    flight_number: form.value.flightNumber,
    service_required: {
      meet_and_greet: form.value.assistanceTypes.includes('meet-greet'),
      fast_track_imgration: form.value.assistanceTypes.includes('fast-track'),
      lounge_access: form.value.assistanceTypes.includes('lounge-access'),
      porter_service: form.value.assistanceTypes.includes('porter-service'),
      wheelchair: form.value.assistanceTypes.includes('wheelchair'),
      unaccompanied_minor: form.value.assistanceTypes.includes('unaccompanied-minor'),
    },
    additional_info: form.value.additionalInformation,
    booking_code: form.value.booking_code,
    terms_and_conditions: form.value.terms_and_conditions,
    airline: form.value.airline,
    number_of_passengers: form.value.numberOfPassengers,
  }

  try {
    loading.value = true
    await generalService.saveAirportProtocol(payload)
    toast.success('Request created successfully')
    resetForm()
  } catch (err) {
    const res = normaliseError(err)
    toast.error(res)
  } finally {
    loading.value = false
  }
}

const inputClass = (hasError: boolean) => [
  'w-full px-4 py-3 rounded-lg focus:ring-2 focus:border-transparent transition-colors',
  hasError
    ? 'border-red-500 focus:ring-red-500 border-2'
    : 'border border-gray-300 focus:ring-primary'
]
</script>

<template>
  <div>
    <AppToast />

    <section
      class="relative pt-40 pb-28 px-6 bg-cover bg-center bg-no-repeat"
      style="background-image: url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1600')"
    >
      <div class="absolute inset-0 bg-black/50"></div>
      <div class="relative z-10 max-w-7xl mx-auto text-center">
        <h1 class="text-4xl md:text-5xl font-bold mb-4 text-white">Airport Protocol Services</h1>
        <p class="text-xl text-gray-100">VIP assistance and fast-track services at the airport</p>
      </div>
    </section>

    <section class="py-16 px-6 bg-gray-50">
      <div class="max-w-3xl mx-auto">
        <div class="bg-white rounded-xl shadow-lg p-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-8">Book VIP Service</h2>

          <form @submit.prevent="submit" class="space-y-8">

            <!-- Contact Information -->
            <fieldset>
              <legend class="text-base font-semibold text-gray-800 mb-4 pb-2 border-b w-full">
                Contact Information
              </legend>
              <div class="space-y-4">
                <div>
                  <label for="" class="block text-sm font-medium text-gray-700 mb-2">Booking Code <span class="text-gray-400 font-normal">(leave empty if not yet booked)</span></label>
                  <input
                    v-model="form.booking_code"
                    type="text"
                    class="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:border-transparent transition-colors"
                  />
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label for="" class="block text-sm font-medium text-gray-700 mb-2">First Name <span class="text-red-500">*</span></label>
                    <input v-model="form.firstName" type="text" :class="inputClass(!!errors.firstName)" />
                    <p v-if="errors.firstName" class="mt-1 text-xs text-red-600">{{ errors.firstName }}</p>
                  </div>
                  <div>
                    <label for="" class="block text-sm font-medium text-gray-700 mb-2">Last Name <span class="text-red-500">*</span></label>
                    <input v-model="form.lastName" type="text" :class="inputClass(!!errors.lastName)" />
                    <p v-if="errors.lastName" class="mt-1 text-xs text-red-600">{{ errors.lastName }}</p>
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label for="" class="block text-sm font-medium text-gray-700 mb-2">Email <span class="text-red-500">*</span></label>
                    <input v-model="form.email" type="email" :class="inputClass(!!errors.email)" />
                    <p v-if="errors.email" class="mt-1 text-xs text-red-600">{{ errors.email }}</p>
                  </div>
                  <div>
                    <label for="" class="block text-sm font-medium text-gray-700 mb-2">Phone Number <span class="text-red-500">*</span></label>
                    <input v-model="form.phone" type="tel" placeholder="e.g. 08012345678" :class="inputClass(!!errors.phone)" />
                    <p v-if="errors.phone" class="mt-1 text-xs text-red-600">{{ errors.phone }}</p>
                  </div>
                </div>
              </div>
            </fieldset>

            <fieldset>
              <legend class="text-base font-semibold text-gray-800 mb-4 pb-2 border-b w-full">
                Flight Details
              </legend>
              <div class="space-y-4">
                <div>
                  <label for="" class="block text-sm font-medium text-gray-700 mb-3">Service Type</label>
                  <div class="grid grid-cols-2 gap-3">
                    <label class="relative cursor-pointer">
                      <input v-model="form.serviceType" type="radio" value="arrival" class="peer sr-only" />
                      <div class="border-2 border-gray-200 rounded-lg p-4 peer-checked:border-primary peer-checked:bg-primary/5 hover:border-gray-300 transition-colors">
                        <p class="font-semibold text-gray-900 text-sm">Arrival Assistance</p>
                        <p class="text-xs text-gray-500 mt-0.5">Help when you arrive</p>
                      </div>
                    </label>
                    <label class="relative cursor-pointer">
                      <input v-model="form.serviceType" type="radio" value="departure" class="peer sr-only" />
                      <div class="border-2 border-gray-200 rounded-lg p-4 peer-checked:border-primary peer-checked:bg-primary/5 hover:border-gray-300 transition-colors">
                        <p class="font-semibold text-gray-900 text-sm">Departure Assistance</p>
                        <p class="text-xs text-gray-500 mt-0.5">Help when you depart</p>
                      </div>
                    </label>
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label for="" class="block text-sm font-medium text-gray-700 mb-2">Airport <span class="text-red-500">*</span></label>
                    <select v-model="form.airport" :class="inputClass(!!errors.airport)">
                      <option value="">Select Airport</option>
                      <option v-for="a in airports" :key="a" :value="a">{{ a }}</option>
                    </select>
                    <p v-if="errors.airport" class="mt-1 text-xs text-red-600">{{ errors.airport }}</p>
                  </div>
                  <div>
                    <label for="" class="block text-sm font-medium text-gray-700 mb-2">Flight Number <span class="text-red-500">*</span></label>
                    <input v-model="form.flightNumber" type="text" placeholder="e.g. BA075" :class="inputClass(!!errors.flightNumber)" />
                    <p v-if="errors.flightNumber" class="mt-1 text-xs text-red-600">{{ errors.flightNumber }}</p>
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label for="" class="block text-sm font-medium text-gray-700 mb-2">Airline <span class="text-red-500">*</span></label>
                    <input v-model="form.airline" type="text" placeholder="e.g. British Airways" :class="inputClass(!!errors.airline)" />
                    <p v-if="errors.airline" class="mt-1 text-xs text-red-600">{{ errors.airline }}</p>
                  </div>
                  <div>
                    <label for="" class="block text-sm font-medium text-gray-700 mb-2">Number of Passengers <span class="text-red-500">*</span></label>
                    <input v-model.number="form.numberOfPassengers" type="number" min="1" max="20" :class="inputClass(!!errors.numberOfPassengers)" />
                    <p v-if="errors.numberOfPassengers" class="mt-1 text-xs text-red-600">{{ errors.numberOfPassengers }}</p>
                  </div>
                </div>
              </div>
            </fieldset>

            <fieldset>
              <legend class="text-base font-semibold text-gray-800 mb-4 pb-2 border-b w-full">
                Services Required <span class="text-red-500">*</span>
              </legend>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label
                  v-for="option in assistanceOptions"
                  :key="option.value"
                  class="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-colors"
                  :class="form.assistanceTypes.includes(option.value) ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'"
                >
                  <input
                    v-model="form.assistanceTypes"
                    type="checkbox"
                    :value="option.value"
                    class="w-4 h-4 text-primary shrink-0"
                  />
                  <span class="text-sm font-medium text-gray-700">{{ option.label }}</span>
                </label>
              </div>
              <p v-if="errors.assistanceTypes" class="mt-2 text-xs text-red-600">{{ errors.assistanceTypes }}</p>
            </fieldset>

            <div>
              <label for="" class="block text-sm font-medium text-gray-700 mb-2">Additional Information</label>
              <textarea
                v-model="form.additionalInformation"
                rows="3"
                placeholder="Any special requirements or requests..."
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              />
            </div>

            <div>
              <label
                class="flex items-start gap-3 cursor-pointer p-4 rounded-lg border"
                :class="errors.terms_and_conditions ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:bg-gray-50'"
              >
                <input
                  v-model="form.terms_and_conditions"
                  type="checkbox"
                  class="w-5 h-5 text-primary mt-0.5 shrink-0"
                />
                <span class="text-sm text-gray-700">
                  I agree to the
                  <a href="#" class="text-primary underline hover:text-primary-dark">Terms and Conditions</a>
                  and confirm that all information provided is accurate and complete.
                </span>
              </label>
              <p v-if="errors.terms_and_conditions" class="mt-1 text-xs text-red-600">{{ errors.terms_and_conditions }}</p>
            </div>

            <button
              type="submit"
              class="w-full flex gap-3 items-center justify-center py-4 bg-primary text-white rounded-lg font-bold text-lg hover:bg-primary-dark transition-colors"
            >
              <svg v-if="loading" class="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
              {{ loading ? 'Sending...' : 'Book Service' }}
            </button>

          </form>
        </div>
      </div>
    </section>
  </div>
</template>
