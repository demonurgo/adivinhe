# FlickeringGrid Component

## Visão Geral

O componente FlickeringGrid adiciona um fundo animado sutil ao projeto "Adivinhe Já!", criando um efeito visual dinâmico que complementa o design existente.

## Implementação Atual

O FlickeringGrid está integrado como background fixo em todo o app via `App.tsx`:

```tsx
<FlickeringGrid 
  className="absolute inset-0 w-full h-full flickering-grid"
  squareSize={6}
  gridGap={8}
  flickerChance={0.2}
  color="rgb(14, 116, 144)"
  maxOpacity={0.12}
/>
```

## Propriedades Configuráveis

| Propriedade | Tipo | Padrão | Descrição |
|-------------|------|--------|-----------|
| `squareSize` | number | 6 | Tamanho de cada quadrado em pixels |
| `gridGap` | number | 8 | Espaçamento entre quadrados |
| `flickerChance` | number | 0.2 | Probabilidade de mudança (0-1) |
| `color` | string | "rgb(14, 116, 144)" | Cor dos quadrados (cyan escuro) |
| `maxOpacity` | number | 0.12 | Opacidade máxima dos quadrados |
| `width` | number | undefined | Largura fixa (auto se undefined) |
| `height` | number | undefined | Altura fixa (auto se undefined) |

## Otimizações Incluídas

### Performance
- Usa `IntersectionObserver` para pausar quando fora da viewport
- Canvas com device pixel ratio para displays retina
- Animações otimizadas com `requestAnimationFrame`

### Acessibilidade
- Desabilitado automaticamente quando `prefers-reduced-motion: reduce`
- `pointer-events: none` para não interferir com interações

### Mobile
- Otimizado para touch devices
- Responde ao resize da janela
- Hardware acceleration com CSS transforms

## Paleta de Cores Sugeridas

Para manter consistência com o design do app:

```typescript
// Cores principais do tema cyan
const colors = {
  primary: "rgb(14, 116, 144)",    // Cyan escuro (atual)
  secondary: "rgb(22, 78, 99)",    // Cyan mais escuro
  accent: "rgb(6, 182, 212)",      // Cyan claro
  muted: "rgb(103, 232, 249)"      // Cyan muito claro
};
```

## Variações de Configuração

### Sutil (Atual)
```tsx
<FlickeringGrid 
  squareSize={6}
  gridGap={8}
  flickerChance={0.2}
  maxOpacity={0.12}
/>
```

### Mais Visível
```tsx
<FlickeringGrid 
  squareSize={8}
  gridGap={10}
  flickerChance={0.4}
  maxOpacity={0.25}
/>
```

### Minimalista
```tsx
<FlickeringGrid 
  squareSize={4}
  gridGap={12}
  flickerChance={0.1}
  maxOpacity={0.08}
/>
```

## Estrutura do Projeto

```
components/
├── FlickeringGrid.tsx    # Componente principal
└── ...

App.tsx                   # Integração como background global
index.css                 # Otimizações CSS específicas
```

## Considerações Técnicas

1. **Z-index**: O background usa `z-0`, conteúdo usa `z-10`
2. **CSS Classes**: Usa classe `.flickering-grid` para otimizações
3. **Responsive**: Adapta automaticamente ao tamanho do container
4. **Memory Management**: Limpa observers e animations no cleanup

## Futuras Customizações

O componente pode ser facilmente estendido para:
- Padrões de cores diferentes por tela
- Intensidade baseada na atividade do usuário
- Integração com estado do jogo (ex: mais intenso durante gameplay)
