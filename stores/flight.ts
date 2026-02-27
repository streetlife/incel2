import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Passenger {
    type: 'ADULT' | 'CHILD' | 'INFANT'
    title?: string
    firstname: string
    surname: string
    birth_date: string
    nationality?: string
    passport_issuance_date: string
    passport_expiry_date: string
    passport_nationality: string
    emailaddress: string
    phone_number: string
}

export interface FlightSearchParams {
    from: string
    to: string
    dateFrom: string
    dateTo: string
    tripType: string
    travelClass: string
    adult_number: number
    child_number: number
    infants_number: number
}

export const useFlightStore = defineStore(
    'flight',
    () => {
        const searchParams = ref<FlightSearchParams>({
            from: '',
            to: '',
            dateFrom: '',
            dateTo: '',
            tripType: '',
            travelClass: '',
            adult_number: 1,
            child_number: 0,
            infants_number: 0,
        })
        const session_code = ref('')
        const name = ref('')
        const email = ref('')
        const offer = ref<any | null>(null)
        const passengerCount = ref(1)
        const cabinClass = ref('ECONOMY')
        const passengers = ref<Passenger[]>([])
        const contactEmail = ref('')
        const contactPhone = ref('')
        const isLoggedIn = ref(false)
        const isB2B = ref(false)
        const discountRate = ref(0)
        const discountCode = ref('')

        const basePrice = ref(0)
        const taxAmount = ref(0)
        const discountAmount = ref(0)
        const totalPrice = ref(0)
        const currency = ref('USD')

        const invoiceNumber = ref('')
        const invoiceDate = ref('')
        const bookingReference = ref('')
        const ticketNumbers = ref<string[]>([])
        const status = ref<'idle' | 'loading' | 'confirmed' | 'error'>('idle')
        const errorMessage = ref('')

        const priceBreakdown = computed(() => {
            const base = basePrice.value * passengerCount.value
            const tax = Math.round(base * 0.075)
            const discount = Math.round(base * discountRate.value)
            const total = base + tax - discount
            return { base, tax, discount, total }
        })

        const totalPassengers = computed(
            () =>
                searchParams.value.adult_number +
                searchParams.value.child_number +
                searchParams.value.infants_number,
        )

        function _recalcPricing() {
            taxAmount.value = priceBreakdown.value.tax
            discountAmount.value = priceBreakdown.value.discount
            totalPrice.value = priceBreakdown.value.total
        }

        function setFlight(params: FlightSearchParams) {
            searchParams.value = params
        }

        function setSessionCode(code: string) {
            session_code.value = code
        }

        function setNameEmail(n: string, e: string) {
            name.value = n
            email.value = e
        }

        function selectOffer(raw: any, passengerTypes: Array<'ADULT' | 'CHILD' | 'INFANT'>) {
            offer.value = raw
            passengerCount.value = passengerTypes.length
            basePrice.value = Number.parseFloat(raw.price.total)
            cabinClass.value =
                raw.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin ?? 'ECONOMY'
            currency.value = raw.price.currency ?? 'USD'

            passengers.value = passengerTypes.map((type, i) => ({
                type,
                firstname: '',
                surname: '',
                birth_date: '',
                nationality: '',
                passport_issuance_date: '',
                passport_expiry_date: '',
                passport_nationality: '',
                emailaddress: i === 0 ? contactEmail.value : '',
                phone_number: i === 0 ? contactPhone.value : '',
            }))

            _recalcPricing()
        }

        function applyB2BDiscount(rate: number, code: string) {
            isB2B.value = true
            discountRate.value = rate
            discountCode.value = code
            _recalcPricing()
        }

        function clearDiscount() {
            isB2B.value = false
            discountRate.value = 0
            discountCode.value = ''
            _recalcPricing()
        }

        function generateInvoice() {
            invoiceNumber.value = `INV-${Date.now().toString(36).toUpperCase()}`
            invoiceDate.value = new Date().toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
            })
        }

        async function confirmBooking(): Promise<boolean> {
            status.value = 'loading'
            await new Promise((r) => setTimeout(r, 2200))

            bookingReference.value = `BK${Math.random().toString(36).slice(2, 8).toUpperCase()}`
            ticketNumbers.value = passengers.value.map(
                (_, i) => `TK${Math.random().toString(36).slice(2, 10).toUpperCase()}${i}`,
            )
            status.value = 'confirmed'
            generateInvoice()
            return true
        }

        function resetBooking() {
            offer.value = null
            passengerCount.value = 1
            passengers.value = []
            contactEmail.value = ''
            contactPhone.value = ''
            isB2B.value = false
            discountRate.value = 0
            discountCode.value = ''
            basePrice.value = 0
            taxAmount.value = 0
            discountAmount.value = 0
            totalPrice.value = 0
            invoiceNumber.value = ''
            invoiceDate.value = ''
            bookingReference.value = ''
            ticketNumbers.value = []
            status.value = 'idle'
            errorMessage.value = ''
        }

        function resetAll() {
            resetBooking()
            searchParams.value = {
                from: '', to: '', dateFrom: '', dateTo: '',
                tripType: '', travelClass: '',
                adult_number: 1, child_number: 0, infants_number: 0,
            }
            session_code.value = ''
            name.value = ''
            email.value = ''
            isLoggedIn.value = false
        }

        return {
            searchParams, session_code, name, email,
            offer, passengerCount, cabinClass, passengers, contactEmail, contactPhone,
            isLoggedIn, isB2B, discountRate, discountCode,
            basePrice, taxAmount, discountAmount, totalPrice, currency,
            invoiceNumber, invoiceDate,
            bookingReference, ticketNumbers, status, errorMessage,
            priceBreakdown, totalPassengers,
            setFlight, setSessionCode, setNameEmail,
            selectOffer, applyB2BDiscount, clearDiscount,
            generateInvoice, confirmBooking,
            resetBooking, resetAll,
        }
    },
    {
        unstorage: {
            pick: [
                'searchParams', 'session_code', 'name', 'email',
                'offer', 'passengerCount', 'cabinClass', 'passengers',
                'contactEmail', 'contactPhone',
                'isLoggedIn', 'isB2B', 'discountRate', 'discountCode',
                'basePrice', 'taxAmount', 'discountAmount', 'totalPrice', 'currency',
                'invoiceNumber', 'invoiceDate', 'priceBreakdown', 'totalPassengers',
                'bookingReference', 'ticketNumbers',
            ],
        },
    },
)