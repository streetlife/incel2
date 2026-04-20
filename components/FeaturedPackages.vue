<template>
  <section class="py-24 bg-white sm:px-24 px-4 overflow-hidden">
    <div class="container mx-auto px-4">
      <div class="text-center mb-14 reveal">
        <p class="text-primary font-semibold mb-3 uppercase tracking-widest text-xs">Build Your Journey</p>
        <h2 class="text-4xl lg:text-5xl font-bold text-neutral-900 leading-tight mb-4">
          Curate Your Own<br />
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Travel Experience</span>
        </h2>
        <p class="text-lg text-neutral-500 max-w-xl mx-auto font-light">
          Choose your dream destination from our collection — then design every detail your way.
        </p>
      </div>

      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="i in 3" :key="i" class="rounded-2xl overflow-hidden bg-gray-100 animate-pulse h-[360px]">
          <div class="h-52 bg-gray-200"></div>
          <div class="p-5 space-y-3">
            <div class="h-3 bg-gray-200 rounded w-1/3"></div>
            <div class="h-5 bg-gray-200 rounded w-4/5"></div>
            <div class="h-10 bg-gray-200 rounded-xl mt-4"></div>
          </div>
        </div>
      </div>

      <div v-if="error && !loading" class="flex items-center justify-between gap-4 bg-amber-50 border border-amber-200 rounded-xl px-5 py-3.5 mb-8 text-sm">
        <div class="flex items-center gap-2 text-amber-700">
          <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span>Couldn't load live packages — showing sample data.</span>
        </div>
        <button class="text-primary font-semibold hover:underline shrink-0" @click="fetchPackages">Retry</button>
      </div>

      <div v-if="!loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="pkg in displayPackages"
          :key="pkg.id"
          class="group relative rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500 bg-white border border-gray-100"
          @click="openBuilder(pkg)"
        >
          <div class="relative h-52 overflow-hidden">
            <img
              :src="pkg.poster || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80'"
              :alt="pkg.package_name"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>

            <span class="absolute top-3 left-3 bg-white/20 backdrop-blur-sm text-white text-[11px] font-semibold px-3 py-1 rounded-full border border-white/30">
              {{ pkg.category }}
            </span>
          </div>

          <div class="p-5">
            <div class="flex items-center gap-1 text-gray-400 text-xs mb-2">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              {{ pkg.location }}
            </div>
            <h3 class="font-bold text-gray-900 text-base leading-snug mb-4 line-clamp-2">{{ pkg.package_name }}</h3>

            <button class="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-accent text-white font-semibold py-2.5 rounded-xl text-sm hover:opacity-90 transition-opacity group-hover:shadow-md">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
              </svg>
              Design My Experience
            </button>
          </div>
        </div>
      </div>

      <div class="text-center mt-12">
        <button class="btn-secondary">Explore All Destinations</button>
      </div>
    </div>

    <Transition name="modal">
      <div v-if="showBuilder" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" @click.self="closeBuilder">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeBuilder"></div>

        <div class="relative bg-white w-full sm:max-w-2xl sm:rounded-3xl rounded-t-3xl shadow-2xl z-10 max-h-[92vh] flex flex-col overflow-hidden">
          <div class="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 shrink-0">
            <div>
              <p class="text-[11px] font-semibold text-primary uppercase tracking-widest mb-0.5">Step {{ currentStep }} of 4</p>
              <h3 class="text-lg font-bold text-gray-900">{{ stepTitles[currentStep - 1] }}</h3>
            </div>
            <button @click="closeBuilder" class="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
              <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <div class="flex gap-1.5 px-6 py-3 shrink-0">
            <div v-for="i in 4" :key="i" class="h-1 flex-1 rounded-full transition-all duration-500"
              :class="i <= currentStep ? 'bg-gradient-to-r from-primary to-accent' : 'bg-gray-200'">
            </div>
          </div>

          <div class="flex-1 overflow-y-auto px-6 py-4">
            <div v-if="currentStep === 1" class="space-y-5">
              <div class="flex items-center gap-4 bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <img :src="selectedPkg?.poster" class="w-16 h-16 rounded-xl object-cover shrink-0" alt="" />
                <div>
                  <p class="font-bold text-gray-900 text-sm leading-snug">{{ selectedPkg?.package_name }}</p>
                  <p class="text-xs text-gray-400 mt-0.5">{{ selectedPkg?.location }}</p>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label for="" class="block text-xs font-semibold text-gray-600 mb-1.5">Departure Date</label>
                  <input v-model="form.departureDate" type="date" class="input-field" />
                </div>
                <div>
                  <label for="" class="block text-xs font-semibold text-gray-600 mb-1.5">Return Date</label>
                  <input v-model="form.returnDate" type="date" class="input-field" />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label for="" class="block text-xs font-semibold text-gray-600 mb-1.5">Number of Travellers</label>
                  <div class="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                    <button @click="form.travellers = Math.max(1, form.travellers - 1)" class="px-4 py-3 text-gray-500 hover:bg-gray-100 font-bold text-lg transition-colors">−</button>
                    <span class="flex-1 text-center font-bold text-gray-900 text-sm">{{ form.travellers }}</span>
                    <button @click="form.travellers = Math.min(20, form.travellers + 1)" class="px-4 py-3 text-gray-500 hover:bg-gray-100 font-bold text-lg transition-colors">+</button>
                  </div>
                </div>
                <div>
                  <label for="" class="block text-xs font-semibold text-gray-600 mb-1.5">Trip Type</label>
                  <select v-model="form.tripType" class="input-field">
                    <option value="leisure">Leisure</option>
                    <option value="honeymoon">Honeymoon</option>
                    <option value="family">Family</option>
                    <option value="group">Group Tour</option>
                    <option value="religious">Religious / Umrah</option>
                    <option value="business">Business</option>
                  </select>
                </div>
              </div>
            </div>

            <div v-if="currentStep === 2" class="space-y-5">
              <p class="text-sm text-gray-500">Customise your flight preferences for this trip.</p>

              <div>
                <label for="" class="block text-xs font-semibold text-gray-600 mb-2">Cabin Class</label>
                <div class="grid grid-cols-3 gap-3">
                  <button
                    v-for="cls in cabinClasses"
                    :key="cls.value"
                    @click="form.cabinClass = cls.value"
                    class="py-3 px-2 rounded-xl border-2 text-center text-xs font-semibold transition-all duration-200"
                    :class="form.cabinClass === cls.value ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 text-gray-500 hover:border-gray-300'"
                  >
                    <div class="text-xl mb-1">{{ cls.icon }}</div>
                    {{ cls.label }}
                  </button>
                </div>
              </div>

              <div>
                <label for="" class="block text-xs font-semibold text-gray-600 mb-2">Departure City</label>
                <input v-model="form.departureCity" type="text" placeholder="e.g. Lagos (LOS)" class="input-field" />
              </div>

              <div>
                <label for="" class="block text-xs font-semibold text-gray-600 mb-2">Flight Preference</label>
                <div class="space-y-2">
                  <label v-for="opt in flightPrefs" :key="opt.value"
                    class="flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all"
                    :class="form.flightPref === opt.value ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'">
                    <input type="radio" :value="opt.value" v-model="form.flightPref" class="accent-primary" />
                    <div>
                      <p class="text-sm font-semibold text-gray-800">{{ opt.label }}</p>
                      <p class="text-xs text-gray-400">{{ opt.desc }}</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div v-if="currentStep === 3" class="space-y-5">
              <p class="text-sm text-gray-500">Choose your accommodation style for this trip.</p>

              <div>
                <label for="" class="block text-xs font-semibold text-gray-600 mb-2">Hotel Star Rating</label>
                <div class="flex gap-2">
                  <button
                    v-for="stars in [3, 4, 5]"
                    :key="stars"
                    @click="form.hotelStars = stars"
                    class="flex-1 py-3 rounded-xl border-2 text-center text-sm font-bold transition-all duration-200"
                    :class="form.hotelStars === stars ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 text-gray-500 hover:border-gray-300'"
                  >
                    {{ '★'.repeat(stars) }}
                  </button>
                </div>
              </div>

              <div>
                <label for="" class="block text-xs font-semibold text-gray-600 mb-2">Room Type</label>
                <div class="grid grid-cols-2 gap-3">
                  <button
                    v-for="room in roomTypes"
                    :key="room.value"
                    @click="form.roomType = room.value"
                    class="py-3 px-4 rounded-xl border-2 text-left transition-all duration-200"
                    :class="form.roomType === room.value ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'"
                  >
                    <p class="text-sm font-semibold text-gray-800">{{ room.label }}</p>
                    <p class="text-xs text-gray-400 mt-0.5">{{ room.desc }}</p>
                  </button>
                </div>
              </div>

              <div>
                <label for="" class="block text-xs font-semibold text-gray-600 mb-2">Meal Plan</label>
                <select v-model="form.mealPlan" class="input-field">
                  <option value="none">No meals</option>
                  <option value="breakfast">Breakfast only</option>
                  <option value="half">Half board (B+D)</option>
                  <option value="full">Full board (B+L+D)</option>
                  <option value="all">All inclusive</option>
                </select>
              </div>
            </div>

            <div v-if="currentStep === 4" class="space-y-5">
              <div>
                <label for="" class="block text-xs font-semibold text-gray-600 mb-2">Activities & Experiences</label>
                <p class="text-xs text-gray-400 mb-3">Select everything you'd like included in your quote.</p>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label
                    v-for="act in activitiesFor(selectedPkg)"
                    :key="act"
                    class="flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all"
                    :class="form.activities.includes(act) ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'"
                  >
                    <input type="checkbox" :value="act" v-model="form.activities" class="accent-primary w-4 h-4 shrink-0" />
                    <span class="text-sm text-gray-700 leading-snug">{{ act }}</span>
                  </label>
                </div>
              </div>

              <div class="border-t border-gray-100 pt-5 space-y-4">
                <p class="text-xs font-semibold text-gray-600 uppercase tracking-widest">Your Contact Details</p>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label for="" class="block text-xs font-semibold text-gray-600 mb-1.5">Full Name *</label>
                    <input v-model="form.name" type="text" placeholder="John Doe" class="input-field" />
                  </div>
                  <div>
                    <label for="" class="block text-xs font-semibold text-gray-600 mb-1.5">Phone Number *</label>
                    <input v-model="form.phone" type="tel" placeholder="+234 800 000 0000" class="input-field" />
                  </div>
                </div>
                <div>
                  <label for="" class="block text-xs font-semibold text-gray-600 mb-1.5">Email Address *</label>
                  <input v-model="form.email" type="email" placeholder="you@example.com" class="input-field" />
                </div>
                <div>
                  <label for="" class="block text-xs font-semibold text-gray-600 mb-1.5">Additional Notes</label>
                  <textarea v-model="form.notes" rows="3" placeholder="Any special requests, dietary needs, or questions…" class="input-field resize-none"></textarea>
                </div>
              </div>
            </div>

          </div>

          <div class="px-6 pb-6 pt-4 border-t border-gray-100 shrink-0">
            <div v-if="currentStep === 4" class="flex flex-wrap gap-2 mb-4">
              <span v-if="form.departureDate" class="summary-chip">✈️ {{ formatDate(form.departureDate) }}</span>
              <span v-if="form.travellers" class="summary-chip">👥 {{ form.travellers }} traveller{{ form.travellers > 1 ? 's' : '' }}</span>
              <span v-if="form.cabinClass" class="summary-chip">🪑 {{ cabinClasses.find(c => c.value === form.cabinClass)?.label }}</span>
              <span v-if="form.hotelStars" class="summary-chip">{{ '★'.repeat(form.hotelStars) }} hotel</span>
              <span v-if="form.activities.length" class="summary-chip">🎯 {{ form.activities.length }} activit{{ form.activities.length > 1 ? 'ies' : 'y' }}</span>
            </div>

            <div class="flex gap-3">
              <button
                v-if="currentStep > 1"
                @click="prevStep"
                class="flex-1 border-2 border-gray-200 text-gray-600 font-semibold py-3 rounded-xl hover:border-gray-300 transition-colors text-sm"
              >
                ← Back
              </button>

              <button
                v-if="currentStep < 4"
                @click="nextStep"
                :disabled="!canProceed"
                class="flex-1 bg-gradient-to-r from-primary to-accent text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-all text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue →
              </button>

              <button
                v-if="currentStep === 4"
                @click="submitQuote"
                :disabled="!canSubmit || submitting"
                class="flex-1 bg-gradient-to-r from-primary to-accent text-white font-bold py-3 rounded-xl hover:opacity-90 transition-all text-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <svg v-if="submitting" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                <span>{{ submitting ? 'Sending…' : 'Get My Quote 🎉' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="toast">
      <div v-if="showSuccess" class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] bg-green-600 text-white px-6 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 text-sm font-semibold">
        <svg class="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
        </svg>
        Quote request sent! We'll be in touch within 24 hours.
      </div>
    </Transition>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useGeneralService } from '../services/general.service'

