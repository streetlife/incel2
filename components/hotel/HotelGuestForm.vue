<!-- Step 2: Guest details + optional login -->
<script setup lang="ts">
import { ref } from 'vue'
import { useHotelBookingStore } from '../../composables/useHotelBookingStore'

const emit = defineEmits<{ (e: 'next'): void; (e: 'back'): void }>()
const { state } = useHotelBookingStore()

const TITLES = ['Mr', 'Mrs', 'Ms', 'Dr', 'Prof']

// ── Optional login ────────────────────────────────────────────────────────────
const showLogin    = ref(false)
const loginEmail   = ref('')
const loginPass    = ref('')
const loginLoading = ref(false)
const loginError   = ref('')

async function handleLogin() {
  loginLoading.value = true; loginError.value = ''
  await new Promise(r => setTimeout(r, 800))
  // all your auth API here
  if (loginPass.value.length >= 6) {
    state.isLoggedIn  = true
    state.accountName = loginEmail.value
    // Pre-fill primary guest email
    if (state.guests[0]) state.guests[0].email = loginEmail.value
    showLogin.value = false
  } else {
    loginError.value = 'Invalid credentials.'
  }
  loginLoading.value = false
}

function handleLogout() {
  state.isLoggedIn  = false
  state.accountName = ''
  loginEmail.value  = ''
  loginPass.value   = ''
}

// ── Validation ────────────────────────────────────────────────────────────────
const errors = ref<Record<string, string>>({})

const fieldClass = (key: string) =>
  `w-full px-3.5 py-2.5 text-sm rounded-xl border transition-colors outline-none focus:ring-2 focus:ring-primary/20 ${
    errors.value[key] ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white focus:border-primary'
  }`

function validate(): boolean {
  errors.value = {}
  state.guests.forEach((g, i) => {
    const p = `g${i}`
    if (!g.title)          errors.value[`${p}_title`] = 'Required'
    if (!g.firstName.trim()) errors.value[`${p}_first`] = 'Required'
    if (!g.lastName.trim())  errors.value[`${p}_last`]  = 'Required'
    if (i === 0) {
      if (!g.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errors.value[`${p}_email`] = 'Valid email required'
      if (!g.phone.match(/^\+?[\d\s\-()]{8,}$/))        errors.value[`${p}_phone`] = 'Valid phone required'
    }
  })
  if (Object.keys(errors.value).length === 0) {
    state.contactEmail = state.guests[0]?.email ?? ''
    state.contactPhone = state.guests[0]?.phone ?? ''
  }
  return Object.keys(errors.value).length === 0
}

function submit() { if (validate()) emit('next') }
</script>

<template>
  <div class="space-y-6">

    <!-- ── Optional login ─────────────────────────────────────────────────── -->
    <div class="bg-blue-50 border border-blue-200 rounded-2xl p-4">
      <div v-if="!state.isLoggedIn" class="flex items-start justify-between gap-4">
        <div>
          <p class="text-sm font-semibold text-blue-900">Already have an account?</p>
          <p class="text-xs text-blue-600 mt-0.5">Log in to auto-fill your details and view past bookings.</p>
        </div>
        <button
          class="shrink-0 text-xs font-semibold px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors border-none cursor-pointer"
          @click="showLogin = !showLogin"
        >{{ showLogin ? 'Cancel' : 'Log In' }}</button>
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

    <!-- ── One guest form per room ────────────────────────────────────────── -->
    <div
      v-for="(guest, i) in state.guests"
      :key="i"
      class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
    >
      <div class="flex items-center gap-2 px-5 py-3.5 bg-slate-50 border-b border-slate-100">
        <div class="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">{{ i + 1 }}</div>
        <span class="text-sm font-semibold text-slate-800">
          {{ i === 0 ? 'Primary Guest' : `Room ${i + 1} – Lead Guest` }}
        </span>
      </div>

      <div class="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <!-- Title -->
        <div>
          <label for="" class="text-xs font-semibold text-slate-500 mb-1.5 block">Title <span class="text-red-400">*</span></label>
          <select v-model="guest.title" :class="fieldClass(`g${i}_title`)">
            <option value="">Select</option>
            <option v-for="t in TITLES" :key="t" :value="t">{{ t }}</option>
          </select>
          <p v-if="errors[`g${i}_title`]" class="text-xs text-red-500 mt-1">{{ errors[`g${i}_title`] }}</p>
        </div>
        <div></div><!-- spacer -->

        <!-- First name -->
        <div>
          <label for="" class="text-xs font-semibold text-slate-500 mb-1.5 block">First Name <span class="text-red-400">*</span></label>
          <input v-model="guest.firstName" type="text" placeholder="As on ID" :class="fieldClass(`g${i}_first`)" />
          <p v-if="errors[`g${i}_first`]" class="text-xs text-red-500 mt-1">{{ errors[`g${i}_first`] }}</p>
        </div>

        <!-- Last name -->
        <div>
          <label for="" class="text-xs font-semibold text-slate-500 mb-1.5 block">Last Name <span class="text-red-400">*</span></label>
          <input v-model="guest.lastName" type="text" placeholder="As on ID" :class="fieldClass(`g${i}_last`)" />
          <p v-if="errors[`g${i}_last`]" class="text-xs text-red-500 mt-1">{{ errors[`g${i}_last`] }}</p>
        </div>

        <!-- Contact (primary guest only) -->
        <template v-if="i === 0">
          <div class="sm:col-span-2 border-t border-slate-100 pt-4 mt-1">
            <p class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Contact Details</p>
          </div>
          <div>
            <label for="" class="text-xs font-semibold text-slate-500 mb-1.5 block">Email <span class="text-red-400">*</span></label>
            <input v-model="guest.email" type="email" placeholder="voucher@example.com" :class="fieldClass(`g${i}_email`)" />
            <p class="text-[10px] text-slate-400 mt-1">Invoice & voucher will be sent here</p>
            <p v-if="errors[`g${i}_email`]" class="text-xs text-red-500 mt-1">{{ errors[`g${i}_email`] }}</p>
          </div>
          <div>
            <label for="" class="text-xs font-semibold text-slate-500 mb-1.5 block">Phone <span class="text-red-400">*</span></label>
            <input v-model="guest.phone" type="tel" placeholder="+234 800 000 0000" :class="fieldClass(`g${i}_phone`)" />
            <p v-if="errors[`g${i}_phone`]" class="text-xs text-red-500 mt-1">{{ errors[`g${i}_phone`] }}</p>
          </div>
        </template>
      </div>
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
