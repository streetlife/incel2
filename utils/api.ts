import { $fetch, type FetchOptions } from 'ofetch'
import type { ApiError } from '../types/api'
import { useRuntimeConfig } from 'nuxt/app'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

interface BackendErrorBody {
  status: false
  message: string
  errors?: Record<string, string[]>
}

export class AppApiError extends Error {
  userMessage: string
  status: number
  fieldErrors: Record<string, string[]>

  constructor(body: string | ApiError, status = 0) {
    const message = typeof body === 'string' ? body : body.message
    super(message)
    this.name = ''
    this.userMessage = message
    this.status = typeof body === 'string' ? status : (body.status ?? status)
    this.fieldErrors = typeof body === 'string' ? {} : (body.errors ?? {})
  }
}

export function parseApiError(err: unknown): AppApiError {
  if (err instanceof AppApiError) return err

  const body: unknown =
    (err as any)?.data ??
    (err as any)?.response?.data ??
    (err as any)?.body ??
    null

  const status: number = (err as any)?.status ?? (err as any)?.response?.status ?? 0

  if (body && typeof body === 'object') {
    const b = body as Partial<ApiError>
    const fieldMessages = Object.values(b.errors ?? {}).flat()
    const message = fieldMessages[0] ?? b.message ?? 'Something went wrong. Please try again.'
    return new AppApiError({ message, status, errors: b.errors }, status)
  }

  const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
  return new AppApiError({ message, status }, status)
}

export function useApi() {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()
  const router = useRouter()

  const instance = $fetch.create({
    baseURL: config.public.apiBase + '/api',
    credentials: 'include',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
    onRequest({ options }) {
      const headers =
        options.headers instanceof Headers
          ? options.headers
          : new Headers(options.headers)

      if (authStore.token) {
        headers.set('Authorization', `Bearer ${authStore.token}`)
      }

      options.headers = headers

      if (import.meta.dev) {
        console.log(
          `[API] → ${options.method ?? 'GET'} ${options.baseURL}${(options as any).url ?? ''}`
        )
      }
    },
    async onResponseError({ response }) {
      const status = response.status
      const data = response._data

      const isServerError = status >= 500

      const body: ApiError = {
        message: isServerError
          ? 'An unexpected error occurred. Please try again later.'
          : Object.values(data?.errors ?? {}).flat()[0] ||
          data?.message ||
          'An unexpected error occurred.',
        status,
        errors: isServerError ? undefined : data?.errors,
      }

      if (import.meta.dev) {
        console.error(`[API] ✗ ${status}`, body)
      }

      if (status === 401) {
        authStore.logout()
        await router.push({ path: '/auth/login', query: { redirect: router.currentRoute.value.fullPath } })
        throw new AppApiError({ message: 'Your session has expired. Please log in again.', status }, 401)
      }

      if (status === 419) {
        throw new AppApiError({ message: 'Security token expired. Please try again.', status }, 419)
      }

      throw new AppApiError(body, status)
    },
  } satisfies FetchOptions)

  return instance
}

export function normaliseError(err: unknown): string {
  if (err instanceof AppApiError) return err.userMessage
  if (err instanceof Error) return err.message
  return 'Something went wrong. Please try again.'
}