const rawPackages = ref([])
const loading = ref(true)
const error = ref(false)
const generalService = useGeneralService()
const showBuilder = ref(false)
const selectedPkg = ref(null)
const currentStep = ref(1)
const submitting = ref(false)
const showSuccess = ref(false)

const stepTitles = [
  'Choose Your Destination & Dates',
  'Flight Preferences',
  'Hotel & Accommodation',
  'Activities & Get Your Quote',
]

const defaultForm = () => ({
  departureDate: '',
  returnDate: '',
  travellers: 2,
  tripType: 'leisure',
  cabinClass: 'economy',
  departureCity: '',
  flightPref: 'direct',
  hotelStars: 4,
  roomType: 'double',
  mealPlan: 'breakfast',
  activities: [],
  name: '',
  email: '',
  phone: '',
  notes: '',
})
const form = ref(defaultForm())

const cabinClasses = [
  { value: 'economy', label: 'Economy', icon: '💺' },
  { value: 'business', label: 'Business', icon: '🛋️' },
  { value: 'first', label: 'First', icon: '👑' },
]

const flightPrefs = [
  { value: 'direct', label: 'Direct flights only', desc: 'No layovers, fastest route' },
  { value: 'cheapest', label: 'Best value', desc: 'We find the lowest fare, may include stops' },
  { value: 'flexible', label: 'Flexible dates', desc: 'We look ±3 days for better prices' },
]

