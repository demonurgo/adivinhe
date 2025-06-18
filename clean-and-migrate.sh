#!/bin/bash

echo "🧹 Limpeza completa do ambiente - Migração OpenAI"
echo "================================================="

# 1. Parar qualquer processo em execução
echo "1. Parando processos..."
pkill -f "vite\|npm\|node" 2>/dev/null || true

# 2. Limpar caches
echo "2. Limpando caches..."
rm -rf node_modules/
rm -f package-lock.json
rm -rf .vite/
rm -rf dist/
rm -rf build/

# 3. Limpar cache do npm/yarn
echo "3. Limpando cache do npm..."
npm cache clean --force 2>/dev/null || true

# 4. Limpar cache do sistema
echo "4. Limpando caches temporários..."
rm -rf /tmp/vite* 2>/dev/null || true
rm -rf ~/.cache/vite* 2>/dev/null || true

# 5. Reinstalar dependências
echo "5. Removendo dependência antiga..."
npm uninstall @google/genai 2>/dev/null || true

echo "6. Instalando OpenAI..."
npm install openai@^4.0.0

echo "7. Reinstalando todas as dependências..."
npm install

# 8. Força rebuild dos tipos TypeScript
echo "8. Limpando cache TypeScript..."
rm -rf node_modules/.cache/ 2>/dev/null || true

# 9. Iniciar servidor com cache limpo
echo "9. Iniciando servidor com cache limpo..."
echo ""
echo "✅ Ambiente limpo! Iniciando servidor..."
echo "================================================="
npx vite --force --host
