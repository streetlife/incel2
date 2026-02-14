<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import DateRangeInput from '../forms/DateRangeInput.vue'

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  destination: '',
  travelDates: {
    start: '',
    end: ''
  },
  coverageType: 'standard',
  numberOfTravelers: 1,
  medicalConditions: false,
  additionalCoverage: [] as string[]
})

const errors = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  destination: '',
  travelDates: '',
  general: ''
})

const coverageOptions = [
  { value: 'basic', label: 'Basic Coverage', price: 15000, features: ['Medical Emergency', 'Trip Cancellation'] },
  { value: 'standard', label: 'Standard Coverage', price: 25000, features: ['Medical Emergency', 'Trip Cancellation', 'Lost Baggage', '24/7 Support'] },
  { value: 'premium', label: 'Premium Coverage', price: 45000, features: ['Medical Emergency', 'Trip Cancellation', 'Lost Baggage', '24/7 Support', 'Adventure Sports', 'Pre-existing Conditions'] }
]

const additionalOptions = [
  { value: 'rental-car', label: 'Rental Car Coverage', price: 5000 },
  { value: 'sports', label: 'Adventure Sports Coverage', price: 8000 },
  { value: 'business', label: 'Business Equipment Coverage', price: 7000 }
]

const totalPrice = computed(() => {
  let base = coverageOptions.find(o => o.value === form.value.coverageType)?.price || 0
  let additional = form.value.additionalCoverage.reduce((sum, coverage) => {
    return sum + (additionalOptions.find(o => o.value === coverage)?.price || 0)
  }, 0)
  return (base + additional) * form.value.numberOfTravelers
})

// Clear errors on field change
watch(() => form.value.firstName, () => { if (errors.value.firstName) errors.value.firstName = '' })
watch(() => form.value.lastName, () => { if (errors.value.lastName) errors.value.lastName = '' })
watch(() => form.value.email, () => { if (errors.value.email) errors.value.email = '' })
watch(() => form.value.phone, () => { if (errors.value.phone) errors.value.phone = '' })
watch(() => form.value.dateOfBirth, () => { if (errors.value.dateOfBirth) errors.value.dateOfBirth = '' })
watch(() => form.value.destination, () => { if (errors.value.destination) errors.value.destination = '' })
watch(() => form.value.travelDates, () => { if (errors.value.travelDates) errors.value.travelDates = '' }, { deep: true })

