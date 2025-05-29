# 🎯 Adivinhe Já! - Jogo de Charadas Dinâmicas

Um jogo moderno de charadas/adivinhação construído com **React + TypeScript + Vite**, integrado com **Google Gemini AI** para geração dinâmica de palavras e **Supabase** para armazenamento persistente com sistema de aleatoriedade inteligente.

## ✨ Funcionalidades

- 🎮 **10 Categorias**: Pessoas, Lugares, Animais, Objetos, Filmes, Música, Comida, Esportes, Profissões, Natureza
- 🎚️ **3 Níveis de Dificuldade**: Fácil, Médio, Difícil
- ⏱️ **4 Opções de Tempo**: 30s, 60s, 90s, 120s
- 📱 **Interface Responsiva**: Funciona perfeitamente em mobile e desktop
- 🖱️ **Múltiplos Controles**: Mouse drag, touch swipe, teclado e botões de fallback
- 🤖 **IA Integrada**: Geração automática de palavras via Google Gemini
- 🗄️ **Banco Inteligente**: Sistema de aleatoriedade que evita repetições
- 🎲 **Anti-Repetição**: Palavras usadas recentemente têm menor chance de aparecer novamente
- 🎨 **Design Moderno**: TailwindCSS with smooth animations

## 🎮 Como Jogar

### **Controles Disponíveis:**

1. **🖱️ Mouse (Desktop)**:

   - Clique e arraste o card para a esquerda = Pular
   - Clique e arraste o card para a direita = Correto
   - Feedback visual durante o arrastar

2. **👆 Touch (Mobile)**:

   - Swipe para a esquerda = Pular
   - Swipe para a direita = Correto

3. **⌨️ Teclado**:

   - Seta ← (esquerda) = Pular
   - Seta → (direita) = Correto

4. **🔘 Botões de Fallback**:
   - Aparecem automaticamente após 5 segundos
   - Garantem que o jogo sempre seja jogável

### **Feedback Visual:**

- 🔴 **Vermelho**: Ao arrastar para pular
- 🟢 **Verde**: Ao arrastar para correto
- ✖️ **X**: Ícone de pular
- ✅ **Check**: Ícone de correto

### **Como Jogar:**

1. **Seleção**: Escolha uma ou mais categorias
2. **Configuração**: Defina tempo e dificuldade (opcional)
3. **Jogo**: Use qualquer método de controle preferido
4. **Pontuação**: Veja seu score no final!

## 🚀 Configuração

### 1. Pré-requisitos

- Node.js 18+
- Conta no Google AI Studio (para Gemini API)
- Conta no Supabase

### 2. Configuração do Ambiente

As variáveis já estão configuradas no `.env.local`:

```env
GEMINI_API_KEY=
SUPABASE_ANON_KEY=
```

### 3. Estrutura do Banco Supabase

A tabela `palavras` já existe com a seguinte estrutura:

```sql
CREATE TABLE public.palavras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  texto TEXT NOT NULL,                    -- A palavra/frase
  categoria TEXT NOT NULL,                -- Categoria individual
  dificuldade TEXT NOT NULL,              -- 'facil', 'medio', 'dificil'
  ultima_utilizacao TIMESTAMP WITH TIME ZONE,  -- Última vez usada
  total_utilizacoes INTEGER DEFAULT 0,    -- Contador de usos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### 4. Instalação e Execução

```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev

