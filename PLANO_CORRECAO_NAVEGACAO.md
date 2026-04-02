# Plano de Correção: Falha de Carregamento na Navegação

**Data**: 02/04/2026  
**Status**: ✅ Concluído (Todas as 3 etapas + Bug Colaborador)

---

## Contexto do Problema

Ao navegar entre menus no painel admin, os dados das páginas falham ao carregar, ficando em loading infinito ou exibindo dados em branco. O problema só se resolve ao recarregar a página manualmente (F5).

## Arquitetura Relevante

- **IntimAI Admin** compartilha o mesmo banco de dados e Supabase Auth com o app principal **IntimAI**.
- Tabela `usuarios` possui coluna `is_admin` para distinguir administradores.
- Tabela `admin_colaboradores` gerencia colaboradores com permissões restritas via campo `admin_menus`.
- A função `hasMenuAccess(slug)` no `AdminAuthContext` verifica acesso por menu.

## Diagnóstico (3 Causas-Raiz)

### Causa 1: Guard Duplicado (CRÍTICA)
O `AdminProtectedRoute` era usado **duas vezes** para cada rota:
1. Como wrapper do `AdminLayout` (verifica auth + mostra spinner)
2. Como guard individual de cada rota filha (repete a mesma verificação)

Na navegação SPA, o guard interno mostrava um spinner de tela cheia e **desmontava a página**, destruindo o estado e impedindo o carregamento dos dados.

### Causa 2: Early Return Silencioso nos Hooks (MODERADA)
Os hooks customizados possuíam:
```javascript
if (!isAdmin || authLoading) return; // ← sai sem fazer nada
```
Quando o componente era remontado (por causa do guard duplo), esse early return silencioso deixava o `loading` preso em `true`.

### Causa 3: Dependências Circulares nos useCallback/useEffect (MODERADA)
Os hooks incluíam `isAdmin` e `authLoading` nas dependências do `useCallback`, causando recriação da função a cada mudança de estado do auth. O `useEffect` dependia do callback, criando um ciclo: auth muda → callback recria → useEffect re-dispara → fetch duplicado.

---

## Correções Aplicadas

### Etapa 1: Eliminar o Guard Duplicado ✅ CONCLUÍDO

**Arquivos modificados:**
- `[NOVO] src/components/layout/MenuGuard.jsx` — Componente leve que só verifica permissão de menu
- `[MODIFICADO] src/App.jsx` — Substituir `AdminProtectedRoute` interno por `MenuGuard`

### Etapa 2: Padronizar Fetching com Verificação de Auth ✅ CONCLUÍDO (já OK)

**Resultado:** `Dashboard.jsx`, `FaturasPage.jsx` e `DespesasPage.jsx` já possuíam verificação `isAdmin && !authLoading` antes dos fetchs. Nenhuma alteração necessária.

### Etapa 3: Estabilizar Hooks Customizados ✅ CONCLUÍDO

**Arquivos modificados:**
- `src/hooks/useNotasFiscais.js`
- `src/hooks/usePipeline.js`
- `src/hooks/useDelegacias.js`
- `src/hooks/useUsers.js`
- `src/hooks/useContratos.js`
- `src/hooks/usePropostas.js`
- `src/hooks/useSuporte.js`

**Ação:** Removido `isAdmin`/`authLoading` das dependências de `useCallback` (tornando o callback estável). A guarda de auth foi movida para o `useEffect` que dispara o fetch inicial, usando `[isAdmin, authLoading]` como deps diretas.

---

## Bug Extra: Colaborador com Permissão Não Consegue Acessar ✅ CORRIGIDO

### Causa A: Race Condition no Login
O evento `SIGNED_IN` do `onAuthStateChange` disparava `fetchAdminProfile` em paralelo com a função `login()`, podendo resetar `isAdmin` para `false` se completasse depois.

**Correção:** Flag `loginInProgressRef` que impede o listener de processar o evento `SIGNED_IN` enquanto `login()` está em andamento.

### Causa B: Redirect Fixo para `/pipeline`
O redirect default (`<Navigate to="/pipeline" />`) bloqueava colaboradores que não tinham acesso ao menu Pipeline.

**Correção:** `getFirstAccessibleRoute()` — nova função no `AdminAuthContext` que retorna a primeira rota permitida do colaborador iterando pelo `MENU_CONFIG`. Aplicada em:
- `App.jsx` (rota index usa `SmartRedirect`)
- `LoginPage.jsx` (redirect pós-login e redirect automático)

---

## Garantias de Segurança

| Item | Status |
|:---|:---|
| Lógica de auth (`is_admin`, `admin_colaboradores`) | ✅ Intocada |
| Permissões de menu (`hasMenuAccess`) | ✅ Intocada (agora memoizada com useCallback) |
| Banco de dados compartilhado | ✅ Intocado |
| Fluxo de login/logout | ✅ Intocado (apenas race condition corrigida) |
| CRUD de todas as páginas | ✅ Intocado |
| Edge Function invite-colaborador | ✅ Intocada |
