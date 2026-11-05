import { defineStore } from "pinia";
import { ref, computed, nextTick } from "vue";
import { useHotelService } from "../services/hotel.service";
import type {
  CancellationPolicyEntry,
  CreateBookingData,
  PreBookingData,
  RoomConfig,
} from "../types/hotel";
import {
  cancellationPolicyToText,
  extractPayAtHotelFees,
  extractTermsAndConditions,
  normalizeChildAge,
  parseXmlAttributes,
  pickField,
  unescapeXmlEntities,
  xmlText,
} from "../utils/hotel";
import { normaliseError } from "../utils/api";

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
  cancellationFee?: string;
  termsAndConditions?: string;
  /** Fees payable directly to the hotel at check-in for this room. */
  payAtHotelFees?: { amount: string; currency: string; description: string }[];
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
    const hotel = ref<any>(null);
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
    const preBookResult = ref<any>(null);
    const prebookedRoomsKey = ref<string>("");
    const preBookTotalRate = ref<string>("");
    // Updated rate received from the pre-book response `<BookingAfterPrice>` tag.
    // Used for the booking request and to notify the user of a price change.
    const bookingAfterPrice = ref<string>("");
    const rateChange = ref<{
      previousRate: number;
      updatedRate: number;
      currency: string;
    } | null>(null);
    // Hotel fees that must be paid directly to the hotel at check-in (not charged by us).
    const hotelFees = ref<{ amount: string; currency: string; description: string }[]>([]);
    // Cancellation policy info returned from the pre-book response.
    const preBookCancellationInfo = ref<{
      policy: string;
      chargeType: string;
      chargeAmount: string;
      currency: string;
      startDate: string;
      endDate: string;
      terms: string;
    } | null>(null);
    // Full cancellation schedule from the pre-book response, including every
    // cancellation window the supplier returned (one entry per period).
    const preBookCancellationDetails = ref<{
      info: string;
      entries: CancellationPolicyEntry[];
    } | null>(null);

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
      // Prefer the confirmed updated rate (from the pre-book `afterPrice` /
      // `<BookingAfterPrice>` response) over the originally quoted room price,
      // so the summary, review and payment all reflect the accepted price.
      // NOTE: `totalPrice` is already the total for all rooms — do NOT multiply
      // by room count again.
      const confirmed = Number(bookingAfterPrice.value);
      const base =
        bookingAfterPrice.value && Number.isFinite(confirmed)
          ? confirmed
          : (selectedRoom.value?.totalPrice ?? 0);
      // Always round UP to the nearest whole number (feedback #3).
      const baseNgn = Math.ceil(base);
      const tax = Math.round(baseNgn * TAX_RATE);
      const total = baseNgn + tax;
      return { baseUsd: base, baseNgn, tax, total };
    });

    // Per-room-per-night rate, reflecting the confirmed updated price when the
    // user has accepted a rate change (otherwise the quoted price).
    // totalPrice is already the grand total for all rooms, so divide by rooms
    // and nights to get the per-room-per-night figure.
    const effectivePricePerNight = computed(() => {
      const confirmed = Number(bookingAfterPrice.value);
      if (bookingAfterPrice.value && Number.isFinite(confirmed)) {
        const rooms = searchParams.value.totalRooms || 1;
        const nightsCount = nights.value || 1;
        return confirmed / rooms / nightsCount;
      }
      return selectedRoom.value?.pricePerNight ?? 0;
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
            title: "Child",
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
        bookingAfterPrice.value = "";
        rateChange.value = null;
        hotelFees.value = [];
        preBookCancellationInfo.value = null;
        preBookCancellationDetails.value = null;
        bookingReference.value = "";
        invoiceNumber.value = "";
        invoiceDate.value = "";
        voucherUrl.value = "";
      }
    }

    async function fetchRooms(code: string, hotelId: string) {
      const { getHotelById } = useHotelService();
      roomsLoading.value = true;
      roomsError.value = "";

      try {
        const res = await getHotelById(code, hotelId);
        const hotelData = res?.hotel ?? (res as any);
        const searchRate: number = Number(hotel.value?.price) || 0;
        const searchCancellationPolicy = normalizeCancellationPolicy(
          hotel.value?.cancellation_policy,
          readSearchCancellationPolicy(),
        );

        const searchRooms: any[] =
          (hotel.value?.rooms ?? []).length > 0
            ? hotel.value.rooms
            : (hotelData?.rooms ?? []);

        // Persist the full hotel detail
        if (hotelData?.hotel_id) {
          hotel.value = { ...hotel.value, ...hotelData };
          // Preserve the search-quoted rate (the detail `price` may differ).
          if (searchRate > 0) {
            hotel.value.price = searchRate;
          }
          // Restore the search rooms array if the detail response wiped it.
          if (searchRooms.length > 0 && !hotel.value.rooms?.length) {
            hotel.value.rooms = searchRooms;
          }
        }

        const bookingKey: string = hotelData?.BookingKey ?? "";
        const boardBasis: string[] = hotelData?.board_basis ?? [];

        if (searchRooms.length > 0) {
          const cancPolicy: string = normalizeCancellationPolicy(
            searchCancellationPolicy,
            hotelData?.cancellation_policy,
          );

          availableRooms.value = searchRooms.map((room: any) => {
            const rawRoomPrice = room.price ?? room.Price;
            const roomPrice = sumRates(parseRateParts(rawRoomPrice));
            const roomKey = room.booking_key ?? room.BookingKey ?? bookingKey;
            const roomTypes: string[] = room.type ?? room.Type ?? [];
            const roomName = Array.isArray(roomTypes)
              ? roomTypes[0] ?? ""
              : String(roomTypes);
            const roomBoardBasis: string[] =
              room.description ?? room.Description ?? boardBasis;
            const roomCount = searchParams.value.totalRooms || 1;

            // Per-room policy (new API carries it per room, nested under
            // `cancellation_policy.policy`).
            const rawPolicy = room.cancellation_policy ?? room.CancellationPolicy;
            const roomPolicy = normalizeCancellationPolicy(rawPolicy, cancPolicy);
            const roomTerms = extractTermsAndConditions(room);
            const roomFees = extractPayAtHotelFees(room);

            return {
              rezliveRoomId: roomKey,
              roomName,
              boardType: extractBoardType(
                Array.isArray(roomBoardBasis)
                  ? roomBoardBasis.join(", ")
                  : String(roomBoardBasis),
              ),
              pricePerNight:
                nights.value > 0 && roomCount > 0
                  ? roomPrice / roomCount / nights.value
                  : roomPrice,
              totalPrice: roomPrice,
              cancellationPolicy: roomPolicy,
              termsAndConditions: roomTerms,
              payAtHotelFees: roomFees,
              amenities: Array.isArray(roomBoardBasis)
                ? roomBoardBasis
                : [String(roomBoardBasis)],
              rawRates: String(roomPrice),
            };
          });
        } else {
          // ── Old/fallback format: flat roomType[] + single hotel-level price ──
          const roomTypes: string[] = hotelData?.roomType ?? [];
          const totalPrice: number =
            searchRate > 0 ? searchRate : (hotelData?.price ?? 0);

          if (roomTypes.length > 0) {
            const roomCount = searchParams.value.totalRooms || 1;
            const cancPolicy: string = normalizeCancellationPolicy(
              searchCancellationPolicy,
              hotelData?.cancellation_policy,
            );
            const hotelPolicy =
              hotel.value?.cancellation_policy ??
              hotelData?.cancellation_policy;
            const hotelTerms = extractTermsAndConditions(hotelPolicy);
            const hotelPayFees = extractPayAtHotelFees(hotelPolicy);

            availableRooms.value = roomTypes.map((type) => ({
              rezliveRoomId: bookingKey,
              roomName: type,
              boardType: extractBoardType(boardBasis.join(", ")),
              pricePerNight:
                nights.value > 0 && roomCount > 0
                  ? totalPrice / roomCount / nights.value
                  : totalPrice,
              totalPrice,
              cancellationPolicy: cancPolicy,
              termsAndConditions: hotelTerms,
              payAtHotelFees: hotelPayFees,
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
                cancellationPolicy: normalizeCancellationPolicy(
                  room.CancellationPolicy,
                ),
                termsAndConditions: extractTermsAndConditions(room),
                payAtHotelFees: extractPayAtHotelFees(room),
                amenities: extractAmenities(room.RoomDescription),
                rawRates: room.TotalRate ?? "",
              };
            });
          }
        }
      } catch (e: any) {
        roomsError.value = normaliseError(e) || "Failed to load rooms";
      } finally {
        roomsLoading.value = false;
      }
    }

    function selectRoom(room: SelectedRoom) {
      // Clone so pre-book enrichment (terms/fees) never mutates the room list,
      // and re-selecting the room restores its quoted values.
      selectedRoom.value = { ...room };
      // Surface any pay-at-hotel fees immediately, before the pre-book call.
      hotelFees.value = room.payAtHotelFees?.length
        ? room.payAtHotelFees
        : extractHotelFees(hotel.value);
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
      // Reset any prior rate-change state so a fresh pre-book never reuses a
      // stale confirmed/declined price from a previous room selection.
      rateChange.value = null;
      bookingAfterPrice.value = "";
      // Keep the fees/terms captured from the search result until the
      // pre-book response provides richer values.
      hotelFees.value = selectedRoom.value?.payAtHotelFees?.length
        ? selectedRoom.value.payAtHotelFees
        : extractHotelFees(hotel.value);
      preBookCancellationInfo.value = null;
      preBookCancellationDetails.value = null;

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
            ? r.childAges.slice(0, r.children).map((a) => normalizeChildAge(a))
            : [],
        );

        const roomCount = searchParams.value.totalRooms || searchParams.value.rooms.length || 1;
        const perRoomRate = room.totalPrice / roomCount;

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
          total_rate: perRoomRate,
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

        // ── Extract detailed cancellation policy from the pre-book response ──
        const cancellationDetails = extractCancellationDetails(result);
        preBookCancellationDetails.value = cancellationDetails;
        preBookCancellationInfo.value = cancellationDetails
          ? cancellationInfoFromDetails(cancellationDetails)
          : null;

        // ── Extract hotel fees (paid at check-in, not charged by us) ──
        // Merge with any fees already captured from the search result.
        hotelFees.value = mergeHotelFees(
          hotelFees.value,
          extractHotelFees(result),
        );

        // ── Capture room Terms & Conditions exactly as returned ──
        // The pre-book response carries the room's fine print under
        // `room.terms` (an HTML string). Search results may already carry
        // `cancellation_policy.terms_and_conditions`; only override when the
        // pre-book response actually provides terms.
        const prebookTerms = extractRoomTerms(result);
        if (selectedRoom.value && prebookTerms) {
          selectedRoom.value.termsAndConditions = prebookTerms;
        }

        // ── Rate change detection via `<BookingAfterPrice>` ──
        // The pre-book response may carry an updated rate that differs from the
        // originally quoted total. If so, flag it so the UI can confirm with
        // the user before proceeding (and the booking request must use it).
        const afterPrice = extractBookingAfterPrice(result);
        const previousRate = extractBeforePrice(result, totalRate);

        if (
          afterPrice !== undefined &&
          Math.abs(afterPrice - previousRate) > 0.005
        ) {
          rateChange.value = {
            previousRate,
            updatedRate: afterPrice,
            currency: searchParams.value.currency ?? "USD",
          };
        } else {
          rateChange.value = null;
        }

        return true;
      } catch (e: any) {
        preBookError.value =
          normaliseError(e) || "Pre-booking failed. Please try again.";
        return false;
      } finally {
        preBookLoading.value = false;
      }
    }

    function buildBookingPayload(
      overrideAmount?: number | string,
    ): CreateBookingData {
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
              title: "Child",
              first_name: g.firstName,
              last_name: g.lastName,
              age: normalizeChildAge(g.age),
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
        room_rates: buildBookingRoomRates(),
        travellers,
        amount: overrideAmount ?? (priceBreakdown.value.total || 0),
      };
    }

    // When the user confirms an updated rate, re-distribute it across rooms so
    // the booking request's pipeline-separated `room_rates` sums to the
    // confirmed `<BookingAfterPrice>`. Without a change, keep the pre-book rate.
    function buildBookingRoomRates(): string {
      const updated = Number(bookingAfterPrice.value);
      if (bookingAfterPrice.value && Number.isFinite(updated)) {
        const roomCount =
          searchParams.value.totalRooms || searchParams.value.rooms.length || 1;
        return distributeRates(updated, roomCount, preBookTotalRate.value);
      }
      return preBookTotalRate.value;
    }

    // The user accepted the updated rate; persist it for the booking request.
    function acceptRateChange(): void {
      if (rateChange.value) {
        bookingAfterPrice.value = String(rateChange.value.updatedRate);
      }
      rateChange.value = null;
    }

    // The user declined the updated rate; clear it and fall back to the
    // originally quoted rate.
    function declineRateChange(): void {
      rateChange.value = null;
      bookingAfterPrice.value = "";
    }

    // Helper: check if a raw policy string indicates non-refundable
    // Computed: whether the cancellation policy is non-refundable
    const isNonRefundable = computed(() => {
      // Priority 1: pre-book response (most accurate, comes after room selection)
      if (preBookCancellationInfo.value) {
        const policy = preBookCancellationInfo.value.policy.toLowerCase();
        return (
          policyIsNonRefundable(policy) ||
          (preBookCancellationInfo.value.chargeType === "Percentage" &&
            Number(preBookCancellationInfo.value.chargeAmount) >= 100)
        );
      }
      // Priority 2: cancellation_policy from the search/detail API on the selected room
      if (selectedRoom.value?.cancellationPolicy) {
        return policyIsNonRefundable(selectedRoom.value.cancellationPolicy);
      }
      return false;
    });

    // Human-readable cancellation policy string
    const cancellationPolicyText = computed(() => {
      // Priority 1: pre-book response (most authoritative)
      if (preBookCancellationInfo.value) {
        const info = preBookCancellationInfo.value;
        if (
          info.chargeType === "Percentage" &&
          Number(info.chargeAmount) >= 100
        ) {
          return "Non-refundable (100% cancellation fee)";
        }
        if (info.policy && info.policy !== "") {
          return info.policy;
        }
        if (info.terms && info.terms !== "") {
          return info.terms;
        }
      }
      // Priority 2: cancellation_policy from the search/detail API
      // (available at room-list stage, before pre-book completes)
      if (
        selectedRoom.value?.cancellationPolicy &&
        selectedRoom.value.cancellationPolicy !== "See cancellation policy"
      ) {
        return selectedRoom.value.cancellationPolicy;
      }
      return selectedRoom.value?.cancellationPolicy ?? "";
    });

    // Full room Terms & Conditions returned by the pre-book API
    // (`room.terms`). Rendered verbatim on the booking pages.
    const roomTerms = computed(
      () => selectedRoom.value?.termsAndConditions?.trim() ?? "",
    );

    async function submitGuests(
      overrideAmount?: number | string,
    ): Promise<boolean> {
      const { createBooking } = useHotelService();

      if (bookingReference.value) {
        return true;
      }

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
        const payload = buildBookingPayload(overrideAmount);
        const result = await createBooking(payload);

        bookingReference.value =
          (result as any)?.booking_code ||
          (result as any)?.booking_reference ||
          (result as any)?.reference ||
          (result as any)?.rezliveBookingCode ||
          (result as any)?.id ||
          "";
        status.value = "confirmed";
        generateInvoice();
        return true;
      } catch (e: any) {
        status.value = "error";
        errorMessage.value =
          normaliseError(e) || "Booking failed. Please try again.";
        return false;
      }
    }

    function generateInvoice() {

      if (!invoiceNumber.value) {
        invoiceNumber.value = `HTL-${Date.now().toString(36).toUpperCase()}`;
      }
      if (!invoiceDate.value) {
        invoiceDate.value = new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      }
    }

    function hydrateFromStorage() {
      if (typeof window === "undefined") return;
      // Already hydrated (e.g. SPA-internal navigation): leave state untouched.
      if (selectedRoom.value || bookingReference.value) return;

      try {
        const raw = window.localStorage.getItem("pinia:hotelBooking");
        if (!raw) return;
        const data = JSON.parse(raw);
        if (!data || typeof data !== "object") return;

        // Restore the persisted fields that the unstorage plugin stores
        const persisted: Record<string, { value: unknown }> = {
          hotel,
          sessionCode,
          sessionId,
          searchParams,
          selectedRoom,
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
          step,
          prebookedRoomsKey,
          preBookTotalRate,
          bookingAfterPrice,
          hotelFees,
          preBookCancellationInfo,
          preBookCancellationDetails,
        };
        for (const key of Object.keys(persisted)) {
          if (data[key] != null) persisted[key].value = data[key];
        }
      } catch {
        // Ignore malformed / legacy storage.
      }
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
      bookingAfterPrice.value = "";
      rateChange.value = null;
      preBookError.value = "";
      hotelFees.value = [];
      preBookCancellationInfo.value = null;
      preBookCancellationDetails.value = null;
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

      // Remove the persisted key so no empty booking state lingers in
      // localStorage (the unstorage plugin re-writes state on every mutation,
      // so this must run after that write flushes).
      void nextTick(() => {
        if (typeof window !== "undefined") {
          window.localStorage.removeItem("pinia:hotelBooking");
        }
      });
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
      bookingAfterPrice,
      rateChange,
      hotelFees,
      preBookCancellationInfo,
      preBookCancellationDetails,
      isNonRefundable,
      cancellationPolicyText,
      roomTerms,
      nights,
      priceBreakdown,
      effectivePricePerNight,
      setHotel,
      fetchRooms,
      selectRoom,
      runPreBook,
      acceptRateChange,
      declineRateChange,
      buildBookingPayload,
      submitGuests,
      generateInvoice,
      hydrateFromStorage,
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
        "bookingAfterPrice",
        "hotelFees",
        "preBookCancellationInfo",
        "preBookCancellationDetails",
      ],
    },
  },
);

