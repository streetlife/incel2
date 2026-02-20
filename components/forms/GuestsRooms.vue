<template>
  <div class="relative">
    <!-- Label -->
    <label v-if="label" :for="id" class="block text-sm font-medium text-gray-700 mb-2">
      {{ label }}
    </label>

    <!-- Trigger button -->
    <button
      :id="id"
      ref="triggerRef"
      type="button"
      :disabled="disabled"
      :class="[
        'w-full px-4 py-3 border rounded-lg text-left flex items-center justify-between bg-white',
        disabled ? 'bg-gray-100 cursor-not-allowed' : '',
        hasError ? 'border-red-500' : 'border-gray-300',
      ]"
      @click="toggleDropdown"
    >
      <span class="text-gray-700">{{ displayText }}</span>
      <svg
        class="w-5 h-5 text-gray-400 transition-transform"
        :class="{ 'rotate-180': open }"
        fill="none" stroke="currentColor" viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- Teleported dropdown -->
    <Teleport to="body">
      <div v-if="open" class="fixed inset-0 z-40" @click="open = false" />

      <div
        v-if="open"
        ref="dropdownRef"
        :style="dropdownStyle"
        class="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
      >
        <!-- Rooms counter row -->
        <div class="flex items-center justify-between px-4 py-3.5 border-b border-gray-100">
          <div>
            <div class="font-medium text-gray-900">Rooms</div>
            <div class="text-xs text-gray-500">Add or remove rooms</div>
          </div>
          <div class="flex items-center gap-3">
            <button
              type="button"
              :disabled="roomCount <= 1"
              class="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              @click="removeRoom"
            >
              <span class="text-base font-semibold leading-none">−</span>
            </button>
            <span class="w-4 text-center font-medium text-gray-900">{{ roomCount }}</span>
            <button
              type="button"
              :disabled="roomCount >= maxRooms"
              class="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              @click="addRoom"
            >
              <span class="text-base font-semibold leading-none">+</span>
            </button>
          </div>
        </div>

        <!-- Per-room guest selectors -->
        <div class="max-h-[420px] overflow-y-auto">
          <div
            v-for="(roomGuests, i) in rooms"
            :key="i"
            class="border-b border-gray-100 last:border-0"
          >
            <!-- Room header -->
            <div class="flex items-center gap-2 px-4 pt-3.5 pb-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2">
                <path d="M3 22V8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14"/>
                <path d="M3 22h18M3 11h18"/>
                <rect x="9" y="15" width="6" height="7" rx="1"/>
                <path d="M5 8V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3"/>
              </svg>
              <span class="text-sm font-semibold text-gray-700">Room {{ i + 1 }} – Travellers</span>
            </div>

            <!-- Reuse existing PassengerSelect counters inline -->
            <div class="px-4 pb-3.5 space-y-3">
              <div
                v-for="category in hotelCategories"
                :key="category.key"
                class="flex items-center justify-between"
              >
                <div>
                  <div class="text-sm font-medium text-gray-900">{{ category.label }}</div>
                  <div v-if="category.description" class="text-xs text-gray-500">{{ category.description }}</div>
                </div>
                <div class="flex items-center gap-3">
                  <button
                    type="button"
                    :disabled="!canDecrement(i, category.key, category.min ?? 0)"
                    class="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    @click="decrement(i, category.key, category.min ?? 0)"
                  >
                    <span class="text-sm font-semibold leading-none">−</span>
                  </button>
                  <span class="w-4 text-center text-sm font-medium text-gray-900">
                    {{ roomGuests[category.key] ?? category.min ?? 0 }}
                  </span>
                  <button
                    type="button"
                    :disabled="!canIncrement(i, category.key)"
                    class="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    @click="increment(i, category.key)"
                  >
                    <span class="text-sm font-semibold leading-none">+</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Done -->
        <div class="px-4 py-3 border-t border-gray-100">
          <button
            type="button"
            class="w-full py-2 px-4 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-lg transition-colors"
            @click="open = false"
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

// ── Types ─────────────────────────────────────────────────────────────────────
interface GuestsAndRoomsValue {
  rooms: Record<string, number>[] // one entry per room: { adults, children, infants }
}

interface Props {
  modelValue?: GuestsAndRoomsValue
  label?: string
  id?: string
  disabled?: boolean
  maxRooms?: number
  maxGuestsPerRoom?: number
}

// ── Hotel guest categories (mirrors your PassengerSelect hotel mode) ──────────
const hotelCategories = [
  { key: 'adults',   label: 'Adults',   description: '12 years+',   min: 1, singular: 'Adult',  plural: 'Adults'   },
  { key: 'children', label: 'Children', description: '2 to 12 years', min: 0, singular: 'Child',  plural: 'Children' },
  { key: 'infants',  label: 'Infants',  description: '0 to 2 years',  min: 0, singular: 'Infant', plural: 'Infants'  },
]

