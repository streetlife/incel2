<!-- Step 2: Lead participant details + optional login -->
<script setup lang="ts">
import { ref } from 'vue'
import { useTourBookingStore } from '../../composables/useTourBookingStore'

const emit = defineEmits<{ (e: 'next'): void; (e: 'back'): void }>()
const { state } = useTourBookingStore()

const TITLES = ['Mr', 'Mrs', 'Ms', 'Dr', 'Prof']

// ── Optional login ─────────────────────────────────────────────────────────────
const showLogin = ref(false)
const loginEmail = ref('')
const loginPass = ref('')
const loginLoading = ref(false)
const loginError = ref('')

async function handleLogin() {
  loginLoading.value = true; loginError.value = ''
  await new Promise(r => setTimeout(r, 800))
  if (loginPass.value.length >= 6) {
    state.isLoggedIn  = true
    state.accountName = loginEmail.value
    if (state.participants[0]) state.participants[0].email = loginEmail.value
    showLogin.value   = false
  } else {
    loginError.value = 'Invalid credentials.'
  }
  loginLoading.value = false
}

function handleLogout() {
  state.isLoggedIn = false; state.accountName = ''
  loginEmail.value = ''; loginPass.value = ''
}

// ── Validation ─────────────────────────────────────────────────────────────────
const errors = ref<Record<string, string>>({})

const fieldClass = (key: string) =>
  `w-full px-3.5 py-2.5 text-sm rounded-xl border transition-colors outline-none focus:ring-2 focus:ring-primary/20 ${
    errors.value[key] ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white focus:border-primary'
  }`

