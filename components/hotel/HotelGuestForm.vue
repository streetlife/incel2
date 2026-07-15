<script setup lang="ts">
import { ref, computed } from "vue";
import { useHotelBookingStore } from "../../stores/useHotelBookingStore";
import { useToast } from "../../composables/useToast";
import AppToast from "../toast/AppToast.vue";
import { useAuthStore } from "../../stores/auth";
import { normaliseError } from "../../utils/api";

const emit = defineEmits<{ (e: "next"): void; (e: "back"): void }>();
const store = useHotelBookingStore();

const TITLES = ["Mr", "Mrs", "Ms", "Dr", "Prof"];

const showLogin = ref(false);
const loginEmail = ref("");
const loginPass = ref("");
const loginLoading = ref(false);
const loginError = ref("");
const toast = useToast();
const auth = useAuthStore();
const showLoginPanel = ref(false);

async function handleLogin() {
  loginLoading.value = true;
  loginError.value = "";

  try {
    const res = await auth.login(loginEmail.value, loginPass.value);
    if (res === null) return;

    toast.success("Login successful");
    showLoginPanel.value = false;
  } catch (err) {
    loginLoading.value = false;
    loginError.value = normaliseError(err);

    toast.error(loginError.value);
  }
  loginLoading.value = false;
}

function handleLogout() {
  store.isLoggedIn = false;
  store.accountName = "";
  loginEmail.value = "";
  loginPass.value = "";
}

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

const isPrimary = (index: number) => index === 0;

const errors = ref<Record<string, string>>({});

const fieldClass = (key: string) =>
  `w-full px-3.5 py-2.5 text-sm rounded-xl border transition-colors outline-none focus:ring-2 focus:ring-primary/20 ${
    errors.value[key]
      ? "border-red-300 bg-red-50"
      : "border-slate-200 bg-white focus:border-primary"
  }`;

