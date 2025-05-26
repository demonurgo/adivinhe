#!/usr/bin/env node

/**
 * Script de otimização de assets e imagens
 * Converte e otimiza imagens para melhor performance
 */

import { promises as fs } from 'fs';
import { resolve, join, extname, basename } from 'path';
import { execSync } from 'child_process';

const ASSETS_DIR = resolve('./public');
const ICONS_DIR = join(ASSETS_DIR, 'icons');
const SCREENSHOTS_DIR = join(ASSETS_DIR, 'screenshots');

// Configurações de otimização
const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const SCREENSHOT_SIZES = {
  mobile: { width: 375, height: 667 },
  desktop: { width: 1280, height: 720 },
};

// Cores para ícones gerados
const ICON_COLORS = {
  primary: '#3b82f6',
  background: '#0f172a',
  text: '#f1f5f9',
};

/**
 * Cria diretórios se não existirem
 */
async function ensureDirectories() {
  const dirs = [ASSETS_DIR, ICONS_DIR, SCREENSHOTS_DIR];
  
  for (const dir of dirs) {
    try {
      await fs.access(dir);
    } catch {
      await fs.mkdir(dir, { recursive: true });
      console.log(`✅ Criado diretório: ${dir}`);
    }
  }
}

/**
 * Gera ícones SVG baseados em texto/emoji
 */
function generateIconSVG(size, emoji = '🎯', bgColor = ICON_COLORS.background) {
  const fontSize = Math.floor(size * 0.6);
  
  return `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${bgColor};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${ICON_COLORS.primary};stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#bg)"/>
  <text x="50%" y="50%" text-anchor="middle" dominant-baseline="central" 
        font-size="${fontSize}" font-family="Arial, sans-serif">${emoji}</text>
</svg>
  `.trim();
}

/**
 * Converte SVG para PNG usando canvas (para Node.js)
 */
async function svgToPng(svgContent, size, outputPath) {
  // Para ambiente Node.js, vamos gerar um script HTML que pode ser usado no browser
  const htmlScript = `
<!DOCTYPE html>
<html>
<head><title>Icon Generator</title></head>
<body>
<canvas id="canvas" width="${size}" height="${size}"></canvas>
<script>
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const img = new Image();
img.onload = function() {
  ctx.drawImage(img, 0, 0, ${size}, ${size});
  const link = document.createElement('a');
  link.download = '${basename(outputPath)}';
  link.href = canvas.toDataURL('image/png');
  link.click();
};
const svgBlob = new Blob([\`${svgContent.replace(/`/g, '\\`')}\`], {type: 'image/svg+xml'});
img.src = URL.createObjectURL(svgBlob);
</script>
</body>
</html>
  `;
  
  // Salva o script HTML para conversão manual
  const htmlPath = outputPath.replace('.png', '.html');
  await fs.writeFile(htmlPath, htmlScript);
  
  // Como alternativa, salva o SVG diretamente
  const svgPath = outputPath.replace('.png', '.svg');
  await fs.writeFile(svgPath, svgContent);
  
  console.log(`📝 Gerado SVG: ${svgPath}`);
  console.log(`📝 Script HTML para conversão: ${htmlPath}`);
}

/**
 * Gera todos os ícones necessários
 */
async function generateIcons() {
  console.log('🎨 Gerando ícones...');
  
  for (const size of ICON_SIZES) {
    const svgContent = generateIconSVG(size);
    const outputPath = join(ICONS_DIR, `icon-${size}x${size}.png`);
    
    await svgToPng(svgContent, size, outputPath);
  }
  
  // Gera favicon
  const faviconSvg = generateIconSVG(32);
  await fs.writeFile(join(ASSETS_DIR, 'favicon.svg'), faviconSvg);
  
  console.log('✅ Ícones gerados com sucesso!');
}

/**
 * Gera screenshots de exemplo (placeholders)
 */
