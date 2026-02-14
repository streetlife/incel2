<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import DateInput from '../forms/DateInput.vue'

const form = ref({
  serviceType: 'arrival',
  airport: '',
  flightNumber: '',
  airline: '',
  date: '',
  time: '',
  assistanceType: [] as string[],
  passengers: 1,
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  specialRequests: ''
})

const errors = ref({
  airport: '',
  flightNumber: '',
  airline: '',
  date: '',
  time: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  general: ''
})

const airports = [
  'Murtala Muhammed International Airport (LOS)',
  'Nnamdi Azikiwe International Airport (ABV)',
  'Port Harcourt International Airport (PHC)',
  'Mallam Aminu Kano International Airport (KAN)',
  'Akanu Ibiam International Airport (ENU)'
]

const assistanceTypes = [
  { value: 'fast-track', label: 'Fast Track Immigration', price: 50000, description: 'Skip queues at immigration and security' },
  { value: 'meet-greet', label: 'Meet & Greet', price: 30000, description: 'Personal assistant to guide you through the airport' },
  { value: 'lounge-access', label: 'VIP Lounge Access', price: 25000, description: 'Relax in luxury lounge before your flight' },
  { value: 'porter-service', label: 'Porter Service', price: 15000, description: 'Luggage handling assistance' },
  { value: 'wheelchair', label: 'Wheelchair Assistance', price: 20000, description: 'Mobility assistance throughout airport' },
  { value: 'unaccompanied-minor', label: 'Unaccompanied Minor Service', price: 40000, description: 'Special care for children traveling alone' }
]

const totalPrice = computed(() => {
  return form.value.assistanceType.reduce((sum, type) => {
    return sum + (assistanceTypes.find(a => a.value === type)?.price || 0)
  }, 0) * form.value.passengers
})

// Clear errors on field change
watch(() => form.value.airport, () => { if (errors.value.airport) errors.value.airport = '' })
watch(() => form.value.flightNumber, () => { if (errors.value.flightNumber) errors.value.flightNumber = '' })
watch(() => form.value.airline, () => { if (errors.value.airline) errors.value.airline = '' })
watch(() => form.value.date, () => { if (errors.value.date) errors.value.date = '' })
watch(() => form.value.time, () => { if (errors.value.time) errors.value.time = '' })
watch(() => form.value.firstName, () => { if (errors.value.firstName) errors.value.firstName = '' })
watch(() => form.value.lastName, () => { if (errors.value.lastName) errors.value.lastName = '' })
watch(() => form.value.email, () => { if (errors.value.email) errors.value.email = '' })
watch(() => form.value.phone, () => { if (errors.value.phone) errors.value.phone = '' })

const validateForm = (): boolean => {
  errors.value = {
    airport: '',
    flightNumber: '',
    airline: '',
    date: '',
    time: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    general: ''
  }

  let isValid = true

  if (!form.value.airport) {
    errors.value.airport = 'Airport is required'
    isValid = false
  }

  if (!form.value.flightNumber) {
    errors.value.flightNumber = 'Flight number is required'
    isValid = false
  }

  if (!form.value.airline) {
    errors.value.airline = 'Airline is required'
    isValid = false
  }

  if (!form.value.date) {
    errors.value.date = 'Date is required'
    isValid = false
  }

  if (!form.value.time) {
    errors.value.time = 'Time is required'
    isValid = false
  }

  if (!form.value.firstName) {
    errors.value.firstName = 'First name is required'
    isValid = false
  }

  if (!form.value.lastName) {
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

  if (form.value.assistanceType.length === 0) {
    errors.value.general = 'Please select at least one assistance type'
    isValid = false
  }

  return isValid
}

const submit = () => {
  if (!validateForm()) {
    const firstError = document.querySelector('.border-red-500')
    if (firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
    return
  }

  console.log('Protocol booking:', form.value)
  alert('Airport protocol service booked successfully!')
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0
  }).format(price)
}
</script>

