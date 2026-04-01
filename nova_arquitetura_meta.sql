-- 1. Cria a tabela de Contas WABA (WhatsApp Business Accounts)
CREATE TABLE IF NOT EXISTS meta_wabas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  waba_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
COMMENT ON TABLE meta_wabas IS 'Armazena contas WhatsApp Business associadas ao sistema';

-- 2. Adiciona as colunas necessárias na tabela meta_phones_status
ALTER TABLE meta_phones_status Add COLUMN IF NOT EXISTS custom_name TEXT;
ALTER TABLE meta_phones_status Add COLUMN IF NOT EXISTS waba_id TEXT REFERENCES meta_wabas(waba_id) ON DELETE CASCADE;

-- 3. Caso você já tenha um WABA rodando e queira migrá-lo automaticamente antes limpar a admin_settings:
-- Isso evita perder a conexão de um número já existente. Ajuste 'Seu WABA ID' se necessário.
INSERT INTO meta_wabas (waba_id, name)
SELECT meta_waba_id, 'WABA Principal Local'
FROM admin_settings 
WHERE key = 'config_meta' 
AND meta_waba_id IS NOT NULL 
AND meta_waba_id != ''
ON CONFLICT (waba_id) DO NOTHING;

-- 4. Associa os status de telefones existentes ao WABA principal recém-criado (opcional/segurança)
UPDATE meta_phones_status 
SET waba_id = (SELECT waba_id FROM meta_wabas LIMIT 1)
WHERE waba_id IS NULL AND (SELECT count(*) FROM meta_wabas) > 0;

-- OBS: Não deletamos a coluna admin_commercial_phone_id de admin_settings para não quebrar 
-- scripts de forma hard-delete, mas nossa API deixará de usá-la.
