# Incel Travel - Code Architecture & Structure

## 🏗️ Architecture Overview

This is a **Nuxt 3** application using the **Composition API** and **Tailwind CSS** for styling. The architecture follows a component-based approach with clear separation of concerns.

## 📊 Technology Stack

### Core
- **Nuxt 3** (v3.13.0) - Vue.js framework with SSR support
- **Vue 3** - Progressive JavaScript framework
- **TypeScript** - Type-safe JavaScript

### Styling
- **Tailwind CSS** (v6.12.0) - Utility-first CSS framework
- **Custom CSS** - Animations and component-specific styles

### Libraries
- **Swiper** (v11.1.0) - Modern carousel/slider library

## 🗂️ Directory Structure

```
incel-travel/
│
├── assets/
│   └── css/
│       └── main.css              # Global styles, Tailwind directives, custom CSS
│
├── components/                    # Reusable Vue components
│   ├── Header.vue                # Sticky navigation with scroll effects
│   ├── HeroSection.vue           # Video background hero section
│   ├── PackageCard.vue           # Reusable travel package card
│   ├── PackagesCarousel.vue      # Generic Swiper carousel wrapper
│   ├── LatestPackages.vue        # Latest packages section
│   ├── FeaturedPackages.vue      # Featured packages grid section
│   ├── BlackFridayDeals.vue      # Special deals carousel section
│   ├── ServicesSection.vue       # Services grid with icons
│   ├── PopularDestinations.vue   # Destinations grid section
│   ├── WhyChooseUs.vue           # Features/benefits section
│   ├── LocalTours.vue            # Local tours carousel section
│   ├── WhatsAppContact.vue       # WhatsApp CTA section
│   ├── Newsletter.vue            # Email subscription form
│   └── Footer.vue                # Footer with contact info
│
├── composables/                   # Reusable composition functions
│   └── useScrollReveal.ts        # Intersection Observer for scroll animations
│
├── pages/                         # Nuxt pages (auto-routed)
│   └── index.vue                 # Landing page (home)
│
├── public/                        # Static assets
│   └── dubai.mp4                 # Hero background video (user-provided)
│
├── app.vue                        # Root application component
├── nuxt.config.ts                # Nuxt configuration
├── tailwind.config.js            # Tailwind CSS configuration
└── package.json                  # Dependencies and scripts
```

## 🎨 Styling Architecture

### Tailwind Configuration

**Color Palette:**
```javascript
primary: {
  DEFAULT: '#1a73e8',    // Main blue
  dark: '#0d47a1',       // Darker blue
  light: '#4285f4'       // Lighter blue
}
accent: {
  DEFAULT: '#ff6b35',    // Orange
  dark: '#e85d2c',       // Darker orange
  light: '#ff8659'       // Lighter orange
}
```

**Custom Utilities:**
- `.btn-primary` - Primary button style
- `.btn-secondary` - Secondary button style
- `.btn-accent` - Accent button style
- `.card` - Standard card container
- `.section-title` - Section heading style
- `.section-subtitle` - Section subtitle style

**Animations:**
- `fade-in` - Opacity 0 to 1
- `slide-up` - Slide from bottom with fade
- `slide-in-left` - Slide from left with fade
- `slide-in-right` - Slide from right with fade
- `scale-in` - Scale from 0.9 to 1 with fade

### CSS Layers

```css
@layer base { }      # HTML element defaults
@layer components { } # Reusable component classes
@layer utilities { }  # Custom utility classes
```

## 🧩 Component Architecture

### Component Patterns

**1. Layout Components**
- `Header.vue` - Global navigation
- `Footer.vue` - Global footer

**2. Section Components**
- Self-contained sections with data
- Use `.reveal` class for scroll animations
- Include heading, content, and CTA

**3. Reusable Components**
- `PackageCard.vue` - Card design pattern
- `PackagesCarousel.vue` - Carousel wrapper

### Props Pattern

**PackageCard Props:**
```typescript
{
  package: {
    id: number,
    title: string,
    category: string,
    location?: string,
    image: string,
    price: number,
    oldPrice?: number,
    discount?: number,
    rating?: number,
    duration?: string,
    type?: string,
    features?: string[]
  },
  showButton: boolean
}
```

### Emits Pattern

Components use standard Vue 3 emits for event communication.

## 🎬 Animation System

### Scroll Reveal

**Implementation:**
```javascript
// composables/useScrollReveal.ts
export const useScrollReveal = () => {
  const revealElements = () => {
    const reveals = document.querySelectorAll('.reveal')
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active')
        }
      })
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    })
    
    reveals.forEach(reveal => observer.observe(reveal))
  }
  
  return { revealElements }
}
```

**Usage:**
```vue
<div class="reveal">
  <!-- Content that will animate on scroll -->
</div>
```

### Stagger Animations

```vue
<div 
  v-for="(item, index) in items" 
  class="reveal"
  :style="{ animationDelay: `${index * 100}ms` }"
>
```

## 🎠 Carousel Implementation

