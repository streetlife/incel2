<template>
  <div class="relative" ref="containerRef">
    <!-- Label -->
    <label
      v-if="label"
      :for="id"
      class="block text-sm font-medium text-gray-700 mb-2"
    >
      {{ label }}
    </label>
    
    <!-- Input Field -->
    <div class="relative">
      <input
        :id="id"
        type="text"
        :value="displayValue"
        @click="toggleCalendar"
        readonly
        :disabled="disabled"
        :placeholder="placeholder"
        :class="inputClasses"
      />
      <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    </div>
    
    <!-- Calendar Popup -->
    <Teleport to="body">
      <div
        v-if="isCalendarOpen"
        ref="calendarRef"
        :style="calendarStyle"
        class="fixed z-10 bg-white rounded-lg shadow-2xl border border-gray-200 p-6"
        style="width: 640px;"
        @click.stop
      >
        <!-- Header with Month Navigation -->
        <div class="flex items-center justify-between mb-4">
          <button
            type="button"
            @click="previousMonth"
            class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            :disabled="!canGoPrevious"
            :class="{ 'opacity-50 cursor-not-allowed': !canGoPrevious }"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div class="flex gap-8">
            <span class="font-semibold text-gray-900 min-w-[120px] text-center">
              {{ currentMonthDisplay }}
            </span>
            <span class="font-semibold text-gray-900 min-w-[120px] text-center">
              {{ nextMonthDisplay }}
            </span>
          </div>
          
          <button
            type="button"
            @click="nextMonth"
            class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        <!-- Two Month Calendars -->
        <div class="flex gap-6">
          <!-- Current Month -->
          <div class="flex-1">
            <div class="grid grid-cols-7 gap-1 mb-2">
              <div
                v-for="day in weekDays"
                :key="day"
                class="text-center text-xs font-semibold text-gray-600 py-2"
              >
                {{ day }}
              </div>
            </div>
            <div class="grid grid-cols-7 gap-1">
              <button
                v-for="date in currentMonthDates"
                :key="date.dateString"
                type="button"
                @click="selectDate(date)"
                @mouseenter="hoverDate = date.dateString"
                @mouseleave="hoverDate = ''"
                :disabled="!date.isCurrentMonth || date.isDisabled"
                :class="getDateClasses(date)"
              >
                {{ date.day }}
              </button>
            </div>
          </div>
          
          <!-- Next Month -->
          <div class="flex-1">
            <div class="grid grid-cols-7 gap-1 mb-2">
              <div
                v-for="day in weekDays"
                :key="day"
                class="text-center text-xs font-semibold text-gray-600 py-2"
              >
                {{ day }}
              </div>
            </div>
            <div class="grid grid-cols-7 gap-1">
              <button
                v-for="date in nextMonthDates"
                :key="date.dateString"
                type="button"
                @click="selectDate(date)"
                @mouseenter="hoverDate = date.dateString"
                @mouseleave="hoverDate = ''"
                :disabled="!date.isCurrentMonth || date.isDisabled"
                :class="getDateClasses(date)"
              >
                {{ date.day }}
              </button>
            </div>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
          <div class="text-sm text-gray-600 font-medium">
            {{ footerDisplay }}
          </div>
          <div class="flex gap-2">
            <button
              type="button"
              @click="clearSelection"
              class="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              @click="applySelection"
              :disabled="!isValidSelection"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, nextTick } from 'vue'

/* Types */
export interface DateRange {
  start: string
  end: string
}

interface CalendarDate {
  date: Date
  dateString: string
  day: number
  isCurrentMonth: boolean
  isToday: boolean
  isDisabled: boolean
  isSelected: boolean
  isInRange: boolean
  isRangeStart: boolean
  isRangeEnd: boolean
}

interface Props {
  modelValue: DateRange
  label?: string
  disabled?: boolean
  id?: string
  allowPastDates?: boolean
  maxDate?: string
  placeholder?: string
}

/* Props */
const props = withDefaults(defineProps<Props>(), {
  modelValue: () => ({ start: '', end: '' }),
  label: '',
  disabled: false,
  id: () => `daterange-${Math.random().toString(36).slice(2)}`,
  allowPastDates: false,
  maxDate: undefined,
  placeholder: 'Select date range'
})

/* Emits */
const emit = defineEmits<{
  'update:modelValue': [value: DateRange]
}>()

