import { defineStore } from 'pinia'

// ── Types ─────────────────────────────────────────────────────────────────────
export interface VisaService {
  id: number
  country: string
  nationality: string
  visaType: string // Tourist | Business | Transit | Student | Work
  validity: string // 30 Days | 90 Days | 1 Year …
  entryType: string // Single | Multiple
  processingTime: string
  price: number
  requirements: string[]
  success_rate: number
}

export interface ApplicantForm {
  // Personal
  title: string
  firstName: string
  lastName: string
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

export interface UploadedDoc {
  key: string // e.g. 'passportCopy'
  label: string
  fileName: string
  size: string
  required: boolean
  uploaded: boolean
}

interface VisaState {
  selectedVisa: VisaService | null
  searchParams: { country: string; nationality: string; persons: number; }

  applicant: ApplicantForm
  additionalApplicants: number // extra people (children etc.) — adults count from search
  documents: UploadedDoc[]

  invoiceNumber: string
  invoiceDate: string

  applicationRef: string
  status: 'idle' | 'submitted' | 'processing' | 'approved' | 'rejected'
  adminNote: string

  contactEmail: string
  contactPhone: string

  loading: boolean
  error: string
}

const defaultApplicant = (): ApplicantForm => ({
  title: '', firstName: '', lastName: '', dateOfBirth: '',
  gender: '', maritalStatus: '', nationality: '', email: '', phone: '',
  address: '', city: '', state: '',
  passportNumber: '', passportIssueDate: '', passportExpiry: '',
  issuingCountry: '', issuingAuthority: '',
  purposeOfVisit: '', departureDate: '', returnDate: '',
  accommodationName: '', accommodationAddr: '',
  sponsorName: '', sponsorRelation: '',
  previousVisaRefused: false, refusalDetails: '',
})

const defaultDocuments = (): UploadedDoc[] => [
  { key: 'passportBio', label: 'Passport Biodata Page (Scan/Photo)', fileName: '', size: '', required: true, uploaded: false },
  { key: 'passportPhoto', label: 'Passport Photograph (White Background)', fileName: '', size: '', required: true, uploaded: false },
  { key: 'bankStatement', label: 'Bank Statement (Last 6 Months)', fileName: '', size: '', required: true, uploaded: false },
  { key: 'flightBooking', label: 'Flight Booking / Itinerary', fileName: '', size: '', required: false, uploaded: false },
  { key: 'hotelBooking', label: 'Hotel / Accommodation Booking', fileName: '', size: '', required: false, uploaded: false },
  { key: 'employmentLetter', label: 'Employment / Sponsorship Letter', fileName: '', size: '', required: false, uploaded: false },
]

// ── Store
export const useVisaStore = defineStore('visa', {
  state: (): VisaState => ({
    selectedVisa: null,
    searchParams: { country: '', nationality: '', persons: 1 },
    applicant: defaultApplicant(),
    additionalApplicants: 0,
    documents: defaultDocuments(),
    invoiceNumber: '',
    invoiceDate: '',
    applicationRef: '',
    status: 'idle',
    adminNote: '',
    contactEmail: '',
    contactPhone: '',
    loading: false,
    error: '',
  }),

  getters: {
    totalApplicants: (s) => s.searchParams.persons,

    pricing: (s) => {
      if (!s.selectedVisa) return null
      const perPerson = s.selectedVisa.price
      const applicants = s.searchParams.persons
      const subtotal = perPerson * applicants
      const serviceFee = Math.round(subtotal * 0.05) // 5% service fee
      const tax = Math.round(subtotal * 0.075) // 7.5% VAT
      const total = subtotal + serviceFee + tax
      return { perPerson, applicants, subtotal, serviceFee, tax, total }
    },

    requiredDocsUploaded: (s) =>
      s.documents.filter(d => d.required).every(d => d.uploaded),

    fmtNgn: () => (n: number) =>
      new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(n),
  },

  actions: {
    setVisa(params: VisaState['searchParams']) {
      this.searchParams = params
      this.applicant = defaultApplicant()
      this.documents = defaultDocuments()
      this.invoiceNumber = ''
      this.applicationRef = ''
      this.status = 'idle'
      this.error = ''
      // Pre-fill nationality from search
      this.applicant.nationality = params.nationality
    },

    markDocumentUploaded(key: string, fileName: string, size: string) {
      const doc = this.documents.find(d => d.key === key)
      if (doc) { doc.uploaded = true; doc.fileName = fileName; doc.size = size }
    },

    removeDocument(key: string) {
      const doc = this.documents.find(d => d.key === key)
      if (doc) { doc.uploaded = false; doc.fileName = ''; doc.size = '' }
    },

    generateInvoice() {
      if (!this.invoiceNumber) {
        this.invoiceNumber = 'VIS-' + Date.now().toString(36).toUpperCase()
        this.invoiceDate = new Date().toLocaleDateString('en-NG', { day: '2-digit', month: 'long', year: 'numeric' })
      }
      this.contactEmail = this.applicant.email
      this.contactPhone = this.applicant.phone
    },

    confirmApplication(applicationRef: string) {
      this.applicationRef = applicationRef
      this.status = 'submitted'
    },

    reset() {
      this.$reset()
    },
  },
})
