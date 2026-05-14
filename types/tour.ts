

export interface CountryResponse {
    id: number
    name: string
}

export interface CityResponse {
    city_name: string
    city_id: string
}

export interface TourSearchPayload {
    country_id: number
    city_id: number
    date: string
}

export interface TourImage {
    tourId: number
    imagePath: string
    imageCaptionName: string
    isFrontImage: number
    isBannerImage: number
    isBannerRotateImage: number
}

export interface TourReview {
    id: number
    tourId: number
    reviewId: number
    reviewTitle: string
    reviewContent: string
    visitMonth: string
    rating: string
    imagePath: string
    guestName: string
}

export interface TourResult {
    tourId: number
    countryId: number
    countryName: string
    cityId: number
    cityName: string
    tourName: string
    reviewCount: number
    rating: number
    duration: string
    departurePoint: string
    reportingTime: string
    tourLanguage: string
    imagePath: string
    imageCaptionName: string
    cityTourTypeId: string
    cityTourType: string
    tourShortDescription: string
    tourDescription: string
    tourInclusion: string
    tourExclusion: string
    cancellationPolicyName: string
    cancellationPolicyDescription: string
    childAge: string
    infantAge: string
    startTime: string
    latitude: string
    longitude: string
    googleMapUrl: string
    videoUrl: string
    contractId: number
    tourImages: TourImage[]
    tourReview: TourReview[]
}

export interface TourSearchData {
    statuscode: number
    error: any
    url: string
    count: number
    result: TourResult[]
}

export interface TourSearchApiResponse {
    status: boolean
    message: string
    session_code: string
    data: TourSearchData
}

// ── Pricing ───────────────────────────────────────────────────────────────────

export interface TourPricingPayload {
    tour_id: number
    contract_id: number
    travel_date: string
}

export interface TourPricingResult {
    tourId: number
    tourOptionId: number
    transferId: number
    transferName: string
    adultPrice: number
    childPrice: number
    infantPrice: number
    withoutDiscountAmount: number
    finalAmount: number
    startTime: string
    departureTime: string
    disableChild: boolean
    disableInfant: boolean
    allowTodaysBooking: boolean
    cutOff: number
    isSlot: boolean
    isSeat: boolean
    isDefaultTransfer: number
    minimumPax: number
}

export interface TourPricingData {
    statuscode: number
    error: any
    currency: string
    currencysymbol: string
    count: number
    result: TourPricingResult[]
}

export interface TourPricingApiResponse {
    status: boolean
    message: string
    data: TourPricingData
}

// ── Booking Process ───────────────────────────────────────────────────────────

export interface TourBookingTraveller {
    tour_id: number
    tour_option_id: number
    travel_date: string
    time_slot_id: number
    transfer_id: number
    traveller_type: 'ADULT' | 'CHILD' | 'INFANT'
    amount: number
    firstname: string
    surname: string
    emailaddress: string
    phone_number: string
    passport_nationality: string
    booking_detail_code: string
}

export interface TourProcessPayload {
    booking_code: string
    booking_tours: TourBookingTraveller[]
}

export interface TourProcessApiResponse {
    status: boolean
    message: string
    data?: any
}

// ── Tour Detail ───────────────────────────────────────────────────────────────

export interface TourDetailApiResponse {
    status: boolean
    message: string
    data?: TourResult
}

// ── Booking Record (bookings/tour) ────────────────────────────────────────────

export interface TourBookingRecordPayload {
    traveller_code: string
    tour_id: number
    travel_date: string
    currency_code: string
    amount: number
    amount_display: number
    status: 'confirmed'
    transfer_id: number
    transfer_option: string
    transfer_name: string
    contract_id: number
    tour_option_id: number
    traveller_type: 'adult' | 'child' | 'infant'
    time_slot_id: number
    time_slot_name: string
}

export interface TourBookingRecordResponse {
    status: boolean
    message: string
    data?: any
}

// ── Payment ───────────────────────────────────────────────────────────────────

export interface TourPaymentPayload {
    amount: number
    currency: string
    invoice_code: string
    customer_name: string
    customer_email: string
    callback_url: string
}

export interface TourPaymentResponse {
    payment_link?: string
    authorization_url?: string
}



