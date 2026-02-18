<script setup lang="ts">
import { ref } from 'vue'
import SearchTabs from './SearchTabs.vue'
import FlightsForm from './forms/FlightsForm.vue';
import HotelsForm from './forms/HotelsForm.vue';
import ToursForm from './forms/ToursForm.vue';
import VisaForm from './forms/VisaForm.vue';
import ServicesForm, { Service } from './forms/ServicesForm.vue';

const activeTab = ref('flights')

const tabs = [
  { 
    id: 'flights', 
    label: 'Flights',
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />'
  },
  { 
    id: 'hotels', 
    label: 'Hotels',
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />'
  },
  { 
    id: 'tours', 
    label: 'Tours',
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />'
  },
  { 
    id: 'visas', 
    label: 'Visas',
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />'
  },
  // { 
  //   id: 'services', 
  //   label: 'Services',
  //   icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />'
  // }
]

const availableServices = ref<Service[]>([
  {
    id: '1',
    title: 'Vacation Packages',
    description: 'Explore our curated vacation packages offering unbeatable deals on flights, accommodation, and activities. From beach escapes to adventure tours, we have something for every traveler.',
    image: 'https://portal.inceltourism.com/images/img17.jpg',
    slug: 'vacation-packages'
  },
  {
    id: '2',
    title: 'Travel Insurance',
    description: 'Protect yourself from unexpected events with comprehensive travel insurance. We offer plans to cover trip cancellation, medical emergencies, and baggage loss, ensuring you\'re prepared for anything.',
    image: 'https://portal.inceltourism.com/images/img28.jpg',
    slug: 'travel-insurance'
  },
  {
    id: '3',
    title: 'Airport Transfer',
    description: 'We offer comfortable vehicle services with professional drivers to ensure a smooth start (and end) to your vacation.',
    image: 'https://portal.inceltourism.com/images/img2.jpg',
    slug: 'airport-transfer'
  },
  {
    id: '4',
    title: 'Airport Protocol',
    description: 'We offer comfortable vehicle services with professional drivers to ensure a smooth start (and end) to your vacation.',
    image: 'https://portal.inceltourism.com/images/img_airport_protocol_small.jpg',
    slug: 'airport-protocol'
  }
])

/* Handle service request */
const handleServiceRequest = (service: Service) => {
  console.log('Service requested:', service)
}
</script>

<template>
  <section class="relative -mt-24 z-20 pb-8">
    <div class="container mx-auto sm:px-24 px-4">
      <div class="bg-gradient-to-br from-[#0076ad] to-[#0076ad] rounded-3xl overflow-hidden">

        <!-- Header -->
        <div class="text-center pt-12 pb-8 px-4">
          <h2 class="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
            Book your next <span class="text-yellow-400">tour</span> with Incel Tourism
          </h2>
        </div>

        <!-- Tabs -->
        <SearchTabs v-model="activeTab" :tabs="tabs">
          <!-- Flights -->
          <template #default="{ active }">
            <div v-if="active === 'flights'">
              <FlightsForm />
            </div>

            <!-- Hotels -->
            <div v-if="active === 'hotels'">
              <HotelsForm />
            </div>

            <!-- Tours -->
            <div v-if="active === 'tours'">
              <ToursForm />
            </div>

            <!-- Visas -->
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
