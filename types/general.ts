
export interface ContactUsData {
    name: string
    email: string
    mobile_phone: string
    subject?: string
    message: string
}

export interface ContactUsResponse {
    name: string
    email: string
}

export interface TravelInsuranceData {
    service: string
    booking_code: string
    terms_and_conditions: boolean
    status: string
    request_details: InsuranceData
}

interface InsuranceData {
    name: string
    email: string
    phone: string
    address: string
    occupation: string
    maritalStatus: string
    nextOfKin: string
    nextOfKinPhone: string
    nextOfKinAddress: string
    nextOfKinContact: string
    nextOfKinRelationship: string
    coverStartDate: string
    coverEndDate: string
    destination: string
    passengerStateOfResident: string
    additionalInformation: string
}

export interface TravelInsuranceResponse {
    name: string
    email: string
}

export interface AirpotTransferData {
    service: string
    booking_code: string
    terms_and_conditions: boolean
    status: string
    request_details: AirportTransData
}

interface AirportTransData {
    name: string
    email: string
    phone: string
    numberOfPassenger: number
    pickUpAndDropOff: string
    additionalInformation: string
}

export interface AirpotTransferResponse {
    name: string
    email: string
}

export interface TourGuideData {
    first_name: string
    last_name: string
    email: string
    phone_number: string
    destination: string
    date: string
    duration: string
    group_size: number
    preferred_language: string
    tour_interests: string[]
    additional_information: string
    terms_and_conditions: boolean
    booking_code: string
}

export interface TourGuideResponse {
    name: string
    email: string
}

export interface AirportProtocolData {
    service_type: string
    booking_code: string
    airport_name: string
    flight_number: string
    service_required: ServiceRequiredData
    additional_info: string
    terms_and_conditions: boolean
    airline: string
    number_of_passengers: number
}

interface ServiceRequiredData {
    meet_and_greet: boolean
    fast_track_imgration: boolean
    lounge_access: boolean
    porter_service: boolean
    wheelchair: boolean
    unaccompanied_minor: boolean
}

export interface AirportProtocolResponse {
    name: string
    email: string
}

export interface PackageResponse {
    id: number,
    package_name: string,
    country_code: string,
    description: string,
    inclusions: string,
    exclusions: string,
    terms: string,
    location: string,
    category: string,
    date_from: string,
    date_to: string,
    poster: string,
    status: number,
    picture1: string,
    picture2: string,
    picture3: string,
    picture4: string,
    banner: string
}

export interface HotDealResponse {
    id: number,
    title: string,
    deal_includes: string,
    price: number,
    other_info: string[],
    start_date: string,
    end_date: string,
    is_active: number
}

export interface NewsLetterData {
    email: string
}

export interface NewsLetterResponse {
    email: string,
}

export interface AboutUsResponse {
    banner_title: string,
    banner_description: string,
    banner_image: string,
    company_story: ICompanyStory,
    mission: string,
    core_values: ICoreValues[],
    our_promise: IOurPromise[],
}

interface ICompanyStory {
    story: string
    story_image: string
}

interface ICoreValues {
    title: string
    description: string
}

interface IOurPromise {
    title: string
    description: string
}

export interface HeroSectionResponse {
    title: string,
    description: string,
    video_url: string,
}

export interface StatsResponse {
    destinations: string,
    years_of_experience: string,
    happy_travellers: string,
    statisfaction_rate: string
}

export interface PartnersResponse {
    name: string,
    logo: string,
    type: string, // airline or partner
}
