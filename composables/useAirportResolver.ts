import { ref } from 'vue'
import { useFlightService } from '../services/flight.service'
import { Airport } from '../types/flight'

const resolved = new Map<string, string>()
const pending = new Map<string, Promise<string>>()

export function useAirportResolver() {
    const service = useFlightService()
    const loading = ref(false)

    async function resolveAirport(code: string): Promise<string> {
        if (code?.length !== 3) return code
        if (resolved.has(code)) return resolved.get(code)!
        if (pending.has(code)) return pending.get(code)!

        const request = (async () => {
            loading.value = true
            try {
                const results: Airport[] = await service.searchAirpots({ q: code })
                const match = results.find(a => a.value.toUpperCase() === code.toUpperCase()) ?? results[0]
                const label = match?.label ?? code
                resolved.set(code, label)
                return label
            } catch {
                return code
            } finally {
                pending.delete(code)
                loading.value = pending.size > 0
            }
        })()

        pending.set(code, request)
        return request
    }

    async function resolveAirports(codes: string[]): Promise<Record<string, string>> {
        const unique = [...new Set(codes.filter(c => c?.length === 3))]
        const entries = await Promise.all(
            unique.map(async code => [code, await resolveAirport(code)] as const)
        )
        return Object.fromEntries(entries)
    }

    return { resolveAirport, resolveAirports, loading }
}
