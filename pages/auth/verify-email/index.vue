<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../../stores/auth'
import { useAuthService } from '../../../services/auth.service'
import AppToast from '../../../components/toast/AppToast.vue'
import { normaliseError } from '../../../utils/api'
import { useToast } from '../../../composables/useToast'

definePageMeta({
  guest: true,
  middleware: 'auth',
})

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const authService = useAuthService()
const loading = ref(false)
const error = ref('')
const toast = useToast()

const email = ref((route.query.email as string) || '')
const code = ref(['', '', '', '', '', ''])
const inputs = ref<HTMLInputElement[]>([])
const resendCooldown = ref(0)
let cooldownTimer: ReturnType<typeof setInterval> | null = null

const codeString = computed(() => code.value.join(''))
const isComplete = computed(() => codeString.value.length === 6 && code.value.every(c => c !== ''))

function onInput(index: number, e: Event) {
  const val = (e.target as HTMLInputElement).value.replace(/\D/g, '')
  code.value[index] = val.slice(-1)
  if (val && index < 5) {
    inputs.value[index + 1]?.focus()
  }
}

function onKeydown(index: number, e: KeyboardEvent) {
  if (e.key === 'Backspace' && !code.value[index] && index > 0) {
    inputs.value[index - 1]?.focus()
  }
}

function onPaste(e: ClipboardEvent) {
  e.preventDefault()
  const pasted = e.clipboardData?.getData('text').replace(/\D/g, '').slice(0, 6) || ''
  pasted.split('').forEach((char, i) => {
    if (i < 6) code.value[i] = char
  })
  const nextEmpty = pasted.length < 6 ? pasted.length : 5
  inputs.value[nextEmpty]?.focus()
}

async function submit() {
  if (!isComplete.value) return

  loading.value = true

  try {
    const res = await auth.verifyEmail(email.value, codeString.value)

    if (res.success) {
        toast.success('Verified successfully!')
        router.push('/dashboard')
    }
  } catch (err) {
    error.value = normaliseError(err)
    loading.value = false
    toast.error(error.value)
  }
}

async function resend() {
  if (resendCooldown.value > 0) return

  try {
    await authService.resendVerificationEmail({ email_address: email.value })
    startCooldown()
  } catch (err: any) {
    auth.error = err?.message ?? 'Failed to resend. Please try again.'
  }
}

function startCooldown() {
  resendCooldown.value = 60
  cooldownTimer = setInterval(() => {
    resendCooldown.value--
    if (resendCooldown.value <= 0 && cooldownTimer) {
      clearInterval(cooldownTimer)
    }
  }, 1000)
}
</script>

<template>
  <AppToast />
  <div class="min-h-screen flex items-center justify-center px-4 pt-36 pb-12">
    <div class="absolute inset-0 bg-white opacity-5 pointer-events-none"></div>
    <div class="relative w-full max-w-md">

      <!-- Brand -->
      <div class="text-center mb-8">
        <!-- Email icon -->
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="text-primary">
            <rect x="2" y="4" width="20" height="16" rx="2"/>
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-gray-500">Check your inbox</h1>
        <p class="text-gray-500 text-sm mt-1">
          We sent a 6-digit code to<br/>
          <span class="font-semibold text-gray-600">{{ email || 'your email address' }}</span>
        </p>
      </div>

      <!-- Card -->
      <div class="bg-white rounded-2xl shadow-2xl p-8">

        <!-- Error banner -->
        <div v-if="auth.error" class="mb-5 flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <svg class="shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p class="text-sm text-red-700">{{ auth.error }}</p>
        </div>

        <div class="space-y-6">
          <div>
            <label for="" class="text-xs font-semibold text-slate-600 mb-3 block text-center">Enter verification code</label>
            <div class="flex gap-2 justify-center" @paste="onPaste">
              <input
                v-for="(_, i) in code"
                :key="i"
                :ref="el => { if (el) inputs[i] = el as HTMLInputElement }"
                v-model="code[i]"
                type="text"
                inputmode="numeric"
                maxlength="1"
                class="w-11 h-13 text-center text-xl font-bold rounded-xl border-2 outline-none transition-all focus:ring-2 focus:ring-primary/20 caret-primary"
                :class="[
                  code[i] ? 'border-primary bg-primary/5 text-slate-800' : 'border-slate-200 bg-white text-slate-800',
                  'focus:border-primary'
                ]"
                style="height: 52px;"
                @input="onInput(i, $event)"
                @keydown="onKeydown(i, $event)"
              />
            </div>
          </div>

          <button
            class="w-full h-12 bg-primary hover:opacity-90 active:scale-95 text-slate-900 font-bold rounded-xl border-none cursor-pointer transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
            :disabled="!isComplete || loading"
            @click="submit"
          >
            <svg v-if="loading" class="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
            {{ loading ? 'Verifying…' : 'Verify Email' }}
          </button>

          <p class="text-center text-sm text-slate-500">
            Didn't receive the code?
            <button
              class="ml-1 font-semibold bg-transparent border-none p-0 cursor-pointer transition-colors"
              :class="resendCooldown > 0 ? 'text-slate-400 cursor-not-allowed' : 'text-primary hover:underline'"
              :disabled="resendCooldown > 0"
              @click="resend"
            >
              {{ resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code' }}
            </button>
          </p>

        </div>

        <p class="text-center text-sm text-slate-500 mt-6">
          Wrong email?
          <router-link to="/auth/register" class="text-primary font-semibold hover:underline ml-1">Go back</router-link>
        </p>
      </div>
    </div>
  </div>
</template>
