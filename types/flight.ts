// ─── Airline metadata (from filter.airlines) ────────────────────────────────
export interface AirlineInfo {
    code: string
    name: string | null
    logo: string | null
}

// ─── Raw Amadeus flight offer ────────────────────────────────────────────────
export interface FlightOffer {
    type: string
    id: string
    source: string
    instantTicketingRequired: boolean
    nonHomogeneous: boolean
    oneWay: boolean
    isUpsellOffer: boolean
    lastTicketingDate: string
    lastTicketingDateTime: string
    numberOfBookableSeats: number
    itineraries: Itinerary[]
    price: Price
    pricingOptions: PricingOptions
    validatingAirlineCodes: string[]
    travelerPricings: TravelerPricing[]
    fareRules?: FareRules
}

export interface Itinerary {
    duration: string
    segments: Segment[]
}

export interface Segment {
    departure: AirportTime
    arrival: AirportTime
    carrierCode: string
    number: string
    aircraft: { code: string }
    operating?: { carrierCode: string }
    duration: string
    id: string
    numberOfStops: number
    blacklistedInEU: boolean
    stops?: Stop[]
}

export interface AirportTime {
    iataCode: string
    terminal?: string
    at: string
}

export interface Stop {
    iataCode: string
    duration: string
    arrivalAt: string
    departureAt: string
}

export interface Price {
    currency: string
    total: string
    base: string
    fees: { amount: string; type: string }[]
    grandTotal: string
    additionalServices?: { amount: string; type: string }[]
}

export interface PricingOptions {
    fareType: string[]
    includedCheckedBagsOnly: boolean
}

export interface TravelerPricing {
    travelerId: string
    fareOption: string
    travelerType: string
    price: { currency: string; total: string; base: string }
    fareDetailsBySegment: FareDetail[]
}

export interface FareDetail {
    segmentId: string
    cabin: string
    fareBasis: string
    class: string
    includedCheckedBags: { quantity?: number; weight?: number; weightUnit?: string }
    includedCabinBags: { quantity?: number; weight?: number; weightUnit?: string }
}

export interface FareRules {
    rules: { category: string; maxPenaltyAmount?: string; notApplicable?: boolean }[]
}

export interface FlightFilter {
    airlines: Record<string, AirlineInfo>
    stops: number[]
    flight_classes: Record<string, string>
    time_from: Record<string, string>
    time_to: Record<string, string>
}

export interface FlightSearchData {
    flight_count: number
    payload: Record<string, unknown>
    recommended: {
        cheapest: FlightOffer
        fastest: FlightOffer
    }
    flights: FlightOffer[]
    filter: FlightFilter
    summary: Record<string, unknown>
}

export interface FlightSearchResponse {
    flight_count: number
    payload: Record<string, unknown>
    recommended: {
        cheapest: FlightOffer
        fastest: FlightOffer
    }
    flights: FlightOffer[]
    filter: FlightFilter
    summary: Record<string, unknown>
    session_code: string
}

export interface FlightSearchParams {
    supplier: string
    from: string
    to: string
    dateFrom: string
    dateTo?: string
    search_type: string
    flight_class: string
    adult_number: number
    child_number: number
    infants_number: number
    session_code?: string
}

export interface FlightBookingData {
    sessionCode: string
    traveller: Passenger[]
}

export interface FlightBookingResponse {
    usercode: string
    booking_code: string
    booking_type: string
    booking_status: string
    date_expiry: string
    id: number
}

export interface FlightMeta {
    count: number
    airlines: Record<string, AirlineInfo>
    recommended: FlightOffer | null
    fastest: FlightOffer | null
}

export interface AirportSearchParams {
    q?: string
}

export interface Itinerary {
    duration: string
    segments: Segment[]
}

export interface FlightPoint {
    iata_code: string
    terminal?: string
    at: string // ISO datetime
}

export interface FlightPrice {
    currency: string
    total: string
    grand_total: string
    base?: string
    fees?: Array<{ amount: string; type: string }>
}

export interface AirportSearchResponse {
    data: Airport[]
}

export interface Airport {
    value: string
    label: string
}

export interface Passenger {
    type?: 'ADULT' | 'CHILD' | 'INFANT'
    firstname: string
    surname: string
    birth_date: string
    passport_issuance_date: string
    passport_expiry_date: string
    passport_nationality: string
    emailaddress?: string // lead passenger only
    phone_number?: string // lead passenger only
}

export interface FlightPaymentMeta {
    type: string
    invoice_code: string
    customer_name: string
}

export interface FlightBookingConfirmation {
    booking_reference: string
    invoice_number: string
    invoice_date: string
    pnr?: string // Amadeus PNR
    ticket_numbers: string[] // one per passenger
    passengers: Passenger[]
    itinerary: Itinerary
    price: FlightPrice
    ngn_total: number
    status: 'confirmed' | 'pending'
    booked_at: string
}
