<template>
  <div class="min-h-screen bg-gray-50">
    <div v-if="loading" class="min-h-screen flex items-center justify-center">
      <div class="flex flex-col items-center gap-4">
        <div class="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
        <p class="text-sm text-gray-400 font-medium">Loading package details…</p>
      </div>
    </div>

    <div v-else-if="error" class="min-h-screen flex items-center justify-center px-4">
      <div class="text-center max-w-md">
        <div class="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-red-400" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/>
          </svg>
        </div>
        <h2 class="text-xl font-bold text-gray-900 mb-2">Package not found</h2>
        <p class="text-gray-500 text-sm mb-6">We couldn't load this package. It may have been removed or the link is incorrect.</p>
        <button @click="$router.back()" class="btn-primary px-6 py-2.5 rounded-full text-sm font-semibold">
          Go Back
        </button>
      </div>
    </div>

    <template v-else-if="pkg">
      <div class="relative h-[55vh] md:h-[65vh] w-full overflow-hidden">
        <img
          :src="heroImage"
          :alt="pkg.package_name"
          class="w-full h-full object-cover scale-105"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10"></div>

        <button
          @click="$router.back()"
          class="absolute top-6 left-4 md:left-8 flex items-center gap-2 text-white/90 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
          Back
        </button>

        <div class="absolute bottom-0 left-0 right-0 px-4 md:px-8 lg:px-16 pb-8 md:pb-12">
          <div class="max-w-5xl mx-auto">
            <div class="flex flex-wrap items-center gap-2 mb-3">
              <span class="badge-primary text-xs">{{ pkg.category }}</span>
              <span class="flex items-center gap-1 text-xs text-white/80 bg-white/15 backdrop-blur-sm px-3 py-1 rounded-full">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                {{ pkg.location }}
              </span>
              <span v-if="pkg.date_from" class="flex items-center gap-1 text-xs text-white/80 bg-white/15 backdrop-blur-sm px-3 py-1 rounded-full">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                {{ formatDate(pkg.date_from) }}<span v-if="pkg.date_to"> → {{ formatDate(pkg.date_to) }}</span>
              </span>
            </div>
            <h1 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight drop-shadow-lg max-w-3xl">
              {{ pkg.package_name }}
            </h1>
          </div>
        </div>
      </div>

      <div v-if="galleryImages.length > 1" class="bg-gray-900 px-4 md:px-8 lg:px-16 py-4">
        <div class="max-w-5xl mx-auto flex gap-3 overflow-x-auto scrollbar-hide pb-1">
          <button
            v-for="(img, i) in galleryImages"
            :key="i"
            @click="activeGalleryImg = i"
            class="shrink-0 w-20 h-14 md:w-28 md:h-20 rounded-lg overflow-hidden border-2 transition-all duration-200"
            :class="activeGalleryImg === i ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'"
          >
            <img :src="img" class="w-full h-full object-cover" alt="" />
          </button>
        </div>
      </div>

      <div class="max-w-5xl mx-auto px-4 md:px-8 lg:px-0 py-10 md:py-14">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          <div class="lg:col-span-2 space-y-8">
            <div v-if="pkg.description" class="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
              <h2 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span class="w-1 h-5 bg-primary rounded-full block"></span>
                About This Package
              </h2>
              <p class="text-gray-600 leading-relaxed text-sm whitespace-pre-line">{{ pkg.description }}</p>
            </div>

            <div v-if="parsedInclusions.length" class="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
              <h2 class="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                <span class="w-1 h-5 bg-green-500 rounded-full block"></span>
                What's Included
              </h2>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div
                  v-for="item in parsedInclusions"
                  :key="item"
                  class="flex items-start gap-3 bg-green-50 rounded-xl px-4 py-3"
                >
                  <svg class="w-4 h-4 text-green-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                  <span class="text-sm text-gray-700 leading-snug">{{ item }}</span>
                </div>
              </div>
            </div>

            <div v-if="parsedExclusions.length" class="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
              <h2 class="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                <span class="w-1 h-5 bg-red-400 rounded-full block"></span>
                Not Included
              </h2>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div
                  v-for="item in parsedExclusions"
                  :key="item"
                  class="flex items-start gap-3 bg-red-50 rounded-xl px-4 py-3"
                >
                  <svg class="w-4 h-4 text-red-400 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm4.707-11.293a1 1 0 00-1.414 0L10 9.586 6.707 6.293a1 1 0 00-1.414 1.414L8.586 11l-3.293 3.293a1 1 0 101.414 1.414L10 12.414l3.293 3.293a1 1 0 001.414-1.414L11.414 11l3.293-3.293a1 1 0 000-1.414z" clip-rule="evenodd"/>
                  </svg>
                  <span class="text-sm text-gray-700 leading-snug">{{ item }}</span>
                </div>
              </div>
            </div>

            <div v-if="parsedTerms.length" class="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
              <h2 class="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                <span class="w-1 h-5 bg-amber-400 rounded-full block"></span>
                Terms & Conditions
              </h2>
              <ul class="space-y-2">
                <li
                  v-for="item in parsedTerms"
                  :key="item"
                  class="flex items-start gap-2.5 text-sm text-gray-600"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 shrink-0"></span>
                  {{ item }}
                </li>
              </ul>
            </div>
          </div>

          <div class="lg:col-span-1">
            <div class="sticky top-6 bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
              <div class="h-36 overflow-hidden">
                <img :src="heroImage" :alt="pkg.package_name" class="w-full h-full object-cover" />
              </div>

              <div class="p-6 space-y-4">
                <div>
                  <h3 class="font-bold text-gray-900 text-base leading-snug">{{ pkg.package_name }}</h3>
                  <p class="text-xs text-gray-400 mt-1">{{ pkg.location }}</p>
                </div>

                <div v-if="pkg.date_from" class="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-xl px-3 py-2.5">
                  <svg class="w-4 h-4 text-primary shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  <span>{{ formatDate(pkg.date_from) }}<span v-if="pkg.date_to"> → {{ formatDate(pkg.date_to) }}</span></span>
                </div>

                <div class="border-t border-gray-100"></div>

                <a
                  :href="`https://wa.me/?text=Hi, I'm interested in the package: ${encodeURIComponent(pkg.package_name)}`"
                  target="_blank"
                  rel="noopener"
                  class="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#1ebe5d] text-white font-semibold py-3 rounded-xl transition-colors duration-200 text-sm"
                >
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Enquire on WhatsApp
                </a>

                <a
                  href="tel:+2348000000000"
                  class="flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-xl transition-colors duration-200 text-sm"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                  </svg>
                  Call to Book
                </a>

                <p class="text-[11px] text-gray-400 text-center leading-relaxed">
                  Our team is available Mon–Sat, 8am–6pm WAT
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useGeneralService } from '../../services/general.service'

