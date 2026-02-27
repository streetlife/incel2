import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthService } from '../services/auth.service'
import { LoginResponse, SignUpResponse, VerifyEmailResponse } from '../types/auth'

export interface AuthUser {
  id?: string
  full_names: string
  email_address: string
  mobile_number?: string
  usercode?: string
  role?: 'CUSTOMER' | 'agent' | 'admin'
  createdAt?: string
}

export const useAuthStore = defineStore(
  'auth',
  () => {
    const user = ref<AuthUser | null>(null)
    const token = ref<string>('')
    const loading = ref<boolean>(false)
    const error = ref<string>('')
    const authService = useAuthService()

    const isLoggedIn = computed((): boolean => !!token.value && !!user.value)
    const isAgent = computed((): boolean => user.value?.role === 'agent')
    const isAdmin = computed((): boolean => user.value?.role === 'admin')
    const displayName = computed((): string =>
      user.value ? `${user.value.full_names}` : ''
    )
    const initials = computed((): string =>
      user.value ? `${user.value.full_names[0]}`.toUpperCase() : ''
    )

    async function login(email: string, password: string): Promise<LoginResponse> {
      try {
        const response = await authService.login({
          email_address: email,
          password: password,
        })

        if (response) {
          user.value = {
            full_names: response.full_names,
            email_address: response.email,
            usercode: response.usercode
          }
          token.value = response.token
        }

        return response
      } catch (err: any) {
        throw new Error(err)
      }
    }

    async function register(data: {
      full_names: string
      email_address: string
      mobile_number: string
      password: string
      password_confirmation: string
    }): Promise<SignUpResponse> {

      try {
        return await authService.signUp({
          full_names: data.full_names,
          email_address: data.email_address,
          mobile_number: data.mobile_number,
          password: data.password,
          password_confirmation: data.password_confirmation
        })
      } catch (err: any) {
        throw new Error(err)
      }
    }

    async function verifyEmail(email: string, code: string): Promise<VerifyEmailResponse> {
      try {
        return await authService.verifyEmail({
          email_address: email,
          code: code,
        })
      } catch (err: any) {
        throw new Error(err)
      }
    }

    async function forgotPassword(email: string): Promise<boolean> {
      loading.value = true
      error.value = ''

      try {
        await new Promise(r => setTimeout(r, 800))
        return !!email
      } finally {
        loading.value = false
      }
    }

    async function updateProfile(data: Partial<AuthUser>): Promise<boolean> {
      loading.value = true
      error.value = ''

      try {
        await new Promise(r => setTimeout(r, 700))
        if (user.value) Object.assign(user.value, data)
        return true
      } finally {
        loading.value = false
      }
    }

    async function changePassword(_old: string, _new: string): Promise<boolean> {
      loading.value = true
      error.value = ''

      try {
        await new Promise(r => setTimeout(r, 700))
        return true
      } finally {
        loading.value = false
      }
    }

    function logout() {
      user.value = null
      token.value = ''
    }

    return {
      user,
      token,
      loading,
      error,
      isLoggedIn,
      isAgent,
      isAdmin,
      displayName,
      initials,
      login,
      register,
      verifyEmail,
      forgotPassword,
      updateProfile,
      changePassword,
      logout
    }
  },
  {
    unstorage: {
      pick: ['user', 'token'],
    },
  }
)