<script setup lang="ts">
import { onMounted } from 'vue'
import { useGlobalVisaData } from '../../../composables/useGlobalVisaData'
import { useGlobalVisaForm } from '../../../composables/useGlobalVisaForm'

const { countries, services, nationalities, purposeOfTravel } = useGlobalVisaData()
const {
  form,
  errors,
  setupErrorWatchers,
  submitInquiry,
  resetForm
} = useGlobalVisaForm()

const handleSubmit = () => {
  if (submitInquiry()) {
    console.log('Inquiry submitted:', form.value)
    alert('Thank you for your inquiry! Our visa experts will contact you within 24 hours.')
    resetForm()
  }
}

onMounted(() => {
  setupErrorWatchers()
})
</script>

<template>
  <div class="min-h-screen">
    <!-- Hero Section -->
    <section 
      class="relative py-44 px-6 bg-cover bg-center bg-no-repeat"
      style="background-image: linear-gradient(rgba(0, 0, 0, 0.85), rgba(0, 0, 0, 0.75)), url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600')"
    >
      <div class="max-w-7xl mx-auto text-center">
        <h1 class="text-4xl md:text-5xl font-bold text-white mb-4">
          Go Global
        </h1>
        <p class="text-xl text-primary">
          Expert guidance for visa applications to popular destinations worldwide.
        </p>
      </div>
    </section>

    <!-- Countries Section -->
    <section class="py-16 px-6 bg-gray-50">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            We Assist with Visas to
          </h2>
          <p class="text-lg text-gray-600">
            Our experienced team provides guidance for visa applications to major destinations around the world
          </p>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          <div 
            v-for="country in countries" 
            :key="country.id"
            class="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer bg-white"
          >
            <div class="relative h-40 overflow-hidden">
              <img 
                :src="country.image" 
                :alt="country.name"
                class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
            </div>
            <div class="absolute bottom-0 left-0 right-0 p-4 text-white">
              <div class="text-3xl mb-1">{{ country.flag }}</div>
              <p class="text-sm font-semibold">{{ country.name }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- What We Offer Section -->
    <section class="py-16 px-6 bg-white">
      <div class="max-w-7xl mx-auto">
        <div class="bg-white border border-primary rounded-2xl p-8 md:p-12">
          <h3 class="text-2xl font-bold text-gray-900 mb-8 text-center">
            What We Offer
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
            <ul class="space-y-4">
              <li 
                v-for="service in services.column1" 
                :key="service"
                class="flex items-start gap-3 text-gray-700"
              >
                <span class="text-primary mt-0.5">•</span>
                <span>{{ service }}</span>
              </li>
            </ul>
            <ul class="space-y-4">
              <li 
                v-for="service in services.column2" 
                :key="service"
                class="flex items-start gap-3 text-gray-700"
              >
                <span class="text-primary mt-0.5">•</span>
                <span>{{ service }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- Inquiry Form Section -->
    <section class="py-16 px-6 bg-gray-50">
      <div class="max-w-4xl mx-auto">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Visa Inquiry Form
          </h2>
          <p class="text-lg text-gray-600">
            Tell us about your travel plans and our visa experts will provide personalized guidance
          </p>
        </div>

        <!-- Form Card -->
        <div class="bg-white rounded-xl shadow-lg p-8">
          <form @submit.prevent="handleSubmit" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Full Name -->
              <div class="md:col-span-2">
                <label for="fullName" class="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input 
                  id="fullName"
                  v-model="form.fullName"
                  type="text"
                  placeholder="Enter your full name"
                  :class="[
                    'w-full px-4 py-3 rounded-lg focus:ring-2 focus:border-transparent',
                    errors.fullName
                      ? 'border-red-500 focus:ring-red-500 border-2'
                      : 'border border-gray-300 focus:ring-primary'
                  ]"
                />
                <p v-if="errors.fullName" class="mt-1 text-xs text-red-600">{{ errors.fullName }}</p>
              </div>

              <!-- Email -->
              <div>
                <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input 
                  id="email"
                  v-model="form.email"
                  type="email"
                  placeholder="your.email@example.com"
                  :class="[
                    'w-full px-4 py-3 rounded-lg focus:ring-2 focus:border-transparent',
                    errors.email
                      ? 'border-red-500 focus:ring-red-500 border-2'
                      : 'border border-gray-300 focus:ring-primary'
                  ]"
                />
                <p v-if="errors.email" class="mt-1 text-xs text-red-600">{{ errors.email }}</p>
              </div>

              <!-- Phone -->
              <div>
                <label for="phone" class="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input 
                  id="phone"
                  v-model="form.phone"
                  type="tel"
                  placeholder="+234 xxx xxx xxxx"
                  :class="[
                    'w-full px-4 py-3 rounded-lg focus:ring-2 focus:border-transparent',
                    errors.phone
                      ? 'border-red-500 focus:ring-red-500 border-2'
                      : 'border border-gray-300 focus:ring-primary'
                  ]"
                />
                <p v-if="errors.phone" class="mt-1 text-xs text-red-600">{{ errors.phone }}</p>
              </div>

              <!-- Nationality -->
              <div>
                <label for="nationality" class="block text-sm font-medium text-gray-700 mb-2">
                  Your Nationality *
                </label>
                <select 
                  id="nationality"
                  v-model="form.nationality"
                  :class="[
                    'w-full px-4 py-3 rounded-lg focus:ring-2 focus:border-transparent',
                    errors.nationality
                      ? 'border-red-500 focus:ring-red-500 border-2'
                      : 'border border-gray-300 focus:ring-primary'
                  ]"
                >
                  <option value="">Select nationality</option>
                  <option v-for="nat in nationalities" :key="nat" :value="nat">
                    {{ nat }}
                  </option>
                </select>
                <p v-if="errors.nationality" class="mt-1 text-xs text-red-600">{{ errors.nationality }}</p>
              </div>

              <!-- Destination -->
              <div>
                <label for="destination" class="block text-sm font-medium text-gray-700 mb-2">
                  Destination Country *
                </label>
                <select 
                  id="destination"
                  v-model="form.destination"
                  :class="[
                    'w-full px-4 py-3 rounded-lg focus:ring-2 focus:border-transparent',
                    errors.destination
                      ? 'border-red-500 focus:ring-red-500 border-2'
                      : 'border border-gray-300 focus:ring-primary'
                  ]"
                >
                  <option value="">Select destination</option>
                  <option v-for="country in countries" :key="country.id" :value="country.name">
                    {{ country.name }}
                  </option>
                </select>
                <p v-if="errors.destination" class="mt-1 text-xs text-red-600">{{ errors.destination }}</p>
              </div>

              <!-- Purpose -->
              <div class="md:col-span-2">
                <label for="purpose" class="block text-sm font-medium text-gray-700 mb-2">
                  Purpose of Travel *
                </label>
                <select 
                  id="purpose"
                  v-model="form.purpose"
                  :class="[
                    'w-full px-4 py-3 rounded-lg focus:ring-2 focus:border-transparent',
                    errors.purpose
                      ? 'border-red-500 focus:ring-red-500 border-2'
                      : 'border border-gray-300 focus:ring-primary'
                  ]"
                >
                  <option value="">Select purpose</option>
                  <option v-for="p in purposeOfTravel" :key="p" :value="p">
                    {{ p }}
                  </option>
                </select>
                <p v-if="errors.purpose" class="mt-1 text-xs text-red-600">{{ errors.purpose }}</p>
              </div>

              <!-- Additional Info -->
              <div class="md:col-span-2">
                <label for="additionalInfo" class="block text-sm font-medium text-gray-700 mb-2">
                  Additional Information (Optional)
                </label>
                <textarea 
                  id="additionalInfo"
                  v-model="form.additionalInfo"
                  rows="4"
                  placeholder="Tell us more about your travel plans, concerns, or questions..."
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                ></textarea>
              </div>
            </div>

            <!-- Submit Button -->
            <button 
              type="submit"
              class="w-full py-4 bg-primary text-white rounded-lg font-bold text-lg hover:bg-primary/50 transition-colors"
            >
              Submit Inquiry
            </button>
          </form>

          <!-- Note -->
          <div class="mt-6 p-4 bg-white rounded-lg border border-primary">
            <p class="text-sm text-primary text-center">
              Our visa experts will review your inquiry and contact you within 24 hours
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
