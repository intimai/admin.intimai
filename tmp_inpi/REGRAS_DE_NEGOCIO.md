# Regras de Negócio - Gestão de Intimações

Este documento descreve o ciclo de vida e as regras de negócio associadas ao status das intimações no sistema IntimAI.

## Contexto e Natureza do Sistema

### Finalidade do Sistema
O **IntimAI** é uma aplicação desenvolvida para **policiais civis** que facilita a entrega de intimações através de **WhatsApp utilizando Inteligência Artificial**. O sistema permite:

- **Gestão de Intimações**: Organização do ciclo de vida completo das intimações
- **Agendamento Inteligente**: IA realiza interação com intimados para agendar oitivas
- **Agenda Individual**: Cada policial acessa apenas suas próprias intimações e agenda
- **Manipulação Controlada**: Ações baseadas em regras de negócio específicas

### Natureza dos Dados Tratados
**IMPORTANTE**: Os dados inseridos e manipulados no sistema são de **terceiros (intimados)**, não dos usuários (policiais). 

**Responsabilidade Legal**: Os dados são previamente manipulados e sob responsabilidade dos usuários, que são **agentes públicos** com prerrogativa legal para tal tratamento.

**Contexto LGPD**: O sistema atua como **ferramenta de apoio** para agentes públicos no exercício de suas funções legais, tratando dados de terceiros conforme competências estabelecidas em lei.

## Ciclo de Vida e Status das Intimações

Uma intimação pode passar pelos seguintes status:

-   **Pendente (`pendente`):**
    -   **Descrição:** Intimação recém-criada e inserida no banco de dados.
    -   **Próximo Passo:** Aguardando na fila para o N8N iniciar o contato via WhatsApp.
    -   **Ação do Usuário:** Pode ser cancelada.

-   **Entregue (`entregue`):**
    -   **Descrição:** O primeiro contato foi realizado pelo N8N. O sistema aguarda a resposta do intimado.
    -   **Origem da Mudança:** Status atualizado exclusivamente pelo N8N.
    -   **Ação do Usuário:** Pode ser cancelada.

-   **Ativa (`ativa`):**
    -   **Descrição:** A IA está em conversação ativa com o intimado para realizar o agendamento.
    -   **Origem da Mudança:** Status atualizado pelo N8N/IA após confirmação de identidade.
    -   **Ação do Usuário:** Pode ser cancelada.
    -   **AUDITORIA:** Esta transição (`entregue` → `ativa`) é registrada automaticamente nos logs de auditoria como `CONFIRMACAO_IDENTIDADE` via trigger do banco de dados. Para mais detalhes, consulte a seção "Sistema de Logs Detalhado" no documento `LGPD_E_SEGURANCA.md`.

-   **Agendada (`agendada`):**
    -   **Descrição:** A intimação foi agendada para uma data e hora futuras.
    -   **Origem da Mudança:** Status atualizado pela IA após confirmação do intimado.
    -   **Ação do Usuário:** Pode ser cancelada. O agendamento só pode ser feito para datas a partir do dia seguinte.

-   **Finalizada (`finalizada`):**
    -   **Descrição:** A data e hora do agendamento foram ultrapassadas.
    -   **Origem da Mudança:** Atualização automática via função no banco de dados (cron job).
    -   **Ação do Usuário:** Pode ser marcada como "Não Compareceu" (mudando o status para `ausente`). Não pode mais ser cancelada.

-   **Ausente (`ausente`):**
    -   **Descrição:** O intimado não compareceu no horário agendado.
    -   **Origem da Mudança:** Marcada manualmente pelo usuário do aplicativo a partir de uma intimação `finalizada`.
    -   **Ação do Usuário:** Nenhuma. Não pode ser cancelada.

-   **Recusada (`recusada`):**
    -   **Descrição:** O intimado não aceitou prosseguir com o agendamento.
    -   **Origem da Mudança:** Status atualizado pelo N8N.
    -   **Ação do Usuário:** Nenhuma.

-   **Cancelada (`cancelada`):**
    -   **Descrição:** A intimação foi cancelada pelo usuário do aplicativo.
    -   **Origem da Mudança:** Status final atualizado pelo N8N após o processo de cancelamento ser iniciado pelo usuário.
    -   **Ação do Usuário:** Nenhuma.

## Processo de Cancelamento

1.  O usuário pode solicitar o cancelamento de intimações com status `pendente`, `entregue`, `ativa` ou `agendada`.
2.  Ao confirmar o cancelamento no aplicativo, a coluna `emCancelamento` da intimação é marcada como `true`.
3.  O N8N é responsável por identificar essa flag, notificar o intimado sobre o cancelamento e, por fim, atualizar o status da intimação para `cancelada`.

## Automação de Status

-   **Agendada -> Finalizada:** Uma rotina automática (cron job) no Supabase deve ser executada periodicamente para verificar as intimações `agendadas` cuja `dataAgendada` e `horaAgendada` já passaram. Para essas, o status deve ser atualizado para `finalizada`.