import OpenAI from 'openai';
import { getSupabaseClient, WordRow, isSupabaseConfigured as isSupabaseReady } from './supabaseClient';
import LocalCacheService from './LocalCacheService';
import RecentWordsManager from './recentWordsManager';

const apiKey = import.meta.env.VITE_OPENAI_API_KEY; 

let openai: OpenAI | null = null;
let openaiInitialized = false;

if (apiKey) {
   openai = new OpenAI({ 
     apiKey: apiKey,
     dangerouslyAllowBrowser: true // Necessário para uso no browser
   });
   openaiInitialized = true;
}

const getDifficultyInstructions = (difficulty: string): string => {
  switch (difficulty.toLowerCase()) {
    case 'facil':
      return "Priorize palavras e frases muito comuns, de conhecimento geral e fáceis de adivinhar. Evite termos muito específicos ou jargões.";
    case 'dificil':
      return "Busque palavras, frases, conceitos e nomes próprios desafiadores, menos comuns, específicos ou que exijam conhecimento mais aprofundado. Inclua termos técnicos (se aplicável à categoria), figuras históricas menos conhecidas, obras de arte ou lugares mais obscuros, mas ainda reconhecíveis por quem tem mais conhecimento.";
    case 'medio':
    default:
      return "Busque uma mistura equilibrada de exemplos populares com outros um pouco mais específicos e criativos, mas ainda amplamente reconhecíveis. Evite os exemplos excessivamente óbvios ou os excessivamente obscuros.";
  }
};

