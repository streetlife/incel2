<!-- Step 1: Passenger details + optional B2B login -->
<script setup lang="ts">
import { ref } from 'vue'
import { useBookingStore } from '../../composables/useBookingStore';

const emit = defineEmits<{ (e: 'next'): void }>()
const { state, applyB2BDiscount, clearDiscount } = useBookingStore()

// ── B2B login mock ────────────────────────────────────────────────────────────
// In production: call your auth endpoint, then look up discounts_flights
// and discounts_flights_customers tables for this customer's discount tier.
const showLoginPanel = ref(false)
const loginEmail = ref('')
const loginPassword = ref('')
const loginLoading = ref(false)
const loginError = ref('')

// Mock B2B discount tiers (from discounts_flights / discounts_flights_customers)
const B2B_MOCK: Record<string, { rate: number; code: string; name: string }> = {
  'agent@acme.com': { rate: 0.12, code: 'B2B-ACME-12', name: 'Acme Travel' },
  'ops@globetours.com': { rate: 0.08, code: 'B2B-GLOB-08', name: 'Globe Tours' },
}

async function handleLogin() {
  loginLoading.value = true
  loginError.value   = ''
  await new Promise(r => setTimeout(r, 900))

  const match = B2B_MOCK[loginEmail.value.toLowerCase()]
  if (match && loginPassword.value.length >= 6) {
    state.isLoggedIn = true
    applyB2BDiscount(match.rate, match.code)
    showLoginPanel.value = false
  } else {
    loginError.value = 'Invalid credentials or account not found.'
  }
  loginLoading.value = false
}

function handleLogout() {
  state.isLoggedIn = false
  clearDiscount()
  loginEmail.value = ''
  loginPassword.value = ''
}

// ── Form validation ───────────────────────────────────────────────────────────
const TITLES   = ['Mr', 'Mrs', 'Ms', 'Dr', 'Prof']
const NATIONALITIES = [
  'Nigerian','British','American','Ghanaian','Kenyan',
  'South African','Canadian','German','French','Emirati',
]

const errors = ref<Record<string, string>>({})

