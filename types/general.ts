
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
