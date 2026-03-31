-- ==========================================================
-- ADICIONAR COLUNA status NAS TABELAS DE DOCUMENTOS
-- ==========================================================

-- 1. Propostas
ALTER TABLE public.lead_propostas 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pendente' 
CHECK (status IN ('pendente', 'enviada', 'aprovada', 'recusada'));

-- 2. Contratos
ALTER TABLE public.lead_contratos 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pendente' 
CHECK (status IN ('pendente', 'enviado', 'assinado', 'cancelado'));


-- ==========================================================
-- GATILHOS DE WEBHOOK PARA PROPOSTAS E CONTRATOS
-- ==========================================================

-- 1. Função Webhook para Propostas
CREATE OR REPLACE FUNCTION public.admin_propostas_status_webhook()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Dispara ao INSERIR ou ao MUDAR status
  IF (TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status)) THEN
    PERFORM net.http_post(
      url := 'https://hook.intimai.app/webhook/admin_propostas_status',
      body := jsonb_build_object(
        'type', TG_OP,
        'record', row_to_json(NEW)
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger para Propostas
DROP TRIGGER IF EXISTS admin_propostas_status_trigger ON public.lead_propostas;
CREATE TRIGGER admin_propostas_status_trigger
AFTER INSERT OR UPDATE ON public.lead_propostas
FOR EACH ROW
EXECUTE FUNCTION public.admin_propostas_status_webhook();

-- 2. Função Webhook para Contratos
CREATE OR REPLACE FUNCTION public.admin_contratos_status_webhook()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Dispara ao INSERIR ou ao MUDAR status
  IF (TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status)) THEN
    PERFORM net.http_post(
      url := 'https://hook.intimai.app/webhook/admin_contratos_status',
      body := jsonb_build_object(
        'type', TG_OP,
        'record', row_to_json(NEW)
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger para Contratos
DROP TRIGGER IF EXISTS admin_contratos_status_trigger ON public.lead_contratos;
CREATE TRIGGER admin_contratos_status_trigger
AFTER INSERT OR UPDATE ON public.lead_contratos
FOR EACH ROW
EXECUTE FUNCTION public.admin_contratos_status_webhook();
