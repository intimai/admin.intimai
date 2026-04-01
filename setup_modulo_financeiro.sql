-- ==========================================
-- SCRIPT DE CRIAÇÃO DO MÓDULO FINANCEIRO (FIXED)
-- ==========================================

-- 1. Tabela de Faturas (Contas a Receber)
CREATE TABLE IF NOT EXISTS public.fat_faturas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "delegaciaId" INTEGER NOT NULL REFERENCES public.delegacias("delegaciaId") ON DELETE CASCADE,
    referencia_mes_ano VARCHAR(7), -- Ex: '10/2026' para facilitar buscas
    valor NUMERIC(10, 2) NOT NULL,
    data_vencimento DATE NOT NULL,
    status_pagamento VARCHAR(20) DEFAULT 'PENDENTE' CHECK (status_pagamento IN ('PENDENTE', 'PAGO', 'ATRASADO', 'CANCELADO', 'FALHOU')),
    data_pagamento DATE,
    link_efi VARCHAR(255),
    txid VARCHAR(255), -- ID da transação no gateway Efí
    pix_copia_cola TEXT,
    observacoes TEXT,
    "criadoEm" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "atualizadoEm" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices de performance para relatórios
CREATE INDEX IF NOT EXISTS idx_fat_faturas_delegacia ON public.fat_faturas("delegaciaId");
CREATE INDEX IF NOT EXISTS idx_fat_faturas_status ON public.fat_faturas(status_pagamento);
CREATE INDEX IF NOT EXISTS idx_fat_faturas_vencimento ON public.fat_faturas(data_vencimento);

-- 2. Tabela de Despesas (Contas a Pagar e Custos Variáveis)
CREATE TABLE IF NOT EXISTS public.fat_despesas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tipo_despesa VARCHAR(20) NOT NULL CHECK (tipo_despesa IN ('FIXA', 'VARIAVEL')),
    categoria VARCHAR(50) NOT NULL, -- Ex: 'API', 'AWS', 'Salarios'
    fornecedor VARCHAR(100) NOT NULL,
    valor NUMERIC(10, 2) NOT NULL,
    data_vencimento DATE NOT NULL,
    status_pagamento VARCHAR(20) DEFAULT 'PENDENTE' CHECK (status_pagamento IN ('PENDENTE', 'PAGO', 'ATRASADO')),
    data_pagamento DATE,
    "delegaciaIdReference" INTEGER REFERENCES public.delegacias("delegaciaId") ON DELETE SET NULL, -- Para cruzar custo de IA com a delegacia
    referencia_mes_ano VARCHAR(7),
    observacoes TEXT,
    "criadoEm" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "atualizadoEm" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_fat_despesas_delegacia ON public.fat_despesas("delegaciaIdReference");
CREATE INDEX IF NOT EXISTS idx_fat_despesas_vencimento ON public.fat_despesas(data_vencimento);

-- 3. Tabela de Logs do Gateway (Auditoria invisível)
CREATE TABLE IF NOT EXISTS public.fat_gateway_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    evento VARCHAR(100) NOT NULL,
    txid VARCHAR(255),
    payload JSONB NOT NULL,
    processado BOOLEAN DEFAULT false,
    "criadoEm" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Gatilhos de Atualização Automática (atualizadoEm)
CREATE OR REPLACE FUNCTION set_atualizadoEm()
RETURNS TRIGGER AS $$
BEGIN
   NEW."atualizadoEm" = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_fat_faturas_modtime
BEFORE UPDATE ON public.fat_faturas
FOR EACH ROW EXECUTE PROCEDURE set_atualizadoEm();

CREATE TRIGGER update_fat_despesas_modtime
BEFORE UPDATE ON public.fat_despesas
FOR EACH ROW EXECUTE PROCEDURE set_atualizadoEm();

-- 5. RLS (Role Level Security) - Proteção de Dados
ALTER TABLE public.fat_faturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fat_despesas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fat_gateway_logs ENABLE ROW LEVEL SECURITY;

-- Políticas temporárias permitindo total acesso
CREATE POLICY "Permitir leitura total para faturas autorizadas" ON public.fat_faturas FOR ALL USING (true);
CREATE POLICY "Permitir leitura total para despesas autorizadas" ON public.fat_despesas FOR ALL USING (true);
CREATE POLICY "Permitir escrita para logs" ON public.fat_gateway_logs FOR ALL USING (true);