const validateForm = (): boolean => {
  errors.value = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    destination: '',
    travelDates: '',
    general: ''
  }

  let isValid = true

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

  if (!form.value.dateOfBirth) {
    errors.value.dateOfBirth = 'Date of birth is required'
    isValid = false
  }

  if (!form.value.destination) {
    errors.value.destination = 'Destination is required'
    isValid = false
  }

  if (!form.value.travelDates.start || !form.value.travelDates.end) {
    errors.value.travelDates = 'Travel dates are required'
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

  console.log('Insurance request:', form.value)
  alert('Insurance quote request submitted successfully!')
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
      style="background-image: url('https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1600')"
    >
      <div class="absolute inset-0 bg-black/50"></div>
      
      <div class="relative z-10 max-w-7xl mx-auto text-center">
        <h1 class="text-4xl md:text-5xl font-bold mb-4 text-white">
          Travel Insurance
        </h1>
        <p class="text-xl text-gray-100">
          Protect your journey with comprehensive coverage
        </p>
      </div>
    </section>

    <!-- Form Section -->
    <section class="py-16 px-6">
      <div class="max-w-5xl mx-auto">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Form -->
          <div class="lg:col-span-2">
            <div class="bg-white rounded-xl shadow-lg p-8">
              <h2 class="text-2xl font-bold text-gray-900 mb-6">Get Your Quote</h2>

              <!-- General Error -->
              <div v-if="errors.general" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p class="text-red-600 text-sm font-medium">{{ errors.general }}</p>
              </div>

              <form @submit.prevent="submit" class="space-y-6">
                <!-- Personal Information -->
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
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label for="dateOfBirth" class="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth *
                    </label>
                    <input 
                      v-model="form.dateOfBirth"
                      type="date"
                      :class="[
                        'w-full px-4 py-3 rounded-lg focus:ring-2 focus:border-transparent',
                        errors.dateOfBirth 
                          ? 'border-red-500 focus:ring-red-500 border-2' 
                          : 'border border-gray-300 focus:ring-blue-500'
                      ]"
                    />
                  </div>

                  <div>
                    <label for="destination" class="block text-sm font-medium text-gray-700 mb-2">
                      Destination *
                    </label>
                    <input 
                      v-model="form.destination"
                      type="text"
                      placeholder="e.g., Paris, France"
                      :class="[
                        'w-full px-4 py-3 rounded-lg focus:ring-2 focus:border-transparent',
                        errors.destination 
                          ? 'border-red-500 focus:ring-red-500 border-2' 
                          : 'border border-gray-300 focus:ring-blue-500'
                      ]"
                    />
                  </div>
                </div>

                <!-- Travel Dates -->
                <div>
                  <DateRangeInput
                    v-model="form.travelDates"
                    label="Travel Dates *"
                    :allow-past-dates="false"
                  />
                  <p v-if="errors.travelDates" class="mt-1 text-xs text-red-600">{{ errors.travelDates }}</p>
                </div>

                <!-- Number of Travelers -->
                <div>
                  <label for="numberOfTravelers" class="block text-sm font-medium text-gray-700 mb-2">
                    Number of Travelers
                  </label>
                  <input 
                    v-model.number="form.numberOfTravelers"
                    type="number"
                    min="1"
                    max="10"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <!-- Coverage Type -->
                <div>
                  <label for="coverageType" class="block text-sm font-medium text-gray-700 mb-3">
                    Coverage Type
                  </label>
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <label 
                      v-for="option in coverageOptions" 
                      :key="option.value"
                      class="relative cursor-pointer"
                    >
                      <input 
                        v-model="form.coverageType"
                        type="radio"
                        :value="option.value"
                        class="peer sr-only"
                      />
                      <div class="border-2 border-gray-200 rounded-lg p-4 peer-checked:border-blue-600 peer-checked:bg-blue-50 hover:border-gray-300 transition-colors">
                        <p class="font-bold text-gray-900">{{ option.label }}</p>
                        <p class="text-lg font-bold text-blue-600 mt-1">{{ formatPrice(option.price) }}</p>
                        <ul class="mt-2 space-y-1">
                          <li 
                            v-for="feature in option.features" 
                            :key="feature"
                            class="text-xs text-gray-600 flex items-start gap-1"
                          >
                            <span class="text-green-600">✓</span>
                            <span>{{ feature }}</span>
                          </li>
                        </ul>
                      </div>
                    </label>
                  </div>
                </div>

                <!-- Additional Coverage -->
                <div>
                  <label for="additionalCoverage" class="block text-sm font-medium text-gray-700 mb-3">
                    Additional Coverage (Optional)
                  </label>
                  <div class="space-y-2">
                    <label 
                      v-for="option in additionalOptions" 
                      :key="option.value"
                      class="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <input 
                        v-model="form.additionalCoverage"
                        type="checkbox"
                        :value="option.value"
                        class="w-5 h-5 text-blue-600"
                      />
                      <span class="flex-1 text-gray-700">{{ option.label }}</span>
                      <span class="font-semibold text-gray-900">{{ formatPrice(option.price) }}</span>
                    </label>
                  </div>
                </div>

                <!-- Medical Conditions -->
                <div>
                  <label class="flex items-start gap-3 cursor-pointer">
                    <input 
                      v-model="form.medicalConditions"
                      type="checkbox"
                      class="w-5 h-5 text-blue-600 mt-1"
                    />
                    <span class="text-sm text-gray-700">
                      I have pre-existing medical conditions that need to be covered
                    </span>
                  </label>
                </div>

                <!-- Submit Button -->
                <button 
                  type="submit"
                  class="w-full py-4 bg-blue-600 text-white rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors"
                >
                  Get Quote
                </button>
              </form>
            </div>
          </div>

          <!-- Price Summary -->
          <div class="lg:col-span-1">
            <div class="bg-white rounded-xl shadow-lg p-6 sticky top-6">
              <h3 class="text-xl font-bold text-gray-900 mb-4">Quote Summary</h3>
              
              <div class="space-y-3 mb-4 pb-4 border-b">
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">Coverage Type</span>
                  <span class="font-semibold">
                    {{ coverageOptions.find(o => o.value === form.coverageType)?.label }}
                  </span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">Travelers</span>
                  <span class="font-semibold">{{ form.numberOfTravelers }}</span>
                </div>
                <div v-if="form.additionalCoverage.length > 0">
                  <p class="text-sm text-gray-600 mb-2">Additional Coverage:</p>
                  <ul class="text-xs text-gray-600 space-y-1">
                    <li v-for="coverage in form.additionalCoverage" :key="coverage">
                      • {{ additionalOptions.find(o => o.value === coverage)?.label }}
                    </li>
                  </ul>
                </div>
              </div>

              <div class="flex justify-between items-center mb-6">
                <span class="text-lg font-bold text-gray-900">Total</span>
                <span class="text-2xl font-bold text-blue-600">{{ formatPrice(totalPrice) }}</span>
              </div>

              <div class="bg-blue-50 rounded-lg p-4 text-sm text-gray-700">
                <p class="font-semibold mb-2">✓ What's Covered:</p>
                <ul class="space-y-1 text-xs">
                  <li v-for="feature in coverageOptions.find(o => o.value === form.coverageType)?.features" :key="feature">
                    • {{ feature }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
