-- Script para preparar ambiente de teste do fluxo de email

-- 1. Adicionar domínio intimai.app na tabela estados_dominios
-- Primeiro, vamos encontrar o ID de um estado (ex: Acre ou criar um de teste)
INSERT INTO public.estados_dominios (nome, dominio)
VALUES ('Teste Unificado', 'intimai.app')
ON CONFLICT (dominio) DO UPDATE SET nome = EXCLUDED.nome;

-- 2. Adicionar uma delegacia de teste vinculada a este domínio
-- Vamos assumir que a tabela delegacias tem uma coluna estado_id que referencia estados_dominios(id)
-- Ou que referencia pelo nome do estado. Vou usar uma subquery para garantir.

INSERT INTO public.delegacias (nome, endereco, cidadeEstado, delegadoResponsavel, estado_id)
SELECT 
    'Delegacia de Testes IntimAI', 
    'Rua Digital, 123', 
    'Nuvem/BR', 
    'Delegado Virtual',
    id
FROM public.estados_dominios 
WHERE dominio = 'intimai.app'
LIMIT 1;

-- 3. Instrução para os Templates (apenas referência, o conteúdo deve ser copiado do arquivo correspondente)
-- Os templates HTML premium devem ser copiados de:
-- c:\Users\lukas\Desktop\INTIMA AI\intimai.app\configurar_templates_email_supabase.sql
-- E aplicados via Dashboard ou Console SQL.
