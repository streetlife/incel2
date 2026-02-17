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
    <div class="relative z-20 h-full flex flex-col items-center justify-center text-center px-4 max-w-7xl mx-auto">
      <p class="px-6 py-2 mb-5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-white/90 text-sm tracking-[0.2em] uppercase font-light animate-fade-in">
        Redefining Luxury Travel
      </p>
      <h1 class="text-6xl md:text-8xl lg:text-[10rem] font-bold text-white tracking-tighter leading-[0.9] mix-blend-overlay opacity-90">
        DISCOVER
        <br />
        <span class="text-transparent bg-clip-text bg-gradient-to-r from-neutral-200 to-neutral-500">THE WORLD</span>
      </h1>
      <p class="text-lg md:text-xl text-white/70 max-w-xl mx-auto font-light leading-relaxed mt-8 mb-16 md:mb-10 animate-slide-up animation-delay-400">
        Visas, tours & curated packages at the best value
      </p>
      <button 
        class="h-16 px-10 rounded-full bg-white text-black hover:bg-neutral-200 font-bold text-lg tracking-wide transition-all shadow-xl hover:scale-105 animate-scale-in animation-delay-600"
      >
        Book Now
      </button>
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
