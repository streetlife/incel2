<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'

export interface SelectOption {
  value: string
  label: string
  code?: string
}

interface Props {
  modelValue: string
  options: SelectOption[]
  valueKey?: keyof SelectOption  // Field to EMIT & match modelValue against (e.g. "value", "code")
  labelKey?: keyof SelectOption  // Field to DISPLAY in input + dropdown list (e.g. "label", "value")
  id?: string
  placeholder?: string
  disabled?: boolean
  loading?: boolean
  error?: string
}

const props = withDefaults(defineProps<Props>(), {
  id: () => `searchable-select-${Math.random().toString(36).slice(2, 7)}`,
  valueKey: 'value' as keyof SelectOption,
  labelKey: 'label' as keyof SelectOption,
  placeholder: 'Select an option',
  disabled: false,
  loading: false,
  error: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

function getField(opt: SelectOption, key: keyof SelectOption): string {
  return String((opt as unknown as Record<string, unknown>)[key as string] ?? '')
}

// What gets emitted and matched against modelValue
function optVal(opt: SelectOption): string {
  return getField(opt, props.valueKey as keyof SelectOption)
}

// What gets displayed in the input field and dropdown list
function optLabel(opt: SelectOption): string {
  return getField(opt, props.labelKey as keyof SelectOption)
}

const datalistId = computed(() => `${props.id}-list`)
const inputEl = ref<HTMLInputElement | null>(null)
const containerEl = ref<HTMLDivElement | null>(null)
const wrapperEl = ref<HTMLDivElement | null>(null)
const dropdownEl = ref<HTMLUListElement | null>(null)
const isOpen = ref(false)
const query = ref('')
const activeIndex = ref(-1)
const dropdownStyle = ref<Record<string, string>>({})

function calcDropdownStyle() {
  if (!wrapperEl.value) return
  const rect = wrapperEl.value.getBoundingClientRect()
  dropdownStyle.value = {
    position: 'fixed',
    top: `${rect.bottom + 6}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    zIndex: '9999',
  }
}

const selectedOption = computed(() =>
  props.options.find(o => optVal(o) === props.modelValue) ?? null
)

const inputDisplay = computed(() => {
  if (isOpen.value) return query.value
  if (selectedOption.value) return optLabel(selectedOption.value)
  return ''
})

const filtered = computed(() => {
  const valid = props.options.filter(o => optVal(o) !== '')
  const q = query.value.trim().toLowerCase()
  if (!q) return valid
  return valid.filter(o =>
    optLabel(o).toLowerCase().includes(q) ||
    optVal(o).toLowerCase().includes(q) ||
    (o.code?.toLowerCase().includes(q) ?? false)
  )
})

function open() {
  if (props.disabled || props.loading) return
  calcDropdownStyle()
  isOpen.value = true
  query.value = ''
  activeIndex.value = selectedOption.value
    ? filtered.value.findIndex(o => optVal(o) === props.modelValue)
    : -1
}

function close() {
  isOpen.value = false
  query.value = ''
  activeIndex.value = -1
}

function scrollActive() {
  if (activeIndex.value < 0 || !dropdownEl.value) return
  const el = dropdownEl.value.children[activeIndex.value] as HTMLElement | undefined
  el?.scrollIntoView({ block: 'nearest' })
}

function pick(opt: SelectOption) {
  emit('update:modelValue', optVal(opt))
  close()
  inputEl.value?.blur()
}

function clear() {
  emit('update:modelValue', '')
  query.value = ''
  inputEl.value?.focus()
}

function onNativeChange(e: Event) {
  const text = (e.target as HTMLInputElement).value
  const match = props.options.find(o => optLabel(o) === text)
  if (match) { emit('update:modelValue', optVal(match)); close() }
  else if (!text) emit('update:modelValue', '')
}

function onInput(e: Event) {
  query.value = (e.target as HTMLInputElement).value
  if (!isOpen.value) isOpen.value = true
  activeIndex.value = -1
  if (!query.value) emit('update:modelValue', '')
}

function onKeydown(e: KeyboardEvent) {
  if (props.disabled || props.loading) return

  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault()
      if (!isOpen.value) { open(); return }
      activeIndex.value = Math.min(activeIndex.value + 1, filtered.value.length - 1)
      scrollActive()
      break
    case 'ArrowUp':
      e.preventDefault()
      activeIndex.value = Math.max(activeIndex.value - 1, 0)
      scrollActive()
      break
    case 'Enter':
      e.preventDefault()
      if (isOpen.value && filtered.value[activeIndex.value]) pick(filtered.value[activeIndex.value])
      else open()
      break
    case 'Escape':
      e.preventDefault()
      close()
      break
    case 'Tab':
      if (isOpen.value) close()
      break
    case 'Home':
      if (isOpen.value) { e.preventDefault(); activeIndex.value = 0; scrollActive() }
      break
    case 'End':
      if (isOpen.value) { e.preventDefault(); activeIndex.value = filtered.value.length - 1; scrollActive() }
      break
  }
}

watch(filtered, () => { activeIndex.value = -1 })

function onDocClick(e: MouseEvent) {
  if (!containerEl.value?.contains(e.target as Node)) close()
}
function onScrollResize() { if (isOpen.value) calcDropdownStyle() }

onMounted(() => {
  document.addEventListener('mousedown', onDocClick)
  window.addEventListener('scroll', onScrollResize, true)
  window.addEventListener('resize', onScrollResize)
})
onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onDocClick)
  window.removeEventListener('scroll', onScrollResize, true)
  window.removeEventListener('resize', onScrollResize)
})
</script>

<template>
  <div ref="containerEl" class="relative w-full">
    <div
      ref="wrapperEl"
      class="relative flex items-center w-full rounded-lg border transition focus-within:ring-2"
      :class="[
        disabled || loading
          ? 'bg-gray-100 border-gray-200 cursor-not-allowed'
          : error
            ? 'border-red-500 focus-within:ring-red-500/20'
            : isOpen
              ? 'border-gray-400 focus-within:ring-gray-400/20'
              : 'border-gray-300 hover:border-gray-400 focus-within:ring-gray-400/20',
      ]"
    >
      <span class="pointer-events-none pl-3 flex items-center shrink-0 text-gray-400" aria-hidden="true">
        <svg v-if="!loading" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
          <circle cx="11" cy="11" r="7"/>
          <path d="M21 21l-4.35-4.35"/>
        </svg>
        <svg v-else class="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none">
          <path d="M21 12a9 9 0 1 1-6.219-8.56" stroke="currentColor" stroke-width="2.5"/>
        </svg>
      </span>

      <input
        :id="id"
        ref="inputEl"
        type="text"
        autocomplete="off"
        autocorrect="off"
        spellcheck="false"
        :list="datalistId"
        :value="inputDisplay"
        :placeholder="loading ? 'Loading…' : placeholder"
        :disabled="disabled || loading"
        class="flex-1 min-w-0 bg-transparent px-2.5 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none disabled:cursor-not-allowed"
        @focus="open"
        @click="open"
        @input="onInput"
        @change="onNativeChange"
        @keydown="onKeydown"
      />

      <button
        v-if="modelValue && !disabled && !loading"
        type="button"
        aria-label="Clear selection"
        class="shrink-0 mr-1 p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
        @mousedown.prevent="clear"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>

      <span
        class="pointer-events-none pr-3 flex items-center shrink-0 text-gray-400 transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
        aria-hidden="true"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </span>
    </div>

    <Teleport to="body">
      <Transition name="dropdown">
        <ul
          v-if="isOpen"
          ref="dropdownEl"
          aria-hidden="true"
          :style="dropdownStyle"
          class="dropdown-list bg-white border border-gray-200 rounded-xl shadow-lg py-1.5"
        >
          <li v-if="filtered.length === 0" class="px-4 py-3 text-sm text-gray-400 text-center select-none">
            {{ query ? `No results for "${query}"` : 'No options available' }}
          </li>

          <li v-for="(opt, i) in filtered" :key="opt.value" class="px-1.5">
            <button
              type="button"
              tabindex="-1"
              class="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-sm transition-colors text-left select-none"
              :class="{
                'bg-gray-100 text-gray-900': i === activeIndex && optVal(opt) !== modelValue,
                'bg-gray-900 text-white': optVal(opt) === modelValue,
                'text-gray-700 hover:bg-gray-50': i !== activeIndex && optVal(opt) !== modelValue,
              }"
              @mouseenter="activeIndex = i"
              @mousedown.prevent="pick(opt)"
            >
              <!-- Display label key, not value key -->
              <span class="truncate">{{ optLabel(opt) }}</span>
              <svg
                v-if="optVal(opt) === modelValue"
                class="shrink-0" width="14" height="14" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2.8" aria-hidden="true"
              >
                <polyline points="20,6 9,17 4,12"/>
              </svg>
            </button>
          </li>
        </ul>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.dropdown-list {
  max-height: 240px;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.dropdown-list::-webkit-scrollbar       { width: 4px; }
.dropdown-list::-webkit-scrollbar-track { background: transparent; }
.dropdown-list::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }

.dropdown-enter-active { transition: opacity 0.15s ease, transform 0.15s cubic-bezier(0.16, 1, 0.3, 1); }
.dropdown-leave-active { transition: opacity 0.1s ease, transform 0.1s ease; }
.dropdown-enter-from { opacity: 0; transform: translateY(-6px) scaleY(0.96); }
.dropdown-leave-to { opacity: 0; transform: translateY(-4px) scaleY(0.97); }
</style>

<style>
.dropdown-list {
  max-height: 240px;
  overflow-y: auto;
  overscroll-behavior: contain;
}
.dropdown-list::-webkit-scrollbar       { width: 4px; }
.dropdown-list::-webkit-scrollbar-track { background: transparent; }
.dropdown-list::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }
</style>