-- Script adicional para implementar sistema de histórico de jogos
-- Execute este script no SQL Editor do Supabase após o script principal

-- Criar tabela para sessões de jogo
CREATE TABLE IF NOT EXISTS public.game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  score INTEGER NOT NULL DEFAULT 0,
  total_words INTEGER NOT NULL DEFAULT 0,
  categories TEXT[] NOT NULL DEFAULT '{}',
  difficulty TEXT NOT NULL CHECK (difficulty = ANY (ARRAY['facil'::text, 'medio'::text, 'dificil'::text])),
  duration INTEGER NOT NULL DEFAULT 0, -- duration in seconds
  accuracy DECIMAL(5,2) NOT NULL DEFAULT 0.00, -- percentage with 2 decimal places
  user_id UUID DEFAULT NULL, -- for future authentication features
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_game_sessions_created_at ON public.game_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_game_sessions_user_id ON public.game_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_difficulty ON public.game_sessions(difficulty);
CREATE INDEX IF NOT EXISTS idx_game_sessions_score ON public.game_sessions(score DESC);
CREATE INDEX IF NOT EXISTS idx_game_sessions_categories ON public.game_sessions USING GIN(categories);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_game_sessions_updated_at BEFORE UPDATE
ON public.game_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Configurar RLS (Row Level Security) - opcional, para futuras funcionalidades de usuário
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserção sem autenticação (para versão atual)
CREATE POLICY "Allow anonymous inserts" ON public.game_sessions
FOR INSERT WITH CHECK (true);

-- Política para permitir leitura sem autenticação (para versão atual)
CREATE POLICY "Allow anonymous reads" ON public.game_sessions
FOR SELECT USING (true);

-- Comentários para documentação
COMMENT ON TABLE public.game_sessions IS 'Armazena o histórico de jogos dos usuários';
COMMENT ON COLUMN public.game_sessions.score IS 'Pontuação obtida no jogo';
COMMENT ON COLUMN public.game_sessions.total_words IS 'Total de palavras apresentadas durante o jogo';
COMMENT ON COLUMN public.game_sessions.categories IS 'Array com as categorias selecionadas para o jogo';
COMMENT ON COLUMN public.game_sessions.difficulty IS 'Nível de dificuldade do jogo (facil, medio, dificil)';
COMMENT ON COLUMN public.game_sessions.duration IS 'Duração configurada para o jogo em segundos';
COMMENT ON COLUMN public.game_sessions.accuracy IS 'Percentual de acertos no jogo';
COMMENT ON COLUMN public.game_sessions.user_id IS 'ID do usuário (para futuras funcionalidades de autenticação)';

-- Função para obter estatísticas rápidas (opcional, para uso futuro via RPC)
CREATE OR REPLACE FUNCTION get_game_statistics(days_limit INTEGER DEFAULT 365)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_games', COUNT(*),
        'total_score', COALESCE(SUM(score), 0),
        'average_score', COALESCE(ROUND(AVG(score), 2), 0),
        'best_score', COALESCE(MAX(score), 0),
        'total_words_played', COALESCE(SUM(total_words), 0),
        'overall_accuracy', COALESCE(ROUND(AVG(accuracy), 2), 0),
        'games_by_difficulty', json_build_object(
            'facil', COUNT(*) FILTER (WHERE difficulty = 'facil'),
            'medio', COUNT(*) FILTER (WHERE difficulty = 'medio'),
            'dificil', COUNT(*) FILTER (WHERE difficulty = 'dificil')
        )
    ) INTO result
    FROM public.game_sessions
    WHERE created_at >= NOW() - INTERVAL '1 day' * days_limit;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Comentário na função
COMMENT ON FUNCTION get_game_statistics IS 'Retorna estatísticas consolidadas dos jogos em formato JSON';
