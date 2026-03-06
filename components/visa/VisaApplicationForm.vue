<script setup lang="ts">
import { ref, computed } from 'vue'
import { useVisaStore } from '../../stores/visa'
import AppToast from '../toast/AppToast.vue';
import { useRoute } from 'vue-router';
import { useToast } from '../../composables/useToast';

type Section = 'personal' | 'passport' | 'visa_requirement' | 'documents'

const emit = defineEmits<{ next: [] }>()
const store = useVisaStore()
const route = useRoute()
const toast = useToast()

const activePersonIdx  = ref(0)
const activeSection = ref<Section>('personal')
const errors = ref<Record<string, string>>({})

function selectPerson(idx: number) {
  activePersonIdx.value = idx
  activeSection.value = 'personal'
  errors.value = {}
}

const ap = computed(() => store.applicants[activePersonIdx.value]!)
const docs = computed(() => store.getDocuments(activePersonIdx.value))

const sections = [
  { key: 'personal', label: 'Personal Info', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  { key: 'passport', label: 'Passport', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { key: 'visa_requirement', label: 'Visa Requirements', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { key: 'documents', label: 'Supporting Documents', icon: 'M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13' },
]

const sectionComplete = computed(() => {
  const a = ap.value
  return {
    personal: !!(a.firstName && a.lastName && a.email && a.phone && a.dateOfBirth),
    passport: !!(a.passportNumber && a.passportExpiry && a.issuingCountry),
    visa_requirement: !!(a.groupMembership && a.processingMode),
    documents: store.requiredDocsUploaded(activePersonIdx.value),
  }
})

const allPersonsReady = computed(() => {
  for (let i = 0; i < store.personCount; i++) {
    if (!store.requiredDocsUploaded(i)) return false
  }
  return true
})

const isLastPerson = computed(() => activePersonIdx.value === store.personCount - 1)

const currentPersonReady = computed(() => store.requiredDocsUploaded(activePersonIdx.value))

const submitButtonLabel = computed(() => {
  if (store.visaLoading) return 'Saving…'
  if (store.personCount === 1 || isLastPerson.value) return 'Review Application →'
  return `Save & Next Person →`
})

function personLabel(i: number) {
  const a = store.applicants[i]
  const name = [a.firstName, a.lastName].filter(Boolean).join(' ')
  return name || `Person ${i + 1}`
}

const fc = (k: string) =>
  `w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20 bg-white ${
    errors.value[k] ? 'border-red-300 bg-red-50' : 'border-slate-200 focus:border-primary'}`

function err(k: string) { return errors.value[k] }

function validatePersonal() {
  const a = ap.value; errors.value = {}
  if (!a.firstName) errors.value.firstName = 'Required'
  if (!a.lastName) errors.value.lastName = 'Required'
  if (!a.dateOfBirth) errors.value.dateOfBirth  = 'Required'
  if (!a.gender) errors.value.gender = 'Required'
  if (!a.nationality) errors.value.nationality  = 'Required'
  if (!a.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a.email)) {
    errors.value.email = 'Valid email required'
  }
  if (!a.phone || !/^\+?[\d\s\-()]{8,}$/.test(a.phone)) {
    errors.value.phone = 'Valid phone required'
  }
  return Object.keys(errors.value).length === 0
}

function validatePassport() {
  const a = ap.value; errors.value = {}
  if (!a.passportNumber) errors.value.passportNumber = 'Required'
  if (!a.passportName) errors.value.passportName = 'Required'
  if (!a.passportIssueDate) errors.value.passportIssueDate = 'Required'
  if (!a.passportExpiry) errors.value.passportExpiry = 'Required'
  if (!a.issuingCountry) errors.value.issuingCountry = 'Required'
  if (!a.passportType) errors.value.passportType = 'Required'
  if (a.passportExpiry) {
    const expiry = new Date(a.passportExpiry)
    const sixMonths = new Date(); sixMonths.setMonth(sixMonths.getMonth() + 6)
    if (expiry < sixMonths) errors.value.passportExpiry = 'Passport must be valid for at least 6 more months'
  }
  return Object.keys(errors.value).length === 0
}

function validateTravel() {
  const a = ap.value; errors.value = {}
  if (!a.groupMembership) errors.value.groupMembership = 'Required'
  if (!a.processingMode) errors.value.processingMode = 'Required'
  return Object.keys(errors.value).length === 0
}

function nextSection() {
  const order = ['personal', 'passport', 'visa_requirement', 'documents'] as const
  const idx = order.indexOf(activeSection.value)
  let valid = true
  if (activeSection.value === 'personal') valid = validatePersonal()
  if (activeSection.value === 'passport') valid = validatePassport()
  if (activeSection.value === 'visa_requirement')   valid = validateTravel()
  if (!valid) return
  if (idx < order.length - 1) activeSection.value = order[idx + 1]
}

function handleFileChange(key: string, e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return

  if (file.size > 5 * 1024 * 1024) {
    errors.value._docs = 'File size must be under 5MB'
    return
  }

  const size = file.size > 1024 * 1024
    ? (file.size / (1024 * 1024)).toFixed(1) + ' MB'
    : (file.size / 1024).toFixed(0) + ' KB'
  store.markDocumentUploaded(activePersonIdx.value, key, file.name, size, file)
}

function getQueryString(v: unknown): string | null {
  if (!v) return null
  return Array.isArray(v) ? v[0] : String(v)
}

async function submitForm() {
  errors.value = {}

  if (!currentPersonReady.value) {
    errors.value._docs = 'Please upload all required documents for this traveller before continuing.'
    return
  }

  const bookingCode = store.bookingCode ?? getQueryString(route.query.booking_code)

  if (!bookingCode) {
    errors.value._docs = 'Booking code is missing. Please restart the visa search.'
    return
  }

  if (store.personCount > 1 && !isLastPerson.value) {
    const ok = await store.createAllVisas(bookingCode, activePersonIdx.value)
    if (ok) selectPerson(activePersonIdx.value + 1)
    return
  }

  if (!allPersonsReady.value) {
    errors.value._docs = 'Please complete all required documents for every traveller before continuing.'
    return
  }

  const ok = await store.createAllVisas(bookingCode)
  if (ok) emit('next')
}
</script>

<template>
  <AppToast />
  <div class="space-y-5">
    <div v-if="store.personCount > 1" class="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
      <p class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
        Travellers — {{ store.personCount }} person{{ store.personCount > 1 ? 's' : '' }}
      </p>

      <div class="flex flex-wrap gap-2">
        <button
          v-for="(_, i) in store.applicants"
          :key="i"
          class="relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all cursor-pointer"
          :class="activePersonIdx === i
            ? 'bg-slate-900 border-slate-900 text-white shadow'
            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'"
          @click="selectPerson(i)">

          <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
            :class="activePersonIdx === i ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'">
            <template v-if="store.requiredDocsUploaded(i) &&
              store.applicants[i]?.firstName &&
              store.applicants[i]?.passportNumber &&
              store.applicants[i]?.processingMode">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                :stroke="activePersonIdx === i ? 'white' : '#16a34a'" stroke-width="3">
                <polyline points="20,6 9,17 4,12"/>
              </svg>
            </template>
            <template v-else>{{ i + 1 }}</template>
          </span>

          <span class="max-w-[120px] truncate">{{ personLabel(i) }}</span>
          <span v-if="!store.requiredDocsUploaded(i) && activePersonIdx !== i"
            class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full border-2 border-white"></span>
        </button>
      </div>

      <div class="mt-4 grid gap-2">
        <div v-for="(_, i) in store.applicants" :key="'bar-' + i" class="flex items-center gap-3">
          <span class="text-xs text-slate-500 w-20 truncate shrink-0">{{ personLabel(i) }}</span>
          <div class="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div class="h-full bg-primary rounded-full transition-all duration-500"
              :style="{
                width: `${(store.getDocuments(i).filter(d => d.uploaded).length / (store.getDocuments(i).length || 1)) * 100}%`
              }">
            </div>
          </div>
          <span class="text-xs text-slate-400 shrink-0">
            {{ store.getDocuments(i).filter(d => d.uploaded).length }}/{{ store.getDocuments(i).length }}
          </span>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-1.5 flex gap-1">
      <button v-for="s in sections" :key="s.key"
        class="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border-none relative"
        :class="activeSection === s.key
          ? 'bg-slate-900 text-white shadow'
          : 'text-slate-500 hover:text-slate-800 bg-transparent'"
        @click="activeSection = s.key as Section">
        <div v-if="sectionComplete[s.key as keyof typeof sectionComplete] && activeSection !== s.key"
          class="absolute top-1.5 right-1.5 w-2 h-2 bg-green-500 rounded-full"></div>
        <svg class="shrink-0 hidden sm:block" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path :d="s.icon" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span class="hidden sm:inline">{{ s.label }}</span>
        <span class="sm:hidden">{{ s.label.split(' ')[0] }}</span>
      </button>
    </div>

    <div v-if="activeSection === 'personal'" class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <div class="flex items-center justify-between mb-5">
        <h2 class="text-base font-bold text-slate-900">Personal Information</h2>
        <span v-if="store.personCount > 1"
          class="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-500">
          Person {{ activePersonIdx + 1 }} of {{ store.personCount }}
        </span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label for="" class="text-xs font-semibold text-slate-600 mb-1.5 block">First Name <span class="text-red-400">*</span></label>
          <input v-model="ap.firstName" type="text" placeholder="As on passport" :class="fc('firstName')" />
          <p v-if="err('firstName')" class="text-xs text-red-500 mt-1">{{ err('firstName') }}</p>
        </div>

        <div>
          <label for="" class="text-xs font-semibold text-slate-600 mb-1.5 block">Last Name <span class="text-red-400">*</span></label>
          <input v-model="ap.lastName" type="text" placeholder="As on passport" :class="fc('lastName')" />
          <p v-if="err('lastName')" class="text-xs text-red-500 mt-1">{{ err('lastName') }}</p>
        </div>

        <div>
          <label for="" class="text-xs font-semibold text-slate-600 mb-1.5 block">Other Names <span class="text-red-400">*</span></label>
          <input v-model="ap.otherNames" type="text" placeholder="As on passport" :class="fc('otherNames')" />
          <p v-if="err('otherNames')" class="text-xs text-red-500 mt-1">{{ err('otherNames') }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
        <div>
          <label for="" class="text-xs font-semibold text-slate-600 mb-1.5 block">Date of Birth <span class="text-red-400">*</span></label>
          <input v-model="ap.dateOfBirth" type="date" :class="fc('dateOfBirth')" />
          <p v-if="err('dateOfBirth')" class="text-xs text-red-500 mt-1">{{ err('dateOfBirth') }}</p>
        </div>

        <div>
          <label for="" class="text-xs font-semibold text-slate-600 mb-1.5 block">Gender <span class="text-red-400">*</span></label>
          <select v-model="ap.gender" :class="fc('gender')">
            <option value="">Select</option>
            <option :key="gender.label" :value="gender.label" v-for="gender in store.genderOptions">
              {{ gender.value }}
            </option>
          </select>
          <p v-if="err('gender')" class="text-xs text-red-500 mt-1">{{ err('gender') }}</p>
        </div>

        <div>
          <label for="" class="text-xs font-semibold text-slate-600 mb-1.5 block">Marital Status</label>
          <select v-model="ap.maritalStatus" :class="fc('maritalStatus')">
            <option value="">Select</option>
            <option :key="maritalStatus.label" :value="maritalStatus.label" v-for="maritalStatus in store.maritalOptions">
              {{ maritalStatus.value }}
            </option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
        <div>
          <label for="" class="text-xs font-semibold text-slate-600 mb-1.5 block">Nationality <span class="text-red-400">*</span></label>
          <select v-model="ap.nationality" :class="fc('nationality')">
            <option value="">Select</option>
            <option :key="nationality.label" :value="nationality.label" v-for="nationality in store.countryOptions">
              {{ nationality.value }}
            </option>
          </select>
          <p v-if="err('nationality')" class="text-xs text-red-500 mt-1">{{ err('nationality') }}</p>
        </div>

        <div>
          <label for="" class="text-xs font-semibold text-slate-600 mb-1.5 block">Email Address <span class="text-red-400">*</span></label>
          <input v-model="ap.email" type="email" placeholder="For visa delivery" :class="fc('email')" />
          <p v-if="err('email')" class="text-xs text-red-500 mt-1">{{ err('email') }}</p>
        </div>

        <div>
          <label for="" class="text-xs font-semibold text-slate-600 mb-1.5 block">Phone Number <span class="text-red-400">*</span></label>
          <input v-model="ap.phone" type="tel" placeholder="+234 802 000 0000" :class="fc('phone')" />
          <p v-if="err('phone')" class="text-xs text-red-500 mt-1">{{ err('phone') }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
        <div>
          <label for="" class="text-xs font-semibold text-slate-600 mb-1.5 block">Profession</label>
          <select v-model="ap.profession" :class="fc('profession')">
            <option value="">Select</option>
            <option :key="profession.label" :value="profession.label" v-for="profession in store.professions">
              {{ profession.value }}
            </option>
          </select>
          <p v-if="err('profession')" class="text-xs text-red-500 mt-1">{{ err('profession') }}</p>
        </div>

        <div>
          <label for="" class="text-xs font-semibold text-slate-600 mb-1.5 block">Religion</label>
          <select v-model="ap.religion" :class="fc('religion')">
            <option value="">Select</option>
            <option :key="religion.label" :value="religion.label" v-for="religion in store.religions">
              {{ religion.value }}
            </option>
          </select>
          <p v-if="err('religion')" class="text-xs text-red-500 mt-1">{{ err('religion') }}</p>
        </div>

        <div>
          <label for="" class="text-xs font-semibold text-slate-600 mb-1.5 block">Language</label>
          <select v-model="ap.language" :class="fc('language')">
            <option value="">Select</option>
            <option :key="language.label" :value="language.label" v-for="language in store.languages">
              {{ language.value }}
            </option>
          </select>
          <p v-if="err('language')" class="text-xs text-red-500 mt-1">{{ err('language') }}</p>
        </div>
      </div>

      <div class="flex justify-end mt-6">
        <button class="flex items-center gap-2 px-6 py-3 bg-primary hover:opacity-90 active:scale-95 text-slate-900 font-bold text-sm rounded-xl border-none cursor-pointer transition-all"
          @click="nextSection">Save & Continue →</button>
      </div>
    </div>

    <div v-if="activeSection === 'passport'" class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <div class="flex items-center justify-between mb-5">
        <h2 class="text-base font-bold text-slate-900">Passport Details</h2>
        <span v-if="store.personCount > 1"
          class="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-500">
          Person {{ activePersonIdx + 1 }} of {{ store.personCount }}
        </span>
      </div>

      <div class="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-5">
        <p class="text-xs text-blue-700 leading-relaxed">
          <span class="font-semibold">Important:</span> All details must match the passport exactly.
          The passport must be valid for at least <span class="font-semibold">6 months</span> from the travel date.
        </p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label for="" class="text-xs font-semibold text-slate-600 mb-1.5 block">Passport Number <span class="text-red-400">*</span></label>
          <input v-model="ap.passportNumber" type="text" placeholder="e.g. A12345678" class="uppercase" :class="fc('passportNumber')" />
          <p v-if="err('passportNumber')" class="text-xs text-red-500 mt-1">{{ err('passportNumber') }}</p>
        </div>

        <div>
          <label for="" class="text-xs font-semibold text-slate-600 mb-1.5 block">Name on Passport <span class="text-red-400">*</span></label>
          <input v-model="ap.passportName" type="text" placeholder="e.g. John Doe" class="capitalize" :class="fc('passportName')" />
          <p v-if="err('passportName')" class="text-xs text-red-500 mt-1">{{ err('passportName') }}</p>
        </div>

        <div>
          <label for="" class="text-xs font-semibold text-slate-600 mb-1.5 block">Issue Date <span class="text-red-400">*</span></label>
          <input v-model="ap.passportIssueDate" type="date" :class="fc('passportIssueDate')" />
          <p v-if="err('passportIssueDate')" class="text-xs text-red-500 mt-1">{{ err('passportIssueDate') }}</p>
        </div>

        <div>
          <label for="" class="text-xs font-semibold text-slate-600 mb-1.5 block">Expiry Date <span class="text-red-400">*</span></label>
          <input v-model="ap.passportExpiry" type="date" :class="fc('passportExpiry')" />
          <p v-if="err('passportExpiry')" class="text-xs text-red-500 mt-1">{{ err('passportExpiry') }}</p>
        </div>

        <div>
          <label for="" class="text-xs font-semibold text-slate-600 mb-1.5 block">Issuing Country <span class="text-red-400">*</span></label>
          <select v-model="ap.issuingCountry" :class="fc('issuingCountry')">
            <option value="">Select</option>
            <option :key="country.label" :value="country.label" v-for="country in store.countryOptions">
              {{ country.value }}
            </option>
          </select>
          <p v-if="err('issuingCountry')" class="text-xs text-red-500 mt-1">{{ err('issuingCountry') }}</p>
        </div>

        <div>
          <label for="" class="text-xs font-semibold text-slate-600 mb-1.5 block">Passport Type <span class="text-red-400">*</span></label>
          <select v-model="ap.passportType" :class="fc('passportType')">
            <option value="">Select</option>
            <option :key="passport.label" :value="passport.label" v-for="passport in store.passportTypes">
              {{ passport.value }}
            </option>
          </select>
          <p v-if="err('passportType')" class="text-xs text-red-500 mt-1">{{ err('passportType') }}</p>
        </div>
      </div>

      <div class="flex justify-between mt-6">
        <button class="px-5 py-3 border-2 border-slate-200 text-slate-700 font-semibold text-sm rounded-xl hover:bg-slate-50 cursor-pointer bg-white"
          @click="activeSection = 'personal'">← Back</button>
        <button class="flex items-center gap-2 px-6 py-3 bg-primary hover:opacity-90 active:scale-95 text-slate-900 font-bold text-sm rounded-xl border-none cursor-pointer transition-all"
          @click="nextSection">Save & Continue →</button>
      </div>
    </div>

    <div v-if="activeSection === 'visa_requirement'" class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <div class="flex items-center justify-between mb-5">
        <h2 class="text-base font-bold text-slate-900">Visa Requirements</h2>
        <span v-if="store.personCount > 1"
          class="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-500">
          Person {{ activePersonIdx + 1 }} of {{ store.personCount }}
        </span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label for="" class="text-xs font-semibold text-slate-600 mb-1.5 block">Group Membership <span class="text-red-400">*</span></label>
          <select v-model="ap.groupMembership" :class="fc('groupMembership')">
            <option value="">Select</option>
            <option :key="membership.label" :value="membership.label" v-for="membership in store.groupMemberships">
              {{ membership.value }}
            </option>
          </select>
          <p v-if="err('groupMembership')" class="text-xs text-red-500 mt-1">{{ err('groupMembership') }}</p>
        </div>

        <div>
          <label for="" class="text-xs font-semibold text-slate-600 mb-1.5 block">Processing Mode <span class="text-red-400">*</span></label>
          <select v-model="ap.processingMode" :class="fc('processingMode')">
            <option value="">Select purpose</option>
            <option :key="processing.label" :value="processing.label" v-for="processing in store.processingOpts">
              {{ processing.value }}
            </option>
          </select>
          <p v-if="err('processingMode')" class="text-xs text-red-500 mt-1">{{ err('processingMode') }}</p>
        </div>
      </div>

      <div class="flex justify-between mt-6">
        <button class="px-5 py-3 border-2 border-slate-200 text-slate-700 font-semibold text-sm rounded-xl hover:bg-slate-50 cursor-pointer bg-white"
          @click="activeSection = 'passport'">← Back</button>
        <button class="flex items-center gap-2 px-6 py-3 bg-primary hover:opacity-90 active:scale-95 text-slate-900 font-bold text-sm rounded-xl border-none cursor-pointer transition-all"
          @click="nextSection">Save & Continue →</button>
      </div>
    </div>

    <div v-if="activeSection === 'documents'" class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <div class="flex items-center justify-between mb-2">
        <h2 class="text-base font-bold text-slate-900">Upload Documents</h2>
        <span v-if="store.personCount > 1"
          class="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-500">
          Person {{ activePersonIdx + 1 }} of {{ store.personCount }}
        </span>
      </div>
      <p class="text-sm text-slate-500 mb-5">Upload clear scans or photos. Max 5MB per file. Accepted: PDF, JPG, PNG.</p>

      <div v-if="errors._docs" class="mb-4 flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
        <svg class="shrink-0 mt-0.5" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <p class="text-sm text-red-700">{{ errors._docs }}</p>
      </div>

      <div class="space-y-3">
        <div v-for="doc in docs" :key="doc.key"
          class="flex items-center gap-4 p-4 rounded-xl border-2 transition-all"
          :class="doc.uploaded
            ? 'border-green-200 bg-green-50'
            : doc.required
              ? 'border-slate-200 hover:border-primary/40'
              : 'border-dashed border-slate-200 hover:border-slate-300'">

          <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            :class="doc.uploaded ? 'bg-green-100' : 'bg-slate-100'">
            <svg v-if="doc.uploaded" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5"><polyline points="20,6 9,17 4,12"/></svg>
            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
          </div>

          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <p class="text-sm font-semibold text-slate-800 truncate">{{ doc.label }}</p>
              <span v-if="doc.required"
                class="text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
                :class="doc.uploaded ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'">
                Required
              </span>
              <span v-else class="text-[10px] text-slate-400 shrink-0">Optional</span>
            </div>
            <p v-if="doc.uploaded" class="text-xs text-green-700 mt-0.5 truncate">
              {{ doc.fileName }} · {{ doc.size }}
            </p>
            <p v-else class="text-xs text-slate-400 mt-0.5">PDF, JPG or PNG · Max 5MB</p>
          </div>

          <div class="shrink-0">
            <label v-if="!doc.uploaded"
              class="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer transition-colors">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              Upload
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" class="sr-only"
                @change="handleFileChange(doc.key, $event)" />
            </label>
            <button v-else
              class="flex items-center gap-1.5 px-3 py-2 bg-red-50 border border-red-200 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-lg cursor-pointer transition-colors"
              @click="store.removeDocument(activePersonIdx, doc.key)">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              Remove
            </button>
          </div>
        </div>
      </div>

      <div class="mt-5 p-4 bg-slate-50 rounded-xl border border-slate-100">
        <div class="flex items-center justify-between text-xs mb-2">
          <span class="font-semibold text-slate-700">Upload Progress — {{ personLabel(activePersonIdx) }}</span>
          <span class="text-slate-500">
            {{ docs.filter(d => d.uploaded).length }} / {{ docs.length }} files
          </span>
        </div>
        <div class="h-2 bg-slate-200 rounded-full overflow-hidden">
          <div class="h-full bg-primary rounded-full transition-all duration-500"
            :style="{ width: `${(docs.filter(d => d.uploaded).length / docs.length) * 100}%` }">
          </div>
        </div>
        <p class="text-xs text-slate-500 mt-1.5">
          {{ docs.filter(d => d.required && !d.uploaded).length }} required document(s) remaining for this traveller
        </p>
      </div>

      <div class="flex justify-between mt-6">
        <button class="px-5 py-3 border-2 border-slate-200 text-slate-700 font-semibold text-sm rounded-xl hover:bg-slate-50 cursor-pointer bg-white"
          @click="activeSection = 'visa_requirement'">← Back</button>
        <button
          class="flex items-center gap-2 px-6 py-3 font-bold text-sm rounded-xl border-none cursor-pointer transition-all"
          :class="currentPersonReady && !store.visaLoading
            ? 'bg-primary hover:opacity-90 active:scale-95 text-slate-900'
            : 'bg-slate-200 text-slate-400 cursor-not-allowed'"
          :disabled="store.visaLoading"
          @click="submitForm">
          <svg v-if="store.visaLoading" class="animate-spin" width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83"/>
          </svg>
          {{ submitButtonLabel }}
        </button>
      </div>
    </div>

  </div>
</template>
