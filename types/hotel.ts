export interface RoomConfig {
    adults: number
    children: number
    childAges: number[] // one age per child (0–17); length must equal children
}

export interface HotelSearchParams {
    country: string
    city: string
    nationality: string
    checkInStart: string // "YYYY-MM-DD"
    checkInEnd: string   // "YYYY-MM-DD"
    rooms: RoomConfig[]
    totalGuests: number
    totalRooms: number
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
    search_session_id: string;
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

export interface HotelDetailResponse {
    hotel_info: IHotelInfo
    rooms: IHotelRooms[]
}

interface IHotelInfo {
    Id: string,
    Name: string,
    Rating: number,
    ThumbImages: string
    Price: number,
    Hotelwiseroomcount: number,
}

interface IHotelRooms {
    Type: string,
    BookingKey: string,
    Adults: string,
    Children: string,
    ChildrenAges: string,
    TotalRooms: string,
    TotalRate: string,
    RoomDescription: string
    CancellationPolicy: {
        Refundable: string
    },
    TermsAndConditions: []
}

export interface CreateBookingData {
    session_code: string
    search_session_id: string
    hotel_id: string
    country_code: string
    city_code: string
    arrival_date: string
    departure_date: string
    rooms_type: string
    rooms_key: string
    rooms_adults: string
    rooms_children: string
    room_rates: string
    travellers: ITraveller[]
}

interface ITraveller {
    title: string
    first_name: string
    last_name: string
}

export interface PaystackPaymentData {
    amount: string
    invoice_code: string
    customer_name: string
    customer_email: string
    callback_url: string
}

export interface PaystackPaymentResponse {
    payment_link: string
}

export interface FlutterwavePaymentData {
    amount: string
    invoice_code: string
    customer_name: string
    customer_email: string
    callback_url: string
}

export interface FlutterwavePaymentResponse {
    payment_link: string
}
