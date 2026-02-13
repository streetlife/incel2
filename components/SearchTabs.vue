<template>
  <div>
    <div class="flex flex-wrap justify-center gap-2 px-4 md:px-8">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="setActive(tab.id)"
        :class="[
          'flex items-center space-x-2 px-6 py-3 rounded-t-lg font-semibold transition-all duration-300',
          modelValue === tab.id
            ? 'bg-white text-gray-900'
            : 'bg-[#0076ad] text-white hover:bg-[#00608c]'
        ]"
      >
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          v-html="tab.icon"
        >
        </svg>
        <span>{{ tab.label }}</span>
      </button>
    </div>

    <div class="bg-gray-50 border rounded-t-3xl md:rounded-t-none p-6 md:p-8">
      <slot :active="modelValue" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  tabs: {
    type: Array,
    required: true
  },
  modelValue: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])

const setActive = (id) => {
  emit('update:modelValue', id)
}
</script>
