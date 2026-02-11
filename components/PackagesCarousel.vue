<template>
  <div class="packages-carousel">
    <swiper
      :modules="modules"
      :slides-per-view="1"
      :space-between="30"
      :loop="true"
      :autoplay="{
        delay: 5000,
        disableOnInteraction: false,
      }"
      :pagination="{ clickable: true }"
      :navigation="true"
      :breakpoints="{
        640: {
          slidesPerView: 2,
        },
        1024: {
          slidesPerView: 3,
        },
        1280: {
          slidesPerView: 4,
        },
      }"
      class="pb-12"
    >
      <swiper-slide v-for="pkg in packages" :key="pkg.id">
        <PackageCard :package="pkg" />
      </swiper-slide>
    </swiper>
  </div>
</template>

<script setup>
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

defineProps({
  packages: {
    type: Array,
    required: true
  }
})

const modules = [Navigation, Pagination, Autoplay]
</script>

<style scoped>
.packages-carousel :deep(.swiper-button-next),
.packages-carousel :deep(.swiper-button-prev) {
  background: rgba(26, 115, 232, 0.9);
  width: 48px;
  height: 48px;
  border-radius: 50%;
}

.packages-carousel :deep(.swiper-button-next):hover,
.packages-carousel :deep(.swiper-button-prev):hover {
  background: rgb(26, 115, 232);
}

.packages-carousel :deep(.swiper-button-next):after,
.packages-carousel :deep(.swiper-button-prev):after {
  font-size: 16px;
  font-weight: bold;
  color: white;
}

.packages-carousel :deep(.swiper-pagination-bullet) {
  background: #cbd5e1;
  opacity: 1;
}

.packages-carousel :deep(.swiper-pagination-bullet-active) {
  background: #1a73e8;
}
</style>
