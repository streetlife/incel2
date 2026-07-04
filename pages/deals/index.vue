<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useHead } from "nuxt/app";
import { useCurrency } from "../../composables/useCurrency";
import { ArrowRight } from "lucide-vue-next";
import { HotDeal, useHotDealsStore } from "../../stores/hotdeal";

const { format, fetchRates } = useCurrency();
const hotDealsStore = useHotDealsStore();

const countdown = ref([
  { label: "DAY", value: "00" },
  { label: "HRS", value: "00" },
  { label: "MIN", value: "00" },
  { label: "SEC", value: "00" },
]);
let timer: ReturnType<typeof setInterval> | null = null;

const tick = () => {
  const soonest = hotDealsStore.activeDeals
    .filter((d) => d.end_date)
    .map((d) => new Date(d.end_date).getTime())
    .sort((a, b) => a - b)[0];

  if (!soonest) return;

  const diff = Math.max(0, soonest - Date.now());
  countdown.value = [
    {
      label: "DAY",
      value: String(Math.floor(diff / 86_400_000)).padStart(2, "0"),
    },
    {
      label: "HRS",
      value: String(Math.floor((diff % 86_400_000) / 3_600_000)).padStart(
        2,
        "0",
      ),
    },
    {
      label: "MIN",
      value: String(Math.floor((diff % 3_600_000) / 60_000)).padStart(2, "0"),
    },
    {
      label: "SEC",
      value: String(Math.floor((diff % 60_000) / 1_000)).padStart(2, "0"),
    },
  ];
};

function formatDealDate(dateStr: string) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function isDealLive(deal: HotDeal) {
  const now = Date.now();
  const start = deal.start_date ? new Date(deal.start_date).getTime() : 0;
  const end = deal.end_date ? new Date(deal.end_date).getTime() : Infinity;
  return now >= start && now <= end;
}

const selectedDeal = ref<HotDeal | null>(null);
const openDeal = (deal: HotDeal) => {
  selectedDeal.value = deal;
};
const closeDeal = () => {
  selectedDeal.value = null;
};

const featuredDeal = computed(() => hotDealsStore.activeDeals[0] ?? null);
const regularDeals = computed(() => hotDealsStore.activeDeals.slice(1));

onMounted(async () => {
  await Promise.all([fetchRates(), hotDealsStore.fetchDeals()]);
  tick();
  timer = setInterval(tick, 1_000);
});
onUnmounted(() => {
  if (timer) clearInterval(timer);
});

useHead({
  title: "Hot Deals — Incel Tourism",
  meta: [
    {
      name: "description",
      content: "Exclusive travel deals on flights, hotels and packages.",
    },
  ],
  link: [
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap",
    },
  ],
});
</script>

