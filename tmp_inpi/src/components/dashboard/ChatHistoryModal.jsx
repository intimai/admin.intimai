import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/lib/customSupabaseClient';
import { Loader2, User, Bot } from 'lucide-react';

export function ChatHistoryModal({ isOpen, onClose, sessionId, intimadoNome, intimacaoId }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState(null); // 'chat' | 'n8n'

  useEffect(() => {
    if (isOpen && (intimacaoId != null || sessionId)) {
      fetchMessages();
    }
  }, [isOpen, intimacaoId, sessionId]);

  const fetchMessages = async () => {
    setLoading(true);
    setSource(null);
    try {
      // Preferência: tabela chat por id da intimação (mensagem, origem, id_intimacao)
      if (intimacaoId != null) {
        const { data, error } = await supabase
          .from('chat')
          .select('id, mensagem, origem, id_intimacao, created_at')
          .eq('id_intimacao', intimacaoId)
          .order('id', { ascending: true });

        if (error) throw error;
        setMessages(data || []);
        setSource('chat');
        return;
      }

      // Fallback: histórico n8n por session_id (telefone)
      const cleanSessionId = (sessionId || '').replace(/\D/g, '');
      if (!cleanSessionId) {
        setMessages([]);
        return;
      }

      const { data, error } = await supabase
        .from('n8n_chat_histories_intimacoes')
        .select('*')
        .or(`session_id.eq.${cleanSessionId},session_id.eq.55${cleanSessionId}`)
        .order('id', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
      setSource('n8n');
    } catch (error) {
      console.error('Erro ao buscar histórico de chat:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessageFromChat = (msg) => (
    <div
      key={msg.id}
      className={`flex gap-3 mb-4 ${msg.origem === 'intimai' ? 'justify-start' : 'justify-end'}`}
    >
      {msg.origem === 'intimai' && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Bot className="w-5 h-5 text-primary" />
        </div>
      )}
      <div
        className={`max-w-[70%] rounded-lg px-4 py-2 ${
          msg.origem === 'intimai'
            ? 'bg-muted text-foreground'
            : 'bg-primary text-primary-foreground'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap break-words">{msg.mensagem}</p>
      </div>
      {msg.origem === 'intimado' && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
          <User className="w-5 h-5 text-primary-foreground" />
        </div>
      )}
    </div>
  );

  const renderMessageFromN8n = (msg) => {
    const messageData = msg.message;
    const isAI = messageData?.type === 'ai';
    const content = messageData?.content;

    if (content === 'identidade_confirmada' || !content) return null;

    return (
      <div
        key={msg.id}
        className={`flex gap-3 mb-4 ${isAI ? 'justify-start' : 'justify-end'}`}
      >
        {isAI && (
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary" />
          </div>
        )}
        <div
          className={`max-w-[70%] rounded-lg px-4 py-2 ${
            isAI ? 'bg-muted text-foreground' : 'bg-primary text-primary-foreground'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{content}</p>
          {messageData?.additional_kwargs?.contexto && (
            <div className="mt-2 pt-2 border-t border-border/50">
              <p className="text-xs opacity-70">
                Intimação ID: {messageData.additional_kwargs.contexto.intimacao_id}
              </p>
            </div>
          )}
        </div>
        {!isAI && (
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <User className="w-5 h-5 text-primary-foreground" />
          </div>
        )}
      </div>
    );
  };

  const renderMessage = (msg) =>
    source === 'chat' ? renderMessageFromChat(msg) : renderMessageFromN8n(msg);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-[95vw] max-h-[85vh] flex flex-col bg-card p-6 md:p-8 rounded-xl shadow-elegant border border-border/50 z-50">
        <DialogHeader className="pb-4 border-b border-border/30">
          <DialogTitle className="text-xl">
            Histórico de Conversa - {intimadoNome}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Nenhuma mensagem encontrada</p>
          </div>
        ) : (
          <div className="flex-1 mt-4 pr-3 overflow-y-auto custom-scrollbar">
            <div className="space-y-4">
              {messages.map(renderMessage)}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
