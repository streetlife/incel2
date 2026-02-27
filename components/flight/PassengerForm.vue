<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useFlightService } from '../../services/flight.service'
import { useFlightStore } from '../../stores/flight'
import { useToast } from '../../composables/useToast'
import { normaliseError } from '../../utils/api'
import AppToast from '../toast/AppToast.vue'

const emit = defineEmits<(e: 'next') => void>()
const flightStore = useFlightStore()

const {
  isLoggedIn,
  passengers,
  discountRate,
  discountCode,
  contactEmail,
  contactPhone,
  session_code,
} = storeToRefs(flightStore)

const { applyB2BDiscount, clearDiscount, setNameEmail } = flightStore

const showLoginPanel = ref(false)
const loginEmail = ref('')
const loginPassword = ref('')
const loginLoading = ref(false)
const loginError = ref('')
const loading = ref(false)
const error = ref('')
const errors = ref<Record<string, string>>({})

const flightService = useFlightService()
const toast = useToast()

const B2B_MOCK: Record<string, { rate: number; code: string; name: string }> = {
  'agent@acme.com': { rate: 0.12, code: 'B2B-ACME-12', name: 'Acme Travel' },
  'ops@globetours.com': { rate: 0.08, code: 'B2B-GLOB-08', name: 'Globe Tours' },
}

async function handleLogin() {
  loginLoading.value = true
  loginError.value = ''
  await new Promise(r => setTimeout(r, 900))

  const match = B2B_MOCK[loginEmail.value.toLowerCase()]
  if (match && loginPassword.value.length >= 6) {
    flightStore.isLoggedIn = true
    applyB2BDiscount(match.rate, match.code)
    showLoginPanel.value = false
  } else {
    loginError.value = 'Invalid credentials or account not found.'
  }
  loginLoading.value = false
}

function handleLogout() {
  flightStore.isLoggedIn = false
  clearDiscount()
  loginEmail.value = ''
  loginPassword.value = ''
}

const NATIONALITIES = ['NG', 'GB', 'US', 'GH', 'KE', 'ZA', 'CA', 'DE', 'FR', 'AE']

