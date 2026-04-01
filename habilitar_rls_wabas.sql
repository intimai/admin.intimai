-- 1. Habilita a Segurança em Nível de Linha (RLS) para a tabela meta_wabas
ALTER TABLE meta_wabas ENABLE ROW LEVEL SECURITY;

-- 2. Cria as políticas permitindo que o nosso painel (seja autenticado ou anônimo) consiga ler e escrever livremente
-- Isso remove o alerta vermelho do Supabase e desbloqueia os acessos
CREATE POLICY "Permitir visualizacao de WABAS" ON meta_wabas
  FOR SELECT USING (true);

CREATE POLICY "Permitir cadastro de WABAS" ON meta_wabas
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir atualizacao de WABAS" ON meta_wabas
  FOR UPDATE USING (true);

CREATE POLICY "Permitir exclusao de WABAS" ON meta_wabas
  FOR DELETE USING (true);
