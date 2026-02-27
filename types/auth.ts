export interface LoginData {
    email_address: string
    password: string
}

export interface LoginResponse {
    usercode: string,
    full_names: string,
    email: string,
    mobile_number: string,
    access_level: string,
    token: string,
}

export interface SignUpData {
    full_names: string
    email_address: string
    mobile_number: string
    password: string
    password_confirmation: string
}

export interface SignUpResponse {
    id: number,
    usercode: string,
    full_names: string,
    email_address: string,
    mobile_number: string,
    access_level: string,
    activation_status: boolean,
    registration_date: string,
}

export interface VerifyEmailData {
    email_address: string
    code: string
}

export interface VerifyEmailResponse {
    id: number,
    success: boolean,
}

export interface ResendVerificationData {
    email_address: string
}
