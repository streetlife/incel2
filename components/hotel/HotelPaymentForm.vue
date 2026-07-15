<script setup lang="ts">
import { ref, computed } from "vue";
import { useHotelBookingStore } from "../../stores/useHotelBookingStore";
import { useHotelService } from "../../services/hotel.service";
import { useCurrency } from "../../composables/useCurrency";

const emit = defineEmits<{ (e: "back"): void }>();
const store = useHotelBookingStore();
const { paystackPayment, flutterwavePayment } = useHotelService();
const { format, formatNumber, currentConfig } = useCurrency();

const currency = computed(() => store.searchParams.currency ?? "NGN");

const gateway = computed<"paystack" | "flutterwave">(() =>
  currentConfig.value.code === "NGN" ? "paystack" : "flutterwave",
);

const GATEWAY_META = {
  paystack: {
    label: "Paystack",
    color: "#00C3F7",
    methods: "Card · Bank · USSD",
    logoLetter: "P",
  },
  flutterwave: {
    label: "Flutterwave",
    color: "#F5A623",
    methods: "Card · Bank · M-Pesa",
    logoLetter: "F",
  },
};

const meta = computed(() => GATEWAY_META[gateway.value]);
const loading = ref(false);
const error = ref("");
const primaryGuest = computed(() => store.guests[0]);

const customerName = computed(() =>
  [
    primaryGuest.value?.title,
    primaryGuest.value?.firstName,
    primaryGuest.value?.lastName,
  ]
    .filter(Boolean)
    .join(" "),
);

const redirectUrl = computed(
  () => `${globalThis.location?.origin ?? ""}/travel/hotels/booking/confirm`,
);

async function handlePay() {
  loading.value = true;
  error.value = "";

  const payload = {
    amount: formatNumber(store.priceBreakdown.total),
    invoice_code: store.invoiceNumber,
    customer_name: customerName.value,
    customer_email: store.contactEmail,
    callback_url: redirectUrl.value,
  };

  try {
    let paymentLink: string;

    if (gateway.value === "paystack") {
      const res = await paystackPayment(payload);
      paymentLink = res.payment_link;
    } else {
      const res = await flutterwavePayment(payload);
      paymentLink = res.payment_link;
    }

    if (!paymentLink)
      throw new Error("No payment link returned. Please try again.");

    globalThis.location.href = paymentLink;
  } catch (e: any) {
    error.value =
      e?.message ?? "Could not connect to payment gateway. Please try again.";
    loading.value = false;
  }
}
</script>

