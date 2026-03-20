<template>
  <div class="card group cursor-pointer h-full flex flex-col">
    <div class="relative h-64 overflow-hidden flex-shrink-0">
      <img
        :src="heroImage"
        :alt="package.package_name"
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        @error="onImageError"
      />
      <div class="absolute top-4 left-4">
        <span class="badge-success">{{ package.category }}</span>
      </div>
    </div>

    <div class="p-6 flex flex-col flex-grow">
      <div v-if="package.location" class="flex items-center gap-1 text-sm text-gray-500 mb-2">
        <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
        <span class="truncate">{{ package.location }}</span>
      </div>

      <h3 class="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors line-clamp-2">
        {{ package.package_name }}
      </h3>

      <div v-if="package.date_from || package.date_to" class="flex items-center gap-1.5 text-sm text-gray-500 mb-4">
        <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
        <span>{{ formatDate(package.date_from) }}</span>
        <span v-if="package.date_to"> → {{ formatDate(package.date_to) }}</span>
      </div>

      <div v-if="parsedFeatures.length" class="space-y-1.5 mb-4">
        <div
          v-for="feature in parsedFeatures"
          :key="feature"
          class="flex items-start gap-2 text-sm text-gray-600"
        >
          <svg class="w-4 h-4 text-green-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
          </svg>
          <span>{{ feature }}</span>
        </div>
      </div>

      <div class="flex-grow"></div>

      <div class="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
        <p class="text-sm font-semibold text-primary">Contact us for pricing</p>
        <button @click="navigate(package.id)" v-if="showButton" class="btn-accent text-sm">
          View Details
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { navigateTo } from 'nuxt/app'
import { computed } from 'vue'

const props = defineProps({
  package: {
    type: Object,
    required: true,
  },
  showButton: {
    type: Boolean,
    default: true,
  },
})

const heroImage = computed(() => {
  const pkg = props.package
  return (
    pkg.poster ||
    pkg.picture1 ||
    pkg.picture2 ||
    pkg.picture3 ||
    pkg.picture4 ||
    pkg.banner ||
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80'
  )
})

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80'

function onImageError(event: Event) {
  const img = event.target as HTMLImageElement
  if (img.src !== FALLBACK_IMAGE) {
    img.src = FALLBACK_IMAGE
  }
}

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
}

const parsedFeatures = computed(() => {
  const raw = props.package.inclusions || props.package.description || ''
  return raw
    .split('\n')
    .map((line: string) => line.trim())
    .filter((line: string) => {
      if (!line) return false
      if (/^INCLUSIONS\s*:?$/i.test(line)) return false
      if (/^EXCLUSIONS\s*:?$/i.test(line)) return false
      if (/^NOTE\s*:?$/i.test(line)) return false
      if (/^\d+\.\s/.test(line)) return false
      if (line.endsWith(':')) return false
      if (line.length < 4) return false
      return true
    })
    .slice(0, 4)
})

const navigate = (id: number) => {
  navigateTo(`packages/${id}`)
}
</script>
