import { ApiResponse } from "../types/api";
import { SignUpData, SignUpResponse, VerifyEmailData, ResendVerificationData, VerifyEmailResponse, LoginData, LoginResponse } from "../types/auth";
import { useApi } from "../utils/api";

export function useAuthService() {
    const $api = useApi()

    return {
        async login(params: LoginData): Promise<LoginResponse> {
            const res = await $api<ApiResponse<LoginResponse>>('/login', {
                method: 'POST',
                body: params,
            })
            return res.data
        },

        async signUp(params: SignUpData): Promise<SignUpResponse> {
            const res = await $api<ApiResponse<SignUpResponse>>('/register', {
                method: 'POST',
                body: params,
            })
            return res.data
        },

        async verifyEmail(params: VerifyEmailData): Promise<VerifyEmailResponse> {
            const res = await $api<VerifyEmailResponse>('/check-user', {
                method: 'POST',
                body: params,
            })
            return res
        },

        async resendVerificationEmail(params: ResendVerificationData): Promise<void> {
            await $api<ApiResponse<null>>('/resend-verification', {
                method: 'POST',
                body: params,
            })
        },
    }
}