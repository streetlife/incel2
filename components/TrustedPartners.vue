<script setup lang="ts">
import { computed, onMounted, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { usePartnersStore } from '../stores/partners'

const partnersStore = usePartnersStore()
const { stats, airlines, platforms, isLoading } = storeToRefs(partnersStore)

const statsList = computed(() => [
  { value: stats.value?.happy_travellers ?? '10,000+', label: 'Happy Travellers' },
  { value: stats.value?.destinations ?? '150+', label: 'Destinations' },
  { value: stats.value?.years_of_experience ?? '12+', label: 'Years Experience' },
  { value: stats.value?.statisfaction_rate ?? '98%', label: 'Satisfaction Rate' },
])

const fallbackAirlines = [
  { name: 'Emirates', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Emirates_logo.svg/320px-Emirates_logo.svg.png' },
  { name: 'Qatar Airways', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/9/9b/Qatar_Airways_Logo.svg/320px-Qatar_Airways_Logo.svg.png' },
  { name: 'Turkish Airlines', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Turkish_Airlines_logo_2019_compact.svg/320px-Turkish_Airlines_logo_2019_compact.svg.png' },
  { name: 'Air France', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Air_France_Logo.svg/320px-Air_France_Logo.svg.png' },
  { name: 'Lufthansa', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Lufthansa_Logo_2018.svg/320px-Lufthansa_Logo_2018.svg.png' },
  { name: 'British Airways', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/42/British_Airways_Logo.svg/320px-British_Airways_Logo.svg.png' },
  { name: 'Ethiopian Airlines', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Ethiopian_Airlines_logo.svg/320px-Ethiopian_Airlines_logo.svg.png' },
  { name: 'Kenya Airways', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Kenya_Airways_logo.svg/320px-Kenya_Airways_logo.svg.png' },
]

const fallbackPlatforms = [
  { name: 'Amadeus', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Amadeus_IT_Group_logo.svg/320px-Amadeus_IT_Group_logo.svg.png' },
  { name: 'Sabre', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Sabre_Corporation_Logo.svg/320px-Sabre_Corporation_Logo.svg.png' },
  { name: 'Booking.com', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Booking.com_logo.svg/320px-Booking.com_logo.svg.png' },
  { name: 'Marriott', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Marriott_Logo.svg/320px-Marriott_Logo.svg.png' },
  { name: 'Hilton', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Hilton_worldwide_logo.svg/320px-Hilton_worldwide_logo.svg.png' },
  { name: 'Visa', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/320px-Visa_Inc._logo.svg.png' },
  { name: 'Mastercard', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/320px-Mastercard-logo.svg.png' },
]

const displayAirlines = computed(() => airlines.value ?? fallbackAirlines)
const displayPlatforms = computed(() => platforms.value ?? fallbackPlatforms)

const marqueeAirlines = computed(() => new Array(6).fill(displayAirlines.value).flat())
const marqueePlatforms = computed(() => new Array(6).fill(displayPlatforms.value).flat())

onMounted(async () => {
  await partnersStore.fetchAll()
  await nextTick()

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-visible')
          observer.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  )

  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el))
})
</script>

<template>
  <section class="py-20 bg-white overflow-hidden">
    <div class="container mx-auto px-4 mb-16">
      <div class="text-center mb-12 reveal">
        <p class="text-xs font-semibold tracking-[0.25em] uppercase text-primary mb-3">
          Accredited & Certified
        </p>
        <h2 class="text-3xl md:text-4xl font-bold text-gray-900">
          Trusted by Thousands, <span class="text-primary">Backed by the Best</span>
        </h2>
        <p class="mt-3 text-gray-500 max-w-xl mx-auto text-sm leading-relaxed">
          We are fully licensed travel agents, accredited by the industry's most recognised bodies.
        </p>
      </div>

      <div class="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16 reveal">
        <div class="flex items-center gap-4 bg-white border border-gray-200 rounded-2xl px-6 py-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 w-full sm:w-auto sm:min-w-[300px]">
          <div class="w-16 h-16 rounded-xl bg-primary flex items-center justify-center shrink-0">
            <img src="https://logowik.com/content/uploads/images/542_iata.jpg" alt="IATA Accredited Agent" class="h-10 w-auto object-contain" />
          </div>
          <div class="flex flex-col flex-1">
            <span class="text-sm font-bold text-gray-900 leading-tight">IATA Accredited</span>
            <span class="text-xs text-gray-500 mt-0.5 leading-snug">International Air Transport Association</span>
          </div>
          <div class="flex flex-col items-center gap-0.5 shrink-0">
            <svg class="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            <span class="text-xs text-green-600 font-medium">Verified</span>
          </div>
        </div>

        <div class="hidden sm:block w-px h-20 bg-gray-200"></div>

        <div class="flex items-center gap-4 bg-white border border-gray-200 rounded-2xl px-6 py-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 w-full sm:w-auto sm:min-w-[300px]">
          <div class="w-16 h-16 rounded-xl bg-[#006B3F] flex items-center justify-center shrink-0">
            <img src="https://nanta.org.ng/images/icon.png" alt="NANTA Member" class="h-10 w-auto object-contain" />
          </div>
          <div class="flex flex-col flex-1">
            <span class="text-sm font-bold text-gray-900 leading-tight">NANTA Member</span>
            <span class="text-xs text-gray-500 mt-0.5 leading-snug">National Assoc. of Nigerian Travel Agencies</span>
          </div>
          <div class="flex flex-col items-center gap-0.5 shrink-0">
            <svg class="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            <span class="text-xs text-green-600 font-medium">Verified</span>
          </div>
        </div>
      </div>

      <div class="text-center mb-8 reveal">
        <p class="text-xs font-semibold tracking-[0.2em] uppercase text-gray-400">Our Partners & Providers</p>
      </div>

      <div class="overflow-hidden [mask-image:linear-gradient(to_right,transparent_0%,black_8%,black_92%,transparent_100%)] mb-6 reveal">
        <div class="flex gap-16 w-max animate-[marquee-left_80s_linear_infinite]">
          <div
            v-for="(partner, i) in [...marqueeAirlines, ...marqueeAirlines]"
            :key="`airline-${i}`"
            class="flex items-center justify-center h-10 shrink-0"
          >
            <img
              :src="partner.logo"
              :alt="partner.name"
              class="h-8 w-auto object-contain opacity-60 hover:opacity-100 transition-all duration-300"
              :onerror="`this.style.display='none';this.nextElementSibling.style.display='block'`"
            />
            <span class="hidden text-xs font-bold text-gray-400 tracking-widest uppercase whitespace-nowrap">
              {{ partner.name }}
            </span>
          </div>
        </div>
      </div>

      <div class="overflow-hidden [mask-image:linear-gradient(to_right,transparent_0%,black_8%,black_92%,transparent_100%)] reveal">
        <div class="flex gap-16 w-max animate-[marquee-right_28s_linear_infinite]">
          <div
            v-for="(partner, i) in [...marqueePlatforms, ...marqueePlatforms]"
            :key="`platform-${i}`"
            class="flex items-center justify-center h-10 shrink-0"
          >
            <img
              :src="partner.logo"
              :alt="partner.name"
              class="h-8 w-auto object-contain opacity-60 hover:opacity-100 transition-all duration-300"
              :onerror="`this.style.display='none';this.nextElementSibling.style.display='block'`"
            />
            <span class="hidden text-xs font-bold text-gray-400 tracking-widest uppercase whitespace-nowrap">
              {{ partner.name }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-gray-50 border-y border-gray-100 py-10 reveal">
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div v-for="stat in statsList" :key="stat.label" class="flex flex-col gap-1">
            <span class="text-3xl font-extrabold text-primary leading-none">{{ stat.value }}</span>
            <span class="text-xs font-medium text-gray-500 tracking-widest uppercase">{{ stat.label }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
