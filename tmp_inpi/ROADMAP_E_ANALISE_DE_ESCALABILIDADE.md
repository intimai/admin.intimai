# Roadmap e Análise de Escalabilidade - IntimAI

**Data da Análise:** 04/12/2025

## 1. Resumo Executivo

O IntimAI, em seu estado atual, é uma **plataforma completa e pronta para o lançamento (Versão 1.0)**. A base tecnológica é moderna (React, Supabase, N8N) e as decisões de arquitetura, como a implementação de RLS (Row Level Security), automação de fluxos via webhooks e funcionalidades de gestão como a Agenda, demonstram uma maturidade que vai além de um produto inicial.

A análise do código e da documentação (`ANALISE_TECNICA.md`, `REGRAS_DE_NEGOCIO.md`) revela que os principais gargalos de escalabilidade, como **paginação** e **filtros no backend**, já foram **corrigidos com sucesso**.

Este documento consolida o estado atual, compila as tarefas futuras já mapeadas e adiciona novas recomendações, com foco em otimização de performance (índices de banco de dados) e na finalização das funcionalidades planejadas para criar um "documento da verdade" para os próximos passos.

## 2. Análise de Escalabilidade e Performance

A aplicação foi projetada com a escalabilidade em mente. No entanto, para suportar um alto fluxo de interações desde o dia zero, as seguintes áreas são cruciais:

### 2.1. Consultas ao Banco de Dados (Supabase)

As consultas são o ponto mais crítico para a performance em um aplicativo com muitos dados.

**Estado Atual:**
-   A função `fetchIntimacoes` no hook `useIntimacoes` já implementa paginação (`range()`) e filtros no backend (`eq()`, `or()`, `ilike()`), o que é **excelente**. Isso evita que o aplicativo baixe milhares de registros de uma só vez.
-   A função `fetchAgendamentos` busca os agendamentos de um dia específico, o que também é uma consulta otimizada.

**Recomendações de Índices:**

Para garantir que essas consultas permaneçam rápidas à medida que a tabela `intimacoes` cresce, recomendo a criação dos seguintes índices compostos no Supabase. Eles funcionarão como "atalhos" para o banco de dados, tornando as buscas quase instantâneas.

1.  **Índice para a Página Principal de Intimações (Filtro e Busca):**
    *   **Consulta Alvo:** `fetchIntimacoes` quando um usuário filtra por status e/ou busca por um termo.
    *   **Campos:** `userId`, `status`, `criadoEm`
    *   **Comando SQL:**
        ```sql
        CREATE INDEX idx_intimacoes_listagem ON intimacoes ("userId", status, "criadoEm" DESC);
        ```
    *   **Justificativa:** Este índice otimiza a consulta mais comum da aplicação: listar as intimações de um usuário, filtradas por um status específico e ordenadas pela data de criação.

2.  **Índice para a Busca por Nome/Documento:**
    *   **Consulta Alvo:** A cláusula `.or(intimadoNome.ilike..., documento.ilike...)` dentro de `fetchIntimacoes`.
    *   **Campos:** `userId`, `intimadoNome`, `documento`
    *   **Comando SQL (requer extensão `pg_trgm`):**
        ```sql
        -- Primeiro, habilite a extensão (só precisa fazer uma vez)
        CREATE EXTENSION IF NOT EXISTS pg_trgm;

        -- Crie o índice usando GIN
        CREATE INDEX idx_intimacoes_busca_trgm ON intimacoes USING gin ("userId", "intimadoNome" gin_trgm_ops, "documento" gin_trgm_ops);
        ```
    *   **Justificativa:** Buscas com `ilike` são lentas em tabelas grandes. Um índice GIN com `pg_trgm` é a forma mais eficiente no PostgreSQL para acelerar esse tipo de busca textual.

