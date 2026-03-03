import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useVisaService } from '../services/visa.service'

export interface ApplicantData {
  firstName: string
  lastName: string
  otherNames: string
  dateOfBirth: string
  gender: string
  maritalStatus: string
  nationality: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  // Passport
  passportNumber: string
  passportIssueDate: string
  passportExpiry: string
  issuingCountry: string
  issuingAuthority: string
  // Travel
  purposeOfVisit: string
  departureDate: string
  returnDate: string
  accommodationName: string
  accommodationAddr: string
  sponsorName: string
  sponsorRelation: string
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
}

export interface VisaParams {
  country: string
  nationality: string
  persons: number
}

export interface MetaData {
  passport_types: Array<{ value: string; label: number }>
  visa_types: Array<{ value: string; label: number }>
  visa_countries: Array<{ value: string; label: number }>
  visa_gender_types: Array<{ value: string; label: number }>
}

function blankApplicant(): ApplicantData {
  return {
    firstName: '', lastName: '', otherNames: '', dateOfBirth: '', gender: '',
    maritalStatus: '', nationality: '', email: '', phone: '', address: '',
    city: '', state: '',
    passportNumber: '', passportIssueDate: '', passportExpiry: '',
    issuingCountry: '', issuingAuthority: '',
    purposeOfVisit: '', departureDate: '', returnDate: '',
    accommodationName: '', accommodationAddr: '',
    sponsorName: '', sponsorRelation: '',
    previousVisaRefused: false, refusalDetails: '',
  }
}

function defaultDocuments(): DocumentItem[] {
  return [
    { key: 'passport_bio', label: 'Passport Bio Page', required: true, uploaded: false, fileName: '', size: '' },
    { key: 'passport_photo', label: 'Passport Photograph', required: true, uploaded: false, fileName: '', size: '' },
    { key: 'bank_statement', label: 'Bank Statement (3 months)', required: true, uploaded: false, fileName: '', size: '' },
    { key: 'flight_itinerary', label: 'Flight Itinerary', required: true, uploaded: false, fileName: '', size: '' },
    { key: 'hotel_booking', label: 'Hotel Booking / Accommodation Proof', required: true, uploaded: false, fileName: '', size: '' },
    { key: 'travel_insurance', label: 'Travel Insurance', required: false, uploaded: false, fileName: '', size: '' },
    { key: 'invitation_letter', label: 'Invitation Letter', required: false, uploaded: false, fileName: '', size: '' },
  ]
}

export const useVisaStore = defineStore('visa', () => {
  const selectedVisa = ref<VisaParams | null>(null)
  const applicants = ref<ApplicantData[]>([blankApplicant()])
  const documentSets = ref<DocumentItem[][]>([[...defaultDocuments()]])
  const shareTravel = ref(true)
  const personCount = computed(() => applicants.value.length)
  const visaService = useVisaService()
  const metaData = ref<MetaData | null>(null)

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

  function getApplicant(idx: number): ApplicantData {
    return applicants.value[idx] ?? blankApplicant()
  }

  function getDocuments(idx: number): DocumentItem[] {
    return documentSets.value[idx] ?? []
  }

  function markDocumentUploaded(personIdx: number, key: string, fileName: string, size: string) {
    const doc = documentSets.value[personIdx]?.find(d => d.key === key)
    if (doc) { doc.uploaded = true; doc.fileName = fileName; doc.size = size }
  }

  function removeDocument(personIdx: number, key: string) {
    const doc = documentSets.value[personIdx]?.find(d => d.key === key)
    if (doc) { doc.uploaded = false; doc.fileName = ''; doc.size = '' }
  }

  function requiredDocsUploaded(personIdx: number): boolean {
    return (documentSets.value[personIdx] ?? [])
      .filter(d => d.required)
      .every(d => d.uploaded)
  }

  function allPersonsComplete(): boolean {
    return applicants.value.every((_, i) => requiredDocsUploaded(i))
  }

  async function getMetaData() {
    try {
      const res = await visaService.getMetaData()

      metaData.value = {
        passport_types: res.passport_types.map((v: any) => ({
          value: v.value,
          label: v.lebel,
        })),
        visa_types: res.visa_types.map((v: any) => ({
          value: v.value,
          label: v.lebel,
        })),
        visa_countries: res.visa_countries.map((v: any) => ({
          value: v.value,
          label: v.lebel,
        })),
        visa_gender_types: res.visa_gender_types.map((v: any) => ({
          value: v.value,
          label: v.lebel,
        })),
      }
    } catch (err) {
      console.log(err)
    }
  }

  function resetAll() {
    selectedVisa.value = null
    applicants.value = [blankApplicant()]
    documentSets.value = [[...defaultDocuments()]]
    shareTravel.value = true
  }

  return {
    selectedVisa,
    applicants,
    documentSets,
    shareTravel,
    personCount,
    setVisa,
    getApplicant,
    getDocuments,
    markDocumentUploaded,
    removeDocument,
    requiredDocsUploaded,
    allPersonsComplete,
    resetAll,
    getMetaData,
  }
}, {
  unstorage: {
    pick: [
      'metaData'
    ]
  }
})
