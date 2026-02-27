import type { FlightBookingConfirmation } from '../types/flight'
import { useFlightService } from '../services/flight.service'
import { normaliseError } from '../utils/api'
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCurrency } from './useCurrency'
import { useFlightStore } from '../stores/flight'

const paymentRef = ref('')
const confirmation = ref<FlightBookingConfirmation | null>(null)

export function useFlightBooking() {
  const route = useRoute()
  const router = useRouter()
  const service = useFlightService()
  const { formatNumber } = useCurrency()
  const flightStore = useFlightStore()

  const loading = ref(false)
  const error = ref('')

  function hydrateFromSession() {
    try {
      if (flightStore.passengers.length === 0) {
        flightStore.passengers = Array.from({ length: flightStore.passengerCount }, (_, i) => ({
          type: 'ADULT' as const,
          firstname: '',
          surname: '',
          birth_date: '',
          passport_expiry_date: '',
          passport_issuance_date: '',
          passport_nationality: '',
          emailaddress: i === 0 ? flightStore.contactEmail : '',
          phone_number: i === 0 ? flightStore.contactPhone : '',
        }))
      }
    } catch {
      router.replace('/travel/flights')
    }
  }

  async function initPayment(gateway: 'paystack' | 'flutterwave') {
    if (!flightStore.offer) {
      throw new Error('No flight offer found. Please go back and select a flight again.')
    }
    loading.value = true
    error.value = ''

    try {
      const callbackUrl = `${globalThis.location.origin}/travel/flights/booking/confirm`
      const amount = formatNumber(flightStore.priceBreakdown.total)

      const result = await paymentGateway(gateway, callbackUrl, Number(amount))

      if (!result) {
        error.value = 'Payment gateway failed to initialize payment.'
        loading.value = false
        return
      }

      return result.payment_link
    } catch (err) {
      error.value = normaliseError(err)
      loading.value = false
    }
  }

  async function paymentGateway(
    gateway: 'paystack' | 'flutterwave',
    callbackUrl: string,
    amount: number,
  ) {
    const payload = {
      amount,
      invoice_code: flightStore.invoiceNumber,
      customer_name: flightStore.name,
      customer_email: flightStore.email,
      callback_url: callbackUrl,
    }

    if (gateway === 'paystack') {
      return await service.paystackInitializePayment(payload)
    } else {
      return await service.flutterwaveInitializePayment(payload)
    }
  }

  async function verifyPayment() {
    loading.value = true
    error.value = ''

    const q = route.query
    const isPaystack = !!(q.reference || q.trxref)
    const isFlutterwave = !!(q.transaction_id)

    if (!isPaystack && !isFlutterwave) {
      error.value = 'No payment reference found in URL.'
      loading.value = false
      return 'failed'
    }

    if (isFlutterwave && q.status && q.status !== 'successful') {
      error.value = 'Payment was cancelled or declined. No charge was made.'
      loading.value = false
      return 'failed'
    }

    try {
      const verifyPayload = isPaystack
        ? { gateway: 'paystack' as const, reference: String(q.reference ?? q.trxref) }
        : { gateway: 'flutterwave' as const, reference: String(q.tx_ref), transaction_id: String(q.transaction_id) }

      // const result = await service.verifyPayment(verifyPayload)
      // confirmation.value = result
      return 'success'
    } catch (err) {
      error.value = normaliseError(err)
      return 'failed'
    } finally {
      loading.value = false
    }
  }

  function reset() {
    flightStore.resetBooking()
    paymentRef.value = ''
    confirmation.value = null
  }

  return {
    confirmation,
    loading,
    error,
    hydrateFromSession,
    initPayment,
    verifyPayment,
    reset,
  }
}