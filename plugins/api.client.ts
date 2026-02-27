import { defineNuxtPlugin } from 'nuxt/app'
import { initialiseCsrf } from '../utils/api'

export default defineNuxtPlugin(async () => {
  // Initialise Sanctum CSRF cookie on every page load.
  // This is fast (no body, just a Set-Cookie response).
  // Subsequent API calls will automatically include the cookie.
  //await initialiseCsrf()
})
