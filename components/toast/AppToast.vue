<script setup lang="ts">
import { useToast } from '../../composables/useToast'

const { toasts, remove } = useToast()

const icons: Record<string, string> = {
  success: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>`,
  error: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>`,
  warning: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>`,
  info: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>`,
}

const styles: Record<string, { wrapper: string; icon: string; bar: string }> = {
  success: {
    wrapper: 'bg-white border-l-4 border-emerald-500 shadow-emerald-100',
    icon: 'bg-emerald-50 text-emerald-600',
    bar: 'bg-emerald-500',
  },
  error: {
    wrapper: 'bg-white border-l-4 border-red-500 shadow-red-100',
    icon: 'bg-red-50 text-red-600',
    bar: 'bg-red-500',
  },
  warning: {
    wrapper: 'bg-white border-l-4 border-amber-400 shadow-amber-100',
    icon: 'bg-amber-50 text-amber-600',
    bar: 'bg-amber-400',
  },
  info: {
    wrapper: 'bg-white border-l-4 border-sky-500 shadow-sky-100',
    icon: 'bg-sky-50 text-sky-600',
    bar: 'bg-sky-500',
  },
}

const titles: Record<string, string> = {
  success: 'Success',
  error: 'Something went wrong',
  warning: 'Warning',
  info: 'Info',
}
</script>

<template>
  <!-- Portal: fixed top-right stack -->
  <Teleport to="body">
    <div class="fixed top-5 right-5 z-[9999] flex flex-col gap-3 w-[360px] max-w-[calc(100vw-2.5rem)] pointer-events-none">
      <TransitionGroup
        tag="div"
        class="flex flex-col gap-3"
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 translate-x-8 scale-95"
        enter-to-class="opacity-100 translate-x-0 scale-100"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-x-0 scale-100"
        leave-to-class="opacity-0 translate-x-8 scale-95"
      >
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="pointer-events-auto relative overflow-hidden rounded-xl shadow-lg flex items-start gap-3 px-4 py-3.5"
          :class="styles[toast.type].wrapper"
          role="alert"
          aria-live="assertive"
        >
          <!-- Icon badge -->
          <div class="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5" :class="styles[toast.type].icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" v-html="icons[toast.type]" />
          </div>

          <!-- Text -->
          <div class="flex-1 min-w-0 pr-6">
            <p class="text-sm font-bold text-slate-900 leading-tight">{{ titles[toast.type] }}</p>
            <p class="text-sm text-slate-600 mt-0.5 leading-snug break-words">{{ toast.message }}</p>
          </div>

          <!-- Close button -->
          <button
            class="absolute top-3 right-3 w-5 h-5 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            @click="remove(toast.id)"
            aria-label="Dismiss"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>

          <!-- Auto-dismiss progress bar -->
          <div
            v-if="toast.duration > 0"
            class="absolute bottom-0 left-0 h-[3px] rounded-b-xl animate-shrink"
            :class="styles[toast.type].bar"
            :style="{ animationDuration: `${toast.duration}ms` }"
          />
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
@keyframes shrink {
  from { width: 100%; }
  to   { width: 0%; }
}
.animate-shrink {
  animation: shrink linear forwards;
}
</style>
