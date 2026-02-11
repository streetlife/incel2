<template>
  <footer class="bg-gray-900 text-white">
    <div class="container mx-auto px-4 py-16">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
        <!-- Brand -->
        <div>
          <h3 class="text-2xl font-bold mb-4">Incel Tourism</h3>
          <p class="text-gray-400 leading-relaxed mb-6">
            UAE-licensed Destination Management Company serving travelers across Sub-Saharan Africa with expert visa assistance and unforgettable experiences.
          </p>
        </div>
        
        <!-- Quick Links -->
        <div>
          <h4 class="text-lg font-bold mb-4">Quick Links</h4>
          <ul class="space-y-3">
            <li>
              <NuxtLink to="/packages" class="text-gray-400 hover:text-white transition-colors">
                Packages
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/local-tours" class="text-gray-400 hover:text-white transition-colors">
                Local Tours
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/uae-visa" class="text-gray-400 hover:text-white transition-colors">
                UAE Visa
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/global-visa" class="text-gray-400 hover:text-white transition-colors">
                Global Visa
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/about-us" class="text-gray-400 hover:text-white transition-colors">
                About Us
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/contact" class="text-gray-400 hover:text-white transition-colors">
                Contact
              </NuxtLink>
            </li>
          </ul>
        </div>
        
        <!-- Dubai Office -->
        <div>
          <h4 class="text-lg font-bold mb-4">Dubai Office</h4>
          <ul class="space-y-3 text-gray-400">
            <li class="flex items-start space-x-2">
              <svg class="w-5 h-5 mt-1 flex-shrink-0 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
              </svg>
              <span>Suite 403, Dubai National Insurance Building, Port Saeed, Dubai, UAE</span>
            </li>
            <li class="flex items-center space-x-2">
              <svg class="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              <a href="tel:+97143977242" class="hover:text-white transition-colors">+971 4 397 7242</a>
            </li>
            <li class="flex items-center space-x-2">
              <svg class="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              <a href="mailto:info@inceltourism.com" class="hover:text-white transition-colors">info@inceltourism.com</a>
            </li>
          </ul>
        </div>
        
        <!-- Lagos Office -->
        <div>
          <h4 class="text-lg font-bold mb-4">Lagos Office</h4>
          <ul class="space-y-3 text-gray-400">
            <li class="flex items-start space-x-2">
              <svg class="w-5 h-5 mt-1 flex-shrink-0 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
              </svg>
              <span>4th Floor, Right Wing, Mulliner Towers, Plot 39 Alfred Rewane Road, Ikoyi, Lagos, Nigeria</span>
            </li>
            <li class="flex items-center space-x-2">
              <svg class="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              <a href="tel:+2348180850745" class="hover:text-white transition-colors">+234 818 085 0745</a>
            </li>
            <li class="flex items-center space-x-2">
              <svg class="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              <a href="mailto:info@inceltourism.com" class="hover:text-white transition-colors">info@inceltourism.com</a>
            </li>
          </ul>
        </div>
      </div>
      
      <!-- Bottom Bar -->
      <div class="border-t border-gray-800 pt-8">
        <div class="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p class="text-gray-400 text-sm">
            © 2025 Incel Tourism. All rights reserved.
          </p>
          <div class="flex items-center space-x-6 text-sm">
            <NuxtLink to="/privacy-policy" class="text-gray-400 hover:text-white transition-colors">
              Privacy Policy
            </NuxtLink>
            <NuxtLink to="/terms-and-conditions" class="text-gray-400 hover:text-white transition-colors">
              Terms & Conditions
            </NuxtLink>
            <NuxtLink to="/faq" class="text-gray-400 hover:text-white transition-colors">
              FAQ
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
    
    <!-- WhatsApp Floating Button -->
    <a 
      href="https://wa.me/971543977242?text=Hi%2C%20I%20need%20help%20with%20my%20travel%20plans."
      target="_blank"
      rel="noopener noreferrer"
      class="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 transform hover:scale-110 z-50"
      aria-label="Chat with us on WhatsApp"
    >
      <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
      </svg>
    </a>
  </footer>
</template>

<script setup>
</script>
