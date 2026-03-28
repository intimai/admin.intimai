-- ==========================================
-- GATILHO DE WEBHOOK PARA SUPORTE (RESOLVIDO)
-- ==========================================

-- 1. Criar a função que dispara o HTTP POST para o N8N
CREATE OR REPLACE FUNCTION public.admin_suporte_status_webhook()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Disparar apenas quando o status mudar para 'resolvido'
  IF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'resolvido') THEN
    PERFORM net.http_post(
      url := 'https://hook.intimai.app/webhook/admin_suporte_resolvido', -- Ajustar URL se necessário
      body := jsonb_build_object(
        'type', 'UPDATE',
        'record', row_to_json(NEW)
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

-- 2. Criar o gatilho na tabela 'suporte'
DROP TRIGGER IF EXISTS admin_suporte_status_trigger ON public.suporte;
CREATE TRIGGER admin_suporte_status_trigger
AFTER UPDATE ON public.suporte
FOR EACH ROW
EXECUTE FUNCTION public.admin_suporte_status_webhook();

-- NOTA: Certifique-se de que a extensão 'pg_net' está habilitada no seu Supabase.
-- Se não estiver, execute: CREATE EXTENSION IF NOT EXISTS pg_net;
