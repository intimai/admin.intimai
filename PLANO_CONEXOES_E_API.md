# Projeto de Infraestrutura: Conexões Meta e API Nativa

A sua escolha pela **Opção B (Código Puro Node.js)** e pela construção do **Menu Conexões** no Admin Panel significa que nós vamos passar o trator na complexidade. O seu Painel passará a ter sua própria inteligência de disparo oficial, sem depender do N8N na parte comercial, e abrirá as portas para o White Label das delegacias no futuro.

## O Que Faremos (Plano de Ação Arquitetural)

Para alcançarmos o "Estado da Arte", a implementação será dividida em 3 Pilares cruciais:

### Pilar 1: O Banco de Dados (Configurações e Chat)

Você criou um clone chamado `chat_admin`. Nós vamos adaptar ele um pouco com um script SQL que eu vou te mandar.
1. **Nova Tabela e SQL:**
   - Criarei a tabela `whatsapp_config` (que guardará o *Access Token*, *WABA ID* e *Phone ID* seguros).
   - Adaptarei a sua `chat_admin` incluindo a coluna `lead_id` (para plugar no seu kanban de Pipeline) em vez de relacionar por "intimações".

### Pilar 2: A Tela de Conexões (Configuração Mestra)

Implementarei a página **`ConexoesPage.jsx`**:
- Será um formulário limpo e seguro onde você (Admin) poderá cadastrar o seu Token Permanente da Meta e o ID do Número.
- Existirá o *Setup Comercial (IntimAI)* e, futuramente, o de *Delegacias*.
- Esses dados ficam blindados pelo Supabase RLS. Apenas nossa "API Oculta" e a sua conta Master logada conseguirão manipulá-los.

### Pilar 3: O Motor Híbrido (Backend Node.js)

Para garantirmos máxima segurança exigida (com foco na proteção do Token, que citei antes), o fluxo de disparo na sua Pipeline será este:
1. Você digita a mensagem pro Lead na Pipeline e clica em **Enviar**.
2. O React faz uma chamada oculta (POST) para o nosso próprio backend local na porta 3001: `/api/send-whatsapp`.
3. O nosso backend (`local-api.js`) localiza quem é o Lead no banco, busca o seu Token comercial isolado na tabela `whatsapp_config`, e ele mesmo despacha a mensagem de texto pra Meta.
4. **Se a Meta responder "Enviado com sucesso"**, o nosso Node.js insere a mensagem na tabela `chat_admin` de forma automática. 

> **ATENÇÃO:** Essa é a "Prática das Gigantes". O aplicativo que está no navegador não faz o serviço sujo. O front-end pede ao back-end, o back-end executa a ação de risco, grava a auditoria (chat) no banco, e diz pro app no navegador: "Foi tudo um sucesso!".

---

## DECISÕES QUE VOCÊ PRECISA TOMAR:

Precisamos da sua "Canetada de Arquiteta" nas seguintes aprovações do fluxo proposto:

1. **A Ordem de Desenvolvimento:** Podemos começar criando o script de Banco de Dados + Tela de Conexões (onde você vai plugar seu Token via tela), e logo depois criar a Rota de API do Servidor + Modal de Chat na Pipeline?
2. **As Variáveis da Meta:** Atualmente você tem acesso tranquilo ao seu App (Dashboard da Meta Developers) para pegar os 3 pilares de envio (`Access Token Permanente`, `WhatsApp Business Account ID` e o `Phone Number ID`) para a gente testar o envio? 
3. **Telefone do Lead:** Para que a rota Node.js consiga enviar a mensagem da Pipeline pro Lead, vamos precisar que a tabela `leads` possua o número de telefone correto dele com o DDI (ex: 5511999999999). A sua tabela `leads` já capta ou armazena o número do celular para isso acontecer?

Se tudo parecer correto, me responda essas 3 perguntas acima e eu já meto a mão no SQL e na criação da `ConexoesPage.jsx` agressivamente.