/* State */
const isCalendarOpen = ref(false)
const currentMonth = ref(new Date())
const tempSelection = ref<DateRange>({ start: '', end: '' })
const hoverDate = ref<string>('')
const containerRef = ref<HTMLElement>()
const calendarRef = ref<HTMLElement>()
const calendarStyle = ref<Record<string, string>>({})

/* Constants */
const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const monthNames = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
]

/* Computed */
const displayValue = computed(() => {
  if (!props.modelValue.start || !props.modelValue.end) return ''
  return `${formatDateDisplay(props.modelValue.start)} - ${formatDateDisplay(props.modelValue.end)}`
})

const currentMonthDisplay = computed(() => {
  const date = currentMonth.value
  return `${monthNames[date.getMonth()]} ${date.getFullYear()}`
})

const nextMonthDisplay = computed(() => {
  const date = new Date(currentMonth.value)
  date.setMonth(date.getMonth() + 1)
  return `${monthNames[date.getMonth()]} ${date.getFullYear()}`
})

const footerDisplay = computed(() => {
  if (!tempSelection.value.start && !tempSelection.value.end) {
    return 'Select start and end dates'
  }
  if (tempSelection.value.start && !tempSelection.value.end) {
    return `${formatDateDisplay(tempSelection.value.start)} - Select end date`
  }
  return `${formatDateDisplay(tempSelection.value.start)} - ${formatDateDisplay(tempSelection.value.end)}`
})

const isValidSelection = computed(() => {
  return !!(tempSelection.value.start && tempSelection.value.end)
})

const canGoPrevious = computed(() => {
  if (props.allowPastDates) return true
  const today = new Date()
  const firstDayOfCurrentMonth = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth(), 1)
  const firstDayOfThisMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  return firstDayOfCurrentMonth > firstDayOfThisMonth
})

const inputClasses = computed(() => [
  'w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors cursor-pointer',
  props.disabled && 'bg-gray-100 cursor-not-allowed opacity-60'
])

const currentMonthDates = computed(() => generateMonthDates(currentMonth.value))
const nextMonthDates = computed(() => {
  const date = new Date(currentMonth.value)
  date.setMonth(date.getMonth() + 1)
  return generateMonthDates(date)
})

/* Methods */
const updateCalendarPosition = (): void => {
  if (!containerRef.value) return
  
  const rect = containerRef.value.getBoundingClientRect()
  const calendarWidth = 640
  const calendarHeight = 450
  const padding = 8
  
  // Position below the input
  let top = rect.bottom + padding
  
  // Align calendar's right edge with input's right edge
  let left = rect.right - calendarWidth
  
  // If calendar goes off left edge, align to left edge of input instead
  if (left < padding) {
    left = rect.left
  }
  
  // If still goes off left edge, push it right
  if (left < padding) {
    left = padding
  }
  
  // If calendar goes off right edge, adjust
  if (left + calendarWidth > window.innerWidth - padding) {
    left = window.innerWidth - calendarWidth - padding
  }
  
  // Adjust if calendar goes off bottom edge
  if (top + calendarHeight > window.innerHeight - padding) {
    top = rect.top - calendarHeight - padding
    // If it still doesn't fit above, show it below with available space
    if (top < padding) {
      top = rect.bottom + padding
    }
  }
  
  calendarStyle.value = {
    top: `${top}px`,
    left: `${left}px`
  }
}

const formatDateDisplay = (dateString: string): string => {
  if (!dateString) return ''
  const date = new Date(dateString + 'T00:00:00')
  const month = monthNames[date.getMonth()]
  const day = date.getDate()
  const year = date.getFullYear()
  return `${month} ${day}, ${year}`
}

const formatDateString = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const generateMonthDates = (month: Date): CalendarDate[] => {
  const year = month.getFullYear()
  const monthIndex = month.getMonth()
  
  const firstDay = new Date(year, monthIndex, 1)
  const lastDay = new Date(year, monthIndex + 1, 0)
  const startingDayOfWeek = firstDay.getDay()
  
  const dates: CalendarDate[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // Previous month's trailing dates
  for (let i = 0; i < startingDayOfWeek; i++) {
    const date = new Date(year, monthIndex, -startingDayOfWeek + i + 1)
    dates.push(createCalendarDate(date, false))
  }
  
  // Current month's dates
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = new Date(year, monthIndex, day)
    dates.push(createCalendarDate(date, true))
  }
  
  // Next month's leading dates
  const remainingCells = 42 - dates.length
  for (let i = 1; i <= remainingCells; i++) {
    const date = new Date(year, monthIndex + 1, i)
    dates.push(createCalendarDate(date, false))
  }
  
  return dates
}

