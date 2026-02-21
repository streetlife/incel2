import { defineNuxtRouteMiddleware, navigateTo } from 'nuxt/app'
import { useAuthStore } from '../stores/auth'

export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return navigateTo('/auth/login')
  }

  if (to.meta.guest && auth.isLoggedIn) {
    return navigateTo('/dashboard')
  }
})
