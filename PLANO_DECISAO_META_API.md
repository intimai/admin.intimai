# Análise de Cenário: Hospedagem de Números na Meta API

Sua leitura do cenário é fantástica. Essa é a diferença entre teoria e o "campo de batalha": você já sentiu a dor das aprovações burocráticas da Meta.

Com base nos seus pontos (Policial não tem perfil admin, você quer zero atrito para o cliente e você precisa fazer a triagem manual contra banimentos), vamos pivotar nossa estratégia para te atender perfeitamente. Respondendo às suas dúvidas cirurgicamente:

### 1. Tem Leitura de QR Code se eu hospedar os números pela IntimAI?
**NÃO!** Você está usando a **API Oficial da Meta (Cloud API)**. A leitura de QR Code só existe em soluções paralelas não-oficiais (como Z-API, Evolution API). Na API Oficial, os chips ficam guardados em um data-center em nuvem do próprio Facebook. O seu servidor N8N/Node jamais lê um QR Code, ele só precisa do `Access Token` e do `Phone Number ID`.

### 2. Eu ainda preciso ser "Tech Provider/BSP"?
Dado o seu modelo de negócios focado em você mesma fazer o "trabalho sujo" para centralizar e proteger tudo, você tem **duas vias arquiteturais**:

**Opção A: O "Guarda-Chuva" da IntimAI (A mais rápida para você hoje)**
- Você **não** precisa do `whatsapp_business_management` e não precisa se tornar Tech Provider oficial.
- Como funciona: Você compra o chip, valida o SMS num celular seu, entra no seu painel *developers.facebook.com*, adiciona o número debaixo do seu próprio App/Business Manager e pede a aprovação lá mesmo.
- **O maior Risco:** Como todos os 500 números de delegacia estarão atrelados a um único WABA (o seu CNPJ), se uma única delegacia for denunciada por spam e banida, o Facebook derruba a sua conta inteira. Como os Intimados são civis chateados por receberem intimação, a chance de denúncia é gigante.

**Opção B: O "Provedor Privado" (A Arquitetura Blindada Anti-Risco)**
- Você usa o Painel da IntimAI para criar contas independentes para cada delegacia.
- O policial continua não fazendo nada. **Você**, como despachante tecnológica deles, criará a conta deles (logando com seu Facebook num fluxo automático do nosso sistema).
- **O Maior Ganho:** Isolamento Total. Se a "Delegacia Y" receber muita denúncia, ela perde o próprio disparo. As outras 499 continuam operando normalmente. Para isso, precisamos da permissão de *Management*!

---

## O Veredito Sensato Para HOJE (Foco na Pipeline Comercial)

Sendo extremamente pragmático com o seu esforço como Desenvolvedora Solitária: O CRM de Leads (Pipeline) lida **somente com clientes que querem comprar**. Nessas conversas do CRM, você vai usar o **seu único número de vendas oficial da IntimAI**.

Nós não precisamos construir o Monstro de Múltiplos Tokens (Opção B) agorinha só para conversar com clientes pela aba Pipeline. O seu MVP Comercial precisa estar rodando o mais simples o mais valioso possível.

Para te entregar valor *hoje* e fazermos o chat funcionar imediatamente na Pipeline:
1. Eu vou criar a sua API Oculta de Envio Node.js na raiz do seu projeto.
2. O Token e ID do Número Comercial da IntimAI entrarão direto em variáveis de servidor (`.env`). Sem banco, sem complexidade.
3. Vou reestruturar a sua tabela `chat_admin` duplicada para ligar ao `lead_id`.
4. Atualizo o Kanban da Pipeline com o Modal de conversas e o gatilho SQL para chamar o N8N ou nossa API.

## DECISÃO FINAL:
Você concorda em **postergar a Aba Conexões das Delegacias** (deixamos a complexidade de múltiplos provedores e QR code para depois) e focarmos apenas nestes 4 passos acima para entregar o Chat da Pipeline voando e te tirando do gargalo comercial?
