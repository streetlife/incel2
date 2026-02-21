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

const email = ref('')
const password = ref('')
const showPass = ref(false)
const errors = ref<Record<string, string>>({})

const redirect = computed(() => (route.query.redirect as string) || '/dashboard')

function validate() {
  errors.value = {}
  if (!email.value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errors.value.email = 'Valid email required'
  if (password.value.length < 6) errors.value.password = 'Minimum 6 characters'
  return Object.keys(errors.value).length === 0
}

async function submit() {
  if (!validate()) return
  const ok = await auth.login(email.value, password.value)
  if (ok) router.push(redirect.value)
}

const fieldClass = (k: string) =>
  `w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20 ${
    errors.value[k] ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white focus:border-primary'}`
</script>

<template>
  <div class="min-h-screen  flex items-center justify-center px-4 pt-36 pb-12">
    <div class="absolute inset-0 bg-white opacity-5 pointer-events-none"></div>

    <div class="relative w-full max-w-md">

      <!-- Brand -->
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold text-gray-500">Welcome back</h1>
        <p class="text-slate-400 text-sm mt-1">Sign in to manage your bookings</p>
      </div>

      <!-- Card -->
      <div class="bg-white rounded-2xl shadow-2xl p-8">

        <!-- Server error -->
        <div v-if="auth.error" class="mb-5 flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <svg class="shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <p class="text-sm text-red-700">{{ auth.error }}</p>
        </div>

        <div class="space-y-4">
          <!-- Email -->
          <div>
            <label for="email" class="text-xs font-semibold text-slate-600 mb-1.5 block">Email address</label>
            <input v-model="email" type="email" placeholder="you@example.com"
              :class="fieldClass('email')" @keyup.enter="submit" />
            <p v-if="errors.email" class="text-xs text-red-500 mt-1">{{ errors.email }}</p>
          </div>

          <!-- Password -->
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
            :disabled="auth.loading" @click="submit">
            <svg v-if="auth.loading" class="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            {{ auth.loading ? 'Signing in…' : 'Sign In' }}
          </button>
        </div>

        <!-- Divider -->
        <div class="flex items-center gap-3 my-6">
          <div class="flex-1 h-px bg-slate-200"></div>
          <span class="text-xs text-slate-400 font-medium">OR</span>
          <div class="flex-1 h-px bg-slate-200"></div>
        </div>

        <!-- Google -->
        <!-- <button class="w-full h-11 border-2 border-slate-200 hover:bg-slate-50 rounded-xl font-semibold text-sm text-slate-700 flex items-center justify-center gap-3 cursor-pointer bg-white transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Continue with Google
        </button> -->

        <p class="text-center text-sm text-slate-500 mt-6">
          Don't have an account?
          <NuxtLink to="/auth/signup" class="text-primary font-semibold hover:underline ml-1">Create one</NuxtLink>
        </p>
      </div>

      <p class="text-center text-xs text-slate-400 mt-6">
        Travel agent?
        <NuxtLink to="/auth/signup?role=agent" class="text-slate-300 hover:text-white underline">Register your agency →</NuxtLink>
      </p>
    </div>
  </div>
</template>
