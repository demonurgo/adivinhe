import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Arquivo de versão
const versionFilePath = path.join(projectRoot, 'version.json');

async function updateVersion() {
  console.log('🔄 Atualizando versão do aplicativo...');
  
  try {
    // Verificar se o arquivo de versão existe
    let versionData;
    try {
      const versionFile = await fs.readFile(versionFilePath, 'utf8');
      versionData = JSON.parse(versionFile);
      console.log(`✓ Versão atual: ${versionData.version} (build ${versionData.build})`);
    } catch (error) {
      console.log('✓ Criando novo arquivo de versão...');
      versionData = {
        version: '1.0.0',
        build: 0,
        lastUpdate: new Date().toISOString().split('T')[0]
      };
    }
    
    // Incrementar o número do build
    versionData.build += 1;
    
    // Atualizar a data de modificação
    versionData.lastUpdate = new Date().toISOString().split('T')[0];
    
    // Obter informações dos commits
    try {
      // Contar commits desde a última tag ou desde o início se não houver tags
      let commitCount;
      try {
        // Tentar obter o último commit com tag
        const lastTag = execSync('git describe --tags --abbrev=0', { stdio: ['pipe', 'pipe', 'ignore'] }).toString().trim();
        commitCount = parseInt(execSync(`git rev-list ${lastTag}..HEAD --count`).toString().trim());
      } catch (e) {
        // Se não há tag, contar todos os commits
        commitCount = parseInt(execSync('git rev-list --all --count').toString().trim());
      }
      
      // Obter o hash do último commit
      const lastCommitHash = execSync('git rev-parse --short HEAD').toString().trim();
      
      // Verificar se tem mudanças não commitadas
      const hasChanges = execSync('git status --porcelain').toString().trim().length > 0;
      
      // Calcular a nova versão
      // Para este exemplo: major.minor.patch
      // - major: incrementado manualmente para mudanças significativas
      // - minor: baseado na quantidade de commits (a cada 10 commits incrementa o minor)
      // - patch: o resto da divisão dos commits por 10
      const [major, minor, patch] = versionData.version.split('.').map(Number);
      
      // Incrementar minor a cada 10 commits importantes
      const newMinor = Math.floor(commitCount / 10);
      const newPatch = commitCount % 10;
      
      // Atualizar a versão apenas se houve mudança
      if (newMinor !== minor || newPatch !== patch) {
        versionData.version = `${major}.${newMinor}.${newPatch}`;
      }
      
      // Adicionar informação do commit ao build
      versionData.lastCommit = lastCommitHash;
      versionData.isDirty = hasChanges;
      
      console.log(`✓ Nova versão: ${versionData.version} (build ${versionData.build})`);
      console.log(`✓ Commit: ${lastCommitHash}${hasChanges ? ' (com alterações não commitadas)' : ''}`);
    } catch (error) {
      console.warn('⚠️ Erro ao obter informações do git:', error.message);
      console.log('✓ Usando incremento simples de build');
      
      // Se não conseguir obter informações do git, incrementa apenas o patch
      const [major, minor, patch] = versionData.version.split('.').map(Number);
      versionData.version = `${major}.${minor}.${patch + 1}`;
    }
    
    // Salvar o arquivo de versão
    await fs.writeFile(versionFilePath, JSON.stringify(versionData, null, 2), 'utf8');
    console.log('✅ Versão atualizada com sucesso!');
    
    return versionData;
  } catch (error) {
    console.error('❌ Erro ao atualizar versão:', error);
    return null;
  }
}

// Executar a função principal
updateVersion().catch(console.error);

// Exportar a função para uso em outros scripts
export default updateVersion; 