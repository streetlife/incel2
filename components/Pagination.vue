<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

interface Props {
  totalItems: number
  itemsPerPage?: number
  currentPage?: number
  maxVisiblePages?: number
  showPageInfo?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  itemsPerPage: 10,
  currentPage: 1,
  maxVisiblePages: 5,
  showPageInfo: true
})

const emit = defineEmits<{
  'page-change': [page: number]
}>()

const router = useRouter()
const route = useRoute()

// Calculate total pages
const totalPages = computed(() => Math.ceil(props.totalItems / props.itemsPerPage))

// Calculate page range to display
const pageRange = computed(() => {
  const range: (number | string)[] = []
  const delta = Math.floor(props.maxVisiblePages / 2)

  let start = Math.max(2, props.currentPage - delta)
  let end = Math.min(totalPages.value - 1, props.currentPage + delta)

  // Adjust if we're near the beginning
  if (props.currentPage <= delta + 1) {
    end = Math.min(totalPages.value - 1, props.maxVisiblePages)
  }

  // Adjust if we're near the end
  if (props.currentPage >= totalPages.value - delta) {
    start = Math.max(2, totalPages.value - props.maxVisiblePages + 1)
  }

  // Always show first page
  range.push(1)

  // Add ellipsis if needed
  if (start > 2) {
    range.push('...')
  }

  // Add middle pages
  for (let i = start; i <= end; i++) {
    range.push(i)
  }

  // Add ellipsis if needed
  if (end < totalPages.value - 1) {
    range.push('...')
  }

  // Always show last page if there's more than 1 page
  if (totalPages.value > 1) {
    range.push(totalPages.value)
  }

  return range
})

// Calculate result range
const resultRange = computed(() => {
  const start = (props.currentPage - 1) * props.itemsPerPage + 1
  const end = Math.min(props.currentPage * props.itemsPerPage, props.totalItems)
  return { start, end }
})

const goToPage = (page: number | string) => {
  if (typeof page === 'string') return
  if (page < 1 || page > totalPages.value || page === props.currentPage) return

  // Update URL query params
  const query = { ...route.query, page: page.toString() }
  router.push({ query })

  // Emit event
  emit('page-change', page)

  // Scroll to top of results
  setTimeout(() => {
    const resultsElement = document.getElementById('search-results')
    if (resultsElement) {
      resultsElement.scrollIntoView({ behavior: 'smooth' })
    }
  }, 100)
}

const nextPage = () => {
  if (props.currentPage < totalPages.value) {
    goToPage(props.currentPage + 1)
  }
}

const prevPage = () => {
  if (props.currentPage > 1) {
    goToPage(props.currentPage - 1)
  }
}
</script>

<template>
  <div v-if="totalPages > 1" class="flex flex-col items-center gap-4 py-8">
    <!-- Page Info -->
    <div v-if="showPageInfo" class="text-sm text-gray-600">
      Showing {{ resultRange.start }} - {{ resultRange.end }} of {{ totalItems }} results
    </div>

    <!-- Pagination Controls -->
    <div class="flex items-center gap-2">
      <!-- Previous Button -->
      <button
        @click="prevPage"
        :disabled="currentPage === 1"
        :class="[
          'flex items-center gap-1 px-3 py-2 rounded-lg font-medium transition-colors',
          currentPage === 1
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
        ]"
      >
        <ChevronLeft class="w-4 h-4" />
        <span class="hidden sm:inline">Previous</span>
      </button>

      <!-- Page Numbers -->
      <div class="flex items-center gap-1">
        <button
          v-for="(page, index) in pageRange"
          :key="index"
          @click="goToPage(page)"
          :disabled="page === '...'"
          :class="[
            'min-w-[40px] h-10 px-3 rounded-lg font-medium transition-colors',
            page === currentPage
              ? 'bg-gray-900 text-white'
              : page === '...'
              ? 'bg-transparent text-gray-400 cursor-default'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
          ]"
        >
          {{ page }}
        </button>
      </div>

      <!-- Next Button -->
      <button
        @click="nextPage"
        :disabled="currentPage === totalPages"
        :class="[
          'flex items-center gap-1 px-3 py-2 rounded-lg font-medium transition-colors',
          currentPage === totalPages
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
        ]"
      >
        <span class="hidden sm:inline">Next</span>
        <ChevronRight class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>