import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { getSupabaseClient, WordRow, isSupabaseConfigured as isSupabaseReady } from './supabaseClient';

const apiKey = process.env.API_KEY; 

let ai: GoogleGenAI | null = null;
let geminiInitialized = false;

if (apiKey) {
   ai = new GoogleGenAI({ apiKey: apiKey });
   geminiInitialized = true;
   console.log("Gemini AI client initialized.");
} else {
  console.warn("API_KEY for Gemini is not defined in environment variables. New word generation will rely on Supabase or fail if Supabase is also unconfigured/empty.");
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

const generateWordsFromGemini = async (
  categoryIds: string[],
  difficulty: string,
  count: number,
  existingWords: string[] = []
): Promise<string[]> => {
  if (!ai || !geminiInitialized) {
    console.warn("Gemini AI client is not initialized. Cannot generate new words.");
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
    console.log(`Requesting ${count} words from Gemini for categories [${categoriesString}], difficulty ${difficulty}.`);
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-04-17",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: difficulty === 'dificil' ? 0.85 : (difficulty === 'facil' ? 0.65 : 0.75),
        topP: 0.95,
        topK: difficulty === 'dificil' ? 60 : (difficulty === 'facil' ? 40 : 50),
      }
    });

    let jsonStr = response.text.trim();
    const fenceRegex = /^```(?:json)?\s*\n?([\s\S]*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[1]) {
      jsonStr = match[1].trim();
    }

    const parsedData = JSON.parse(jsonStr);

    if (Array.isArray(parsedData) && parsedData.every(item => typeof item === 'string')) {
      const newWords = (parsedData as string[])
        .map(item => item.replace(/^"/, '').replace(/"$/, '').trim())
        .filter(item => item.trim() !== "" && !existingWords.includes(item)); 
      console.log(`Gemini generated ${newWords.length} new unique words.`);
      return newWords;
    } else {
      console.warn("Gemini API response data is not an array of strings or is malformed:", parsedData);
      if (typeof parsedData === 'object' && parsedData !== null) {
        const values = Object.values(parsedData);
        if (Array.isArray(values[0]) && (values[0] as any[]).every(item => typeof item === 'string')) {
           console.log("Fallback: Extracted array from an object wrapper in Gemini API response.");
           const newWords = (values[0] as string[])
            .map(item => item.replace(/^"/, '').replace(/"$/, '').trim())
            .filter(item => item.trim() !== "" && !existingWords.includes(item));
           console.log(`Gemini generated ${newWords.length} new unique words (fallback).`);
           return newWords;
        }
      }
      return []; 
    }
  } catch (error) {
    console.error("Error fetching words from Gemini API:", error);
    if (error instanceof Error && error.message.includes('API key not valid')) {
        throw new Error("Chave de API do Gemini inválida. Verifique a configuração.");
    }
    return []; 
  }
};

export const fetchWordsForCategories = async (
  categoryIds: string[], 
  difficulty: string, 
  count: number
): Promise<string[]> => {
  const supabase = getSupabaseClient();
  let wordsFromSupabase: string[] = [];

  if (supabase && isSupabaseReady()) {
    try {
      console.log(`Attempting to fetch ${count} words from Supabase for categories [${categoryIds.join(', ')}], difficulty ${difficulty}.`);
      
      // Query com aleatoriedade baseada em última utilização e total de usos
      // Prioriza palavras menos usadas e que não foram usadas recentemente
      const fetchLimit = Math.max(count * 3, 100); // Busca mais para ter opções de aleatoriedade
      
      const { data, error } = await supabase
        .from('palavras')
        .select('id, texto, ultima_utilizacao, total_utilizacoes')
        .eq('dificuldade', difficulty)
        .in('categoria', categoryIds)
        .order('total_utilizacoes', { ascending: true }) // Menos usadas primeiro
        .order('ultima_utilizacao', { ascending: true, nullsFirst: true }) // Não usadas recentemente primeiro
        .limit(fetchLimit);

      if (error) {
        console.error("Error fetching words from Supabase:", error);
      } else if (data && data.length > 0) {
        // Aplica lógica de aleatoriedade ponderada
        const now = new Date();
        const wordsWithScore = data.map((row: any) => {
          let score = 100; // Score base
          
          // Penaliza palavras muito usadas
          score -= row.total_utilizacoes * 10;
          
          // Penaliza palavras usadas recentemente
          if (row.ultima_utilizacao) {
            const lastUsed = new Date(row.ultima_utilizacao);
            const hoursSinceLastUse = (now.getTime() - lastUsed.getTime()) / (1000 * 60 * 60);
            
            // Se foi usada nas últimas 24h, penaliza bastante
            if (hoursSinceLastUse < 24) {
              score -= 50;
            } else if (hoursSinceLastUse < 168) { // 7 dias
              score -= 20;
            }
          }
          
          return {
            ...row,
            score: Math.max(score, 0) // Score mínimo 0
          };
        });

        // Seleciona palavras com peso baseado no score
        const selectedWords: string[] = [];
        const availableWords = [...wordsWithScore];
        
        for (let i = 0; i < count && availableWords.length > 0; i++) {
          // Seleciona aleatoriamente com peso baseado no score
          const totalScore = availableWords.reduce((sum, word) => sum + word.score + 1, 0);
          let randomValue = Math.random() * totalScore;
          
          let selectedIndex = 0;
          for (let j = 0; j < availableWords.length; j++) {
            randomValue -= (availableWords[j].score + 1);
            if (randomValue <= 0) {
              selectedIndex = j;
              break;
            }
          }
          
          const selectedWord = availableWords[selectedIndex];
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
          
          // Remove da lista de disponíveis
          availableWords.splice(selectedIndex, 1);
        }
        
        wordsFromSupabase = selectedWords;
        console.log(`Fetched ${wordsFromSupabase.length} words from Supabase with randomization.`);
      }
    } catch (e) {
      console.error("Failed to fetch from Supabase:", e);
    }
  } else {
    console.warn("Supabase client not available or not configured. Skipping Supabase fetch.");
  }

  let combinedWords = [...new Set(wordsFromSupabase)];

  // Se não temos palavras suficientes, busca do Gemini
  if (combinedWords.length < count && geminiInitialized && ai) {
    const neededFromGemini = count - combinedWords.length;
    console.log(`Need ${neededFromGemini} more words. Querying Gemini.`);
    const newWordsFromGemini = await generateWordsFromGemini(categoryIds, difficulty, neededFromGemini, combinedWords);

    if (newWordsFromGemini.length > 0) {
      const uniqueNewGeminiWords = newWordsFromGemini.filter(w => !combinedWords.includes(w));
      combinedWords = [...combinedWords, ...uniqueNewGeminiWords]; 
      
      // Salva novas palavras no banco (uma para cada categoria)
      if (supabase && isSupabaseReady() && uniqueNewGeminiWords.length > 0) {
        const wordsToInsert: WordRow[] = [];
        
        // Para cada palavra, cria uma entrada para cada categoria
        uniqueNewGeminiWords.forEach(word => {
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

  if(finalWords.length === 0 && !geminiInitialized && (!supabase || !isSupabaseReady())){
     throw new Error("Nenhuma fonte de palavras (Gemini ou Supabase) está configurada ou disponível.");
  } else if (finalWords.length === 0 && (geminiInitialized || (supabase && isSupabaseReady()))) {
     console.warn("Could not fetch any words from available sources. The database might be empty for these criteria and/or Gemini failed.");
  }

  console.log(`Final word list count: ${finalWords.length}`);
  return finalWords;
};