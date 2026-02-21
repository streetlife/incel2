<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../../../stores/auth'

definePageMeta({
  guest: true,
  middleware: 'auth',
})

const { loading, forgotPassword } = useAuthStore()
const email = ref('')
const sent  = ref(false)
const error = ref('')

async function submit() {
  if (!email.value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) { error.value = 'Enter a valid email.'; return }
  error.value = ''
  const ok = await forgotPassword(email.value)
  if (ok) sent.value = true
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-4 pt-10">
    <div class="w-full max-w-md">

      <div class="bg-white rounded-2xl shadow-2xl p-8">
        <template v-if="!sent">
          <div class="text-center mb-6">
            <div class="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ca8a04" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <h2 class="text-xl font-bold text-slate-900">Forgot your password?</h2>
            <p class="text-sm text-slate-500 mt-1">Enter your email and we'll send a reset link.</p>
          </div>
          <div class="space-y-4">
            <div>
              <label for="email" class="text-xs font-semibold text-slate-600 mb-1.5 block">Email address</label>
              <input v-model="email" type="email" placeholder="you@example.com"
                class="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                @keyup.enter="submit" />
              <p v-if="error" class="text-xs text-red-500 mt-1">{{ error }}</p>
            </div>
            <button class="w-full h-12 bg-primary hover:opacity-90 text-slate-900 font-bold rounded-xl border-none cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
              :disabled="loading" @click="submit">
              <svg v-if="loading" class="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              {{ loading ? 'Sending…' : 'Send Reset Link' }}
            </button>
          </div>
        </template>

        <template v-else>
          <div class="text-center py-4">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5"><polyline points="20,6 9,17 4,12"/></svg>
            </div>
            <h2 class="text-xl font-bold text-slate-900 mb-2">Check your email</h2>
            <p class="text-sm text-slate-500 mb-1">We've sent a password reset link to</p>
            <p class="font-mono font-semibold text-slate-700 mb-6">{{ email }}</p>
            <p class="text-xs text-slate-400">Didn't receive it? Check your spam folder or <button class="text-primary hover:underline bg-transparent border-none cursor-pointer text-xs" @click="sent = false">try again</button>.</p>
          </div>
        </template>

        <p class="text-center text-sm text-slate-500 mt-6">
          <NuxtLink to="/auth/login" class="text-primary font-semibold hover:underline">← Back to sign in</NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