<template>
  <div class="min-h-screen bg-[#040d1a] font-sans">
    <section
      class="relative min-h-[480px] flex flex-col justify-end overflow-hidden"
    >
      <div
        class="absolute inset-0 z-0"
        style="
          background:
            radial-gradient(
              ellipse 80% 60% at 10% 20%,
              rgba(1, 104, 167, 0.45) 0%,
              transparent 70%
            ),
            radial-gradient(
              ellipse 60% 80% at 90% 80%,
              rgba(1, 66, 122, 0.4) 0%,
              transparent 60%
            ),
            #040d1a;
        "
      />
      <div
        class="absolute inset-0 z-0"
        style="
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.03) 1px,
              transparent 1px
            );
          background-size: 40px 40px;
        "
      />
      <div
        class="relative z-10 container mx-auto sm:px-24 px-4 pt-36 pb-24 flex flex-col items-start gap-6"
      >
        <div
          class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase text-yellow-400 border border-yellow-400/30 bg-yellow-400/10"
        >
          <span class="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
          Limited-Time Offers
        </div>
        <h1
          class="leading-none text-white"
          style="
            font-family:
              Bebas Neue,
              sans-serif;
            font-size: clamp(5rem, 14vw, 10rem);
            line-height: 0.9;
            letter-spacing: 0.02em;
          "
        >
          <span class="block">Hot</span>
          <span
            class="block"
            style="-webkit-text-stroke: 2px #ffc107; color: transparent"
            >Deals</span
          >
        </h1>
        <p class="text-lg text-slate-300 max-w-lg leading-relaxed">
          Exclusive packages curated for you — all-inclusive escapes at prices
          that won't last long.
        </p>
      </div>
      <div class="absolute bottom-0 left-0 w-full z-10">
        <svg
          viewBox="0 0 1440 60"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          class="block w-full"
        >
          <path
            d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z"
            fill="#040d1a"
          />
        </svg>
      </div>
    </section>

    <div class="container mx-auto sm:px-24 px-4 -mt-2 mb-10">
      <div
        class="rounded-2xl px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border border-[#0168a7]/40 bg-[#0168a7]/20"
      >
        <div class="flex items-center gap-3">
          <svg
            class="w-5 h-5 text-yellow-400 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span class="text-white text-sm font-medium"
            >Soonest deal expires in:</span
          >
        </div>
        <div class="flex items-center gap-3">
          <template v-for="(unit, i) in countdown" :key="i">
            <div class="text-center">
              <div
                class="text-yellow-400 min-w-[2.5rem] text-center leading-none"
                style="
                  font-family:
                    Bebas Neue,
                    sans-serif;
                  font-size: 2rem;
                "
              >
                {{ unit.value }}
              </div>
              <div
                class="text-[0.6rem] text-slate-500 tracking-widest text-center mt-0.5"
              >
                {{ unit.label }}
              </div>
            </div>
            <span
              v-if="i < countdown.length - 1"
              class="text-yellow-400 font-bold text-xl"
              >:</span
            >
          </template>
        </div>
        <div class="text-sm text-slate-400">
          Book now · Pay securely · Instant confirmation
        </div>
      </div>
    </div>

    <section class="container mx-auto sm:px-24 px-4 pb-24">
      <div
        v-if="hotDealsStore.loading"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
      >
        <div
          v-for="i in 4"
          :key="i"
          class="rounded-2xl overflow-hidden bg-white/[0.04] border border-white/[0.08] animate-pulse"
        >
          <div class="h-52 bg-white/10"></div>
          <div class="p-5 space-y-3">
            <div class="h-4 bg-white/10 rounded w-2/3"></div>
            <div class="h-3 bg-white/10 rounded w-full"></div>
            <div class="h-3 bg-white/10 rounded w-5/6"></div>
            <div class="h-8 bg-white/10 rounded-full w-1/3 mt-4"></div>
          </div>
        </div>
      </div>

      <div v-else-if="hotDealsStore.error" class="text-center py-16">
        <p class="text-slate-400 mb-4">Unable to load deals right now.</p>
        <button
          @click="hotDealsStore.refresh()"
          class="px-6 py-2.5 rounded-full font-bold text-sm bg-yellow-400 text-[#040d1a] hover:bg-yellow-300 transition-colors"
        >
          Retry
        </button>
      </div>

      <template v-else-if="hotDealsStore.activeDeals.length">
        <div
          v-if="featuredDeal"
          class="relative rounded-3xl overflow-hidden cursor-pointer group mb-8 min-h-[320px] flex flex-col justify-end border border-white/[0.08]"
          style="background: linear-gradient(135deg, #0a1e35 0%, #051020 100%)"
          @click="openDeal(featuredDeal)"
        >
          <div
            class="absolute inset-0 pointer-events-none"
            style="
              background: radial-gradient(
                ellipse 70% 80% at 80% 50%,
                rgba(1, 104, 167, 0.25) 0%,
                transparent 70%
              );
            "
          />

          <div
            class="relative z-10 p-8 sm:p-12 flex flex-wrap items-end justify-between gap-6"
          >
            <div class="flex-1 min-w-0">
              <div
                v-if="isDealLive(featuredDeal)"
                class="inline-flex items-center gap-1.5 mb-3 text-[0.7rem] font-bold tracking-widest uppercase px-3 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/30"
              >
                <span
                  class="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"
                ></span>
                Live Now
              </div>

              <h2
                class="text-3xl sm:text-4xl font-black text-white mb-2 group-hover:text-yellow-300 transition-colors leading-tight"
              >
                {{ featuredDeal.title }}
              </h2>
              <p class="text-slate-300 text-base max-w-xl leading-relaxed">
                {{ featuredDeal.deal_includes }}
              </p>

              <div
                v-if="featuredDeal.start_date"
                class="flex items-center gap-1.5 mt-4 text-xs text-slate-400"
              >
                <svg
                  class="w-3.5 h-3.5 text-yellow-400 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                {{ formatDealDate(featuredDeal.start_date) }} –
                {{ formatDealDate(featuredDeal.end_date) }}
              </div>

              <div
                v-if="featuredDeal.other_info?.length"
                class="flex flex-wrap gap-2 mt-4"
              >
                <span
                  v-for="info in featuredDeal.other_info"
                  :key="info"
                  class="text-[0.7rem] px-3 py-0.5 rounded-full bg-white/[0.08] text-slate-400 border border-white/10"
                >
                  {{ info }}
                </span>
              </div>
            </div>

            <div class="text-right shrink-0">
              <div
                class="text-4xl font-black text-yellow-400"
                style="
                  font-family:
                    Bebas Neue,
                    sans-serif;
                "
              >
                From {{ format(featuredDeal.price) }}
              </div>
              <button
                class="mt-4 px-8 py-3 rounded-full font-extrabold text-sm bg-yellow-400 text-[#040d1a] shadow-[0_4px_20px_rgba(255,193,7,0.35)] hover:bg-yellow-300 hover:-translate-y-0.5 transition-all duration-200"
              >
                View Deal →
              </button>
            </div>
          </div>
        </div>

        <div
          v-if="regularDeals.length"
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <div
            v-for="deal in regularDeals"
            :key="deal.id"
            class="rounded-2xl overflow-hidden cursor-pointer group bg-white/[0.04] border border-white/[0.08] hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)] transition-all duration-300 flex flex-col"
            @click="openDeal(deal)"
          >
            <div
              class="relative h-16 bg-gradient-to-br from-[#0168a7]/60 to-[#01427a]/60 flex items-center px-5 gap-3 shrink-0"
            >
              <div
                class="w-8 h-8 rounded-full bg-yellow-400/20 flex items-center justify-center shrink-0"
              >
                <svg
                  class="w-4 h-4 text-yellow-400"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
              </div>
              <div
                v-if="isDealLive(deal)"
                class="ml-auto flex items-center gap-1 text-[0.65rem] font-bold text-green-400"
              >
                <span
                  class="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"
                ></span>
                LIVE
              </div>
            </div>

            <div class="p-5 flex flex-col flex-grow">
              <h3
                class="text-white font-bold text-xl mb-2 group-hover:text-yellow-300 transition-colors leading-tight"
              >
                {{ deal.title }}
              </h3>
              <p
                class="text-slate-400 text-sm mb-3 leading-relaxed line-clamp-2"
              >
                {{ deal.deal_includes }}
              </p>

              <div
                v-if="deal.other_info?.length"
                class="flex flex-wrap gap-1.5 mb-4"
              >
                <span
                  v-for="info in deal.other_info"
                  :key="info"
                  class="text-[0.65rem] px-2.5 py-0.5 rounded-full bg-white/[0.06] text-slate-400 border border-white/[0.08]"
                >
                  {{ info }}
                </span>
              </div>

              <div
                v-if="deal.start_date"
                class="flex items-center gap-1.5 text-xs text-slate-500 mb-4"
              >
                <svg
                  class="w-3 h-3 text-yellow-400/60 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                {{ formatDealDate(deal.start_date) }} –
                {{ formatDealDate(deal.end_date) }}
              </div>

              <div
                class="mt-auto flex items-end justify-between pt-4 border-t border-white/[0.06]"
              >
                <div
                  class="text-2xl font-black text-yellow-400"
                  style="
                    font-family:
                      Bebas Neue,
                      sans-serif;
                  "
                >
                  From {{ format(deal.price) }}
                </div>
                <button
                  class="px-5 py-2.5 rounded-full font-extrabold text-sm bg-yellow-400 text-[#040d1a] shadow-[0_4px_20px_rgba(255,193,7,0.3)] hover:bg-yellow-300 hover:-translate-y-0.5 transition-all duration-200"
                >
                  Book →
                </button>
              </div>
            </div>
          </div>
        </div>
      </template>

      <div v-else-if="!hotDealsStore.loading" class="text-center py-24">
        <div class="text-6xl mb-4">✈️</div>
        <p class="text-slate-400 text-lg">
          No active deals right now — check back soon!
        </p>
      </div>
    </section>

    <Transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-300"
      leave-to-class="opacity-0"
    >
      <div
        v-if="selectedDeal"
        class="fixed inset-0 z-[200] flex items-center justify-center p-4"
      >
        <div
          class="absolute inset-0 bg-[#040d1a]/85 backdrop-blur-md"
          @click="closeDeal"
        />

        <div
          class="relative z-10 w-full max-w-2xl rounded-3xl overflow-hidden bg-[#0a1628] border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto"
        >
          <div
            class="relative bg-gradient-to-br from-[#0168a7]/60 to-[#051020] px-8 py-10"
          >
            <div
              class="absolute inset-0 pointer-events-none"
              style="
                background: radial-gradient(
                  ellipse 80% 80% at 100% 0%,
                  rgba(1, 104, 167, 0.3) 0%,
                  transparent 70%
                );
              "
            />
            <button
              @click="closeDeal"
              class="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 transition-all"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <div
              v-if="isDealLive(selectedDeal)"
              class="inline-flex items-center gap-1.5 mb-3 text-[0.7rem] font-bold tracking-widest uppercase px-3 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/30"
            >
              <span
                class="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"
              ></span>
              Live Now
            </div>
            <h2 class="text-3xl font-black text-white relative z-10">
              {{ selectedDeal.title }}
            </h2>
            <div
              v-if="selectedDeal.start_date"
              class="flex items-center gap-1.5 mt-2 text-xs text-slate-400 relative z-10"
            >
              <svg
                class="w-3.5 h-3.5 text-yellow-400 shrink-0"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              {{ formatDealDate(selectedDeal.start_date) }} –
              {{ formatDealDate(selectedDeal.end_date) }}
            </div>
          </div>

          <div class="p-8">
            <p class="text-slate-300 mb-6 leading-relaxed">
              {{ selectedDeal.deal_includes }}
            </p>

            <div
              v-if="selectedDeal.other_info?.length"
              class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6"
            >
              <div
                v-for="info in selectedDeal.other_info"
                :key="info"
                class="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/[0.07]"
              >
                <svg
                  class="w-4 h-4 text-yellow-400 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2.5"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span class="text-sm text-slate-300">{{ info }}</span>
              </div>
            </div>

            <div
              class="flex items-end justify-between border-t border-white/[0.08] pt-6"
            >
              <div>
                <p class="text-slate-500 text-xs mb-1">Price</p>
                <div
                  class="text-4xl font-black text-yellow-400"
                  style="
                    font-family:
                      Bebas Neue,
                      sans-serif;
                  "
                >
                  From {{ format(selectedDeal.price) }}
                </div>
              </div>
              <NuxtLink
                :to="`/deals/${selectedDeal.id}`"
                class="px-8 py-3 rounded-full font-extrabold text-base bg-yellow-400 text-[#040d1a] shadow-[0_4px_20px_rgba(255,193,7,0.35)] hover:bg-yellow-300 hover:-translate-y-0.5 transition-all duration-200 flex gap-1"
                @click="closeDeal"
              >
                View Full Deal <ArrowRight />
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>
