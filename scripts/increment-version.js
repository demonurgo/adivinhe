import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Arquivo de versão
const versionFilePath = path.join(projectRoot, 'version.json');

// Interface para leitura de input do usuário
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Função para perguntar ao usuário
const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function incrementVersion() {
  console.log('🔄 Incremento manual de versão');
  
  try {
    // Ler o arquivo de versão atual
    const versionFile = await fs.readFile(versionFilePath, 'utf8');
    const versionData = JSON.parse(versionFile);
    
    console.log(`Versão atual: ${versionData.version} (build ${versionData.build})`);
    
    // Separar major.minor.patch
    const [major, minor, patch] = versionData.version.split('.').map(Number);
    
    // Mostrar opções
    console.log('\nOpções de incremento:');
    console.log('1) Major (x.0.0) - Para mudanças significativas que quebram compatibilidade');
    console.log('2) Minor (1.x.0) - Para novos recursos compatíveis');
    console.log('3) Patch (1.0.x) - Para correções de bugs');
    
    // Perguntar qual tipo de incremento
    const choice = await question('\nEscolha o tipo de incremento (1-3): ');
    
    let newVersion;
    
    switch(choice) {
      case '1':
        newVersion = `${major + 1}.0.0`;
        break;
      case '2':
        newVersion = `${major}.${minor + 1}.0`;
        break;
      case '3':
        newVersion = `${major}.${minor}.${patch + 1}`;
        break;
      default:
        console.log('Opção inválida. Usando incremento de patch.');
        newVersion = `${major}.${minor}.${patch + 1}`;
    }
    
    // Perguntar por uma mensagem de commit
    const commitMessage = await question('\nMensagem para o commit (deixe em branco para pular): ');
    
    // Incrementar o build
    versionData.build += 1;
    versionData.version = newVersion;
    versionData.lastUpdate = new Date().toISOString().split('T')[0];
    
    // Salvar
    await fs.writeFile(versionFilePath, JSON.stringify(versionData, null, 2), 'utf8');
    
    console.log(`\n✅ Versão atualizada para ${newVersion} (build ${versionData.build})`);
    
    // Fazer commit se uma mensagem foi fornecida
    if (commitMessage.trim()) {
      try {
        // Adicionar o arquivo de versão ao staging
        execSync('git add version.json', { stdio: 'inherit' });
        
        // Fazer o commit
        execSync(`git commit -m "v${newVersion}: ${commitMessage}"`, { stdio: 'inherit' });
        
        console.log('\n✅ Commit realizado com sucesso!');
      } catch (error) {
        console.error('\n❌ Erro ao fazer commit:', error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    rl.close();
  }
}

// Executar a função principal
incrementVersion().catch(console.error); 