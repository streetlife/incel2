<script setup lang="ts">
import { ref } from "vue";
import SearchTabs from "./SearchTabs.vue";
import FlightsForm from "./forms/FlightsForm.vue";
import HotelsForm from "./forms/HotelsForm.vue";
import ToursForm from "./forms/ToursForm.vue";
import VisaForm from "./forms/VisaForm.vue";
import ServicesForm, { Service } from "./forms/ServicesForm.vue";
import { navigateTo } from "nuxt/app";

const activeTab = ref("flights");

const tabs = [
  {
    id: "flights",
    label: "Flights",
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />',
  },
  {
    id: "hotels",
    label: "Hotels",
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />',
  },
  {
    id: "tours",
    label: "Tours",
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />',
  },
  {
    id: "airport-transfer",
    label: "Airport Transfer",
    icon: '<path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />',
    url: "/services/airport-transfer",
  },
  {
    id: "visas",
    label: "Visas",
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />',
  },
  // {
  //   id: 'services',
  //   label: 'Services',
  //   icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />'
  // }
];

const availableServices = ref<Service[]>([
  {
    id: "1",
    title: "Vacation Packages",
    description:
      "Explore our curated vacation packages offering unbeatable deals on flights, accommodation, and activities. From beach escapes to adventure tours, we have something for every traveler.",
    image: "https://portal.inceltourism.com/images/img17.jpg",
    slug: "vacation-packages",
  },
  {
    id: "2",
    title: "Travel Insurance",
    description:
      "Protect yourself from unexpected events with comprehensive travel insurance. We offer plans to cover trip cancellation, medical emergencies, and baggage loss, ensuring you're prepared for anything.",
    image: "https://portal.inceltourism.com/images/img28.jpg",
    slug: "travel-insurance",
  },
  {
    id: "3",
    title: "Airport Transfer",
    description:
      "We offer comfortable vehicle services with professional drivers to ensure a smooth start (and end) to your vacation.",
    image: "https://portal.inceltourism.com/images/img2.jpg",
    slug: "airport-transfer",
  },
  {
    id: "4",
    title: "Airport Protocol",
    description:
      "We offer comfortable vehicle services with professional drivers to ensure a smooth start (and end) to your vacation.",
    image:
      "https://portal.inceltourism.com/images/img_airport_protocol_small.jpg",
    slug: "airport-protocol",
  },
]);

const handleServiceRequest = (service: Service) => {
  console.log("Service requested:", service);
};

const handleTabChange = (tabId: string) => {
  activeTab.value = tabId;

  const tab = tabs.find((t) => t.id === tabId);

  if (tab?.url) {
    navigateTo(tab.url);
  }
};
</script>

<template>
  <section class="relative -mt-44 z-20 pb-8">
    <div class="container mx-auto sm:px-24 px-4">
      <div
        class="bg-gradient-to-br from-[#0076ad] to-[#0076ad] rounded-3xl overflow-hidden"
      >
        <div class="text-center pt-12 pb-8 px-4">
          <h2 class="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
            Book your next <span class="text-yellow-400">tour</span> with Incel
            Tourism
          </h2>
        </div>

        <SearchTabs
          :model-value="activeTab"
          @update:model-value="handleTabChange"
          :tabs="tabs"
        >
          <template #default="{ active }">
            <div v-if="active === 'flights'">
              <FlightsForm />
            </div>

            <div v-if="active === 'hotels'">
              <HotelsForm />
            </div>

            <div v-if="active === 'tours'">
              <ToursForm />
            </div>

            <div v-if="active === 'visas'">
              <VisaForm />
            </div>

            <div v-if="active === 'services'">
              <ServicesForm
                :services="availableServices"
                @service-request="handleServiceRequest"
              />
            </div>
          </template>
        </SearchTabs>
      </div>
    </div>
  </section>
</template>
