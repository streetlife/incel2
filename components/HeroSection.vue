<template>
  <section class="relative h-screen w-full overflow-hidden">
    <!-- Video Background -->
    <div class="absolute inset-0 w-full h-full">
      <video 
        autoplay
        muted
        loop
        playsinline
        class="absolute inset-0 w-full h-full object-cover"
        aria-describedby="dubai-video-desc"
      >
        <source 
          src="https://ik.imagekit.io/7ptk19utb/dubai.mp4" 
          type="video/mp4"
        />

        <!-- Audio descriptions (for screen readers) -->
        <track
          kind="descriptions"
          src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1920"
          srclang="en"
          label="Audio descriptions"
        />

        <!-- Fallback image -->
        <img
          src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1920"
          alt="Aerial view of Dubai skyline with modern skyscrapers"
          class="w-full h-full object-cover"
        />
      </video>
      <div class="absolute inset-0 video-overlay"></div>
    </div>
    
    <!-- Hero Content -->
    <div class="relative z-10 h-full flex items-center justify-center text-center px-4">
      <div class="max-w-5xl mx-auto">
        <p class="text-white/90 text-lg md:text-xl mb-4 tracking-widest uppercase animate-fade-in">
          Redefining Luxury Travel
        </p>
        <h1 class="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 animate-slide-up animation-delay-200">
          DISCOVER THE WORLD
        </h1>
        <p class="text-white/90 text-xl md:text-2xl mb-10 animate-slide-up animation-delay-400">
          Visas, tours & curated packages at the best value
        </p>
        <button class="btn-primary text-lg animate-scale-in animation-delay-600">
          Book Now
        </button>
      </div>
    </div>
    
    <!-- Scroll Indicator -->
    <div class="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
      <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    </div>
  </section>
</template>

<script setup>
</script>
