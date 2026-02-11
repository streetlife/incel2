<template>
  <section class="py-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
    <div class="container mx-auto sm:px-16 px-4">
      <div class="text-center mb-12 reveal">
        <h2 class="text-4xl md:text-5xl font-bold mb-4">
          Black Friday Hot Deals
        </h2>
        <p class="text-xl text-gray-300 mb-4">
          This week's biggest discounts
        </p>
        <div class="inline-flex items-center space-x-2 bg-red-500 px-6 py-2 rounded-full">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
          </svg>
          <span class="font-semibold">5 days left</span>
        </div>
      </div>
      
      <div class="reveal">
        <PackagesCarousel :packages="blackFridayDeals" />
      </div>
      
      <div class="text-center mt-12 reveal">
        <button class="bg-white text-gray-900 font-bold py-4 px-8 rounded-full hover:bg-gray-100 transition-all duration-300 transform hover:scale-105">
          See all deals
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
const blackFridayDeals = [
  {
    id: 1,
    title: 'Essence of the Emerald Isle',
    category: 'Black Friday Hot Deal',
    location: 'Ireland in 9 Days',
    image: 'https://images.unsplash.com/photo-1693342563508-75ff43f43198?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpcmVsYW5kJTIwbGFuZHNjYXBlfGVufDF8fHx8MTc2MjU0MzA2OXww&ixlib=rb-4.1.0&q=80&w=1080',
    price: 1299,
    oldPrice: 4330,
    discount: 70
  },
  {
    id: 2,
    title: 'Tropical Breeze & All Inclusive in Jaco',
    category: 'Black Friday Hot Deal',
    location: 'Costa Rica in 8 Days',
    image: 'https://images.unsplash.com/photo-1626060451577-8b90a394e355?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3N0YSUyMHJpY2ElMjBiZWFjaHxlbnwxfHx8fDE3NjI0MzIzMDB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    price: 1349,
    oldPrice: 4497,
    discount: 70
  },
  {
    id: 3,
    title: 'Coastal Cities & Cultural Treasures',
    category: 'Black Friday Hot Deal',
    location: 'Portugal in 9 Days',
    image: 'https://images.unsplash.com/photo-1667326098780-0b64236a7017?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3J0dWdhbCUyMGNvYXN0YWwlMjBjaXR5fGVufDF8fHx8MTc2MjU0MzA3MHww&ixlib=rb-4.1.0&q=80&w=1080',
    price: 1349,
    oldPrice: 4497,
    discount: 70
  },
  {
    id: 4,
    title: 'Southeast Asian Odyssey',
    category: 'Black Friday Hot Deal',
    location: 'Vietnam, Cambodia & Thailand in 19 Days',
    image: 'https://images.unsplash.com/photo-1693276206317-a78574082bfc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmdrb3IlMjB3YXQlMjB0ZW1wbGV8ZW58MXx8fHwxNzYyNTQzMDc0fDA&ixlib=rb-4.1.0&q=80&w=1080',
    price: 2599,
    oldPrice: 8663,
    discount: 70
  },
  {
    id: 5,
    title: 'From Medellin Streets to Cartagena\'s Shore',
    category: 'Black Friday Hot Deal',
    location: 'Colombia in 7 Days',
    image: 'https://images.unsplash.com/photo-1656130727374-e99edc2b8ba4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xvbWJpYSUyMGNhcnRhZ2VuYXxlbnwxfHx8fDE3NjI1NDMwNzR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    price: 899,
    oldPrice: 2997,
    discount: 70
  },
  {
    id: 6,
    title: 'Island Paradise Discovery',
    category: 'Black Friday Hot Deal',
    location: 'Bali in 12 Days',
    image: 'https://images.unsplash.com/photo-1669545192473-f4d88714fe2f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWxpJTIwdGVtcGxlJTIwc3Vuc2V0fGVufDF8fHx8MTc2MjQ2OTM4NHww&ixlib=rb-4.1.0&q=80&w=1080',
    price: 1799,
    oldPrice: 5997,
    discount: 70
  }
]
</script>