const generateWordsFromOpenAI = async (
  categoryIds: string[],
  difficulty: string,
  count: number,
  existingWords: string[] = []
): Promise<string[]> => {
  if (!openai || !openaiInitialized) {
    console.warn("OpenAI client is not initialized. Cannot generate new words.");
    return [];
  }
  if (count <= 0) return [];

  const categoriesString = categoryIds.join(', ');
  const difficultyInstructions = getDifficultyInstructions(difficulty);
  
  let exclusionPrompt = "";
  if (existingWords.length > 0 && existingWords.length < 50) { 
    exclusionPrompt = `Evite gerar os seguintes itens que já foram selecionados: ${existingWords.join(', ')}.`;
  }
  
  const prompt = `Gere uma lista de ${count} itens únicos e variados que pertençam *exclusivamente* às seguintes categorias (IDs de categoria): ${categoriesString}.
Nível de dificuldade solicitado: ${difficulty}.
Instruções de dificuldade: ${difficultyInstructions}
${exclusionPrompt}

É crucial que *todos* os itens gerados sejam estritamente relevantes para estas categorias (${categoriesString}) e NENHUMA outra.
Para cada item, certifique-se de que seja adequado para um jogo de charadas ou adivinhação (como "Guess Up" ou "Charades").

Siga as instruções de dificuldade para todas as categorias.
Priorize a diversidade, a originalidade e a relevância estrita às categorias: ${categoriesString}, respeitando o nível de dificuldade.
Forneça a lista estritamente como um array JSON de strings.
Exemplo de formato esperado: ["Item1", "Item2", "Item3"]
Não inclua nenhum outro texto, explicação ou formatação markdown fora do array JSON. Apenas o array JSON puro.`;

  try {
    console.log(`Requesting ${count} words from OpenAI for categories [${categoriesString}], difficulty ${difficulty}.`);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Modelo mais econômico e eficiente
      messages: [
        {
          role: "system",
          content: "Você é um assistente especializado em gerar palavras para jogos de adivinhação. Sempre responda apenas com um array JSON válido de strings, sem formatação markdown ou texto adicional."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: difficulty === 'dificil' ? 0.85 : (difficulty === 'facil' ? 0.65 : 0.75),
      max_tokens: 2000,
      response_format: { type: "json_object" }
    });

    const responseText = response.choices[0]?.message?.content?.trim();
    if (!responseText) {
      console.warn("OpenAI API returned empty response");
      return [];
    }

    let jsonStr = responseText;
    
    // Remove markdown formatting if present
    const fenceRegex = /^```(?:json)?\s*\n?([\s\S]*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[1]) {
      jsonStr = match[1].trim();
    }

    const parsedData = JSON.parse(jsonStr);

    // Handle different response formats
    let wordsArray: string[] = [];
    
    if (Array.isArray(parsedData)) {
      wordsArray = parsedData;
    } else if (parsedData.words && Array.isArray(parsedData.words)) {
      wordsArray = parsedData.words;
    } else if (parsedData.items && Array.isArray(parsedData.items)) {
      wordsArray = parsedData.items;
    } else {
      // Try to extract array from object values
      const values = Object.values(parsedData);
      const arrayValue = values.find(val => Array.isArray(val));
      if (arrayValue && Array.isArray(arrayValue)) {
        wordsArray = arrayValue;
      }
    }

    if (wordsArray.length > 0 && wordsArray.every(item => typeof item === 'string')) {
      const newWords = wordsArray
        .map(item => item.replace(/^"/, '').replace(/"$/, '').trim())
        .filter(item => item.trim() !== "" && !existingWords.includes(item)); 
      console.log(`OpenAI generated ${newWords.length} new unique words.`);
      return newWords;
    } else {
      console.warn("OpenAI API response data is not a valid array of strings:", parsedData);
      return []; 
    }
  } catch (error) {
    console.error("Error fetching words from OpenAI API:", error);
    if (error instanceof Error && error.message.includes('API key')) {
        throw new Error("Chave de API da OpenAI inválida. Verifique a configuração.");
    }
    return []; 
  }
};

// Nova função otimizada com cache local e prevenção de repetição
export const fetchWordsForCategoriesOptimized = async (
  categoryIds: string[], 
  difficulty: string, 
  count: number
): Promise<string[]> => {
  const cacheService = LocalCacheService.getInstance();
  const recentWordsManager = RecentWordsManager.getInstance();
  
  try {
    // Busca mais palavras para compensar a filtragem
    const requestCount = Math.max(count * 3, 50);
    
    // Tenta buscar do cache local primeiro
    const cachedWords = await cacheService.getWords(categoryIds, difficulty, requestCount);
    
    if (cachedWords.length > 0) {
      // Filtra palavras recentemente usadas
      const filteredWords = recentWordsManager.filterRecentWords(
        cachedWords.map(w => ({ texto: w.texto, categoria: w.categoria, dificuldade: w.dificuldade }))
      );
      
      if (filteredWords.length >= count) {
        console.log(`🚀 Cache hit! Returned ${filteredWords.length} fresh words instantly`);
        
        // Pega apenas o necessário
        const selectedWords = filteredWords.slice(0, count);
        
        // Marca palavras como utilizadas
        selectedWords.forEach(word => {
          const cachedWord = cachedWords.find(cw => cw.texto === word.texto);
          if (cachedWord) {
            cacheService.markWordAsUsed(cachedWord.id).catch(err => 
              console.warn('Failed to mark word as used:', err)
            );
            recentWordsManager.markWordAsUsed(word.texto, word.categoria, word.dificuldade);
          }
        });
        
        return selectedWords.map(w => w.texto);
      }
    }
    
    // Se cache não tem palavras suficientes não-repetidas, fallback para método original
    console.log(`⚠️  Cache insufficient non-repeated words, falling back to original method`);
    return await fetchWordsForCategories(categoryIds, difficulty, count);
    
  } catch (error) {
    console.error('Error in optimized fetch:', error);
    // Fallback para método original em caso de erro
    return await fetchWordsForCategories(categoryIds, difficulty, count);
  }
};

// Função original melhorada com prevenção de repetição
export const fetchWordsForCategories = async (
  categoryIds: string[], 
  difficulty: string, 
  count: number
): Promise<string[]> => {
  const supabase = getSupabaseClient();
  const recentWordsManager = RecentWordsManager.getInstance();
  let wordsFromSupabase: string[] = [];

  if (supabase && isSupabaseReady()) {
    try {
      console.log(`Attempting to fetch ${count} words from Supabase for categories [${categoryIds.join(', ')}], difficulty ${difficulty}.`);
      
      // Busca mais palavras para compensar a filtragem de palavras recentes
      const fetchLimit = Math.max(count * 4, 150); // Aumenta o fetch para ter mais opções
      
      const { data, error } = await supabase
        .from('palavras')
        .select('id, texto, ultima_utilizacao, total_utilizacoes, categoria')
        .eq('dificuldade', difficulty)
        .in('categoria', categoryIds)
        .order('total_utilizacoes', { ascending: true }) // Menos usadas primeiro
        .order('ultima_utilizacao', { ascending: true, nullsFirst: true }) // Não usadas recentemente primeiro
        .limit(fetchLimit);

      if (error) {
        console.error("Error fetching words from Supabase:", error);
      } else if (data && data.length > 0) {
        // Filtra palavras recentemente usadas ANTES da aleatoriedade
        const availableWords = recentWordsManager.filterRecentWords(
          data.map(row => ({ texto: row.texto, categoria: row.categoria, dificuldade: difficulty, ...row }))
        );
        
        if (availableWords.length === 0) {
          console.warn(`⚠️  Todas as palavras disponíveis foram usadas recentemente. Limpando histórico para continuar...`);
          recentWordsManager.cleanupExpiredWords();
          // Usa todas as palavras disponíveis se o histórico estava muito cheio
          availableWords.push(...data.map(row => ({ texto: row.texto, categoria: row.categoria, dificuldade: difficulty, ...row })));
        }
        
        console.log(`📋 Palavras disponíveis após filtrar recentes: ${availableWords.length}/${data.length}`);
        
        // Aplica lógica de aleatoriedade ponderada apenas nas palavras não-recentes
        const now = new Date();
        const wordsWithScore = availableWords.map((row: any) => {
          let score = 100; // Score base
          
          // Penaliza palavras muito usadas
          score -= row.total_utilizacoes * 5; // Reduzido para dar mais chances
          
          // Penaliza palavras usadas recentemente no banco (além da verificação local)
          if (row.ultima_utilizacao) {
            const lastUsed = new Date(row.ultima_utilizacao);
            const hoursSinceLastUse = (now.getTime() - lastUsed.getTime()) / (1000 * 60 * 60);
            
            // Penalização mais suave para dar mais variedade
            if (hoursSinceLastUse < 1) { // Última hora
              score -= 30;
            } else if (hoursSinceLastUse < 6) { // Últimas 6 horas  
              score -= 15;
            } else if (hoursSinceLastUse < 24) { // Últimas 24 horas
              score -= 5;
            }
          }
          
          return {
            ...row,
            score: Math.max(score, 1) // Score mínimo 1
          };
        });

        // Seleciona palavras com peso baseado no score
        const selectedWords: string[] = [];
        const wordPool = [...wordsWithScore];
        
        for (let i = 0; i < count && wordPool.length > 0; i++) {
          // Seleciona aleatoriamente com peso baseado no score
          const totalScore = wordPool.reduce((sum, word) => sum + word.score, 0);
          let randomValue = Math.random() * totalScore;
          
          let selectedIndex = 0;
          for (let j = 0; j < wordPool.length; j++) {
            randomValue -= wordPool[j].score;
            if (randomValue <= 0) {
              selectedIndex = j;
              break;
            }
          }
          
          const selectedWord = wordPool[selectedIndex];
          selectedWords.push(selectedWord.texto);
          
          // Marca como utilizada no banco
          await supabase
            .from('palavras')
            .update({
              ultima_utilizacao: now.toISOString(),
              total_utilizacoes: selectedWord.total_utilizacoes + 1,
              updated_at: now.toISOString()
            })
            .eq('id', selectedWord.id);
          
          // Marca como usada no gerenciador local
          recentWordsManager.markWordAsUsed(selectedWord.texto, selectedWord.categoria, difficulty);
          
          // Remove da lista de disponíveis para evitar duplicatas na mesma busca
          wordPool.splice(selectedIndex, 1);
        }
        
        wordsFromSupabase = selectedWords;
        console.log(`✅ Fetched ${wordsFromSupabase.length} non-repeated words from Supabase.`);
      }
    } catch (e) {
      console.error("Failed to fetch from Supabase:", e);
    }
  } else {
    console.warn("Supabase client not available or not configured. Skipping Supabase fetch.");
  }

  let combinedWords = [...new Set(wordsFromSupabase)];

  // Se não temos palavras suficientes, busca da OpenAI
  if (combinedWords.length < count && openaiInitialized && openai) {
    const neededFromOpenAI = count - combinedWords.length;
    console.log(`Need ${neededFromOpenAI} more words. Querying OpenAI.`);
    const newWordsFromOpenAI = await generateWordsFromOpenAI(categoryIds, difficulty, neededFromOpenAI, combinedWords);

    if (newWordsFromOpenAI.length > 0) {
      const uniqueNewOpenAIWords = newWordsFromOpenAI.filter(w => !combinedWords.includes(w));
      combinedWords = [...combinedWords, ...uniqueNewOpenAIWords]; 
      
      // Salva novas palavras no banco (uma para cada categoria)
      if (supabase && isSupabaseReady() && uniqueNewOpenAIWords.length > 0) {
        const wordsToInsert: WordRow[] = [];
        
        // Para cada palavra, cria uma entrada para cada categoria
        uniqueNewOpenAIWords.forEach(word => {
          categoryIds.forEach(categoryId => {
            wordsToInsert.push({
              texto: word,
              categoria: categoryId,
              dificuldade: difficulty,
              total_utilizacoes: 0
            });
          });
        });

        console.log(`Attempting to save ${wordsToInsert.length} new word entries to Supabase.`);
        const { error: insertError } = await supabase
          .from('palavras')
          .insert(wordsToInsert);

        if (insertError) {
          console.error("Error saving new words to Supabase:", insertError.message);
        } else {
          console.log(`${wordsToInsert.length} new word entries successfully saved to Supabase.`);
        }
      }
    }
  }
  
  // Shuffle final da lista
  combinedWords.sort(() => Math.random() - 0.5);
  const finalWords = [...new Set(combinedWords)].slice(0, count);

  if(finalWords.length === 0 && !openaiInitialized && (!supabase || !isSupabaseReady())){
     throw new Error("Nenhuma fonte de palavras (OpenAI ou Supabase) está configurada ou disponível.");
  } else if (finalWords.length === 0 && (openaiInitialized || (supabase && isSupabaseReady()))) {
     console.warn("Could not fetch any words from available sources. The database might be empty for these criteria and/or OpenAI failed.");
  }

  console.log(`Final word list count: ${finalWords.length}`);
  return finalWords;
};

// Funções auxiliares para otimização
export const initializeCache = async (): Promise<boolean> => {
  const cacheService = LocalCacheService.getInstance();
  return await cacheService.initialize();
};

export const preloadWordsForGame = async (
  categories: string[], 
  difficulties: string[] = ['facil', 'medio', 'dificil']
): Promise<void> => {
  const cacheService = LocalCacheService.getInstance();
  await cacheService.preloadWords(categories, difficulties);
};

export const getCacheStatistics = () => {
  const cacheService = LocalCacheService.getInstance();
  return {
    stats: cacheService.getCacheStats(),
    totalWords: cacheService.getTotalCachedWords()
  };
};

export const clearExpiredCache = async (): Promise<void> => {
  const cacheService = LocalCacheService.getInstance();
  await cacheService.clearExpiredCache();
};

// Funções para gerenciamento de sessões e palavras recentes
export const startGameSession = (categories: string[], difficulty: string): string => {
  const recentWordsManager = RecentWordsManager.getInstance();
  return recentWordsManager.startNewSession(categories, difficulty);
};

export const endGameSession = (): void => {
  const recentWordsManager = RecentWordsManager.getInstance();
  recentWordsManager.endCurrentSession();
};

export const getRecentWordsStatistics = () => {
  const recentWordsManager = RecentWordsManager.getInstance();
  return recentWordsManager.getStatistics();
};

export const cleanupRecentWords = (): number => {
  const recentWordsManager = RecentWordsManager.getInstance();
  return recentWordsManager.cleanupExpiredWords();
};

export const resetRecentWordsHistory = (): void => {
  const recentWordsManager = RecentWordsManager.getInstance();
  recentWordsManager.resetAll();
};

// Função para verificar o status de saúde das palavras
export const checkWordsHealthStatus = (
  categories: string[], 
  difficulty: string, 
  estimatedTotalWords: number = 150
) => {
  const recentWordsManager = RecentWordsManager.getInstance();
  return recentWordsManager.getWordsHealthStatus(categories, difficulty, estimatedTotalWords);
};

// Função para resetar colunas de uso no banco de dados
export const resetDatabaseUsageColumns = async (): Promise<{
  success: boolean;
  affectedRows: number;
  message: string;
}> => {
  const supabase = getSupabaseClient();
  
  if (!supabase || !isSupabaseReady()) {
    return {
      success: false,
      affectedRows: 0,
      message: "Supabase não está configurado ou disponível."
    };
  }

  try {
    console.log("🗑️  Iniciando reset das colunas de uso no banco de dados...");
    
    // Executa o reset de todas as palavras
    const { data, error } = await supabase
      .from('palavras')
      .update({
        total_utilizacoes: 0,
        ultima_utilizacao: null,
        updated_at: new Date().toISOString()
      })
      .neq('id', '00000000-0000-0000-0000-000000000000') // Condição que sempre é verdadeira
      .select('id');

    if (error) {
      console.error("❌ Erro ao resetar colunas de uso:", error);
      return {
        success: false,
        affectedRows: 0,
        message: `Erro ao resetar: ${error.message}`
      };
    }

    const affectedRows = data ? data.length : 0;
    console.log(`✅ Reset concluído: ${affectedRows} palavras atualizadas`);
    
    return {
      success: true,
      affectedRows,
      message: `Reset concluído com sucesso! ${affectedRows} palavras foram resetadas.`
    };
    
  } catch (error) {
    console.error("❌ Erro inesperado ao resetar colunas:", error);
    return {
      success: false,
      affectedRows: 0,
      message: `Erro inesperado: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    };
  }
};
