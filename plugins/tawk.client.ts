import { defineNuxtPlugin, useRuntimeConfig } from "nuxt/app";

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
    console.error(
      "[tawk] Missing tawkPropertyId or tawkWidgetId — widget not loaded.",
      { propertyId, widgetId },
    );
    return;
  }

  window.Tawk_API = window.Tawk_API || {};
  window.Tawk_LoadStart = new Date();

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://embed.tawk.to/${propertyId}/${widgetId}`;
  script.setAttribute("crossorigin", "*");
  document.head.appendChild(script);
});
