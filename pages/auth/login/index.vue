<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../../stores/auth'
import { useToast } from '../../../composables/useToast'
import { normaliseError } from '../../../utils/api'
import AppToast from '../../../components/toast/AppToast.vue'

definePageMeta({
  guest: true,
  middleware: 'auth',
})

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const toast = useToast()

const email = ref('')
const password = ref('')
const showPass = ref(false)
const errors = ref<Record<string, string>>({})
const loading = ref(false)
const error = ref('')

const redirect = computed(() => (route.query.redirect as string) || '/dashboard')

function validate() {
  errors.value = {}
  if (!email.value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errors.value.email = 'Valid email required'
  if (password.value.length < 6) errors.value.password = 'Minimum 6 characters'
  return Object.keys(errors.value).length === 0
}

async function submit() {
  if (!validate()) return

  loading.value = true

  try {
    const res = await auth.login(email.value, password.value)
    if (res === null) return
    
    toast.success("Login successful")
    router.push(redirect.value)
  } catch (err) {
    loading.value = false
    error.value = normaliseError(err)

    toast.error(error.value)
  }
}

const fieldClass = (k: string) =>
  `w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20 ${
    errors.value[k] ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white focus:border-primary'}`
</script>

<template>
  <AppToast />
  <div class="min-h-screen  flex items-center justify-center px-4 pt-36 pb-12">
    <div class="absolute inset-0 bg-white opacity-5 pointer-events-none"></div>

    <div class="relative w-full max-w-md">
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold text-gray-500">Welcome back</h1>
        <p class="text-slate-400 text-sm mt-1">Sign in to manage your bookings</p>
      </div>

      <div class="bg-white rounded-2xl shadow-2xl p-8">
        <div class="space-y-4">
          <div>
            <label for="email" class="text-xs font-semibold text-slate-600 mb-1.5 block">Email address</label>
            <input v-model="email" type="email" placeholder="you@example.com"
              :class="fieldClass('email')" @keyup.enter="submit" />
            <p v-if="errors.email" class="text-xs text-red-500 mt-1">{{ errors.email }}</p>
          </div>

          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label for="password" class="text-xs font-semibold text-slate-600">Password</label>
              <router-link to="/auth/forgot-password" class="text-xs text-primary hover:underline font-medium">
                Forgot password?
              </router-link>
            </div>
            <div class="relative">
              <input v-model="password" :type="showPass ? 'text' : 'password'"
                placeholder="••••••••" :class="fieldClass('password')" @keyup.enter="submit" />
              <button type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer p-0"
                @click="showPass = !showPass">
                <svg v-if="showPass" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
            </div>
            <p v-if="errors.password" class="text-xs text-red-500 mt-1">{{ errors.password }}</p>
          </div>

          <!-- Submit -->
          <button
            class="w-full h-12 bg-primary hover:opacity-90 active:scale-95 text-slate-900 font-bold rounded-xl transition-all border-none cursor-pointer flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
            :disabled="loading" @click="submit">
            <svg v-if="loading" class="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            {{ loading ? 'Signing in…' : 'Sign In' }}
          </button>
        </div>

        <!-- Divider -->
        <div class="flex items-center gap-3 my-6">
          <div class="flex-1 h-px bg-slate-200"></div>
          <span class="text-xs text-slate-400 font-medium">OR</span>
          <div class="flex-1 h-px bg-slate-200"></div>
        </div>

        <p class="text-center text-sm text-slate-500 mt-6">
          Don't have an account?
          <NuxtLink to="/auth/signup" class="text-primary font-semibold hover:underline ml-1">Create one</NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>
