# Sistema de Versionamento - Adivinhe Já!

Este documento descreve como funciona o sistema de versionamento automático do aplicativo Adivinhe Já!

## Formato da Versão

O aplicativo utiliza o formato semântico de versionamento:

```
MAJOR.MINOR.PATCH (exemplo: 1.4.0)
```

- **MAJOR**: Incrementado para mudanças que quebram compatibilidade com versões anteriores
- **MINOR**: Incrementado para adição de funcionalidades compatíveis com versões anteriores
- **BUILD**: Incrementado para correções de bugs e pequenas melhorias

Além disso, o sistema também mantém um número de build incremental que aumenta a cada compilação.

## Arquivos Relacionados

- `version.json`: Armazena os dados da versão atual
- `scripts/update-version.js`: Script que atualiza automaticamente a versão baseado nos commits
- `scripts/increment-version.js`: Script para incrementar manualmente a versão em commits importantes

## Scripts Disponíveis

Para manipular a versão, você pode utilizar os seguintes comandos:

```bash
# Atualiza automaticamente a versão baseado nos commits
npm run update-version

# Incremento manual da versão (para commits importantes)
npm run version:increment
```

## Como Funciona

### Atualização Automática

O script `update-version.js` é executado automaticamente antes de cada build e:

1. Incrementa o número de build
2. Calcula a versão com base na quantidade de commits
3. Registra informações do último commit e estado do repositório
4. Atualiza o arquivo `version.json`

### Incremento Manual

Para commits importantes, você pode usar o comando `npm run version:increment` que:

1. Mostra a versão atual
2. Permite escolher qual parte da versão incrementar (major, minor ou patch)
3. Solicita uma mensagem para o commit
4. Atualiza o arquivo `version.json`
5. Opcionalmente, cria um commit com a nova versão

### Exibição na Interface

A versão é exibida na tela de boas-vindas do aplicativo como "vX.Y.Z" e, ao passar o mouse sobre ela, são mostradas informações adicionais como o número do build, data da última atualização e hash do último commit. 