-- Este script adiciona a coluna custom_name na tabela meta_phones_status.
-- Você pode executar isso no SQL Editor do Supabase.

ALTER TABLE meta_phones_status
ADD COLUMN IF NOT EXISTS custom_name TEXT;

COMMENT ON COLUMN meta_phones_status.custom_name IS 'Nome dado internamente para identificar este número quando é de uso próprio do IntimAI (ex: Comercial).';
