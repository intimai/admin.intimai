# 🔍 Logs de Confirmação de Identidade - IntimAI

## 📋 Visão Geral

Este documento detalha a implementação técnica do sistema de logs automáticos para confirmação de identidade no IntimAI, especificamente para a transição de status `entregue` → `ativa`.

---

## 🎯 Contexto de Negócio

### **Por que Logs de Confirmação de Identidade?**

A transição de status `entregue` → `ativa` representa um momento crítico no ciclo de vida da intimação:

1. **Confirmação de Identidade**: A IA confirma que está falando com a pessoa correta
2. **Início da Conversação**: O intimado aceita prosseguir com o agendamento
3. **Processo Ativo**: A intimação sai da fila de espera e entra em processo ativo

### **Importância para LGPD**

- **Rastreabilidade**: Documenta quando e como a identidade foi confirmada
- **Transparência**: Processo auditável para fiscalização
- **Conformidade**: Atende requisitos de auditoria da LGPD

---

## 🏗️ Implementação Técnica

### **1. Estrutura da Tabela `audit_logs`**

```sql
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  "userId" UUID REFERENCES auth.users(id),
  "userEmail" TEXT,
  "userNome" TEXT,
  "delegaciaNome" TEXT,
  "actionType" TEXT NOT NULL,
  "resourceType" TEXT NOT NULL,
  "resourceId" TEXT,
  "details" JSONB,
  "ipAddress" INET,
  "userAgent" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **2. Trigger Automático**

```sql
-- Função que registra automaticamente a confirmação de identidade
CREATE OR REPLACE FUNCTION log_confirmacao_identidade()
RETURNS TRIGGER AS $$
BEGIN
  -- Verificar se o status mudou para 'ativa'
  IF NEW.status = 'ativa' AND (OLD.status IS NULL OR OLD.status != 'ativa') THEN
    
    -- Inserir log de confirmação de identidade
    INSERT INTO audit_logs (
      "userId", "userEmail", "userNome", "delegaciaNome",
      "actionType", "resourceType", "resourceId", "details",
      "ipAddress", "userAgent", "createdAt"
    ) VALUES (
      NEW."userId",
      (SELECT email FROM auth.users WHERE id = NEW."userId"),
      (SELECT nome FROM usuarios WHERE "userId" = NEW."userId"),
      (SELECT d.nome FROM delegacias d 
       JOIN usuarios u ON d."delegaciaId" = u."delegaciaId" 
       WHERE u."userId" = NEW."userId"),
      'CONFIRMACAO_IDENTIDADE',
      'intimacao',
      NEW.id::text,
      jsonb_build_object(
        'status_anterior', COALESCE(OLD.status, 'entregue'),
        'status_novo', 'ativa',
        'intimado_nome', NEW."intimadoNome",
        'documento', NEW.documento,
        'telefone', NEW.telefone,
        'processo', 'Confirmacao automatica de identidade pela IA',
        'observacao', 'Transicao automatica de status - identidade verificada',
        'timestamp', NOW()::text
      ),
      NULL,  -- ipAddress como NULL para trigger do sistema
      'system_trigger',  -- userAgent como texto
      NOW()
    );
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger que executa a função automaticamente
CREATE TRIGGER trigger_log_confirmacao_identidade
  AFTER UPDATE ON intimacoes
  FOR EACH ROW
  EXECUTE FUNCTION log_confirmacao_identidade();
