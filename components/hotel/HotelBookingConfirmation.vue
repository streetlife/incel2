<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useHotelBookingStore } from "../../stores/useHotelBookingStore";
import { useCurrency } from "../../composables/useCurrency";
import { useHotelSearchStore } from "../../stores/hotel";

const router = useRouter();
const store = useHotelBookingStore();
const searchStore = useHotelSearchStore();
const { format } = useCurrency();

const currency = computed(() => store.searchParams.currency ?? "NGN");

const totalGuests = computed(() => {
  const rooms = store.searchParams.rooms ?? [];
  return rooms.reduce((s, r) => s + (r.adults ?? 0) + (r.children ?? 0), 0);
});

const guestLabels = computed(() => {
  let adultCount = 0;
  let childCount = 0;

  return store.guests.map((g) => {
    if (g.type === "adult") {
      adultCount++;
      return `Adult ${adultCount}`;
    }

    childCount++;

    let ageLabel = "";
    if (g.age !== undefined) {
      if (g.age === 0) {
        ageLabel = " (Under 1)";
      } else {
        ageLabel = ` (Age ${g.age})`;
      }
    }

    return `Child ${childCount}${ageLabel}`;
  });
});

function bookAnother() {
  store.reset();
  searchStore.clearResults();
  router.push("/travel/hotels");
}

function handlePrint() {
  globalThis.print();
}
</script>

