# Video Background Setup Guide

## Adding the Hero Video

The hero section requires a video file to create the immersive background effect.

### Option 1: Use Your Own Video

1. **Prepare your video:**
   - Recommended format: MP4 (H.264 codec)
   - Recommended resolution: 1920x1080 (Full HD) or higher
   - Keep file size under 10MB for faster loading
   - Duration: 10-30 seconds (it will loop)
   - Content: Dubai skyline, travel destinations, or lifestyle footage

2. **Name the file:**
   - Rename your video to `dubai.mp4`

3. **Place in public folder:**
   ```
   incel-travel/
   └── public/
       └── dubai.mp4  ← Place your video here
   ```

### Option 2: Download Stock Video

**Free Stock Video Sites:**
- [Pexels Videos](https://www.pexels.com/videos/) - Free high-quality videos
- [Pixabay Videos](https://pixabay.com/videos/) - Royalty-free videos
- [Coverr](https://coverr.co/) - Beautiful free stock videos

**Search Terms:**
- "Dubai skyline"
- "Travel destination"
- "Luxury resort"
- "Airplane flying"
- "Beach paradise"
- "City night lights"

### Option 3: Use a Placeholder

If you don't have a video ready, you can temporarily use an image:

1. **Update `components/HeroSection.vue`:**

Replace the video element with:
```vue
<div class="absolute inset-0 w-full h-full">
  <img 
    src="https://images.unsplash.com/photo-1643904736472-8b77e93ca3d7?w=1920&h=1080&fit=crop"
    alt="Dubai"
    class="object-cover w-full h-full"
  />
  <div class="absolute inset-0 video-overlay"></div>
</div>
```

### Video Optimization Tips

1. **Compress your video:**
   - Use tools like [HandBrake](https://handbrake.fr/) or [CloudConvert](https://cloudconvert.com/)
   - Target file size: 5-10MB
   - Quality: Medium-High (you don't need ultra HD for background)

2. **Format settings:**
   - Container: MP4
   - Video codec: H.264
   - Audio: None (muted background videos don't need audio)
   - Frame rate: 24-30 fps
   - Bitrate: 2000-4000 kbps

3. **Performance:**
   - Consider using a poster image (thumbnail) while video loads
   - For mobile, you might want to use a static image instead

### Update Video Path

If your video has a different name, update the path in `components/HeroSection.vue`:

```vue
<video autoplay muted loop playsinline class="object-cover w-full h-full">
  <source src="/your-video-name.mp4" type="video/mp4" />
</video>
```

### Testing

After adding the video:

1. Start the dev server: `npm run dev`
2. Open `http://localhost:3000`
3. The video should auto-play and loop
4. Check performance on mobile devices

### Troubleshooting

**Video not playing:**
- Check browser console for errors
- Ensure video is in the `public` folder
- Try a different video format/encoding
- Check if video file is corrupted

**Performance issues:**
- Reduce video file size
- Lower resolution (1280x720 is acceptable)
- Consider using an image on mobile devices
- Enable lazy loading

**Mobile considerations:**
- Some mobile browsers restrict autoplay
- Consider showing a static image on mobile:

```vue
<div class="absolute inset-0 w-full h-full">
  <video
    v-if="!isMobile"
    autoplay
    muted
    loop
    playsinline
    class="object-cover w-full h-full"
  >
    <source src="/dubai.mp4" type="video/mp4" />
  </video>
  <img
    v-else
    src="/hero-image.jpg"
    class="object-cover w-full h-full"
  />
  <div class="absolute inset-0 video-overlay"></div>
</div>
```

---

Need help? Check the main README.md for more information.
