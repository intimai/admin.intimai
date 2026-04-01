-- ==========================================
-- GATILHO DE MIGRAÇÂO: APP_SETTINGS -> ADMIN_SETTINGS E META API
-- ==========================================

-- 1. Renomear a tabela app_settings para admin_settings
ALTER TABLE public.app_settings RENAME TO admin_settings;

-- 2. Adicionar as novas colunas para a integração da Meta (WhatsApp)
ALTER TABLE public.admin_settings 
ADD COLUMN IF NOT EXISTS meta_api_token text,
ADD COLUMN IF NOT EXISTS admin_commercial_phone_id text;
