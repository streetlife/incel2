<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import PassengerSelect from './PassengerSelect.vue'
import { useVisaStore } from '../../stores/visa'
import { navigateTo } from 'nuxt/app'
import SearchableSelect from '../SearchableSelect.vue'

const route = useRoute()
const visaStore = useVisaStore()

const emit = defineEmits<{
  search: [searchData: any]
}>()

const form = ref({
  country: '',
  nationality: '',
  persons: 1,
})

const errors = ref({
  country: '',
  nationality: '',
  persons: '',
  general: '',
})

const countryOptions = computed(() => visaStore.countryOptions)
const countries = computed(() => visaStore.country)

function prefillFromQuery() {
  const q = route.query
  if (!q || Object.keys(q).length === 0) return
  form.value.country = String(q.country     ?? '')
  form.value.nationality = String(q.nationality ?? '')
  form.value.persons = Number(q.persons)    || 1
}

onMounted(async () => {
  Promise.all([
    visaStore.loadMetaData(),
    visaStore.loadCountry()
  ])
  .then(() => {
    prefillFromQuery()
  })
  .catch((err) => {
    console.error('Mounted error:', err)
  })
})

watch(() => route.query, prefillFromQuery, { deep: true })

watch(() => form.value.country, () => { if (errors.value.country) errors.value.country = '' })
watch(() => form.value.nationality, () => { if (errors.value.nationality) errors.value.nationality = '' })
watch(() => form.value.persons, () => { if (errors.value.general) errors.value.general = '' })

function validate(): boolean {
  errors.value = { country: '', nationality: '', persons: '', general: '' }
  let ok = true

  if (!form.value.country) {
    errors.value.country = 'Destination country is required'
    ok = false
  }
  if (!form.value.nationality) {
    errors.value.nationality = 'Nationality is required'
    ok = false
  }
  if (!form.value.persons || form.value.persons < 1) {
    errors.value.general = 'At least 1 person is required'
    ok = false
  }
  if (form.value.persons > 10) {
    errors.value.general = 'Maximum 10 persons allowed per application'
    ok = false
  }
  return ok
}

const buildQueryParams = () => ({
  country: String(form.value.country),
  nationality: String(form.value.nationality),
  persons: String(form.value.persons),
})

const scrollToFirstError = () => {
  const firstErrorField = document.querySelector('.border-red-500')
  if (firstErrorField) {
    firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

const navigateToVisaPage = async () => {
  if (route.path === '/travel/visas') return

  await navigateTo({
    path: '/travel/visas',
    query: buildQueryParams()
  })
}

async function submit() {
  if (!validate()) {
    scrollToFirstError()
    return
  }

  emit('search', { ...form.value })
  await navigateToVisaPage()
}
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-4 gap-4">
    <div>
      <label for="destination" class="block text-sm font-medium text-gray-700 mb-2">
        Destination
      </label>

      <SearchableSelect
        id="destination"
        v-model="form.country"
        :options="(countries ?? []).map(c => ({ value: c.iso_code, label: c.country, code: c.iso_code }))"
        placeholder="Select Country"
        value-key="value"
        label-key="label"
        :loading="visaStore.countryLoading"
        :error="errors.country"
      />
    </div>

    <div>
      <label for="nationality" class="block text-sm font-medium text-gray-700 mb-2">
        Nationality
      </label>

      <SearchableSelect
        id="nationality"
        v-model="form.nationality"
        :options="(countryOptions ?? []).map(c => ({ value: c.code, label: c.value, code: c.code }))"
        placeholder="Select Nationality"
        value-key="value"
        label-key="label"
        :loading="visaStore.metaLoading"
        :error="errors.nationality"
      />
    </div>

    <div>
      <PassengerSelect
        v-model="form.persons"
        label="Applicants"
        id="persons"
        mode="visa"
        :class="{ 'border-red-500': errors.persons }"
      />
    </div>

    <div class="mt-7">
      <button
        type="button"
        :disabled="visaStore.metaLoading || visaStore.countryLoading"
        class="btn-primary w-full py-3 px-6 flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
        @click="submit"
      >
        Search
      </button>
    </div>
  </div>
</template>

<style scoped>
.btn-primary {
  @apply bg-yellow-400 hover:bg-yellow-500 font-bold rounded-lg text-gray-900;
}
</style>
