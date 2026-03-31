import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validação das variáveis de ambiente
if (!supabaseUrl || supabaseUrl === 'your_supabase_project_url_here') {
  throw new Error(
    '❌ VITE_SUPABASE_URL não configurada!\n\n' +
    'Por favor, edite o arquivo .env e adicione sua URL do Supabase.\n' +
    'Exemplo: VITE_SUPABASE_URL=https://seu-projeto.supabase.co\n\n' +
    'Obtenha suas credenciais em: https://app.supabase.com/project/_/settings/api'
  );
}

if (!supabaseAnonKey || supabaseAnonKey === 'your_supabase_anon_key_here') {
  throw new Error(
    '❌ VITE_SUPABASE_ANON_KEY não configurada!\n\n' +
    'Por favor, edite o arquivo .env e adicione sua chave anônima do Supabase.\n' +
    'Obtenha suas credenciais em: https://app.supabase.com/project/_/settings/api'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});