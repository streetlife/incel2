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
    
    <!-- Display Button -->
    <button
      :id="id"
      ref="triggerRef"
      type="button"
      @click="toggleDropdown"
      :disabled="disabled"
      :class="[
        'w-full px-4 py-3 border rounded-lg focus:border-transparent text-left flex items-center justify-between bg-white',
        disabled && 'bg-gray-100 cursor-not-allowed',
        hasError 
          ? 'border-red-500 focus:ring-red-500' 
          : 'border-gray-300 focus:ring-[#0076ad]'
      ]"
    >
      <span class="text-gray-700">{{ displayText }}</span>
      <svg 
        class="w-5 h-5 text-gray-400 transition-transform"
        :class="{ 'rotate-180': open }"
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- Teleport dropdown to body -->
    <Teleport to="body">
      <!-- Click outside backdrop -->
      <div
        v-if="open"
        @click="open = false"
        class="fixed inset-0 z-40"
      ></div>

      <!-- Dropdown Panel -->
      <div
        v-if="open"
        ref="dropdownRef"
        :style="dropdownStyle"
        class="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 space-y-4"
      >
        <!-- Dynamic Categories -->
        <div
          v-for="category in activeCategories"
          :key="category.key"
          class="flex items-center justify-between"
        >
          <div>
            <div class="font-medium text-gray-900">{{ category.label }}</div>
            <div v-if="category.description" class="text-sm text-gray-500">
              {{ category.description }}
            </div>
          </div>
          <div class="flex items-center gap-3">
            <button
              type="button"
              @click="decrement(category.key)"
              :disabled="!canDecrement(category.key)"
              class="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span class="text-md font-semibold">−</span>
            </button>
            <span class="w-4 text-center font-medium">{{ counts[category.key] }}</span>
            <button
              type="button"
              @click="increment(category.key)"
              :disabled="!canIncrement(category.key)"
              class="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span class="text-md font-semibold">+</span>
            </button>
          </div>
        </div>

        <!-- Done Button -->
        <div class="pt-2 border-t">
          <button
            type="button"
            @click="open = false"
            class="w-full py-2 px-4 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick, useAttrs } from 'vue'

/* Types */
interface Category {
  key: string
  label: string
  description?: string
  min?: number
  max?: number
  singular?: string
  plural?: string
}

interface CounterMode {
  categories: Category[]
  maxTotal?: number
  rules?: {
    [key: string]: (counts: Record<string, number>) => boolean
  }
}

interface Props {
  modelValue: Record<string, number>
  label?: string
  id?: string
  disabled?: boolean
  mode?: 'flight' | 'hotel' | 'tour' | 'visa' | 'custom'
  customCategories?: Category[]
  maxTotal?: number
}

/* Predefined Modes */
const MODES: Record<string, CounterMode> = {
  flight: {
    categories: [
      { 
        key: 'adults', 
        label: 'Adults', 
        description: '12 years+',
        min: 1,
        singular: 'Adult',
        plural: 'Adults'
      },
      { 
        key: 'children', 
        label: 'Children', 
        description: '2 to 12 years',
        min: 0,
        singular: 'Child',
        plural: 'Children'
      },
      { 
        key: 'infants', 
        label: 'Infants', 
        description: '0 to 2 years',
        min: 0,
        singular: 'Infant',
        plural: 'Infants'
      }
    ],
    maxTotal: 9,
    rules: {
      // Infants cannot exceed adults
      infants: (counts) => counts.infants <= counts.adults
    }
  },
  hotel: {
    categories: [
      { 
        key: 'adults', 
        label: 'Adults', 
        description: '12 years+',
        min: 1,
        singular: 'Adult',
        plural: 'Adults'
      },
      { 
        key: 'children', 
        label: 'Children', 
        description: '2 to 12 years',
        min: 0,
        singular: 'Child',
        plural: 'Children'
      },
      { 
        key: 'infants', 
        label: 'Infants', 
        description: '0 to 2 years',
        min: 0,
        singular: 'Infant',
        plural: 'Infants'
      }
    ],
    maxTotal: 9
  },
  tour: {
    categories: [
      { 
        key: 'adults', 
        label: 'Adults', 
        description: '12 years+',
        min: 1,
        singular: 'Adult',
        plural: 'Adults'
      },
      { 
        key: 'children', 
        label: 'Children', 
        description: '2 to 12 years',
        min: 0,
        singular: 'Child',
        plural: 'Children'
      },
      { 
        key: 'infants', 
        label: 'Infants', 
        description: '0 to 2 years',
        min: 0,
        singular: 'Infant',
        plural: 'Infants'
      }
    ],
    maxTotal: 9
  },
  visa: {
    categories: [
      { 
        key: 'persons', 
        label: 'Persons', 
        min: 1,
        max: 20,
        singular: 'Person',
        plural: 'Persons'
      }
    ]
  }
}

/* Props */
const props = withDefaults(defineProps<Props>(), {
  label: '',
  id: () => `counter-${Math.random().toString(36).slice(2)}`,
  disabled: false,
  mode: 'flight',
  customCategories: undefined,
  maxTotal: undefined
})

