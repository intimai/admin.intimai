# 🔐 CONFIGURAÇÃO DE CRIPTOGRAFIA - INSTRUÇÕES

## **📋 RESUMO DO QUE FOI IMPLEMENTADO:**

### **✅ ARQUIVOS CRIADOS/MODIFICADOS:**
1. **`supabase/functions/handle-webhook/index.ts`** - Edge Function com criptografia
2. **`supabase/functions/encrypt-existing-data/index.ts`** - Script para criptografar dados existentes
3. **`src/lib/encryptionService.js`** - Serviço de criptografia para frontend
4. **`src/hooks/useIntimacoes.js`** - Hook modificado para criptografar dados

### **🔧 FUNCIONALIDADES:**
- **Criptografia AES-256-GCM** para CPF, telefone, endereço e documento
- **Descriptografia automática** na Edge Function antes de enviar para N8N
- **Compatibilidade total** com sistema atual
- **Fallback seguro** - se criptografia falhar, mantém dados originais

---

## **⚙️ CONFIGURAÇÃO NECESSÁRIA:**

### **1. VARIÁVEIS DE AMBIENTE NO SUPABASE:**

**No painel do Supabase > Settings > Edge Functions > Environment Variables:**

```bash
# Chave de criptografia (32 caracteres)
ENCRYPTION_KEY=sua_chave_secreta_de_32_chars_aqui

# URLs dos webhooks (já existentes)
WEBHOOK_CRIACAO_URL=https://seu-n8n.com/webhook/criacao
WEBHOOK_REATIVACAO_URL=https://seu-n8n.com/webhook/reativacao
WEBHOOK_CANCELAMENTO_URL=https://seu-n8n.com/webhook/cancelamento
WEBHOOK_SUPORTE_URL=https://seu-n8n.com/webhook/suporte
WEBHOOK_LGPD_URL=https://seu-n8n.com/webhook/lgpd
```

### **2. VARIÁVEL DE AMBIENTE NO FRONTEND:**

**No arquivo `.env.local` (criar se não existir):**

```bash
# Mesma chave usada no Supabase
VITE_ENCRYPTION_KEY=sua_chave_secreta_de_32_chars_aqui
```

### **3. GERAR CHAVE DE CRIPTOGRAFIA:**

**Use este comando para gerar uma chave segura:**

```bash
# No terminal do seu projeto
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Ou use este site:** https://generate-secret.vercel.app/32

---

## **🚀 PROCESSO DE IMPLEMENTAÇÃO:**

### **PASSO 1: CONFIGURAR VARIÁVEIS**
1. **Gerar chave** de criptografia (32 caracteres)
2. **Adicionar** `ENCRYPTION_KEY` no Supabase
3. **Adicionar** `VITE_ENCRYPTION_KEY` no `.env.local`
4. **Reiniciar** o servidor de desenvolvimento

### **PASSO 2: FAZER DEPLOY DA EDGE FUNCTION**
```bash
# No terminal do projeto
npx supabase functions deploy handle-webhook
npx supabase functions deploy encrypt-existing-data
```

### **PASSO 3: CRIPTOGRAFAR DADOS EXISTENTES**
```bash
# Chamar a função para criptografar dados existentes
curl -X POST https://seu-projeto.supabase.co/functions/v1/encrypt-existing-data \
  -H "Authorization: Bearer SEU_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json"
```

### **PASSO 4: TESTAR SISTEMA**
1. **Criar nova intimação** - deve ser criptografada
2. **Verificar webhook** - N8N deve receber dados descriptografados
3. **Verificar banco** - dados devem estar criptografados

---

## **🔍 COMO VERIFICAR SE ESTÁ FUNCIONANDO:**

### **1. VERIFICAR NO BANCO:**
```sql
-- Dados devem aparecer criptografados (base64)
SELECT cpf, telefone, endereco FROM intimacoes LIMIT 1;
```

### **2. VERIFICAR NO N8N:**
- **Webhook deve receber** dados descriptografados normalmente
- **CPF, telefone, endereço** devem aparecer legíveis

### **3. VERIFICAR LOGS:**
- **Edge Function** deve mostrar "🔓 Dados descriptografados para N8N"
- **Frontend** deve funcionar normalmente

---

## **⚠️ IMPORTANTE:**

### **SEGURANÇA:**
- **NUNCA** compartilhe a chave de criptografia
- **MANTENHA** backup da chave em local seguro
- **TESTE** em ambiente de desenvolvimento primeiro

### **COMPATIBILIDADE:**
- **Sistema atual** continua funcionando
- **N8N** recebe dados normalmente
- **Fallback** mantém dados originais se houver erro

### **MANUTENÇÃO:**
- **Dados existentes** precisam ser criptografados uma vez
- **Novos dados** são criptografados automaticamente
- **Chave** pode ser alterada (requer re-criptografia)

---

## **🆘 EM CASO DE PROBLEMAS:**

### **1. DADOS NÃO CRIPTOGRAFADOS:**
- Verificar se `VITE_ENCRYPTION_KEY` está configurada
- Verificar se `ENCRYPTION_KEY` está no Supabase
- Reiniciar servidor de desenvolvimento

### **2. N8N NÃO RECEBE DADOS:**
- Verificar logs da Edge Function
- Verificar se webhook URLs estão corretas
- Testar webhook manualmente

### **3. ERRO DE CRIPTOGRAFIA:**
- Verificar se chaves são idênticas
- Verificar se chave tem 32 caracteres
- Verificar logs do console

**Precisa de ajuda com algum passo?** 🤔
