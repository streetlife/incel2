<template>
  <section class="py-20 bg-gray-50">
    <div class="container mx-auto px-4">
      <div class="max-w-3xl mx-auto text-center reveal">
        <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Get travel deals in your inbox
        </h2>
        <p class="text-lg text-gray-600 mb-8">
          Subscribe to receive exclusive offers, travel tips, and destination inspiration delivered weekly
        </p>
        
        <form class="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
          <input 
            type="email" 
            placeholder="Enter your email address"
            class="flex-1 px-6 py-4 rounded-full border-2 border-gray-300 focus:border-primary focus:outline-none text-gray-900"
          />
          <button 
            type="submit"
            class="bg-primary hover:bg-primary-dark text-white font-bold px-8 py-4 rounded-full transition-all duration-300 transform hover:scale-105"
          >
            Subscribe
          </button>
        </form>
        
        <p class="text-sm text-gray-500 mt-4">
          We respect your privacy. Unsubscribe at any time.
        </p>
      </div>
    </div>
  </section>
</template>

<script setup>
</script>
