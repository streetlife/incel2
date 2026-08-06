import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useHotelService } from "../services/hotel.service";
import type {
  CreateBookingData,
  PreBookingData,
  RoomConfig,
} from "../types/hotel";

export interface GuestDetail {
  type: "adult" | "child";
  age?: number;
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface SelectedRoom {
  rezliveRoomId: string;
  roomName: string;
  boardType: string;
  pricePerNight: number;
  totalPrice: number;
  cancellationPolicy: string;
  amenities: string[];
  rawRates: string;
}

export interface BookingSearchParams {
  country: string;
  city: string;
  checkInStart: string;
  checkInEnd: string;
  rooms: RoomConfig[];
  totalGuests: number;
  totalRooms: number;
  nationality: string;
  currency?: string;
}

const TAX_RATE = 0.075;

export const useHotelBookingStore = defineStore(
  "hotelBooking",
  () => {
    const hotel = ref<any | null>(null);
    const sessionCode = ref<string>("");
    const sessionId = ref<string>("");
    const searchParams = ref<BookingSearchParams>({
      country: "",
      city: "",
      checkInStart: "",
      checkInEnd: "",
      rooms: [],
      totalGuests: 1,
      totalRooms: 1,
      nationality: "",
      currency: "USD",
    });
    const selectedRoom = ref<SelectedRoom | null>(null);
    const availableRooms = ref<SelectedRoom[]>([]);
    const guests = ref<GuestDetail[]>([]);
    const contactEmail = ref<string>("");
    const contactPhone = ref<string>("");
    const isLoggedIn = ref<boolean>(false);
    const accountName = ref<string>("");
    const invoiceNumber = ref<string>("");
    const invoiceDate = ref<string>("");
    const bookingReference = ref<string>("");
    const voucherUrl = ref<string>("");
    const status = ref<"idle" | "submitting" | "confirmed" | "error">("idle");
    const errorMessage = ref<string>("");

    const step = ref<number>(1);
    const roomsLoading = ref<boolean>(false);
    const roomsError = ref<string>("");

    const preBookLoading = ref<boolean>(false);
    const preBookError = ref<string>("");
    const preBookResult = ref<any | null>(null);
    const prebookedRoomsKey = ref<string>("");
    const preBookTotalRate = ref<string>("");

    const nights = computed(() => {
      const { checkInStart, checkInEnd } = searchParams.value;
      if (!checkInStart || !checkInEnd) return 1;
      const diff = Math.ceil(
        (new Date(checkInEnd).getTime() - new Date(checkInStart).getTime()) /
          86_400_000,
      );
      return diff > 0 ? diff : 1;
    });

    const priceBreakdown = computed(() => {
      const base =
        (selectedRoom.value?.totalPrice ?? 0) * searchParams.value.totalRooms;
      const baseNgn = Math.round(base);
      const tax = Math.round(baseNgn * TAX_RATE);
      const total = baseNgn + tax;
      return { baseUsd: base, baseNgn, tax, total };
    });

    function buildGuestList(rooms: RoomConfig[]): GuestDetail[] {
      const list: GuestDetail[] = [];
      for (const room of rooms) {
        for (let a = 0; a < (room.adults ?? 1); a++) {
          list.push({
            type: "adult",
            title: "",
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
          });
        }
        for (let c = 0; c < (room.children ?? 0); c++) {
          list.push({
            type: "child",
            age: room.childAges?.[c] ?? 2,
            title: "",
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
          });
        }
      }
      return list;
    }

    function setHotel(
      hotelData: any,
      params: any,
      code?: string,
      searchSessionId?: string,
    ) {
      const isSameSearch =
        hotel.value?.hotel_id === hotelData?.hotel_id &&
        searchParams.value.checkInStart === params.checkInStart &&
        searchParams.value.checkInEnd === params.checkInEnd &&
        searchParams.value.totalRooms === params.totalRooms &&
        searchParams.value.totalGuests === params.totalGuests;

      hotel.value = hotelData;
      searchParams.value = { ...params };

      // ── Diagnostic: warn when searchParams arrives with empty critical fields ──
      if (
        !params.checkInStart ||
        !params.checkInEnd ||
        !params.nationality ||
        !params.country ||
        !params.city ||
        !params.rooms?.length
      ) {
        console.warn(
          "[hotelBooking] setHotel received incomplete searchParams",
          { params, providedCode: code, providedSessionId: searchSessionId },
        );
      }
      errorMessage.value = "";
      sessionCode.value =
        code || sessionStorage.getItem("hotelSessionCode") || "";
      sessionId.value =
        searchSessionId || sessionStorage.getItem("hotelSessionId") || "";

      if (!isSameSearch) {
        selectedRoom.value = null;
        availableRooms.value = [];
        guests.value = [];
        status.value = "idle";
        step.value = 1;
        preBookResult.value = null;
        prebookedRoomsKey.value = "";
        preBookTotalRate.value = "";
      }
    }

    async function fetchRooms(code: string, hotelId: string) {
      const { getHotelById } = useHotelService();
      roomsLoading.value = true;
      roomsError.value = "";

      try {
        const res = await getHotelById(code, hotelId);
        const hotelData = res?.hotel ?? (res as any);

        // Persist the full hotel detail
        if (hotelData?.hotel_id) {
          hotel.value = { ...hotel.value, ...hotelData };
        }

        const roomTypes: string[] = hotelData?.roomType ?? [];
        const bookingKey: string = hotelData?.BookingKey ?? "";
        const boardBasis: string[] = hotelData?.board_basis ?? [];
        const totalPrice: number = hotelData?.price ?? 0;

        if (roomTypes.length > 0) {
          availableRooms.value = roomTypes.map((type) => ({
            rezliveRoomId: bookingKey,
            roomName: type,
            boardType: extractBoardType(boardBasis.join(", ")),
            pricePerNight:
              nights.value > 0 ? totalPrice / nights.value : totalPrice,
            totalPrice,
            cancellationPolicy: "Free cancellation",
            amenities: boardBasis,
            rawRates: String(totalPrice),
          }));
        } else {
          // Fallback: legacy rooms array (backward compat)
          const rooms: any[] = (res as any)?.rooms ?? [];
          availableRooms.value = rooms.map((room: any) => {
            const rates = room.TotalRate.split("|").map(Number);
            const tp = rates.reduce((s: number, r: number) => s + r, 0);
            return {
              rezliveRoomId: room.BookingKey,
              roomName: room.Type.split("|")[0],
              boardType: extractBoardType(room.RoomDescription),
              pricePerNight: tp / nights.value,
              totalPrice: tp,
              cancellationPolicy:
                room.CancellationPolicy?.Refundable === "No"
                  ? "Non-refundable"
                  : `Free cancellation until ${room.CancellationPolicy?.TillDate ?? ""}`,
              amenities: extractAmenities(room.RoomDescription),
              rawRates: room.TotalRate ?? "",
            };
          });
        }
      } catch (e: any) {
        roomsError.value = e?.message || "Failed to load rooms";
      } finally {
        roomsLoading.value = false;
      }
    }

    function selectRoom(room: SelectedRoom) {
      selectedRoom.value = room;
      guests.value = buildGuestList(searchParams.value.rooms);
      errorMessage.value = "";
      status.value = "idle";
      if (guests.value[0]) {
        guests.value[0].email = contactEmail.value;
        guests.value[0].phone = contactPhone.value;
      }
    }

    async function runPreBook(room: SelectedRoom): Promise<boolean> {
      const { preBooking } = useHotelService();

      preBookLoading.value = true;
      preBookError.value = "";

      try {
        // ── Validate required payload fields before sending ──
        // This guards against stale / empty searchParams that can occur
        // when Pinia persistence or sessionStorage hydrates empty values.
        const missing: string[] = [];

        if (!searchParams.value.checkInStart) missing.push("arrival date");
        if (!searchParams.value.checkInEnd) missing.push("departure date");
        if (!searchParams.value.nationality) missing.push("nationality");
        if (!searchParams.value.country) missing.push("country");
        if (!searchParams.value.city) missing.push("city");

        const roomsAdults = searchParams.value.rooms.map((r) => r.adults ?? 1);
        if (roomsAdults.length === 0) missing.push("room guests");

        if (missing.length > 0) {
          preBookError.value = `Booking details are incomplete (${missing.join(", ")}). Please go back and search again.`;
          console.warn(
            "[hotelBooking] runPreBook blocked — incomplete payload",
            { missing, searchParams: searchParams.value, sessionId: sessionId.value },
          );
          preBookLoading.value = false;
          return false;
        }

        const roomsChildren = searchParams.value.rooms.map(
          (r) => r.children ?? 0,
        );
        const roomsChildrenAges = searchParams.value.rooms.flatMap((r) =>
          (r.children ?? 0) > 0 && r.childAges?.length
            ? r.childAges.slice(0, r.children)
            : [],
        );

        const payload: PreBookingData = {
          search_session_id: sessionId.value,
          arrival_date: searchParams.value.checkInStart,
          departure_date: searchParams.value.checkInEnd,
          nationality: searchParams.value.nationality,
          country_code: searchParams.value.country,
          city_code: searchParams.value.city.toString(),
          hotel_id: hotel.value?.hotel_id ?? "",
          currency: searchParams.value.currency ?? "USD",
          rooms_adults: roomsAdults,
          rooms_children: roomsChildren,
          rooms_children_ages: roomsChildrenAges,
          room_type: room.roomName,
          booking_key: room.rezliveRoomId,
          total_rate: room.totalPrice,
        };

        const result = await preBooking(payload);
        const roomsKey = result?.room?.bookingKey;
        const totalRate = result?.room?.totalRate;

        if (!result?.searchSessionId || !roomsKey) {
          preBookError.value =
            result?.message ||
            "An error occurred while pre-booking the room. Please try again.";
          return false;
        }

        preBookResult.value = result;
        prebookedRoomsKey.value = roomsKey;
        preBookTotalRate.value = totalRate;

        return true;
      } catch (e: any) {
        preBookError.value =
          e?.message || "Pre-booking failed. Please try again.";
        return false;
      } finally {
        preBookLoading.value = false;
      }
    }

    function buildBookingPayload(): CreateBookingData {
      const roomsAdults = searchParams.value.rooms.map((r) => r.adults ?? 0);
      const roomsChildren = searchParams.value.rooms.map(
        (r) => r.children ?? 0,
      );

      // Build travellers with room index
      const travellers: any[] = [];
      searchParams.value.rooms.forEach((room, roomIndex) => {
        for (let a = 0; a < (room.adults ?? 1); a++) {
          const guestIndex = travellers.length;
          const g = guests.value[guestIndex];
          if (g) {
            travellers.push({
              type: "ADULT",
              title: g.title,
              first_name: g.firstName,
              last_name: g.lastName,
              room: roomIndex,
            });
          }
        }
        for (let c = 0; c < (room.children ?? 0); c++) {
          const guestIndex = travellers.length;
          const g = guests.value[guestIndex];
          if (g) {
            travellers.push({
              type: "CHILD",
              title: g.title,
              first_name: g.firstName,
              last_name: g.lastName,
              age: g.age,
              room: roomIndex,
            });
          }
        }
      });

      return {
        session_code: sessionId.value,
        search_session_id: sessionId.value,
        hotel_id: hotel.value?.hotel_id ?? "",
        hotel_name: hotel.value?.hotel_name ?? "",
        country_code: searchParams.value.country,
        city_code: searchParams.value.city.toString(),
        arrival_date: searchParams.value.checkInStart,
        departure_date: searchParams.value.checkInEnd,
        rooms_type: selectedRoom.value?.roomName ?? "",
        rooms_key: prebookedRoomsKey.value || "",
        rooms_adults: roomsAdults,
        rooms_children: roomsChildren,
        room_rates: preBookTotalRate.value,
        travellers,
      };
    }

    async function submitGuests(): Promise<boolean> {
      const { createBooking } = useHotelService();

      if (!selectedRoom.value) {
        status.value = "error";
        errorMessage.value =
          "No room selected. Please go back and select a room.";
        return false;
      }

      status.value = "submitting";
      errorMessage.value = "";

      const primary = guests.value[0];
      if (primary) {
        contactEmail.value = primary.email;
        contactPhone.value = primary.phone;
      }

      try {
        const payload = buildBookingPayload();
        const result = await createBooking(payload);

        bookingReference.value =
          (result as any)?.booking_reference ||
          (result as any)?.reference ||
          (result as any)?.id ||
          "";
        status.value = "confirmed";
        generateInvoice();
        return true;
      } catch (e: any) {
        status.value = "error";
        errorMessage.value = e?.message || "Booking failed. Please try again.";
        return false;
      }
    }

    function generateInvoice() {
      invoiceNumber.value = `HTL-${Date.now().toString(36).toUpperCase()}`;
      invoiceDate.value = new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    }

    function reset() {
      hotel.value = null;
      sessionCode.value = "";
      sessionId.value = "";
      selectedRoom.value = null;
      availableRooms.value = [];
      guests.value = [];
      contactEmail.value = "";
      contactPhone.value = "";
      isLoggedIn.value = false;
      accountName.value = "";
      invoiceNumber.value = "";
      invoiceDate.value = "";
      bookingReference.value = "";
      voucherUrl.value = "";
      status.value = "idle";
      errorMessage.value = "";
      step.value = 1;
      preBookResult.value = null;
      prebookedRoomsKey.value = "";
      preBookTotalRate.value = "";
      preBookError.value = "";
      searchParams.value = {
        country: "",
        city: "",
        checkInStart: "",
        checkInEnd: "",
        rooms: [],
        totalGuests: 1,
        totalRooms: 1,
        nationality: "",
        currency: "USD",
      };
    }

    return {
      hotel,
      sessionCode,
      sessionId,
      searchParams,
      selectedRoom,
      availableRooms,
      guests,
      contactEmail,
      contactPhone,
      isLoggedIn,
      accountName,
      invoiceNumber,
      invoiceDate,
      bookingReference,
      voucherUrl,
      status,
      errorMessage,
      roomsLoading,
      roomsError,
      step,
      preBookLoading,
      preBookError,
      preBookResult,
      prebookedRoomsKey,
      preBookTotalRate,
      nights,
      priceBreakdown,
      setHotel,
      fetchRooms,
      selectRoom,
      runPreBook,
      submitGuests,
      generateInvoice,
      reset,
    };
  },

  {
    unstorage: {
      pick: [
        "hotel",
        "sessionCode",
        "sessionId",
        "searchParams",
        "selectedRoom",
        "guests",
        "contactEmail",
        "contactPhone",
        "isLoggedIn",
        "accountName",
        "invoiceNumber",
        "invoiceDate",
        "bookingReference",
        "voucherUrl",
        "status",
        "errorMessage",
        "step",
        "prebookedRoomsKey",
        "preBookTotalRate",
      ],
    },
  },
);

function extractBoardType(desc: string): string {
  if (!desc) return "Room Only";
  const d = desc.toLowerCase();
  if (d.includes("breakfast")) return "Bed & Breakfast";
  if (d.includes("half")) return "Half Board";
  if (d.includes("full")) return "Full Board";
  return "Room Only";
}

function extractAmenities(desc: string): string[] {
  if (!desc) return [];
  return desc
    .split("-")
    .slice(1)
    .join("-")
    .split(",")
    .map((a: string) => a.trim())
    .filter(Boolean);
}
