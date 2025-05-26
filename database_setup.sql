-- Script SQL para verificar/criar a tabela 'palavras' no Supabase
-- A tabela já existe no projeto "palavras", mas este script serve como documentação

-- Estrutura da tabela existente:
/*
CREATE TABLE public.palavras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  texto TEXT NOT NULL,
  categoria TEXT NOT NULL,
  dificuldade TEXT NOT NULL CHECK (dificuldade = ANY (ARRAY['facil'::text, 'medio'::text, 'dificil'::text])),
  ultima_utilizacao TIMESTAMP WITH TIME ZONE,
  total_utilizacoes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
*/

-- Criar índices para melhor performance (se não existirem)
CREATE INDEX IF NOT EXISTS idx_palavras_categoria_dificuldade ON public.palavras (categoria, dificuldade);
CREATE INDEX IF NOT EXISTS idx_palavras_utilizacoes ON public.palavras (total_utilizacoes);
CREATE INDEX IF NOT EXISTS idx_palavras_ultima_utilizacao ON public.palavras (ultima_utilizacao);
CREATE INDEX IF NOT EXISTS idx_palavras_texto_categoria_dificuldade ON public.palavras (texto, categoria, dificuldade);

-- Habilitar RLS (Row Level Security) - se não estiver habilitado
ALTER TABLE public.palavras ENABLE ROW LEVEL SECURITY;

-- Comentários para documentação
COMMENT ON TABLE public.palavras IS 'Tabela para armazenar palavras do jogo Adivinhe Já! com sistema de aleatoriedade';
COMMENT ON COLUMN public.palavras.id IS 'Identificador único (UUID)';
COMMENT ON COLUMN public.palavras.texto IS 'A palavra ou frase para adivinhar';
COMMENT ON COLUMN public.palavras.categoria IS 'Categoria individual da palavra (pessoas, lugares, animais, etc.)';
COMMENT ON COLUMN public.palavras.dificuldade IS 'Nível de dificuldade: facil, medio ou dificil';
COMMENT ON COLUMN public.palavras.ultima_utilizacao IS 'Timestamp da última vez que a palavra foi usada no jogo';
COMMENT ON COLUMN public.palavras.total_utilizacoes IS 'Contador de quantas vezes a palavra foi usada (para aleatoriedade)';

-- Verificar estrutura da tabela
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'palavras' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar palavras existentes por categoria e dificuldade
SELECT 
  categoria,
  dificuldade,
  COUNT(*) as total_palavras,
  COUNT(CASE WHEN ultima_utilizacao IS NULL THEN 1 END) as nunca_usadas,
  AVG(total_utilizacoes::float) as media_utilizacoes
FROM public.palavras 
GROUP BY categoria, dificuldade 
ORDER BY categoria, dificuldade;