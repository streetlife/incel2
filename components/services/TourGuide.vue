<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import DateInput from '../forms/DateInput.vue'
import { Users } from 'lucide-vue-next'

const form = ref({
  destination: '',
  language: '',
  date: '',
  duration: '4',
  groupSize: 1,
  tourType: [] as string[],
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  specialRequests: ''
})

const errors = ref({
  destination: '',
  language: '',
  date: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  general: ''
})

const languages = [
  'English',
  'French',
  'Spanish',
  'German',
  'Italian',
  'Portuguese',
  'Arabic',
  'Mandarin',
  'Japanese',
  'Korean'
]

const tourTypes = [
  { value: 'historical', label: 'Historical Sites', icon: '🏛️' },
  { value: 'cultural', label: 'Cultural Experience', icon: '🎭' },
  { value: 'food', label: 'Food & Cuisine', icon: '🍽️' },
  { value: 'adventure', label: 'Adventure', icon: '🏔️' },
  { value: 'shopping', label: 'Shopping', icon: '🛍️' },
  { value: 'nature', label: 'Nature & Wildlife', icon: '🌿' },
  { value: 'photography', label: 'Photography', icon: '📸' },
  { value: 'nightlife', label: 'Nightlife', icon: '🌃' }
]

const guides = ref([
  {
    id: 1,
    name: 'Ahmed Hassan',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    languages: ['English', 'Arabic', 'French'],
    specialties: ['Historical Sites', 'Cultural Experience'],
    rating: 4.9,
    reviews: 234,
    experience: '8 years',
    price: 25000
  },
  {
    id: 2,
    name: 'Maria Santos',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    languages: ['English', 'Spanish', 'Portuguese'],
    specialties: ['Food & Cuisine', 'Cultural Experience'],
    rating: 5,
    reviews: 189,
    experience: '6 years',
    price: 30000
  },
  {
    id: 3,
    name: 'John Smith',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    languages: ['English', 'German'],
    specialties: ['Adventure', 'Nature & Wildlife'],
    rating: 4.8,
    reviews: 156,
    experience: '10 years',
    price: 28000
  },
  {
    id: 4,
    name: 'Yuki Tanaka',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    languages: ['English', 'Japanese', 'Mandarin'],
    specialties: ['Photography', 'Cultural Experience'],
    rating: 4.9,
    reviews: 201,
    experience: '7 years',
    price: 32000
  }
])

const pricePerHour = 15000

const totalPrice = computed(() => {
  return pricePerHour * Number.parseInt(form.value.duration)
})

// Clear errors on field change
watch(() => form.value.destination, () => { if (errors.value.destination) errors.value.destination = '' })
watch(() => form.value.language, () => { if (errors.value.language) errors.value.language = '' })
watch(() => form.value.date, () => { if (errors.value.date) errors.value.date = '' })
watch(() => form.value.firstName, () => { if (errors.value.firstName) errors.value.firstName = '' })
watch(() => form.value.lastName, () => { if (errors.value.lastName) errors.value.lastName = '' })
watch(() => form.value.email, () => { if (errors.value.email) errors.value.email = '' })
watch(() => form.value.phone, () => { if (errors.value.phone) errors.value.phone = '' })

const validateForm = (): boolean => {
  errors.value = {
    destination: '',
    language: '',
    date: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    general: ''
  }

  let isValid = true

  if (!form.value.destination) {
    errors.value.destination = 'Destination is required'
    isValid = false
  }

  if (!form.value.language) {
    errors.value.language = 'Language preference is required'
    isValid = false
  }

  if (!form.value.date) {
    errors.value.date = 'Date is required'
    isValid = false
  }

  if (!form.value.firstName) {
    errors.value.firstName = 'First name is required'
    isValid = false
  }

  if (!form.value.lastName) {
    errors.value.lastName = 'Last name is required'
    isValid = false
  }

  if (!form.value.email) {
    errors.value.email = 'Email is required'
    isValid = false
  } else if (!/\S+@\S+\.\S+/.test(form.value.email)) {
    errors.value.email = 'Invalid email format'
    isValid = false
  }

  if (!form.value.phone) {
    errors.value.phone = 'Phone number is required'
    isValid = false
  }

  if (form.value.tourType.length === 0) {
    errors.value.general = 'Please select at least one tour interest'
    isValid = false
  }

  return isValid
}

