import OpenAI from 'openai';
import { getSupabaseClient, WordRow, isSupabaseConfigured } from './supabaseClient';
import { AVAILABLE_CATEGORIES, DIFFICULTIES } from '../constants';

const apiKey = import.meta.env.VITE_OPENAI_API_KEY; 
let openai: OpenAI | null = null;

if (apiKey) {
   openai = new OpenAI({ 
     apiKey: apiKey,
     dangerouslyAllowBrowser: true // Necessário para uso no browser
   });
   console.log("OpenAI client initialized for database population.");
} else {
  console.warn("API_KEY for OpenAI is not defined. Cannot populate database.");
}

const getDifficultyInstructions = (difficulty: string): string => {
  switch (difficulty.toLowerCase()) {
    case 'facil':
      return "Priorize palavras e frases em Português do Brasil que sejam muito comuns, de conhecimento geral global e fáceis de adivinhar (ex: objetos do cotidiano universal, animais mundialmente conhecidos como 'leão' ou 'golfinho', ações simples, personagens infantis internacionais super populares como 'Mickey Mouse', comidas muito conhecidas globalmente como 'pizza' ou 'hambúrguer', lugares óbvios como 'Paris' ou 'praia'). Evite termos muito específicos de uma única cultura local (a menos que mundialmente famosos), jargões ou referências culturais obscuras.";
    case 'medio':
      return "Busque uma mistura equilibrada de exemplos populares globalmente com outros um pouco mais específicos e criativos, mas ainda amplamente reconhecíveis por um público internacionalizado e também com bom conhecimento da cultura popular brasileira. Pense em filmes e séries de sucesso mundial ('Vingadores', 'Friends'), músicas globais e hits brasileiros, personalidades famosas internacionalmente e no Brasil ('Neymar', 'Angelina Jolie'), lugares icônicos do mundo e do Brasil ('Cristo Redentor', 'Torre Eiffel'), conceitos como 'Inteligência Artificial' ou 'Viagem no Tempo'. Evite os exemplos excessivamente óbvios (nível fácil) ou os excessivamente obscuros/especializados (nível difícil).";
    case 'dificil':
    default: // Mantendo 'medio' como default, mas as instruções de 'dificil' são distintas
      return "Busque palavras, frases, conceitos e nomes próprios em Português do Brasil que sejam desafiadores, menos comuns, específicos ou que exijam conhecimento mais aprofundado, abrangendo tanto cultura global quanto brasileira. Inclua termos técnicos (se aplicável à categoria), figuras históricas de impacto mundial ou brasileiro menos mainstream ('Cleópatra', 'Santos Dumont'), obras de arte ou literatura de renome internacional ou nacional mais cult ('Monalisa', 'Dom Casmurro'), lugares específicos de diversos países (incluindo o Brasil) menos turísticos mas ainda notáveis ('Machu Picchu', 'Lençóis Maranhenses'), ou elementos da cultura pop mais nichados, tanto internacionais quanto brasileiros ('diretor de cinema cult específico', 'banda indie famosa'). Os itens devem ser desafiadores, mas ainda reconhecíveis por jogadores com vasto conhecimento cultural.";
  }
};

