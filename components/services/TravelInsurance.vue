<script setup lang="ts">
import { ref, watch } from 'vue'
import DateRangeInput from '../forms/DateRangeInput.vue'
import { useGeneralService } from '../../services/general.service'
import { useToast } from '../../composables/useToast'
import { normaliseError } from '../../utils/api'
import AppToast from '../toast/AppToast.vue'

const form = ref({
  booking_code: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  occupation: '',
  maritalStatus: '',
  nextOfKin: '',
  nextOfKinPhone: '',
  nextOfKinAddress: '',
  nextOfKinContact: '',
  nextOfKinRelationship: '',
  coverDates: {
    start: '',
    end: ''
  },
  destination: '',
  passengerStateOfResident: '',
  additionalInformation: '',
  terms_and_conditions: false
})

const errors = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  occupation: '',
  maritalStatus: '',
  nextOfKin: '',
  nextOfKinPhone: '',
  nextOfKinRelationship: '',
  coverDates: '',
  destination: '',
  passengerStateOfResident: '',
  terms_and_conditions: '',
  general: ''
})

const loading = ref(false)
const generalService = useGeneralService()
const toast = useToast()

const maritalStatusOptions = ['Single', 'Married', 'Divorced', 'Widowed']
const relationshipOptions = ['Spouse', 'Parent', 'Sibling', 'Child', 'Friend', 'Other']

const nigerianStates = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo',
  'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa',
  'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba',
  'Yobe', 'Zamfara'
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
watchField('address', () => form.value.address)
watchField('occupation', () => form.value.occupation)
watchField('maritalStatus', () => form.value.maritalStatus)
watchField('nextOfKin', () => form.value.nextOfKin)
watchField('nextOfKinPhone', () => form.value.nextOfKinPhone)
watchField('nextOfKinRelationship', () => form.value.nextOfKinRelationship)
watchField('destination', () => form.value.destination)
watchField('passengerStateOfResident', () => form.value.passengerStateOfResident)
watchField('terms_and_conditions', () => form.value.terms_and_conditions)
watch(() => form.value.coverDates, () => { if (errors.value.coverDates) errors.value.coverDates = '' }, { deep: true })

