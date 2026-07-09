import { defineNuxtPlugin, useRuntimeConfig } from "nuxt/app";

declare global {
  interface Window {
    Tawk_API: Record<string, unknown>;
    Tawk_LoadStart: Date;
  }
}

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();

  window.Tawk_API = window.Tawk_API || {};
  window.Tawk_LoadStart = new Date();

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://embed.tawk.to/${config.public.tawkPropertyId}/${config.public.tawkWidgetId}`;
  script.setAttribute("crossorigin", "*");
  document.head.appendChild(script);
});
