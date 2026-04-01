# Tarefas de Integração WABA (Conexões Meta)

- [x] **1. Fundação DDL (Banco de Dados)**
  - [x] Criar Script SQL para renomear `app_settings` para `admin_settings`.
  - [x] Adicionar colunas `meta_api_token` e `admin_commercial_phone_id` na `admin_settings`.
- [x] **2. Refatoração de Código Existente (Propostas/Contratos)**
  - [x] Buscar em todo o código e substituir requisições de `app_settings` por `admin_settings` para garantir que o fluxo de PDF de Contratos e Propostas não quebre.
- [x] **3. Painel de Backend Express (`api/server.js`)**
  - [x] Criar rota Express para `POST /meta/phone_numbers` (Cadastrar e linkar Delegacia).
  - [x] Criar rota Express para `GET /meta/status` (Checar display_name).
  - [x] Criar rota Express para `POST /meta/request_code` (Pedir OTP).
  - [x] Criar rota Express para `POST /meta/verify_code` (Verificar OTP).
- [x] **4. Nova Página no Frontend (`ConexoesPage.jsx`)**
  - [x] Criar o componente central `ConexoesPage.jsx`.
  - [x] Adicionar modal interativo de Nova Instância (onde o Admin escolhe a Delegacia antes de plugar).
  - [x] Criar Cards Estilo EvoAPI para as instâncias ativas, com botões dinâmicos de Setup OTP e Verificação.
- [ ] **5. Limpeza Final**
  - [ ] Atualizar o CRM local (`send-whatsapp-lead.js`) para ler os tokens vitais da tabela `admin_settings` e testar.
