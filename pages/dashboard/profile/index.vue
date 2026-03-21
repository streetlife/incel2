<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useAuthStore } from '../../../stores/auth'
import { useToast } from '../../../composables/useToast'
import { normaliseError } from '../../../utils/api'
import AppToast from '../../../components/toast/AppToast.vue'

definePageMeta({
  layout: 'dashboard',
  requiresAuth: true,
  middleware: 'auth',
})

const auth = useAuthStore()

const activeTab = ref<'profile' | 'security'>('profile')
const toast = useToast()

const profile = reactive({
  full_names: auth.user?.full_names || '',
  email: auth.user?.email || '',
  phone: auth.user?.mobile_number || '',
})

const passwords = reactive({ current: '', newPass: '', confirm: '' })
const pwErrors = ref<Record<string, string>>({})
const showCurrentPw = ref(false)
const showNewPw = ref(false)

async function saveProfile() {
  try {
    await auth.updateProfile({
      full_names: profile.full_names,
      email_address: profile.email,
      mobile_number: profile.phone
    })

    toast.success('Updated successfully')
  } catch (e) {
    const err = normaliseError(e)
    toast.error(err)
  }
}

async function savePassword() {
  pwErrors.value = {}
  if (!passwords.current) pwErrors.value.current = 'Required'
  if (passwords.newPass.length < 8) pwErrors.value.newPass = 'Min. 8 characters'
  if (passwords.newPass !== passwords.confirm) pwErrors.value.confirm = 'Passwords do not match'
  if (Object.keys(pwErrors.value).length > 0) return


  try {
    await auth.changePassword({
      old_password: passwords.current,
      new_password: passwords.newPass,
      new_password_confirmation: passwords.confirm
    })

    passwords.current = passwords.newPass = passwords.confirm = ''

    toast.success('Password updated successfully')
  } catch (e) {
    const err = normaliseError(e)
    toast.error(err)
  }
}

const fieldCls = (k?: string) =>
  `w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20 ${
    k && pwErrors.value[k] ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white focus:border-primary'}`
</script>

<template>
  <AppToast />
  <div class="space-y-5">
    <h1 class="text-2xl font-bold text-slate-900">Profile & Settings</h1>
    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm px-6 py-5 flex items-center gap-5">
      <div class="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-2xl font-bold text-slate-900 shrink-0">
        {{ auth.initials }}
      </div>
      <div class="flex-1">
        <p class="font-bold text-slate-900">{{ auth.displayName }}</p>
        <p class="text-sm text-slate-500">{{ auth.user?.email }}</p>
        <span class="inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-full"
          :class="auth.user?.role === 'agent' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'">
          {{ auth.user?.role === 'agent' ? 'Travel Agent' : 'Customer' }}
        </span>
      </div>
      <button class="text-sm text-primary font-semibold hover:underline cursor-pointer bg-transparent border-none shrink-0">
        Change Photo
      </button>
    </div>

    <div class="flex gap-1 bg-slate-100 rounded-xl p-1">
      <button v-for="t in [
          { key: 'profile', label: 'Personal Info'},
          { key: 'security', label: 'Password'},
        ]" :key="t.key"
        class="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer border-none"
        :class="activeTab === t.key ? 'bg-white text-slate-900 shadow' : 'text-slate-500 hover:text-slate-700 bg-transparent'"
        @click="activeTab = t.key as any">
        {{ t.label }}
      </button>
    </div>

    <!-- ── Personal Info ──────────────────────────────────────────────────── -->
    <div v-if="activeTab === 'profile'" class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="sm:col-span-2">
          <label for="fullName" class="text-xs font-semibold text-slate-600 mb-1.5 block">Full Name</label>
          <input id="fullName" v-model="profile.full_names" type="text" :class="fieldCls()" />
        </div>
        <div>
          <label for="email" class="text-xs font-semibold text-slate-600 mb-1.5 block">Email</label>
          <input id="email" v-model="profile.email" type="email" :class="fieldCls()" />
        </div>
        <div>
          <label for="phone" class="text-xs font-semibold text-slate-600 mb-1.5 block">Phone Number</label>
          <input id="phone" v-model="profile.phone" type="tel" :class="fieldCls()" />
        </div>
      </div>

      <button
        class="px-6 py-3 bg-primary hover:opacity-90 text-slate-900 font-bold text-sm rounded-xl border-none cursor-pointer flex items-center gap-2 disabled:opacity-60"
        :disabled="auth.loading" @click="saveProfile">
        <svg v-if="auth.loading" class="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
        Save Changes
      </button>
    </div>

    <div v-if="activeTab === 'security'" class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
      <div>
        <label for="current" class="text-xs font-semibold text-slate-600 mb-1.5 block">Current Password</label>
        <div class="relative">
          <input id="current" v-model="passwords.current" :type="showCurrentPw ? 'text' : 'password'"
            placeholder="••••••••" :class="fieldCls('current')" />
          <button type="button"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer p-0"
            @click="showCurrentPw = !showCurrentPw">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
        </div>
        <p v-if="pwErrors.current" class="text-xs text-red-500 mt-1">{{ pwErrors.current }}</p>
      </div>

      <div>
        <label for="newPass" class="text-xs font-semibold text-slate-600 mb-1.5 block">New Password</label>
        <div class="relative">
          <input id="newPass" v-model="passwords.newPass" :type="showNewPw ? 'text' : 'password'"
            placeholder="Min. 8 characters" :class="fieldCls('newPass')" />
          <button type="button"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer p-0"
            @click="showNewPw = !showNewPw">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
        </div>
        <p v-if="pwErrors.newPass" class="text-xs text-red-500 mt-1">{{ pwErrors.newPass }}</p>
      </div>

      <div>
        <label for="confirm" class="text-xs font-semibold text-slate-600 mb-1.5 block">Confirm New Password</label>
        <input id="confirm" v-model="passwords.confirm" type="password" placeholder="Re-enter new password"
          :class="fieldCls('confirm')" />
        <p v-if="pwErrors.confirm" class="text-xs text-red-500 mt-1">{{ pwErrors.confirm }}</p>
      </div>

      <button
        class="px-6 py-3 bg-primary hover:opacity-90 text-slate-900 font-bold text-sm rounded-xl border-none cursor-pointer flex items-center gap-2 disabled:opacity-60"
        :disabled="auth.loading" @click="savePassword">
        <svg v-if="auth.loading" class="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
        Update Password
      </button>
    </div>
  </div>
</template>