const roomTypes = [
  { value: 'single', label: 'Single', desc: '1 bed for 1 person' },
  { value: 'double', label: 'Double', desc: '1 large bed' },
  { value: 'twin', label: 'Twin', desc: '2 separate beds' },
  { value: 'suite', label: 'Suite', desc: 'Luxury suite room' },
]

const activityMap = {
  default: [
    'City sightseeing tour',
    'Cultural / museum visits',
    'Airport transfers',
    'Dinner cruise',
    'Shopping excursion',
    'Photography session',
    'Spa & wellness',
  ],
  UMRAH: [
    'Ziyarah tours (Mecca & Medina)',
    'Guided Masjid visits',
    'Historical site tours',
    'Group Quran sessions',
    'Personal du\'a guide',
  ],
  TOURISM: [
    'City sightseeing tour',
    'Desert safari with BBQ dinner',
    'Boat/yacht cruise',
    'Theme park tickets',
    'Cultural & museum visits',
    'Snorkelling / diving',
    'Hot-air balloon ride',
    'Shopping excursion',
    'Spa & wellness day',
    'Photography session',
  ],
}

function activitiesFor(pkg) {
  if (!pkg) return activityMap.default
  return activityMap[pkg.category?.toUpperCase()] || activityMap.default
}

const canProceed = computed(() => {
  if (currentStep.value === 1) return form.value.departureDate && form.value.returnDate
  if (currentStep.value === 2) return !!form.value.departureCity
  return true
})

