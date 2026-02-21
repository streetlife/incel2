<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../../stores/auth'

definePageMeta({
  guest: true,
  middleware: 'auth',
})

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const step = ref(1)
const showPass = ref(false)
const role = ref((route.query.role as string) || 'user')

const form = ref({
  firstName: '', lastName: '', email: '',
  phone: '', agencyName: '', password: '', confirmPassword: '',
})
const errors = ref<Record<string, string>>({})

const isAgent = computed(() => role.value === 'agent')

const fieldClass = (k: string) =>
  `w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20 ${
    errors.value[k] ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white focus:border-primary'}`

function validateStep1() {
  errors.value = {}
  if (!form.value.firstName.trim()) errors.value.firstName = 'Required'
  if (!form.value.lastName.trim())  errors.value.lastName  = 'Required'
  if (!form.value.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errors.value.email = 'Valid email required'
  if (!form.value.phone.match(/^\+?[\d\s\-()]{8,}$/)) errors.value.phone = 'Valid phone required'
  if (isAgent.value && !form.value.agencyName.trim()) errors.value.agencyName = 'Required'
  return Object.keys(errors.value).length === 0
}

function validateStep2() {
  errors.value = {}
  if (form.value.password.length < 8) errors.value.password = 'Minimum 8 characters'
  else if (!/[A-Z]/.test(form.value.password)) errors.value.password = 'Must include an uppercase letter'
  else if (!/\d/.test(form.value.password)) errors.value.password = 'Must include a number'
  if (form.value.confirmPassword !== form.value.password) errors.value.confirmPassword = 'Passwords do not match'
  return Object.keys(errors.value).length === 0
}

function nextStep() { if (validateStep1()) step.value = 2 }

async function submit() {
  if (!validateStep2()) return
  const ok = await auth.register({
    ...form.value,
    role:       role.value,
    agencyName: isAgent.value ? form.value.agencyName : undefined,
  })
  if (ok) router.push('/dashboard')
}

const pwStrength = computed(() => {
  const p = form.value.password
  if (!p) return 0
  let s = 0
  if (p.length >= 8) s++
  if (/[A-Z]/.test(p)) s++
  if (/\d/.test(p)) s++
  if (/[^A-Za-z0-9]/.test(p)) s++
  return s
})
const pwLabel = computed(() => ['', 'Weak', 'Fair', 'Good', 'Strong'][pwStrength.value])
const pwColor = computed(() => ['', 'bg-red-400', 'bg-amber-400', 'bg-blue-500', 'bg-green-500'][pwStrength.value])
</script>

<template>
  <div class="min-h-screen to-slate-900 flex items-center justify-center px-4 pt-36 pb-12">
    <div class="absolute inset-0 bg-white opacity-5 pointer-events-none"></div>
    <div class="relative w-full max-w-md">

      <!-- Brand -->
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold text-gray-500">{{ isAgent ? 'Register your agency' : 'Create your account' }}</h1>
        <p class="text-gray-500 text-sm mt-1">{{ isAgent ? 'Access B2B rates and agent tools' : 'Book flights, hotels, tours and more' }}</p>
      </div>

      <!-- Role toggle -->
      <div class="flex bg-white/10 rounded-xl p-1 mb-4">
        <button v-for="r in [{ key:'user', label:'Individual' }, { key:'agent', label:'Travel Agent' }]" :key="r.key"
          class="flex-1 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer border-none"
          :class="role === r.key ? 'bg-white text-gray-500 shadow' : 'text-gray-500 hover:text-gray-500 bg-transparent'"
          @click="role = r.key">
          {{ r.label }}
        </button>
      </div>

      <!-- Step indicator -->
      <div class="flex items-center gap-2 mb-5">
        <div v-for="s in [1, 2]" :key="s" class="flex items-center gap-2" :class="s < 2 ? 'flex-1' : ''">
          <div class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all shrink-0"
            :class="step >= s ? 'bg-primary border-primary text-slate-900' : 'bg-transparent border-slate-500 text-slate-400'">
            <svg v-if="step > s" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20,6 9,17 4,12"/></svg>
            <span v-else>{{ s }}</span>
          </div>
          <div v-if="s < 2" class="flex-1 h-0.5 transition-colors" :class="step > s ? 'bg-primary' : 'bg-slate-600'"></div>
        </div>
        <span class="text-xs text-slate-400 shrink-0 ml-2">{{ step === 1 ? 'Your Details' : 'Set Password' }}</span>
      </div>

      <!-- Card -->
      <div class="bg-white rounded-2xl shadow-2xl p-8">

        <div v-if="auth.error" class="mb-5 flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <svg class="shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <p class="text-sm text-red-700">{{ auth.error }}</p>
        </div>

        <Transition name="slide" mode="out-in">

          <!-- Step 1 -->
          <div v-if="step === 1" class="space-y-4">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label for="firstName" class="text-xs font-semibold text-slate-600 mb-1.5 block">First Name <span class="text-red-400">*</span></label>
                <input v-model="form.firstName" type="text" placeholder="Adaeze" :class="fieldClass('firstName')" />
                <p v-if="errors.firstName" class="text-xs text-red-500 mt-1">{{ errors.firstName }}</p>
              </div>
              <div>
                <label for="lastName" class="text-xs font-semibold text-slate-600 mb-1.5 block">Last Name <span class="text-red-400">*</span></label>
                <input v-model="form.lastName" type="text" placeholder="Okafor" :class="fieldClass('lastName')" />
                <p v-if="errors.lastName" class="text-xs text-red-500 mt-1">{{ errors.lastName }}</p>
              </div>
            </div>

            <div v-if="isAgent">
              <label for="agencyName" class="text-xs font-semibold text-slate-600 mb-1.5 block">Agency Name <span class="text-red-400">*</span></label>
              <input v-model="form.agencyName" type="text" placeholder="Acme Travel Agency" :class="fieldClass('agencyName')" />
              <p v-if="errors.agencyName" class="text-xs text-red-500 mt-1">{{ errors.agencyName }}</p>
            </div>

            <div>
              <label for="email" class="text-xs font-semibold text-slate-600 mb-1.5 block">Email address <span class="text-red-400">*</span></label>
              <input v-model="form.email" type="email" placeholder="you@example.com" :class="fieldClass('email')" />
              <p v-if="errors.email" class="text-xs text-red-500 mt-1">{{ errors.email }}</p>
            </div>

            <div>
              <label for="phone" class="text-xs font-semibold text-slate-600 mb-1.5 block">Phone Number <span class="text-red-400">*</span></label>
              <input v-model="form.phone" type="tel" placeholder="+234 802 000 0000" :class="fieldClass('phone')" />
              <p v-if="errors.phone" class="text-xs text-red-500 mt-1">{{ errors.phone }}</p>
            </div>

            <button class="w-full h-12 bg-primary hover:opacity-90 active:scale-95 text-slate-900 font-bold rounded-xl border-none cursor-pointer mt-2 transition-all" @click="nextStep">
              Continue →
            </button>
          </div>

          <!-- Step 2 -->
          <div v-else class="space-y-4">
            <div>
              <label for="password" class="text-xs font-semibold text-slate-600 mb-1.5 block">Password <span class="text-red-400">*</span></label>
              <div class="relative">
                <input v-model="form.password" :type="showPass ? 'text' : 'password'"
                  placeholder="Min. 8 characters" :class="fieldClass('password')" />
                <button type="button"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer p-0"
                  @click="showPass = !showPass">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
              </div>
              <!-- Strength meter -->
              <div v-if="form.password" class="mt-2">
                <div class="flex gap-1 mb-1">
                  <div v-for="i in 4" :key="i" class="flex-1 h-1 rounded-full transition-all"
                    :class="i <= pwStrength ? pwColor : 'bg-slate-200'"></div>
                </div>
                <p class="text-xs" :class="pwStrength <= 1 ? 'text-red-500' : pwStrength === 2 ? 'text-amber-500' : 'text-green-600'">{{ pwLabel }}</p>
              </div>
              <p v-if="errors.password" class="text-xs text-red-500 mt-1">{{ errors.password }}</p>
            </div>

            <div>
              <label for="confirmPassword" class="text-xs font-semibold text-slate-600 mb-1.5 block">Confirm Password <span class="text-red-400">*</span></label>
              <input v-model="form.confirmPassword" type="password" placeholder="Re-enter password"
                :class="fieldClass('confirmPassword')" @keyup.enter="submit" />
              <p v-if="errors.confirmPassword" class="text-xs text-red-500 mt-1">{{ errors.confirmPassword }}</p>
            </div>

            <p class="text-xs text-slate-400 leading-relaxed">
              By creating an account you agree to our
              <a href="#" class="text-primary hover:underline">Terms of Service</a> and
              <a href="#" class="text-primary hover:underline">Privacy Policy</a>.
            </p>

            <div class="flex gap-3">
              <button class="flex-1 h-12 border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 cursor-pointer bg-white" @click="step = 1">← Back</button>
              <button
                class="flex-[2] h-12 bg-primary hover:opacity-90 active:scale-95 text-slate-900 font-bold rounded-xl transition-all border-none cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                :disabled="auth.loading" @click="submit">
                <svg v-if="auth.loading" class="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                {{ auth.loading ? 'Creating account…' : 'Create Account' }}
              </button>
            </div>
          </div>
        </Transition>

        <p class="text-center text-sm text-slate-500 mt-6">
          Already have an account?
          <router-link to="/auth/login" class="text-primary font-semibold hover:underline ml-1">Sign in</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.slide-enter-active, .slide-leave-active { transition: all .2s ease; }
.slide-enter-from { opacity: 0; transform: translateX(20px);  }
.slide-leave-to   { opacity: 0; transform: translateX(-20px); }
</style>
