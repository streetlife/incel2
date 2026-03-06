import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useVisaService } from '../services/visa.service'
import type {
  NormalisedMetaData,
  SearchResultResponse,
  SelectOption,
  RawOption,
  CountryResponse,
  InitializePaymentData,
} from '../types/visa'
import { useToast } from '../composables/useToast'
import { normaliseError } from '../utils/api'

function normaliseOptions(arr: RawOption[]): SelectOption[] {
  return (arr ?? []).map(o => ({ value: String(o.value), label: String(o.lebel ?? o.label), code: String(o.code) }))
}

export interface ApplicantData {
  firstName: string
  lastName: string
  otherNames: string
  dateOfBirth: string
  gender: string
  maritalStatus: string
  nationality: string
  profession: string
  religion: string
  language: string
  email: string
  phone: string
  passportNumber: string
  passportName: string
  passportIssueDate: string
  passportExpiry: string
  issuingCountry: string
  issuingAuthority: string
  passportType: string
  groupMembership: string
  processingMode: string
  previousVisaRefused: boolean
  refusalDetails: string
}

export interface DocumentItem {
  key: string
  label: string
  required: boolean
  uploaded: boolean
  fileName: string
  size: string
  file?: File
}

export interface VisaParams {
  country: string
  nationality: string
  persons: number
  session_code: string
  visa_type: string
  price: number
}

function blankApplicant(): ApplicantData {
  return {
    firstName: '',
    lastName: '',
    otherNames: '',
    dateOfBirth: '',
    gender: '',
    maritalStatus: '',
    nationality: '',
    profession: '',
    religion: '',
    language: '',
    email: '',
    phone: '',
    passportNumber: '',
    passportName: '',
    passportIssueDate: '',
    passportExpiry: '',
    issuingCountry: '',
    issuingAuthority: '',
    passportType: '',
    groupMembership: '',
    processingMode: '',
    previousVisaRefused: false,
    refusalDetails: '',
  }
}

function defaultDocuments(): DocumentItem[] {
  return [
    { key: 'passport_bio', label: 'Passport Bio Page', required: true, uploaded: false, fileName: '', size: '' },
    { key: 'passport_photo', label: 'Passport Photograph', required: true, uploaded: false, fileName: '', size: '' },
  ]
}

