-- Configuração do banco de dados para o projeto Adivinhe Já!
-- Supabase PostgreSQL Database Setup

-- Criação da tabela principal de palavras
CREATE TABLE IF NOT EXISTS public.palavras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  texto TEXT NOT NULL,
  categoria TEXT NOT NULL,
  dificuldade TEXT NOT NULL CHECK (dificuldade = ANY (ARRAY['facil'::text, 'medio'::text, 'dificil'::text])),
  ultima_utilizacao TIMESTAMP WITH TIME ZONE,
  total_utilizacoes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para otimização de performance
CREATE INDEX IF NOT EXISTS idx_palavras_categoria_dificuldade 
ON public.palavras(categoria, dificuldade);

CREATE INDEX IF NOT EXISTS idx_palavras_utilizacoes 
ON public.palavras(total_utilizacoes);

CREATE INDEX IF NOT EXISTS idx_palavras_ultima_utilizacao 
ON public.palavras(ultima_utilizacao);

CREATE INDEX IF NOT EXISTS idx_palavras_texto_categoria_dificuldade 
ON public.palavras(texto, categoria, dificuldade);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language plpgsql;

-- Trigger para atualizar updated_at automaticamente
DROP TRIGGER IF EXISTS update_palavras_updated_at ON public.palavras;
CREATE TRIGGER update_palavras_updated_at
  BEFORE UPDATE ON public.palavras
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Função para incrementar total_utilizacoes (opcional - RPC)
CREATE OR REPLACE FUNCTION increment_word_usage(word_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.palavras 
  SET 
    total_utilizacoes = total_utilizacoes + 1,
    ultima_utilizacao = now(),
    updated_at = now()
  WHERE id = word_id;
END;
$$ LANGUAGE plpgsql;

-- Função para obter estatísticas do banco
CREATE OR REPLACE FUNCTION get_database_stats()
RETURNS TABLE(
  total_words bigint,
  facil_count bigint,
  medio_count bigint,
  dificil_count bigint,
  by_category jsonb
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT count(*) FROM public.palavras) as total_words,
    (SELECT count(*) FROM public.palavras WHERE dificuldade = 'facil') as facil_count,
    (SELECT count(*) FROM public.palavras WHERE dificuldade = 'medio') as medio_count,
    (SELECT count(*) FROM public.palavras WHERE dificuldade = 'dificil') as dificil_count,
    (SELECT jsonb_object_agg(categoria, count) 
     FROM (
       SELECT categoria, count(*) as count 
       FROM public.palavras 
       GROUP BY categoria
     ) t
    ) as by_category;
END;
$$ LANGUAGE plpgsql;

-- Função para limpeza de palavras duplicadas (opcional)
CREATE OR REPLACE FUNCTION remove_duplicate_words()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  WITH duplicates AS (
    SELECT id, ROW_NUMBER() OVER (
      PARTITION BY texto, categoria, dificuldade 
      ORDER BY created_at DESC
    ) as rn
    FROM public.palavras
  )
  DELETE FROM public.palavras 
  WHERE id IN (
    SELECT id FROM duplicates WHERE rn > 1
  );
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Políticas de segurança (Row Level Security) - opcional
-- ALTER TABLE public.palavras ENABLE ROW LEVEL SECURITY;

-- Comentários para documentação
COMMENT ON TABLE public.palavras IS 'Tabela principal contendo todas as palavras do jogo Adivinhe Já!';
COMMENT ON COLUMN public.palavras.id IS 'Identificador único da palavra (UUID)';
COMMENT ON COLUMN public.palavras.texto IS 'Texto da palavra ou frase';
COMMENT ON COLUMN public.palavras.categoria IS 'Categoria da palavra (pessoas-famosas, lugares, etc.)';
COMMENT ON COLUMN public.palavras.dificuldade IS 'Nível de dificuldade (facil, medio, dificil)';
COMMENT ON COLUMN public.palavras.ultima_utilizacao IS 'Timestamp da última vez que a palavra foi utilizada no jogo';
COMMENT ON COLUMN public.palavras.total_utilizacoes IS 'Contador total de vezes que a palavra foi utilizada';
COMMENT ON COLUMN public.palavras.created_at IS 'Timestamp de criação do registro';
COMMENT ON COLUMN public.palavras.updated_at IS 'Timestamp da última atualização do registro';

-- Exemplo de inserção de dados de teste (opcional - remover em produção)
/*
INSERT INTO public.palavras (texto, categoria, dificuldade) VALUES
('Pelé', 'pessoas-famosas', 'facil'),
('Paris', 'lugares', 'facil'),
('Cachorro', 'animais', 'facil'),
('Leonardo da Vinci', 'pessoas-famosas', 'medio'),
('Machu Picchu', 'lugares', 'medio'),
('Ornitorrinco', 'animais', 'dificil');
*/

-- Query para verificar a estrutura criada
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE tablename = 'palavras';

-- Query para verificar os índices criados
SELECT 
  indexname,
  tablename,
  indexdef
FROM pg_indexes 
WHERE tablename = 'palavras'
ORDER BY indexname;
