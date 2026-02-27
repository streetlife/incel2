export interface ApiResponse<T> {
  data: T
  message: string
  status: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
    from: number
    to: number
  }
  links: {
    first: string | null
    last: string | null
    prev: string | null
    next: string | null
  }
}

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
  code?: string
  status?: number
}

export interface PaymentInitRequest {
  type?: BookingType
  amount: number
  customer_email: string
  callback_url: string
  invoice_code: string
  customer_name: string
}

export interface PaymentInitResponse {
  authorization_url: string
  access_code?: string
  reference: string
}

export interface PaymentVerifyRequest {
  gateway: 'paystack' | 'flutterwave'
  reference: string
  transaction_id?: string
}

export interface PaymentVerifyResponse {
  paid: boolean
  amount: number
  currency: string
  booking_reference: string
  invoice_number: string
  invoice_date: string
}

export type BookingType = 'flight' | 'hotel' | 'tour' | 'visa'
