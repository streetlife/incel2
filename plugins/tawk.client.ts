import { defineNuxtPlugin, useHead, useRuntimeConfig } from "nuxt/app";

declare global {
  interface Window {
    Tawk_API: Record<string, unknown>;
    Tawk_LoadStart: Date;
  }
}

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();

  const propertyId = config.public.tawkPropertyId;
  const widgetId = config.public.tawkWidgetId;

  if (!propertyId || !widgetId) {
    console.warn("[tawk] Missing config, widget not loaded.");
    return;
  }

  window.Tawk_API = window.Tawk_API || {};
  window.Tawk_LoadStart = new Date();

  useHead({
    script: [
      {
        src: `https://embed.tawk.to/${propertyId}/${widgetId}`,
        async: true,
        crossorigin: "anonymous",
      },
    ],
  });
});
