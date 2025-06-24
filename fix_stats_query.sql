-- Script para diagnosticar e corrigir o problema das estatísticas

-- 1. Função para obter estatísticas por dificuldade
CREATE OR REPLACE FUNCTION get_word_stats_by_difficulty()
RETURNS TABLE(dificuldade TEXT, count BIGINT) 
LANGUAGE sql
AS $$
  SELECT p.dificuldade, COUNT(*) as count
  FROM palavras p
  GROUP BY p.dificuldade
  ORDER BY p.dificuldade;
$$;

-- 2. Função para obter estatísticas por categoria
CREATE OR REPLACE FUNCTION get_word_stats_by_category()
RETURNS TABLE(categoria TEXT, count BIGINT) 
LANGUAGE sql
AS $$
  SELECT p.categoria, COUNT(*) as count
  FROM palavras p
  GROUP BY p.categoria
  ORDER BY p.categoria;
$$;

-- 3. Função para obter estatísticas completas
CREATE OR REPLACE FUNCTION get_complete_word_stats()
RETURNS JSON
LANGUAGE sql
AS $$
  SELECT json_build_object(
    'total_words', (SELECT COUNT(*) FROM palavras),
    'by_difficulty', (
      SELECT json_object_agg(dificuldade, count)
      FROM (
        SELECT dificuldade, COUNT(*) as count
        FROM palavras
        GROUP BY dificuldade
      ) difficulty_stats
    ),
    'by_category', (
      SELECT json_object_agg(categoria, count)
      FROM (
        SELECT categoria, COUNT(*) as count
        FROM palavras
        GROUP BY categoria
      ) category_stats
    )
  );
$$;

-- 4. Consultas de diagnóstico (execute manualmente para verificar)
-- SELECT * FROM get_word_stats_by_difficulty();
-- SELECT * FROM get_word_stats_by_category();
-- SELECT get_complete_word_stats();

-- 5. Verificação de dados brutos
-- SELECT dificuldade, COUNT(*) FROM palavras GROUP BY dificuldade;
-- SELECT categoria, COUNT(*) FROM palavras GROUP BY categoria;

-- 6. Verificar se existem valores NULL ou inesperados
-- SELECT DISTINCT dificuldade FROM palavras ORDER BY dificuldade;
-- SELECT DISTINCT categoria FROM palavras ORDER BY categoria;
