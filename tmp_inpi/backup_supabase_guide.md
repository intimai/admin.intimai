# 🗄️ GUIA COMPLETO DE BACKUP - SUPABASE

## 📋 **RESUMO EXECUTIVO**

O Supabase oferece **backup automático** e **manual**, mas você precisa configurar corretamente para garantir a segurança dos dados do IntimAI.

---

## 🔄 **BACKUP AUTOMÁTICO (JÁ INCLUÍDO)**

### **✅ O que está incluído:**
- **Backup diário automático** (retido por 7 dias)
- **Point-in-time recovery** (PITR) disponível
- **Backup contínuo** em tempo real
- **Replicação geográfica** (se configurado)

### **📊 Detalhes técnicos:**
- **Frequência:** Diária às 02:00 UTC
- **Retenção:** 7 dias (gratuito) / 30 dias (Pro)
- **Formato:** PostgreSQL dump + WAL logs
- **Localização:** Região primária do projeto

---

## 🛠️ **BACKUP MANUAL (RECOMENDADO PARA PILOTO)**

### **1. BACKUP VIA DASHBOARD:**
```
1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em: Settings > Database > Backups
4. Clique em: "Create backup now"
5. Aguarde a conclusão (2-5 minutos)
6. Download do arquivo .sql
```

### **2. BACKUP VIA CLI (Avançado):**
```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Fazer backup
supabase db dump --file backup_intimai_$(date +%Y%m%d).sql
```

### **3. BACKUP VIA API (Automático):**
```javascript
// Script para backup automático via API
const backupDatabase = async () => {
  const response = await fetch('https://api.supabase.com/v1/projects/{project-id}/backups', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });
  
  return response.json();
};
```

---

## 🔐 **CONFIGURAÇÕES DE SEGURANÇA**

### **✅ RLS (Row Level Security):**
```sql
-- Verificar se RLS está habilitado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Exemplo de política RLS para intimacoes
CREATE POLICY "Users can only see their own intimacoes" 
ON intimacoes FOR SELECT 
USING (auth.uid() = user_id);
```

### **✅ Criptografia:**
- **Dados em trânsito:** HTTPS/TLS 1.3
- **Dados em repouso:** AES-256
- **Backup:** Criptografado automaticamente
- **Chaves:** Gerenciadas pelo Supabase

---

## 📊 **MONITORAMENTO DE BACKUP**

### **1. Verificar Status:**
```sql
-- Verificar último backup
SELECT 
    backup_id,
    created_at,
    status,
    size_bytes
FROM pg_stat_archiver 
ORDER BY created_at DESC 
LIMIT 5;
```

### **2. Alertas de Backup:**
- **Email automático** se backup falhar
- **Dashboard** mostra status em tempo real
- **Logs** detalhados de cada operação

---

## 🚨 **PLANO DE RECUPERAÇÃO DE DESASTRES**

### **Cenário 1: Falha de Hardware**
1. **Detecção automática** pelo Supabase
2. **Failover** para réplica (se configurado)
3. **Recuperação** via backup mais recente
4. **Tempo de recuperação:** 5-15 minutos

### **Cenário 2: Corrupção de Dados**
1. **Point-in-time recovery** para antes da corrupção
2. **Restauração** de backup específico
3. **Validação** de integridade dos dados
4. **Tempo de recuperação:** 30-60 minutos

### **Cenário 3: Exclusão Acidental**
1. **Recuperação** do backup mais recente
2. **Restauração** de tabelas específicas
3. **Validação** de dados críticos
4. **Tempo de recuperação:** 15-30 minutos

---

## 💰 **CUSTOS DE BACKUP**

### **Gratuito (Atual):**
- **7 dias** de retenção
- **Backup diário** automático
- **1GB** de armazenamento

### **Pro ($25/mês):**
- **30 dias** de retenção
- **Backup contínuo** em tempo real
- **100GB** de armazenamento
- **Replicação geográfica**

---

## 🎯 **RECOMENDAÇÕES PARA O PILOTO**

### **✅ ANTES DO PILOTO:**
1. **Fazer backup manual** completo
2. **Testar restauração** em ambiente de teste
3. **Configurar alertas** de backup
4. **Documentar** processo de recuperação

### **✅ DURANTE O PILOTO:**
1. **Backup semanal** manual
2. **Monitorar** logs de backup
3. **Verificar** integridade dos dados
4. **Documentar** incidentes

### **✅ APÓS O PILOTO:**
1. **Avaliar** necessidade de upgrade
2. **Implementar** backup automatizado
3. **Treinar** equipe em recuperação
4. **Documentar** lições aprendidas

---

## 🔧 **COMANDOS ÚTEIS**

### **Verificar Status do Banco:**
```sql
-- Status geral
SELECT * FROM pg_stat_database WHERE datname = current_database();

-- Tamanho do banco
SELECT pg_size_pretty(pg_database_size(current_database()));

-- Últimas atividades
SELECT * FROM pg_stat_activity WHERE datname = current_database();
```

### **Verificar Integridade:**
```sql
-- Verificar tabelas
SELECT schemaname, tablename, n_tup_ins, n_tup_upd, n_tup_del 
FROM pg_stat_user_tables 
ORDER BY n_tup_ins DESC;

-- Verificar índices
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read 
FROM pg_stat_user_indexes 
ORDER BY idx_scan DESC;
```

---

## 📞 **SUPORTE E CONTATOS**

- **Documentação:** https://supabase.com/docs/guides/backups
- **Suporte:** https://supabase.com/support
- **Status:** https://status.supabase.com
- **Comunidade:** https://github.com/supabase/supabase/discussions

---

## ✅ **CHECKLIST FINAL**

- [ ] Backup manual feito antes do piloto
- [ ] RLS verificado e funcionando
- [ ] Alertas de backup configurados
- [ ] Processo de recuperação testado
- [ ] Equipe treinada em procedimentos
- [ ] Documentação atualizada
- [ ] Monitoramento ativo configurado

**🎉 Seu sistema está pronto para o piloto com segurança máxima!**