function validate(): boolean {
  errors.value = {};
  store.guests.forEach((g, i) => {
    const p = `g${i}`;
    if (!g.title) errors.value[`${p}_title`] = "Required";
    if (!g.firstName.trim()) errors.value[`${p}_first`] = "Required";
    if (!g.lastName.trim()) errors.value[`${p}_last`] = "Required";
    if (isPrimary(i)) {
      if (!g.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
        errors.value[`${p}_email`] = "Valid email required";
      if (!g.phone.match(/^\+?[\d\s\-()\u202A]{8,}$/))
        errors.value[`${p}_phone`] = "Valid phone required";
    }
  });
  return Object.keys(errors.value).length === 0;
}

const isSubmitting = computed(() => store.status === "submitting");

async function submit() {
  if (!validate()) {
    document
      .querySelector(".border-red-300")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }

  const primary = store.guests[0];
  if (primary) {
    store.contactEmail = primary.email;
    store.contactPhone = primary.phone;
  }

  emit("next");
}
</script>

<template>
  <AppToast />
  <div class="space-y-6">
    <div class="bg-blue-50 border border-blue-200 rounded-2xl p-4">
      <div
        v-if="!store.isLoggedIn"
        class="flex items-start justify-between gap-4"
      >
        <div>
          <p class="text-sm font-semibold text-black">
            Already have an account?
          </p>
          <p class="text-xs text-primary mt-0.5">
            Log in to auto-fill your details and view past bookings.
          </p>
        </div>
        <button
          class="shrink-0 text-xs font-semibold px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/45 transition-colors border-none cursor-pointer"
          @click="showLogin = !showLogin"
        >
          {{ showLogin ? "Cancel" : "Log In" }}
        </button>
      </div>

      <div v-else class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div
            class="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold"
          >
            {{ store.accountName.slice(0, 1).toUpperCase() }}
          </div>
          <p class="text-sm font-semibold text-primary">
            Logged in as {{ store.accountName }}
          </p>
        </div>
        <button
          class="text-xs text-primary underline cursor-pointer bg-transparent border-none"
          @click="handleLogout"
        >
          Log out
        </button>
      </div>

      <Transition
        enter-active-class="transition-all duration-200"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
      >
        <div
          v-if="showLogin && !store.isLoggedIn"
          class="mt-4 pt-4 border-t border-blue-200 space-y-3"
        >
          <input
            v-model="loginEmail"
            type="email"
            placeholder="Email address"
            class="w-full px-3.5 py-2.5 text-sm rounded-xl border border-blue-200 bg-white outline-none focus:border-blue-500"
          />
          <input
            v-model="loginPass"
            type="password"
            placeholder="Password"
            class="w-full px-3.5 py-2.5 text-sm rounded-xl border border-blue-200 bg-white outline-none focus:border-blue-500"
          />
          <p v-if="loginError" class="text-xs text-red-600">{{ loginError }}</p>
          <button
            class="w-full py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/35 border-none cursor-pointer disabled:opacity-60"
            :disabled="loginLoading"
            @click="handleLogin"
          >
            {{ loginLoading ? "Logging in…" : "Log In" }}
          </button>
        </div>
      </Transition>
    </div>

    <div
      v-for="(guest, i) in store.guests"
      :key="i"
      class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
    >
      <div
        class="flex items-center gap-2 px-5 py-3.5 border-b border-slate-100"
        :class="guest.type === 'child' ? 'bg-amber-50' : 'bg-slate-50'"
      >
        <div
          class="w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center"
          :class="guest.type === 'child' ? 'bg-amber-500' : 'bg-primary'"
        >
          {{ i + 1 }}
        </div>
        <span class="text-sm font-semibold text-slate-800">
          {{ guestLabels[i] }}
          <span
            v-if="isPrimary(i)"
            class="ml-1.5 text-[11px] font-normal text-primary bg-teal-50 px-2 py-0.5 rounded-full"
          >
            Primary contact
          </span>
        </span>
      </div>

      <div class="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            for=""
            class="text-xs font-semibold text-slate-500 mb-1.5 block"
          >
            Title <span class="text-red-400">*</span>
          </label>
          <select v-model="guest.title" :class="fieldClass(`g${i}_title`)">
            <option value="">Select</option>
            <option v-for="t in TITLES" :key="t" :value="t">{{ t }}</option>
          </select>
          <p v-if="errors[`g${i}_title`]" class="text-xs text-red-500 mt-1">
            {{ errors[`g${i}_title`] }}
          </p>
        </div>

        <div class="hidden sm:block" />

        <div>
          <label
            for=""
            class="text-xs font-semibold text-slate-500 mb-1.5 block"
          >
            First Name <span class="text-red-400">*</span>
          </label>
          <input
            v-model="guest.firstName"
            type="text"
            placeholder="Eg. John"
            :class="fieldClass(`g${i}_first`)"
          />
          <p v-if="errors[`g${i}_first`]" class="text-xs text-red-500 mt-1">
            {{ errors[`g${i}_first`] }}
          </p>
        </div>

        <div>
          <label
            for=""
            class="text-xs font-semibold text-slate-500 mb-1.5 block"
          >
            Last Name <span class="text-red-400">*</span>
          </label>
          <input
            v-model="guest.lastName"
            type="text"
            placeholder="Eg. Doe"
            :class="fieldClass(`g${i}_last`)"
          />
          <p v-if="errors[`g${i}_last`]" class="text-xs text-red-500 mt-1">
            {{ errors[`g${i}_last`] }}
          </p>
        </div>

        <template v-if="isPrimary(i)">
          <div class="sm:col-span-2 border-t border-slate-100 pt-4 mt-1">
            <p
              class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3"
            >
              Contact Details
            </p>
          </div>

          <div>
            <label
              for=""
              class="text-xs font-semibold text-slate-500 mb-1.5 block"
            >
              Email <span class="text-red-400">*</span>
            </label>
            <input
              v-model="guest.email"
              type="email"
              placeholder="voucher@example.com"
              :class="fieldClass(`g${i}_email`)"
            />
            <p class="text-[10px] text-slate-400 mt-1">
              Invoice & voucher will be sent here
            </p>
            <p v-if="errors[`g${i}_email`]" class="text-xs text-red-500 mt-1">
              {{ errors[`g${i}_email`] }}
            </p>
          </div>

          <div>
            <label
              for=""
              class="text-xs font-semibold text-slate-500 mb-1.5 block"
            >
              Phone <span class="text-red-400">*</span>
            </label>
            <input
              v-model="guest.phone"
              type="tel"
              placeholder="+234 800 000 0000"
              :class="fieldClass(`g${i}_phone`)"
            />
            <p v-if="errors[`g${i}_phone`]" class="text-xs text-red-500 mt-1">
              {{ errors[`g${i}_phone`] }}
            </p>
          </div>
        </template>
      </div>
    </div>

    <Transition
      enter-active-class="transition-all duration-200"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
    >
      <div
        v-if="store.status === 'error' && store.errorMessage"
        class="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl"
      >
        <span class="text-red-500 text-lg leading-none mt-0.5 flex-shrink-0"
          >⚠</span
        >
        <div>
          <p class="text-sm font-semibold text-red-700">Booking failed</p>
          <p class="text-xs text-red-600 mt-0.5">{{ store.errorMessage }}</p>
        </div>
      </div>
    </Transition>

    <div class="flex gap-3">
      <button
        class="flex-1 h-12 border-2 border-slate-200 text-slate-700 font-semibold rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer bg-white disabled:opacity-50"
        :disabled="isSubmitting"
        @click="emit('back')"
      >
        ← Back
      </button>
      <button
        class="flex-[2] h-12 bg-primary hover:opacity-90 text-white font-bold rounded-2xl transition-all border-none cursor-pointer shadow-lg flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        :disabled="isSubmitting"
        @click="submit"
      >
        <template v-if="isSubmitting">
          <svg class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
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
          Saving details…
        </template>
        <template v-else>
          Continue to Review
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </template>
      </button>
    </div>
  </div>
</template>