const validate = (): boolean => {
  errors.value = {}
  state.passengers.forEach((p, i) => {
    const prefix = `p${i}`
    if (!p.title) errors.value[`${prefix}_title`] = 'Required'
    if (!p.firstName.trim()) errors.value[`${prefix}_first`] = 'Required'
    if (!p.lastName.trim()) errors.value[`${prefix}_last`] = 'Required'
    if (!p.dateOfBirth) errors.value[`${prefix}_dob`] = 'Required'
    if (!p.nationality) errors.value[`${prefix}_nat`] = 'Required'
    if (!p.passportNumber.trim()) errors.value[`${prefix}_ppn`] = 'Required'
    if (!p.passportExpiry) errors.value[`${prefix}_ppx`] = 'Required'
    if (i === 0) {
      if (!p.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
        errors.value[`${prefix}_email`] = 'Valid email required'
      if (!p.phone.match(/^\+?[\d\s\-()]{8,}$/))
        errors.value[`${prefix}_phone`] = 'Valid phone required'
    }
  })
  // Copy primary contact to state
  state.contactEmail = state.passengers[0]?.email ?? ''
  state.contactPhone = state.passengers[0]?.phone ?? ''
  return Object.keys(errors.value).length === 0
}

function submit() {
  if (validate()) emit('next')
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

    <!-- ── B2B Login prompt ──────────────────────────────────────────────── -->
    <div class="bg-blue-50 border border-blue-200 rounded-2xl p-4">
      <div v-if="!state.isLoggedIn" class="flex items-start justify-between gap-4">
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

      <!-- Logged-in state -->
      <div v-else class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
            {{ loginEmail.slice(0,1).toUpperCase() || 'B' }}
          </div>
          <div>
            <p class="text-sm font-semibold text-primary">B2B Account Active</p>
            <p class="text-xs text-green-600 font-medium">{{ (state.discountRate * 100).toFixed(0) }}% discount applied · {{ state.discountCode }}</p>
          </div>
        </div>
        <button class="text-xs text-primary/25 underline cursor-pointer bg-transparent border-none" @click="handleLogout">Log out</button>
      </div>

      <!-- Login form -->
      <Transition enter-active-class="transition-all duration-200" enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0">
        <div v-if="showLoginPanel && !state.isLoggedIn" class="mt-4 pt-4 border-t border-blue-200 space-y-3">
          <div>
            <input v-model="loginEmail" type="email" placeholder="Work email" class="w-full px-3.5 py-2.5 text-sm rounded-xl border border-blue-200 bg-white focus:border-primary/50 outline-none" />
          </div>
          <div>
            <input v-model="loginPassword" type="password" placeholder="Password" class="w-full px-3.5 py-2.5 text-sm rounded-xl border border-blue-200 bg-white focus:border-primary/50 outline-none" />
          </div>
          <p v-if="loginError" class="text-xs text-red-600">{{ loginError }}</p>
          <button
            class="w-full py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/65 transition-colors border-none cursor-pointer disabled:opacity-60"
            :disabled="loginLoading"
            @click="handleLogin"
          >
            <span v-if="loginLoading">Verifying…</span>
            <span v-else>Log In & Apply Discount</span>
          </button>
          <p class="text-[10px] text-primary/focus:border-primary/50 text-center">
            Hint: try agent@acme.com / anypassword
          </p>
        </div>
      </Transition>
    </div>

    <!-- ── Passenger forms ───────────────────────────────────────────────── -->
    <div
      v-for="(passenger, i) in state.passengers"
      :key="i"
      class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
    >
      <div class="flex items-center justify-between px-5 py-3.5 bg-slate-50 border-b border-slate-100">
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">{{ i + 1 }}</div>
          <span class="text-sm font-semibold text-slate-800">
            {{ i === 0 ? 'Primary Passenger' : `Passenger ${i + 1}` }}
          </span>
        </div>
        <span class="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">Adult</span>
      </div>

      <div class="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">

        <!-- Title -->
        <div>
          <label for="" class="text-xs font-semibold text-slate-500 mb-1.5 block">Title <span class="text-red-400">*</span></label>
          <select v-model="passenger.title" :class="fieldClass(`p${i}_title`)">
            <option value="">Select title</option>
            <option v-for="t in TITLES" :key="t" :value="t">{{ t }}</option>
          </select>
          <p v-if="errors[`p${i}_title`]" class="text-xs text-red-500 mt-1">{{ errors[`p${i}_title`] }}</p>
        </div>

        <!-- Nationality -->
        <div>
          <label for="" class="text-xs font-semibold text-slate-500 mb-1.5 block">Nationality <span class="text-red-400">*</span></label>
          <select v-model="passenger.nationality" :class="fieldClass(`p${i}_nat`)">
            <option value="">Select nationality</option>
            <option v-for="n in NATIONALITIES" :key="n" :value="n">{{ n }}</option>
          </select>
          <p v-if="errors[`p${i}_nat`]" class="text-xs text-red-500 mt-1">{{ errors[`p${i}_nat`] }}</p>
        </div>

        <!-- First name -->
        <div>
          <label for="" class="text-xs font-semibold text-slate-500 mb-1.5 block">First Name <span class="text-red-400">*</span></label>
          <input v-model="passenger.firstName" type="text" placeholder="As on passport" :class="fieldClass(`p${i}_first`)" />
          <p v-if="errors[`p${i}_first`]" class="text-xs text-red-500 mt-1">{{ errors[`p${i}_first`] }}</p>
        </div>

        <!-- Last name -->
        <div>
          <label for="" class="text-xs font-semibold text-slate-500 mb-1.5 block">Last Name <span class="text-red-400">*</span></label>
          <input v-model="passenger.lastName" type="text" placeholder="As on passport" :class="fieldClass(`p${i}_last`)" />
          <p v-if="errors[`p${i}_last`]" class="text-xs text-red-500 mt-1">{{ errors[`p${i}_last`] }}</p>
        </div>

        <!-- Date of birth -->
        <div>
          <label for="" class="text-xs font-semibold text-slate-500 mb-1.5 block">Date of Birth <span class="text-red-400">*</span></label>
          <input v-model="passenger.dateOfBirth" type="date" :max="new Date().toISOString().split('T')[0]" :class="fieldClass(`p${i}_dob`)" />
          <p v-if="errors[`p${i}_dob`]" class="text-xs text-red-500 mt-1">{{ errors[`p${i}_dob`] }}</p>
        </div>

        <!-- Passport number -->
        <div>
          <label for="" class="text-xs font-semibold text-slate-500 mb-1.5 block">Passport Number <span class="text-red-400">*</span></label>
          <input v-model="passenger.passportNumber" type="text" placeholder="e.g. A12345678" :class="fieldClass(`p${i}_ppn`)" style="text-transform:uppercase" />
          <p v-if="errors[`p${i}_ppn`]" class="text-xs text-red-500 mt-1">{{ errors[`p${i}_ppn`] }}</p>
        </div>

        <!-- Passport expiry -->
        <div class="sm:col-span-2">
          <label for="" class="text-xs font-semibold text-slate-500 mb-1.5 block">Passport Expiry Date <span class="text-red-400">*</span></label>
          <input v-model="passenger.passportExpiry" type="date" :min="new Date().toISOString().split('T')[0]" :class="fieldClass(`p${i}_ppx`)" />
          <p v-if="errors[`p${i}_ppx`]" class="text-xs text-red-500 mt-1">{{ errors[`p${i}_ppx`] }}</p>
        </div>

        <!-- Contact info (primary passenger only) -->
        <template v-if="i === 0">
          <div class="sm:col-span-2 border-t border-slate-100 pt-4 mt-1">
            <p class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Contact Details</p>
          </div>

          <div>
            <label for="" class="text-xs font-semibold text-slate-500 mb-1.5 block">Email Address <span class="text-red-400">*</span></label>
            <input v-model="passenger.email" type="email" placeholder="ticket@example.com" :class="fieldClass(`p${i}_email`)" />
            <p class="text-[10px] text-slate-400 mt-1">Invoice & ticket will be sent here</p>
            <p v-if="errors[`p${i}_email`]" class="text-xs text-red-500 mt-1">{{ errors[`p${i}_email`] }}</p>
          </div>

          <div>
            <label for="" class="text-xs font-semibold text-slate-500 mb-1.5 block">Phone Number <span class="text-red-400">*</span></label>
            <input v-model="passenger.phone" type="tel" placeholder="+234 800 000 0000" :class="fieldClass(`p${i}_phone`)" />
            <p v-if="errors[`p${i}_phone`]" class="text-xs text-red-500 mt-1">{{ errors[`p${i}_phone`] }}</p>
          </div>
        </template>
      </div>
    </div>

    <!-- Continue button -->
    <button
      class="w-full h-14 bg-primary hover:opacity-90 text-white font-bold text-base rounded-2xl transition-all border-none cursor-pointer flex items-center justify-center gap-2 shadow-lg p-4"
      @click="submit"
    >
      Continue to Review
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
    </button>
  </div>
</template>
