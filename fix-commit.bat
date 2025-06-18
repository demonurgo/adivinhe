@echo off
echo === SOLUCIONANDO PROBLEMAS DO GIT E HUSKY ===
echo.

REM 1. Limpar qualquer referencia fantasma no cache
echo 1. Limpando cache do Git...
git rm --cached components/magicui/morphing-text.tsx 2>nul && echo    Arquivo removido do cache || echo    ✓ Arquivo nao estava no cache

REM 2. Reset de qualquer staging problematico
echo 2. Resetando staging...
git reset HEAD -- components/magicui/morphing-text.tsx 2>nul && echo    Reset realizado || echo    ✓ Nada para resetar

REM 3. Limpar e re-adicionar todos os arquivos
echo 3. Re-sincronizando arquivos...
git add .

REM 4. Verificar status
echo 4. Status atual:
git status --porcelain

echo.
echo === TENTANDO COMMIT NOVAMENTE ===

REM 5. Fazer commit
git commit -m "fix: resolve Husky deprecation warnings and Git cache issues - Remove deprecated Husky shebang lines from pre-commit hook - Clean up Git cache to resolve morphing-text.tsx phantom reference - Update pre-commit hook to use modern Husky v9+ syntax"

echo.
echo === CONCLUIDO ===
pause