# Build para produção
npm run build
```

## 🎲 Sistema de Aleatoriedade Inteligente

O jogo possui um sistema sofisticado para evitar repetições:

- **Priorização por Uso**: Palavras menos usadas aparecem mais
- **Cooldown Temporal**: Palavras usadas recentemente têm menor prioridade
- **Score Ponderado**: Cada palavra recebe um score baseado em:
  - Quantas vezes foi usada (`total_utilizacoes`)
  - Há quanto tempo foi usada (`ultima_utilizacao`)
- **Atualização Automática**: Cada palavra usada é marcada automaticamente

## 🔄 Gerando Palavras

O botão **"Gerar Mais Palavras"** está disponível quando ambas as APIs estão configuradas:

- Gera automaticamente ~50 palavras por categoria/dificuldade
- Total de ~1.500 palavras (10 × 3 × 50)
- Usa IA Gemini para criar conteúdo original
- Salva no Supabase evitando duplicatas
- Processo completo leva 3-5 minutos
- Mostra progresso em tempo real

### Exemplo de Saída:

```
✅ Palavras novas inseridas: 1.247
⚠️ Duplicadas ignoradas: 253
📊 Total processado: 1.500
```

## 🏗️ Arquitetura

```
├── components/           # Componentes React
│   ├── CategorySelectionScreen.tsx  # Seleção de categorias
│   ├── GameScreen.tsx              # Tela do jogo (com múltiplos controles)
│   ├── DatabasePopulator.tsx       # Gerador de palavras
│   └── ...
├── services/            # Integração com APIs
│   ├── wordService.ts   # Lógica principal + aleatoriedade
│   ├── supabaseClient.ts           # Cliente Supabase
│   └── databasePopulator.ts        # Populador do banco
├── hooks/               # Custom hooks
│   └── useSwipe.ts      # Gestos de swipe + mouse drag
├── constants.tsx        # Configurações e ícones
├── types.ts            # Tipos TypeScript
└── App.tsx             # Componente principal
```

## 🛠️ Tecnologias

- **Frontend**: React 19, TypeScript, Vite
- **Estilização**: TailwindCSS, Google Fonts
- **IA**: Google Gemini API 2.5 Flash
- **Banco**: Supabase (PostgreSQL)
- **Controles**: Touch Events + Mouse Events + Keyboard
- **Deploy**: Compatível com Vercel, Netlify

## 🎯 Funcionalidades Avançadas

### Sistema de Controles Múltiplos

- **Mouse Drag**: Arraste intuitivo com feedback visual
- **Touch Swipe**: Gestos naturais em dispositivos móveis
- **Teclado**: Controles rápidos com setas
- **Botões Fallback**: Garantia de jogabilidade sempre

### Sistema Anti-Repetição

- Palavras usadas nas últimas 24h têm prioridade reduzida em 50%
- Palavras usadas na última semana têm prioridade reduzida em 20%
- Contador de usos global influencia na seleção

### Feedback Visual Avançado

- Cores dinâmicas durante o drag (verde/vermelho)
- Ícones de feedback (✅/✖️)
- Animações suaves de transição
- Rotação sutil durante o arrastar

### Otimizações de Performance

- Índices otimizados para consultas rápidas
- Busca inteligente que prioriza variedade
- Cache de palavras em memória durante o jogo

### Prevenção de Duplicatas

- Verificação automática antes de inserir
- Relatório detalhado de duplicatas ignoradas
- Sistema de upsert para atualizações seguras

## 🎯 Próximas Funcionalidades

- [ ] Sistema de ranking e histórico
- [ ] Modo multiplayer
- [ ] Categorias personalizadas
- [ ] Tema escuro/claro
- [ ] PWA (Progressive Web App)
- [ ] Analytics de palavras mais difíceis

## 🐛 Resolução de Problemas

### **Swipe/Drag não funciona?**

- ✅ **Mouse**: Clique e arraste funcionando
- ✅ **Touch**: Swipe funcionando
- ✅ **Teclado**: Setas ← → funcionando
- ✅ **Botões**: Aparecem após 5s automaticamente

### **Card fica "preso" no meio?**

- Agora corrigido com reset automático
- Botões de fallback aparecem se necessário
- Múltiplas opções de controle

### **Sem palavras?**

- Use o botão "Gerar Mais Palavras"
- Verifique se as APIs estão configuradas
- Sistema de fallback para Gemini + Supabase

## 📝 Licença

Este projeto é open source e está disponível sob a licença MIT.

---

**Desenvolvido com ❤️ para diversão e aprendizado!**