async function generateScreenshots() {
  console.log('📱 Gerando screenshots...');
  
  const mobileScreenshot = `
<svg width="375" height="667" viewBox="0 0 375 667" xmlns="http://www.w3.org/2000/svg">
  <rect width="375" height="667" fill="${ICON_COLORS.background}"/>
  <rect x="20" y="100" width="335" height="50" rx="25" fill="${ICON_COLORS.primary}"/>
  <text x="187.5" y="130" text-anchor="middle" fill="white" font-family="Arial" font-size="18">Adivinhe Já!</text>
  <rect x="20" y="200" width="100" height="80" rx="10" fill="${ICON_COLORS.primary}20" stroke="${ICON_COLORS.primary}"/>
  <text x="70" y="245" text-anchor="middle" fill="${ICON_COLORS.text}" font-family="Arial" font-size="14">Animais</text>
  <rect x="137.5" y="200" width="100" height="80" rx="10" fill="${ICON_COLORS.primary}20" stroke="${ICON_COLORS.primary}"/>
  <text x="187.5" y="245" text-anchor="middle" fill="${ICON_COLORS.text}" font-family="Arial" font-size="14">Lugares</text>
  <rect x="255" y="200" width="100" height="80" rx="10" fill="${ICON_COLORS.primary}20" stroke="${ICON_COLORS.primary}"/>
  <text x="305" y="245" text-anchor="middle" fill="${ICON_COLORS.text}" font-family="Arial" font-size="14">Filmes</text>
</svg>
  `;
  
  const desktopScreenshot = `
<svg width="1280" height="720" viewBox="0 0 1280 720" xmlns="http://www.w3.org/2000/svg">
  <rect width="1280" height="720" fill="${ICON_COLORS.background}"/>
  <rect x="340" y="200" width="600" height="100" rx="50" fill="${ICON_COLORS.primary}"/>
  <text x="640" y="260" text-anchor="middle" fill="white" font-family="Arial" font-size="36">🎯 Adivinhe Já!</text>
  <rect x="200" y="350" width="150" height="120" rx="15" fill="${ICON_COLORS.primary}20" stroke="${ICON_COLORS.primary}"/>
  <text x="275" y="420" text-anchor="middle" fill="${ICON_COLORS.text}" font-family="Arial" font-size="18">Animais</text>
  <rect x="400" y="350" width="150" height="120" rx="15" fill="${ICON_COLORS.primary}20" stroke="${ICON_COLORS.primary}"/>
  <text x="475" y="420" text-anchor="middle" fill="${ICON_COLORS.text}" font-family="Arial" font-size="18">Lugares</text>
  <rect x="600" y="350" width="150" height="120" rx="15" fill="${ICON_COLORS.primary}20" stroke="${ICON_COLORS.primary}"/>
  <text x="675" y="420" text-anchor="middle" fill="${ICON_COLORS.text}" font-family="Arial" font-size="18">Filmes</text>
  <rect x="800" y="350" width="150" height="120" rx="15" fill="${ICON_COLORS.primary}20" stroke="${ICON_COLORS.primary}"/>
  <text x="875" y="420" text-anchor="middle" fill="${ICON_COLORS.text}" font-family="Arial" font-size="18">Música</text>
</svg>
  `;
  
  await fs.writeFile(join(SCREENSHOTS_DIR, 'mobile-1.svg'), mobileScreenshot);
  await fs.writeFile(join(SCREENSHOTS_DIR, 'desktop-1.svg'), desktopScreenshot);
  
  console.log('✅ Screenshots gerados com sucesso!');
}

/**
 * Otimiza imagens existentes
 */
async function optimizeExistingImages() {
  console.log('🔧 Verificando imagens existentes...');
  
  try {
    const files = await fs.readdir(ASSETS_DIR, { recursive: true });
    const imageFiles = files.filter(file => 
      /\.(png|jpg|jpeg|gif|svg)$/i.test(file)
    );
    
    if (imageFiles.length === 0) {
      console.log('📷 Nenhuma imagem encontrada para otimizar');
      return;
    }
    
    console.log(`📷 Encontradas ${imageFiles.length} imagens`);
    
    // Aqui você pode adicionar lógica de otimização real
    // Por exemplo, usando sharp, imagemin, etc.
    
  } catch (error) {
    console.log('📷 Nenhuma imagem encontrada para otimizar');
  }
}

/**
 * Gera arquivo de cache manifest
 */
async function generateCacheManifest() {
  console.log('📋 Gerando manifest de cache...');
  
  const manifest = {
    version: new Date().getTime(),
    assets: {
      icons: ICON_SIZES.map(size => `/icons/icon-${size}x${size}.svg`),
      screenshots: [
        '/screenshots/mobile-1.svg',
        '/screenshots/desktop-1.svg',
      ],
      static: [
        '/',
        '/manifest.json',
        '/favicon.svg',
      ],
    },
    generated: new Date().toISOString(),
  };
  
  await fs.writeFile(
    join(ASSETS_DIR, 'cache-manifest.json'),
    JSON.stringify(manifest, null, 2)
  );
  
  console.log('✅ Manifest de cache gerado!');
}

/**
 * Função principal
 */
async function main() {
  console.log('🚀 Iniciando otimização de assets...\n');
  
  try {
    await ensureDirectories();
    await generateIcons();
    await generateScreenshots();
    await optimizeExistingImages();
    await generateCacheManifest();
    
    console.log('\n✨ Otimização de assets concluída com sucesso!');
    console.log('\n📝 Próximos passos:');
    console.log('1. Converta os arquivos SVG para PNG usando os scripts HTML gerados');
    console.log('2. Execute o build do projeto: npm run build');
    console.log('3. Teste o PWA: npm run preview');
    
  } catch (error) {
    console.error('❌ Erro durante otimização:', error);
    process.exit(1);
  }
}

// Executa se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export {
  generateIcons,
  generateScreenshots,
  optimizeExistingImages,
  generateCacheManifest,
};