<template>
  <div class="space-y-6">
    <div
      class="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl px-6 py-8 text-center shadow-xl shadow-green-200"
    >
      <div
        class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4"
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          stroke-width="2.5"
        >
          <polyline points="20,6 9,17 4,12" />
        </svg>
      </div>
      <h2 class="text-2xl font-bold text-white mb-1">Booking Confirmed!</h2>
      <p class="text-green-100 text-sm mb-4">
        Your hotel has been booked successfully.
      </p>
      <div class="inline-block bg-white/20 rounded-xl px-5 py-2">
        <p class="text-xs text-green-100 mb-0.5">Booking Reference</p>
        <p class="text-2xl font-bold text-white font-mono tracking-widest">
          {{ store.bookingReference }}
        </p>
      </div>
    </div>

    <div
      class="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-2xl px-4 py-4"
    >
      <svg
        class="shrink-0 mt-0.5"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#2563eb"
        stroke-width="2"
      >
        <path
          d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
        />
        <polyline points="22,6 12,13 2,6" />
      </svg>
      <div>
        <p class="text-sm font-semibold text-blue-900">Confirmation sent</p>
        <p class="text-sm text-blue-600 mt-0.5">
          Invoice & hotel voucher sent to
          <span class="font-mono font-bold">{{ store.contactEmail }}</span>
        </p>
        <p class="text-xs text-blue-500 mt-1.5">
          Check your spam folder if you don't see it within 5 minutes.
        </p>
      </div>
    </div>

    <div
      class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
    >
      <div class="px-5 py-4 bg-slate-800 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            stroke-width="1.5"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span class="text-white font-bold text-sm">HOTEL VOUCHER</span>
        </div>
        <span class="text-slate-400 text-xs font-mono">{{
          store.invoiceNumber
        }}</span>
      </div>

      <div class="relative h-32 bg-slate-200 overflow-hidden">
        <img
          v-if="store.hotel?.thumbnail"
          :src="store.hotel.thumbnail"
          :alt="store.hotel.hotel_name"
          class="w-full h-full object-cover"
        />
        <div
          class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"
        />
        <div class="absolute bottom-3 left-5 right-5">
          <div class="flex gap-0.5 mb-1">
            <span
              v-for="n in store.hotel?.rating ?? 0"
              :key="`s${n}`"
              class="text-amber-400 text-xs"
              >★</span
            >
          </div>
          <p class="text-white font-bold text-base leading-snug">
            {{ store.hotel?.hotel_name }}
          </p>
          <p class="text-white/70 text-xs">
            {{ store.hotel?.hotel_address || store.searchParams.city }}
          </p>
        </div>
      </div>

      <div class="px-5 py-4 border-b border-slate-100">
        <div class="grid grid-cols-3 gap-4 text-center">
          <div>
            <p class="text-xs text-slate-400 mb-1">Check-in</p>
            <p class="text-sm font-bold text-slate-900">
              {{ store.searchParams.checkInStart }}
            </p>
          </div>
          <div class="flex flex-col items-center justify-center">
            <p class="text-xs text-slate-400 mb-1">Duration</p>
            <div class="flex items-center gap-1">
              <div class="h-px w-5 bg-slate-300" />
              <p class="text-xs font-bold text-slate-600 whitespace-nowrap">
                {{ store.nights }}n
              </p>
              <div class="h-px w-5 bg-slate-300" />
            </div>
          </div>
          <div>
            <p class="text-xs text-slate-400 mb-1">Check-out</p>
            <p class="text-sm font-bold text-slate-900">
              {{ store.searchParams.checkInEnd }}
            </p>
          </div>
        </div>
      </div>

      <div class="px-5 py-4 border-b border-slate-100 space-y-2.5">
        <p
          class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2"
        >
          Room Details
        </p>
        <div class="flex justify-between text-sm">
          <span class="text-slate-500">Room type</span>
          <span class="font-medium text-slate-800">{{
            store.selectedRoom?.roomName
          }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-slate-500">Board</span>
          <span class="font-medium text-slate-800">{{
            store.selectedRoom?.boardType
          }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-slate-500">Rooms</span>
          <span class="font-medium text-slate-800">{{
            store.searchParams.totalRooms
          }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-slate-500">Guests</span>
          <span class="font-medium text-slate-800">{{ totalGuests }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-slate-500">Cancellation</span>
          <span
            class="font-medium text-sm"
            :class="
              store.selectedRoom?.cancellationPolicy.includes('Non-refundable')
                ? 'text-red-600'
                : 'text-green-700'
            "
          >
            {{ store.selectedRoom?.cancellationPolicy }}
          </span>
        </div>
      </div>

      <div class="px-5 py-4 border-b border-slate-100">
        <p
          class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3"
        >
          Guests
        </p>
        <div class="space-y-2.5">
          <div
            v-for="(g, i) in store.guests"
            :key="i"
            class="flex items-center justify-between"
          >
            <div class="flex items-center gap-2.5">
              <div
                class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                :class="g.type === 'child' ? 'bg-amber-500' : 'bg-primary'"
              >
                {{ i + 1 }}
              </div>
              <p class="text-sm text-slate-700">
                {{ g.title }} {{ g.firstName }} {{ g.lastName }}
              </p>
            </div>
            <span
              class="text-xs px-2 py-0.5 rounded-md"
              :class="
                g.type === 'child'
                  ? 'bg-amber-50 text-amber-700'
                  : 'bg-slate-100 text-slate-500'
              "
            >
              {{ guestLabels[i] }}
            </span>
          </div>
        </div>
      </div>

      <div class="flex items-center px-5 relative">
        <div
          class="w-5 h-5 rounded-full bg-slate-100 -ml-9 border border-slate-200"
        />
        <div class="flex-1 border-t-2 border-dashed border-slate-200 mx-2" />
        <div
          class="w-5 h-5 rounded-full bg-slate-100 -mr-9 border border-slate-200"
        />
      </div>

      <div class="px-5 py-4 bg-slate-50 flex items-center justify-between">
        <div>
          <p class="text-xs text-slate-400">Total Paid</p>
          <p class="text-xl font-bold text-slate-900">
            {{ format(store.priceBreakdown.total, currency) }}
          </p>
          <p class="text-[10px] text-slate-400 mt-0.5">
            incl. VAT · {{ currency }}
          </p>
        </div>
        <div
          class="flex items-center gap-1.5 bg-green-100 border border-green-200 rounded-lg px-3 py-1.5"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#16a34a"
            stroke-width="2.5"
          >
            <polyline points="20,6 9,17 4,12" />
          </svg>
          <span class="text-xs font-bold text-green-700">PAID</span>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-3">
      <a
        v-if="store.voucherUrl && store.voucherUrl !== '#'"
        :href="store.voucherUrl"
        target="_blank"
        class="h-12 border-2 border-slate-200 text-slate-700 font-semibold rounded-2xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 text-sm no-underline"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Download Voucher
      </a>

      <button
        class="h-12 border-2 border-slate-200 text-slate-700 font-semibold rounded-2xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 text-sm cursor-pointer bg-white"
        @click="handlePrint"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <polyline points="6 9 6 2 18 2 18 9" />
          <path
            d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"
          />
          <rect x="6" y="14" width="12" height="8" />
        </svg>
        Print
      </button>

      <button
        class="col-span-2 h-12 bg-primary hover:opacity-90 text-white font-semibold rounded-2xl transition-all border-none cursor-pointer flex items-center justify-center gap-2 text-sm"
        @click="bookAnother"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        </svg>
        Book Another Hotel
      </button>
    </div>
  </div>
</template>
