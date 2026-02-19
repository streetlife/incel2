<template>
  <section class="relative h-screen w-full overflow-hidden pb-5">
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
          src="https://ik.imagekit.io/7ptk19utb/istockphoto-2171202163-640_adpp_is.mp4" 
          type="video/mp4"
        />
        <track
          kind="descriptions"
          src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1920"
          srclang="en"
          label="Audio descriptions"
        />
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
      <h1 class="text-[3.5rem] sm:text-6xl md:text-7xl lg:text-[8rem] font-bold text-white tracking-tighter leading-[0.9] mix-blend-overlay opacity-90">
        DISCOVER
        <br />
        <span class="text-transparent bg-clip-text bg-gradient-to-r from-neutral-200 to-neutral-500">THE WORLD</span>
      </h1>
      <p class="text-base sm:text-lg md:text-xl text-white/70 max-w-xs sm:max-w-xl mx-auto font-light leading-relaxed mt-6 mb-10 animate-slide-up animation-delay-400">
        Visas, tours & curated packages at the best value
      </p>
      <button 
        class="h-12 sm:h-16 px-7 sm:px-10 rounded-full bg-white text-black hover:bg-neutral-200 font-bold text-base sm:text-lg tracking-wide transition-all shadow-xl hover:scale-105 animate-scale-in animation-delay-600"
      >
        Book Now
      </button>
    </div>
  </section>
</template>

<script setup>
</script>