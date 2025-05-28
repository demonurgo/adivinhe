import { promises as fs } from 'fs';
import path from 'path';
import sharp from 'sharp';

// As dimensões das splash screens para iOS
const splashScreenSizes = [
  { width: 1125, height: 2436, name: 'apple-launch-1125x2436.png' }, // iPhone X
  { width: 750, height: 1334, name: 'apple-launch-750x1334.png' },   // iPhone 8, 7, 6s, 6
  { width: 1242, height: 2208, name: 'apple-launch-1242x2208.png' }, // iPhone 8 Plus, 7 Plus, 6s Plus, 6 Plus
  { width: 1170, height: 2532, name: 'apple-launch-1170x2532.png' }, // iPhone 14 Pro, 13 Pro, 12 Pro
  { width: 828, height: 1792, name: 'apple-launch-828x1792.png' },   // iPhone 14, 13, 12, 11
  { width: 2048, height: 2732, name: 'apple-launch-2048x2732.png' }, // iPad Pro 12.9"
  { width: 1668, height: 2388, name: 'apple-launch-1668x2388.png' }, // iPad Pro 11", iPad Air
  { width: 1536, height: 2048, name: 'apple-launch-1536x2048.png' }  // iPad Mini, iPad
];

// Função para criar as splash screens
async function generateSplashScreens() {
  console.log('Gerando imagens de splash screen...');
  
  // Diretório de saída
  const outputDir = path.join(process.cwd(), 'public', 'icons', 'splash');
  const iconsDir = path.join(process.cwd(), 'public', 'icons');
  
  try {
    // Certifique-se de que os diretórios existem
    await fs.mkdir(outputDir, { recursive: true });
    
    // Carregar a imagem de ícone
    const iconPath = path.join(process.cwd(), 'public', 'icon.png');
    
    // Criar uma cor de fundo para o splash screen (usando a cor de fundo do tema)
    const backgroundColor = '#1e1b4b'; // Indigo darker (background_color do manifest.json)
    
    // Verificar se precisamos criar o ícone de 180x180
    const icon180Path = path.join(iconsDir, 'icon-180x180.png');
    try {
      await fs.access(icon180Path);
      console.log('Ícone de 180x180 já existe, pulando...');
    } catch (error) {
      // O arquivo não existe, vamos criá-lo
      console.log('Criando ícone de 180x180...');
      await sharp(iconPath)
        .resize(180, 180, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .toFile(icon180Path);
      console.log('Ícone de 180x180 criado com sucesso!');
    }
    
    // Processar cada tamanho de splash screen
    for (const size of splashScreenSizes) {
      console.log(`Criando ${size.name} (${size.width}x${size.height})...`);
      
      // Criar uma imagem com a cor de fundo
      const splashScreen = sharp({
        create: {
          width: size.width,
          height: size.height,
          channels: 4,
          background: backgroundColor
        }
      });
      
      // Redimensionar o ícone para ter 40% da menor dimensão da tela
      const iconSize = Math.min(size.width, size.height) * 0.4;
      
      // Carregar e redimensionar o ícone
      const resizedIcon = await sharp(iconPath)
        .resize(Math.round(iconSize), Math.round(iconSize), {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .toBuffer();
      
      // Sobrepor o ícone redimensionado no centro da imagem de fundo
      await splashScreen
        .composite([
          {
            input: resizedIcon,
            gravity: 'center'
          }
        ])
        .toFile(path.join(outputDir, size.name));
    }
    
    console.log('Todas as imagens de splash screen foram geradas com sucesso!');
  } catch (error) {
    console.error('Erro ao gerar as splash screens:', error);
  }
}

// Executar a função principal
generateSplashScreens(); 