<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useGeneralService } from "../services/general.service";
import {
  formatPackageDate,
  inferFlightIncluded,
  parseInclusionList,
  type DisplayPackage,
} from "../utils/packageHelpers";
import { useToast } from "../composables/useToast";
import { normaliseError } from "../utils/api";
import { useCurrency } from "../composables/useCurrency";

interface Props {
  open: boolean;
  pkg: DisplayPackage | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: "close"): void;
  (e: "submitted"): void;
}>();

const generalService = useGeneralService();
const { format, currentConfig } = useCurrency();

const fallbackImage =
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80";

const stepTitles = ["Package Details", "Your Trip", "Your Details"];
const currentStep = ref(1);
const submitting = ref(false);
const includeFlight = ref(false);

const defaultForm = () => ({
  departureDate: "",
  travellers: 2,
  name: "",
  email: "",
  phone: "",
});
const form = ref(defaultForm());

const inclusionList = computed(() => parseInclusionList(props.pkg?.inclusions));
const exclusionList = computed(() => parseInclusionList(props.pkg?.exclusions));
const toast = useToast();
const error = ref("");

const formattedPrice = computed(() => {
  if (!props.pkg?.price) return "";

  return typeof props.pkg.price === "number"
    ? props.pkg.price.toLocaleString()
    : props.pkg.price;
});

watch(
  () => props.pkg,
  (pkg) => {
    if (!pkg) return;
    currentStep.value = 1;
    form.value = defaultForm();
    includeFlight.value = inferFlightIncluded(pkg);
  },
  { immediate: true },
);

watch(
  () => props.open,
  (isOpen) => {
    document.body.style.overflow = isOpen ? "hidden" : "";
  },
);

const canProceed = computed(() => {
  if (currentStep.value === 2)
    return !!form.value.departureDate && form.value.travellers >= 1;
  return true;
});

const canSubmit = computed(
  () =>
    form.value.name.trim() &&
    form.value.email.trim() &&
    form.value.phone.trim(),
);

function nextStep() {
  if (canProceed.value && currentStep.value < 3) currentStep.value++;
}
function prevStep() {
  if (currentStep.value > 1) currentStep.value--;
}
function handleClose() {
  emit("close");
}

async function submitQuote() {
  if (!canSubmit.value || !props.pkg) return;
  submitting.value = true;
  error.value = "";

  try {
    await generalService.savePackageQuote({
      package_name: props.pkg.package_name,
      departure_date: form.value.departureDate,
      number_of_travelers: form.value.travellers,
      flight_booking: includeFlight.value,
      full_name: form.value.name,
      email_address: form.value.email,
      phone_number: form.value.phone,
      price: Number(formattedPrice.value),
    });

    toast.success("Quote request sent successfully!");
  } catch (err) {
    console.error(err);
    error.value = normaliseError(err);
    toast.error(error.value);
    return;
  } finally {
    submitting.value = false;
  }

  emit("submitted");
  emit("close");
}
</script>

