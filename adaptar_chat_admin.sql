-- ==========================================================
-- ADAPTAÇÃO DA TABELA chat_admin PARA A PIPELINE (CRM)
-- ==========================================================

-- 1. Remove a coluna que relacionava ao núcleo policial (N8N)
ALTER TABLE public.chat_admin 
DROP COLUMN IF EXISTS id_intimacao CASCADE;

-- 2. Adiciona a coluna que conecta as mensagens aos Leads do CRM
ALTER TABLE public.chat_admin 
ADD COLUMN IF NOT EXISTS lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE;

-- (Opcional, mas de boas práticas): Para garantir a integridade da origem
-- Como a tabela foi clonada da 'chat' original, a coluna 'origem' já deve existir.
-- Normalmente ela recebe strings como 'bot', 'usuario'. Na pipeline será 'admin' ou 'lead'.
-- ALTER TABLE public.chat_admin ADD COLUMN IF NOT EXISTS origem TEXT;
-- ALTER TABLE public.chat_admin ADD COLUMN IF NOT EXISTS mensagem TEXT;

-- 3. Caso não exista "status" na tabela clonada (importante para o double check azul do zap)
ALTER TABLE public.chat_admin 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'enviado';
