# Arquitetura de Envio do Chat: Pipeline vs Meta API

Você fez as perguntas perfeitas de quem está pensando como Arquiteta de Software. 
Tirar as mensagens do papel do "Kanban" e mandar para o WhatsApp Real levanta grandes questões de segurança estrutural. Vou responder diretamente às suas dúvidas e formular nosso plano de ação.

## 1. Como a mensagem deve ser disparada? (Frontend vs Banco)

> **ATENÇÃO: Nunca dispare a mensagem pelo Aplicativo (React/Frontend)** diretamente para a API Oficial da Meta. 
> Se o envio for feito no frontend, seu *Token Mestre da Meta* (Access Token) ficaria exposto no navegador, permitindo que qualquer pessoa roubasse o token e enviasse mensagens no seu nome (Spam). Além disso, os bloqueios de segurança do navegador (CORS) te dariam muita dor de cabeça.

**A Minha Sugestão Definitiva (A Mais Segura): Disparo via Banco de Dados.**
A arquitetura campeã funciona assim:
1. O seu Painel Admin do IntimAI apenas salva a mensagem na tabela `chat_admin`. 
2. A própria tabela `chat_admin` possui um *Trigger Local do Banco* (Gatilho SQL idêntico ao que fizemos para o Suporte cair no n8n).
3. Quando essa nova linha de mensagem cai no Supabase com a Origem sendo `"Admin"`, o Supabase bate de forma "invisível e segura" em um endpoint de envio para despachar pro WhatsApp.

**Quem é esse Endpoint oculto?**
Temos duas opções aqui, e *você decide*:
- **(Opção A) Usar seu N8N Atual:** A gente cria um gatilho no Supabase que avisa o N8N: *"Ei, mensagem nova pros Leads no chat_admin"*. O N8N pega ela e manda pro Zap usando o request que ele já domina no fluxo.
- **(Opção B) Código Puro (Nativo da API):** Se já quiser testar o projeto de "migrar pro código", eu construo um serviço de disparo em Node.js (que o seu servidor `api/` na porta 3001 já tem capacidade de rodar) que lê o banco, pega o Token e dispara pra Meta usando código TypeScript Serverless (Livrando-se do N8N na área comercial).

## 2. Precisamos construir o Menu "Conexões" Primeiro?

**A resposta é: Não precisamos para a Pipeline, mas precisaremos no futuro para as Delegacias.**

Vamos raciocinar: A Pipeline (CRM) lida com **Leads**, ou seja, clientes que querem comprar o sistema IntimAI. Eles estão conversando com o **seu número comercial do IntimAI**, e não com o número de uma Delegacia em São Paulo ou Rio.
Isso quer dizer que, para o Chat da Pipeline funcionar, nós precisamos apenas de 1 Token e 1 Phone Number ID (Os dados mestre comercial da IntimAI). 

Neste momento, nós podemos colocar esses dados fixos nas *Variáveis de Ambiente* do servidor `.env` (Segredo), e focar com agilidade na construção do Chat em si do Kanban. 
Quando fomos intervir na operação final (no chat de um *Intimado* real), aí sim usaremos a página de **Conexões**, porque o aplicativo precisará olhar para a tabela `delegacias`, puxar o token específico daquela delegacia e fingir ser o robô daquela polícia para intervir.

---

## Plano de Ação Sugerido

Dada essa tese, eis a rota ideal para implementarmos na Sprint atual da Pipeline:

### Fase 1: Interface (UI)
- Mudar `PipelinePage.jsx`. Implementar o modal do Chat consumindo a sua nova tabela `chat_admin`.

### Fase 2: Banco de Dados e Gatilhos
- Eu te passo um código SQL que você rodará no Supabase para criarmos um Trigger de Webhook ligado à tabela `chat_admin` quando a origem for Admin.

### Fase 3: O Envio Concreto (Disparo)
- Integramos o endpoint de envio oficial, utilizando as credenciais comerciais da IntimAI (passadas via Variáveis de Ambiente).

---

## DECISÕES QUE VOCÊ PRECISA TOMAR:

**1. Sobre a tabela `chat_admin` que você duplicou:**
Como no Kanban nós temos um "Lead" e não um Ticket de Suporte, a coluna de vínculo da tabela `chat_admin` se chama **`lead_id`**? E como você duplicou a tabela, você manteve o formato `Uma mensagem por linha` (linha tem origem, mensagem, data) ou adaptou para JSON?

**2. Sobre o Disparo (Opção A ou B):**
Você prefere que esse recado novo do chat de Leads passe pelo seu **N8N** via Webhook do Banco e ele envia pra Meta (Opção A) ou quer que eu escreva o **código Node.js/Express** na porta 3001 para que nossa própria API cuide do Comercial se livrando do N8N aqui (Opção B)?