<template>
  <Transition name="modal">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      @click.self="handleClose"
    >
      <div
        class="absolute inset-0 bg-black/60 backdrop-blur-sm"
        @click="handleClose"
      ></div>

      <div
        class="relative bg-white w-full sm:max-w-2xl sm:rounded-3xl rounded-t-3xl shadow-2xl z-10 max-h-[92vh] flex flex-col overflow-hidden"
      >
        <div
          class="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 shrink-0"
        >
          <div>
            <p
              class="text-[11px] font-semibold text-primary uppercase tracking-widest mb-0.5"
            >
              Step {{ currentStep }} of 3
            </p>
            <h3 class="text-lg font-bold text-gray-900">
              {{ stepTitles[currentStep - 1] }}
            </h3>
          </div>
          <button
            @click="handleClose"
            class="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <svg
              class="w-4 h-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div class="flex gap-1.5 px-6 py-3 shrink-0">
          <div
            v-for="i in 3"
            :key="i"
            class="h-1 flex-1 rounded-full transition-all duration-500"
            :class="
              i <= currentStep
                ? 'bg-gradient-to-r from-primary to-accent'
                : 'bg-gray-200'
            "
          ></div>
        </div>

        <div class="flex-1 overflow-y-auto px-6 py-4">
          <div v-if="currentStep === 1 && pkg" class="space-y-5">
            <div class="rounded-2xl overflow-hidden h-48 bg-gray-100">
              <img
                :src="pkg.poster || fallbackImage"
                :alt="pkg.package_name"
                class="w-full h-full object-cover"
              />
            </div>

            <div>
              <div class="flex flex-wrap items-center gap-2 mb-2">
                <span
                  v-if="pkg.category"
                  class="bg-primary/10 text-primary text-[11px] font-semibold px-2.5 py-1 rounded-full"
                >
                  {{ pkg.category }}
                </span>
                <span
                  v-if="pkg.location"
                  class="flex items-center gap-1 text-[11px] font-medium bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full"
                >
                  <svg
                    class="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  {{ pkg.location }}
                </span>
              </div>
              <h4 class="text-xl font-bold text-gray-900 leading-snug mb-1">
                {{ pkg.package_name }}
              </h4>
              <p v-if="pkg.date_from" class="text-xs text-gray-400">
                Available {{ formatPackageDate(pkg.date_from) }}
                <span v-if="pkg.date_to">
                  → {{ formatPackageDate(pkg.date_to) }}</span
                >
              </p>
            </div>

            <div
              class="flex items-center justify-between bg-gray-50 rounded-2xl px-4 py-3.5 border border-gray-100"
            >
              <span
                class="text-xs font-semibold text-gray-600 uppercase tracking-widest"
                >Package Price</span
              >
              <span class="text-lg font-bold text-gray-900">
                {{
                  pkg.price
                    ? format(Number(formattedPrice))
                    : "Price on request"
                }}
              </span>
            </div>

            <p
              v-if="pkg.description"
              class="text-sm text-gray-600 leading-relaxed"
            >
              {{ pkg.description }}
            </p>

            <div v-if="inclusionList.length">
              <p
                class="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-2"
              >
                What's Included
              </p>
              <ul class="space-y-1.5">
                <li
                  v-for="(item, idx) in inclusionList"
                  :key="idx"
                  class="flex items-start gap-2 text-sm text-gray-700"
                >
                  <svg
                    class="w-4 h-4 text-green-600 mt-0.5 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {{ item }}
                </li>
              </ul>
            </div>

            <div v-if="exclusionList.length">
              <p
                class="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-2"
              >
                Not Included
              </p>
              <ul class="space-y-1.5">
                <li
                  v-for="(item, idx) in exclusionList"
                  :key="idx"
                  class="flex items-start gap-2 text-sm text-gray-500"
                >
                  <svg
                    class="w-4 h-4 text-gray-300 mt-0.5 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  {{ item }}
                </li>
              </ul>
            </div>

            <p
              v-if="pkg.terms"
              class="text-xs text-gray-400 leading-relaxed border-t border-gray-100 pt-4"
            >
              {{ pkg.terms }}
            </p>

            <div
              class="flex items-center justify-between gap-4 p-4 rounded-xl border-2 border-gray-200"
            >
              <div>
                <p class="text-sm font-semibold text-gray-800">
                  Flight Booking
                </p>
                <p class="text-xs text-gray-400">
                  {{
                    includeFlight
                      ? "Included in your quote"
                      : "Not included — add if you need us to book flights"
                  }}
                </p>
              </div>
              <div class="flex gap-2 shrink-0">
                <button
                  @click="includeFlight = true"
                  class="px-4 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all"
                  :class="
                    includeFlight
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-gray-200 text-gray-400'
                  "
                >
                  Yes
                </button>
                <button
                  @click="includeFlight = false"
                  class="px-4 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all"
                  :class="
                    !includeFlight
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-gray-200 text-gray-400'
                  "
                >
                  No
                </button>
              </div>
            </div>
          </div>

          <div v-if="currentStep === 2" class="space-y-5">
            <p class="text-sm text-gray-500">
              When are you travelling, and how many of you?
            </p>

            <div>
              <label
                class="block text-xs font-semibold text-gray-600 mb-1.5"
                for="departureDate"
                >Departure Date *</label
              >
              <input
                v-model="form.departureDate"
                type="date"
                class="input-field"
                id="departureDate"
              />
            </div>

            <div>
              <label
                class="block text-xs font-semibold text-gray-600 mb-1.5"
                for="travellers"
                >Number of Travellers *</label
              >
              <div
                class="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50"
              >
                <button
                  @click="form.travellers = Math.max(1, form.travellers - 1)"
                  class="px-4 py-3 text-gray-500 hover:bg-gray-100 font-bold text-lg transition-colors"
                >
                  −
                </button>
                <span
                  class="flex-1 text-center font-bold text-gray-900 text-sm"
                  >{{ form.travellers }}</span
                >
                <button
                  @click="form.travellers = Math.min(20, form.travellers + 1)"
                  class="px-4 py-3 text-gray-500 hover:bg-gray-100 font-bold text-lg transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div v-if="currentStep === 3" class="space-y-4">
            <p class="text-sm text-gray-500">
              Last step — how should we reach you with your quote?
            </p>

            <div>
              <label
                class="block text-xs font-semibold text-gray-600 mb-1.5"
                for="name"
                >Full Name *</label
              >
              <input
                v-model="form.name"
                type="text"
                placeholder="John Doe"
                class="input-field"
                id="name"
              />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label
                  class="block text-xs font-semibold text-gray-600 mb-1.5"
                  for="phone"
                  >Phone Number *</label
                >
                <input
                  v-model="form.phone"
                  type="tel"
                  placeholder="+234 800 000 0000"
                  class="input-field"
                  id="phone"
                />
              </div>
              <div>
                <label
                  class="block text-xs font-semibold text-gray-600 mb-1.5"
                  for="email"
                  >Email Address *</label
                >
                <input
                  v-model="form.email"
                  type="email"
                  placeholder="you@example.com"
                  class="input-field"
                  id="email"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="px-6 pb-6 pt-4 border-t border-gray-100 shrink-0">
          <div class="flex gap-3">
            <button
              v-if="currentStep > 1"
              @click="prevStep"
              class="flex-1 border-2 border-gray-200 text-gray-600 font-semibold py-3 rounded-xl hover:border-gray-300 transition-colors text-sm"
            >
              ← Back
            </button>
            <button
              v-if="currentStep < 3"
              @click="nextStep"
              :disabled="!canProceed"
              class="flex-1 bg-gradient-to-r from-primary to-accent text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-all text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue →
            </button>
            <button
              v-if="currentStep === 3"
              @click="submitQuote"
              :disabled="!canSubmit || submitting"
              class="flex-1 bg-gradient-to-r from-primary to-accent text-white font-bold py-3 rounded-xl hover:opacity-90 transition-all text-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.input-field {
  @apply w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 bg-gray-50 focus:outline-none focus:border-primary focus:bg-white transition-all placeholder:text-gray-400;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}
.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .relative {
  transform: translateY(40px) scale(0.97);
}
.modal-leave-to .relative {
  transform: translateY(20px) scale(0.98);
}
</style>
