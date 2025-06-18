@echo off
echo === Verificando status do Git ===
git status --porcelain

echo.
echo === Arquivos staged ===
git diff --cached --name-only

echo.
echo === Verificando se morphing-text esta no index ===
git ls-files | findstr morphing-text

echo.
echo === Verificando cache do git ===
git ls-files --cached | findstr morphing-text

echo.
echo === Verificando referencias no git ===
git show --name-only --pretty=format: | findstr morphing-text

echo.
echo === Limpando cache do git se necessario ===
git rm --cached components/magicui/morphing-text.tsx 2>nul && echo "Arquivo removido do cache" || echo "Arquivo nao estava no cache"

pause