const generateWordsForCategory = async (
  categoryId: string,
  difficulty: string,
  count: number = 50
): Promise<string[]> => {
  if (!openai) {
    throw new Error("OpenAI não está configurado.");
  }

  const difficultyInstructions = getDifficultyInstructions(difficulty);

  const systemPrompt = `Você é um assistente de IA especializado em criar conteúdo divertido e culturalmente relevante para jogos de charadas e adivinhação com um apelo amplo e internacional, mantendo a relevância para jogadores no Brasil.
Sempre responda apenas com um objeto JSON válido contendo um array de palavras, sem formatação markdown ou texto adicional.`;

  const userPrompt = `
Seu objetivo é gerar uma lista de ${count} itens *únicos e variados*, estritamente em **PORTUGUÊS DO BRASIL**, que pertençam *exclusivamente* à categoria: '${categoryId}'.

Nível de dificuldade solicitado: ${difficulty}.
Instruções detalhadas para este nível de dificuldade: ${difficultyInstructions}

**Instruções Cruciais Adicionais:**

1.  **Idioma de Saída:** TODOS os itens devem ser em **Português do Brasil**. Não use inglês ou qualquer outro idioma na lista final, a menos que seja uma expressão estrangeira *extremamente comum e totalmente incorporada* ao vocabulário brasileiro (ex: "Shopping Center", "Fast Food", "Spoiler"). Nomes próprios de obras, pessoas ou lugares estrangeiros devem ser mantidos em sua forma original se assim forem conhecidos no Brasil (ex: "Harry Potter", "Nova York", "Pikachu").
2.  **Relevância para Jogos de Adivinhação/Mímica:**
    * Os itens devem ser excelentes para jogos como "Stop", "Imagem & Ação", "Guess Up" ou "Charades". Isso significa que devem ser relativamente conhecíveis e passíveis de serem encenados (mímica) ou descritos através de dicas.
    * Priorize nomes, frases curtas, verbos de ação, objetos concretos, títulos de obras (filmes, músicas, livros), gírias (se adequadas à categoria, dificuldade e amplamente compreendidas).
3.  **Cultura e Popularidade (Apelo Amplo e Internacional):**
    * Incorpore uma mistura vibrante de elementos da cultura pop **GLOBAL** e **BRASILEIRA**. Pense em filmes, séries de TV, músicas, celebridades, personagens fictícios, marcas famosas, lugares icônicos do mundo todo (ex: 'Estátua da Liberdade', 'Muralha da China'), animais conhecidos mundialmente (ex: 'panda', 'tubarão'), pratos típicos de diversos países, esportes populares globalmente, eventos históricos ou atuais de relevância internacional, e também elementos culturais significativos no Brasil que possam ter algum reconhecimento ou serem interessantes.
    * O objetivo é tornar o jogo o mais animado, divertido e engajador possível para um público diversificado, incluindo tanto referências internacionais amplamente reconhecidas quanto aquelas que ressoam bem com o público brasileiro.
    * Busque um equilíbrio: nem excessivamente focado apenas em uma cultura local (a menos que seja mundialmente famosa), nem tão genérico a ponto de perder o fator "surpresa" ou "conexão". A meta é uma experiência de jogo rica e variada.
4.  **Exclusividade da Categoria:** É *fundamental* que *todos* os itens gerados sejam estritamente relevantes para a categoria '${categoryId}' e NENHUMA outra. Evite itens ambíguos ou que possam se encaixar facilmente em múltiplas categorias de um jogo típico de charadas.
5.  **Diversidade e Originalidade:**
    * Gere uma lista variada. Não repita o mesmo conceito com palavras diferentes.
    * Busque originalidade e criatividade, sempre respeitando a dificuldade e a relevância cultural ampla. Surpreenda com itens que são ao mesmo tempo reconhecíveis e não tão óbvios.
6.  **O que EVITAR:**
    * Palavras excessivamente longas ou frases complexas (a menos que seja a natureza da categoria, como "Títulos de Filmes").
    * Termos excessivamente técnicos ou acadêmicos, a menos que a categoria seja especificamente sobre isso e a dificuldade permita.
    * Conteúdo ofensivo, controverso, discriminatório ou inadequado para um jogo divertido e potencialmente familiar.
    * Termos excessivamente específicos de uma única cultura local pouco conhecida internacionalmente (a menos que a categoria seja "Cultura Brasileira - Difícil", por exemplo, e mesmo assim com cautela).
    * Respostas em outros idiomas que não sejam Português do Brasil (exceto nomes próprios consolidados).

**Formato da Saída OBRIGATÓRIO:**
Forneça a resposta como um objeto JSON válido com uma propriedade "words" contendo o array de strings em Português do Brasil.
Exemplo de formato esperado: {"words": ["Item Internacional Exemplo 1", "Outro Item Global Interessante", "Algo Conhecido no Brasil Também"]}

Categoria: ${categoryId}
Dificuldade: ${difficulty}
Quantidade de itens: ${count}
Lembre-se: Português do Brasil, apelo internacional e brasileiro, divertido para charadas!
`;

  try {
    console.log(`Gerando ${count} palavras para categoria [${categoryId}], dificuldade ${difficulty} com OpenAI.`);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Modelo econômico e eficiente
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      temperature: difficulty === 'dificil' ? 0.8 : (difficulty === 'facil' ? 0.6 : 0.7),
      max_tokens: 3000,
      response_format: { type: "json_object" }
    });
    
    const responseText = response.choices[0]?.message?.content?.trim();
    if (!responseText) {
      throw new Error("OpenAI retornou resposta vazia.");
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
    
    if (parsedData.words && Array.isArray(parsedData.words)) {
      wordsArray = parsedData.words;
    } else if (Array.isArray(parsedData)) {
      wordsArray = parsedData;
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
        .map(item => item.trim())
        .filter(item => item.trim() !== "");
      console.log(`OpenAI gerou ${newWords.length} palavras para ${categoryId} (${difficulty}).`);
      return newWords;
    } else {
      console.warn("Resposta da OpenAI não é um array de strings válido:", parsedData);
      return [];
    }

  } catch (error) {
    console.error(`Erro ao buscar palavras da OpenAI para [${categoryId}] (${difficulty}):`, error);
    // Adicionar mais detalhes ao erro pode ser útil
    if (error instanceof Error) {
        console.error("Detalhes do erro:", error.message);
    }
    throw error;
  }
};

