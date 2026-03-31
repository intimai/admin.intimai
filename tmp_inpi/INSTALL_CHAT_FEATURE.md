# Instalação da Feature de Chat

## Passo 1: Instalar dependência

Execute no terminal:

```bash
npm install @radix-ui/react-scroll-area
```

## Passo 2: Reiniciar o servidor

Após a instalação, reinicie o servidor de desenvolvimento:

```bash
npm run dev
```

## Como usar

1. Acesse a página de Intimações
2. Cada intimação agora tem um botão "Chat" ao lado do status
3. Clique no botão para ver o histórico completo de mensagens trocadas via WhatsApp
4. O modal mostra:
   - Mensagens do bot (IA) à esquerda com ícone de bot
   - Mensagens do usuário à direita com ícone de pessoa
   - Contexto adicional quando disponível (ID da intimação, etc.)

## Estrutura criada

- `src/components/dashboard/ChatHistoryModal.jsx` - Modal de visualização do chat
- `src/components/ui/scroll-area.jsx` - Componente de scroll customizado
- Modificado `src/components/dashboard/IntimacaoCard.jsx` - Adicionado botão de chat

## Observações

- O `session_id` usado é o telefone da intimação
- Apenas intimações com telefone cadastrado mostram o botão de chat
- As mensagens são ordenadas cronologicamente
- Mensagens de sistema (como "identidade_confirmada") são filtradas automaticamente
