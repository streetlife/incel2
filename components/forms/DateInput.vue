<template>
  <div>
    <!-- Label -->
    <label
      v-if="label"
      :for="id"
      class="block text-sm font-medium text-gray-700 mb-2"
    >
      {{ label }}
    </label>
    
    <!-- Date Input -->
    <div class="relative">
      <input
        :id="id"
        type="date"
        :value="modelValue"
        @input="handleInput"
        :min="minDate"
        :disabled="disabled"
        :class="[
          'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent',
          disabled && 'bg-gray-100 cursor-not-allowed',
          hasError 
            ? 'border-red-500 focus:ring-red-500' 
            : 'border-gray-300 focus:ring-[#0076ad]'
        ]"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'

/* Props */
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  id: {
    type: String,
    default: () => `date-${Math.random().toString(36).slice(2)}`
  },
  allowPastDates: {
    type: Boolean,
    default: false
  }
})

/* Emits */
const emit = defineEmits(['update:modelValue'])

/* Attrs */
const attrs = useAttrs()

/* Computed */
const minDate = computed<string | undefined>(() => {
  if (props.allowPastDates) return undefined
  
  // Get today's date in YYYY-MM-DD format
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  
  return `${year}-${month}-${day}`
})

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

/* Methods */
const handleInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>