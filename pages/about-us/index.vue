<script setup lang="ts">
import { computed, onMounted, nextTick } from "vue";
import { useAboutStore } from "../../stores/about";
import { storeToRefs } from "pinia";

const aboutStore = useAboutStore();
const { aboutData, isLoading, error } = storeToRefs(aboutStore);

const coreValues = computed(
  () =>
    aboutData.value?.core_values ?? [
      {
        title: "Trust",
        description:
          "We build lasting relationships through transparency and reliability",
      },
      {
        title: "Value",
        description:
          "Competitive pricing without compromising on quality or experience",
      },
      {
        title: "Service",
        description:
          "Dedicated support team available 24/7 for your peace of mind",
      },
      {
        title: "Expertise",
        description:
          "Deep destination knowledge and industry partnerships worldwide",
      },
    ],
);

const stats = computed(
  () =>
    aboutData.value?.our_promise ?? [
      { title: "6+ Years", description: "Industry Experience" },
      { title: "UAE Licensed", description: "Fully Regulated DMC" },
      { title: "10,000+", description: "Happy Travelers" },
      { title: "95%", description: "Customer Satisfaction" },
    ],
);

const features = [
  { label: "Licensed DMC" },
  { label: "Expert Team" },
  { label: "24/7 Support" },
  { label: "Global Network" },
];

const initRevealObserver = () => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("reveal-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
  );
  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
};

onMounted(async () => {
  await aboutStore.fetchAbout();
  await nextTick();
  initRevealObserver();
});
</script>

<template>
  <div class="min-h-screen">
    <div v-if="isLoading" class="flex items-center justify-center py-44">
      <div
        class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"
      ></div>
    </div>

    <main v-else>
      <section
        class="relative py-44 px-6 text-center bg-cover bg-center bg-no-repeat"
        :style="{
          backgroundImage: `url('${aboutData?.banner_image ?? 'https://images.unsplash.com/photo-1643904736472-8b77e93ca3d7?...'}')`,
        }"
      >
        <div class="absolute inset-0 bg-black/50"></div>
        <div class="relative z-10 max-w-7xl mx-auto reveal">
          <h1 class="text-4xl md:text-5xl font-bold mb-4 text-white">
            {{ aboutData?.banner_title ?? "About Incel Tourism" }}
          </h1>
          <p class="text-xl text-gray-100 mb-2">
            {{
              aboutData?.banner_description ??
              "Your trusted partner in creating unforgettable travel experiences"
            }}
          </p>
          <p class="text-base text-gray-200 italic">
            Establishing Excellence Since 2018
          </p>
        </div>
      </section>

      <section class="py-16 px-6">
        <div class="max-w-7xl mx-auto">
          <h2 class="text-3xl md:text-4xl font-bold mb-8 text-gray-900 reveal">
            Global Reach, Local Expertise
          </h2>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div class="reveal">
              <template v-if="aboutData?.company_story?.story">
                <p
                  v-for="(paragraph, i) in aboutData.company_story.story
                    .split('\n')
                    .filter(Boolean)"
                  :key="i"
                  class="mb-6 leading-relaxed text-gray-700"
                >
                  {{ paragraph }}
                </p>
              </template>
              <template v-else>
                <p class="mb-6 leading-relaxed text-gray-700">
                  Incel Tourism is a fully licensed Destination Management
                  Company (DMC) based in Dubai, UAE, with a comprehensive office
                  in Lagos, Nigeria...
                </p>
              </template>

              <div class="grid grid-cols-2 gap-4 mt-8">
                <div
                  v-for="(feature, index) in features"
                  :key="feature.label"
                  class="p-4 bg-gray-100 rounded-lg text-center font-semibold text-gray-800 reveal"
                  :style="{ transitionDelay: `${index * 100}ms` }"
                >
                  {{ feature.label }}
                </div>
              </div>
            </div>

            <div class="reveal">
              <img
                :src="
                  aboutData?.company_story?.story_image ??
                  'https://images.unsplash.com/photo-1758223725156-ee49cc327a46?...'
                "
                alt="Travel experience"
                class="w-full h-auto rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      <section class="py-16 px-6 bg-gray-50">
        <div class="max-w-7xl mx-auto">
          <h3 class="text-2xl md:text-3xl font-bold text-center mb-2 reveal">
            Our Promise
          </h3>
          <p class="text-center text-lg text-gray-600 mb-12 reveal">
            Creating memories that last a lifetime.
          </p>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div
              v-for="(stat, index) in stats"
              :key="stat.title"
              class="text-center reveal"
              :style="{ transitionDelay: `${index * 150}ms` }"
            >
              <div class="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {{ stat.title }}
              </div>
              <div class="text-sm text-gray-600">{{ stat.description }}</div>
            </div>
          </div>
        </div>
      </section>

      <section class="py-16 px-6">
        <div class="max-w-7xl mx-auto">
          <h2 class="text-3xl md:text-4xl font-bold mb-4 text-gray-900 reveal">
            Our Core Values
          </h2>
          <p class="text-lg text-gray-600 mb-8 text-center reveal">
            The principles that guide everything we do and define our commitment
            to excellence
          </p>

          <div
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8"
          >
            <div
              v-for="(value, index) in coreValues"
              :key="value.title"
              class="p-8 bg-white border border-gray-200 rounded-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-xl reveal"
              :style="{ transitionDelay: `${index * 100}ms` }"
            >
              <h3 class="text-2xl font-bold mb-4 text-gray-900">
                {{ value.title }}
              </h3>
              <p class="text-gray-600 leading-relaxed">
                {{ value.description }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section class="py-16 px-6 bg-gray-50">
        <div class="max-w-7xl mx-auto">
          <h2 class="text-3xl md:text-4xl font-bold mb-8 text-gray-900 reveal">
            Our Mission
          </h2>
          <blockquote
            class="text-2xl italic text-gray-800 text-center max-w-4xl mx-auto p-8 border-l-4 border-gray-900 bg-white reveal"
          >
            "{{
              aboutData?.mission ??
              "To be the leading DMC connecting Africa to the world, delivering exceptional travel experiences through expert guidance."
            }}"
          </blockquote>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.reveal {
  opacity: 0;
  transform: translateY(30px);
  transition:
    opacity 0.6s ease-out,
    transform 0.6s ease-out;
}

.reveal-visible {
  opacity: 1;
  transform: translateY(0);
}
</style>
