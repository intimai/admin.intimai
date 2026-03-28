Regras Kanban Pipeline

1 - Os cards "Novo" e "Conversando com IA" deverão ser travados (card não pode ser arrastado, tanto para entrada de cards quanto para saída - retirar o texto 'Arraste Itens aqui'). Nestas etapas a qualificação está sendo pela IA no N8N, onde a própria automação decide se o card deve ir para "Qualificado", "Não Qualificado" ou "Atendimento Humano". A única opção do usuário do IntimAI Admin pausar o atendimento pela IA é através do do chat da conversa, que ainda será implementado(futuramente). 
2 - Os cards de "Em Atendimento Humano" só podem ser arrastados para os cards "Qualificado" e "Não Qualificado".
3 - Os cards de "Qualificado" não podem ser arrastados manualmente (serão arrastados automaticamente após a geração da proposta), e os cards de "Não Qualificado" somente podem ser arrastados para a coluna "Qualificado" (para assim seguir para a geração de proposta e continuidade da lógica do kanban)
4 - O card "Proposta Enviada" somente poderá ser arrastado para a coluna "Fechado".
5 - O cad "Fechado" terá um funcionamento parecido com o da coluna "Qualificado", ou seja, não poderá ser arrastado manualmente, mas terá um botão para geração do Contrato (Menu ainda não implementado), que levará para a tela de geração de contrato. Após o contrato gerado, o status deverá ser alterado automaticamente para que o card passe para a coluna "Ativo", assim como ocorre com a coluna "Qualificado" após a geração da proposta.
6 -  O carda "Ativo" somente poderá ser arrastado para a coluna "Suspenso" (implementar coluna "Suspenso").
7 - O card "Suspenso" somente poderá ser arrastado para as colunas "Ativo" ou "Inativo" (implementar coluna "Inativo").

Observação: Quando o usuário tentar arrastar um card para uma coluna que não pode ser arrastado, deverá aparecer um alerta informando que o card não pode ser arrastado para aquela coluna e quais as colunas permitidas, informando maneira correta de proceder para cada situação. Exemplo: "O card 'Qualificado' não pode ser arrastado para a coluna 'Em Atendimento Humano'. Para prosseguir, gere a proposta clicando no botão 'Gerar Proposta' no card."  


Regras Kanban Suporte

1 - Os cards "Aberto" e "Conversando com IA" deverão ser travados, assim como na Pipeline. Acrescentar mesma mensagem ao usuário quando tentar arrastar o card para uma coluna inválida.
2 - Os cads de "Em Atendimento Humano" só podem ser arrastados para "Resolvido".
3 - Os cards de "Resolvido" e "Avaliado" não podem ser arrastados manualmente.