const canSubmit = computed(() =>
  form.value.name.trim() && form.value.email.trim() && form.value.phone.trim()
)

function openBuilder(pkg) {
  selectedPkg.value = pkg
  form.value = defaultForm()
  currentStep.value = 1
  showBuilder.value = true
  document.body.style.overflow = 'hidden'
}

function closeBuilder() {
  showBuilder.value = false
  document.body.style.overflow = ''
}

function nextStep() {
  if (canProceed.value && currentStep.value < 4) currentStep.value++
}

function prevStep() {
  if (currentStep.value > 1) currentStep.value--
}

async function submitQuote() {
  if (!canSubmit.value) return
  submitting.value = true

  const pkg = selectedPkg.value
  const lines = [
    `*New Trip Quote Request*`,
    ``,
    `*Destination:* ${pkg?.package_name} — ${pkg?.location}`,
    `*Dates:* ${form.value.departureDate} → ${form.value.returnDate}`,
    `*Travellers:* ${form.value.travellers} (${form.value.tripType})`,
    ``,
    `*Flight:* ${form.value.departureCity} | ${cabinClasses.find(c => c.value === form.value.cabinClass)?.label} | ${form.value.flightPref}`,
    `*Hotel:* ${form.value.hotelStars}★ | ${form.value.roomType} room | ${form.value.mealPlan}`,
    `*Activities:* ${form.value.activities.length ? form.value.activities.join(', ') : 'None selected'}`,
    ``,
    `*Name:* ${form.value.name}`,
    `*Email:* ${form.value.email}`,
    `*Phone:* ${form.value.phone}`,
    `*Notes:* ${form.value.notes || 'N/A'}`,
  ].join('\n')

  // Simulate brief processing delay
  await new Promise(r => setTimeout(r, 900))

  submitting.value = false
  closeBuilder()

  showSuccess.value = true
  setTimeout(() => { showSuccess.value = false }, 5000)

  window.open(`https://wa.me/?text=${encodeURIComponent(lines)}`, '_blank')
}

