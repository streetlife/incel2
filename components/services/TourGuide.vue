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
  destination: '',
  tourDate: '',
  duration: '4',
  groupSize: 1,
  language: '',
  tourInterests: [] as string[],
  additionalInformation: '',
  terms_and_conditions: false
})

const errors = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  destination: '',
  tourDate: '',
  language: '',
  tourInterests: '',
  terms_and_conditions: '',
  general: ''
})

const loading = ref(false)
const toast = useToast()
const generalService = useGeneralService()

const languages = [
  'English', 'French', 'Spanish', 'German',
  'Italian', 'Portuguese', 'Arabic', 'Mandarin', 'Japanese', 'Korean'
]

const tourInterestOptions = [
  { value: 'historical', label: 'Historical Sites' },
  { value: 'cultural', label: 'Cultural Experience' },
  { value: 'food', label: 'Food & Cuisine' },
  { value: 'adventure', label: 'Adventure' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'nature', label: 'Nature & Wildlife' },
  { value: 'photography', label: 'Photography' },
  { value: 'nightlife', label: 'Nightlife' }
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
watchField('destination', () => form.value.destination)
watchField('tourDate', () => form.value.tourDate)
watchField('language', () => form.value.language)
watchField('tourInterests', () => form.value.tourInterests)
watchField('terms_and_conditions', () => form.value.terms_and_conditions)

const validateForm = (): boolean => {
  errors.value = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    destination: '',
    tourDate: '',
    language: '',
    tourInterests: '',
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

  if (!form.value.destination.trim()) {
    errors.value.destination = 'Destination is required'
    isValid = false
  }

  if (!form.value.tourDate) {
    errors.value.tourDate = 'Tour date is required'
    isValid = false
  }

  if (!form.value.language) {
    errors.value.language = 'Language preference is required'
    isValid = false
  }

  if (form.value.tourInterests.length === 0) {
    errors.value.tourInterests = 'Please select at least one tour interest'
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
    destination: '',
    tourDate: '',
    duration: '4',
    groupSize: 1,
    language: '',
    tourInterests: [],
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
    service: 'tour-guide',
    booking_code: form.value.booking_code,
    terms_and_conditions: form.value.terms_and_conditions,
    status: 'pending',
    request_details: {
      name: `${form.value.firstName} ${form.value.lastName}`,
      email: form.value.email,
      phone: form.value.phone,
      destination: form.value.destination,
      tourDate: form.value.tourDate,
      duration: `${form.value.duration} hours`,
      groupSize: form.value.groupSize,
      language: form.value.language,
      tourInterests: form.value.tourInterests,
      additionalInformation: form.value.additionalInformation || ''
    }
  }

  try {
    loading.value = true
    //await generalService.saveTourGuide(payload)
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
      style="background-image: url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600')"
    >
      <div class="absolute inset-0 bg-black/50"></div>
      <div class="relative z-10 max-w-7xl mx-auto text-center">
        <h1 class="text-4xl md:text-5xl font-bold mb-4 text-white">Professional Tour Guides</h1>
        <p class="text-xl text-gray-100">Expert local guides for unforgettable experiences</p>
      </div>
    </section>

    <section class="py-16 px-6 bg-gray-50">
      <div class="max-w-3xl mx-auto">
        <div class="bg-white rounded-xl shadow-lg p-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-8">Request a Tour Guide</h2>

          <form @submit.prevent="submit" class="space-y-8">
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
                Tour Details
              </legend>
              <div class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label for="" class="block text-sm font-medium text-gray-700 mb-2">Destination <span class="text-red-500">*</span></label>
                    <input
                      v-model="form.destination"
                      type="text"
                      placeholder="e.g. Lagos, Nigeria"
                      :class="inputClass(!!errors.destination)"
                    />
                    <p v-if="errors.destination" class="mt-1 text-xs text-red-600">{{ errors.destination }}</p>
                  </div>
                  <div>
                    <label for="" class="block text-sm font-medium text-gray-700 mb-2">Preferred Language <span class="text-red-500">*</span></label>
                    <select v-model="form.language" :class="inputClass(!!errors.language)">
                      <option value="">Select Language</option>
                      <option v-for="lang in languages" :key="lang" :value="lang">{{ lang }}</option>
                    </select>
                    <p v-if="errors.language" class="mt-1 text-xs text-red-600">{{ errors.language }}</p>
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label for="" class="block text-sm font-medium text-gray-700 mb-2">Tour Date <span class="text-red-500">*</span></label>
                    <input
                      v-model="form.tourDate"
                      type="date"
                      :min="new Date().toISOString().split('T')[0]"
                      :class="inputClass(!!errors.tourDate)"
                    />
                    <p v-if="errors.tourDate" class="mt-1 text-xs text-red-600">{{ errors.tourDate }}</p>
                  </div>
                  <div>
                    <label for="" class="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                    <select v-model="form.duration" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                      <option value="2">2 Hours</option>
                      <option value="4">4 Hours (Half Day)</option>
                      <option value="8">8 Hours (Full Day)</option>
                      <option value="12">12 Hours (Extended)</option>
                    </select>
                  </div>
                  <div>
                    <label for="" class="block text-sm font-medium text-gray-700 mb-2">Group Size</label>
                    <input
                      v-model.number="form.groupSize"
                      type="number"
                      min="1"
                      max="30"
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </fieldset>

            <fieldset>
              <legend class="text-base font-semibold text-gray-800 mb-4 pb-2 border-b w-full">
                Tour Interests <span class="text-red-500">*</span>
              </legend>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label
                  v-for="option in tourInterestOptions"
                  :key="option.value"
                  class="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-colors"
                  :class="form.tourInterests.includes(option.value) ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'"
                >
                  <input
                    v-model="form.tourInterests"
                    type="checkbox"
                    :value="option.value"
                    class="w-4 h-4 text-primary shrink-0"
                  />
                  <span class="text-sm font-medium text-gray-700">{{ option.label }}</span>
                </label>
              </div>
              <p v-if="errors.tourInterests" class="mt-2 text-xs text-red-600">{{ errors.tourInterests }}</p>
            </fieldset>

            <div>
              <label for="" class="block text-sm font-medium text-gray-700 mb-2">Additional Information</label>
              <textarea
                v-model="form.additionalInformation"
                rows="3"
                placeholder="Specific interests, accessibility needs, etc."
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
              {{ loading ? 'Sending...' : 'Request Guide' }}
            </button>

          </form>
        </div>
      </div>
    </section>
  </div>
</template>