<template>
  <div class="space-y-5">
    <div
      class="bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl px-5 py-5 flex items-center justify-between"
    >
      <div>
        <p class="text-xs text-slate-400 mb-0.5">Amount Due</p>
        <p class="text-2xl font-bold text-white">
          {{ format(store.priceBreakdown.total, currency) }}
        </p>
        <p class="text-xs text-slate-400 mt-0.5">
          incl. 7.5% VAT · {{ store.searchParams.totalRooms }} room{{
            store.searchParams.totalRooms !== 1 ? "s" : ""
          }}
        </p>
      </div>
      <div
        class="flex items-center gap-1.5 bg-green-500/20 border border-green-400/30 rounded-lg px-3 py-1.5"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#4ade80"
          stroke-width="2.5"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        <span class="text-xs font-semibold text-green-300">Secure</span>
      </div>
    </div>

    <div
      class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
    >
      <div class="px-5 py-4 border-b border-slate-100">
        <p class="text-sm font-semibold text-slate-800">Payment Gateway</p>
        <p class="text-xs text-slate-400 mt-0.5">
          Selected automatically based on your currency ({{ currency }})
        </p>
      </div>

      <div class="p-5">
        <div
          class="flex items-center gap-4 p-4 rounded-xl border-2"
          :style="`border-color: ${meta.color}; background: ${meta.color}10`"
        >
          <div
            class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            :style="`background: ${meta.color}`"
          >
            <span class="text-white font-black text-lg">{{
              meta.logoLetter
            }}</span>
          </div>

          <div class="flex-1 min-w-0">
            <p class="font-bold text-slate-800">{{ meta.label }}</p>
            <p class="text-xs text-slate-500 mt-0.5">{{ meta.methods }}</p>
          </div>

          <div
            class="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
            :style="`background: ${meta.color}`"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              stroke-width="3"
            >
              <polyline points="20,6 9,17 4,12" />
            </svg>
          </div>
        </div>
      </div>

      <div class="px-5 pb-5">
        <div
          class="flex items-start gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5"
        >
          <svg
            class="shrink-0 mt-0.5"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#64748b"
            stroke-width="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <p class="text-xs text-slate-500">
            You'll be taken to
            <strong class="text-slate-700">{{ meta.label }}</strong>
            to complete payment securely, then redirected back here. Your
            voucher will be emailed to
            <span class="font-mono font-medium text-slate-600">{{
              store.contactEmail
            }}</span
            >.
          </p>
        </div>
      </div>
    </div>

    <div
      class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
    >
      <div class="px-5 py-3.5 bg-slate-50 border-b border-slate-100">
        <p class="text-sm font-semibold text-slate-800">Order Summary</p>
      </div>
      <div class="px-5 py-4 space-y-2.5">
        <div class="flex justify-between text-sm text-slate-600">
          <span>{{ store.hotel?.hotel_name }}</span>
        </div>
        <div class="flex justify-between text-sm text-slate-600">
          <span>{{ store.selectedRoom?.roomName }}</span>
          <span>{{ format(store.priceBreakdown.baseNgn, currency) }}</span>
        </div>
        <div class="flex justify-between text-sm text-slate-600">
          <span>VAT (7.5%)</span>
          <span>{{ format(store.priceBreakdown.tax, currency) }}</span>
        </div>
        <div
          class="flex justify-between items-center pt-3 border-t border-dashed border-slate-200"
        >
          <span class="font-bold text-slate-900">Total</span>
          <span class="text-lg font-bold text-primary">{{
            format(store.priceBreakdown.total, currency)
          }}</span>
        </div>
      </div>

      <div class="px-5 pb-4 border-t border-slate-100 pt-3.5">
        <p
          class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2"
        >
          Billing To
        </p>
        <p class="text-sm font-medium text-slate-800">{{ customerName }}</p>
        <p class="text-xs text-slate-500 font-mono">{{ store.contactEmail }}</p>
      </div>
    </div>

    <Transition
      enter-active-class="transition-all duration-200"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
    >
      <div
        v-if="error"
        class="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3.5"
      >
        <svg
          class="shrink-0 mt-0.5"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#ef4444"
          stroke-width="2"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <p class="text-sm text-red-700">{{ error }}</p>
      </div>
    </Transition>

    <div class="flex gap-3">
      <button
        class="flex-1 h-14 border-2 border-slate-200 text-slate-700 font-semibold rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer bg-white disabled:opacity-50"
        :disabled="loading"
        @click="emit('back')"
      >
        ← Back
      </button>
      <button
        class="flex-[2] h-14 font-bold rounded-2xl transition-all border-none cursor-pointer shadow-lg flex items-center justify-center gap-2 text-white disabled:opacity-60 disabled:cursor-not-allowed"
        :style="`background: ${meta.color}`"
        :disabled="loading"
        @click="handlePay"
      >
        <template v-if="loading">
          <svg class="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
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
          Redirecting to {{ meta.label }}…
        </template>
        <template v-else>
          Pay {{ format(store.priceBreakdown.total, currency) }} via
          {{ meta.label }}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
          >
            <path
              d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"
            />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </template>
      </button>
    </div>

    <p class="text-center text-xs text-slate-400">
      We never store your card details
    </p>
  </div>
</template>