<template>
  <div>
    <!-- Hero Section -->
    <section 
      class="relative py-24 px-6 bg-cover bg-center bg-no-repeat"
      style="background-image: url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1600')"
    >
      <div class="absolute inset-0 bg-black/50"></div>
      
      <div class="relative z-10 max-w-7xl mx-auto text-center">
        <h1 class="text-4xl md:text-5xl font-bold mb-4 text-white">
          Airport Protocol Services
        </h1>
        <p class="text-xl text-gray-100">
          VIP assistance and fast-track services at the airport
        </p>
      </div>
    </section>

    <!-- Form Section -->
    <section class="py-16 px-6 bg-gray-50">
      <div class="max-w-6xl mx-auto">
        <div class="bg-white rounded-xl shadow-lg p-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">Book VIP Service</h2>

          <!-- General Error -->
          <div v-if="errors.general" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-red-600 text-sm font-medium">{{ errors.general }}</p>
          </div>

          <form @submit.prevent="submit" class="space-y-6">
            <!-- Service Type -->
            <div>
              <label for="serviceType" class="block text-sm font-medium text-gray-700 mb-3">
                Service Type
              </label>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label for="serviceType" class="relative cursor-pointer">
                  <input 
                    v-model="form.serviceType"
                    type="radio"
                    value="arrival"
                    class="peer sr-only"
                  />
                  <div class="border-2 border-gray-200 rounded-lg p-4 peer-checked:border-purple-600 peer-checked:bg-purple-50 hover:border-gray-300 transition-colors">
                    <p class="font-bold text-gray-900">Arrival Assistance</p>
                    <p class="text-sm text-gray-600 mt-1">Help when you arrive at the airport</p>
                  </div>
                </label>
                <label class="relative cursor-pointer">
                  <input 
                    v-model="form.serviceType"
                    type="radio"
                    value="departure"
                    class="peer sr-only"
                  />
                  <div class="border-2 border-gray-200 rounded-lg p-4 peer-checked:border-purple-600 peer-checked:bg-purple-50 hover:border-gray-300 transition-colors">
                    <p class="font-bold text-gray-900">Departure Assistance</p>
                    <p class="text-sm text-gray-600 mt-1">Help when you depart from the airport</p>
                  </div>
                </label>
              </div>
            </div>

            <!-- Flight Details -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="airport" class="block text-sm font-medium text-gray-700 mb-2">
                  Airport *
                </label>
                <select 
                  v-model="form.airport"
                  :class="[
                    'w-full px-4 py-3 rounded-lg focus:ring-2 focus:border-transparent',
                    errors.airport 
                      ? 'border-red-500 focus:ring-red-500 border-2' 
                      : 'border border-gray-300 focus:ring-purple-500'
                  ]"
                >
                  <option value="">Select Airport</option>
                  <option v-for="airport in airports" :key="airport" :value="airport">
                    {{ airport }}
                  </option>
                </select>
              </div>

              <div>
                <label for="flightNumber" class="block text-sm font-medium text-gray-700 mb-2">
                  Flight Number *
                </label>
                <input 
                  v-model="form.flightNumber"
                  type="text"
                  placeholder="e.g., BA075"
                  :class="[
                    'w-full px-4 py-3 rounded-lg focus:ring-2 focus:border-transparent',
                    errors.flightNumber 
                      ? 'border-red-500 focus:ring-red-500 border-2' 
                      : 'border border-gray-300 focus:ring-purple-500'
                  ]"
                />
              </div>

              <div>
                <label for="airline" class="block text-sm font-medium text-gray-700 mb-2">
                  Airline *
                </label>
                <input 
                  v-model="form.airline"
                  type="text"
                  placeholder="e.g., British Airways"
                  :class="[
                    'w-full px-4 py-3 rounded-lg focus:ring-2 focus:border-transparent',
                    errors.airline 
                      ? 'border-red-500 focus:ring-red-500 border-2' 
                      : 'border border-gray-300 focus:ring-purple-500'
                  ]"
                />
              </div>

              <div>
                <label for="passengers" class="block text-sm font-medium text-gray-700 mb-2">
                  Number of Passengers
                </label>
                <input 
                  v-model.number="form.passengers"
                  type="number"
                  min="1"
                  max="20"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <!-- Date & Time -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <DateInput
                  v-model="form.date"
                  label="Flight Date *"
                  :allow-past-dates="false"
                  :class="{ 'border-red-500 focus:ring-red-500': errors.date }"
                />
              </div>

              <div>
                <label for="time" class="block text-sm font-medium text-gray-700 mb-2">
                  Flight Time *
                </label>
                <input 
                  v-model="form.time"
                  type="time"
                  :class="[
                    'w-full px-4 py-3 rounded-lg focus:ring-2 focus:border-transparent',
                    errors.time 
                      ? 'border-red-500 focus:ring-red-500 border-2' 
                      : 'border border-gray-300 focus:ring-purple-500'
                  ]"
                />
              </div>
            </div>

            <!-- Assistance Types -->
            <div>
              <label for="assistanceType" class="block text-sm font-medium text-gray-700 mb-3">
                Select Services *
              </label>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label 
                  v-for="assistance in assistanceTypes" 
                  :key="assistance.value"
                  class="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg hover:bg-purple-50 cursor-pointer transition-colors"
                >
                  <input 
                    v-model="form.assistanceType"
                    type="checkbox"
                    :value="assistance.value"
                    class="w-5 h-5 text-purple-600 mt-1"
                  />
                  <div class="flex-1">
                    <div class="flex items-start justify-between">
                      <div>
                        <p class="font-bold text-gray-900">{{ assistance.label }}</p>
                        <p class="text-xs text-gray-600 mt-1">{{ assistance.description }}</p>
                      </div>
                      <p class="font-bold text-purple-600 ml-2">{{ formatPrice(assistance.price) }}</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <!-- Personal Information -->
            <div class="border-t pt-6">
              <h3 class="text-lg font-bold text-gray-900 mb-4">Contact Information</h3>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label for="firstName" class="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input 
                    v-model="form.firstName"
                    type="text"
                    :class="[
                      'w-full px-4 py-3 rounded-lg focus:ring-2 focus:border-transparent',
                      errors.firstName 
                        ? 'border-red-500 focus:ring-red-500 border-2' 
                        : 'border border-gray-300 focus:ring-purple-500'
                    ]"
                  />
                </div>

                <div>
                  <label for="lastName" class="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input 
                    v-model="form.lastName"
                    type="text"
                    :class="[
                      'w-full px-4 py-3 rounded-lg focus:ring-2 focus:border-transparent',
                      errors.lastName 
                        ? 'border-red-500 focus:ring-red-500 border-2' 
                        : 'border border-gray-300 focus:ring-purple-500'
                    ]"
                  />
                </div>

                <div>
                  <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input 
                    v-model="form.email"
                    type="email"
                    :class="[
                      'w-full px-4 py-3 rounded-lg focus:ring-2 focus:border-transparent',
                      errors.email 
                        ? 'border-red-500 focus:ring-red-500 border-2' 
                        : 'border border-gray-300 focus:ring-purple-500'
                    ]"
                  />
                </div>

                <div>
                  <label for="phone" class="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input 
                    v-model="form.phone"
                    type="tel"
                    :class="[
                      'w-full px-4 py-3 rounded-lg focus:ring-2 focus:border-transparent',
                      errors.phone 
                        ? 'border-red-500 focus:ring-red-500 border-2' 
                        : 'border border-gray-300 focus:ring-purple-500'
                    ]"
                  />
                </div>
              </div>

              <div class="mt-4">
                <label for="specialRequests" class="block text-sm font-medium text-gray-700 mb-2">
                  Special Requests (Optional)
                </label>
                <textarea 
                  v-model="form.specialRequests"
                  rows="3"
                  placeholder="Any special requirements or requests..."
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                ></textarea>
              </div>
            </div>

            <!-- Submit -->
            <div class="flex items-center justify-between pt-6 border-t">
              <div>
                <p class="text-sm text-gray-600">Total Price</p>
                <p class="text-3xl font-bold text-purple-600">{{ formatPrice(totalPrice) }}</p>
                <p class="text-xs text-gray-500 mt-1">
                  {{ form.passengers }} passenger{{ form.passengers > 1 ? 's' : '' }}
                </p>
              </div>
              <button 
                type="submit"
                class="px-8 py-4 bg-purple-600 text-white rounded-lg font-bold text-lg hover:bg-purple-700 transition-colors"
              >
                Book Service
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  </div>
</template>