function parseRateParts(rate: string | number | null | undefined): number[] {
  if (rate === null || rate === undefined) return [];
  const parts: number[] = [];
  for (const seg of String(rate).split("|")) {
    const n = Number(seg);
    if (Number.isFinite(n)) parts.push(n);
  }
  return parts;
}

function sumRates(parts: number[]): number {
  return parts.reduce((s: number, n: number) => s + n, 0);
}

function extractBookingAfterPrice(result: any): number | undefined {
  const raw =
    result?.afterPrice ??
    result?.BookingAfterPrice ??
    result?.bookingAfterPrice ??
    result?.room?.afterPrice ??
    result?.room?.BookingAfterPrice ??
    result?.room?.bookingAfterPrice ??
    result?.room?.booking_after_price;

  if (raw === null || raw === undefined || raw === "") return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
}

function extractBeforePrice(
  result: any,
  totalRate?: string | number | null,
): number {
  const raw =
    result?.beforePrice ??
    result?.room?.beforePrice ??
    result?.room?.BookingBeforePrice;
  if (raw !== null && raw !== undefined && raw !== "") {
    const n = Number(raw);
    if (Number.isFinite(n)) return n;
  }
  return sumRates(parseRateParts(totalRate));
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function distributeRates(
  total: number,
  roomCount: number,
  originalRate?: string,
): string {
  const count = Math.max(1, roomCount);
  const parts = originalRate ? parseRateParts(originalRate) : [];

  if (parts.length === count) {
    const oldSum = sumRates(parts);
    if (oldSum > 0) {
      const scaled = parts.map((p) => round2((p / oldSum) * total));
      const last = scaled.length - 1;
      scaled[last] = round2(scaled[last] + (total - sumRates(scaled)));
      return scaled.join("|");
    }
  }

  const per = round2(total / count);
  const arr: number[] = new Array(count).fill(per);
  const last = arr.length - 1;
  arr[last] = round2(arr[last] + (total - per * count));
  return arr.join("|");
}

const UNKNOWN_CANCELLATION_POLICY = "See cancellation policy";

/** Check if a raw policy string indicates the booking is non-refundable. */
function policyIsNonRefundable(policy: string): boolean {
  const p = policy.toLowerCase();
  return (
    p.includes("non-refundable") ||
    p.includes("non refundable") ||
    p.includes("nonrefundable") ||
    p.includes("no refund") ||
    p.includes("100%")
  );
}

/**
 * Normalise a cancellation policy into a display string.
 *
 * Handles the legacy flat shape `{ Refundable, TillDate }`, the newer search
 * shape `{ policy: { Refundable, TillDate }, ... }`, plain strings and
 * JSON-encoded objects. The generic "See cancellation policy" placeholder is
 * skipped so a real value from an earlier candidate can win.
 */
function normalizeCancellationPolicy(...candidates: unknown[]): string {
  for (const raw of candidates) {
    const value = cancellationPolicyToText(raw);
    if (value) return value;
  }

  return UNKNOWN_CANCELLATION_POLICY;
}

/**
 * Read the cancellation policy captured by the search page from the
 * `selectedHotel` sessionStorage entry. Used as a fallback when the store's
 * `hotel` is not hydrated yet (child `onMounted` can run before the parent
 * page restores state).
 */
function readSearchCancellationPolicy(): unknown {
  if (typeof sessionStorage === "undefined") return undefined;
  try {
    const raw = sessionStorage.getItem("selectedHotel");
    if (!raw) return undefined;
    const parsed = JSON.parse(raw);
    return parsed?.hotel?.cancellation_policy;
  } catch {
    return undefined;
  }
}

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

function normalizeCancellationEntry(raw: any): CancellationPolicyEntry {
  return {
    startDate: pickField(raw, [
      "startDate",
      "from",
      "dateFrom",
      "fromDate",
      "start",
    ]),
    endDate: pickField(raw, ["endDate", "to", "dateTo", "toDate", "end"]),
    chargeType: pickField(raw, [
      "chargeType",
      "type",
      "penaltyType",
      "amountType",
    ]),
    chargeAmount: pickField(raw, [
      "chargeAmount",
      "amount",
      "penaltyAmount",
      "value",
    ]),
    currency: pickField(raw, ["currency", "currencyCode"]),
  };
}

function cancellationEntryHasData(entry: CancellationPolicyEntry): boolean {
  return Boolean(
    entry.startDate || entry.endDate || entry.chargeAmount || entry.chargeType,
  );
}

/**
 * Recursively collect cancellation entries from nested containers such as
 * `{ cancellationInformation: { policy: [ ... ] } }`.
 */
function collectCancellationEntries(value: any): any[] {
  const results: any[] = [];

  const visit = (node: any) => {
    if (!node) return;
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }
    if (typeof node !== "object") return;

    // If the node itself looks like a cancellation entry, keep it.
    if (
      pickField(node, [
        "startDate",
        "from",
        "dateFrom",
        "chargeAmount",
        "amount",
        "chargeType",
        "penaltyType",
      ])
    ) {
      results.push(node);
      return;
    }

    // Otherwise descend into nested objects/arrays. Only entry-like nodes are
    // kept, so this safely handles keyed or differently-named containers.
    for (const child of Object.values(node)) {
      if (child && typeof child === "object") visit(child);
    }
  };

  visit(value);
  return results;
}