function validate(): boolean {
  errors.value = {}
  const p = state.participants[0]
  if (!p) return false
  if (!p.title) errors.value.title = 'Required'
  if (!p.firstName.trim()) errors.value.first = 'Required'
  if (!p.lastName.trim()) errors.value.last  = 'Required'
  if (!p.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errors.value.email = 'Valid email required'
  if (!p.phone.match(/^\+?[\d\s\-()]{8,}$/)) errors.value.phone = 'Valid phone required'

  if (Object.keys(errors.value).length === 0) {
    state.contactEmail = p.email
    state.contactPhone = p.phone
  }
  return Object.keys(errors.value).length === 0
}

function submit() { if (validate()) emit('next') }
</script>

<template>
  <div class="space-y-6">

    <!-- Participant count summary -->
    <div class="bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 flex flex-wrap gap-4">
      <div v-if="state.adults > 0" class="flex items-center gap-2">
        <div class="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0076ad" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </div>
        <span class="text-sm font-medium text-slate-700">{{ state.adults }} Adult{{ state.adults > 1 ? 's' : '' }}</span>
      </div>
      <div v-if="state.children > 0" class="flex items-center gap-2">
        <div class="w-7 h-7 rounded-full bg-amber-50 flex items-center justify-center">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </div>
        <span class="text-sm font-medium text-slate-700">{{ state.children }} Child{{ state.children > 1 ? 'ren' : '' }}</span>
      </div>
      <div v-if="state.infants > 0" class="flex items-center gap-2">
        <div class="w-7 h-7 rounded-full bg-green-50 flex items-center justify-center">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </div>
        <span class="text-sm font-medium text-slate-700">{{ state.infants }} Infant{{ state.infants > 1 ? 's' : '' }}</span>
      </div>
    </div>

    <!-- Optional login -->
    <div class="bg-blue-50 border border-blue-200 rounded-2xl p-4">
      <div v-if="!state.isLoggedIn" class="flex items-start justify-between gap-4">
        <div>
          <p class="text-sm font-semibold text-blue-900">Already have an account?</p>
          <p class="text-xs text-blue-600 mt-0.5">Log in to auto-fill your details.</p>
        </div>
        <button class="shrink-0 text-xs font-semibold px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 border-none cursor-pointer" @click="showLogin = !showLogin">
          {{ showLogin ? 'Cancel' : 'Log In' }}
        </button>
      </div>
      <div v-else class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center text-white text-xs font-bold">
            {{ state.accountName.slice(0,1).toUpperCase() }}
          </div>
          <p class="text-sm font-semibold text-blue-900">Logged in as {{ state.accountName }}</p>
        </div>
        <button class="text-xs text-blue-600 underline cursor-pointer bg-transparent border-none" @click="handleLogout">Log out</button>
      </div>
      <Transition enter-active-class="transition-all duration-200" enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0">
        <div v-if="showLogin && !state.isLoggedIn" class="mt-4 pt-4 border-t border-blue-200 space-y-3">
          <input v-model="loginEmail" type="email" placeholder="Email address" class="w-full px-3.5 py-2.5 text-sm rounded-xl border border-blue-200 bg-white outline-none focus:border-blue-500" />
          <input v-model="loginPass"  type="password" placeholder="Password"  class="w-full px-3.5 py-2.5 text-sm rounded-xl border border-blue-200 bg-white outline-none focus:border-blue-500" />
          <p v-if="loginError" class="text-xs text-red-600">{{ loginError }}</p>
          <button class="w-full py-2.5 bg-blue-700 text-white text-sm font-semibold rounded-xl hover:bg-blue-800 border-none cursor-pointer disabled:opacity-60" :disabled="loginLoading" @click="handleLogin">
            {{ loginLoading ? 'Logging in…' : 'Log In' }}
          </button>
        </div>
      </Transition>
    </div>

    <!-- Lead participant form -->
    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div class="flex items-center gap-2 px-5 py-3.5 bg-slate-50 border-b border-slate-100">
        <div class="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">1</div>
        <span class="text-sm font-semibold text-slate-800">Lead Participant</span>
        <span class="ml-auto text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">Booking confirmation sent here</span>
      </div>

      <div class="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <!-- Title -->
        <div>
          <label for="" class="text-xs font-semibold text-slate-500 mb-1.5 block">Title <span class="text-red-400">*</span></label>
          <select v-model="state.participants[0].title" :class="fieldClass('title')">
            <option value="">Select</option>
            <option v-for="t in TITLES" :key="t" :value="t">{{ t }}</option>
          </select>
          <p v-if="errors.title" class="text-xs text-red-500 mt-1">{{ errors.title }}</p>
        </div>
        <div></div>

        <!-- First name -->
        <div>
          <label for="" class="text-xs font-semibold text-slate-500 mb-1.5 block">First Name <span class="text-red-400">*</span></label>
          <input v-model="state.participants[0].firstName" type="text" placeholder="As on ID" :class="fieldClass('first')" />
          <p v-if="errors.first" class="text-xs text-red-500 mt-1">{{ errors.first }}</p>
        </div>

        <!-- Last name -->
        <div>
          <label for="" class="text-xs font-semibold text-slate-500 mb-1.5 block">Last Name <span class="text-red-400">*</span></label>
          <input v-model="state.participants[0].lastName" type="text" placeholder="As on ID" :class="fieldClass('last')" />
          <p v-if="errors.last" class="text-xs text-red-500 mt-1">{{ errors.last }}</p>
        </div>

        <!-- Contact -->
        <div class="sm:col-span-2 border-t border-slate-100 pt-4 mt-1">
          <p class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Contact Details</p>
        </div>

        <div>
          <label for="" class="text-xs font-semibold text-slate-500 mb-1.5 block">Email <span class="text-red-400">*</span></label>
          <input v-model="state.participants[0].email" type="email" placeholder="confirmation@example.com" :class="fieldClass('email')" />
          <p class="text-[10px] text-slate-400 mt-1">Invoice & voucher will be sent here</p>
          <p v-if="errors.email" class="text-xs text-red-500 mt-1">{{ errors.email }}</p>
        </div>

        <div>
          <label for="" class="text-xs font-semibold text-slate-500 mb-1.5 block">Phone <span class="text-red-400">*</span></label>
          <input v-model="state.participants[0].phone" type="tel" placeholder="+234 800 000 0000" :class="fieldClass('phone')" />
          <p v-if="errors.phone" class="text-xs text-red-500 mt-1">{{ errors.phone }}</p>
        </div>
      </div>
    </div>

    <!-- Note on other participants -->
    <div v-if="state.adults + state.children + state.infants > 1" class="flex items-start gap-3 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5">
      <svg class="shrink-0 mt-0.5" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
      <p class="text-xs text-slate-500">
        Only the lead participant's details are required here. Names of other participants in your group of
        <strong class="text-slate-700">{{ state.adults + state.children + state.infants }}</strong>
        will be recorded on-site by the guide on the day of the tour.
      </p>
    </div>

    <!-- Actions -->
    <div class="flex gap-3">
      <button class="flex-1 h-12 border-2 border-slate-200 text-slate-700 font-semibold rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer bg-white" @click="emit('back')">← Back</button>
      <button class="flex-[2] h-12 bg-primary hover:opacity-90 text-white font-bold rounded-2xl transition-all border-none cursor-pointer shadow-lg flex items-center justify-center gap-2" @click="submit">
        Continue to Review
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </button>
    </div>
  </div>
</template>
