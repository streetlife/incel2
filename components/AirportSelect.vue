<template>
  <div class="relative">
    <!-- Label -->
    <label
      v-if="label"
      :for="id"
      class="block text-sm font-medium text-gray-700 mb-2"
    >
      {{ label }}
    </label>
    <!-- Input -->
    <div class="relative">
      <input
        :id="id"
        ref="inputRef"
        type="text"
        :class="[
          'w-full px-4 py-[15px] border text-sm rounded-lg focus:ring-2 focus:border-transparent',
          hasError 
            ? 'border-red-500 focus:ring-red-500' 
            : 'border-gray-300 focus:ring-[#0076ad]'
        ]"
        :placeholder="placeholder"
        :value="modelValue"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        autocomplete="off"
      />
      <!-- Loading spinner -->
      <div
        v-if="loading"
        class="absolute right-3 top-1/2 -translate-y-1/2"
      >
        <svg class="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    </div>

    <!-- Teleport dropdown to body -->
    <Teleport to="body">
      <!-- Dropdown -->
      <ul
        v-if="open && suggestions.length"
        :style="dropdownStyle"
        class="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
      >
        <li
          v-for="option in suggestions"
          :key="option"
          @mousedown.prevent="select(option)"
          class="px-4 py-2 cursor-pointer hover:bg-gray-100 text-sm"
        >
          {{ option }}
        </li>
      </ul>
      
      <!-- No results message -->
      <div
        v-if="open && !loading && !suggestions.length && modelValue"
        :style="dropdownStyle"
        class="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-3 text-gray-500 text-sm"
      >
        No results found
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted, onMounted, computed, useAttrs } from "vue"

/* Props */
const props = defineProps({
  modelValue: {
    type: String,
    default: ""
  },
  label: {
    type: String,
    default: ""
  },
  placeholder: {
    type: String,
    default: "City or airport"
  },
  options: {
    type: Array as () => string[],
    required: true
  },
  id: {
    type: String,
    default: () => `airport-${Math.random().toString(36).slice(2)}`
  },
  debounceMs: {
    type: Number,
    default: 300
  }
})

/* Emits */
const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

/* Attrs */
const attrs = useAttrs()

/* Computed - Check if component has error styling */
const hasError = computed(() => {
  const classAttr = attrs.class
  if (!classAttr) return false
  
  // Check if class includes border-red-500
  if (typeof classAttr === 'string') {
    return classAttr.includes('border-red-500')
  }
  
  if (Array.isArray(classAttr)) {
    return classAttr.some(c => typeof c === 'string' && c.includes('border-red-500'))
  }
  
  if (typeof classAttr === 'object' && classAttr !== null) {
    return Object.hasOwn(classAttr, 'border-red-500') && 
           (classAttr as Record<string, boolean>)['border-red-500'] === true
  }
  
  return false
})

/* State */
const open = ref(false)
const loading = ref(false)
const suggestions = ref<string[]>([])
const inputRef = ref<HTMLInputElement | null>(null)
const dropdownStyle = ref<Record<string, string>>({})
let debounceTimer: ReturnType<typeof setTimeout> | null = null

/* Mock API function - Replace this with your actual API call */
const fetchSuggestions = async (query: string): Promise<string[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // Mock data - filter from props.options
  if (!query) return props.options
  
  return props.options.filter(option =>
    option.toLowerCase().includes(query.toLowerCase())
  )
}

/* Calculate dropdown position */
const calculateDropdownPosition = () => {
  if (!inputRef.value) return

  const rect = inputRef.value.getBoundingClientRect()
  const dropdownMaxHeight = 240 // max-h-60 = 240px
  const spaceBelow = window.innerHeight - rect.bottom
  const spaceAbove = rect.top

  // Determine if dropdown should open above or below
  const openAbove = spaceBelow < dropdownMaxHeight && spaceAbove > spaceBelow

  dropdownStyle.value = {
    width: `${rect.width}px`,
    left: `${rect.left}px`,
    top: openAbove ? `${rect.top - dropdownMaxHeight - 8}px` : `${rect.bottom + 4}px`,
  }
}

/* Update position on scroll/resize */
const updatePosition = () => {
  if (open.value) {
    calculateDropdownPosition()
  }
}

/* Debounced API call */
const debouncedFetch = (query: string) => {
  // Clear existing timer
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
  
  // Set loading state
  loading.value = true
  
  // Set new timer
  debounceTimer = setTimeout(async () => {
    try {
      const results = await fetchSuggestions(query)
      suggestions.value = results
      // Recalculate position after results load
      if (results.length > 0) {
        calculateDropdownPosition()
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error)
      suggestions.value = []
    } finally {
      loading.value = false
    }
  }, props.debounceMs)
}

const handleInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  const value = target.value
  emit("update:modelValue", value)
  
  if (value.trim()) {
    debouncedFetch(value)
    open.value = true
  } else {
    suggestions.value = []
    loading.value = false
    open.value = false
  }
}

const handleFocus = () => {
  open.value = true
  calculateDropdownPosition()
  
  // Show initial suggestions on focus if input has value
  if (props.modelValue.trim()) {
    debouncedFetch(props.modelValue)
  }
}

const select = (option: string) => {
  emit("update:modelValue", option)
  suggestions.value = []
  open.value = false
}

const handleBlur = () => {
  setTimeout(() => {
    open.value = false
  }, 150)
}

/* Lifecycle */
onMounted(() => {
  window.addEventListener('scroll', updatePosition, true)
  window.addEventListener('resize', updatePosition)
})

/* Cleanup on unmount */
onUnmounted(() => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
  window.removeEventListener('scroll', updatePosition, true)
  window.removeEventListener('resize', updatePosition)
})
</script>