// Script to generate PWA icons from the PNG source
// This is a Node.js script that uses the sharp library to generate PNG icons
// To use this script:
// 1. Install sharp: npm install sharp
// 2. Run: node scripts/generate-icons.js

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

// Get current file directory (ESM equivalent of __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Icon sizes needed
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Source PNG file
const iconSource = path.join(__dirname, '../public/icon.png');

// Output directory
const outputDir = path.join(__dirname, '../public/icons');

// Ensure the output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Also create the Apple touch icon (180x180)
sizes.push(180);

// Generate icons for each size
async function generateIcons() {
  try {
    console.log('Reading icon source...');
    const iconBuffer = fs.readFileSync(iconSource);
    
    for (const size of sizes) {
      console.log(`Generating ${size}x${size} icon...`);
      
      let outputPath;
      if (size === 180) {
        // Special case for Apple touch icon
        outputPath = path.join(__dirname, '../public/apple-touch-icon.png');
      } else {
        outputPath = path.join(outputDir, `icon-${size}x${size}.png`);
      }
      
      await sharp(iconBuffer)
        .resize(size, size)
        .png()
        .toFile(outputPath);
      
      console.log(`Created: ${outputPath}`);
    }
    
    console.log('All icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

generateIcons(); 