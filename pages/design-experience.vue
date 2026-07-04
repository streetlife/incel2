<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useGeneralService } from "../services/general.service";
import { useRoute } from "vue-router";
import { useHead } from "nuxt/app";
import { DesignExperienceData } from "../types/general";
import { useToast } from "../composables/useToast";
import AppToast from "../components/toast/AppToast.vue";
import { normaliseError } from "../utils/api";

useHead({ title: "Design My Experience" });

const route = useRoute();
const generalService = useGeneralService();

const submitting = ref(false);
const showSuccess = ref(false);
const error = ref("");

const toast = useToast();

const hotelCategories = [
  { value: "", label: "No preference" },
  { value: "3", label: "3★ Standard" },
  { value: "4", label: "4★ Deluxe" },
  { value: "5", label: "5★ Luxury" },
];

type ToggleKey = "flight_booking" | "airport_transfer" | "tour_and_activities";

const serviceToggles: { key: ToggleKey; label: string; desc: string }[] = [
  {
    key: "flight_booking",
    label: "Flight Booking",
    desc: "Include flight booking in this quote",
  },
  {
    key: "airport_transfer",
    label: "Airport Transfer",
    desc: "Pickup & drop-off at the airport",
  },
  {
    key: "tour_and_activities",
    label: "Tours & Activities",
    desc: "Guided tours and experiences",
  },
];

function toQueryString(value: unknown): string {
  if (Array.isArray(value)) return typeof value[0] === "string" ? value[0] : "";
  return typeof value === "string" ? value : "";
}

const form = ref({
  country: toQueryString(route.query.country),
  number_of_adults: 2,
  number_of_kids: 0,
  kids_ages: [],
  hotel_category: "",
  flight_booking: false,
  airport_transfer: false,
  tour_and_activities: false,
  special_request: "",
  full_name: "",
  email_address: "",
  phone_number: "",
} as DesignExperienceData);

watch(
  () => form.value.number_of_kids,
  (count) => {
    const arr = form.value.kids_ages;
    if (count > arr.length) {
      for (let i = arr.length; i < count; i++) arr.push(null);
    } else if (count < arr.length) {
      form.value.kids_ages = arr.slice(0, count);
    }
  },
);

const canSubmit = computed(
  () =>
    form.value.country.trim() &&
    form.value.number_of_adults >= 1 &&
    form.value.full_name.trim() &&
    form.value.email_address.trim() &&
    form.value.phone_number.trim(),
);

