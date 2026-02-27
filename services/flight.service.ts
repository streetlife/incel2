import type { ApiResponse, PaymentInitRequest, PaymentVerifyRequest } from '../types/api'
import type {
  FlightSearchParams,
  FlightSearchResponse,
  FlightOffer,
  FlightBookingConfirmation,
  AirportSearchParams,
  Airport,
  FlightBookingData,
  FlightBookingResponse,
} from '../types/flight'
import { useApi } from '../utils/api'

export function useFlightService() {
  const $api = useApi()

  return {

    /**
     * Search available flights.
     */
    async search(params: FlightSearchParams): Promise<FlightSearchResponse> {
      const res = await $api<ApiResponse<FlightSearchResponse>>('/flights/search', {
        method: 'POST',
        body: params,
      })
      return res.data
    },

    /**
     * Search available airports.
     */
    async searchAirpots(params: AirportSearchParams): Promise<Airport[]> {
      const res = await $api<ApiResponse<Airport[]>>('/flights/airports/search', {
        method: 'GET',
        query: params,
      })
      return res.data
    },

    /**
     * Re-fetch a single offer to confirm price hasn't changed before payment.
     */
    async getOffer(offerId: string): Promise<FlightOffer> {
      const res = await $api<ApiResponse<FlightOffer>>(`/flights/offers/${offerId}`)
      return res.data
    },

    /**
     * Save booking data.
     */
    async saveBooking(data: FlightBookingData): Promise<FlightBookingResponse> {
      const res = await $api<ApiResponse<FlightBookingResponse>>('/bookings', {
        method: 'POST',
        body: data,
      })
      return res.data
    },

    /**
     * Initialise paystack payment — backend creates a pending booking record,
     */
    async paystackInitializePayment(payload: {
      amount: number
      invoice_code: string
      customer_name: string
      customer_email: string
      callback_url: string
    }): Promise<{ payment_link: string; reference: string }> {
      const body: PaymentInitRequest = {
        amount: payload.amount,
        customer_email: payload.customer_email,
        callback_url: payload.callback_url,
        invoice_code: payload.invoice_code,
        customer_name: payload.customer_name
      }

      const res = await $api<ApiResponse<{ payment_link: string; reference: string }>>(
        '/paystack/payment/initialize',
        { method: 'POST', body }
      )
      return res.data
    },

    /**
     * Verify payment after gateway redirect.
     */
    async verifyPayment(payload: PaymentVerifyRequest): Promise<FlightBookingConfirmation> {
      const res = await $api<ApiResponse<FlightBookingConfirmation>>(
        '/payments/verify',
        { method: 'POST', body: payload }
      )
      return res.data
    },

    /**
     * Initialise flutterwave payment — backend creates a pending booking record,
     */
    async flutterwaveInitializePayment(payload: {
      amount: number
      invoice_code: string
      customer_name: string
      customer_email: string
      callback_url: string
    }): Promise<{ payment_link: string; reference: string }> {
      const body: PaymentInitRequest = {
        amount: payload.amount,
        customer_email: payload.customer_email,
        callback_url: payload.callback_url,
        invoice_code: payload.invoice_code,
        customer_name: payload.customer_name
      }

      const res = await $api<{ payment_link: string; reference: string }>(
        '/flutterwave/payment/initialize',
        { method: 'POST', body }
      )
      return res
    },
  }
}
