@echo off
echo === Limpando cache do Git ===

REM Tentar remover arquivo fantasma do cache
git rm --cached components/magicui/morphing-text.tsx 2>nul

REM Reset do index
git reset HEAD components/magicui/morphing-text.tsx 2>nul

REM Limpar cache geral
git rm -r --cached . 2>nul
git add .

echo === Cache limpo! ===
echo.
echo === Status apos limpeza ===
git status --porcelain

echo.
echo === Tentando commit novamente ===
git commit -m "Fix: Resolve Git cache issues and update Husky configuration"

pause
