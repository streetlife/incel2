// ~/plugins/pinia-unstorage.client.ts
import { defineNuxtPlugin } from 'nuxt/app'
import { createPiniaUnstorage } from 'pinia-plugin-unstorage'
import { Pinia } from 'pinia'

export default defineNuxtPlugin((nuxtApp) => {
  const options = nuxtApp.$config?.public?.piniaUnstorage ?? {}
  const pinia = nuxtApp.$pinia as Pinia
  pinia.use(createPiniaUnstorage(options))
})
