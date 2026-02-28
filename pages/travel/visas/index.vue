<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import VisaForm from '../../../components/forms/VisaForm.vue'

const router = useRouter()
const route = useRoute()

const isLoading = ref(false)
const hasSearched = ref(false)
const showSearchForm = ref(true)

const popularDestinations = [
  { country: 'United Arab Emirates', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800', price: 'From ₦45,000', processingTime: '3-5 Days' },
  { country: 'United Kingdom', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800', price: 'From ₦120,000', processingTime: '15-20 Days' },
  { country: 'United States', image: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800', price: 'From ₦150,000', processingTime: '30-45 Days' },
  { country: 'Canada', image: 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=800', price: 'From ₦130,000', processingTime: '20-30 Days' },
  { country: 'Schengen', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800', price: 'From ₦95,000', processingTime: '10-15 Days' },
  { country: 'Turkey', image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800', price: 'From ₦35,000', processingTime: '2-3 Days' },
]

const benefits = [
  { icon: '✓', title: 'Expert Assistance', description: 'Professional guidance through the entire visa process' },
  { icon: '✓', title: 'Fast Processing', description: 'Quick turnaround times for your visa applications' },
  { icon: '✓', title: 'Document Support', description: 'Help with document preparation and verification' },
  { icon: '✓', title: 'Track Application', description: 'Real-time updates on your visa application status' },
]

const visaTypes = ['Tourist Visa', 'Business Visa', 'Transit Visa', 'Student Visa', 'Work Visa']
const validityPeriods = ['30 Days', '60 Days', '90 Days', '180 Days', '1 Year']

const searchVisas = async (params?: any) => {
  isLoading.value = true
  hasSearched.value = true

  const searchParams = params || {
    country: route.query.country as string,
    nationality: route.query.nationality as string,
    persons: {
      adults: Number.parseInt(route.query.adults as string) || 1,
      children: Number.parseInt(route.query.children as string) || 0,
    },
  }

  setTimeout(() => {
    isLoading.value = false

    router.push({
      path: '/travel/visas/booking',
      query: {
        country: searchParams.country,
        nationality: searchParams.nationality,
        persons: searchParams.persons,
        step: '1',
      },
    })
  }, 1500)
}

watch(
  () => route.query,
  (newQuery) => {
    if (newQuery.country && newQuery.nationality && !isLoading.value) {
      searchVisas()
    }
  },
  { immediate: true }
)

const handleVisaSearch = (searchData: any) => { searchVisas(searchData) }

onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-visible')
        observer.unobserve(entry.target)
      }
    }),
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  )
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el))
})
</script>

<template>
  <div class="min-h-screen">
    <section
      class="relative pt-36 pb-24 px-6 bg-cover bg-center bg-no-repeat"
      style="background-image: url('https://images.unsplash.com/photo-1606768666853-403c90a981ad?w=1600')"
    >
      <div class="absolute inset-0 bg-black/50"></div>

      <div class="relative z-10 max-w-7xl mx-auto">
        <div class="text-center mb-12 reveal">
          <h1 class="text-4xl md:text-5xl font-bold mb-4 text-white">
            Get Your Visa Easily
          </h1>
          <p class="text-xl text-gray-100">
            Fast and reliable visa processing services worldwide
          </p>
        </div>

        <div class="mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div class="p-6 md:p-8">
            <div v-if="isLoading" class="flex flex-col items-center justify-center py-10 gap-4">
              <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-gray-900"></div>
              <p class="text-gray-600 font-medium">Finding visa services, please wait…</p>
            </div>

            <VisaForm v-else @search="handleVisaSearch" />
          </div>
        </div>
      </div>
    </section>

    <section class="py-16 px-6">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-12 reveal">
          <h2 class="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Popular Visa Destinations</h2>
          <p class="text-lg text-gray-600">Quick visa processing for popular destinations</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="(destination, index) in popularDestinations"
            :key="destination.country"
            class="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer reveal"
            :style="{ transitionDelay: `${index * 100}ms` }"
          >
            <img
              :src="destination.image"
              :alt="destination.country"
              class="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            <div class="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h3 class="text-2xl font-bold mb-2">{{ destination.country }}</h3>
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-200">Processing Time</p>
                  <p class="font-semibold">{{ destination.processingTime }}</p>
                </div>
                <p class="text-lg font-semibold">{{ destination.price }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Why Choose Us -->
    <section class="py-16 px-6 bg-gray-50">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-12 reveal">
          <h2 class="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Why Choose Our Visa Services</h2>
          <p class="text-lg text-gray-600">Experience hassle-free visa processing with exclusive benefits</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            v-for="(benefit, index) in benefits"
            :key="benefit.title"
            class="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 reveal"
            :style="{ transitionDelay: `${index * 100}ms` }"
          >
            <div class="text-4xl mb-4 text-gray-900">{{ benefit.icon }}</div>
            <h3 class="text-xl font-bold mb-2 text-gray-900">{{ benefit.title }}</h3>
            <p class="text-gray-600">{{ benefit.description }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.reveal {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}
.reveal-visible {
  opacity: 1;
  transform: translateY(0);
}
</style>