import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthService } from '../services/auth.service'
import { LoginResponse, SignUpResponse, VerifyEmailResponse } from '../types/auth'

export interface AuthUser {
  id?: string
  full_names: string
  email: string
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

    const isLoggedIn = computed((): boolean => !!token.value)
    const isAgent = computed((): boolean => user.value?.role === 'agent')
    const isAdmin = computed((): boolean => user.value?.role === 'admin')
    const displayName = computed((): string =>
      user.value ? `${user.value.full_names}` : ''
    )
    const initials = computed((): string =>
      user.value ? `${user.value.full_names[0]}`.toUpperCase() : ''
    )

    const isHydrated = ref(false)

    async function login(email: string, password: string): Promise<LoginResponse> {
      try {
        const response = await authService.login({
          email_address: email,
          password: password,
        })

        if (!response?.token) {
          throw new Error('Invalid login response')
        }

        token.value = response.token

        const res = await getProfile()

        user.value = {
          full_names: res.full_names,
          email: res.email_address,
          usercode: res.usercode,
          mobile_number: res.mobile_number,
        }

        return response
      } catch (err: any) {
        throw err
      }
    }

    async function register(data: {
      full_names: string
      email: string
      mobile_number: string
      password: string
      password_confirmation: string
    }): Promise<SignUpResponse> {

      try {
        return await authService.signUp({
          full_names: data.full_names,
          email_address: data.email,
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

    async function updateProfile(data: { full_names: string, email_address: string, mobile_number: string }): Promise<boolean> {
      loading.value = true
      error.value = ''

      try {
        const response = await authService.updateProfile(data)

        if (!response.id) {
          throw new Error('There was an error updating')
        }

        const res = await getProfile()

        user.value = {
          full_names: res.full_names,
          email: res.email_address,
          usercode: res.usercode,
          mobile_number: res.mobile_number,
        }

        return true
      } finally {
        loading.value = false
      }
    }

    async function changePassword(
      data: { old_password: string, new_password: string, new_password_confirmation: string }
    ): Promise<boolean> {
      loading.value = true
      error.value = ''

      try {
        await authService.changePassword(data)
        return true
      } catch (e: any) {
        throw new Error(e)
      } finally {
        loading.value = false
      }
    }

    async function getProfile() {
      return await authService.getProfile()
    }

    async function init() {
      if (token.value && !user.value) {
        try {
          const res = await authService.getProfile()

          user.value = {
            full_names: res.full_names,
            email: res.email_address,
            usercode: res.usercode,
            mobile_number: res.mobile_number,
          }
        } catch {
          logout()
        }
      }
    }

    async function logout() {
      try {
        await authService.logout()
        user.value = null
        token.value = ''
      } catch (e: any) {
        throw e
      }
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
      isHydrated,
      login,
      register,
      verifyEmail,
      forgotPassword,
      updateProfile,
      changePassword,
      logout,
      getProfile,
      init,
    }
  },
  {
    unstorage: {
      pick: ['user', 'token'],
    },
  }
)