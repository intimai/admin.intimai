-- ==========================================================
-- CRIAÇÃO DA TABELA notas_fiscais (CORREÇÃO DE TIPO: INTEGER)
-- ==========================================================

CREATE TABLE IF NOT EXISTS public.notas_fiscais (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "delegaciaId" INTEGER REFERENCES public.delegacias("delegaciaId") ON DELETE SET NULL, 
  numero_nf TEXT NOT NULL,
  valor NUMERIC(12,2),
  data_emissao DATE,
  descricao TEXT,
  arquivo_url TEXT,
  arquivo_nome TEXT,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'enviada', 'paga', 'cancelada')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para busca rápida
CREATE INDEX IF NOT EXISTS idx_nf_delegacia ON public.notas_fiscais("delegaciaId");
CREATE INDEX IF NOT EXISTS idx_nf_status ON public.notas_fiscais(status);

-- RLS (Row Level Security)
ALTER TABLE public.notas_fiscais ENABLE ROW LEVEL SECURITY;

-- Política para administradores (acesso total)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin full access notas_fiscais') THEN
        CREATE POLICY "Admin full access notas_fiscais" ON public.notas_fiscais FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;


-- ==========================================================
-- CRIAR O BUCKET DE STORAGE (MARCADO COMO PÚBLICO)
-- ==========================================================

-- Remove o bucket se existir como privado para recriar como público (CAUTELA: Isso apaga arquivos se já houver algum)
-- Se preferir não apagar, basta mudar 'public' no dashboard do Supabase.
INSERT INTO storage.buckets (id, name, public)
VALUES ('notas-fiscais', 'notas-fiscais', true) -- Alterado para TRUE
ON CONFLICT (id) DO UPDATE SET public = true;

-- Política de acesso ao bucket (admin pode subir e ler)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin upload notas-fiscais') THEN
        CREATE POLICY "Admin upload notas-fiscais" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'notas-fiscais');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin read notas-fiscais') THEN
        CREATE POLICY "Admin read notas-fiscais" ON storage.objects FOR SELECT USING (bucket_id = 'notas-fiscais');
    END IF;
END $$;


-- ==========================================================
-- WEBHOOK TRIGGER - Disparo ao registrar nova NF-e
-- ==========================================================

-- 1. Função que dispara o HTTP POST para o N8N
CREATE OR REPLACE FUNCTION public.admin_nfe_webhook()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Dispara ao INSERIR uma nova nota fiscal
  IF (TG_OP = 'INSERT') THEN
    PERFORM net.http_post(
      url := 'https://hook.intimai.app/webhook/admin_nova_nfe',
      body := jsonb_build_object(
        'type', 'INSERT',
        'record', row_to_json(NEW)
      )
    );
  END IF;

  -- Dispara ao ATUALIZAR o status
  IF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) THEN
    PERFORM net.http_post(
      url := 'https://hook.intimai.app/webhook/admin_nfe_status',
      body := jsonb_build_object(
        'type', 'STATUS_UPDATE',
        'old_status', OLD.status,
        'new_status', NEW.status,
        'record', row_to_json(NEW)
      )
    );
  END IF;

  RETURN NEW;
END;
$$;

-- 2. Gatilho na tabela notas_fiscais
DROP TRIGGER IF EXISTS admin_nfe_trigger ON public.notas_fiscais;
CREATE TRIGGER admin_nfe_trigger
AFTER INSERT OR UPDATE ON public.notas_fiscais
FOR EACH ROW
EXECUTE FUNCTION public.admin_nfe_webhook();