async function submitForm() {
  if (!canSubmit.value) return;
  submitting.value = true;
  error.value = "";

  try {
    await generalService.saveDesignExperience({
      country: form.value.country,
      number_of_adults: form.value.number_of_adults,
      number_of_kids: form.value.number_of_kids,
      kids_ages: form.value.kids_ages,
      hotel_category: form.value.hotel_category,
      tour_and_activities: form.value.tour_and_activities,
      airport_transfer: form.value.airport_transfer,
      flight_booking: form.value.flight_booking,
      special_request: form.value.special_request,
      full_name: form.value.full_name,
      email_address: form.value.email_address,
      phone_number: form.value.phone_number,
    });

    toast.success("Request sent successfully!");
    form.value = {
      country: "",
      number_of_adults: 2,
      number_of_kids: 0,
      kids_ages: [],
      hotel_category: "",
      flight_booking: false,
      airport_transfer: false,
      tour_and_activities: false,
      special_request: "",
      full_name: "",
      email_address: "",
      phone_number: "",
    };
  } catch (err) {
    console.error(err);
    error.value = normaliseError(err);
    toast.error(error.value);
    return;
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <AppToast />
  <section class="py-44 sm:py-44 bg-white px-4 sm:px-24">
    <div class="container mx-auto px-4 max-w-2xl">
      <div class="mb-10">
        <p
          class="text-primary font-semibold mb-3 uppercase tracking-widest text-xs"
        >
          Design My Experience
        </p>
        <h1
          class="text-3xl sm:text-4xl font-bold text-neutral-900 leading-tight mb-3"
        >
          Tell us what your trip should look like
        </h1>
        <p class="text-neutral-500 font-light">
          Fill in the details below and our team will send you a tailored quote.
        </p>
      </div>

      <div class="space-y-8">
        <div>
          <label
            class="block text-xs font-semibold text-gray-600 mb-1.5"
            id="destination"
            >Country / City *</label
          >
          <input
            v-model="form.country"
            type="text"
            placeholder="e.g. Dubai, UAE"
            class="input-field"
            aria-labelledby="destination"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-gray-600 mb-1.5"
              >Number of Adults *</label
            >
            <div
              class="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50"
            >
              <button
                @click="
                  form.number_of_adults = Math.max(1, form.number_of_adults - 1)
                "
                class="px-4 py-3 text-gray-500 hover:bg-gray-100 font-bold text-lg transition-colors"
              >
                −
              </button>
              <span
                class="flex-1 text-center font-bold text-gray-900 text-sm"
                >{{ form.number_of_adults }}</span
              >
              <button
                @click="
                  form.number_of_adults = Math.min(
                    20,
                    form.number_of_adults + 1,
                  )
                "
                class="px-4 py-3 text-gray-500 hover:bg-gray-100 font-bold text-lg transition-colors"
              >
                +
              </button>
            </div>
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-600 mb-1.5"
              >Number of Kids</label
            >
            <div
              class="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50"
            >
              <button
                @click="
                  form.number_of_kids = Math.max(0, form.number_of_kids - 1)
                "
                class="px-4 py-3 text-gray-500 hover:bg-gray-100 font-bold text-lg transition-colors"
              >
                −
              </button>
              <span
                class="flex-1 text-center font-bold text-gray-900 text-sm"
                >{{ form.number_of_kids }}</span
              >
              <button
                @click="
                  form.number_of_kids = Math.min(10, form.number_of_kids + 1)
                "
                class="px-4 py-3 text-gray-500 hover:bg-gray-100 font-bold text-lg transition-colors"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div v-if="form.number_of_kids > 0">
          <label class="block text-xs font-semibold text-gray-600 mb-2"
            >Ages of Kids</label
          >
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div v-for="(age, idx) in form.kids_ages" :key="idx">
              <label
                class="block text-[11px] text-gray-400 mb-1"
                :id="`child-age-${idx}`"
                >Child {{ idx + 1 }}</label
              >
              <input
                v-model.number="form.kids_ages[idx]"
                type="number"
                min="0"
                max="17"
                placeholder="Age"
                class="input-field"
                :id="`child-age-${idx}`"
              />
            </div>
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-600 mb-2"
            >Hotel Category</label
          >
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              v-for="cat in hotelCategories"
              :key="cat.value"
              @click="form.hotel_category = cat.value"
              class="py-3 px-2 rounded-xl border-2 text-center text-xs font-semibold transition-all duration-200"
              :class="
                form.hotel_category === cat.value
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300'
              "
            >
              {{ cat.label }}
            </button>
          </div>
        </div>

        <div class="space-y-3">
          <label class="block text-xs font-semibold text-gray-600 mb-1"
            >What should we include?</label
          >
          <div
            v-for="toggle in serviceToggles"
            :key="toggle.key"
            class="flex items-center justify-between gap-4 p-4 rounded-xl border-2 border-gray-200"
          >
            <div>
              <p class="text-sm font-semibold text-gray-800">
                {{ toggle.label }}
              </p>
              <p class="text-xs text-gray-400">{{ toggle.desc }}</p>
            </div>
            <div class="flex gap-2 shrink-0">
              <button
                @click="form[toggle.key] = true"
                class="px-4 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all"
                :class="
                  form[toggle.key]
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-gray-200 text-gray-400'
                "
              >
                Yes
              </button>
              <button
                @click="form[toggle.key] = false"
                class="px-4 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all"
                :class="
                  !form[toggle.key]
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-gray-200 text-gray-400'
                "
              >
                No
              </button>
            </div>
          </div>
        </div>

        <div>
          <label
            class="block text-xs font-semibold text-gray-600 mb-1.5"
            for="special-request"
            >Any Special Request</label
          >
          <textarea
            v-model="form.special_request"
            rows="3"
            placeholder="Dietary needs, accessibility, celebration, etc…"
            class="input-field resize-none"
            id="special-request"
          ></textarea>
        </div>

        <!-- Contact -->
        <div class="border-t border-gray-100 pt-6 space-y-4">
          <p
            class="text-xs font-semibold text-gray-600 uppercase tracking-widest"
          >
            Your Contact Details
          </p>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label
                class="block text-xs font-semibold text-gray-600 mb-1.5"
                for="full-name"
                >Full Name <span class="text-red-500">*</span></label
              >
              <input
                v-model="form.full_name"
                type="text"
                placeholder="John Doe"
                class="input-field"
                id="full-name"
              />
            </div>
            <div>
              <label
                class="block text-xs font-semibold text-gray-600 mb-1.5"
                for="phone"
                >Phone Number <span class="text-red-500">*</span></label
              >
              <input
                v-model="form.phone_number"
                type="tel"
                placeholder="+234 800 000 0000"
                class="input-field"
                id="phone"
              />
            </div>
          </div>
          <div>
            <label
              class="block text-xs font-semibold text-gray-600 mb-1.5"
              for="email"
              >Email Address <span class="text-red-500">*</span></label
            >
            <input
              v-model="form.email_address"
              type="email"
              placeholder="you@example.com"
              class="input-field"
              id="email"
            />
          </div>
        </div>

        <button
          @click="submitForm"
          :disabled="!canSubmit || submitting"
          class="w-full bg-gradient-to-r from-primary to-accent text-white font-bold py-3.5 rounded-xl text-sm hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <svg
            v-if="submitting"
            class="w-4 h-4 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
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
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <span>{{ submitting ? "Sending…" : "Get My Quote" }}</span>
        </button>
      </div>
    </div>

    <Transition name="toast">
      <div
        v-if="showSuccess"
        class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] bg-green-600 text-white px-6 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 text-sm font-semibold"
      >
        <svg class="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clip-rule="evenodd"
          />
        </svg>
        Request sent! We'll be in touch within 24 hours.
      </div>
    </Transition>
  </section>
</template>

<style scoped>
.input-field {
  @apply w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 bg-gray-50 focus:outline-none focus:border-primary focus:bg-white transition-all placeholder:text-gray-400;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(16px) scale(0.95);
}
</style>
