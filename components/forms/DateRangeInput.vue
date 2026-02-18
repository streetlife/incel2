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
        :class="calendarClasses"
        @click.stop
      >
        <!-- Header with Month Navigation -->
        <div class="flex items-center justify-between mb-3">
          <button
            type="button"
            @click="previousMonth"
            class="p-1.5 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
            :disabled="!canGoPrevious"
            :class="{ 'opacity-50 cursor-not-allowed': !canGoPrevious }"
          >
            <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div class="flex gap-3 sm:gap-6 flex-1 justify-center">
            <span class="font-semibold text-gray-900 text-sm min-w-[90px] sm:min-w-[100px] text-center">
              {{ currentMonthDisplay }}
            </span>
            <span v-if="!isMobile" class="font-semibold text-gray-900 text-sm min-w-[90px] text-center">
              {{ nextMonthDisplay }}
            </span>
          </div>
          
          <button
            type="button"
            @click="nextMonth"
            class="p-1.5 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
          >
            <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        <!-- Month Calendars (1 on mobile, 2 on desktop) -->
        <div :class="isMobile ? 'flex flex-col gap-6' : 'flex gap-4'">
          <!-- Current Month -->
          <div class="flex-1">
            <div class="grid grid-cols-7 gap-1 mb-1.5">
              <div
                v-for="day in weekDays"
                :key="day"
                class="text-center text-xs font-semibold text-gray-600 py-1"
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
          
          <!-- Next Month (hidden on mobile) -->
          <div v-if="!isMobile" class="flex-1">
            <div class="grid grid-cols-7 gap-1 mb-1.5">
              <div
                v-for="day in weekDays"
                :key="day"
                class="text-center text-xs font-semibold text-gray-600 py-1"
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
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mt-3 sm:mt-4 pt-3 border-t border-gray-200 gap-2 sm:gap-3">
          <div class="text-xs text-gray-600 font-medium text-center sm:text-left">
            {{ footerDisplay }}
          </div>
          <div class="flex gap-2">
            <button
              type="button"
              @click="clearSelection"
              class="flex-1 sm:flex-none px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
            >
              Cancel
            </button>
            <button
              type="button"
              @click="applySelection"
              :disabled="!isValidSelection"
              class="flex-1 sm:flex-none px-3 py-2 text-xs sm:text-sm font-medium text-white bg-primary hover:bg-primary disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors touch-manipulation"
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
const isMobile = ref(false)

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
  'w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors cursor-pointer text-sm sm:text-base',
  props.disabled && 'bg-gray-100 cursor-not-allowed opacity-60'
])

const calendarClasses = computed(() => [
  'fixed z-50 bg-white rounded-lg shadow-2xl border border-gray-200 p-4',
  isMobile.value ? 'w-[calc(100vw-2rem)] max-w-sm' : 'w-auto'
])

const currentMonthDates = computed(() => generateMonthDates(currentMonth.value))
const nextMonthDates = computed(() => {
  const date = new Date(currentMonth.value)
  date.setMonth(date.getMonth() + 1)
  return generateMonthDates(date)
})

/* Methods */
const checkMobile = (): void => {
  isMobile.value = window.innerWidth < 640 // sm breakpoint
}

const calculateMobilePosition = (
  rect: DOMRect,
  viewportWidth: number,
  viewportHeight: number,
  padding: number
): Record<string, string> => {
  const calendarWidth = Math.min(viewportWidth - (padding * 2), 384)
  const calendarHeight = 450
  
  let top = rect.bottom + padding
  const left = (viewportWidth - calendarWidth) / 2
  
  // Adjust if calendar goes off bottom
  if (top + calendarHeight > viewportHeight - padding) {
    top = Math.max(rect.top - calendarHeight - padding, padding)
  }
  
  return {
    top: `${top}px`,
    left: `${left}px`
  }
}

const calculateDesktopPosition = (
  rect: DOMRect,
  viewportWidth: number,
  viewportHeight: number,
  padding: number
): Record<string, string> => {
  const calendarWidth = 520
  const calendarHeight = 380
  
  let top = rect.bottom + padding
  let left = rect.right - calendarWidth
  
  // Ensure calendar doesn't go off left edge
  left = Math.max(left, rect.left, padding)
  
  // Ensure calendar doesn't go off right edge
  if (left + calendarWidth > viewportWidth - padding) {
    left = viewportWidth - calendarWidth - padding
  }
  
  // Adjust vertical position if needed
  if (top + calendarHeight > viewportHeight - padding) {
    top = Math.max(rect.top - calendarHeight - padding, rect.bottom + padding)
  }
  
  return {
    top: `${top}px`,
    left: `${left}px`
  }
}

const updateCalendarPosition = (): void => {
  if (!containerRef.value) return
  
  const rect = containerRef.value.getBoundingClientRect()
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const padding = 8
  
  calendarStyle.value = isMobile.value
    ? calculateMobilePosition(rect, viewportWidth, viewportHeight, padding)
    : calculateDesktopPosition(rect, viewportWidth, viewportHeight, padding)
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
    'w-8 h-8 sm:w-9 sm:h-9 rounded-lg text-xs sm:text-sm font-medium transition-all touch-manipulation',
    !date.isCurrentMonth && 'text-gray-300',
    date.isCurrentMonth && !date.isDisabled && 'text-gray-900 hover:bg-primary active:bg-primary',
    date.isDisabled && 'text-gray-300 cursor-not-allowed',
    date.isToday && !date.isSelected && 'border-2 border-primary',
    date.isRangeStart && 'bg-primary text-white hover:bg-primary active:bg-primary',
    date.isRangeEnd && 'bg-primary text-white hover:bg-primary active:bg-primary',
    date.isInRange && !date.isSelected && 'bg-primary',
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
    
    checkMobile()
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
  
  // If start exists but no end, set end
  if (tempSelection.value.start && !tempSelection.value.end) {
    if (dateString >= tempSelection.value.start) {
      tempSelection.value.end = dateString
    } else {
      // If clicked date is before start, swap them
      tempSelection.value = { start: dateString, end: tempSelection.value.start }
    }
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

const handleResize = (): void => {
  checkMobile()
  if (isCalendarOpen.value) {
    updateCalendarPosition()
  }
}

/* Lifecycle */
onMounted(() => {
  checkMobile()
  document.addEventListener('mousedown', handleClickOutside)
  window.addEventListener('resize', handleResize)
  window.addEventListener('scroll', handleScroll, true)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('scroll', handleScroll, true)
})
</script>