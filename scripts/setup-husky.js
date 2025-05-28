import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

async function setupHusky() {
  console.log('🔄 Configurando Husky Git Hooks...');
  
  try {
    // Criar diretório .husky se não existir
    const huskyDir = path.join(projectRoot, '.husky');
    await fs.mkdir(huskyDir, { recursive: true });
    
    // Criar diretório para os scripts do husky
    const huskyScriptsDir = path.join(huskyDir, '_');
    await fs.mkdir(huskyScriptsDir, { recursive: true });
    
    // Inicializar husky
    execSync('npx husky install', { stdio: 'inherit' });
    
    // Criar o arquivo husky.sh principal
    const huskyShPath = path.join(huskyScriptsDir, 'husky.sh');
    const huskyShContent = `#!/usr/bin/env sh
if [ -z "$husky_skip_init" ]; then
  debug () {
    if [ "$HUSKY_DEBUG" = "1" ]; then
      echo "husky (debug) - $1"
    fi
  }

  readonly hook_name="$(basename -- "$0")"
  debug "starting $hook_name..."

  if [ "$HUSKY" = "0" ]; then
    debug "HUSKY env variable is set to 0, skipping hook"
    exit 0
  fi

  if [ -f ~/.huskyrc ]; then
    debug "sourcing ~/.huskyrc"
    . ~/.huskyrc
  fi

  readonly husky_root_dir="$(dirname -- "$0")/../.."
  readonly hook_path="$husky_root_dir/.husky/$hook_name"

  if [ -f "$hook_path" ]; then
    debug "running $hook_path"
    . "$hook_path"
  else
    debug "$hook_path not found, skipping"
  fi
fi`;
    
    await fs.writeFile(huskyShPath, huskyShContent, 'utf8');
    
    // Adicionar hook pre-commit
    const preCommitPath = path.join(huskyDir, 'pre-commit');
    const preCommitContent = `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Verificar se é um commit importante
echo "Verificando commit..."

# Lista de arquivos modificados
CHANGED_FILES=$(git diff --cached --name-only)

# Verificar se algum arquivo importante foi modificado
IMPORTANT_CHANGES=false

for file in $CHANGED_FILES; do
  # Definir os padrões para mudanças importantes
  # Adicione aqui os padrões que você considera importantes para seu projeto
  if [[ $file == *.tsx ]] || [[ $file == *.ts ]] || [[ $file == *.jsx ]] || [[ $file == *.js ]]; then
    # Verificar se não é um arquivo dentro de node_modules
    if [[ $file != node_modules/* ]]; then
      # Verificar o conteúdo das mudanças para determinar se é importante
      DIFF_CONTENT=$(git diff --cached -U0 "$file")
      
      # Procurar por padrões que indicam mudanças importantes
      # Aqui você pode definir seus próprios padrões
      if echo "$DIFF_CONTENT" | grep -E '(function|class|interface|type|const|let|var|export|import|component)' > /dev/null; then
        IMPORTANT_CHANGES=true
        echo "Mudança importante detectada em: $file"
      fi
    fi
  fi
done

# Se houver mudanças importantes, atualizar a versão automaticamente
if [ "$IMPORTANT_CHANGES" = true ]; then
  echo "Foram detectadas mudanças importantes."
  echo "Atualizando versão automaticamente..."
  
  # Executar o script de incremento de versão
  node scripts/update-version.js
  
  # Adicionar o arquivo de versão ao commit
  git add version.json
  
  echo "Versão atualizada e adicionada ao commit."
fi

# Prosseguir com o commit
exit 0`;
    
    await fs.writeFile(preCommitPath, preCommitContent, 'utf8');
    
    // Adicionar permissão de execução (isso funcionará apenas no Unix/Linux/Mac)
    try {
      execSync(`chmod +x ${preCommitPath}`, { stdio: 'inherit' });
      execSync(`chmod +x ${huskyShPath}`, { stdio: 'inherit' });
    } catch (error) {
      console.log('⚠️ Não foi possível definir permissões de execução (provavelmente Windows)');
      console.log('   Você pode precisar adicionar permissões manualmente no Linux/Mac');
    }
    
    console.log('✅ Husky configurado com sucesso!');
    console.log('   Agora o script verificará mudanças importantes a cada commit.');
    
  } catch (error) {
    console.error('❌ Erro ao configurar Husky:', error);
  }
}

// Executar a função principal
setupHusky().catch(console.error); 