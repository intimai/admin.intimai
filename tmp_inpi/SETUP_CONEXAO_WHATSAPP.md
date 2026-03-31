# Setup da Conexão com WhatsApp

## Pré-requisitos

1. Supabase CLI instalado
2. Conta Evolution API configurada
3. Credenciais do Supabase configuradas no `.env`

## Passo 1: Deploy da Edge Function

Execute no terminal:

```bash
npx supabase functions deploy manage-evolution-instance
```

## Passo 2: Configurar Variáveis de Ambiente no Supabase

Acesse o painel do Supabase:
1. Vá em **Settings** → **Edge Functions**
2. Adicione a variável de ambiente:
   - `EVOLUTION_URL`: URL da sua API Evolution (ex: `https://sua-evolution-api.com`)

Ou via CLI:

```bash
npx supabase secrets set EVOLUTION_URL=https://sua-evolution-api.com
```

## Passo 3: Configurar a Tabela `delegacias`

A tabela `delegacias` precisa ter os seguintes campos para cada delegacia:

- `evoAPI`: API Key da Evolution API para essa delegacia
- `evoInstancia`: Nome da instância na Evolution API
- `connection_status`: Status da conexão (será atualizado automaticamente)

Exemplo de SQL para adicionar os campos (se não existirem):

```sql
ALTER TABLE delegacias 
ADD COLUMN IF NOT EXISTS evoAPI TEXT,
ADD COLUMN IF NOT EXISTS evoInstancia TEXT,
ADD COLUMN IF NOT EXISTS connection_status TEXT DEFAULT 'disconnected';
```

## Passo 4: Configurar os Dados da Delegacia

Atualize os dados da delegacia do usuário logado:

```sql
UPDATE delegacias 
SET 
  evoAPI = 'sua-api-key-evolution',
  evoInstancia = 'nome-da-instancia'
WHERE delegaciaId = 'id-da-delegacia';
```

## Passo 5: Testar a Conexão

1. Faça login no app
2. Acesse a página "Conexão com o WhatsApp"
3. Clique em "Conectar"
4. Escaneie o QR Code com o WhatsApp da delegacia

## Troubleshooting

### Erro: "supabaseUrl is required"
- Verifique se o arquivo `.env` está configurado corretamente
- Reinicie o servidor de desenvolvimento

### Erro: "Configuração da instância incompleta"
- Verifique se os campos `evoAPI` e `evoInstancia` estão preenchidos na tabela `delegacias`

### Erro: "Erro de Rede ao conectar com a Evolution API"
- Verifique se a `EVOLUTION_URL` está correta
- Verifique se a Evolution API está acessível

### Status travado em "Verificando status da conexão..."
- Verifique se a Edge Function foi deployada
- Verifique os logs da Edge Function no painel do Supabase
- Verifique se as variáveis de ambiente estão configuradas
