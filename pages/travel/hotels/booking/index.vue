<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useHotelBookingStore } from "../../../../stores/useHotelBookingStore";
import HotelBookingSummary from "../../../../components/hotel/HotelBookingSummary.vue";
import HotelRoomSelect from "../../../../components/hotel/HotelRoomSelect.vue";
import HotelGuestForm from "../../../../components/hotel/HotelGuestForm.vue";
import HotelBookingReview from "../../../../components/hotel/HotelBookingReview.vue";
import HotelPaymentForm from "../../../../components/hotel/HotelPaymentForm.vue";

const route = useRoute();
const router = useRouter();
const store = useHotelBookingStore();

/**
 * Fill empty searchParams and sessionId fields from the URL query string.
 * Called after setHotel() to patch any fields that arrived empty from
 * sessionStorage.  Also runs on page refresh (when bookingFresh is false).
 */
function hydrateFromUrl(query: Record<string, any>) {
  const sp = store.searchParams;

  // Data-driven hydrators — each tuple is [current, urlKey, setter]
  const strFields: [string | undefined, string, (v: any) => void][] = [
    [sp.checkInStart, "checkInStart", (v) => (sp.checkInStart = v)],
    [sp.checkInEnd, "checkInEnd", (v) => (sp.checkInEnd = v)],
    [sp.nationality, "nationality", (v) => (sp.nationality = v)],
    [sp.country, "country", (v) => (sp.country = v)],
    [sp.city, "city", (v) => (sp.city = v)],
  ];

  const numFields: [number | undefined, string, (v: number) => void][] = [
    [sp.totalGuests, "totalGuests", (v) => (sp.totalGuests = v)],
    [sp.totalRooms, "rooms", (v) => (sp.totalRooms = v)],
  ];

  const storeFields: [string, string, (v: string) => void][] = [
    [store.sessionId, "sessionId", (v) => (store.sessionId = v)],
    [store.sessionCode, "sessionCode", (v) => (store.sessionCode = v)],
  ];

  let patched = false;

  for (const [current, key, set] of strFields) {
    if (!current && query[key]) {
      set(query[key] as string);
      patched = true;
    }
  }

  for (const [current, key, set] of numFields) {
    if (!current && query[key]) {
      set(Number(query[key]) || 1);
      patched = true;
    }
  }

  for (const [current, key, set] of storeFields) {
    if (!current && query[key]) {
      set(query[key] as string);
      patched = true;
    }
  }

  if (sp.rooms.length === 0 && query.rooms) {
    const roomCount = Number(query.rooms) || 1;
    sp.rooms = Array.from({ length: roomCount }, (_, i) => ({
      adults: Number(query[`r${i}_adults`]) || 1,
      children: Number(query[`r${i}_children`]) || 0,
      childAges: ((query[`r${i}_child_ages`] as string) || "")
        .split(",")
        .map(Number)
        .filter((n) => !Number.isNaN(n)),
    }));
    patched = true;
  }

  if (patched) {
    console.warn("[booking] Hydrated missing fields from URL query");
  }
}

const STEPS = [
  { id: 1, label: "Rooms" },
  { id: 2, label: "Details" },
  { id: 3, label: "Review" },
  { id: 4, label: "Payment" },
];