### Swiper Configuration

**Basic Setup:**
```vue
<swiper
  :modules="[Navigation, Pagination, Autoplay]"
  :slides-per-view="1"
  :space-between="30"
  :loop="true"
  :autoplay="{ delay: 5000 }"
  :pagination="{ clickable: true }"
  :navigation="true"
  :breakpoints="{
    640: { slidesPerView: 2 },
    1024: { slidesPerView: 3 },
    1280: { slidesPerView: 4 }
  }"
>
  <swiper-slide v-for="item in items">
    <!-- Content -->
  </swiper-slide>
</swiper>
```

### Carousel Locations

1. **Latest Packages** - Auto-play carousel
2. **Black Friday Deals** - Dark theme carousel
3. **Local Tours** - Feature-rich carousel

## 📱 Responsive Design

### Breakpoints

```javascript
sm: '640px'   // Tablet
md: '768px'   // Medium tablet
lg: '1024px'  // Desktop
xl: '1280px'  // Large desktop
2xl: '1536px' // Extra large
```

### Grid Patterns

**Services Grid:**
```vue
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
```

**Packages Grid:**
```vue
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
```

**Destinations Grid:**
```vue
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
```

## 🔧 State Management

Currently using **component-level state** with Vue 3 Composition API:

```vue
<script setup>
import { ref, onMounted } from 'vue'

const scrolled = ref(false)
const mobileMenuOpen = ref(false)

onMounted(() => {
  // Component initialization
})
</script>
```

For larger applications, consider adding **Pinia** for global state management.

## 🌐 Data Structure

### Package Object

```typescript
interface Package {
  id: number
  title: string
  category: 'Inbound' | 'Outbound' | 'Umrah' | 'Black Friday Hot Deal'
  location: string
  image: string
  price: number
  oldPrice?: number
  discount?: number
  rating?: number
  duration?: string
  type?: string
  features?: string[]
}
```

### Tour Object

```typescript
interface Tour {
  id: number
  title: string
  duration: string
  rating: number
  image: string
  price: number
  features: string[]
}
```

## 🚀 Performance Optimizations

### Current Optimizations

1. **Image Loading**
   - Using optimized Unsplash URLs
   - Lazy loading via native `loading="lazy"`

2. **Code Splitting**
   - Nuxt automatic code splitting
   - Component-based chunking

3. **CSS**
   - Tailwind purges unused CSS in production
   - Critical CSS inlined by Nuxt

4. **JavaScript**
   - Tree-shaking enabled
   - Modern ES modules

### Recommended Additions

1. **Image Optimization**
   - Use `nuxt/image` module
   - Implement WebP format
   - Add responsive images

2. **Lazy Loading**
   - Lazy load carousels below fold
   - Defer non-critical JavaScript

3. **Caching**
   - Add service worker for offline support
   - Implement cache-first strategy for static assets

## 🔐 Best Practices

### Vue 3 Composition API

✅ **Do:**
- Use `<script setup>` syntax
- Destructure props for clarity
- Use composables for reusable logic

❌ **Don't:**
- Mix Options API and Composition API
- Create overly large components
- Mutate props directly

### Component Design

✅ **Do:**
- Keep components focused (single responsibility)
- Use props for input, emits for output
- Add proper TypeScript types
- Include accessibility attributes

❌ **Don't:**
- Create components with too many props
- Use global state when local state suffices
- Ignore mobile responsiveness

### Styling

✅ **Do:**
- Use Tailwind utility classes
- Follow mobile-first approach
- Use custom CSS for complex animations
- Maintain consistent spacing

❌ **Don't:**
- Override Tailwind with inline styles
- Use arbitrary values excessively
- Ignore dark mode considerations

## 📚 Future Enhancements

### Recommended Features

1. **Dynamic Data**
   - Connect to CMS (Strapi, Sanity)
   - API integration for real-time data

2. **Authentication**
   - User login/registration
   - Booking management

3. **Search & Filters**
   - Package search functionality
   - Price/date filtering

4. **Booking System**
   - Shopping cart
   - Payment integration

5. **Multi-language**
   - i18n support
   - RTL layout support

6. **SEO**
   - Dynamic meta tags
   - Structured data (JSON-LD)
   - Sitemap generation

7. **Analytics**
   - Google Analytics
   - Event tracking
   - Conversion tracking

## 🧪 Testing

### Recommended Setup

```bash
npm install -D @nuxt/test-utils vitest @vue/test-utils
```

**Test Structure:**
```
tests/
├── components/
│   ├── Header.spec.ts
│   ├── PackageCard.spec.ts
│   └── ...
└── pages/
    └── index.spec.ts
```

## 📖 API Reference

### Composables

**useScrollReveal()**
```typescript
const { revealElements } = useScrollReveal()
// Call in onMounted to activate scroll animations
```

### Components

All components are auto-imported by Nuxt, no import statements needed:
```vue
<template>
  <Header />
  <HeroSection />
  <Footer />
</template>
```

---

For implementation details, see the source code in each component file.