const submit = () => {
  if (!validateForm()) {
    const firstError = document.querySelector('.border-red-500')
    if (firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
    return
  }

  console.log('Tour guide request:', form.value)
  alert('Tour guide request submitted successfully!')
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0
  }).format(price)
}

onMounted(() => {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-visible')
        observer.unobserve(entry.target)
      }
    })
  }, observerOptions)

  document.querySelectorAll('.reveal').forEach(el => {
    observer.observe(el)
  })
})
</script>

<template>
  <div>
    <!-- Hero Section -->
    <section 
      class="relative py-40 px-6 bg-cover bg-center bg-no-repeat"
      style="background-image: url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600')"
    >
      <div class="absolute inset-0 bg-black/50"></div>
      
      <div class="relative z-10 max-w-7xl mx-auto text-center">
        <h1 class="text-4xl md:text-5xl font-bold mb-4 text-white">
          Professional Tour Guides
        </h1>
        <p class="text-xl text-gray-100">
          Expert local guides for unforgettable experiences
        </p>
      </div>
    </section>

    <!-- Featured Guides Section -->
    <section class="py-16 px-6 bg-white">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-12 reveal">
          <h2 class="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Meet Our Expert Guides</h2>
          <p class="text-lg text-gray-600">Experienced professionals ready to show you the best of your destination</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div 
            v-for="(guide, index) in guides" 
            :key="guide.id"
            class="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden reveal"
            :style="{ transitionDelay: `${index * 100}ms` }"
          >
            <img :src="guide.image" :alt="guide.name" class="w-full h-48 object-cover" />
            <div class="p-5">
              <div class="flex items-center gap-2 mb-3">
                <Users class="w-5 h-5 text-primary" />
                <h3 class="text-lg font-bold text-gray-900">{{ guide.name }}</h3>
              </div>

              <div class="flex items-center gap-2 mb-3">
                <span class="text-yellow-500">★</span>
                <span class="font-semibold">{{ guide.rating }}</span>
                <span class="text-gray-600 text-sm">({{ guide.reviews }} reviews)</span>
              </div>

              <div class="mb-3">
                <p class="text-xs text-gray-600 mb-1">Languages:</p>
                <div class="flex flex-wrap gap-1">
                  <span 
                    v-for="lang in guide.languages" 
                    :key="lang"
                    class="px-2 py-1 bg-blue-50 text-primary text-xs rounded-full"
                  >
                    {{ lang }}
                  </span>
                </div>
              </div>

              <div class="mb-3">
                <p class="text-xs text-gray-600 mb-1">Specialties:</p>
                <div class="flex flex-wrap gap-1">
                  <span 
                    v-for="specialty in guide.specialties" 
                    :key="specialty"
                    class="px-2 py-1 bg-green-50 text-primary text-xs rounded-full"
                  >
                    {{ specialty }}
                  </span>
                </div>
              </div>

              <div class="flex items-center justify-between pt-3 border-t">
                <div>
                  <p class="text-xs text-gray-600">From</p>
                  <p class="text-lg font-bold text-primary">{{ formatPrice(guide.price) }}/day</p>
                </div>
                <button class="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/80 transition-colors">
                  Book
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Request Form Section -->
    <section class="py-16 px-6 bg-gray-50">
      <div class="max-w-5xl mx-auto">
        <div class="bg-white rounded-xl shadow-lg p-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">Request a Tour Guide</h2>

          <!-- General Error -->
          <div v-if="errors.general" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-red-600 text-sm font-medium">{{ errors.general }}</p>
          </div>

          <form @submit.prevent="submit" class="space-y-6">
            <!-- Tour Details -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="destination" class="block text-sm font-medium text-gray-700 mb-2">
                  Destination *
                </label>
                <input 
                  v-model="form.destination"
                  type="text"
                  placeholder="e.g., Paris, France"
                  :class="[
                    'w-full px-4 py-3 rounded-lg focus:ring-2 focus:border-transparent',
                    errors.destination 
                      ? 'border-red-500 focus:ring-red-500 border-2' 
                      : 'border border-gray-300 focus:ring-primary'
                  ]"
                />
              </div>

              <div>
                <label for="language" class="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Language *
                </label>
                <select 
                  v-model="form.language"
                  :class="[
                    'w-full px-4 py-3 rounded-lg focus:ring-2 focus:border-transparent',
                    errors.language 
                      ? 'border-red-500 focus:ring-red-500 border-2' 
                      : 'border border-gray-300 focus:ring-primary'
                  ]"
                >
                  <option value="">Select Language</option>
                  <option v-for="lang in languages" :key="lang" :value="lang">
                    {{ lang }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Date & Duration -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <DateInput
                  v-model="form.date"
                  label="Tour Date *"
                  :allow-past-dates="false"
                  :class="{ 'border-red-500 focus:ring-red-500': errors.date }"
                />
              </div>

              <div>
                <label for="duration" class="block text-sm font-medium text-gray-700 mb-2">
                  Duration (Hours)
                </label>
                <select 
                  v-model="form.duration"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="2">2 Hours</option>
                  <option value="4">4 Hours (Half Day)</option>
                  <option value="8">8 Hours (Full Day)</option>
                  <option value="12">12 Hours (Extended)</option>
                </select>
              </div>

              <div>
                <label for="groupSize" class="block text-sm font-medium text-gray-700 mb-2">
                  Group Size
                </label>
                <input 
                  v-model.number="form.groupSize"
                  type="number"
                  min="1"
                  max="30"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            <!-- Tour Interests -->
            <div>
              <label for="tourType" class="block text-sm font-medium text-gray-700 mb-3">
                Tour Interests *
              </label>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                <label 
                  v-for="type in tourTypes" 
                  :key="type.value"
                  class="flex items-center gap-2 p-3 border-2 border-gray-200 rounded-lg hover:bg-orange-50 cursor-pointer transition-colors"
                >
                  <input 
                    v-model="form.tourType"
                    type="checkbox"
                    :value="type.value"
                    class="w-4 h-4 text-primary"
                  />
                  <span class="text-2xl">{{ type.icon }}</span>
                  <span class="text-sm font-medium text-gray-700">{{ type.label }}</span>
                </label>
              </div>
            </div>

            <!-- Personal Information -->
            <div class="border-t pt-6">
              <h3 class="text-lg font-bold text-gray-900 mb-4">Contact Information</h3>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label for="firstName" class="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input 
                    v-model="form.firstName"
                    type="text"
                    :class="[
                      'w-full px-4 py-3 rounded-lg focus:ring-2 focus:border-transparent',
                      errors.firstName 
                        ? 'border-red-500 focus:ring-red-500 border-2' 
                        : 'border border-gray-300 focus:ring-primary'
                    ]"
                  />
                </div>

                <div>
                  <label for="lastName" class="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input 
                    v-model="form.lastName"
                    type="text"
                    :class="[
                      'w-full px-4 py-3 rounded-lg focus:ring-2 focus:border-transparent',
                      errors.lastName 
                        ? 'border-red-500 focus:ring-red-500 border-2' 
                        : 'border border-gray-300 focus:ring-primary'
                    ]"
                  />
                </div>

                <div>
                  <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input 
                    v-model="form.email"
                    type="email"
                    :class="[
                      'w-full px-4 py-3 rounded-lg focus:ring-2 focus:border-transparent',
                      errors.email 
                        ? 'border-red-500 focus:ring-red-500 border-2' 
                        : 'border border-gray-300 focus:ring-primary'
                    ]"
                  />
                </div>

                <div>
                  <label for="phone" class="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input 
                    v-model="form.phone"
                    type="tel"
                    :class="[
                      'w-full px-4 py-3 rounded-lg focus:ring-2 focus:border-transparent',
                      errors.phone 
                        ? 'border-red-500 focus:ring-red-500 border-2' 
                        : 'border border-gray-300 focus:ring-primary'
                    ]"
                  />
                </div>
              </div>

              <div class="mt-4">
                <label for="specialRequests" class="block text-sm font-medium text-gray-700 mb-2">
                  Special Requests (Optional)
                </label>
                <textarea 
                  v-model="form.specialRequests"
                  rows="3"
                  placeholder="Specific interests, accessibility needs, etc."
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                ></textarea>
              </div>
            </div>

            <!-- Submit -->
            <div class="flex items-center justify-between pt-6 border-t">
              <div>
                <p class="text-sm text-gray-600">Estimated Price</p>
                <p class="text-3xl font-bold text-primary">{{ formatPrice(totalPrice) }}</p>
                <p class="text-xs text-gray-500 mt-1">
                  {{ form.duration }} hours at {{ formatPrice(pricePerHour) }}/hour
                </p>
              </div>
              <button 
                type="submit"
                class="px-8 py-4 bg-primary text-white rounded-lg font-bold text-lg hover:bg-primary transition-colors"
              >
                Request Guide
              </button>
            </div>
          </form>
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

