<template>
  <div class="relative">
    <label v-if="label" :for="id" class="block text-sm font-medium text-gray-700 mb-2">
      {{ label }}
    </label>

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

    <Teleport to="body">
      <div v-if="open" class="fixed inset-0 z-40" @click="open = false" />

      <div
        v-if="open"
        ref="dropdownRef"
        :style="dropdownStyle"
        class="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
      >
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

        <div class="max-h-[480px] overflow-y-auto overscroll-contain">
          <div
            v-for="(room, i) in rooms"
            :key="i"
            class="border-b border-gray-100 last:border-0"
          >
            <div class="flex items-center gap-2 px-4 pt-3.5 pb-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2">
                <path d="M3 22V8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14"/>
                <path d="M3 22h18M3 11h18"/>
                <rect x="9" y="15" width="6" height="7" rx="1"/>
                <path d="M5 8V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3"/>
              </svg>
              <span class="text-sm font-semibold text-gray-700">Room {{ i + 1 }}</span>
            </div>

            <div class="px-4 pb-3.5 space-y-3">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-sm font-medium text-gray-900">Adults</div>
                  <div class="text-xs text-gray-500">18 years and above</div>
                </div>
                <div class="flex items-center gap-3">
                  <button
                    type="button"
                    :disabled="(room.adults ?? 1) <= 1"
                    class="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    @click="decrementAdults(i)"
                  >
                    <span class="text-sm font-semibold leading-none">−</span>
                  </button>
                  <span class="w-4 text-center text-sm font-medium text-gray-900">{{ room.adults ?? 1 }}</span>
                  <button
                    type="button"
                    :disabled="roomTotal(i) >= maxGuestsPerRoom"
                    class="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    @click="incrementAdults(i)"
                  >
                    <span class="text-sm font-semibold leading-none">+</span>
                  </button>
                </div>
              </div>

              <div class="flex items-center justify-between">
                <div>
                  <div class="text-sm font-medium text-gray-900">Children</div>
                  <div class="text-xs text-gray-500">2 to 12 years</div>
                </div>
                <div class="flex items-center gap-3">
                  <button
                    type="button"
                    :disabled="(room.children ?? 0) <= 0"
                    class="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    @click="decrementChildren(i)"
                  >
                    <span class="text-sm font-semibold leading-none">−</span>
                  </button>
                  <span class="w-4 text-center text-sm font-medium text-gray-900">{{ room.children ?? 0 }}</span>
                  <button
                    type="button"
                    :disabled="roomTotal(i) >= maxGuestsPerRoom"
                    class="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    @click="incrementChildren(i)"
                  >
                    <span class="text-sm font-semibold leading-none">+</span>
                  </button>
                </div>
              </div>

              <Transition name="fade">
                <div v-if="(room.children ?? 0) > 0" class="space-y-2 pt-1">
                  <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Child age{{ (room.children ?? 0) > 1 ? 's' : '' }} at check-in
                  </p>
                  <div
                    v-for="(_, ci) in Array((room.children ?? 0))"
                    :key="ci"
                    class="flex items-center justify-between gap-3"
                  >
                    <span class="text-xs text-gray-600 whitespace-nowrap">
                      Child {{ ci + 1 }}
                    </span>
                    <select
                      :value="room.childAges?.[ci] ?? 2"
                      class="flex-1 text-sm border border-gray-200 rounded-md px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                      @change="setChildAge(i, ci, Number(($event.target as HTMLSelectElement).value))"
                    >
                      <option
                        v-for="age in CHILD_AGES"
                        :key="age.value"
                        :value="age.value"
                      >
                        {{ age.label }}
                      </option>
                    </select>
                  </div>
                </div>
              </Transition>
            </div>
          </div>
        </div>

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

interface RoomState {
  adults: number
  children: number
  childAges: number[]
}

interface GuestsAndRoomsValue {
  rooms: RoomState[]
}

interface Props {
  modelValue?: GuestsAndRoomsValue
  label?: string
  id?: string
  disabled?: boolean
  maxRooms?: number
  maxGuestsPerRoom?: number
}

const CHILD_AGES = Array.from({ length: 11 }, (_, i) => ({
  value: i + 2,
  label: `${i + 2} years`,
}))

const defaultRoom = (): RoomState => ({ adults: 1, children: 0, childAges: [] })

