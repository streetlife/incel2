<template>
  <div>
    <NuxtLayout>
      <ScrollProgress />
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
// Global configuration
useHead({
  htmlAttrs: {
    lang: 'en'
  }
})
</script>
