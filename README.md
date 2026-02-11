# Incel Travel - Luxury Tourism Website

A beautiful, modern travel and tourism website built with Nuxt.js 3, featuring smooth animations, interactive carousels, and a stunning design.

## 🌟 Features

- **Video Background Hero Section** - Immersive landing experience
- **Multiple Carousels** - Latest packages, Black Friday deals, and local tours
- **Scroll Reveal Animations** - Smooth fade-in and slide-up effects
- **Responsive Design** - Mobile-first approach with Tailwind CSS
- **Interactive Components** - Package cards, destination grids, services showcase
- **WhatsApp Integration** - Direct contact via WhatsApp
- **Newsletter Subscription** - Email capture for marketing
- **SEO Optimized** - Meta tags and semantic HTML

## 🎨 Design Highlights

### Sections
1. **Hero Section** - Full-screen video background with animated text overlay
2. **Latest Packages** - Horizontal scrolling carousel
3. **Featured Packages** - 3-column responsive grid
4. **Start Your Journey CTA** - Gradient background section
5. **Black Friday Deals** - Dark-themed carousel with discount badges
6. **Services Grid** - 8 service offerings with icons
7. **Popular Destinations** - Image cards with hover effects
8. **Why Choose Us** - Feature highlights with icons
9. **Local Tours** - Carousel with detailed tour cards
10. **WhatsApp Contact** - Green-themed CTA section
11. **Newsletter** - Email subscription form
12. **Footer** - Multi-column layout with contact info

### Animations
- Fade-in animations on scroll
- Slide-up effects for text elements
- Scale animations for buttons
- Hover effects on cards and images
- Smooth carousel transitions

### Carousels (using Swiper.js)
1. **Latest Packages Carousel** - Auto-play, navigation arrows, pagination
2. **Black Friday Deals Carousel** - Dark theme, 4 slides per view on desktop
3. **Local Tours Carousel** - Detailed tour cards with features

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Navigate to the project directory:**
   ```bash
   cd incel-travel
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Add the video file:**
   - Place a video file named `dubai.mp4` in the `public` folder
   - Or update the video source in `components/HeroSection.vue`

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   - Visit `http://localhost:3000`

### Build for Production

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
incel-travel/
├── assets/
│   └── css/
│       └── main.css          # Global styles and Tailwind configuration
├── components/
│   ├── Header.vue            # Navigation bar with scroll effects
│   ├── HeroSection.vue       # Video background hero
│   ├── PackageCard.vue       # Reusable package card component
│   ├── PackagesCarousel.vue  # Swiper carousel wrapper
│   ├── LatestPackages.vue    # Latest packages section
│   ├── FeaturedPackages.vue  # Featured packages grid
│   ├── BlackFridayDeals.vue  # Special deals carousel
│   ├── ServicesSection.vue   # Services grid
│   ├── PopularDestinations.vue # Destinations showcase
│   ├── WhyChooseUs.vue       # Features/benefits section
│   ├── LocalTours.vue        # Local tours carousel
│   ├── WhatsAppContact.vue   # WhatsApp CTA section
│   ├── Newsletter.vue        # Email subscription
│   └── Footer.vue            # Footer with links and contact
├── composables/
│   └── useScrollReveal.ts    # Scroll animation composable
├── pages/
│   └── index.vue             # Main landing page
├── public/
│   └── dubai.mp4             # Hero video (add this file)
├── nuxt.config.ts            # Nuxt configuration
├── tailwind.config.js        # Tailwind CSS configuration
└── package.json              # Dependencies

```

## 🎨 Customization

### Colors
Edit `tailwind.config.js` to change the color scheme:
```javascript
colors: {
  primary: {
    DEFAULT: '#1a73e8',  // Main blue
    dark: '#0d47a1',
    light: '#4285f4'
  },
  accent: {
    DEFAULT: '#ff6b35',  // Orange accent
    dark: '#e85d2c',
    light: '#ff8659'
  }
}
```

### Fonts
Change the font family in `tailwind.config.js`:
```javascript
fontFamily: {
  sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
}
```

### Animations
Customize animation timings in `tailwind.config.js` under the `animation` and `keyframes` sections.

## 📦 Key Dependencies

- **Nuxt 3** - Vue.js framework
- **Tailwind CSS** - Utility-first CSS framework
- **Swiper** - Modern carousel/slider library
- **Vue 3** - Progressive JavaScript framework

## 🌐 Key Features Implementation

### Video Background
```vue
<video autoplay muted loop playsinline>
  <source src="/dubai.mp4" type="video/mp4" />
</video>
```

### Scroll Reveal
Uses Intersection Observer API for smooth scroll animations:
```javascript
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active')
    }
  })
})
```

### Responsive Carousels
```javascript
:breakpoints="{
  640: { slidesPerView: 2 },
  1024: { slidesPerView: 3 },
  1280: { slidesPerView: 4 }
}"
```

## 🔧 Configuration Notes

1. **WhatsApp Links** - Update phone numbers in:
   - `components/WhatsAppContact.vue`
   - `components/Footer.vue`

2. **Contact Information** - Update in:
   - `components/Footer.vue`

3. **Social Media** - Add social media links in Footer component

4. **Images** - All images are using Unsplash URLs. For production, replace with your own images.

## 📱 Responsive Design

The website is fully responsive with breakpoints:
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: 1024px+
- Large Desktop: 1280px+

## 🎯 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📄 License

This project is open source and available for modification.

## 🤝 Support

For support or questions, contact via WhatsApp or email as shown in the footer.

---

Built with ❤️ using Nuxt.js and Tailwind CSS
