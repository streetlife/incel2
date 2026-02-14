<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import DateInput from '../forms/DateInput.vue'

const form = ref({
  serviceType: 'airport-to-hotel',
  pickupLocation: '',
  dropoffLocation: '',
  date: '',
  time: '',
  flightNumber: '',
  passengers: 1,
  luggage: 1,
  vehicleType: 'sedan',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  specialRequests: ''
})

const errors = ref({
  pickupLocation: '',
  dropoffLocation: '',
  date: '',
  time: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  general: ''
})

const vehicleTypes = [
  { 
    value: 'sedan', 
    label: 'Sedan', 
    capacity: '3 passengers, 2 luggage',
    price: 15000,
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400'
  },
  { 
    value: 'suv', 
    label: 'SUV', 
    capacity: '5 passengers, 4 luggage',
    price: 25000,
    image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=400'
  },
  { 
    value: 'van', 
    label: 'Van', 
    capacity: '8 passengers, 6 luggage',
    price: 35000,
    image: 'https://images.unsplash.com/photo-1527786356703-4b100091cd2c?w=400'
  },
  { 
    value: 'luxury', 
    label: 'Luxury Sedan', 
    capacity: '3 passengers, 2 luggage',
    price: 45000,
    image: 'https://images.unsplash.com/photo-1563720360172-67b8f3dce741?w=400'
  }
]

const totalPrice = computed(() => {
  return vehicleTypes.find(v => v.value === form.value.vehicleType)?.price || 0
})

// Clear errors on field change
watch(() => form.value.pickupLocation, () => { if (errors.value.pickupLocation) errors.value.pickupLocation = '' })
watch(() => form.value.dropoffLocation, () => { if (errors.value.dropoffLocation) errors.value.dropoffLocation = '' })
watch(() => form.value.date, () => { if (errors.value.date) errors.value.date = '' })
watch(() => form.value.time, () => { if (errors.value.time) errors.value.time = '' })
watch(() => form.value.firstName, () => { if (errors.value.firstName) errors.value.firstName = '' })
watch(() => form.value.lastName, () => { if (errors.value.lastName) errors.value.lastName = '' })
watch(() => form.value.email, () => { if (errors.value.email) errors.value.email = '' })
watch(() => form.value.phone, () => { if (errors.value.phone) errors.value.phone = '' })

