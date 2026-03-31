-- ==========================================================
-- ADICIONA A COLUNA DE HISTÓRICO DE MENSAGENS NO SUPORTE
-- ==========================================================

-- Esta coluna armazenará o array JSON com o chat híbrido entre
-- Administrador (Painel Admin) e o Usuário (IntimAI App), 
-- mantendo a independência do fluxo oficial de WhatsApp do N8N.

ALTER TABLE public.suporte
ADD COLUMN IF NOT EXISTS historico_conversas JSONB DEFAULT '[]'::jsonb;

-- O formato projetado para uso pelo admin será:
-- [
--   {
--     "id": "uuid",
--     "origem": "admin",
--     "texto": "Mensagem digitada",
--     "data": "2026-03-30T10:00:00Z"
--   }
-- ]
