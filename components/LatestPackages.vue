<template>
  <section class="py-20 bg-gray-50 sm:px-14 px-4">
    <div class="container mx-auto px-4">
      <div class="text-center mb-3 relative z-10">
        <h2 class="mb-1 text-4xl lg:text-5xl font-bold text-neutral-900">
          Latest <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Packages</span>
        </h2>
        <p class="text-xl text-neutral-600 max-w-2xl mx-auto font-light">
          Curated experiences just for you
        </p>
      </div>

      <div v-if="loading" class="flex justify-center items-center h-[550px]">
        <div class="w-[520px] h-[550px] rounded-[2rem] bg-gray-200 animate-pulse"></div>
      </div>

      <div v-if="error && !loading" class="flex items-center justify-between gap-4 bg-amber-50 border border-amber-200 rounded-xl px-5 py-3.5 mb-6 text-sm max-w-xl mx-auto">
        <div class="flex items-center gap-2 text-amber-700">
          <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span>Couldn't load live packages — showing default data.</span>
        </div>
        <button class="text-primary font-semibold hover:underline shrink-0" @click="fetchPackages">Retry</button>
      </div>

      <div v-if="!loading">
        <PackagesCarousel :packages="latestPackages" />
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import PackagesCarousel from './PackagesCarousel.vue'
import { useGeneralService } from '../services/general.service'

const rawPackages = ref([])
const loading = ref(true)
const error = ref(false)
const generalService = useGeneralService()

function toTitleCase(str = '') {
  return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
}

function mapPackage(pkg) {
  return {
    id: pkg.id,
    package_name: pkg.package_name,
    location: toTitleCase(pkg.location || pkg.country_code || ''),
    category: toTitleCase(pkg.category || ''),
    inclusions: pkg.inclusions || '',
    description: pkg.description || '',
    date_from: pkg.date_from || null,
    date_to: pkg.date_to || null,
    poster: pkg.poster || null,
    picture1: pkg.picture1 || null,
    picture2: pkg.picture2 || null,
    picture3: pkg.picture3 || null,
    picture4: pkg.picture4 || null,
    banner: pkg.banner || null,
  }
}

const latestPackages = computed(() =>
  rawPackages.value
    .filter(pkg => pkg.status === 1)
    .slice(0, 6)
    .map(mapPackage)
)

async function fetchPackages() {
  loading.value = true
  error.value = false
  try {
    const data = await generalService.getPackages('recent')
    const list = Array.isArray(data) ? data : (data?.data ?? data ?? [])
    if (!Array.isArray(list) || !list.length) throw new Error('Empty response')
    rawPackages.value = list
  } catch (err) {
    console.error('LatestPackages fetch error:', err)
    error.value       = true
    rawPackages.value = samplePackages
  } finally {
    loading.value = false
  }
}

onMounted(fetchPackages)

const samplePackages = [
  {
    id: 1,
    package_name: 'Premium Umrah Package - Complete Spiritual Journey',
    category: 'UMRAH',
    location: 'SAUDI ARABIA',
    status: 1,
    date_from: '2025-01-01 00:00:00',
    date_to:   '2025-12-31 00:00:00',
    inclusions: '',
    poster:   'https://images.unsplash.com/photo-1641108548286-6952aa3e3e3f?w=1080&q=80',
    picture1: null, picture2: null, picture3: null, picture4: null, banner: null,
  },
  {
    id: 2,
    package_name: 'Abu Dhabi Cultural Journey',
    category: 'TOURISM',
    location: 'ABU DHABI, UAE',
    status: 1,
    date_from: '2025-03-01 00:00:00',
    date_to:   '2025-11-30 00:00:00',
    inclusions: '',
    poster:   'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=1080&q=80',
    picture1: null, picture2: null, picture3: null, picture4: null, banner: null,
  },
  {
    id: 3,
    package_name: 'Maldives Paradise - Luxury Beach Escape',
    category: 'TOURISM',
    location: 'MALDIVES',
    status: 1,
    date_from: '2025-04-01 00:00:00',
    date_to:   '2025-10-31 00:00:00',
    inclusions: '',
    poster:   'https://images.unsplash.com/photo-1637576308588-6647bf80944d?w=1080&q=80',
    picture1: null, picture2: null, picture3: null, picture4: null, banner: null,
  },
  {
    id: 4,
    package_name: 'Egypt Pyramids & Nile Cruise',
    category: 'TOURISM',
    location: 'EGYPT',
    status: 1,
    date_from: '2025-02-01 00:00:00',
    date_to:   '2025-11-30 00:00:00',
    inclusions: '',
    poster:   'https://images.unsplash.com/photo-1539768942893-daf53e448371?w=1080&q=80',
    picture1: null, picture2: null, picture3: null, picture4: null, banner: null,
  },
  {
    id: 5,
    package_name: 'Explore Dubai: 4 Nights 5 Days',
    category: 'TOURISM',
    location: 'UNITED ARAB EMIRATES',
    status: 1,
    date_from: '2023-04-01 00:00:00',
    date_to:   '2023-03-31 00:00:00',
    inclusions: '3 Night stay in 4* hotel\nDaily Breakfast\nBurj Khalifa + Dubai Aquarium\nEvening Desert Safari with BBQ Dinner\nAirport transfers\n30 days Visa + Insurance',
    poster:   'https://images.unsplash.com/photo-1643904736472-8b77e93ca3d7?w=1080&q=80',
    picture1: null, picture2: null, picture3: null, picture4: null, banner: null,
  },
]
</script>
