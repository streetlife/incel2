import { useRuntimeConfig } from "nuxt/app";
//import { ApiResponse } from "../types/api";
import { HotelCountryCodeResponse, HotelCountryResponse, HotelSearchParams, HotelSearchResponse } from "../types/hotel";
import { useApi } from "../utils/api";

export function useHotelService() {
    const $api = useApi()
    const config = useRuntimeConfig()

    return {
        async searchHotel(params: HotelSearchParams): Promise<HotelSearchResponse> {
            const payload = buildPayload(params);
            const res = await $api<HotelSearchResponse>('/hotels/search', {
                method: 'POST',
                body: payload,
                headers: {
                    'x-api-key': config.public.hotel as string
                }
            })
            return res
        },

        async getHotelCountry(): Promise<HotelCountryResponse[]> {
            const res = await $api<HotelCountryResponse[]>('/hotels/countries', {
                method: 'GET'
            })

            return res
        },

        async getHotelCountryCode(code: string): Promise<HotelCountryCodeResponse[]> {
            const res = await $api<HotelCountryCodeResponse[]>(`/hotels/cities/${code}`, {
                method: 'GET'
            })

            return res
        },

    }
}

function buildPayload(params: HotelSearchParams): Record<string, unknown> {
    const cityInfo = params.city;

    if (!cityInfo) {
        throw new Error(
            `City "${params.city}" is not mapped. Add it to CITY_LOOKUP in useHotelService.ts.`
        );
    }

    const nationalityCode = params.nationality;

    const totalAdults = params.rooms.reduce((s, r) => s + (r.adults ?? 0), 0);
    const totalChildren = params.rooms.reduce(
        (s, r) => s + (r.children ?? 0) + (r.infants ?? 0),
        0
    );

    // Flatten child ages (pad with 0 where ages weren't captured)
    const childAges: number[] = params.rooms.flatMap((r) => {
        const explicit = r.childAges ?? [];
        const childrenWithoutAges = Math.max(0, (r.children ?? 0) - explicit.length);

        return [
            ...explicit,
            ...new Array(childrenWithoutAges).fill(0),
            ...new Array(r.infants ?? 0).fill(0),
        ];
    });

    const payload: Record<string, unknown> = {
        search_hotel_country: params.country,
        search_hotel_city: cityInfo,
        search_hotel_nationality: nationalityCode,
        arrival_date: params.checkInStart,
        departure_date: params.checkInEnd,
        room_number: params.rooms.length,
        adult_number: totalAdults,
        child_number: totalChildren,
    };

    // Per-room breakdown: room1_adults, room1_children, ...
    params.rooms.forEach((room, i) => {
        const n = i + 1;
        payload[`room${n}_adults`] = room.adults ?? 1;
        payload[`room${n}_children`] = (room.children ?? 0) + (room.infants ?? 0);
    });

    if (childAges.length > 0) {
        payload.child = [8];
    }

    return payload;
}
