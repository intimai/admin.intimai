-- Tabela de Logs de Erros de Automação (N8n) adaptada as variaveis reais
CREATE TABLE public.logs_erro_ia (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    id_execucao BIGINT,            -- id da execução no n8n (para você colar lá e achar)
    id_workflow TEXT,              -- id do workflow
    nome_workflow TEXT,            -- nome da automação que falhou
    modo TEXT,                     -- trigger/manual/webhook
    empresa TEXT,                  -- tag extraída
    tempo_execucao TEXT,           -- duração
    mensagem_erro TEXT,            -- a causa técnica (ex: "Api rate limit")
    no_erratico TEXT,              -- "lastNodeExecuted"
    data_execucao TEXT,            -- timestamp enviado pelo n8n
    
    -- Controle Interno Admin
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolvido BOOLEAN DEFAULT FALSE,
    resolvido_em TIMESTAMP WITH TIME ZONE,
    resolvido_por UUID REFERENCES public.admin_colaboradores(id) ON DELETE SET NULL
);

-- Habilitando RLS para segurança
ALTER TABLE public.logs_erro_ia ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso
CREATE POLICY "Permitir leitura para administradores autenticados" 
ON public.logs_erro_ia FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Permitir atualização (resolver erro) para administradores" 
ON public.logs_erro_ia FOR UPDATE 
TO authenticated 
USING (true);

-- Permite que o Webhook do N8N insira sem estar autenticado no painel
CREATE POLICY "N8N pode inserir logs publicamente usando anon key" 
ON public.logs_erro_ia FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- Índices para melhor performance de leitura
CREATE INDEX idx_logs_erro_ia_resolvido ON public.logs_erro_ia(resolvido);
CREATE INDEX idx_logs_erro_ia_id_execucao ON public.logs_erro_ia(id_execucao);
