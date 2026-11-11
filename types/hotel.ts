export interface RoomConfig {
  adults: number;
  children: number;
  childAges: number[];
}

export interface HotelSearchParams {
  country: string;
  city: string;
  nationality: string;
  checkInStart: string; // "YYYY-MM-DD"
  checkInEnd: string; // "YYYY-MM-DD"
  rooms: RoomConfig[];
  totalGuests: number;
  totalRooms: number;
}

export interface CancellationPolicyObject {
  Refundable?: string;
  refundable?: boolean;
  TillDate?: string;
  till_date?: string;
}

export interface HotelFeeAttributes {
  type?: string;
  description?: string;
  amounttype?: string;
  amountType?: string;
  currency?: string;
  amount?: string;
  [key: string]: unknown;
}

export interface HotelFee {
  "@attributes"?: HotelFeeAttributes;
  [key: string]: unknown;
}

export interface HotelFees {
  Fee?: HotelFee | HotelFee[];
  [key: string]: unknown;
}

/**
 * Shape returned by the newer search API. Everything for a rate is nested
 * under `cancellation_policy`.
 */
export interface HotelCancellationPolicy {
  policy?: CancellationPolicyObject | string | null;
  terms_and_conditions?: string | string[] | null;
  pay_at_hotel_fees?: HotelFees | string | null;
  [key: string]: unknown;
}

export type CancellationPolicyInput =
  | string
  | CancellationPolicyObject
  | HotelCancellationPolicy
  | null;

/** A single room option returned inside each hotel in the new search response. */
export interface HotelSearchRoom {
  booking_key: string;
  description: string[];
  type: string[];
  total_rooms: string;
  /** Per-room rates for the stay, pipe-delimited (e.g. "268.53|268.53"). */
  price: string;
  cancellation_policy: CancellationPolicyInput;
}

export interface HotelResult {
  hotel_id: string;
  hotel_name: string;
  hotel_address: string;
  city: string;
  rating: number;
  thumbnail: string;
  price: number;
  room_count: number;
  board_basis: string[];
  cancellation_policy?: CancellationPolicyInput;
  roomType?: string[];
  BookingKey?: string;
  /** Per-room options with individual pricing (new API format). */
  rooms?: HotelSearchRoom[];
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
  roomtypes?: string[];
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
  name: string;
  code: string;
}

export interface HotelCountryCodeResponse {
  name: string;
  code: string;
}

export interface HotelDetailResponse {
  hotel_info: IHotelInfo;
  rooms: IHotelRooms[];
}

interface IHotelInfo {
  Id: string;
  Name: string;
  Rating: number;
  ThumbImages: string;
  Price: number;
  Hotelwiseroomcount: number;
}

interface IHotelRooms {
  Type: string;
  BookingKey: string;
  Adults: string;
  Children: string;
  ChildrenAges: string;
  TotalRooms: string;
  TotalRate: string;
  RoomDescription: string;
  CancellationPolicy: {
    Refundable: string;
  };
  /** Room fine print, returned as an (HTML) string by the supplier. */
  TermsAndConditions?: string;
}

export interface HotelByIdResponse {
  status: boolean;
  hotel: HotelByIdDetail;
}

export interface HotelByIdDetail {
  hotel_id: string;
  hotel_name: string;
  hotel_address: string;
  city: string;
  rating: number;
  thumbnail: string;
  price: number;
  room_count: number;
  board_basis: string[];
  roomType: string[];
  BookingKey: string;
  totalRoom: number;
  arrivalDate: string;
  departureDate: string;
  roomsAdult: number[];
  roomsChildren: number[];
  roomsChildrenAges: number[][];
  cancellation_policy?: CancellationPolicyInput;
  /** Per-room options with individual pricing (carried from new search response). */
  rooms?: HotelSearchRoom[];
}

export interface CreateBookingData {
  session_code: string;
  search_session_id: string;
  hotel_id: string;
  country_code: string;
  city_code: string;
  hotel_name: string;
  arrival_date: string;
  departure_date: string;
  rooms_type: string;
  rooms_key: string;
  rooms_adults: number[];
  rooms_children: number[];
  room_rates: string;
  travellers: ITraveller[];
  amount?: number | string;
}

interface ITraveller {
  title: string;
  first_name: string;
  last_name: string;
  type: "ADULT" | "CHILD";
  age?: number;
  room: number;
}

export interface PaystackPaymentData {
  amount: string;
  invoice_code: string;
  customer_name: string;
  customer_email: string;
  callback_url: string;
}

export interface PaystackPaymentResponse {
  payment_link: string;
}

export interface FlutterwavePaymentData {
  amount: string;
  invoice_code: string;
  customer_name: string;
  customer_email: string;
  callback_url: string;
}

export interface FlutterwavePaymentResponse {
  payment_link: string;
}

export interface PreBookingData {
  search_session_id: string;
  arrival_date: string;
  departure_date: string;
  nationality: string;
  country_code: string;
  city_code: string;
  hotel_id: string;
  currency: string;
  rooms_adults: number[];
  rooms_children: number[];
  rooms_children_ages: number[];
  room_type: string;
  booking_key: string;
  total_rate: number;
}

export interface CancellationPolicyEntry {
  startDate?: string;
  endDate?: string;
  chargeType?: string;
  chargeAmount?: string;
  currency?: string;
  [key: string]: unknown;
}

export interface CancellationInformations {
  cancellationInformation?:
    | CancellationPolicyEntry
    | CancellationPolicyEntry[];
  info?: string;
  [key: string]: unknown;
}

export interface PreBookResponse {
  status: boolean;
  message: string;
  searchSessionId: string;
  arrivalDate: string;
  departureDate: string;
  guestNationality: string;
  countryCode: string;
  city: string;
  hotelId: string;
  currency: string;
  room: IRoomDetail;
  // Updated-rate fields returned by the BE (the `<BookingAfterPrice>` tag is
  // surfaced as `afterPrice` in the current response).
  BookingAfterPrice?: string | number;
  beforePrice?: string | number;
  afterPrice?: string | number;
  priceDifference?: string | number;
  /**
   * Detailed cancellation schedule. The supplier may return a single entry or
   * an array, and some backends pass the raw XML/JSON through as a string.
   * Kept optional because many rates simply do not carry a schedule.
   */
  cancellationInformation?:
    | CancellationInformations
    | CancellationInformations[]
    | string
    | null;
  cancellationInformations?:
    | CancellationInformations
    | CancellationInformations[]
    | string
    | null;
  /** Extra fees payable directly to the hotel at check-in. */
  PayAtHotelFees?: unknown;
  payAtHotelFees?: unknown;
  pay_at_hotel_fees?: unknown;
}

export interface IRoomDetail {
  type: string;
  bookingKey: string;
  adults: string;
  children: string;
  childrenAges?: string;
  totalRooms: string;
  totalRate: string;
  boardBasis?: string;
  terms?: string;
  termsAndConditions?: string;
  BookingAfterPrice?: string | number;
  beforePrice?: string | number;
  afterPrice?: string | number;
}
