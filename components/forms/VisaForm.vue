<script setup lang="ts">
import { ref } from 'vue'
import PassengerSelect from './PassengerSelect.vue';

const form = ref({
  country: '',
  nationality: '',
  persons: { adults: 1, children: 0, infants: 0 },
})

const countries = [
  'Nigeria',
  'Ghana',
  'Cameroon',
  'Togo',
  'Congo',
  'Burkina Faso',
  'Benin',
  'Mali',
  'Chad',
  'Guinea',
  'Sierra Leone',
  'Guinea-Bissau',
  'Mauritania',
  'Senegal',
  'Côte d\'Ivoire',
  'Burundi',
  'Rwanda',
  'Uganda',
  'Tanzania',
  'Zambia',
  'Zimbabwe',
  'Namibia',
  'Zambia',
  'Zimbabwe',
];

const submit = () => {
  console.log('Visa request:', form.value)
}
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-4 gap-4">
    <div>
      <label for="destination" class="block text-sm font-medium text-gray-700 mb-2">
        Destination
      </label>
       <select class="input" v-model="form.country">
        <option value="">Select Country</option>
        <option v-for="n in countries" :key="n" :value="n">{{ n }}</option>
      </select>
    </div>
    
    <div>
      <label for="nationality" class="block text-sm font-medium text-gray-700 mb-2">
        Nationality
      </label>
       <select class="input" v-model="form.nationality">
        <option value="">Select Nationality</option>
        <option v-for="n in countries" :key="n" :value="n">{{ n }}</option>
      </select>
    </div>

    <div>
      <PassengerSelect
        v-model="form.persons"
        label="Guests"
        id="persons"
        mode="visa"
      />
    </div>

    <div class="mt-7">
      <button
        @click="submit"
        class="btn-primary w-full py-3 px-6 flex items-center justify-center gap-2 transform hover:scale-105 transition"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        Search
      </button>
    </div>
  </div>
</template>

<style scoped>
.input {
  @apply w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary;
}
.btn-primary {
  @apply bg-yellow-400 hover:bg-yellow-500 font-bold rounded-lg text-gray-900;
}
</style>
