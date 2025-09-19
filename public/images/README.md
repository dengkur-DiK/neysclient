# Image Management

## How to Upload Your Own Images

1. **Upload to this folder**: Place your photography images in `client/public/images/`

2. **Recommended sizes**:
   - Hero background: 1920x1080px
   - Portfolio images: 800x600px  
   - About section: 800x600px

3. **File formats**: Use .jpg, .jpeg, .png, or .webp

4. **Naming convention**: Use descriptive names like:
   - `hero-background.jpg`
   - `portfolio-tech-setup.jpg`
   - `about-team-photo.jpg`

## Current Image Locations in Code

- **Hero section**: `client/src/components/hero.tsx` (line 23)
- **Portfolio**: `client/src/components/portfolio.tsx` (lines 6, 11, 16, 21, 26, 31)
- **About section**: `client/src/components/about.tsx` (line 31)

## Next Steps

After uploading your images, update the image paths in the component files from:
```
src="https://images.unsplash.com/..."
```

To:
```
src="/images/your-image-name.jpg"
```