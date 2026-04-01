# Plano de Correção e Melhorias: Hub de Conexões Meta

Este documento detalha o plano atualizado para corrigir as regressões visuais e implementar melhorias de UX no Hub de Conexões.

## 📋 Diagnóstico

1. **Ação de Refazer Nome (UX):** Esconder a edição do nome rejeitado dentro da engrenagem não é intuitivo. Precisamos de um botão primário no próprio card para isso, já que é um bloqueador do envio de SMS.
2. **Estado "Conectado":** Se o número já está `CONNECTED`, a interface deve ser limpa. Sem exibir tags de erro de verificação ou botões de OTP.
3. **Filtros e Padrão de Layout:** A página difere do padrão adotado em outras telas (conteúdo solto vs. contido num Card principal). Não há como pesquisar por Nome da Delegacia.
4. **Vinculação Posterior:** Instâncias cadastradas por fora (via Meta) aparecem sem delegacia, e faltava uma forma de vinculá-las pelo fluxo normal.

## 🛠️ Ações de Correção

### 1. Novo Layout (Padrão IntimAI)
- Envolver o cabeçalho de contagens e os cartões (Grid) dentro de uma estrutura padrão de `<Card>` com barra de pesquisa superior.
- Adicionar filtros:
  - Input de busca por "Delegacia ou Telefone".
  - Select de "Status" (Todas, Conectadas, Pendentes).
- Forçar ordenação prioritária: Conectados aparecem sempre antes dos Pendentes.

### 2. Aperfeiçoamento do `InstanceCard`
- **Nome Reprovado:** Quando `name_status === 'DECLINED'` + não conectado, um botão de "Corrigir Nome" aparecerá de forma primária na área de ação do cartão, abrindo automaticamente o modal focado na aba "Identidade".
- **Estado Conectado Certo:** Se `getConnectionStatus === 'connected'`, a linha de `Action area` desaparece, bem como as tags desnecessárias como "Não Verificado" ou "Verificação Expirada" (se a Meta já diz que está conectado, o OTP foi superado ou dispensado).
- **Estética Neutra:** Toda tag ou aviso de status será em texto neutro (`muted-foreground`), retendo cor apenas nos ícones de situação.

### 3. Associação de Delegacia no `EditProfileModal`
- Na aba "Identidade" (nome da engrenagem), será incluída uma seção "Vinculação de Delegacia".
- O campo usará um Select populado pela variável `delegacias`.
- Durante o `Save`, atualizaremos diretamente a tabela "delegacias" referenciando o `whatsappPhoneNumberId` da instância em questão.

## 🧪 Plano de Verificação
- [ ] Validar que instâncias conectadas (Leopoldina) não exibem botões de OTP nem tags erradas.
- [ ] Confirmar o Container e Filtro unificado na tela principal.
- [ ] Testar vínculo de delegacia numa instância que ainda não tem.
- [ ] O visual das cores segue seu padrão neutro de alerta.
