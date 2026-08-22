<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useHotelBookingStore } from "../../stores/useHotelBookingStore";
import { useRoute } from "vue-router";
import { useCurrency } from "../../composables/useCurrency";
import type { SelectedRoom } from "../../stores/useHotelBookingStore";

const emit = defineEmits<(e: "next") => void>();
const route = useRoute();
const store = useHotelBookingStore();
const { format } = useCurrency();

const choosingRoomId = ref<string | null>(null);

async function choose(room: SelectedRoom) {
  choosingRoomId.value = room.rezliveRoomId + room.roomName;
  store.selectRoom(room);

  const ok = await store.runPreBook(room);
  choosingRoomId.value = null;

  if (!ok) return;

  // If the pre-book returned an updated rate, confirm with the user before
  // proceeding. Otherwise continue straight to guest details.
  if (store.rateChange) {
    return;
  }

  emit("next");
}

function acceptUpdatedRate() {
  store.acceptRateChange();
  emit("next");
}

function declineUpdatedRate() {
  store.declineRateChange();
}

const boardColors: Record<string, string> = {
  "Room Only": "bg-slate-100 text-slate-600",
  "Bed & Breakfast": "bg-amber-50 text-amber-700",
  "Half Board": "bg-blue-50 text-blue-700",
  "Full Board": "bg-green-50 text-green-700",
};

function retryFetch() {
  const sessionCode = route.query.sessionCode as string;
  const hotelId = route.query.hotelId as string;

  if (sessionCode && hotelId) {
    store.fetchRooms(sessionCode, hotelId);
  }
}

onMounted(() => {
  const sessionCode = route.query.sessionCode as string;
  const hotelId = route.query.hotelId as string;

  if (sessionCode && hotelId) {
    store.fetchRooms(sessionCode, hotelId);
  }
});
</script>

