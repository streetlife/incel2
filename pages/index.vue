<template>
  <div class="">
    <main>
      <HeroSection />
      <BookingSearch />
      <LatestPackages />
      <FeaturedPackages />
      <TrustedPartners />
      <CustomerReviews />
      <WhyChooseUs />
      <WhatsAppContact />
    </main>

    <FlashDealPopup />
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useScrollReveal } from "~/composables/useScrollReveal";
import HeroSection from "../components/HeroSection.vue";
import BookingSearch from "../components/BookingSearch.vue";
import LatestPackages from "../components/LatestPackages.vue";
import FeaturedPackages from "../components/FeaturedPackages.vue";
import WhyChooseUs from "../components/WhyChooseUs.vue";
import WhatsAppContact from "../components/WhatsAppContact.vue";
import TrustedPartners from "../components/TrustedPartners.vue";
import CustomerReviews from "../components/CustomerReviews.vue";
import FlashDealPopup from "../components/FlashDealPopup.vue";

const { revealElements } = useScrollReveal();

onMounted(() => {
  revealElements();
});
</script>
