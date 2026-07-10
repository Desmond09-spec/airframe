# Installer Assets for Airframe Branding

This folder contains the image assets needed for the fully branded Airframe installer.

## Required Image Assets

### 1. wizard-image.bmp
- **Dimensions**: 164x314 pixels
- **Format**: BMP (24-bit)
- **Purpose**: Large sidebar image for installer wizard
- **Design**: Dark gradient background (#0A0A09 to #080808) with Airframe branding
- **Content**: Airframe logo centered, subtle gradient, professional appearance

### 2. wizard-small.bmp
- **Dimensions**: 55x55 pixels
- **Format**: BMP (24-bit)
- **Purpose**: Small icon for wizard sidebar
- **Design**: Airframe logo on transparent/dark background
- **Content**: Simplified Airframe logo icon

### 3. airframe-icon.ico
- **Dimensions**: Multiple sizes (16x16, 32x32, 48x48, 256x256)
- **Format**: ICO (Windows icon format)
- **Purpose**: Installer icon and application icon
- **Design**: Airframe logo with proper transparency
- **Content**: Full Airframe logo in icon format

### 4. airframe-logo.bmp
- **Dimensions**: 120x40 pixels
- **Format**: BMP (24-bit)
- **Purpose**: Logo overlay on welcome and progress pages
- **Design**: Airframe logo on transparent background
- **Content**: Airframe wordmark or logo

## Color Specifications

- **Primary background**: #0A0A09 (near-black)
- **Secondary background**: #080808 (darker)
- **Text color**: #F5F5F3 (light gray)
- **Accent blue**: #4D8AFF (primary accent)
- **Secondary blue**: #0054FA (darker accent)

## Font Specifications

- **UI text**: Figtree (Regular 400, Medium 500, SemiBold 600)
- **Version numbers**: DM Mono (Regular 400)
- **Technical values**: DM Mono (Regular 400)

## How to Create These Assets

1. **Use the existing Airframe logos** from `../../Logo/` folder
2. **Convert to required formats** using image editing software
3. **Resize to exact dimensions** specified above
4. **Apply Airframe color scheme** for backgrounds and accents
5. **Save in this folder** with exact filenames

## Current Status

The installer.iss file is configured to use these assets, but they are currently missing. The installer will still build with default Inno Setup styling until these assets are created.

## Next Steps

1. Create the required image assets
2. Place them in this folder
3. Uncomment the logo placement code in installer.iss
4. Uncomment the font bundling code in installer.iss
5. Rebuild the installer with full branding