/**
 * Extract the full cancellation schedule from the pre-book response.
 *
 * Supports the JSON shapes the API may return (`cancellationInformations`
 * with a single `cancellationInformation` or an array of them, under `room`
 * or top level) as well as raw XML/JSON strings forwarded from the supplier.
 */
function extractCancellationDetails(
  result: any,
): { info: string; entries: CancellationPolicyEntry[] } | null {
  let raw =
    result?.cancellationInformations ??
    result?.room?.cancellationInformations ??
    result?.CancellationInformations ??
    result?.room?.CancellationInformations ??
    result?.cancellationInformation ??
    result?.room?.cancellationInformation ??
    result?.CancellationInformation ??
    result?.room?.CancellationInformation ??
    result?.cancellationPolicies ??
    result?.room?.cancellationPolicies ??
    result?.cancellationPolicy ??
    result?.room?.cancellationPolicy ??
    result?.CancellationPolicy ??
    result?.room?.CancellationPolicy;

  if (raw === null || raw === undefined || raw === "") return null;

  // Some backends forward the supplier XML (or a JSON string) verbatim.
  if (typeof raw === "string") {
    const text = unescapeXmlEntities(raw).trim();
    if (text.startsWith("{") || text.startsWith("[")) {
      try {
        raw = JSON.parse(text);
      } catch {
        // Fall through and try the XML parser.
      }
    }
    if (typeof raw === "string") {
      if (!text.includes("<")) return null;
      const entries = parseXmlAttributes(text, [
        "CancellationInformation",
        "CancellationInformations",
        "CancellationPolicy",
        "Cancellation",
        "Policy",
        "Fee",
      ])
        .map(normalizeCancellationEntry)
        .filter(cancellationEntryHasData);
      const info = xmlText(text, ["Info", "Description", "Text"]);
      if (!info && entries.length === 0) return null;
      return { info, entries };
    }
  }

  const info =
    raw && typeof raw === "object" && !Array.isArray(raw)
      ? pickField(raw, [
          "info",
          "description",
          "text",
          "policy",
          "policyDescription",
        ])
      : "";

  const entries = collectCancellationEntries(raw)
    .map(normalizeCancellationEntry)
    .filter(cancellationEntryHasData);

  if (!info && entries.length === 0) return null;
  return { info, entries };
}