export const useVisaStore = defineStore('visa', () => {
  let _service: ReturnType<typeof useVisaService> | null = null
  function getService() {
    _service ??= useVisaService()
    return _service
  }

  const metaData = ref<NormalisedMetaData | null>(null)
  const country = ref<CountryResponse[] | null>(null)
  const metaLoading = ref(false)
  const metaError = ref('')
  const countryLoading = ref(false)
  const countryError = ref('')
  const sessionCode = ref<string>('')
  const searchResults = ref<SearchResultResponse[]>([])
  const searchLoading = ref(false)
  const searchError = ref('')
  const hasSearched = ref(false)
  const selectedResult = ref<SearchResultResponse | null>(null)
  const applicants = ref<ApplicantData[]>([blankApplicant()])
  const documentSets = ref<DocumentItem[][]>([[...defaultDocuments()]])
  const shareTravel = ref(true)
  const personCount = computed(() => applicants.value.length)
  const bookingCode = ref<string | null>(null)

  const countryOptions = computed<SelectOption[]>(() => metaData.value?.visa_countries ?? [])
  const genderOptions = computed<SelectOption[]>(() => metaData.value?.visa_gender_types ?? [])
  const visaTypes = computed<SelectOption[]>(() => metaData.value?.visa_types ?? [])
  const passportTypes = computed<SelectOption[]>(() => metaData.value?.passport_types ?? [])
  const maritalOptions = computed<SelectOption[]>(() => metaData.value?.marital_statuses ?? [])
  const processingOpts = computed<SelectOption[]>(() => metaData.value?.processings ?? [])
  const languages = computed<SelectOption[]>(() => metaData.value?.languages ?? [])
  const professions = computed<SelectOption[]>(() => metaData.value?.professions ?? [])
  const religions = computed<SelectOption[]>(() => metaData.value?.religions ?? [])
  const groupMemberships = computed<SelectOption[]>(() => metaData.value?.group_memberships ?? [])

  const selectedVisa = ref<VisaParams>()
  const selectedVisaResult = ref<VisaParams>()
  const toast = useToast()
  const visaLoading = ref(false)
  const visaError = ref('')
  const paymentLoading = ref(false)
  const paymentError = ref('')

  function setVisa(params: VisaParams) {
    selectedVisa.value = { ...params }
    const count = Math.max(1, params.persons)

    while (applicants.value.length < count) {
      applicants.value.push(blankApplicant())
      documentSets.value.push(defaultDocuments().map(d => ({ ...d })))
    }

    applicants.value.splice(count)
    documentSets.value.splice(count)
  }

  function setSelectedVisaResult(params: VisaParams) {
    selectedVisaResult.value = { ...params }
  }

  async function loadMetaData() {
    if (metaData.value !== null) return

    metaLoading.value = true
    metaError.value = ''

    try {
      const raw = await getService().getMetaData()
      metaData.value = {
        group_memberships: normaliseOptions(raw.group_memberships),
        languages: normaliseOptions(raw.languages),
        marital_statuses: normaliseOptions(raw.marital_statuses),
        passport_types: normaliseOptions(raw.passport_types),
        processings: normaliseOptions(raw.processings),
        professions: normaliseOptions(raw.professions),
        religions: normaliseOptions(raw.religions),
        visa_types: normaliseOptions(raw.visa_types),
        visa_countries: normaliseOptions(raw.visa_countries),
        visa_gender_types: normaliseOptions(raw.visa_gender_types),
      }
    } catch (err: any) {
      metaError.value = err?.message ?? 'Failed to load configuration. Please refresh.'
    } finally {
      metaLoading.value = false
    }
  }

  async function loadCountry() {
    if (country.value !== null) return

    countryLoading.value = true
    countryError.value = ''

    try {
      const res = await getService().getCountries()
      country.value = res
    } catch (err: any) {
      countryError.value = err?.message ?? 'Failed to load country. Please refresh.'
    } finally {
      countryLoading.value = false
    }
  }

  async function generateBookingCode(): Promise<string> {
    try {
      const res = await getService().generateBookingCode()
      setBookingCode(res.booking_code)

      return res.booking_code
    } catch (err) {
      const e = normaliseError(err)
      toast.error(e)
      throw err
    }
  }

  async function refreshMetaData() {
    metaData.value = null
    await loadMetaData()
  }

  async function search(params: {
    country: string
    nationality: string
    persons: number
  }): Promise<{ sessionCode: string } | null> {
    searchLoading.value = true
    searchError.value = ''
    hasSearched.value = true
    searchResults.value = []
    sessionCode.value = ''
    const toast = useToast()

    try {
      const step1 = await getService().visaSearch({
        country_destination: params.country,
        country_nationality: params.nationality,
        adult_number: Number(params.persons),
      })

      sessionCode.value = step1.session_code

      const step2 = await getService().getSearchResults(sessionCode.value)
      searchResults.value = step2

      return { sessionCode: sessionCode.value }

    } catch (err: any) {
      searchError.value = normaliseError(err)
      toast.error(searchError.value)
      return null
    } finally {
      searchLoading.value = false
    }
  }

  async function createAllVisas(bookingCode: string, personIdx?: number): Promise<boolean> {
    visaLoading.value = true
    visaError.value = ''

    const indices =
      personIdx === undefined
        ? applicants.value.map((_, i) => i)
        : [personIdx]

    try {
      for (const i of indices) {
        const a = applicants.value[i]
        const docs = documentSets.value[i]

        const passportPage = docs.find(d => d.key === 'passport_bio')?.file
        const photo = docs.find(d => d.key === 'passport_photo')?.file

        if (!passportPage || !photo) {
          const name = a.firstName || `Person ${i + 1}`
          toast.error(`Missing required documents for ${name}`)
          return false
        }

        const formData = new FormData()
        formData.append('booking_code', bookingCode)
        formData.append('lastname', a.lastName)
        formData.append('firstname', a.firstName)
        formData.append('othernames', a.otherNames)
        formData.append('passport_expiry_date', a.passportExpiry)
        formData.append('passport_country', a.issuingCountry)
        formData.append('passport_number', a.passportNumber)
        formData.append('passport_issuance_date', a.passportIssueDate)
        formData.append('email_address', a.email)
        formData.append('birth_date', a.dateOfBirth)
        formData.append('passport_data_page', passportPage)
        formData.append('passport_photo', photo)
        formData.append('nationality_id', a.nationality)
        formData.append('gender', a.gender)
        formData.append('group_membership_id', a.groupMembership)
        formData.append('marital_status_id', a.maritalStatus)
        formData.append('profession_id', a.profession)
        formData.append('language_id', a.language)
        formData.append('religion_id', a.religion)

        await getService().createVisa(formData as any)

        toast.success('Created successfully')
      }

      return true
    } catch (err) {
      visaError.value = normaliseError(err)
      toast.error(visaError.value)
      return false
    } finally {
      visaLoading.value = false
    }
  }

  async function initializePayment(data: InitializePaymentData) {
    paymentLoading.value = true
    paymentError.value = ''

    try {
      const res = await getService().initializePayment({
        amount: data.amount,
        currency: data.currency,
        booking_code: data.booking_code,
        customer_name: data.customer_name,
        customer_email: data.customer_email,
        callback_url: data.callback_url,
        payment_type: data.payment_type,
      })
      return res
    } catch (err) {
      paymentError.value = normaliseError(err)
      throw new Error(paymentError.value)
    } finally {
      paymentLoading.value = false
    }
  }

  function setBookingCode(code: string) {
    bookingCode.value = code
  }

  function setPersonCount(count: number) {
    const n = Math.max(1, count)
    while (applicants.value.length < n) {
      applicants.value.push(blankApplicant())
      documentSets.value.push(defaultDocuments().map(d => ({ ...d })))
    }
    applicants.value.splice(n)
    documentSets.value.splice(n)
  }

  function getApplicant(idx: number): ApplicantData {
    return applicants.value[idx] ?? blankApplicant()
  }

  function getDocuments(idx: number): DocumentItem[] {
    return documentSets.value[idx] ?? []
  }

  function markDocumentUploaded(personIdx: number, key: string, fileName: string, size: string, file?: File) {
    const doc = documentSets.value[personIdx]?.find(d => d.key === key)
    if (doc) {
      doc.uploaded = true
      doc.fileName = fileName
      doc.size = size
      doc.file = file
    }
  }

  function removeDocument(personIdx: number, key: string) {
    const doc = documentSets.value[personIdx]?.find(d => d.key === key)
    if (doc) { doc.uploaded = false; doc.fileName = ''; doc.size = '' }
  }

  function requiredDocsUploaded(personIdx: number): boolean {
    return (documentSets.value[personIdx] ?? []).filter(d => d.required).every(d => d.uploaded)
  }

  function allPersonsComplete(): boolean {
    return applicants.value.every((_, i) => requiredDocsUploaded(i))
  }

  function resetSearch() {
    sessionCode.value = ''
    searchResults.value = []
    hasSearched.value = false
    searchError.value = ''
    selectedResult.value = null
  }

  function reset() {
    applicants.value = [blankApplicant()]
    documentSets.value = [[...defaultDocuments()]]
    shareTravel.value = true
  }

  function resetAll() {
    resetSearch()
    reset()
    bookingCode.value = null
  }

  return {
    metaData,
    metaLoading,
    metaError,
    countryLoading,
    countryError,
    countryOptions,
    genderOptions,
    visaTypes,
    passportTypes,
    maritalOptions,
    processingOpts,
    languages,
    professions,
    religions,
    groupMemberships,
    sessionCode,
    searchResults,
    searchLoading,
    searchError,
    hasSearched,
    selectedResult,
    applicants,
    documentSets,
    shareTravel,
    personCount,
    selectedVisa,
    country,
    selectedVisaResult,
    bookingCode,
    visaLoading,
    visaError,
    paymentLoading,
    paymentError,
    createAllVisas,
    search,
    resetSearch,
    loadMetaData,
    loadCountry,
    refreshMetaData,
    setVisa,
    setPersonCount,
    getApplicant,
    getDocuments,
    markDocumentUploaded,
    removeDocument,
    requiredDocsUploaded,
    allPersonsComplete,
    resetAll,
    reset,
    setSelectedVisaResult,
    generateBookingCode,
    initializePayment,
  }
}, {
  unstorage: {
    pick: ['metaData', 'country', 'bookingCode', 'applicants', 'selectedVisa', 'selectedVisaResult'],
  },
})