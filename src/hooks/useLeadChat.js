import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

export const useLeadChat = (leadId) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const fetchMessages = useCallback(async () => {
    if (!leadId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('chat_admin')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      console.error('[useLeadChat] Erro ao buscar:', err);
      toast({ 
        title: 'Erro no Histórico', 
        description: 'Não foi possível carregar as mensagens', 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  }, [leadId, toast]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const sendMessage = async (telefone, mensagem) => {
    if (!telefone || !mensagem) return false;
    setIsSending(true);

    // Criação do Update Otimista (UX instantâneo para o Admin)
    const tempId = Date.now().toString();
    const tempMsg = {
        id: tempId,
        lead_id: leadId,
        origem: 'admin',
        mensagem: mensagem,
        telefone: telefone,
        status: 'enviando',
        created_at: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, tempMsg]);

    try {
      // Bate no próprio servidor local em Node.js (Porta 3001) que tem o Token Oficial isolado
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const res = await fetch('http://localhost:3001/api/send-whatsapp-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_id: leadId, telefone, mensagem }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.error || 'Erro na API Local de WhatsApp');
      }

      // Se passou, manda atualizar a lista buscando do banco a mensagem real de sucesso inserida.
      await fetchMessages();
      return true;

    } catch (error) {
      console.error('[useLeadChat] Erro disparando whatsapp local:', error);
      // Reverte o envio falso
      setMessages(prev => prev.filter(m => m.id !== tempId));
      toast({ 
        title: 'Falha no Disparo', 
        description: 'Não foi possível enviar para a Meta. A porta 3001 está rodando?',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsSending(false);
    }
  };

  return { messages, loading, isSending, sendMessage, refresh: fetchMessages };
};