function toTitleCase(str = '') {
  return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
}

function mapPackage(pkg) {
  return {
    id: pkg.id,
    package_name: pkg.package_name,
    location: toTitleCase(pkg.location || pkg.country_code || ''),
    category: toTitleCase(pkg.category || ''),
    poster: pkg.poster,
  }
}

const displayPackages = computed(() =>
  rawPackages.value.filter(pkg => pkg.status === 1).slice(0, 6).map(mapPackage)
)

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

async function fetchPackages() {
  loading.value = true
  error.value = false
  try {
    const data = await generalService.getPackages('all')
    const list = Array.isArray(data) ? data : (data?.data ?? data ?? [])
    if (!Array.isArray(list) || !list.length) throw new Error('Empty response')
    rawPackages.value = list
  } catch (err) {
    console.error('FeaturedPackages fetch error:', err)
    error.value = true
    rawPackages.value = samplePackages
  } finally {
    loading.value = false
  }
}

onMounted(fetchPackages)
onUnmounted(() => { document.body.style.overflow = '' })

const samplePackages = [
  { id: 1, package_name: 'Explore Dubai: 4 Nights 5 Days', country_code: 'ARE', category: 'TOURISM', location: 'United Arab Emirates', status: 1, poster: 'https://images.unsplash.com/photo-1643904736472-8b77e93ca3d7?w=800&q=80' },
  { id: 2, package_name: 'Maldives Paradise – Luxury Beach Escape', country_code: 'MDV', category: 'TOURISM', location: 'Maldives', status: 1, poster: 'https://images.unsplash.com/photo-1637576308588-6647bf80944d?w=800&q=80' },
  { id: 3, package_name: 'Premium Umrah Package – Complete Spiritual Journey', country_code: 'SAU', category: 'UMRAH', location: 'Saudi Arabia', status: 1, poster: 'https://images.unsplash.com/photo-1641108548286-6952aa3e3e3f?w=800&q=80' },
  { id: 4, package_name: 'Turkish Delight – Istanbul & Cappadocia', country_code: 'TUR', category: 'TOURISM', location: 'Turkey', status: 1, poster: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&q=80' },
  { id: 5, package_name: 'Abu Dhabi Cultural Journey', country_code: 'ARE', category: 'TOURISM', location: 'Abu Dhabi, UAE', status: 1, poster: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=800&q=80' },
  { id: 6, package_name: 'Egypt Pyramids & Nile Cruise', country_code: 'EGY', category: 'TOURISM', location: 'Egypt', status: 1, poster: 'https://images.unsplash.com/photo-1539768942893-daf53e448371?w=800&q=80' },
]
</script>

<style scoped>
/* Input field base */
.input-field {
  @apply w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 bg-gray-50 focus:outline-none focus:border-primary focus:bg-white transition-all placeholder:text-gray-400;
}

/* Summary chips on step 4 */
.summary-chip {
  @apply text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full font-medium;
}

/* Modal transition */
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

/* Toast transition */
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