function validate(): boolean {
  errors.value = {}

  passengers.value.forEach((p, i) => {
    const px = `p${i}`
    if (!p.firstname.trim()) errors.value[`${px}_first`] = 'Required'
    if (!p.surname.trim()) errors.value[`${px}_last`] = 'Required'
    if (!p.birth_date) errors.value[`${px}_dob`] = 'Required'
    if (!p.passport_issuance_date.trim()) errors.value[`${px}_ppn`] = 'Required'
    if (!p.passport_expiry_date.trim()) errors.value[`${px}_ppx`] = 'Required'
    if (i === 0) {
      if (!p.emailaddress.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
        errors.value[`${px}_email`] = 'Valid email required'
      if (!p.phone_number.match(/^\+?[\d\s\-()]{8,}$/))
        errors.value[`${px}_phone`] = 'Valid phone required'
    }
  })

  contactEmail.value = passengers.value[0]?.emailaddress ?? ''
  contactPhone.value = passengers.value[0]?.phone_number ?? ''

  return Object.keys(errors.value).length === 0
}

async function submit() {
  if (!validate()) return

  loading.value = true
  try {
    await flightService.saveBooking({
      sessionCode: session_code.value,
      traveller: passengers.value,
    })

    const first = passengers.value[0]
    setNameEmail(`${first.firstname} ${first.surname}`, first.emailaddress)

    toast.success('Saved successfully')
    emit('next')
  } catch (err) {
    error.value = normaliseError(err)
    toast.error(error.value)
  } finally {
    loading.value = false
  }
}

const fieldClass = (key: string) =>
  `w-full px-3.5 py-2.5 text-sm rounded-xl border transition-colors outline-none focus:ring-2 focus:ring-primary/20 ${
    errors.value[key]
      ? 'border-red-300 bg-red-50 focus:border-red-400'
      : 'border-slate-200 bg-white focus:border-primary'
  }`
</script>

<template>
  <div class="space-y-6">
    <AppToast />

    <div class="bg-blue-50 border border-blue-200 rounded-2xl p-4">
      <div v-if="!isLoggedIn" class="flex items-start justify-between gap-4">
        <div>
          <p class="text-sm font-semibold text-primary">Are you a corporate or travel agent?</p>
          <p class="text-xs text-primary mt-0.5">Log in to apply your B2B discount automatically.</p>
        </div>
        <button
          class="shrink-0 text-xs font-semibold px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/65 transition-colors border-none cursor-pointer"
          @click="showLoginPanel = !showLoginPanel"
        >
          {{ showLoginPanel ? 'Cancel' : 'Log In' }}
        </button>
      </div>

      <div v-else class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
            {{ loginEmail.slice(0, 1).toUpperCase() || 'B' }}
          </div>
          <div>
            <p class="text-sm font-semibold text-primary">B2B Account Active</p>
            <p class="text-xs text-green-600 font-medium">
              {{ (discountRate * 100).toFixed(0) }}% discount applied · {{ discountCode }}
            </p>
          </div>
        </div>
        <button class="text-xs text-primary/25 underline cursor-pointer bg-transparent border-none" @click="handleLogout">
          Log out
        </button>
      </div>

      <Transition enter-active-class="transition-all duration-200" enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0">
        <div v-if="showLoginPanel && !isLoggedIn" class="mt-4 pt-4 border-t border-blue-200 space-y-3">
          <input v-model="loginEmail" type="email" placeholder="Work email" class="w-full px-3.5 py-2.5 text-sm rounded-xl border border-blue-200 bg-white focus:border-primary/50 outline-none" />
          <input v-model="loginPassword" type="password" placeholder="Password" class="w-full px-3.5 py-2.5 text-sm rounded-xl border border-blue-200 bg-white focus:border-primary/50 outline-none" />
          <p v-if="loginError" class="text-xs text-red-600">{{ loginError }}</p>
          <button
            class="w-full py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/65 transition-colors border-none cursor-pointer disabled:opacity-60"
            :disabled="loginLoading"
            @click="handleLogin"
          >
            <span v-if="loginLoading">Verifying…</span>
            <span v-else>Log In & Apply Discount</span>
          </button>
          <p class="text-[10px] text-primary/50 text-center">Hint: try agent@acme.com / anypassword</p>
        </div>
      </Transition>
    </div>

    <div
      v-for="(passenger, i) in passengers"
      :key="i"
      class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
    >
      <div class="flex items-center justify-between px-5 py-3.5 bg-slate-50 border-b border-slate-100">
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
            {{ i + 1 }}
          </div>
          <span class="text-sm font-semibold text-slate-800">
            {{ i === 0 ? 'Primary Passenger' : `Passenger ${i + 1}` }}
          </span>
        </div>
        <span class="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">{{ passenger.type }}</span>
      </div>

      <div class="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label for="" class="text-xs font-semibold text-slate-500 mb-1.5 block">First Name <span class="text-red-400">*</span></label>
          <input v-model="passenger.firstname" type="text" placeholder="As on passport" :class="fieldClass(`p${i}_first`)" />
          <p v-if="errors[`p${i}_first`]" class="text-xs text-red-500 mt-1">{{ errors[`p${i}_first`] }}</p>
        </div>

        <div>
          <label for="" class="text-xs font-semibold text-slate-500 mb-1.5 block">Last Name <span class="text-red-400">*</span></label>
          <input v-model="passenger.surname" type="text" placeholder="As on passport" :class="fieldClass(`p${i}_last`)" />
          <p v-if="errors[`p${i}_last`]" class="text-xs text-red-500 mt-1">{{ errors[`p${i}_last`] }}</p>
        </div>

        <div>
          <label for="" class="text-xs font-semibold text-slate-500 mb-1.5 block">Date of Birth <span class="text-red-400">*</span></label>
          <input v-model="passenger.birth_date" type="date" :max="new Date().toISOString().split('T')[0]" :class="fieldClass(`p${i}_dob`)" />
          <p v-if="errors[`p${i}_dob`]" class="text-xs text-red-500 mt-1">{{ errors[`p${i}_dob`] }}</p>
        </div>

        <div>
          <label for="" class="text-xs font-semibold text-slate-500 mb-1.5 block">Passport Nationality <span class="text-red-400">*</span></label>
          <select v-model="passenger.passport_nationality" :class="fieldClass(`p${i}_nat`)">
            <option value="">Select nationality</option>
            <option v-for="n in NATIONALITIES" :key="n" :value="n">{{ n }}</option>
          </select>
          <p v-if="errors[`p${i}_nat`]" class="text-xs text-red-500 mt-1">{{ errors[`p${i}_nat`] }}</p>
        </div>

        <div>
          <label for="" class="text-xs font-semibold text-slate-500 mb-1.5 block">Passport Issuance Date <span class="text-red-400">*</span></label>
          <input v-model="passenger.passport_issuance_date" type="date" :class="fieldClass(`p${i}_ppn`)" />
          <p v-if="errors[`p${i}_ppn`]" class="text-xs text-red-500 mt-1">{{ errors[`p${i}_ppn`] }}</p>
        </div>

        <div>
          <label for="" class="text-xs font-semibold text-slate-500 mb-1.5 block">Passport Expiry Date <span class="text-red-400">*</span></label>
          <input v-model="passenger.passport_expiry_date" type="date" :min="new Date().toISOString().split('T')[0]" :class="fieldClass(`p${i}_ppx`)" />
          <p v-if="errors[`p${i}_ppx`]" class="text-xs text-red-500 mt-1">{{ errors[`p${i}_ppx`] }}</p>
        </div>

        <template v-if="i === 0">
          <div class="sm:col-span-2 border-t border-slate-100 pt-4 mt-1">
            <p class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Contact Details</p>
          </div>
          <div>
            <label for="" class="text-xs font-semibold text-slate-500 mb-1.5 block">Email Address <span class="text-red-400">*</span></label>
            <input v-model="passenger.emailaddress" type="email" placeholder="ticket@example.com" :class="fieldClass(`p${i}_email`)" />
            <p class="text-[10px] text-slate-400 mt-1">Invoice & ticket will be sent here</p>
            <p v-if="errors[`p${i}_email`]" class="text-xs text-red-500 mt-1">{{ errors[`p${i}_email`] }}</p>
          </div>
          <div>
            <label for="" class="text-xs font-semibold text-slate-500 mb-1.5 block">Phone Number <span class="text-red-400">*</span></label>
            <input v-model="passenger.phone_number" type="tel" placeholder="+234 800 000 0000" :class="fieldClass(`p${i}_phone`)" />
            <p v-if="errors[`p${i}_phone`]" class="text-xs text-red-500 mt-1">{{ errors[`p${i}_phone`] }}</p>
          </div>
        </template>
      </div>
    </div>

    <button
      class="w-full h-14 bg-primary hover:opacity-90 text-white font-bold text-base rounded-2xl transition-all border-none cursor-pointer flex items-center justify-center gap-2 shadow-lg p-4"
      :disabled="loading"
      @click="submit"
    >
      {{ loading ? 'Processing…' : 'Continue to Review' }}
      <svg v-if="!loading" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      <svg v-else class="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
    </button>
  </div>
</template>