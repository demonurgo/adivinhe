// Vercel Build Script
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Ensure the dist directory exists
if (!fs.existsSync(path.join(projectRoot, 'dist'))) {
  fs.mkdirSync(path.join(projectRoot, 'dist'), { recursive: true });
}

// Generate splash screen images
try {
  console.log('🔄 Gerando imagens de splash screen...');
  execSync('node scripts/generate-splash-screens.js', { stdio: 'inherit' });
  console.log('✅ Imagens de splash screen geradas com sucesso');
} catch (err) {
  console.error('❌ Erro ao gerar imagens de splash screen:', err);
}

// Copy favicon.ico to dist
try {
  fs.copyFileSync(
    path.join(projectRoot, 'public', 'favicon.ico'), 
    path.join(projectRoot, 'dist', 'favicon.ico')
  );
  console.log('✅ favicon.ico copied to dist folder');
} catch (err) {
  console.error('❌ Error copying favicon.ico:', err);
}

// Copy icon.png to dist
try {
  fs.copyFileSync(
    path.join(projectRoot, 'public', 'icon.png'), 
    path.join(projectRoot, 'dist', 'icon.png')
  );
  console.log('✅ icon.png copied to dist folder');
} catch (err) {
  console.error('❌ Error copying icon.png:', err);
}

// Copy all icon files from public/icons to dist/icons
try {
  // Ensure icons directory exists in dist
  if (!fs.existsSync(path.join(projectRoot, 'dist', 'icons'))) {
    fs.mkdirSync(path.join(projectRoot, 'dist', 'icons'), { recursive: true });
  }
  
  // Copy all icon files
  const copyIconsRecursively = (srcDir, destDir) => {
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    
    const entries = fs.readdirSync(srcDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(srcDir, entry.name);
      const destPath = path.join(destDir, entry.name);
      
      if (entry.isDirectory()) {
        copyIconsRecursively(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  };
  
  copyIconsRecursively(
    path.join(projectRoot, 'public', 'icons'),
    path.join(projectRoot, 'dist', 'icons')
  );
  
  console.log('✅ All icon files copied to dist/icons folder');
} catch (err) {
  console.error('❌ Error copying icon files:', err);
}

// Generate a Vercel specific file that points to our favicon
const vercelConfigContent = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" href="/favicon.ico" />
    <title>Adivinhe Já!</title>
    <meta name="description" content="Jogo interativo de adivinhação de palavras por categorias com IA integrada" />
  </head>
  <body>
    <script>
      window.location.href = '/';
    </script>
  </body>
</html>
`;

fs.writeFileSync(path.join(projectRoot, 'dist', 'vercel.html'), vercelConfigContent);
console.log('✅ vercel.html generated');

// Copy Vercel specific index.html template
try {
  // Criar um arquivo de índice específico para a Vercel se o arquivo index.html for substituído durante o build
  const vercelIndexContent = `
<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Adivinhe Já! - Charadas Dinâmicas</title>
    <meta name="description" content="Jogo interativo de adivinhação de palavras por categorias com IA integrada" />
    <meta name="author" content="Adivinhe Já!" />

    <!-- Favicons -->
    <link rel="icon" href="/favicon.ico" sizes="any">
    <link rel="icon" type="image/png" href="/icon.png">
    <link rel="apple-touch-icon" href="/icons/icon-192x192.png">

    <!-- PWA Meta Tags -->
    <link rel="manifest" href="/manifest.json" />
    <meta name="theme-color" content="#3b82f6" />
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    <meta name="apple-mobile-web-app-title" content="AdivinheJá">
    
    <!-- iOS icons -->
    <link rel="apple-touch-icon" href="/icons/icon-192x192.png">
    <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png">
    <link rel="apple-touch-icon" sizes="167x167" href="/icons/icon-167x167.png">
    <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-180x180.png">

    <!-- iOS Splash Screens -->
    <!-- iPhone X (1125px x 2436px) -->
    <link rel="apple-touch-startup-image" media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)" href="/icons/splash/apple-launch-1125x2436.png">
    <!-- iPhone 8, 7, 6s, 6 (750px x 1334px) -->
    <link rel="apple-touch-startup-image" media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)" href="/icons/splash/apple-launch-750x1334.png">
    <!-- iPhone 8 Plus, 7 Plus, 6s Plus, 6 Plus (1242px x 2208px) -->
    <link rel="apple-touch-startup-image" media="(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)" href="/icons/splash/apple-launch-1242x2208.png">
    <!-- iPhone 14 Pro, 13 Pro, 12 Pro (1170px x 2532px) -->
    <link rel="apple-touch-startup-image" media="(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)" href="/icons/splash/apple-launch-1170x2532.png">
    <!-- iPhone 14, 13, 12, 11 (828px x 1792px) -->
    <link rel="apple-touch-startup-image" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)" href="/icons/splash/apple-launch-828x1792.png">
    <!-- iPad Pro 12.9" (2048px x 2732px) -->
    <link rel="apple-touch-startup-image" media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)" href="/icons/splash/apple-launch-2048x2732.png">
    <!-- iPad Pro 11", iPad Air (1668px x 2388px) -->
    <link rel="apple-touch-startup-image" media="(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)" href="/icons/splash/apple-launch-1668x2388.png">
    <!-- iPad Mini, iPad (1536px x 2048px) -->
    <link rel="apple-touch-startup-image" media="(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)" href="/icons/splash/apple-launch-1536x2048.png">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/js/main-p6aDRCVY.js"></script>
  </body>
</html>
  `;
  
  // Backup do index.html original
  if (fs.existsSync(path.join(projectRoot, 'dist', 'index.html'))) {
    fs.copyFileSync(
      path.join(projectRoot, 'dist', 'index.html'),
      path.join(projectRoot, 'dist', 'index.original.html')
    );
    console.log('✅ Original index.html backed up');
  }
  
  // Escrever o novo arquivo vercel-index.html
  fs.writeFileSync(
    path.join(projectRoot, 'dist', '_vercel.html'),
    vercelIndexContent
  );
  console.log('✅ Vercel index file created at dist/_vercel.html');
  
  // Criar diretório .vercel em dist se não existir
  const distVercelDir = path.join(projectRoot, 'dist', '.vercel');
  if (!fs.existsSync(distVercelDir)) {
    fs.mkdirSync(distVercelDir, { recursive: true });
  }
  
  // Copiar os arquivos do diretório public/.vercel para dist/.vercel
  const publicVercelDir = path.join(projectRoot, 'public', '.vercel');
  if (fs.existsSync(publicVercelDir)) {
    const files = fs.readdirSync(publicVercelDir);
    for (const file of files) {
      fs.copyFileSync(
        path.join(publicVercelDir, file),
        path.join(distVercelDir, file)
      );
      console.log(`✅ Copied ${file} to dist/.vercel/`);
    }
  }
  
} catch (err) {
  console.error('❌ Error creating Vercel index file:', err);
} 