const route = useRoute()
const generalService = useGeneralService()

const pkg = ref(null)
const loading = ref(true)
const error = ref(false)

const activeGalleryImg = ref(0)

const galleryImages = computed(() => {
  if (!pkg.value) return []
  return [
    pkg.value.poster,
    pkg.value.picture1,
    pkg.value.picture2,
    pkg.value.picture3,
    pkg.value.picture4,
    pkg.value.banner,
  ].filter(Boolean)
})

const heroImage = computed(() =>
  galleryImages.value[activeGalleryImg.value] ||
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&q=80'
)

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function parseTextBlock(raw = '') {
  return raw
    .split('\n')
    .map(l => l.trim())
    .filter(l => {
      if (!l || l.length < 4) return false
      if (/^(INCLUSIONS|EXCLUSIONS|TERMS|NOTE)\s*:?$/i.test(l)) return false
      if (l.endsWith(':') && l.length < 30) return false
      return true
    })
}

const parsedInclusions = computed(() => parseTextBlock(pkg.value?.inclusions))
const parsedExclusions = computed(() => parseTextBlock(pkg.value?.exclusions))
const parsedTerms = computed(() => parseTextBlock(pkg.value?.terms))

async function fetchPackage() {
  loading.value = true
  error.value   = false
  try {
    const data = await generalService.getPackage(route.params.id)
    pkg.value = data?.data ?? data ?? null
    if (!pkg.value) throw new Error('No data')
  } catch (err) {
    console.error('Package detail fetch error:', err)
    error.value = true
  } finally {
    loading.value = false
  }
}

onMounted(fetchPackage)
</script>
