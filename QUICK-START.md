# 🚀 Quick Start Guide

Get the Incel Travel website running in 5 minutes!

## Step 1: Prerequisites

Make sure you have installed:
- **Node.js** (version 18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)

Check your versions:
```bash
node --version  # Should be v18.0.0 or higher
npm --version   # Should be v9.0.0 or higher
```

## Step 2: Navigate to Project

```bash
cd incel-travel
```

## Step 3: Install Dependencies

```bash
npm install
```

This will install all required packages (~2-3 minutes).

## Step 4: Add Video (Optional)

The hero section uses a video background. You have 3 options:

### Option A: Add Your Own Video
1. Place a video file named `dubai.mp4` in the `public/` folder
2. See `VIDEO-SETUP.md` for detailed instructions

### Option B: Use a Placeholder Image
The site will work without a video, but the hero section will need a fallback.

### Option C: Skip for Now
The site will still load, just with a broken video element.

## Step 5: Start Development Server

```bash
npm run dev
```

You should see:
```
Nuxt 3.13.0 with Nitro 2.x.x
  > Local:    http://localhost:3000/
  > Network:  use --host to expose
```

## Step 6: Open in Browser

Open your browser and go to:
```
http://localhost:3000
```

🎉 **You should see the website!**

## 📁 What You Should See

1. ✅ **Header** - Sticky navigation with logo
2. ✅ **Hero Section** - Large heading "DISCOVER THE WORLD"
3. ✅ **Latest Packages** - Carousel of travel packages
4. ✅ **Featured Packages** - Grid of premium packages
5. ✅ **Black Friday Deals** - Dark carousel section
6. ✅ **Services** - Grid of 8 services
7. ✅ **Destinations** - Popular destinations grid
8. ✅ **Why Choose Us** - Feature highlights
9. ✅ **Local Tours** - Tours carousel
10. ✅ **WhatsApp Contact** - Green CTA section
11. ✅ **Newsletter** - Subscription form
12. ✅ **Footer** - Contact information

## 🎨 Customization Quick Tips

### Change Colors

Edit `tailwind.config.js`:
```javascript
colors: {
  primary: {
    DEFAULT: '#YOUR_COLOR',  // Change this
  }
}
```

### Update Contact Info

Edit `components/Footer.vue`:
- Update phone numbers
- Update email addresses
- Update office addresses

### Change WhatsApp Number

Update in two files:
1. `components/WhatsAppContact.vue`
2. `components/Footer.vue`

Replace `971543977242` with your number.

### Add Real Images

Replace Unsplash URLs in component files with your own images.

## 🛠️ Common Issues

### Issue: Port 3000 already in use

**Solution:** Use a different port:
```bash
npm run dev -- --port 3001
```

### Issue: Module not found errors

**Solution:** Delete node_modules and reinstall:
```bash
rm -rf node_modules
npm install
```

### Issue: Tailwind styles not working

**Solution:** Make sure `@nuxtjs/tailwindcss` is in `nuxt.config.ts`:
```typescript
modules: ['@nuxtjs/tailwindcss']
```

### Issue: Video not playing

**Solution:** 
1. Check if `dubai.mp4` exists in `public/` folder
2. Try a different video format
3. See `VIDEO-SETUP.md` for details

## 📦 Build for Production

When ready to deploy:

```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Vercel will auto-detect Nuxt and deploy!

### Deploy to Netlify

1. Push code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Import your repository
4. Build command: `npm run build`
5. Publish directory: `.output/public`

## 📚 Next Steps

1. ✅ **Read the README** - Full documentation
2. ✅ **Check ARCHITECTURE.md** - Code structure
3. ✅ **Review VIDEO-SETUP.md** - Video configuration
4. ✅ **Customize content** - Update text and images
5. ✅ **Add your branding** - Logo, colors, fonts
6. ✅ **Test on mobile** - Ensure responsiveness

## 🆘 Need Help?

- Check the **README.md** for detailed info
- Review **ARCHITECTURE.md** for code structure
- Look at component files for examples
- Check Nuxt 3 docs: [nuxt.com](https://nuxt.com)

---

**Enjoy building your travel website! 🌍✈️**