3.  **Índice para a Agenda (Calendário e Cards):**
    *   **Consulta Alvo:** `fetchAgendamentos` que busca por `userId`, `dataAgendada` e `status`.
    *   **Campos:** `userId`, `dataAgendada`, `status`, `horaAgendada`
    *   **Comando SQL:**
        ```sql
        CREATE INDEX idx_intimacoes_agenda ON intimacoes ("userId", "dataAgendada", status, "horaAgendada" ASC);
        ```
    *   **Justificativa:** Acelera a busca de agendamentos para um dia específico, que é a base da página de Agenda, garantindo que o calendário e os cards carreguem rapidamente.

### 2.2. Otimização do Frontend

-   **Estado Atual:** O código já utiliza `useCallback` para memoizar funções, o que ajuda a prevenir re-renderizações desnecessárias. A estrutura de componentes é boa.
-   **Próximos Passos (Pós-Lançamento):** As otimizações listadas na `ANALISE_TECNICA.md` como *Lazy Loading*, *Code Splitting* e avaliação de bibliotecas de estado como Zustand são excelentes candidatos para melhorias futuras, mas não são bloqueios para o lançamento do MVP.

## 3. Roadmap Consolidado de Próximos Passos

Este roadmap compila as tarefas dos arquivos `ANALISE_TECNICA.md` e `public/TAREFAS`, priorizando o que é essencial para o lançamento e o que pode ser feito depois.

### Fase 1: Lançamento da Versão 1.0 (Prioridade Alta)

-   **[ ] 1.1. Implementar Índices de Performance:**
    -   [ ] Executar os 3 comandos SQL da seção 2.1 para criar os índices recomendados no Supabase.

-   **[ ] 1.2. Configurar Webhooks de Produção:**
    -   [ ] Conforme a tarefa em `public/TAREFAS`, inserir os links finais dos webhooks no arquivo `.env` do ambiente de produção.

-   **[ ] 1.3. Conteúdo Final:**
    -   [ ] Inserir os textos finais nas páginas de "Glossário" e "Orientações".

-   **[ ] 1.4. Revisão de Responsividade:**
    -   [ ] Realizar uma verificação final da responsividade do aplicativo em diferentes tamanhos de tela (celular, tablet, desktop).

### Fase 2: Refatoração e Melhoria Contínua (Pós-Lançamento)

Estas tarefas são da `ANALISE_TECNICA.md` e visam melhorar a manutenibilidade do código.

-   **[ ] 2.1. Quebra de Componentes Complexos:**
    -   [ ] Dividir `AgendaCard.jsx` e `IntimacaoCard.jsx` em componentes menores e mais focados, como já iniciado.

-   **[ ] 2.2. Reorganização de Features (Co-localização):**
    -   [ ] Mover componentes, hooks e lógica específicos de uma feature (ex: `Agenda`) para um diretório próprio dentro de `src/pages` ou `src/features`.

### Fase 3: Segurança Avançada e Conformidade LGPD (Roadmap Futuro)

Estas são as fases 4 e 5 da `ANALISE_TECNICA.md`, que representam a evolução do produto.

-   **[ ] 3.1. Implementar Mecanismos de Consentimento LGPD:**
    -   [ ] Criar o `ConsentModal.jsx` para o primeiro acesso do usuário.

-   **[ ] 3.2. Portal Interno de Direitos dos Titulares:**
    -   [ ] Desenvolver a página para que o usuário gerencie seus dados (exportação, exclusão).

-   **[ ] 3.3. Criptografia de Dados Sensíveis em Repouso:**
    -   [ ] Implementar a criptografia em nível de aplicação para campos como `documento` e `numeroProcedimento` antes de salvá-los no banco.

-   **[ ] 3.4. Integração com Evolution API:**
    -   [ ] Desenvolver a interface para conexão com a Evolution API (QR Code, status, etc.).

## 4. Conclusão

Você está em uma posição excelente para o lançamento. O sistema é funcional, seguro e já resolve os principais desafios de performance.

**Recomendação final:** Foque em completar a **Fase 1** deste roadmap. As fases 2 e 3 podem e devem ser tratadas como parte da evolução natural e contínua do produto após o lançamento e o feedback dos primeiros usuários.