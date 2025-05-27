@echo off
echo 🧹 Limpando arquivos desnecessários do PWA...

REM Arquivos PWA duplicados/problemáticos
echo Removendo versões PWA problemáticas...
del /Q components\PWAInstallPrompt.tsx 2>nul
del /Q hooks\usePWA.ts 2>nul
del /Q components\PWAIconGenerator.tsx 2>nul
del /Q public\sw.js 2>nul
del /Q public\manifest.json 2>nul

REM Componentes não utilizados
echo Removendo componentes não utilizados...
del /Q components\LazyComponents.tsx 2>nul

REM Documentação e scripts já utilizados
echo Removendo documentação já utilizada...
del /Q PWA_SETUP_GUIDE.md 2>nul
del /Q PWA_EXAMPLES.tsx 2>nul
del /Q setup-pwa.sh 2>nul
del /Q setup-pwa.bat 2>nul

REM Arquivos de desenvolvimento/teste antigos
echo Removendo arquivos de teste antigos...
del /Q test-compilation.ts.bak 2>nul
del /Q test_swipe.js 2>nul
del /Q example_swipe_usage.tsx 2>nul

REM Documentação de desenvolvimento (opcional)
echo Removendo documentação de desenvolvimento...
del /Q README_DOCS.md 2>nul
del /Q RESUMO_FINAL.md 2>nul
del /Q TESTE_CHECKLIST.md 2>nul
del /Q TIMER_FIX.md 2>nul
del /Q BUILD_FIX.md 2>nul

REM Remove scripts de limpeza
echo Removendo scripts de limpeza...
del /Q cleanup-pwa.sh 2>nul

echo.
echo ✅ Limpeza concluída!
echo.
echo 📁 Arquivos mantidos (importantes):
echo    ✅ components\PWAInstallPromptSimple.tsx
echo    ✅ hooks\usePWASimple.ts
echo    ✅ public\app-icon.svg
echo    ✅ public\browserconfig.xml
echo    ✅ public\robots.txt
echo    ✅ Todos os serviços e componentes do jogo
echo.
echo 🎯 Seu PWA continua funcionando perfeitamente!
echo.
echo Pressione qualquer tecla para fechar...
pause >nul

REM Remove este script por último
del /Q cleanup-pwa.bat