const props = withDefaults(defineProps<Props>(), {
  label: '',
  id: () => `guests-rooms-${Math.random().toString(36).slice(2)}`,
  disabled: false,
  maxRooms: 9,
  maxGuestsPerRoom: 9,
})

const emit = defineEmits<{ 'update:modelValue': [value: GuestsAndRoomsValue] }>()
const attrs = useAttrs()

const open = ref(false)
const openAbove = ref(false)
const triggerRef = ref<HTMLElement>()
const dropdownRef = ref<HTMLElement>()
const dropdownStyle = ref<Record<string, string>>({})

function normaliseRoom(r: Partial<RoomState>): RoomState {
  const children = r.children ?? 0
  const ages = (r.childAges ?? []).slice(0, children)

  while (ages.length < children) ages.push(2)
  return { adults: r.adults ?? 1, children, childAges: ages }
}

const rooms = ref<RoomState[]>(
  props.modelValue?.rooms?.length
    ? props.modelValue.rooms.map(normaliseRoom)
    : [defaultRoom()],
)

const roomCount = computed(() => rooms.value.length)

const displayText = computed(() => {
  const guests = rooms.value.reduce((sum, r) => sum + r.adults + r.children, 0)
  const r = roomCount.value
  return `${guests} Guest${guests === 1 ? '' : 's'}, ${r} Room${r === 1 ? '' : 's'}`
})

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

function roomTotal(i: number): number {
  return rooms.value[i].adults + rooms.value[i].children
}

function incrementAdults(i: number) {
  if (roomTotal(i) >= props.maxGuestsPerRoom) return
  rooms.value[i].adults++
  emitUpdate()
}

function decrementAdults(i: number) {
  if (rooms.value[i].adults <= 1) return
  rooms.value[i].adults--
  emitUpdate()
}

function incrementChildren(i: number) {
  if (roomTotal(i) >= props.maxGuestsPerRoom) return
  rooms.value[i].children++
  rooms.value[i].childAges.push(2)
  emitUpdate()
}

function decrementChildren(i: number) {
  if (rooms.value[i].children <= 0) return
  rooms.value[i].children--
  rooms.value[i].childAges.pop()
  emitUpdate()
}

function setChildAge(roomIndex: number, childIndex: number, age: number) {
  rooms.value[roomIndex].childAges[childIndex] = age
  emitUpdate()
}

function emitUpdate() {
  emit('update:modelValue', {
    rooms: rooms.value.map(r => ({
      adults: r.adults,
      children: r.children,
      childAges: [...r.childAges],
    })),
  })
}

const hasError = computed(() => {
  const c = attrs.class
  if (!c) return false
  if (typeof c === 'string') return c.includes('border-red-500')
  if (Array.isArray(c)) return c.some(x => typeof x === 'string' && x.includes('border-red-500'))
  return false
})

const calculatePosition = () => {
  if (!triggerRef.value) return
  const rect = triggerRef.value.getBoundingClientRect()
  const dropdownH = dropdownRef.value?.offsetHeight || 0
  const padding = 8

  dropdownStyle.value = {
    width: `${rect.width}px`,
    left: `${rect.left + window.scrollX}px`,
    top: openAbove.value
      ? `${rect.top + window.scrollY - dropdownH - padding}px`
      : `${rect.bottom + window.scrollY + padding}px`,
  }
}

const toggleDropdown = async () => {
  if (props.disabled) return
  open.value = !open.value
  if (open.value) {
    await nextTick()
    // Decide placement direction once (using the rendered height) so the
    // dropdown does not flip back and forth while the user scrolls.
    const rect = triggerRef.value?.getBoundingClientRect()
    if (rect) {
      const dropdownH = dropdownRef.value?.offsetHeight || 0
      const spaceBelow = window.innerHeight - rect.bottom
      const spaceAbove = rect.top
      openAbove.value = spaceBelow < dropdownH && spaceAbove > spaceBelow
    }
    calculatePosition()
  }
}

watch(
  () => props.modelValue,
  (v) => {
    if (v?.rooms) rooms.value = v.rooms.map(normaliseRoom)
  },
  { deep: true },
)

onMounted(() => {
  window.addEventListener('resize', calculatePosition)
})

onUnmounted(() => {
  window.removeEventListener('resize', calculatePosition)
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>