/* Emits */
const emit = defineEmits<{
  'update:modelValue': [value: Record<string, number>]
}>()

const attrs = useAttrs()

/* State */
const open = ref(false)
const triggerRef = ref<HTMLElement>()
const dropdownRef = ref<HTMLElement>()
const dropdownStyle = ref<Record<string, string>>({})
const counts = ref<Record<string, number>>({ ...props.modelValue })

/* Computed */
const activeMode = computed<CounterMode>(() => {
  if (props.mode === 'custom' && props.customCategories) {
    return {
      categories: props.customCategories,
      maxTotal: props.maxTotal
    }
  }
  return MODES[props.mode] || MODES.flight
})

const activeCategories = computed(() => activeMode.value.categories)

const totalCount = computed(() => {
  return Object.values(counts.value).reduce((sum, count) => sum + count, 0)
})

const maxTotalAllowed = computed(() => {
  return props.maxTotal ?? activeMode.value.maxTotal ?? 999
})

const displayText = computed(() => {
  const parts: string[] = []
  
  activeCategories.value.forEach(category => {
    const count = counts.value[category.key] || 0
    if (count > 0) {
      const label = count === 1 
        ? (category.singular || category.label)
        : (category.plural || category.label)
      parts.push(`${count} ${label}`)
    }
  })
  
  return parts.length > 0 ? parts.join(', ') : 'Select'
})

/* Methods */
const calculateDropdownPosition = (): void => {
  if (!triggerRef.value) return

  const rect = triggerRef.value.getBoundingClientRect()
  const dropdownHeight = 350
  const padding = 8
  const spaceBelow = window.innerHeight - rect.bottom
  const spaceAbove = rect.top

  const openAbove = spaceBelow < dropdownHeight && spaceAbove > spaceBelow

  dropdownStyle.value = {
    width: `${rect.width}px`,
    left: `${rect.left}px`,
    top: openAbove 
      ? `${rect.top - dropdownHeight - padding}px` 
      : `${rect.bottom + padding}px`,
  }
}

const toggleDropdown = async (): Promise<void> => {
  if (props.disabled) return
  open.value = !open.value
  if (open.value) {
    await nextTick()
    calculateDropdownPosition()
  }
}

const updatePosition = (): void => {
  if (open.value) {
    calculateDropdownPosition()
  }
}

const canIncrement = (key: string): boolean => {
  const category = activeCategories.value.find(c => c.key === key)
  const currentCount = counts.value[key] || 0
  
  // Check category max
  if (category?.max && currentCount >= category.max) {
    return false
  }
  
  // Check total max
  if (totalCount.value >= maxTotalAllowed.value) {
    return false
  }
  
  // Check custom rules
  if (activeMode.value.rules?.[key]) {
    const testCounts = { ...counts.value, [key]: currentCount + 1 }
    return activeMode.value.rules[key](testCounts)
  }
  
  return true
}

const canDecrement = (key: string): boolean => {
  const category = activeCategories.value.find(c => c.key === key)
  const currentCount = counts.value[key] || 0
  const min = category?.min ?? 0
  
  return currentCount > min
}

const increment = (key: string): void => {
  if (!canIncrement(key)) return
  
  counts.value[key] = (counts.value[key] || 0) + 1
  emitUpdate()
}

const decrement = (key: string): void => {
  if (!canDecrement(key)) return
  
  counts.value[key] = (counts.value[key] || 0) - 1
  
  // Apply dependent rules (e.g., if adults decrease, adjust infants)
  if (activeMode.value.rules) {
    Object.entries(activeMode.value.rules).forEach(([ruleKey, ruleFn]) => {
      if (!ruleFn(counts.value)) {
        // Adjust the dependent value
        if (ruleKey === 'infants' && key === 'adults') {
          counts.value.infants = Math.min(counts.value.infants, counts.value.adults)
        }
      }
    })
  }
  
  emitUpdate()
}

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

const emitUpdate = (): void => {
  emit('update:modelValue', { ...counts.value })
}

/* Watchers */
watch(() => props.modelValue, (newValue) => {
  counts.value = { ...newValue }
}, { deep: true })

watch(() => props.mode, () => {
  // Initialize counts based on new mode
  const newCounts: Record<string, number> = {}
  activeCategories.value.forEach(category => {
    newCounts[category.key] = category.min ?? 0
  })
  counts.value = newCounts
  emitUpdate()
})

/* Lifecycle */
onMounted(() => {
  window.addEventListener('scroll', updatePosition, true)
  window.addEventListener('resize', updatePosition)
  
  // Initialize counts if empty
  if (Object.keys(counts.value).length === 0) {
    const initialCounts: Record<string, number> = {}
    activeCategories.value.forEach(category => {
      initialCounts[category.key] = category.min ?? 0
    })
    counts.value = initialCounts
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', updatePosition, true)
  window.removeEventListener('resize', updatePosition)
})
</script>