<template>
  <div class="space-y-4">
    <div
      v-if="store.roomsLoading"
      class="flex flex-col items-center py-20 gap-4"
    >
      <div
        class="w-12 h-12 border-4 border-slate-200 border-t-primary rounded-full animate-spin"
      ></div>
      <p class="text-slate-600 font-medium text-sm">
        Checking room availability…
      </p>
    </div>

    <div
      v-else-if="store.roomsError"
      class="flex flex-col items-center py-16 gap-3 text-center"
    >
      <span class="text-9xl"><SearchX :size="40" /></span>
      <p class="font-semibold text-slate-800">Couldn't load rooms</p>
      <button
        type="button"
        class="mt-2 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold border-none cursor-pointer"
        @click="retryFetch"
      >
        Try Again
      </button>
    </div>

    <template v-else>
      <p class="text-xs text-slate-500">
        {{ store.availableRooms.length }} room option{{
          store.availableRooms.length !== 1 ? "s" : ""
        }}
        available · {{ store.searchParams.totalRooms }} room{{
          store.searchParams.totalRooms !== 1 ? "s" : ""
        }}
        needed · {{ store.nights }} night{{ store.nights !== 1 ? "s" : "" }}
      </p>

      <Transition
        enter-active-class="transition-all duration-200"
        enter-from-class="opacity-0 -translate-y-1"
        enter-to-class="opacity-100 translate-y-0"
      >
        <div
          v-if="store.preBookError"
          class="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl"
        >
          <span class="text-red-500 text-lg leading-none mt-0.5 flex-shrink-0"
            >⚠</span
          >
          <div>
            <p class="text-sm font-semibold text-red-700">Pre-booking failed</p>
            <p class="text-xs text-red-600 mt-0.5">{{ store.preBookError }}</p>
          </div>
        </div>
      </Transition>

      <div
        v-for="room in store.availableRooms"
        :key="room.rezliveRoomId + room.roomName"
        class="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all overflow-hidden"
      >
        <div class="p-5">
          <div
            class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4"
          >
            <div class="flex-1 min-w-0">
              <div class="flex flex-wrap items-center gap-2 mb-2">
                <h3 class="text-base font-bold text-slate-900">
                  {{ room.roomName }}
                </h3>
                <span
                  class="text-xs font-semibold px-2 py-0.5 rounded-full"
                  :class="
                    boardColors[room.boardType] ?? 'bg-slate-100 text-slate-600'
                  "
                >
                  {{ room.boardType }}
                </span>
              </div>

              <div class="flex flex-wrap gap-1.5 mb-3">
                <span
                  v-for="a in room.amenities"
                  :key="a"
                  class="flex items-center gap-1 text-xs text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md"
                >
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#22c55e"
                    stroke-width="2.5"
                  >
                    <polyline points="20,6 9,17 4,12" />
                  </svg>
                  {{ a }}
                </span>
              </div>

              <div class="flex items-center gap-1.5">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  :stroke="
                    room.cancellationPolicy.includes('Non-refundable')
                      ? '#ef4444'
                      : '#16a34a'
                  "
                  stroke-width="2"
                >
                  <path
                    v-if="!room.cancellationPolicy.includes('Non-refundable')"
                    d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                  />
                  <template v-else>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </template>
                </svg>
                <p
                  class="text-xs font-medium"
                  :class="
                    room.cancellationPolicy.includes('Non-refundable')
                      ? 'text-red-600'
                      : 'text-green-700'
                  "
                >
                  {{ room.cancellationPolicy }}
                </p>
              </div>
            </div>

            <div class="sm:text-right sm:min-w-[160px] shrink-0">
              <p class="text-xs text-slate-400 mb-0.5">
                {{ store.searchParams.totalRooms }} room{{
                  store.searchParams.totalRooms > 1 ? "s" : ""
                }}
                × {{ store.nights }} nights
              </p>
              <p class="text-2xl font-bold text-slate-900">
                {{ format(room.totalPrice * store.searchParams.totalRooms) }}
              </p>
              <p class="text-xs text-slate-400 mb-3">excl. taxes</p>
              <button
                type="button"
                class="w-full sm:w-auto px-6 py-2.5 bg-primary hover:opacity-90 active:scale-95 text-white text-sm font-bold rounded-xl border-none cursor-pointer transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                :disabled="
                  choosingRoomId === room.rezliveRoomId + room.roomName &&
                  store.preBookLoading
                "
                @click="choose(room)"
              >
                <template
                  v-if="
                    choosingRoomId === room.rezliveRoomId + room.roomName &&
                    store.preBookLoading
                  "
                >
                  <svg
                    class="animate-spin w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    />
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  Checking…
                </template>
                <template v-else> Select Room </template>
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Rate change confirmation modal -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition-opacity duration-200"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-150"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="store.rateChange"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        >
          <div
            class="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
          >
            <div class="px-6 pt-6 pb-4 text-center">
              <div
                class="mx-auto w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-3"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#d97706"
                  stroke-width="2"
                >
                  <path
                    d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                  />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <h3 class="text-lg font-bold text-slate-900">
                Price has changed
              </h3>
              <p class="text-sm text-slate-500 mt-1">
                The room rate has been updated by the supplier.
              </p>
            </div>

            <div class="px-6 pb-4 space-y-2">
              <div
                class="flex items-center justify-between text-sm bg-slate-50 rounded-xl px-4 py-3"
              >
                <span class="text-slate-500">Previous price</span>
                <span class="font-semibold text-slate-700 line-through">
                  {{ format(store.rateChange.previousRate) }}
                </span>
              </div>
              <div
                class="flex items-center justify-between text-sm bg-amber-50 rounded-xl px-4 py-3"
              >
                <span class="text-amber-700 font-medium">Updated price</span>
                <span class="font-bold text-amber-700">
                  {{ format(store.rateChange.updatedRate) }}
                </span>
              </div>
            </div>

            <div class="px-6 pb-6 flex gap-3">
              <button
                type="button"
                class="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer bg-white"
                @click="declineUpdatedRate"
              >
                Cancel
              </button>
              <button
                type="button"
                class="flex-1 py-2.5 rounded-xl text-sm font-bold bg-primary text-white hover:opacity-90 transition-opacity border-none cursor-pointer"
                @click="acceptUpdatedRate"
              >
                Accept new price
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
