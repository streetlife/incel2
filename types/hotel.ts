export interface RoomConfig {
    adults: number;
    children: number;
    infants: number;
    childAges?: number[]; // API requires child ages; collect these in your form if possible
}

export interface HotelSearchParams {
    country: string;
    city: string; // city name (will be mapped to city code)
    nationality: string; // nationality name (will be mapped to ISO code)
    checkInStart: string; // "YYYY-MM-DD"
    checkInEnd: string; // "YYYY-MM-DD"
    rooms: RoomConfig[];
    totalGuests: number;
    totalRooms: number;
}

export interface HotelResult {
    hotel_id: string;
    hotel_name: string;
    hotel_address: string;
    city: string;
    rating: number; // 1–5
    thumbnail: string;
    price: number; // total stay price in the search currency
    room_count: number;
    board_basis: string[];
}

export interface HotelSearchMeta {
    arrival_date: string;
    departure_date: string;
    rooms: number;
    adults: number;
    children: number;
    currency: string;
    result_count: number;
}

export interface HotelSearchFilters {
    ratings: number[];
    prices: number[];
    cities: string[];
    boardbasis: string[];
}

export interface HotelSearchResponse {
    status: boolean;
    message: string;
    session_code: string;
    search_meta: HotelSearchMeta;
    filters: HotelSearchFilters;
    hotels: HotelResult[];
}

export interface HotelCountryResponse {
    name: string
    code: string
}

export interface HotelCountryCodeResponse {
    name: string
    code: string
}
