import { ref } from 'vue'

export type ToastType = 'error' | 'success' | 'warning' | 'info'

export interface Toast {
    id: number
    message: string
    type: ToastType
    duration: number
}

const toasts = ref<Toast[]>([])
let counter = 0

function add(message: string, type: ToastType = 'info', duration = 5000) {
    const id = ++counter
    toasts.value.push({ id, message, type, duration })

    if (duration > 0) {
        setTimeout(() => remove(id), duration)
    }
    return id
}

function remove(id: number) {
    const idx = toasts.value.findIndex(t => t.id === id)
    if (idx !== -1) toasts.value.splice(idx, 1)
}

export function useToast() {
    return {
        toasts,
        success: (msg: string, duration?: number) => add(msg, 'success', duration),
        error: (msg: string, duration?: number) => add(msg, 'error', duration),
        warning: (msg: string, duration?: number) => add(msg, 'warning', duration),
        info: (msg: string, duration?: number) => add(msg, 'info', duration),
        remove,
    }
}
