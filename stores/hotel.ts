import { defineStore } from "pinia";
import { ref, computed, nextTick } from "vue";
import type {
  HotelResult,
  HotelSearchFilters,
  HotelSearchMeta,
  HotelSearchParams,
} from "../types/hotel";

/**
 * Parse a date string that may be in DD/MM/YYYY (API format)
 * or YYYY-MM-DD (ISO format). Falls back to native Date parsing
 * for any other recognised format.
 */
function parseDate(dateStr: string): Date {
  // DD/MM/YYYY — the format returned by the hotel API
  const slashParts = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashParts) {
    const [, day, month, year] = slashParts;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }
  // YYYY-MM-DD or anything else the browser understands
  return new Date(dateStr);
}

export const useHotelSearchStore = defineStore(
  "hotelSearch",
  () => {
    const results = ref<HotelResult[]>([]);
    const searchMeta = ref<HotelSearchMeta | null>(null);
    const filters = ref<HotelSearchFilters | null>(null);
    const sessionCode = ref<string>("");
    const sessionId = ref<string>("");
    const lastParams = ref<HotelSearchParams | null>(null);
    const hasSearched = ref(false);
    const currentPage = ref(1);
    const sortKey = ref<"price_asc" | "price_desc" | "rating">("price_asc");

    const sortedResults = computed(() => {
      const list = [...results.value];
      if (sortKey.value === "price_asc")
        return list.sort((a, b) => a.price - b.price);
      if (sortKey.value === "price_desc")
        return list.sort((a, b) => b.price - a.price);
      if (sortKey.value === "rating")
        return list.sort((a, b) => b.rating - a.rating);
      return list;
    });

    const nights = computed(() => {
      if (!searchMeta.value) return 1;
      const arrival = parseDate(searchMeta.value.arrival_date);
      const departure = parseDate(searchMeta.value.departure_date);
      const diff = Math.ceil(
        (departure.getTime() - arrival.getTime()) / 86_400_000,
      );
      return diff > 0 ? diff : 1;
    });

    function setResults(
      hotels: HotelResult[],
      meta: HotelSearchMeta,
      searchFilters: HotelSearchFilters,
      code: string,
      searchSessionId: string,
      params: HotelSearchParams,
    ) {
      results.value = hotels;
      searchMeta.value = meta;
      filters.value = searchFilters;
      sessionCode.value = code;
      sessionId.value = searchSessionId;
      lastParams.value = params;
      hasSearched.value = true;
      currentPage.value = 1;
    }

    function setPage(page: number) {
      currentPage.value = page;
    }

    function setSortKey(key: "price_asc" | "price_desc" | "rating") {
      sortKey.value = key;
      currentPage.value = 1;
    }

    function clearResults() {
      results.value = [];
      searchMeta.value = null;
      filters.value = null;
      sessionCode.value = "";
      sessionId.value = "";
      lastParams.value = null;
      hasSearched.value = false;
      currentPage.value = 1;
      sortKey.value = "price_asc";

      // Remove the persisted key so no empty search state lingers in
      // localStorage (the unstorage plugin re-writes state on every mutation,
      // so this must run after that write flushes).
      nextTick(() => {
        if (typeof window !== "undefined") {
          window.localStorage.removeItem("pinia:hotelSearch");
        }
      });
    }

    return {
      results,
      searchMeta,
      filters,
      sessionCode,
      lastParams,
      sessionId,
      hasSearched,
      currentPage,
      sortKey,
      sortedResults,
      nights,
      setResults,
      setPage,
      setSortKey,
      clearResults,
    };
  },

  {
    unstorage: {
      pick: [
        "results",
        "searchMeta",
        "filters",
        "sessionCode",
        "lastParams",
        "sessionId",
        "hasSearched",
        "currentPage",
        "sortKey",
      ],
    },
  },
);
