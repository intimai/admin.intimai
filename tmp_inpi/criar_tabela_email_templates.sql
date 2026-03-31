-- 📧 CRIAR TABELA DE TEMPLATES DE EMAIL - SUPABASE
-- Execute este script PRIMEIRO no SQL Editor do Supabase

-- 1. CRIAR TABELA auth.email_templates
CREATE TABLE IF NOT EXISTS auth.email_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    template_name TEXT NOT NULL UNIQUE,
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CRIAR ÍNDICE PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_email_templates_name ON auth.email_templates(template_name);

-- 3. CRIAR TRIGGER PARA ATUALIZAR updated_at
CREATE OR REPLACE FUNCTION update_email_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_email_templates_updated_at
    BEFORE UPDATE ON auth.email_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_email_templates_updated_at();

-- 4. VERIFICAR SE A TABELA FOI CRIADA
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'auth' 
AND table_name = 'email_templates'
ORDER BY ordinal_position;

-- 5. VERIFICAR PERMISSÕES
SELECT 
    grantee,
    privilege_type
FROM information_schema.table_privileges 
WHERE table_schema = 'auth' 
AND table_name = 'email_templates';