const validateForm = (): boolean => {
  errors.value = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    occupation: '',
    maritalStatus: '',
    nextOfKin: '',
    nextOfKinPhone: '',
    nextOfKinRelationship: '',
    coverDates: '',
    destination: '',
    passengerStateOfResident: '',
    terms_and_conditions: '',
    general: ''
  }

  let isValid = true

  const required = (field: keyof typeof errors.value, value: string, label: string) => {
    if (!value?.trim()) {
      (errors.value as any)[field] = `${label} is required`
      isValid = false
    }
  }

  required('firstName', form.value.firstName, 'First name')
  required('lastName', form.value.lastName, 'Last name')
  required('address', form.value.address, 'Address')
  required('occupation', form.value.occupation, 'Occupation')
  required('maritalStatus', form.value.maritalStatus, 'Marital status')
  required('nextOfKin', form.value.nextOfKin, 'Next of kin name')
  required('nextOfKinPhone', form.value.nextOfKinPhone, 'Next of kin phone')
  required('nextOfKinRelationship', form.value.nextOfKinRelationship, 'Relationship')
  required('destination', form.value.destination, 'Destination')
  required('passengerStateOfResident', form.value.passengerStateOfResident, 'State of residence')

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

  if (!form.value.coverDates.start || !form.value.coverDates.end) {
    errors.value.coverDates = 'Cover start and end dates are required'
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
    address: '',
    occupation: '',
    maritalStatus: '',
    nextOfKin: '',
    nextOfKinPhone: '',
    nextOfKinAddress: '',
    nextOfKinContact: '',
    nextOfKinRelationship: '',
    coverDates: {
      start: '',
      end: ''
    },
    destination: '',
    passengerStateOfResident: '',
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
    service: 'insurance',
    booking_code: form.value.booking_code,
    terms_and_conditions: form.value.terms_and_conditions,
    status: 'pending',
    request_details: {
      name: `${form.value.firstName} ${form.value.lastName}`,
      email: form.value.email,
      phone: form.value.phone,
      address: form.value.address,
      occupation: form.value.occupation,
      maritalStatus: form.value.maritalStatus,
      nextOfKin: form.value.nextOfKin,
      nextOfKinPhone: form.value.nextOfKinPhone,
      nextOfKinAddress: form.value.nextOfKinAddress,
      nextOfKinContact: form.value.nextOfKinContact,
      nextOfKinRelationship: form.value.nextOfKinRelationship,
      coverStartDate: form.value.coverDates.start,
      coverEndDate: form.value.coverDates.end,
      destination: form.value.destination,
      passengerStateOfResident: form.value.passengerStateOfResident,
      additionalInformation: form.value.additionalInformation || 'No medical condition'
    }
  }

  try {
    loading.value = true
    await generalService.saveTravelInsurance(payload)

    toast.success('Request created successfully')
    resetForm()
  } catch(err) {
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
      style="background-image: url('https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1600')"
    >
      <div class="absolute inset-0 bg-black/50"></div>
      <div class="relative z-10 max-w-7xl mx-auto text-center">
        <h1 class="text-4xl md:text-5xl font-bold mb-4 text-white">Travel Insurance</h1>
        <p class="text-xl text-gray-100">Protect your journey with comprehensive coverage</p>
      </div>
    </section>

    <section class="py-16 px-6">
      <div class="max-w-3xl mx-auto">
        <div class="bg-white rounded-xl shadow-lg p-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-8">Your Personal Information</h2>
          <form @submit.prevent="submit" class="space-y-8">
            <fieldset>
              <legend class="text-base font-semibold text-gray-800 mb-4 pb-2 border-b w-full">
                Personal Information
              </legend>
              <div class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-1 gap-4">
                  <div>
                    <label for="" class="block text-sm font-medium text-gray-700 mb-2">Booking Code (leave empty if you haven't booked)</label>
                    <input
                      v-model="form.booking_code"
                      type="text"
                      class="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:border-transparent transition-colors"
                    />
                  </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label for="" class="block text-sm font-medium text-gray-700 mb-2">First Name <span class="text-red-500">*</span></label>
                    <input
                      v-model="form.firstName"
                      type="text"
                      :class="inputClass(!!errors.firstName)"
                    />
                    <p v-if="errors.firstName" class="mt-1 text-xs text-red-600">{{ errors.firstName }}</p>
                  </div>
                  <div>
                    <label for="" class="block text-sm font-medium text-gray-700 mb-2">Last Name <span class="text-red-500">*</span></label>
                    <input
                      v-model="form.lastName"
                      type="text"
                      :class="inputClass(!!errors.lastName)"
                    />
                    <p v-if="errors.lastName" class="mt-1 text-xs text-red-600">{{ errors.lastName }}</p>
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label for="" class="block text-sm font-medium text-gray-700 mb-2">Email <span class="text-red-500">*</span></label>
                    <input
                      v-model="form.email"
                      type="email"
                      :class="inputClass(!!errors.email)"
                    />
                    <p v-if="errors.email" class="mt-1 text-xs text-red-600">{{ errors.email }}</p>
                  </div>
                  <div>
                    <label for="" class="block text-sm font-medium text-gray-700 mb-2">Phone Number <span class="text-red-500">*</span></label>
                    <input
                      v-model="form.phone"
                      type="tel"
                      placeholder="e.g. 08012345678"
                      :class="inputClass(!!errors.phone)"
                    />
                    <p v-if="errors.phone" class="mt-1 text-xs text-red-600">{{ errors.phone }}</p>
                  </div>
                </div>

                <div>
                  <label for="" class="block text-sm font-medium text-gray-700 mb-2">Address <span class="text-red-500">*</span></label>
                  <input
                    v-model="form.address"
                    type="text"
                    placeholder="e.g. 12 Allen Avenue Lagos"
                    :class="inputClass(!!errors.address)"
                  />
                  <p v-if="errors.address" class="mt-1 text-xs text-red-600">{{ errors.address }}</p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label for="" class="block text-sm font-medium text-gray-700 mb-2">Occupation <span class="text-red-500">*</span></label>
                    <input
                      v-model="form.occupation"
                      type="text"
                      placeholder="e.g. Engineer"
                      :class="inputClass(!!errors.occupation)"
                    />
                    <p v-if="errors.occupation" class="mt-1 text-xs text-red-600">{{ errors.occupation }}</p>
                  </div>
                  <div>
                    <label for="" class="block text-sm font-medium text-gray-700 mb-2">Marital Status <span class="text-red-500">*</span></label>
                    <select
                      v-model="form.maritalStatus"
                      :class="inputClass(!!errors.maritalStatus)"
                    >
                      <option value="" disabled>Select status</option>
                      <option v-for="s in maritalStatusOptions" :key="s" :value="s">{{ s }}</option>
                    </select>
                    <p v-if="errors.maritalStatus" class="mt-1 text-xs text-red-600">{{ errors.maritalStatus }}</p>
                  </div>
                </div>
              </div>
            </fieldset>

            <fieldset>
              <legend class="text-base font-semibold text-gray-800 mb-4 pb-2 border-b w-full">
                Next of Kin
              </legend>
              <div class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label for="" class="block text-sm font-medium text-gray-700 mb-2">Full Name <span class="text-red-500">*</span></label>
                    <input
                      v-model="form.nextOfKin"
                      type="text"
                      placeholder="e.g. Jane Doe"
                      :class="inputClass(!!errors.nextOfKin)"
                    />
                    <p v-if="errors.nextOfKin" class="mt-1 text-xs text-red-600">{{ errors.nextOfKin }}</p>
                  </div>
                  <div>
                    <label for="" class="block text-sm font-medium text-gray-700 mb-2">Relationship <span class="text-red-500">*</span></label>
                    <select
                      v-model="form.nextOfKinRelationship"
                      :class="inputClass(!!errors.nextOfKinRelationship)"
                    >
                      <option value="" disabled>Select relationship</option>
                      <option v-for="r in relationshipOptions" :key="r" :value="r">{{ r }}</option>
                    </select>
                    <p v-if="errors.nextOfKinRelationship" class="mt-1 text-xs text-red-600">{{ errors.nextOfKinRelationship }}</p>
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label for="" class="block text-sm font-medium text-gray-700 mb-2">Phone Number <span class="text-red-500">*</span></label>
                    <input
                      v-model="form.nextOfKinPhone"
                      type="tel"
                      placeholder="e.g. 08087654321"
                      :class="inputClass(!!errors.nextOfKinPhone)"
                    />
                    <p v-if="errors.nextOfKinPhone" class="mt-1 text-xs text-red-600">{{ errors.nextOfKinPhone }}</p>
                  </div>
                  <div>
                    <label for="" class="block text-sm font-medium text-gray-700 mb-2">Contact (Alt. Phone)</label>
                    <input
                      v-model="form.nextOfKinContact"
                      type="tel"
                      placeholder="Optional"
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label for="" class="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <input
                    v-model="form.nextOfKinAddress"
                    type="text"
                    placeholder="e.g. Ikeja Lagos"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
            </fieldset>

            <fieldset>
              <legend class="text-base font-semibold text-gray-800 mb-4 pb-2 border-b w-full">
                Travel Details
              </legend>
              <div class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label for="" class="block text-sm font-medium text-gray-700 mb-2">Destination <span class="text-red-500">*</span></label>
                    <input
                      v-model="form.destination"
                      type="text"
                      placeholder="e.g. UK"
                      :class="inputClass(!!errors.destination)"
                    />
                    <p v-if="errors.destination" class="mt-1 text-xs text-red-600">{{ errors.destination }}</p>
                  </div>
                  <div>
                    <label for="" class="block text-sm font-medium text-gray-700 mb-2">State of Residence <span class="text-red-500">*</span></label>
                    <select
                      v-model="form.passengerStateOfResident"
                      :class="inputClass(!!errors.passengerStateOfResident)"
                    >
                      <option value="" disabled>Select state</option>
                      <option v-for="state in nigerianStates" :key="state" :value="state">{{ state }}</option>
                    </select>
                    <p v-if="errors.passengerStateOfResident" class="mt-1 text-xs text-red-600">{{ errors.passengerStateOfResident }}</p>
                  </div>
                </div>

                <div>
                  <DateRangeInput
                    v-model="form.coverDates"
                    label="Cover Period"
                    important
                    :allow-past-dates="false"
                  />
                  <p v-if="errors.coverDates" class="mt-1 text-xs text-red-600">{{ errors.coverDates }}</p>
                </div>

                <div>
                  <label for="" class="block text-sm font-medium text-gray-700 mb-2">Additional Information</label>
                  <textarea
                    v-model="form.additionalInformation"
                    rows="3"
                    placeholder="e.g. No medical condition, or describe any pre-existing conditions..."
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  />
                </div>
              </div>
            </fieldset>

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
              <p v-if="errors.terms_and_conditions" class="mt-1 text-xs text-red-600">
                {{ errors.terms_and_conditions }}
              </p>
            </div>

            <button
              type="submit"
              class="w-full flex gap-3 items-center justify-center py-4 bg-primary text-white rounded-lg font-bold text-lg hover:bg-primary-dark transition-colors"
            >
              <svg v-if="loading" class="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              {{ loading ? 'Sending...' : 'Submit Insurance Request' }}
            </button>
          </form>
        </div>
      </div>
    </section>
  </div>
</template>