function goNext() {
  store.step = Math.min(store.step + 1, 5);
  router.replace({ query: { ...route.query, step: String(store.step) } });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function goBack() {
  if (store.step === 1) {
    router.push("/travel/hotels");
    return;
  }
  store.step = Math.max(store.step - 1, 1);
  router.replace({ query: { ...route.query, step: String(store.step) } });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function restoreFromSessionStorage(raw: string | null, isFresh: boolean) {
  if (raw) {
    if (isFresh) {
      store.contactEmail = "";
      store.contactPhone = "";
      store.errorMessage = "";
      store.preBookError = "";
    }

    try {
      const { hotel, searchParams, sessionCode, sessionId } = JSON.parse(raw);
      store.setHotel(hotel, searchParams, sessionCode, sessionId);
      hydrateFromUrl(route.query);
    } catch {}
  } else if (isFresh) {
    store.reset();
  }
}

const showSidebar = computed(() => store.step < 5);

onMounted(() => {
  const raw = sessionStorage.getItem("selectedHotel");

  const isFresh = sessionStorage.getItem("bookingFresh") === "true";
  if (isFresh) sessionStorage.removeItem("bookingFresh");

  restoreFromSessionStorage(raw, isFresh);

  const sessionCodeFromUrl = route.query.sessionCode as string | undefined;
  if (sessionCodeFromUrl) {
    store.sessionCode = sessionCodeFromUrl;
    sessionStorage.setItem("hotelSessionCode", sessionCodeFromUrl);
  }

  const searchSessionIdFromUrl = route.query.searchSessionId as string | undefined;
  if (searchSessionIdFromUrl) {
    store.sessionId = searchSessionIdFromUrl;
    sessionStorage.setItem("hotelSessionId", searchSessionIdFromUrl);
  }

  if (!raw) {
    hydrateFromUrl(route.query);
  }

  const stepFromUrl = Number(route.query.step);
  if (stepFromUrl >= 1 && stepFromUrl <= 5) {
    store.step = stepFromUrl;
  }

  if (store.step > 1 && !store.selectedRoom && store.step < 5) {
    store.step = 1;
    router.replace({ query: { ...route.query, step: "1" } });
  }

  if (!store.hotel && store.step < 5) {
    router.replace("/travel/hotels");
  }
});
</script>

<template>
  <div class="min-h-screen bg-slate-100 pt-36 pb-16 sm:px-24 px-4">
    <div class="max-w-6xl mx-auto">
      <div class="mb-8">
        <button
          class="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors cursor-pointer bg-transparent border-none p-0 mb-4"
          @click="goBack"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          {{ store.step === 1 ? "Back to results" : "Back" }}
        </button>
        <h1 class="text-2xl md:text-3xl font-bold text-slate-900">
          Complete Your Booking
        </h1>
        <p class="text-slate-500 text-sm mt-1">
          {{ store.hotel?.hotel_name }} · {{ store.searchParams.country }}
        </p>
      </div>

      <div v-if="store.step < 5" class="mb-8">
        <div class="flex items-center gap-0">
          <template v-for="(s, i) in STEPS.slice(0, 4)" :key="s.id">
            <div class="flex flex-col items-center gap-1.5">
              <div
                class="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all border-2"
                :class="
                  store.step === s.id
                    ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30'
                    : store.step > s.id
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'bg-white border-slate-200 text-slate-400'
                "
              >
                <svg
                  v-if="store.step > s.id"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="3"
                >
                  <polyline points="20,6 9,17 4,12" />
                </svg>
                <span v-else>{{ s.id }}</span>
              </div>
              <span
                class="text-xs font-medium hidden sm:block"
                :class="
                  store.step >= s.id ? 'text-slate-700' : 'text-slate-400'
                "
                >{{ s.label }}</span
              >
            </div>
            <div
              v-if="i < 3"
              class="flex-1 h-0.5 mx-2 mb-5 transition-colors"
              :class="store.step > s.id ? 'bg-green-400' : 'bg-slate-200'"
            ></div>
          </template>
        </div>
      </div>

      <div
        :class="
          showSidebar
            ? 'grid gap-6 lg:grid-cols-[1fr_320px]'
            : 'max-w-2xl mx-auto'
        "
      >
        <div class="min-w-0">
          <Transition
            :key="store.step"
            mode="out-in"
            enter-active-class="transition-all duration-200 ease-out"
            enter-from-class="opacity-0 translate-x-4"
            enter-to-class="opacity-100 translate-x-0"
            leave-active-class="transition-all duration-150 ease-in"
            leave-from-class="opacity-100 translate-x-0"
            leave-to-class="opacity-0 -translate-x-4"
          >
            <HotelRoomSelect v-if="store.step === 1" @next="goNext" />
            <HotelGuestForm
              v-else-if="store.step === 2"
              @next="goNext"
              @back="goBack"
            />
            <HotelBookingReview
              v-else-if="store.step === 3"
              @next="goNext"
              @back="goBack"
            />
            <HotelPaymentForm v-else-if="store.step === 4" @back="goBack" />
          </Transition>
        </div>

        <div v-if="showSidebar" class="hidden lg:block">
          <HotelBookingSummary />
        </div>
      </div>
    </div>
  </div>
</template>
