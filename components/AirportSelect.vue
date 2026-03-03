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
        :value="displayValue"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        autocomplete="off"
      />
      <!-- Loading spinner -->
      <div v-if="loading" class="absolute right-3 top-1/2 -translate-y-1/2">
        <svg class="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    </div>

    <!-- Teleport dropdown to body -->
    <Teleport to="body">
      <ul
        v-if="open && suggestions.length"
        :style="dropdownStyle"
        class="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
      >
        <li
          v-for="option in suggestions"
          :key="option.value"
          @mousedown.prevent="select(option)"
          class="px-4 py-2 cursor-pointer hover:bg-gray-100 text-sm"
        >
          {{ option.label }}
        </li>
      </ul>
      
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
import { ref, onUnmounted, onMounted, computed, useAttrs, watch } from "vue"
import { useFlightService } from "../services/flight.service"
import { normaliseError } from "../utils/api"
import { Airport } from "../types/flight"
import { useDebounceFn } from "@vueuse/core"

const props = defineProps({
  modelValue: { type: String, default: "" },
  label: { type: String, default: "" },
  placeholder: { type: String, default: "City or airport" },
  id: { type: String, default: () => `airport-${Math.random().toString(36).slice(2)}` },
  debounceMs: { type: Number, default: 500 },
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const attrs = useAttrs()

const hasError = computed(() => {
  const classAttr = attrs.class
  if (!classAttr) return false
  if (typeof classAttr === 'string')  return classAttr.includes('border-red-500')
  if (Array.isArray(classAttr))       return classAttr.some(c => typeof c === 'string' && c.includes('border-red-500'))
  if (typeof classAttr === 'object' && classAttr !== null) {
    return Object.hasOwn(classAttr, 'border-red-500') &&
           (classAttr as Record<string, boolean>)['border-red-500'] === true
  }
  return false
})

const open = ref(false)
const loading = ref(false)
const suggestions = ref<Airport[]>([])
const inputRef = ref<HTMLInputElement | null>(null)
const dropdownStyle = ref<Record<string, string>>({})
const service = useFlightService()
const error = ref("")
const displayValue = ref(props.modelValue)

const calculateDropdownPosition = () => {
  if (!inputRef.value) return
  const rect = inputRef.value.getBoundingClientRect()
  const dropdownMaxHeight = 240
  const openAbove = window.innerHeight - rect.bottom < dropdownMaxHeight && rect.top > window.innerHeight - rect.bottom
  dropdownStyle.value = {
    width: `${rect.width}px`,
    left: `${rect.left}px`,
    top: openAbove ? `${rect.top - dropdownMaxHeight - 8}px` : `${rect.bottom + 4}px`,
  }
}

const updatePosition = () => { if (open.value) calculateDropdownPosition() }

const fetchSuggestions = async (query: string): Promise<Airport[]> => {
  if (!query) return []
  try {
    return await service.searchAirpots({ q: query })
  } catch (err) {
    error.value = normaliseError(err)
    return []
  }
}

const debouncedFetch = useDebounceFn(async (query: string) => {
  try {
    const results = await fetchSuggestions(query)
    suggestions.value = results
    if (results.length) calculateDropdownPosition()
  } catch {
    suggestions.value = []
  } finally {
    loading.value = false
  }
}, props.debounceMs)

const handleInput = (e: Event) => {
  const value = (e.target as HTMLInputElement).value
  displayValue.value = value
  emit('update:modelValue', '')

  if (value.trim()) {
    loading.value = true
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
  if (props.modelValue.trim()) debouncedFetch(props.modelValue)
}

const select = (option: Airport) => {
  displayValue.value = option.label
  emit('update:modelValue', option.value)
  suggestions.value = []
  open.value = false
}

const handleBlur = () => {
  setTimeout(() => {
    open.value = false
  }, 150)
}

const resolveLabel = async (code: string) => {
  if (!code || code.length !== 3) return
  try {
    const results = await service.searchAirpots({ q: code })
    const match = results.find(
      (a) => a.value.toUpperCase() === code.toUpperCase()
    ) ?? results[0]
    if (match) displayValue.value = match.label
  } catch {
    // If lookup fails, fall back to showing the raw code — not a blocker
  }
}

watch(
  () => props.modelValue,
  (val, oldVal) => {
    if (!val) {
      displayValue.value = ''
      return
    }
    if (val !== oldVal && val.length === 3 && displayValue.value !== val) {
      resolveLabel(val)
    }
  }
)

onMounted(() => {
  window.addEventListener('scroll', updatePosition, true)
  window.addEventListener('resize', updatePosition)
  if (props.modelValue) resolveLabel(props.modelValue)
})

onUnmounted(() => {
  window.removeEventListener('scroll', updatePosition, true)
  window.removeEventListener('resize', updatePosition)
})
</script>