const validateForm = (): boolean => {
  errors.value = {
    pickupLocation: '',
    dropoffLocation: '',
    date: '',
    time: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    general: ''
  }

  let isValid = true

  if (!form.value.pickupLocation) {
    errors.value.pickupLocation = 'Pickup location is required'
    isValid = false
  }

  if (!form.value.dropoffLocation) {
    errors.value.dropoffLocation = 'Drop-off location is required'
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

  console.log('Transfer booking:', form.value)
  alert('Transfer booking submitted successfully!')
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
      style="background-image: url('https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1600')"
    >
      <div class="absolute inset-0 bg-black/50"></div>
      
      <div class="relative z-10 max-w-7xl mx-auto text-center">
        <h1 class="text-4xl md:text-5xl font-bold mb-4 text-white">
          Airport Transfer
        </h1>
        <p class="text-xl text-gray-100">
          Comfortable and reliable airport transportation
        </p>
      </div>
    </section>

    <!-- Form Section -->
    <section class="py-16 px-6 bg-gray-50">
      <div class="max-w-6xl mx-auto">
        <div class="bg-white rounded-xl shadow-lg p-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">Book Your Transfer</h2>

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
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label for="airport-to-hotel" class="relative cursor-pointer">
                  <input 
                    v-model="form.serviceType"
                    type="radio"
                    value="airport-to-hotel"
                    class="peer sr-only"
                  />
                  <div class="border-2 border-gray-200 rounded-lg p-4 peer-checked:border-blue-600 peer-checked:bg-blue-50 hover:border-gray-300 transition-colors text-center">
                    <p class="font-bold text-gray-900">Airport to Hotel</p>
                  </div>
                </label>
                <label class="relative cursor-pointer">
                  <input 
                    v-model="form.serviceType"
                    type="radio"
                    value="hotel-to-airport"
                    class="peer sr-only"
                  />
                  <div class="border-2 border-gray-200 rounded-lg p-4 peer-checked:border-blue-600 peer-checked:bg-blue-50 hover:border-gray-300 transition-colors text-center">
                    <p class="font-bold text-gray-900">Hotel to Airport</p>
                  </div>
                </label>
                <label class="relative cursor-pointer">
                  <input 
                    v-model="form.serviceType"
                    type="radio"
                    value="city-transfer"
                    class="peer sr-only"
                  />
                  <div class="border-2 border-gray-200 rounded-lg p-4 peer-checked:border-blue-600 peer-checked:bg-blue-50 hover:border-gray-300 transition-colors text-center">
                    <p class="font-bold text-gray-900">City Transfer</p>
                  </div>
                </label>
              </div>
            </div>

            <!-- Pickup & Dropoff -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="pickupLocation" class="block text-sm font-medium text-gray-700 mb-2">
                  Pickup Location *
                </label>
                <input 
                  v-model="form.pickupLocation"
                  type="text"
                  placeholder="e.g., Murtala Muhammed Airport"
                  :class="[
                    'w-full px-4 py-3 rounded-lg focus:ring-2 focus:border-transparent',
                    errors.pickupLocation 
                      ? 'border-red-500 focus:ring-red-500 border-2' 
                      : 'border border-gray-300 focus:ring-blue-500'
                  ]"
                />
              </div>

              <div>
                <label for="dropoffLocation" class="block text-sm font-medium text-gray-700 mb-2">
                  Drop-off Location *
                </label>
                <input 
                  v-model="form.dropoffLocation"
                  type="text"
                  placeholder="e.g., Eko Hotel, Victoria Island"
                  :class="[
                    'w-full px-4 py-3 rounded-lg focus:ring-2 focus:border-transparent',
                    errors.dropoffLocation 
                      ? 'border-red-500 focus:ring-red-500 border-2' 
                      : 'border border-gray-300 focus:ring-blue-500'
                  ]"
                />
              </div>
            </div>

            <!-- Date & Time -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <DateInput
                  v-model="form.date"
                  label="Pickup Date *"
                  :allow-past-dates="false"
                  :class="{ 'border-red-500 focus:ring-red-500': errors.date }"
                />
              </div>

              <div>
                <label for="time" class="block text-sm font-medium text-gray-700 mb-2">
                  Pickup Time *
                </label>
                <input 
                  v-model="form.time"
                  type="time"
                  :class="[
                    'w-full px-4 py-3 rounded-lg focus:ring-2 focus:border-transparent',
                    errors.time 
                      ? 'border-red-500 focus:ring-red-500 border-2' 
                      : 'border border-gray-300 focus:ring-blue-500'
                  ]"
                />
              </div>
            </div>

            <!-- Flight Number & Passengers -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label for="flightNumber" class="block text-sm font-medium text-gray-700 mb-2">
                  Flight Number (Optional)
                </label>
                <input 
                  v-model="form.flightNumber"
                  type="text"
                  placeholder="e.g., BA075"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label for="passengers" class="block text-sm font-medium text-gray-700 mb-2">
                  Passengers
                </label>
                <input 
                  v-model.number="form.passengers"
                  type="number"
                  min="1"
                  max="20"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label for="luggage" class="block text-sm font-medium text-gray-700 mb-2">
                  Luggage Pieces
                </label>
                <input 
                  v-model.number="form.luggage"
                  type="number"
                  min="0"
                  max="20"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <!-- Vehicle Selection -->
            <div>
              <label for="vehicleType" class="block text-sm font-medium text-gray-700 mb-3">
                Select Vehicle
              </label>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <label 
                  v-for="vehicle in vehicleTypes" 
                  :key="vehicle.value"
                  class="relative cursor-pointer"
                >
                  <input 
                    v-model="form.vehicleType"
                    type="radio"
                    :value="vehicle.value"
                    class="peer sr-only"
                  />
                  <div class="border-2 border-gray-200 rounded-lg overflow-hidden peer-checked:border-blue-600 peer-checked:ring-2 peer-checked:ring-blue-600 hover:border-gray-300 transition-all">
                    <img :src="vehicle.image" :alt="vehicle.label" class="w-full h-32 object-cover" />
                    <div class="p-3">
                      <p class="font-bold text-gray-900">{{ vehicle.label }}</p>
                      <p class="text-xs text-gray-600 mt-1">{{ vehicle.capacity }}</p>
                      <p class="text-lg font-bold text-blue-600 mt-2">{{ formatPrice(vehicle.price) }}</p>
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
                        : 'border border-gray-300 focus:ring-blue-500'
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
                        : 'border border-gray-300 focus:ring-blue-500'
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
                        : 'border border-gray-300 focus:ring-blue-500'
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
                        : 'border border-gray-300 focus:ring-blue-500'
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
                  placeholder="Child seat, wheelchair accessible, etc."
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                ></textarea>
              </div>
            </div>

            <!-- Submit -->
            <div class="flex items-center justify-between pt-6 border-t">
              <div>
                <p class="text-sm text-gray-600">Total Price</p>
                <p class="text-3xl font-bold text-gray-900">{{ formatPrice(totalPrice) }}</p>
              </div>
              <button 
                type="submit"
                class="px-8 py-4 bg-blue-600 text-white rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors"
              >
                Book Transfer
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  </div>
</template>
