export interface RawOption {
    lebel: number
    label: number
    value: string
    code: string
}

export interface MetaDataResponse {
    group_memberships: RawOption[]
    languages: RawOption[]
    marital_statuses: RawOption[]
    passport_types: RawOption[]
    processings: RawOption[]
    professions: RawOption[]
    religions: RawOption[]
    visa_types: RawOption[]
    visa_countries: RawOption[]
    visa_gender_types: RawOption[]
}

export interface VisaSearchData {
    country_destination: string
    country_nationality: string
    adult_number: number
}

export interface VisaSearchResponse {
    session_code: string
}

export interface SearchResultResponse {
    id: number
    session_code: string
    session_date: string
    country_destination: string
    country_nationality: string
    visa_name: string
    price: number
    country: string
    currency_code: string
    adults: number
}

export interface SelectOption {
    value: string
    label: string
    code: string
}

export interface NormalisedMetaData {
    group_memberships: SelectOption[]
    languages: SelectOption[]
    marital_statuses: SelectOption[]
    passport_types: SelectOption[]
    processings: SelectOption[]
    professions: SelectOption[]
    religions: SelectOption[]
    visa_types: SelectOption[]
    visa_countries: SelectOption[]
    visa_gender_types: SelectOption[]
}

export interface CountryResponse {
    id: number
    country: string
    iso_code: string
    visa: string
    description: string
}

export interface BookingCodeResponse {
    booking_code: string
    booking_type: string
    booking_status: string
}

export interface CreateVisaData {
    booking_code: string
    lastname: string
    firstname: string
    othernames: string
    passport_expiry_date: string
    passport_country: string
    passport_number: string
    passport_issuance_date: string
    email_address: string
    birth_date: string
    passport_data_page: File
    passport_photo: File
    nationality_id: number
    gender: number
    group_membership_id: number
    marital_status_id: number
    profession_id: number
    language_id: number
    religion_id: number
}

export interface CreateVisaResponse {
    status: boolean
}

export interface InitializePaymentData {
    amount: number
    currency: string
    booking_code: string
    customer_name: string
    customer_email: string
    callback_url: string
    payment_type: string
}

export interface InitializePaymentResponse {
    link: string
}
