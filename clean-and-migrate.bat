@echo off
echo 🧹 Limpeza completa do ambiente - Migração OpenAI
echo =================================================

echo 1. Parando processos...
taskkill /f /im node.exe >nul 2>&1
taskkill /f /im npm.exe >nul 2>&1

echo 2. Limpando caches e arquivos temporários...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json
if exist .vite rmdir /s /q .vite
if exist dist rmdir /s /q dist
if exist build rmdir /s /q build

echo 3. Limpando cache do npm...
npm cache clean --force

echo 4. Removendo dependência antiga...
npm uninstall @google/genai

echo 5. Instalando OpenAI...
npm install openai@^4.0.0

echo 6. Reinstalando todas as dependências...
npm install

echo 7. Limpando cache do Vite...
echo ✅ Dependências instaladas! Agora execute: npm run dev

echo.
echo =================================================
echo ✅ Migração completa! Execute agora:
echo    npm run dev
echo =================================================
pause
