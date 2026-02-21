<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useAuthStore } from '../../../stores/auth'

definePageMeta({
  layout: 'dashboard',
  requiresAuth: true,
  middleware: 'auth',
})

const auth = useAuthStore()

const activeTab = ref<'profile' | 'security' | 'preferences'>('profile')

// Initialise form from Pinia state — auth.user is a plain object, no .value needed
const profile = reactive({
  firstName: auth.user?.firstName || '',
  lastName: auth.user?.lastName || '',
  email: auth.user?.email || '',
  phone: auth.user?.phone || '',
  agencyName: auth.user?.agencyName || '',
})

const passwords = reactive({ current: '', newPass: '', confirm: '' })
const profileSaved = ref(false)
const passwordSaved = ref(false)
const pwErrors = ref<Record<string, string>>({})
const showCurrentPw = ref(false)
const showNewPw = ref(false)

async function saveProfile() {
  await auth.updateProfile({ ...profile })
  profileSaved.value = true
  setTimeout(() => profileSaved.value = false, 3000)
}

async function savePassword() {
  pwErrors.value = {}
  if (!passwords.current) pwErrors.value.current = 'Required'
  if (passwords.newPass.length < 8) pwErrors.value.newPass = 'Min. 8 characters'
  if (passwords.newPass !== passwords.confirm) pwErrors.value.confirm = 'Passwords do not match'
  if (Object.keys(pwErrors.value).length > 0) return
  await auth.changePassword(passwords.current, passwords.newPass)
  passwordSaved.value = true
  passwords.current = passwords.newPass = passwords.confirm = ''
  setTimeout(() => passwordSaved.value = false, 3000)
}

const fieldCls = (k?: string) =>
  `w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20 ${
    k && pwErrors.value[k] ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white focus:border-primary'}`
</script>

<template>
  <div class="space-y-5">
    <h1 class="text-2xl font-bold text-slate-900">Profile & Settings</h1>

    <!-- Avatar strip -->
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

    <!-- Tabs -->
    <div class="flex gap-1 bg-slate-100 rounded-xl p-1">
      <button v-for="t in [
          { key: 'profile', label: 'Personal Info'},
          { key: 'security', label: 'Password'},
          { key: 'preferences', label: 'Preferences'},
        ]" :key="t.key"
        class="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer border-none"
        :class="activeTab === t.key ? 'bg-white text-slate-900 shadow' : 'text-slate-500 hover:text-slate-700 bg-transparent'"
        @click="activeTab = t.key as any">
        {{ t.label }}
      </button>
    </div>

    <!-- ── Personal Info ──────────────────────────────────────────────────── -->
    <div v-if="activeTab === 'profile'" class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
      <div v-if="profileSaved" class="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5"><polyline points="20,6 9,17 4,12"/></svg>
        <p class="text-sm text-green-700 font-medium">Profile saved successfully.</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label for="firstName" class="text-xs font-semibold text-slate-600 mb-1.5 block">First Name</label>
          <input id="firstName" v-model="profile.firstName" type="text" :class="fieldCls()" />
        </div>
        <div>
          <label for="lastName" class="text-xs font-semibold text-slate-600 mb-1.5 block">Last Name</label>
          <input id="lastName" v-model="profile.lastName" type="text" :class="fieldCls()" />
        </div>
        <div class="sm:col-span-2">
          <label for="email" class="text-xs font-semibold text-slate-600 mb-1.5 block">Email</label>
          <input id="email" v-model="profile.email" type="email" :class="fieldCls()" />
        </div>
        <div class="sm:col-span-2">
          <label for="phone" class="text-xs font-semibold text-slate-600 mb-1.5 block">Phone Number</label>
          <input id="phone" v-model="profile.phone" type="tel" :class="fieldCls()" />
        </div>
        <div v-if="auth.user?.role === 'agent'" class="sm:col-span-2">
          <label for="agencyName" class="text-xs font-semibold text-slate-600 mb-1.5 block">Agency Name</label>
          <input id="agencyName" v-model="profile.agencyName" type="text" :class="fieldCls()" />
        </div>
      </div>

      <button
        class="px-6 py-3 bg-primary hover:opacity-90 text-slate-900 font-bold text-sm rounded-xl border-none cursor-pointer flex items-center gap-2 disabled:opacity-60"
        :disabled="auth.loading" @click="saveProfile">
        <svg v-if="auth.loading" class="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
        Save Changes
      </button>
    </div>

    <!-- ── Password ───────────────────────────────────────────────────────── -->
    <div v-if="activeTab === 'security'" class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
      <div v-if="passwordSaved" class="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5"><polyline points="20,6 9,17 4,12"/></svg>
        <p class="text-sm text-green-700 font-medium">Password updated successfully.</p>
      </div>

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

    <!-- ── Preferences ────────────────────────────────────────────────────── -->
    <div v-if="activeTab === 'preferences'" class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
      <div>
        <p class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Email Notifications</p>
        <div class="space-y-0">
          <div v-for="pref in [
              { label: 'Booking confirmations', sub: 'Invoice & voucher on every booking', checked: true},
              { label: 'Booking status updates', sub: 'When a booking is confirmed or cancelled', checked: true},
              { label: 'Promotional offers', sub: 'Deals and discounts relevant to you', checked: false},
              { label: 'Price drop alerts', sub: 'When prices drop for saved routes', checked: false},
            ]" :key="pref.label"
            class="flex items-start justify-between gap-4 py-3.5 border-b border-slate-100 last:border-0">
            <div>
              <p class="text-sm font-medium text-slate-800">{{ pref.label }}</p>
              <p class="text-xs text-slate-500 mt-0.5">{{ pref.sub }}</p>
            </div>
            <label :for="pref.label" class="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
              <input :id="pref.label" type="checkbox" :checked="pref.checked" class="sr-only peer" />
              <div class="w-10 h-6 bg-slate-200 rounded-full peer peer-checked:bg-primary transition-colors"></div>
              <div class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4"></div>
            </label>
          </div>
        </div>
      </div>

      <div>
        <p class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Display Currency</p>
        <select class="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white">
          <option>Nigerian Naira (₦ NGN)</option>
          <option>US Dollar ($ USD)</option>
          <option>British Pound (£ GBP)</option>
          <option>Euro (€ EUR)</option>
        </select>
      </div>

      <button class="px-6 py-3 bg-primary hover:opacity-90 text-slate-900 font-bold text-sm rounded-xl border-none cursor-pointer">
        Save Preferences
      </button>
    </div>
  </div>
</template>