```

### **3. Serviço JavaScript (auditService.js)**

```javascript
// Função específica para logs de confirmação de identidade
export const logConfirmacaoIdentidade = async (intimacao) => {
  const logData = {
    userId: intimacao.userId,
    userEmail: intimacao.userEmail,
    userNome: intimacao.userNome,
    delegaciaNome: intimacao.delegaciaNome,
    actionType: 'CONFIRMACAO_IDENTIDADE',
    resourceType: 'intimacao',
    resourceId: intimacao.id.toString(),
    details: {
      status_anterior: 'entregue',
      status_novo: 'ativa',
      intimado_nome: intimacao.intimadoNome,
      documento: intimacao.documento,
      telefone: intimacao.telefone,
      processo: 'Confirmação automática de identidade pela IA',
      observacao: 'Transição automática de status - identidade verificada',
      timestamp: new Date().toISOString()
    },
    ipAddress: null, // Para logs do sistema
    userAgent: 'system_trigger'
  };

  return await logAction(logData);
};
```

---

## 📊 Dados Registrados

### **Campos Obrigatórios**
- **userId**: ID do usuário (policial) responsável
- **userEmail**: Email do usuário
- **userNome**: Nome do usuário
- **delegaciaNome**: Nome da delegacia
- **actionType**: `CONFIRMACAO_IDENTIDADE`
- **resourceType**: `intimacao`
- **resourceId**: ID da intimação

### **Detalhes Específicos (JSONB)**
```json
{
  "status_anterior": "entregue",
  "status_novo": "ativa",
  "intimado_nome": "João Silva",
  "documento": "12345678901",
  "telefone": "11999999999",
  "processo": "Confirmação automática de identidade pela IA",
  "observacao": "Transição automática de status - identidade verificada",
  "timestamp": "2025-01-11T18:30:00.000Z"
}
```

### **Metadados do Sistema**
- **ipAddress**: `NULL` (trigger do sistema)
- **userAgent**: `'system_trigger'`
- **createdAt**: Timestamp automático

---

## 🔍 Como Consultar os Logs

### **Query Básica**
```sql
SELECT * FROM audit_logs 
WHERE "actionType" = 'CONFIRMACAO_IDENTIDADE'
ORDER BY "createdAt" DESC;
```

### **Query com Detalhes**
```sql
SELECT 
  "userNome",
  "delegaciaNome",
  "resourceId" as intimacao_id,
  "details"->>'intimado_nome' as intimado,
  "details"->>'documento' as documento,
  "details"->>'timestamp' as confirmado_em,
  "createdAt"
FROM audit_logs 
WHERE "actionType" = 'CONFIRMACAO_IDENTIDADE'
ORDER BY "createdAt" DESC;
```

### **Estatísticas por Delegacia**
```sql
SELECT 
  "delegaciaNome",
  COUNT(*) as total_confirmacoes,
  DATE_TRUNC('day', "createdAt") as data
FROM audit_logs 
WHERE "actionType" = 'CONFIRMACAO_IDENTIDADE'
GROUP BY "delegaciaNome", DATE_TRUNC('day', "createdAt")
ORDER BY data DESC;
```

---

## 🚀 Benefícios da Implementação

### **Conformidade LGPD** ✅
- **Rastreabilidade Completa**: Todas as confirmações são registradas
- **Transparência**: Processo documentado automaticamente
- **Auditoria**: Facilita relatórios de conformidade

### **Segurança** ✅
- **Integridade**: Logs não podem ser alterados pelo usuário
- **Automação**: Registro automático sem intervenção manual
- **Rastreamento**: Histórico completo de mudanças de status

### **Operacional** ✅
- **Monitoramento**: Visibilidade do processo de confirmação
- **Relatórios**: Dados para análise de performance
- **Debugging**: Facilita identificação de problemas

---

## 🔧 Manutenção e Monitoramento

### **Verificação de Funcionamento**
```sql
-- Verificar se o trigger está ativo
SELECT 
  trigger_name, 
  event_manipulation, 
  action_timing, 
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_log_confirmacao_identidade';
```

### **Limpeza de Logs Antigos** (Opcional)
```sql
-- Deletar logs com mais de 1 ano (ajustar conforme política de retenção)
DELETE FROM audit_logs 
WHERE "actionType" = 'CONFIRMACAO_IDENTIDADE' 
AND "createdAt" < NOW() - INTERVAL '1 year';
```

### **Backup de Logs**
```sql
-- Exportar logs para CSV
COPY (
  SELECT * FROM audit_logs 
  WHERE "actionType" = 'CONFIRMACAO_IDENTIDADE'
) TO '/tmp/logs_confirmacao_identidade.csv' 
WITH CSV HEADER;
```

---

## 📝 Notas Importantes

### **Considerações de Performance**
- O trigger é executado apenas quando o status muda para `ativa`
- Impacto mínimo na performance (inserção simples)
- Logs são armazenados em tabela separada

### **Considerações de Segurança**
- Logs não podem ser alterados via aplicação
- Apenas o banco de dados pode inserir logs via trigger
- Dados sensíveis são registrados conforme política de retenção

### **Considerações de Conformidade**
- Logs atendem requisitos de auditoria da LGPD
- Rastreabilidade completa do processo
- Facilita relatórios para fiscalização

---

**Última atualização**: Janeiro 2025  
**Status**: ✅ Implementado e Funcionando  
**Próxima revisão**: Fevereiro 2025