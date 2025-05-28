// Vercel Build Script
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Ensure the dist directory exists
if (!fs.existsSync(path.join(projectRoot, 'dist'))) {
  fs.mkdirSync(path.join(projectRoot, 'dist'), { recursive: true });
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
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    <link rel="icon" type="image/png" href="/icon.png" />
    <meta name="author" content="Adivinhe Já!" />
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