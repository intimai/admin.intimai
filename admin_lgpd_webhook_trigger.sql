-- ==========================================
-- GATILHO DE WEBHOOK PARA LGPD (RESPOSTA DO ADMIN)
-- ==========================================

-- Habilitar a extensão pg_net caso não esteja habilitada no banco (geralmente já está)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 1. Criar a função que dispara o HTTP POST para o N8N
CREATE OR REPLACE FUNCTION public.admin_lgpd_resposta_webhook()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Disparar apenas quando o status mudar para 'processado'
  -- Isso garante que o admin digitou a resposta e finalizou a tarefa no painel
  IF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'processado') THEN
    PERFORM net.http_post(
      url := 'https://hook.intimai.app/webhook/admin_resposta_LGPD',
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body := jsonb_build_object(
        'type', 'UPDATE',
        'record', row_to_json(NEW)
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

-- 2. Criar o gatilho na tabela 'lgpd_requests'
DROP TRIGGER IF EXISTS admin_lgpd_resposta_trigger ON public.lgpd_requests;
CREATE TRIGGER admin_lgpd_resposta_trigger
AFTER UPDATE ON public.lgpd_requests
FOR EACH ROW
EXECUTE FUNCTION public.admin_lgpd_resposta_webhook();
