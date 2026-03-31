# Ecossistema IntimAI: Arquitetura e Fluxos de Mensageria

Este documento mapeia o estado atual e a visão futura da arquitetura do IntimAI. O objetivo é garantir um alinhamento claro entre o Banco de Dados (Supabase), o Motor de Automação (N8N) e a API Oficial do WhatsApp (Meta), delimitando as responsabilidades de cada frente e norteando o desenvolvimento seguro do Painel Admin.

## 1. O Fluxo Principal (Core App - Intimados)
O coração do IntimAI é o fluxo operacional de intimações, estruturado de forma robusta e altamente multitenant (uma única estrutura base atendendo múltiplas delegacias de forma isolada).

### Arquitetura do Fluxo N8N (Status Baseado):
1. **Webhook de Entrada:** O N8N recebe o *payload* da Meta API sempre que um intimado envia mensagem para o WhatsApp Oficial de alguma delegacia.
2. **Identificação Multitenant:** O sistema lê o `phone_number_id` (ID do número que recebeu a mensagem) para saber de qual delegacia o cliente está falando.
3. **Busca de Contexto e Roteamento:**
   - Consulta se há uma intimação ativa vinculada àquele número de remetente.
   - Puxa a "última intimação".
   - Avalia o `status` atual dessa intimação.
   - **Roteamento Dinâmico:** Direciona para o subfluxo correspondente (ex: Template Inicial de disparo, Nó de HTTP genérico, ou direcionamento para a Inteligência Artificial para negociação de agendamento de depoimento).
4. **Enriquecimento:** Consulta variáveis do usuário e da delegacia (cujo ID foi obtido através da intimação) para preenchimento humanizado dos textos.
5. **Envio (Outbound):** Retorna a mensagem ao intimado via chamada HTTP Request na Meta API usando o `phone_number_id` da respectiva delegacia.

### Armazenamento de Chat Operacional (A Intocável)
Existe uma tabela principal de `chat` no Supabase que registra fidedignamente o diálogo entre o Intimado e a IA.
> **DECISÃO ARQUITETURAL:** Como o sistema principal entrará em testes práticos, esta tabela e o fluxo Core do N8N associado a ela **NÃO SERÃO MODIFICADOS** pelo Painel Admin. O Admin atuará apenas como "leitor" desse chat (Monitoramento).

---

## 2. Visão vs. Código: O Papel do N8N
Respondendo a dúvida estratégica sobre "migrar o N8N para código":
O N8N não precisa (e neste momento, não deve) ser substituído por código no fluxo de Intimados. O sistema de roteamento visual do N8N é extremamente poderoso para lidar com árvores de decisão por `status`, retentativas de falha de API, parsing de webhooks complexos e injeção de IA. Codificar tudo isso em Node.js exigiria centenas de horas e uma infraestrutura pesada.

**Onde o "código" (Painel Admin) brilha?**
O Painel Admin não substitui o maquinário do N8N, ele é a "camada de gestão visual" humana por cima das tabelas que o N8N alimenta, além de ser o CRM oficial da "Startup IntimAI" (e não das delegacias).

---

## 3. A Comunicação Administrativa (As dores do Painel Admin)
Resolvido e isolado o Core App, as atenções do Admin se voltam para 2 pilares paralelos e totalmente separados da operação fim:

### A) Menu de Suporte (Helpdesk B2B)
**Público:** Delegados, Escrivães e Gestores (Os usuários do sistema principal).
**Estrutura Definida:**
- Faremos uma **Solução Híbrida/In-App**.
- Não colocaremos a complexidade de enviar o Suporte via WhatsApp agora. As respostas dadas pelo administrador no quadro Kanban vão alimentar uma estrutura no banco e ser **exibidas diretamente no Front-end do Menu de Suporte do Usuário** no sistema principal.
- Será criada uma tabela `suporte_historico` (ou equivalente leve) ligada à tabela `suporte` atual, permitindo que a conversa aconteça assincronamente como um chat dentro da própria aplicação WEB.

### B) Pipeline de Vendas (CRM do IntimAI)
**Público:** Novos contatos comerciais, prefeituras, órgãos querendo contratar o IntimAI.
**Estrutura Definida:**
- O setor comercial da IntimAI usará aaba "Pipeline" como ferramenta de *Human Handoff*.
- O número de WhatsApp comercial da IntimAI não se confunde com os números das delegacias.
- Teremos uma tabela `admin_chats` (isolada). 
- Aqui sim, se a IA (N8N) não der conta de converter o lead ou o Vendedor quiser intervir, o painel poderá enviar mensagens (através de um webhook pro próprio N8N ou via disparo direto da Meta API) para interagir diretamente do Kanban.
