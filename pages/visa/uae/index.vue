<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { FileText, Clock, CheckCircle } from 'lucide-vue-next'
import { useVisaData } from '../../../composables/useVisaData'
import { useVisaForm } from '../../../composables/useVisaForm'

const { visaTypes, countries, benefits, steps, formatPrice } = useVisaData()
const {
  currentStep,
  form,
  errors,
  setupErrorWatchers,
  handleFileUpload,
  nextStep,
  prevStep,
  submitApplication
} = useVisaForm()

const selectedVisaType = computed(() => {
  return visaTypes.find(v => v.id === form.value.visaType)
})

const requiredDocuments = computed(() => {
  if (!selectedVisaType.value) return []
  return selectedVisaType.value.documents
})

const scrollToForm = () => {
  const formElement = document.getElementById('visa-application-form')
  if (formElement) {
    formElement.scrollIntoView({ behavior: 'smooth' })
  }
}

const selectVisaAndScroll = (visaId: string) => {
  form.value.visaType = visaId
  currentStep.value = 2
  scrollToForm()
}

const handleNextStep = () => {
  nextStep(requiredDocuments.value)
}

const handleSubmit = () => {
  if (submitApplication()) {
    console.log('Application submitted:', form.value)
    alert('Your visa application has been submitted successfully!')
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
      class="relative py-44 px-6 bg-cover bg-center bg-no-repeat transition-all duration-500"
      style="background-image: url('https://images.unsplash.com/photo-1606768666853-403c90a981ad?w=1600')"
    >
      <div class="max-w-7xl mx-auto text-center">
        <h1 class="text-4xl md:text-5xl font-bold text-white mb-4">
          Apply for UAE Visa
        </h1>
        <p class="text-xl text-blue-100">
          Fast processing & expert assistance for all UAE visa types.
        </p>
      </div>
    </section>

    <!-- Visa Types Section -->
    <section class="py-16 px-6 bg-gray-50">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Choose Your Visa Type
          </h2>
          <p class="text-lg text-gray-600">
            We offer various UAE visa options to suit your travel needs
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div 
            v-for="visa in visaTypes" 
            :key="visa.id"
            class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
          >
            <div class="relative h-48 overflow-hidden">
              <img :src="visa.image" :alt="visa.title" class="w-full h-full object-cover" />
              <div class="absolute top-4 left-4 bg-white px-3 py-1 rounded-full text-sm font-semibold text-gray-900">
                UAE Visa
              </div>
            </div>

            <div class="p-6">
              <h3 class="text-xl font-bold text-gray-900 mb-4">{{ visa.title }}</h3>

              <div class="flex items-center gap-4 mb-4">
                <div class="flex items-center gap-2 text-sm">
                  <Clock class="w-4 h-4 text-primary" />
                  <span class="text-gray-600">Processing Time</span>
                </div>
              </div>
              <p class="text-sm text-gray-900 font-semibold mb-4">{{ visa.processingTime }}</p>

              <div class="flex items-center gap-2 text-sm mb-4">
                <FileText class="w-4 h-4 text-primary" />
                <span class="text-gray-600">Documents</span>
              </div>
              <p class="text-sm text-gray-900 font-semibold mb-4">{{ visa.documentsCount }} documents required</p>

              <div class="mb-6">
                <p class="text-sm font-semibold text-gray-900 mb-2">Required Documents:</p>
                <ul class="space-y-1">
                  <li 
                    v-for="doc in visa.documents" 
                    :key="doc"
                    class="text-sm text-gray-600 flex items-start gap-2"
                  >
                    <span class="text-green-600 mt-0.5">•</span>
                    <span>{{ doc }}</span>
                  </li>
                </ul>
              </div>

              <button 
                @click="selectVisaAndScroll(visa.id)"
                class="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
              >
                Apply Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Why Choose Section -->
    <section class="py-16 px-6 bg-white">
      <div class="max-w-7xl mx-auto">
        <div class="bg-primary-50 rounded-2xl p-8 md:p-12">
          <h3 class="text-2xl font-bold text-gray-900 mb-6">
            Why Choose Our Visa Services?
          </h3>
          <ul class="space-y-4">
            <li 
              v-for="benefit in benefits" 
              :key="benefit"
              class="flex items-start gap-3 text-gray-700"
            >
              <CheckCircle class="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <span>{{ benefit }}</span>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!-- Application Form Section -->
    <section id="visa-application-form" class="py-16 px-6 bg-gray-50">
      <div class="max-w-4xl mx-auto">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Start Your Visa Application
          </h2>
          <p class="text-lg text-gray-600">
            Follow the steps below to complete your UAE visa application
          </p>
        </div>

        <!-- Steps Indicator -->
        <div class="flex items-center justify-center mb-12">
          <div class="flex items-center gap-2 md:gap-4">
            <div 
              v-for="(step, index) in steps" 
              :key="step.id"
              class="flex items-center"
            >
              <div class="flex flex-col items-center">
                <div 
                  :class="[
                    'w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors',
                    currentStep >= step.number
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 text-gray-600'
                  ]"
                >
                  {{ step.number }}
                </div>
                <span class="text-xs mt-2 text-gray-600 hidden md:block">{{ step.title }}</span>
              </div>
              <div 
                v-if="index < steps.length - 1"
                :class="[
                  'w-12 md:w-24 h-0.5 mx-2',
                  currentStep > step.number ? 'bg-primary' : 'bg-gray-200'
                ]"
              ></div>
            </div>
          </div>
        </div>

        <!-- General Error -->
        <div v-if="errors.general" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-red-600 text-sm font-medium">{{ errors.general }}</p>
        </div>

        <!-- Form Card -->
        <div class="bg-white rounded-xl shadow-lg p-8">
          <!-- Step 1: Nationality -->
          <div v-show="currentStep === 1">
            <h3 class="text-2xl font-bold text-gray-900 mb-6">Select Your Nationality</h3>
            <p class="text-gray-600 mb-6">Choose your country to see the required documents</p>
            
            <div class="mb-6">
              <label for="nationality" class="block text-sm font-medium text-gray-700 mb-2">
                Nationality <span class="text-red-600">*</span>
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
                <option value="">Select your nationality</option>
                <option v-for="country in countries" :key="country" :value="country">
                  {{ country }}
                </option>
              </select>
              <p v-if="errors.nationality" class="mt-1 text-xs text-red-600">{{ errors.nationality }}</p>
            </div>

            <button 
              @click="handleNextStep"
              class="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Continue
            </button>
          </div>

          <!-- Step 2: Visa Type -->
          <div v-show="currentStep === 2">
            <h3 class="text-2xl font-bold text-gray-900 mb-6">Select Visa Type</h3>
            <p class="text-gray-600 mb-6">Choose the visa type that suits your travel plans</p>
            
            <div class="space-y-4 mb-6">
              <label 
                v-for="visa in visaTypes" 
                :key="visa.id"
                :class="[
                  'flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all',
                  form.visaType === visa.id 
                    ? 'border-primary' 
                    : errors.visaType
                    ? 'border-red-500'
                    : 'border-gray-200 hover:border-primary'
                ]"
              >
                <input 
                  v-model="form.visaType"
                  type="radio"
                  :value="visa.id"
                  class="w-5 h-5 text-primary"
                />
                <div class="flex-1">
                  <p class="font-semibold text-gray-900">{{ visa.title }}</p>
                  <p class="text-sm text-gray-600">{{ visa.processingTime }} • {{ formatPrice(visa.price) }}</p>
                </div>
              </label>
              <p v-if="errors.visaType" class="mt-1 text-xs text-red-600">{{ errors.visaType }}</p>
            </div>

            <div class="flex gap-4">
              <button 
                @click="prevStep"
                class="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button 
                @click="handleNextStep"
                class="flex-1 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
              >
                Continue
              </button>
            </div>
          </div>

          <!-- Step 3: Documents -->
          <div v-show="currentStep === 3">
            <h3 class="text-2xl font-bold text-gray-900 mb-6">Upload Documents</h3>
            <p class="text-gray-600 mb-6">Please upload the required documents for your visa application</p>
            
            <div class="space-y-4 mb-6">
              <div>
                <label for="passportCopy" class="block text-sm font-medium text-gray-700 mb-2">
                  Passport Copy (valid 6 months) <span class="text-red-600">*</span>
                </label>
                <input 
                  id="passportCopy"
                  type="file"
                  @change="handleFileUpload($event, 'passportCopy')"
                  accept="image/*,.pdf"
                  :class="[
                    'w-full px-4 py-3 rounded-lg focus:ring-2 focus:border-transparent',
                    errors.passportCopy
                      ? 'border-red-500 focus:ring-red-500 border-2'
                      : 'border border-gray-300 focus:ring-primary'
                  ]"
                />
                <p v-if="errors.passportCopy" class="mt-1 text-xs text-red-600">{{ errors.passportCopy }}</p>
              </div>

              <div>
                <label for="photo" class="block text-sm font-medium text-gray-700 mb-2">
                  Passport Size Photo <span class="text-red-600">*</span>
                </label>
                <input 
                  id="photo"
                  type="file"
                  @change="handleFileUpload($event, 'photo')"
                  accept="image/*"
                  :class="[
                    'w-full px-4 py-3 rounded-lg focus:ring-2 focus:border-transparent',
                    errors.photo
                      ? 'border-red-500 focus:ring-red-500 border-2'
                      : 'border border-gray-300 focus:ring-primary'
                  ]"
                />
                <p v-if="errors.photo" class="mt-1 text-xs text-red-600">{{ errors.photo }}</p>
              </div>

              <div v-if="requiredDocuments.includes('Confirmed flight tickets')">
                <label for="flightTicket" class="block text-sm font-medium text-gray-700 mb-2">
                  Confirmed Flight Tickets <span class="text-red-600">*</span>
                </label>
                <input 
                  id="flightTicket"
                  type="file"
                  @change="handleFileUpload($event, 'flightTicket')"
                  accept="image/*,.pdf"
                  :class="[
                    'w-full px-4 py-3 rounded-lg focus:ring-2 focus:border-transparent',
                    errors.flightTicket
                      ? 'border-red-500 focus:ring-red-500 border-2'
                      : 'border border-gray-300 focus:ring-primary'
                  ]"
                />
                <p v-if="errors.flightTicket" class="mt-1 text-xs text-red-600">{{ errors.flightTicket }}</p>
              </div>

              <div v-if="requiredDocuments.includes('Hotel booking confirmation')">
                <label for="hotelBooking" class="block text-sm font-medium text-gray-700 mb-2">
                  Hotel Booking Confirmation <span class="text-red-600">*</span>
                </label>
                <input 
                  id="hotelBooking"
                  type="file"
                  @change="handleFileUpload($event, 'hotelBooking')"
                  accept="image/*,.pdf"
                  :class="[
                    'w-full px-4 py-3 rounded-lg focus:ring-2 focus:border-transparent',
                    errors.hotelBooking
                      ? 'border-red-500 focus:ring-red-500 border-2'
                      : 'border border-gray-300 focus:ring-primary'
                  ]"
                />
                <p v-if="errors.hotelBooking" class="mt-1 text-xs text-red-600">{{ errors.hotelBooking }}</p>
              </div>

              <div v-if="requiredDocuments.includes('Employment letter')">
                <label for="employmentLetter" class="block text-sm font-medium text-gray-700 mb-2">
                  Employment Letter <span class="text-red-600">*</span>
                </label>
                <input 
                  id="employmentLetter"
                  type="file"
                  @change="handleFileUpload($event, 'employmentLetter')"
                  accept="image/*,.pdf"
                  :class="[
                    'w-full px-4 py-3 rounded-lg focus:ring-2 focus:border-transparent',
                    errors.employmentLetter
                      ? 'border-red-500 focus:ring-red-500 border-2'
                      : 'border border-gray-300 focus:ring-primary'
                  ]"
                />
                <p v-if="errors.employmentLetter" class="mt-1 text-xs text-red-600">{{ errors.employmentLetter }}</p>
              </div>

              <div v-if="requiredDocuments.includes('Travel insurance')">
                <label for="travelInsurance" class="block text-sm font-medium text-gray-700 mb-2">
                  Travel Insurance <span class="text-red-600">*</span>
                </label>
                <input 
                  id="travelInsurance"
                  type="file"
                  @change="handleFileUpload($event, 'travelInsurance')"
                  accept="image/*,.pdf"
                  :class="[
                    'w-full px-4 py-3 rounded-lg focus:ring-2 focus:border-transparent',
                    errors.travelInsurance
                      ? 'border-red-500 focus:ring-red-500 border-2'
                      : 'border border-gray-300 focus:ring-primary'
                  ]"
                />
                <p v-if="errors.travelInsurance" class="mt-1 text-xs text-red-600">{{ errors.travelInsurance }}</p>
              </div>
            </div>

            <div class="flex gap-4">
              <button 
                @click="prevStep"
                class="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button 
                @click="handleNextStep"
                class="flex-1 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
              >
                Continue
              </button>
            </div>
          </div>

          <!-- Step 4: Personal Details -->
          <div v-show="currentStep === 4">
            <h3 class="text-2xl font-bold text-gray-900 mb-6">Personal Details</h3>
            <p class="text-gray-600 mb-6">Please provide your personal information</p>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label for="firstName" class="block text-sm font-medium text-gray-700 mb-2">First Name <span class="text-red-600">*</span></label>
                <input 
                  id="firstName"
                  v-model="form.firstName"
                  type="text"
                  :class="[
                    'w-full px-4 py-3 rounded-lg focus:ring-2 focus:border-transparent',
                    errors.firstName ? 'border-red-500 focus:ring-red-500 border-2' : 'border border-gray-300 focus:ring-primary'
                  ]"
                />
                <p v-if="errors.firstName" class="mt-1 text-xs text-red-600">{{ errors.firstName }}</p>
              </div>

              <div>
                <label for="lastName" class="block text-sm font-medium text-gray-700 mb-2">Last Name <span class="text-red-600">*</span></label>
                <input 
                  id="lastName"
                  v-model="form.lastName"
                  type="text"
                  :class="[
                    'w-full px-4 py-3 rounded-lg focus:ring-2 focus:border-transparent',
                    errors.lastName ? 'border-red-500 focus:ring-red-500 border-2' : 'border border-gray-300 focus:ring-primary'
                  ]"
                />
                <p v-if="errors.lastName" class="mt-1 text-xs text-red-600">{{ errors.lastName }}</p>
              </div>

              <div>
                <label for="email" class="block text-sm font-medium text-gray-700 mb-2">Email <span class="text-red-600">*</span></label>
                <input 
                  id="email"
                  v-model="form.email"
                  type="email"
                  :class="[
                    'w-full px-4 py-3 rounded-lg focus:ring-2 focus:border-transparent',
                    errors.email ? 'border-red-500 focus:ring-red-500 border-2' : 'border border-gray-300 focus:ring-primary'
                  ]"
                />
                <p v-if="errors.email" class="mt-1 text-xs text-red-600">{{ errors.email }}</p>
              </div>

              <div>
                <label for="phone" class="block text-sm font-medium text-gray-700 mb-2">Phone Number <span class="text-red-600">*</span></label>
                <input 
                  id="phone"
                  v-model="form.phone"
                  type="tel"
                  :class="[
                    'w-full px-4 py-3 rounded-lg focus:ring-2 focus:border-transparent',
                    errors.phone ? 'border-red-500 focus:ring-red-500 border-2' : 'border border-gray-300 focus:ring-primary'
                  ]"
                />
                <p v-if="errors.phone" class="mt-1 text-xs text-red-600">{{ errors.phone }}</p>
              </div>

              <div>
                <label for="passportNumber" class="block text-sm font-medium text-gray-700 mb-2">Passport Number <span class="text-red-600">*</span></label>
                <input 
                  id="passportNumber"
                  v-model="form.passportNumber"
                  type="text"
                  :class="[
                    'w-full px-4 py-3 rounded-lg focus:ring-2 focus:border-transparent',
                    errors.passportNumber ? 'border-red-500 focus:ring-red-500 border-2' : 'border border-gray-300 focus:ring-primary'
                  ]"
                />
                <p v-if="errors.passportNumber" class="mt-1 text-xs text-red-600">{{ errors.passportNumber }}</p>
              </div>

              <div>
                <label for="dateOfBirth" class="block text-sm font-medium text-gray-700 mb-2">Date of Birth <span class="text-red-600">*</span></label>
                <input 
                  id="dateOfBirth"
                  v-model="form.dateOfBirth"
                  type="date"
                  :class="[
                    'w-full px-4 py-3 rounded-lg focus:ring-2 focus:border-transparent',
                    errors.dateOfBirth ? 'border-red-500 focus:ring-red-500 border-2' : 'border border-gray-300 focus:ring-primary'
                  ]"
                />
                <p v-if="errors.dateOfBirth" class="mt-1 text-xs text-red-600">{{ errors.dateOfBirth }}</p>
              </div>

              <div class="md:col-span-2">
                <label for="travelDate" class="block text-sm font-medium text-gray-700 mb-2">Intended Travel Date <span class="text-red-600">*</span></label>
                <input 
                  id="travelDate"
                  v-model="form.travelDate"
                  type="date"
                  :class="[
                    'w-full px-4 py-3 rounded-lg focus:ring-2 focus:border-transparent',
                    errors.travelDate ? 'border-red-500 focus:ring-red-500 border-2' : 'border border-gray-300 focus:ring-primary'
                  ]"
                />
                <p v-if="errors.travelDate" class="mt-1 text-xs text-red-600">{{ errors.travelDate }}</p>
              </div>
            </div>

            <div class="flex gap-4">
              <button 
                @click="prevStep"
                class="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button 
                @click="handleSubmit"
                class="flex-1 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
              >
                Submit Application
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>