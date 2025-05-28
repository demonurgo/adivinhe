#!/usr/bin/env sh

# Arquivo husky.sh para ser usado pelos hooks git

# Variáveis de ambiente comuns
export PATH="/usr/local/bin:$PATH"

# Função para verificar a existência de um comando
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Checar ambiente
if [ -z "$CI" ]; then
  # Ambiente de desenvolvimento (não CI)
  if ! command_exists node; then
    echo "Erro: Node.js não encontrado. Por favor, instale o Node.js."
    exit 1
  fi
fi

# Executar o script específico do hook
if [ -f "$1" ]; then
  sh "$1"
else
  echo "Hook $1 não encontrado."
  exit 1
fi 