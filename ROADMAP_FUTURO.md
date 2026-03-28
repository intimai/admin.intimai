# 🚀 Roadmap de Implementações Futuras - IntimAI Admin

Este documento consolida as melhorias de UX, regras de negócio e integrações planejadas para as próximas etapas do projeto.

---

## 1. 🛠 Suporte Kanban (Página Suporte)

### Regras de Movimentação (Drag & Drop)
- **Colunas Bloqueadas:** As colunas `"Aberto"` e `"Conversando com IA"` devem ser travadas para entrada e saída manual (decisão automatizada pelo N8N).
- **Atendimento Humano:** Cards nesta coluna só podem ser movidos para `"Resolvido"`.
- **Status Finais:** As colunas `"Resolvido"` e `"Avaliado"` não permitem movimentação manual.
- **Feedback Visual:** 
    - Manter o efeito de "mãozinha" (cursor pointer) e o realce visual das colunas (verde para destino permitido, vermelho para proibido), seguindo o padrão da Pipeline.
    - Exibir alertas (`toast`) explicativos quando um movimento for bloqueado.

### Visual dos Cards (UI)
- **Hierarquia de Informação:** Exibir o **Nome do Usuário** (da tabela `suporte`) como título principal do card.
- **Subtítulo:** Exibir o e-mail logo abaixo do nome.
- **Vínculo de Delegacia:** Exibir o nome da Delegacia (obtido via Join com a tabela `delegacias` através do `delegaciaId`).

---

## 2. 🔗 Automação Supabase (Webhooks)

### Disparo de Webhook de Suporte
- **Ação:** Criar um trigger no Supabase para a tabela `suporte`.
- **Condição:** Disparar quando o `status` for alterado para `'resolvido'`.
- **Implementação:** Seguir o padrão de gatilho SQL utilizado na Pipeline (POST via `net.http_post`).
- **Script Pronto:** O arquivo `admin_suporte_webhook_trigger.sql` já foi criado na raiz do projeto com o código necessário para execução no SQL Editor do Supabase.

---

## 3. 📂 Sidebar e Navegação (UX)

### Menu Retrátil (Collapsible)
- **Modo Reduzido:** Exibir apenas os ícones dos menus, ocultando nomes e categorias.
- **Logo Dinâmica:** Substituir a logo padrão pela `logo_reduzida.png` (na pasta `public`) quando a sidebar estiver contraída.
- **Botão Toggle:** Fixar um botão de expansão/redução no canto superior direito da sidebar.
- **Animações:** Implementar transições suaves de largura (`transition-all`) que afetem também o espaçamento do conteúdo principal.

### Nova Categoria: Administrativo / Financeiro
- Agrupar itens financeiros em uma categoria própria.
- **Menus Sugeridos (Placeholder):**
    - 🧾 Contas a Pagar
    - 💰 Contas a Receber
    - 📈 Receitas
    - 📉 Despesas
    - 📊 Relatórios Financeiros

---

## 4. 🎨 Ajustes de Cores e Contraste

### Tags de Status (Delegacias e Usuários)
- **Problema:** O texto branco sobre fundo claro/verde está com baixo contraste.
- **Ação:** 
    - No menu **Delegacias**, ajustar a tag da coluna `status_conta`.
    - No menu **Usuários**, ajustar a tag da coluna `ativo`.
- **Solução:** Alterar as classes CSS de `text-white` para `text-zinc-900` (ou similar escuro) para garantir a legibilidade.

---

*Documento gerado em 28/03/2026 para referência de desenvolvimento futuro.*
