import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Hardcode the Supabase URL as requested by the user.
const supabaseUrl = "https://ldujhtwxnbwqbchhchcf.supabase.co"; 

// Using service_role key for write operations (as requested by user)
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase: SupabaseClient | null = null;
let initializationError: string | null = null;

if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
  } catch (error) {
    console.error("Error initializing Supabase client:", error);
    initializationError = error instanceof Error ? error.message : "Unknown error initializing Supabase.";
    supabase = null;
  }
} else {
  const missingVars: string[] = [];
  if (!supabaseKey) missingVars.push("SUPABASE_ANON_KEY");
  
  let errorMessage = `Supabase environment variable(s) not defined: ${missingVars.join(', ')}. Supabase integration will be disabled.`;
  initializationError = errorMessage;
}

export const getSupabaseClient = () => {
  if (initializationError && !supabase) {
    return null; 
  }
  return supabase;
};

export const isSupabaseConfigured = (): boolean => !!supabase && !initializationError;

// Interface atualizada para corresponder à estrutura real da tabela
export interface WordRow {
  id?: string; // UUID
  texto: string; // texto da palavra
  categoria: string; // categoria individual (não array)
  dificuldade: string; // 'facil', 'medio', 'dificil'
  ultima_utilizacao?: string; // timestamp da última utilização
  total_utilizacoes?: number; // contador de utilizações
  created_at?: string;
  updated_at?: string;
}