const createCalendarDate = (date: Date, isCurrentMonth: boolean): CalendarDate => {
  const dateString = formatDateString(date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const isToday = date.getTime() === today.getTime()
  const isDisabled = !props.allowPastDates && date < today
  
  const start = tempSelection.value.start
  const end = tempSelection.value.end
  
  const isRangeStart = dateString === start
  const isRangeEnd = dateString === end
  const isSelected = isRangeStart || isRangeEnd
  
  let isInRange = false
  if (start && end) {
    isInRange = dateString > start && dateString < end
  } else if (start && hoverDate.value && !end) {
    const hovered = hoverDate.value
    isInRange = (dateString > start && dateString < hovered) || (dateString < start && dateString > hovered)
  }
  
  return {
    date,
    dateString,
    day: date.getDate(),
    isCurrentMonth,
    isToday,
    isDisabled,
    isSelected,
    isInRange,
    isRangeStart,
    isRangeEnd
  }
}

const getDateClasses = (date: CalendarDate): string[] => {
  return [
    'w-10 h-10 rounded-lg text-sm font-medium transition-all',
    !date.isCurrentMonth && 'text-gray-300',
    date.isCurrentMonth && !date.isDisabled && 'text-gray-900 hover:bg-blue-50',
    date.isDisabled && 'text-gray-300 cursor-not-allowed',
    date.isToday && !date.isSelected && 'border-2 border-blue-500',
    date.isRangeStart && 'bg-blue-600 text-white hover:bg-blue-700',
    date.isRangeEnd && 'bg-blue-600 text-white hover:bg-blue-700',
    date.isInRange && !date.isSelected && 'bg-blue-100',
  ].filter(Boolean) as string[]
}

const toggleCalendar = async (): Promise<void> => {
  if (props.disabled) return
  isCalendarOpen.value = !isCalendarOpen.value
  
  if (isCalendarOpen.value) {
    tempSelection.value = { ...props.modelValue }
    if (props.modelValue.start) {
      const startDate = new Date(props.modelValue.start + 'T00:00:00')
      currentMonth.value = new Date(startDate.getFullYear(), startDate.getMonth(), 1)
    }
    
    await nextTick()
    updateCalendarPosition()
  }
}

const selectDate = (calendarDate: CalendarDate): void => {
  if (calendarDate.isDisabled) return
  
  const dateString = calendarDate.dateString
  
  // If no start date, set start
  if (!tempSelection.value.start) {
    tempSelection.value = { start: dateString, end: '' }
    return
  }
  
  // If start exists but no end, set end (don't close calendar)
  if (tempSelection.value.start && !tempSelection.value.end) {
    if (dateString >= tempSelection.value.start) {
      tempSelection.value.end = dateString
    } else {
      // If clicked date is before start, swap them
      tempSelection.value = { start: dateString, end: tempSelection.value.start }
    }
    // Don't close - let user click Apply
    return
  }
  
  // If both exist, start new selection
  tempSelection.value = { start: dateString, end: '' }
}

const previousMonth = (): void => {
  if (!canGoPrevious.value) return
  const date = new Date(currentMonth.value)
  date.setMonth(date.getMonth() - 1)
  currentMonth.value = date
}

const nextMonth = (): void => {
  const date = new Date(currentMonth.value)
  date.setMonth(date.getMonth() + 1)
  currentMonth.value = date
}

const clearSelection = (): void => {
  tempSelection.value = { start: '', end: '' }
  isCalendarOpen.value = false
}

const applySelection = (): void => {
  if (!isValidSelection.value) return
  emit('update:modelValue', { ...tempSelection.value })
  isCalendarOpen.value = false
}

const handleClickOutside = (event: MouseEvent): void => {
  const target = event.target as Node
  
  // Check if click is outside both the container and calendar
  if (
    containerRef.value && 
    !containerRef.value.contains(target) &&
    calendarRef.value &&
    !calendarRef.value.contains(target)
  ) {
    isCalendarOpen.value = false
  }
}

const handleScroll = (): void => {
  if (isCalendarOpen.value) {
    updateCalendarPosition()
  }
}

/* Lifecycle */
onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
  window.addEventListener('resize', updateCalendarPosition)
  window.addEventListener('scroll', handleScroll, true)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
  window.removeEventListener('resize', updateCalendarPosition)
  window.removeEventListener('scroll', handleScroll, true)
})
</script>