
export interface VisaSearchData {
    country_destination: string
    country_nationality: string
    adult_number: number
}

export interface VisaSearchResponse {
    session_code: string
}

export interface MetaDataResponse {
    group_memberships: Array<{ value: string, lebel: number }>
    languages: Array<{ value: string, lebel: number }>
    marital_statuses: Array<{ value: string, lebel: number }>
    passport_types: Array<{ value: string, lebel: number }>
    processings: Array<{ value: string, lebel: number }>
    professions: Array<{ value: string, lebel: number }>
    religions: Array<{ value: string, lebel: number }>
    visa_types: Array<{ value: string, lebel: number }>
    visa_countries: Array<{ value: string, lebel: number }>
    visa_gender_types: Array<{ value: string, lebel: number }>
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
}
