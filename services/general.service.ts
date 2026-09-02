import { ApiResponse } from "../types/api";
import {
  AboutUsResponse,
  AddressResponse,
  AirportProtocolData,
  AirportProtocolResponse,
  AirpotTransferData,
  AirpotTransferResponse,
  ContactUsData,
  ContactUsResponse,
  CurrencyRateEntry,
  CurrencyRateLookup,
  DesignExperienceData,
  DesignExperienceResponse,
  GenerateInvoiceData,
  GenerateInvoiceResponse,
  HeroSectionResponse,
  HotDealResponse,
  NewsLetterData,
  NewsLetterResponse,
  PackageQuoteData,
  PackageQuoteResponse,
  PackageResponse,
  PartnersResponse,
  ReviewsResponse,
  StatsResponse,
  TourGuideData,
  TourGuideResponse,
  TravelInsuranceData,
  TravelInsuranceResponse,
} from "../types/general";
import type {
  BookingInfoResponse,
  BookingSearchParams,
  CancelBookingData,
  CancelBookingResponse,
} from "../types/booking";
import { useApi } from "../utils/api";

export function useGeneralService() {
  const $api = useApi();

  return {
    async contactUs(data: ContactUsData): Promise<ContactUsResponse> {
      const res = await $api<ApiResponse<ContactUsResponse>>(
        "/services/contact",
        {
          method: "POST",
          body: data,
        },
      );
      return res.data;
    },

    async saveTravelInsurance(
      data: TravelInsuranceData,
    ): Promise<TravelInsuranceResponse> {
      const res = await $api<ApiResponse<TravelInsuranceResponse>>(
        "/services/insurance",
        {
          method: "POST",
          body: data,
        },
      );
      return res.data;
    },

    async saveAirportTransfer(
      data: AirpotTransferData,
    ): Promise<AirpotTransferResponse> {
      const res = await $api<ApiResponse<AirpotTransferResponse>>(
        "/services/airport-transfer",
        {
          method: "POST",
          body: data,
        },
      );
      return res.data;
    },

    async saveTourGuide(data: TourGuideData): Promise<TourGuideResponse> {
      const res = await $api<ApiResponse<TourGuideResponse>>(
        "/services/tour-guide",
        {
          method: "POST",
          body: data,
        },
      );
      return res.data;
    },

    async saveAirportProtocol(
      data: AirportProtocolData,
    ): Promise<AirportProtocolResponse> {
      const res = await $api<ApiResponse<AirportProtocolResponse>>(
        "/services/airport-protocol",
        {
          method: "POST",
          body: data,
        },
      );
      return res.data;
    },

    async getPackages(mode: string): Promise<PackageResponse[]> {
      const res = await $api<ApiResponse<PackageResponse[]>>(
        `/services/packages?mode=${mode}`,
        {
          method: "GET",
        },
      );

      return res.data;
    },

    async getPackage(id: string | number) {
      const response = await $api<ApiResponse<PackageResponse>>(
        `/services/travel-package/${id}`,
      );
      return response.data;
    },

    async getHotDeals(): Promise<HotDealResponse[]> {
      const res = await $api<ApiResponse<HotDealResponse[]>>(
        "/services/hotdeals",
        {
          method: "GET",
        },
      );

      return res.data;
    },

    async getHotDeal(id: number): Promise<HotDealResponse> {
      const res = await $api<ApiResponse<HotDealResponse>>(
        `/services/hot-deal/${id}`,
        {
          method: "GET",
        },
      );

      return res.data;
    },

    async saveNewsLetter(data: NewsLetterData): Promise<NewsLetterResponse> {
      const res = await $api<ApiResponse<NewsLetterResponse>>("/subscribe", {
        method: "POST",
        body: data,
      });
      return res.data;
    },

    async getAbout(): Promise<AboutUsResponse> {
      const res = await $api<ApiResponse<AboutUsResponse>>("/about-us", {
        method: "GET",
      });

      return res.data;
    },

    async getHeroSection(): Promise<HeroSectionResponse> {
      const res = await $api<ApiResponse<HeroSectionResponse>>(
        "/services/hero-section",
        {
          method: "GET",
        },
      );

      return res.data;
    },

    async getStats(): Promise<StatsResponse> {
      const res = await $api<ApiResponse<StatsResponse>>("/services/stats", {
        method: "GET",
      });

      return res.data;
    },

    async getPartners(): Promise<PartnersResponse[]> {
      const res = await $api<ApiResponse<PartnersResponse[]>>(
        "/services/partner",
        {
          method: "GET",
        },
      );

      return res.data;
    },

    async getReviews(): Promise<ReviewsResponse[]> {
      const res = await $api<ApiResponse<ReviewsResponse[]>>("/reviews", {
        method: "GET",
      });

      return res.data;
    },

    async generateInvoice(
      data: GenerateInvoiceData,
    ): Promise<GenerateInvoiceResponse> {
      const res = await $api<GenerateInvoiceResponse>("/invoice/generate", {
        method: "POST",
        body: data,
      });
      return res;
    },

    async getAddress(): Promise<AddressResponse[]> {
      const res = await $api<ApiResponse<AddressResponse[]>>(
        "/services/getAddress",
        {
          method: "GET",
        },
      );

      return res.data;
    },

    async saveDesignExperience(
      data: DesignExperienceData,
    ): Promise<DesignExperienceResponse> {
      const res = await $api<ApiResponse<DesignExperienceResponse>>(
        "/services/curate-experience",
        {
          method: "POST",
          body: data,
        },
      );
      return res.data;
    },

    async savePackageQuote(
      data: PackageQuoteData,
    ): Promise<PackageQuoteResponse> {
      const res = await $api<ApiResponse<PackageQuoteResponse>>(
        "/services/package-quotes",
        {
          method: "POST",
          body: data,
        },
      );
      return res.data;
    },

    async getAllRates(): Promise<CurrencyRateEntry[]> {
      const res = await $api<ApiResponse<CurrencyRateEntry[]>>(
        "/currencies/all-rates",
        { method: "GET" },
      );
      return res.data;
    },

    async getRate(from: string, to: string): Promise<number> {
      const res = await $api<ApiResponse<CurrencyRateLookup>>(
        "/currencies/rate",
        {
          method: "GET",
          body: { from: from.toLowerCase(), to: to.toLowerCase() },
        },
      );
      return res.data.rate;
    },

    async getBookingInfo(
      params: BookingSearchParams,
    ): Promise<BookingInfoResponse> {
      const res = await $api<ApiResponse<BookingInfoResponse>>(
        "/services/booking-info",
        {
          method: "GET",
          query: { bookingCode: params.bookingCode, type: params.type },
        },
      );
      return res.data;
    },

    async cancelHotelBooking(
      data: CancelBookingData,
    ): Promise<CancelBookingResponse> {
      const res = await $api<ApiResponse<CancelBookingResponse>>(
        "/hotels/cancel",
        {
          method: "POST",
          body: data,
        },
      );
      return res.data;
    },
  };
}