/** Build the compact summary used by the existing one-line UI/sidebar. */
function cancellationInfoFromDetails(details: {
  info: string;
  entries: CancellationPolicyEntry[];
}): {
  policy: string;
  chargeType: string;
  chargeAmount: string;
  currency: string;
  startDate: string;
  endDate: string;
  terms: string;
} {
  const first = details.entries[0];
  return {
    policy: details.info || "",
    chargeType: first?.chargeType ?? "",
    chargeAmount: String(first?.chargeAmount ?? ""),
    currency: first?.currency ?? "",
    startDate: first?.startDate ?? "",
    endDate: first?.endDate ?? "",
    terms: details.info,
  };
}

/**
 * Extract the room Terms & Conditions from any response shape. The supplier
 * returns them under `room.terms`; the search API nests them inside
 * `cancellation_policy.terms_and_conditions`.
 */
function extractRoomTerms(result: any): string {
  return extractTermsAndConditions(result);
}

/**
 * Extract extra fees that are paid directly to the hotel at check-in (not
 * charged by us). Supports the nested `cancellation_policy.pay_at_hotel_fees`
 * shape, legacy `hotelFees` arrays, parsed objects and raw XML/JSON strings.
 */
function extractHotelFees(
  result: any,
): { amount: string; currency: string; description: string }[] {
  const candidates = [
    result?.room,
    result,
    result?.cancellation_policy,
    result?.room?.cancellation_policy,
  ];

  return mergeHotelFees(
    ...candidates.map((candidate) => extractPayAtHotelFees(candidate)),
  );
}

/** De-duplicate and merge fee lists from multiple sources. */
function mergeHotelFees(
  ...lists: { amount: string; currency: string; description: string }[][]
): { amount: string; currency: string; description: string }[] {
  const merged: { amount: string; currency: string; description: string }[] =
    [];
  const seen = new Set<string>();

  for (const list of lists) {
    for (const fee of list) {
      const key = `${fee.description}|${fee.amount}|${fee.currency}`;
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(fee);
    }
  }

  return merged;
}
