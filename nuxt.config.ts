import { defineNuxtConfig } from 'nuxt/config'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', '@vueuse/motion/nuxt', 'nuxt-lucide-icons', '@pinia/nuxt'],
  app: {
    head: {
      title: 'Incel Tourism - Luxury Travel & Tour Packages',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { 
          name: 'description', 
          content: 'UAE-licensed Destination Management Company offering luxury travel packages, visas, and tours.' 
        }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },
  css: ['~/assets/css/main.css'],
  vite: {
    define: {
      'process.env.DEBUG': false,
    }
  },
})

