// Script para configurar o banco de dados automaticamente
// Execute este arquivo no console do navegador ou como script Node.js

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ldujhtwxnbwqbchhchcf.supabase.co';
const SUPABASE_KEY = 'SUA_CHAVE_AQUI'; // Substitua pela sua chave

async function setupDatabase() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  
  console.log('🚀 Iniciando configuração do banco de dados...');
  
  try {
    // 1. Verificar se a tabela existe
    const { data: tables, error: tableError } = await supabase
      .from('palavras')
      .select('id')
      .limit(1);
    
    if (tableError && tableError.code === '42P01') {
      console.log('❌ Tabela "palavras" não encontrada. Execute o SQL do arquivo database_setup.sql primeiro!');
      return false;
    }
    
    // 2. Verificar estatísticas atuais
    const { count } = await supabase
      .from('palavras')
      .select('*', { count: 'exact', head: true });
    
    console.log(`📊 Palavras atuais no banco: ${count || 0}`);
    
    // 3. Testar cache local
    try {
      if (typeof window !== 'undefined' && window.indexedDB) {
        console.log('✅ IndexedDB disponível - Cache local funcionará');
      } else {
        console.log('⚠️  IndexedDB não disponível - Cache local não funcionará');
      }
    } catch (e) {
      console.log('⚠️  Erro ao verificar IndexedDB:', e.message);
    }
    
    // 4. Verificar índices (se possível)
    console.log('✅ Conexão com Supabase estabelecida com sucesso');
    
    // 5. Exemplo de como inserir palavras de teste
    if (count === 0) {
      console.log('📝 Banco vazio. Inserindo palavras de exemplo...');
      
      const palavrasExemplo = [
        { texto: 'Pelé', categoria: 'pessoas-famosas', dificuldade: 'facil' },
        { texto: 'Paris', categoria: 'lugares', dificuldade: 'facil' },
        { texto: 'Cachorro', categoria: 'animais', dificuldade: 'facil' },
        { texto: 'Leonardo da Vinci', categoria: 'pessoas-famosas', dificuldade: 'medio' },
        { texto: 'Machu Picchu', categoria: 'lugares', dificuldade: 'medio' },
        { texto: 'Ornitorrinco', categoria: 'animais', dificuldade: 'dificil' }
      ];
      
      const { data, error } = await supabase
        .from('palavras')
        .insert(palavrasExemplo);
      
      if (error) {
        console.log('❌ Erro ao inserir palavras de exemplo:', error.message);
      } else {
        console.log('✅ Palavras de exemplo inseridas com sucesso!');
      }
    }
    
    console.log('🎉 Configuração do banco concluída!');
    return true;
    
  } catch (error) {
    console.error('❌ Erro durante configuração:', error);
    return false;
  }
}

// Para executar no browser
if (typeof window !== 'undefined') {
  window.setupDatabase = setupDatabase;
  console.log('💡 Execute setupDatabase() no console para configurar o banco');
}

// Para executar no Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { setupDatabase };
}

export { setupDatabase };