export const populateDatabaseWithWords = async (
  onProgress?: (message: string, progress: number) => void
): Promise<{ success: number; errors: number; duplicates: number }> => {
  if (!openai) {
    throw new Error("OpenAI não está configurado.");
  }

  if (!isSupabaseConfigured()) {
    throw new Error("Supabase não está configurado.");
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Cliente Supabase não disponível.");
  }

  let totalSuccess = 0;
  let totalErrors = 0;
  let totalDuplicates = 0;
  
  const totalOperations = AVAILABLE_CATEGORIES.length * DIFFICULTIES.length;
  let currentOperation = 0;

  onProgress?.("Iniciando geração de palavras...", 0);

  for (const category of AVAILABLE_CATEGORIES) {
    for (const difficulty of DIFFICULTIES) {
      currentOperation++;
      const progressPercent = (currentOperation / totalOperations) * 100;
      
      onProgress?.(
        `Gerando palavras para ${category.name} - ${difficulty.name}...`, 
        progressPercent
      );

      try {
        // Gerar palavras para esta categoria/dificuldade
        const words = await generateWordsForCategory(category.id, difficulty.id, 50);
        
        if (words.length === 0) {
          console.warn(`Nenhuma palavra gerada para ${category.id} - ${difficulty.id}`);
          continue;
        }

        // Verificar quais palavras já existem no banco para esta categoria/dificuldade
        const { data: existingWords, error: checkError } = await supabase
          .from('palavras')
          .select('texto')
          .eq('categoria', category.id)
          .eq('dificuldade', difficulty.id);

        if (checkError) {
          console.error(`Erro ao verificar palavras existentes para ${category.id} - ${difficulty.id}:`, checkError);
          totalErrors++;
          continue;
        }

        const existingTexts = new Set(existingWords?.map(w => w.texto) || []);
        
        // Filtrar palavras que já existem
        const newWords = words.filter(word => !existingTexts.has(word));
        const duplicateCount = words.length - newWords.length;
        
        if (duplicateCount > 0) {
          console.log(`${duplicateCount} palavras duplicadas ignoradas para ${category.id} - ${difficulty.id}`);
          totalDuplicates += duplicateCount;
        }

        if (newWords.length === 0) {
          console.log(`Todas as palavras já existem para ${category.id} - ${difficulty.id}`);
          continue;
        }

        // Preparar dados para inserção
        const wordsToInsert: WordRow[] = newWords.map(word => ({
          texto: word,
          categoria: category.id,
          dificuldade: difficulty.id,
          total_utilizacoes: 0
        }));

        // Inserir no banco
        const { data, error } = await supabase
          .from('palavras')
          .insert(wordsToInsert)
          .select('id');

        if (error) {
          console.error(`Erro ao inserir palavras para ${category.id} - ${difficulty.id}:`, error);
          totalErrors++;
        } else {
          const insertedCount = data?.length || 0;
          totalSuccess += insertedCount;
          console.log(`${insertedCount} palavras novas inseridas para ${category.id} - ${difficulty.id}`);
        }

      } catch (error) {
        console.error(`Erro ao processar ${category.id} - ${difficulty.id}:`, error);
        totalErrors++;
      }

      // Pequena pausa para não sobrecarregar as APIs
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
  }

  onProgress?.("Concluído!", 100);

  return {
    success: totalSuccess,
    errors: totalErrors,
    duplicates: totalDuplicates
  };
};
