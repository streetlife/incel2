import { ApiResponse } from "../types/api";
import { SignUpData, SignUpResponse, VerifyEmailData, ResendVerificationData, VerifyEmailResponse, LoginData, LoginResponse, UserProfileResponse, UpdateProfileData, ChangePasswordData } from "../types/auth";
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

        async getProfile(): Promise<UserProfileResponse> {
            const res = await $api<ApiResponse<UserProfileResponse>>('/users/user-profile', {
                method: 'GET'
            })

            return res.data
        },

        async updateProfile(data: UpdateProfileData): Promise<UserProfileResponse> {
            const res = await $api<ApiResponse<UserProfileResponse>>('/users/user-profile', {
                method: 'PATCH',
                body: data
            })

            return res.data
        },

        async changePassword(params: ChangePasswordData): Promise<void> {
            await $api<ApiResponse<null>>('/changePassword', {
                method: 'POST',
                body: params,
            })
        },

        async logout(): Promise<void> {
            await $api<ApiResponse<null>>('/logout', {
                method: 'POST',
            })
        },
    }
}