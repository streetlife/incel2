import { defineStore } from "pinia";
import { ref } from "vue";
import type { AddressResponse } from "../types/general";
import { useGeneralService } from "../services/general.service";

const CACHE_KEY = "contact_cache";
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour

interface ContactCache {
  data: AddressResponse[];
  cachedAt: number;
}

export const useContactStore = defineStore("contact", () => {
  const generalService = useGeneralService();

  const contactData = ref<AddressResponse[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const saveToCache = (data: AddressResponse[]) => {
    const cache: ContactCache = { data, cachedAt: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  };

  const clearCache = () => {
    localStorage.removeItem(CACHE_KEY);
    contactData.value = [];
  };

  const fetchContact = async (force = false) => {
    try {
      isLoading.value = true;
      error.value = null;

      const data = await generalService.getAddress();
      contactData.value = data;
      saveToCache(data);
    } catch (err: any) {
      error.value = err?.message ?? "Failed to load contact data";
    } finally {
      isLoading.value = false;
    }
  };

  return {
    contactData,
    isLoading,
    error,
    fetchContact,
    clearCache,
  };
});
