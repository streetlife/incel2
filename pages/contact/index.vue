<script setup lang="ts">
import { onMounted } from 'vue'
import { MapPin, Phone, Mail, Clock, MessageCircle } from 'lucide-vue-next'
import { useContactData } from '../../composables/useContactData'
import { useContactForm } from '../../composables/useContactForm'

const { offices, quickSupport } = useContactData()
const {
  form,
  errors,
  setupErrorWatchers,
  submitMessage,
  resetForm
} = useContactForm()

const handleSubmit = () => {
  if (submitMessage()) {
    console.log('Message submitted:', form.value)
    alert('Thank you for your message! We\'ll get back to you within 24 hours.')
    resetForm()
  }
}

onMounted(() => {
  setupErrorWatchers()
})
</script>

<template>
  <div class="min-h-screen">
    <!-- Hero Section -->
    <section 
      class="relative py-44 px-6 bg-cover bg-center bg-no-repeat"
      style="background-image: linear-gradient(rgba(0, 0, 0, 0.85), rgba(0, 0, 0, 0.75)), url('https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1600')"
    >
      <div class="max-w-7xl mx-auto text-center">
        <h1 class="text-4xl md:text-5xl font-bold text-white mb-4">
          Get in Touch
        </h1>
        <p class="text-xl text-gray-300">
          We're here to help you plan your next adventure. Reach out to us for personalized travel guidance.
        </p>
      </div>
    </section>

    <!-- Office Information Cards -->
    <section class="py-16 px-6 bg-gray-50">
      <div class="max-w-7xl mx-auto">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Dubai & Lagos Offices -->
          <div 
            v-for="office in offices" 
            :key="office.id"
            class="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300"
          >
            <div class="text-4xl mb-4">
                <component :is="office.icon" v-if="typeof office.icon !== 'string'" class="w-8 h-8 text-[#0076ad]" />
                <span v-else>{{ office.icon }}</span>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-6">{{ office.title }}</h3>
            
            <div class="space-y-4">
              <div class="flex items-start gap-3">
                <MapPin class="w-5 h-5 text-[#0076ad] flex-shrink-0 mt-1" />
                <p class="text-gray-600 whitespace-pre-line">{{ office.address }}</p>
              </div>

              <div class="flex items-center gap-3">
                <Phone class="w-5 h-5 text-[#0076ad] flex-shrink-0" />
                <a :href="office.phoneLink" class="text-gray-600 hover:text-[#0076ad] transition-colors">
                  {{ office.phone }}
                </a>
              </div>

              <div class="flex items-center gap-3">
                <Mail class="w-5 h-5 text-[#0076ad] flex-shrink-0" />
                <a :href="`mailto:${office.email}`" class="text-gray-600 hover:text-[#0076ad] transition-colors">
                  {{ office.email }}
                </a>
              </div>

              <div class="flex items-center gap-3">
                <Clock class="w-5 h-5 text-[#0076ad] flex-shrink-0" />
                <p class="text-gray-600">{{ office.hours }}</p>
              </div>
            </div>
          </div>

          <!-- Quick Support Card -->
          <div class="bg-gray-900 rounded-xl shadow-lg p-8 text-white">
            <h3 class="text-2xl font-bold mb-4">{{ quickSupport.title }}</h3>
            <p class="text-gray-300 mb-6">
              {{ quickSupport.description }}
            </p>

            <div class="space-y-3">
              <a 
                :href="quickSupport.whatsappLink"
                target="_blank"
                class="flex items-center justify-center gap-2 w-full py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-colors"
              >
                <MessageCircle class="w-5 h-5" />
                Chat on WhatsApp
              </a>
              <a 
                :href="quickSupport.phoneLink"
                class="flex items-center justify-center gap-2 w-full py-3 bg-[#0076ad] hover:bg-[#005a87] rounded-lg font-semibold transition-colors"
              >
                <Phone class="w-5 h-5" />
                Call Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact Form Section -->
    <section class="py-16 px-6 bg-white">
      <div class="max-w-4xl mx-auto">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Send us a Message
          </h2>
          <p class="text-lg text-gray-600">
            Fill out the form below and we'll get back to you within 24 hours.
          </p>
        </div>

        <!-- Form Card -->
        <div class="bg-gray-50 rounded-xl shadow-lg p-8">
          <form @submit.prevent="handleSubmit" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Name -->
              <div>
                <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
                  Your Name *
                </label>
                <input 
                  id="name"
                  v-model="form.name"
                  type="text"
                  placeholder="John Doe"
                  :class="[
                    'w-full px-4 py-3 rounded-lg focus:ring-2 focus:border-transparent',
                    errors.name
                      ? 'border-red-500 focus:ring-red-500 border-2'
                      : 'border border-gray-300 focus:ring-[#0076ad] bg-white'
                  ]"
                />
                <p v-if="errors.name" class="mt-1 text-xs text-red-600">{{ errors.name }}</p>
              </div>

              <!-- Email -->
              <div>
                <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input 
                  id="email"
                  v-model="form.email"
                  type="email"
                  placeholder="john@example.com"
                  :class="[
                    'w-full px-4 py-3 rounded-lg focus:ring-2 focus:border-transparent',
                    errors.email
                      ? 'border-red-500 focus:ring-red-500 border-2'
                      : 'border border-gray-300 focus:ring-[#0076ad] bg-white'
                  ]"
                />
                <p v-if="errors.email" class="mt-1 text-xs text-red-600">{{ errors.email }}</p>
              </div>

              <!-- Phone -->
              <div>
                <label for="phone" class="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input 
                  id="phone"
                  v-model="form.phone"
                  type="tel"
                  placeholder="+234 xxx xxx xxxx"
                  :class="[
                    'w-full px-4 py-3 rounded-lg focus:ring-2 focus:border-transparent',
                    errors.phone
                      ? 'border-red-500 focus:ring-red-500 border-2'
                      : 'border border-gray-300 focus:ring-[#0076ad] bg-white'
                  ]"
                />
                <p v-if="errors.phone" class="mt-1 text-xs text-red-600">{{ errors.phone }}</p>
              </div>

              <!-- Subject -->
              <div>
                <label for="subject" class="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <input 
                  id="subject"
                  v-model="form.subject"
                  type="text"
                  placeholder="How can we help?"
                  :class="[
                    'w-full px-4 py-3 rounded-lg focus:ring-2 focus:border-transparent',
                    errors.subject
                      ? 'border-red-500 focus:ring-red-500 border-2'
                      : 'border border-gray-300 focus:ring-[#0076ad] bg-white'
                  ]"
                />
                <p v-if="errors.subject" class="mt-1 text-xs text-red-600">{{ errors.subject }}</p>
              </div>

              <!-- Message -->
              <div class="md:col-span-2">
                <label for="message" class="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea 
                  id="message"
                  v-model="form.message"
                  rows="6"
                  placeholder="Tell us about your inquiry..."
                  :class="[
                    'w-full px-4 py-3 rounded-lg focus:ring-2 focus:border-transparent',
                    errors.message
                      ? 'border-red-500 focus:ring-red-500 border-2'
                      : 'border border-gray-300 focus:ring-[#0076ad] bg-white'
                  ]"
                ></textarea>
                <p v-if="errors.message" class="mt-1 text-xs text-red-600">{{ errors.message }}</p>
              </div>
            </div>

            <!-- Submit Button -->
            <button 
              type="submit"
              class="w-full py-4 bg-gray-900 text-white rounded-lg font-bold text-lg hover:bg-gray-800 transition-colors"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </section>
  </div>
</template>
