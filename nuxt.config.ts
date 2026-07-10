import { defineNuxtConfig } from "nuxt/config";

console.log("Tawk envs:", {
  property: process.env.NUXT_PUBLIC_TAWK_PROPERTY_ID,
  widget: process.env.NUXT_PUBLIC_TAWK_WIDGET_ID,
});

export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },
  modules: [
    "@nuxtjs/tailwindcss",
    "@vueuse/motion/nuxt",
    "nuxt-lucide-icons",
    "@pinia/nuxt",
    "nuxt-lodash",
  ],
  app: {
    head: {
      title: "Incel Tourism - Luxury Travel & Tour Packages",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content:
            "UAE-licensed Destination Management Company offering luxury travel packages, visas, and tours.",
        },
      ],
      link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
    },
  },
  css: ["~/assets/css/main.css"],
  vite: {
    define: {
      "process.env.DEBUG": false,
    },
  },
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000",
      hotel: process.env.HOTEL_API_KEY ?? "",
      tawkPropertyId: process.env.NUXT_PUBLIC_TAWK_PROPERTY_ID ?? "",
      tawkWidgetId: process.env.NUXT_PUBLIC_TAWK_WIDGET_ID ?? "",
    },
  },
});
