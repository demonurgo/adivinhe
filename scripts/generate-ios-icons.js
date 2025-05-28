import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Obter o diretório atual em ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Verifica se o Sharp está instalado
try {
  await import('sharp');
} catch (e) {
  console.log('Instalando dependência sharp...');
  execSync('npm install sharp --save-dev');
}

// Importa o sharp
const sharpModule = await import('sharp');
const sharp = sharpModule.default;

// Caminho para o ícone principal
const sourceIcon = path.join(__dirname, '../public/icon.png');

// Verifica se o ícone principal existe
if (!fs.existsSync(sourceIcon)) {
  console.error('Erro: O arquivo de ícone principal não foi encontrado em public/icon.png');
  process.exit(1);
}

// Tamanhos específicos para iOS e nomes específicos que o Safari espera
const iosIcons = [
  { size: 16, name: 'icon-16x16.png' },
  { size: 32, name: 'icon-32x32.png' },
  { size: 152, name: 'apple-touch-icon-152x152.png' }, // iPad
  { size: 167, name: 'apple-touch-icon-167x167.png' }, // iPad Pro
  { size: 180, name: 'apple-touch-icon.png' }, // iPhone
  { size: 180, name: 'apple-touch-icon-precomposed.png' } // Compatibilidade com versões antigas do iOS
];

// Splash screens para iOS (tamanhos específicos)
const iosSplashScreens = [
  { width: 640, height: 1136, name: 'apple-splash-640x1136.png' },   // iPhone SE
  { width: 750, height: 1334, name: 'apple-splash-750x1334.png' },   // iPhone 8, 7, 6
  { width: 1242, height: 2208, name: 'apple-splash-1242x2208.png' }, // iPhone 8 Plus
  { width: 1125, height: 2436, name: 'apple-splash-1125x2436.png' }, // iPhone X, XS
  { width: 828, height: 1792, name: 'apple-splash-828x1792.png' },   // iPhone XR
  { width: 1242, height: 2688, name: 'apple-splash-1242x2688.png' }, // iPhone XS Max
  { width: 1536, height: 2048, name: 'apple-splash-1536x2048.png' }, // iPad
  { width: 1668, height: 2224, name: 'apple-splash-1668x2224.png' }, // iPad Pro 10.5"
  { width: 1668, height: 2388, name: 'apple-splash-1668x2388.png' }, // iPad Pro 11"
  { width: 2048, height: 2732, name: 'apple-splash-2048x2732.png' }, // iPad Pro 12.9"
];

// Função para criar diretório se não existir
function ensureDirectoryExists(directory) {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
}

// Diretório de saída
const outputDir = path.join(__dirname, '../public/icons');
ensureDirectoryExists(outputDir);
const publicDir = path.join(__dirname, '../public');

// Gerar ícones iOS
async function generateIosIcons() {
  console.log('Gerando ícones para iOS...');
  
  for (const icon of iosIcons) {
    // Decide se o ícone vai para a pasta public ou para a pasta icons
    const outputPath = icon.name.startsWith('apple-touch-icon') && !icon.name.includes('x') 
      ? path.join(publicDir, icon.name) 
      : path.join(outputDir, icon.name);
    
    await sharp(sourceIcon)
      .resize(icon.size, icon.size)
      .toFile(outputPath);
    console.log(`Criado: ${icon.name}`);
  }
  
  // Criar um SVG para o Safari Pinned Tab
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
    <path fill="#3b82f6" d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm0 14a6 6 0 1 1 0-12 6 6 0 0 1 0 12zm0-9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/>
  </svg>`;
  fs.writeFileSync(path.join(publicDir, 'safari-pinned-tab.svg'), svgContent);
  console.log('Criado: safari-pinned-tab.svg');
}

// Gerar splash screens iOS
async function generateIosSplashScreens() {
  console.log('Gerando splash screens para iOS...');
  
  // Cria uma imagem de fundo com a cor do tema
  const backgroundColor = '#1e1b4b'; // Cor de fundo do tema
  
  for (const screen of iosSplashScreens) {
    const outputPath = path.join(outputDir, screen.name);
    
    // Criar um fundo com a cor do tema
    const splash = await sharp({
      create: {
        width: screen.width,
        height: screen.height,
        channels: 4,
        background: backgroundColor
      }
    })
    .png();
    
    // Redimensionar o ícone para 30% do menor lado do splash screen
    const iconSize = Math.min(screen.width, screen.height) * 0.3;
    const resizedIcon = await sharp(sourceIcon)
      .resize(Math.round(iconSize), Math.round(iconSize))
      .toBuffer();
    
    // Posicionar o ícone no centro do splash screen
    await splash
      .composite([{
        input: resizedIcon,
        gravity: 'centre' // Centraliza o ícone
      }])
      .toFile(outputPath);
    
    console.log(`Criado: ${screen.name}`);
  }
}

// Executar as funções
async function main() {
  try {
    await generateIosIcons();
    await generateIosSplashScreens();
    console.log('Todos os ícones foram gerados com sucesso!');
  } catch (error) {
    console.error('Erro ao gerar ícones:', error);
  }
}

main(); 