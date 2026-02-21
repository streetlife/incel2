import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// ── Types
export interface AuthUser {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  avatar: string
  role: 'user' | 'agent' | 'admin'
  agencyName?: string
  createdAt: string
}

// ── Store
export const useAuthStore = defineStore(
  'auth',
  () => {
    // ── State (refs)
    const user = ref<AuthUser | null>(null)
    const token = ref<string>('')
    const loading = ref<boolean>(false)
    const error = ref<string>('')

    // ── Getters (computed)
    const isLoggedIn = computed((): boolean => !!token.value && !!user.value)
    const isAgent = computed((): boolean => user.value?.role === 'agent')
    const isAdmin = computed((): boolean => user.value?.role === 'admin')
    const displayName = computed((): string => 
      user.value ? `${user.value.firstName} ${user.value.lastName}` : ''
    )
    const initials = computed((): string => 
      user.value ? `${user.value.firstName[0]}${user.value.lastName[0]}`.toUpperCase() : ''
    )

    // ── Actions
    async function login(email: string, password: string): Promise<boolean> {
      loading.value = true
      error.value = ''
      
      try {
        await new Promise(r => setTimeout(r, 900))

        if (email && password.length >= 6) {
          user.value = {
            id: 'USR-001',
            firstName: 'Adaeze',
            lastName: 'Okafor',
            email,
            phone: '+234 802 000 0001',
            avatar: '',
            role: 'user',
            createdAt: '2024-01-15',
          }
          token.value = 'mock-jwt-' + Date.now()
          return true
        }

        error.value = 'Invalid email or password.'
        return false
      } finally {
        loading.value = false
      }
    }

    async function register(data: {
      firstName: string
      lastName: string
      email: string
      phone: string
      password: string
      role?: string
      agencyName?: string
    }): Promise<boolean> {
      loading.value = true
      error.value = ''
      
      try {
        await new Promise(r => setTimeout(r, 1000))

        if (data.email && data.password.length >= 6) {
          user.value = {
            id: 'USR-' + Date.now().toString(36).toUpperCase(),
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            avatar: '',
            role: (data.role as AuthUser['role']) || 'user',
            agencyName: data.agencyName,
            createdAt: new Date().toISOString(),
          }
          token.value = 'mock-jwt-' + Date.now()
          return true
        }

        error.value = 'Registration failed. Please try again.'
        return false
      } finally {
        loading.value = false
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

    // ── Return everything the store exposes
    return {
      // State
      user,
      token,
      loading,
      error,
      // Getters
      isLoggedIn,
      isAgent,
      isAdmin,
      displayName,
      initials,
      // Actions
      login,
      register,
      forgotPassword,
      updateProfile,
      changePassword,
      logout
    }
  },
  {
    // ── Unstorage Persistence
    unstorage: {
      pick: ['user', 'token'],
    },
  }
)