const defaultRoom = (): Record<string, number> => ({ adults: 1, children: 0, infants: 0 })

// ── Props & emits ─────────────────────────────────────────────────────────────
const props = withDefaults(defineProps<Props>(), {
  label: '',
  id: () => `guests-rooms-${Math.random().toString(36).slice(2)}`,
  disabled: false,
  maxRooms: 9,
  maxGuestsPerRoom: 9,
})

const emit = defineEmits<{ 'update:modelValue': [value: GuestsAndRoomsValue] }>()
const attrs = useAttrs()

// ── State ─────────────────────────────────────────────────────────────────────
const open = ref(false)
const triggerRef  = ref<HTMLElement>()
const dropdownRef = ref<HTMLElement>()
const dropdownStyle = ref<Record<string, string>>({})

// Initialise from modelValue or start with 1 room
const rooms = ref<Record<string, number>[]>(
  props.modelValue?.rooms?.length
    ? props.modelValue.rooms.map(r => ({ ...r }))
    : [defaultRoom()]
)

const roomCount = computed(() => rooms.value.length)

// ── Display text ──────────────────────────────────────────────────────────────
const displayText = computed(() => {
  const totalGuests = rooms.value.reduce((sum, r) => {
    return sum + Object.values(r).reduce((s, n) => s + n, 0)
  }, 0)
  const r = roomCount.value
  return `${totalGuests} Guest${totalGuests === 1 ? '' : 's'}, ${r} Room${r === 1 ? '' : 's'}`
})

// ── Room management ───────────────────────────────────────────────────────────
function addRoom() {
  if (roomCount.value >= props.maxRooms) return
  rooms.value.push(defaultRoom())
  emitUpdate()
}

function removeRoom() {
  if (roomCount.value <= 1) return
  rooms.value.pop()
  emitUpdate()
}

// ── Per-room counter helpers ──────────────────────────────────────────────────
function roomTotal(i: number): number {
  return Object.values(rooms.value[i]).reduce((s, n) => s + n, 0)
}

function canIncrement(i: number, key: string): boolean {
  if (roomTotal(i) >= props.maxGuestsPerRoom) return false
  // Infants cannot exceed adults
  if (key === 'infants') return (rooms.value[i].infants ?? 0) < (rooms.value[i].adults ?? 0)
  return true
}

function canDecrement(i: number, key: string, min: number): boolean {
  return (rooms.value[i][key] ?? 0) > min
}

function increment(i: number, key: string) {
  if (!canIncrement(i, key)) return
  rooms.value[i][key] = (rooms.value[i][key] ?? 0) + 1
  emitUpdate()
}

function decrement(i: number, key: string, min: number) {
  if (!canDecrement(i, key, min)) return
  rooms.value[i][key] = (rooms.value[i][key] ?? 0) - 1
  // Keep infants ≤ adults
  if (key === 'adults') {
    rooms.value[i].infants = Math.min(rooms.value[i].infants ?? 0, rooms.value[i].adults ?? 0)
  }
  emitUpdate()
}

function emitUpdate() {
  emit('update:modelValue', { rooms: rooms.value.map(r => ({ ...r })) })
}

// ── Dropdown positioning (same logic as your PassengerSelect) ─────────────────
const calculatePosition = () => {
  if (!triggerRef.value) return
  const rect = triggerRef.value.getBoundingClientRect()
  const dropdownH = 480
  const padding = 8
  const spaceBelow = window.innerHeight - rect.bottom
  const openAbove = spaceBelow < dropdownH && rect.top > spaceBelow

  dropdownStyle.value = {
    width: `${rect.width}px`,
    left:  `${rect.left}px`,
    top: openAbove
      ? `${rect.top - dropdownH - padding}px`
      : `${rect.bottom + padding}px`,
  }
}

const toggleDropdown = async () => {
  if (props.disabled) return
  open.value = !open.value
  if (open.value) { await nextTick(); calculatePosition() }
}

const updatePosition = () => { if (open.value) calculatePosition() }

// ── Error state (mirrors your PassengerSelect hasError) ───────────────────────
const hasError = computed(() => {
  const c = attrs.class
  if (!c) return false
  if (typeof c === 'string') return c.includes('border-red-500')
  if (Array.isArray(c)) return c.some(x => typeof x === 'string' && x.includes('border-red-500'))
  return false
})

// ── Sync external modelValue changes ─────────────────────────────────────────
watch(() => props.modelValue, (v) => {
  if (v?.rooms) rooms.value = v.rooms.map(r => ({ ...r }))
}, { deep: true })

onMounted(() => {
  window.addEventListener('scroll', updatePosition, true)
  window.addEventListener('resize', updatePosition)
})
onUnmounted(() => {
  window.removeEventListener('scroll', updatePosition, true)
  window.removeEventListener('resize', updatePosition)
})
</script>
