import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

export const useSuporte = () => {
  const { isAdmin, loading: authLoading } = useAdminAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  const fetchItems = useCallback(async (retryCount = 0) => {
    try {
      setLoading(true);
      setError(null);

      const { data: suporteData, error } = await supabase
        .from('suporte')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        if (retryCount < 1 && (error.code === 'PGRST301' || error.status === 401)) {
          console.warn('[useSuporte] Falha de autorização, tentando novamente...');
          await new Promise(resolve => setTimeout(resolve, 800));
          return fetchItems(retryCount + 1);
        }
        throw error;
      }

      // Se conseguir os tickets, busca as delegacias para resolver o nome manualmente 
      // (pois o banco estava rejeitando o join com erro 400 por falta de foreign key vinculada)
      if (suporteData && suporteData.length > 0) {
        try {
          const { data: delegaciasData } = await supabase
            .from('delegacias')
            .select('*');

          if (delegaciasData) {
            // Cria um dicionário rápido para lookup O(1) e a prova de falhas de case/type
            const delegaciasMap = delegaciasData.reduce((acc, del) => {
              const id = del.delegaciaId || del.delegaciaid;
              if (id) acc[String(id)] = del.nome;
              return acc;
            }, {});

            // Preenche o nome da delegacia em cada ticket de suporte
            suporteData.forEach(item => {
              const dId = item.delegaciaId || item.delegacia_id || item.delegaciaid;
              if (dId && delegaciasMap[String(dId)]) {
                item.delegaciaNomeMapeado = delegaciasMap[String(dId)];
              }
            });
            console.log('[useSuporte] Amostra de item RAW COMPLETA:', JSON.stringify(suporteData[0]));
            if (suporteData.length > 0) {
              const dIds = suporteData.map(i => ({ id_ticket: i.id, id_del: i.delegaciaId }));
              console.log('[useSuporte] Valores de delegaciaId nos tickets:', dIds);
            }
            console.log('[useSuporte] Exemplo Map (ID -> Nome):', Object.entries(delegaciasMap).slice(0, 3));
          }
        } catch (delErr) {
          console.warn('[useSuporte] Erro ao mapear nomes de delegacias:', delErr);
        }
      }

      setItems(suporteData || []);
    } catch (err) {
      console.error('Erro ao buscar tickets de suporte:', err);
      setError(err.message);
      toast({
        title: "Erro de Conexão",
        description: "Não foi possível sincronizar os tickets de suporte. Tente atualizar a página.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updateStatus = async (id, newStatus) => {
    try {
      // Otimistic update
      setItems(prev => prev.map(item =>
        item.id === id ? { ...item, status: newStatus } : item
      ));

      const { error } = await supabase
        .from('suporte')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Status atualizado",
        description: `O ticket foi movido para ${newStatus.replace('_', ' ')}.`,
      });
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      // Revert optimistic update
      fetchItems();
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar o status.",
        variant: "destructive"
      });
    }
  };

  const updatePriority = async (id, newPriority) => {
    try {
      // Otimistic update
      setItems(prev => prev.map(item =>
        item.id === id ? { ...item, prioridade: newPriority } : item
      ));

      const { error } = await supabase
        .from('suporte')
        .update({ prioridade: newPriority })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Prioridade atualizada",
        description: `A prioridade foi alterada para ${newPriority}.`,
      });
    } catch (err) {
      console.error('Erro ao atualizar prioridade:', err);
      // Revert optimistic update
      fetchItems();
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar a prioridade.",
        variant: "destructive"
      });
    }
  };

  // Auto-fetch ao montar o componente
  useEffect(() => {
    if (isAdmin && !authLoading) {
      fetchItems();
    }
  }, [isAdmin, authLoading]);

  const adicionarMensagemChat = async (id, novaMensagem, marcarComoResolvido = false) => {
    try {
      const itemAtual = items.find(i => i.id === id);
      if (!itemAtual) return false;

      const arrayHistorico = itemAtual.historico_conversas || [];
      const novoHistorico = [...arrayHistorico, novaMensagem];

      // Otimistic update
      setItems(prev => prev.map(item =>
        item.id === id 
          ? { 
              ...item, 
              historico_conversas: novoHistorico,
              ...(marcarComoResolvido ? { status: 'resolvido', resposta_admin: novaMensagem.texto } : {})
            } 
          : item
      ));

      const payload = { historico_conversas: novoHistorico };
      if (marcarComoResolvido) {
        payload.status = 'resolvido';
        payload.resposta_admin = novaMensagem.texto;
      }

      const { error } = await supabase
        .from('suporte')
        .update(payload)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Mensagem salva",
        description: marcarComoResolvido ? "Ticket respondido e resolvido." : "Resposta adicionada com sucesso.",
      });
      return true;
    } catch (err) {
      console.error('Erro ao adicionar mensagem:', err);
      // Revert optimistic update
      fetchItems();
      toast({
        title: "Erro ao enviar",
        description: "Não foi possível enviar a mensagem.",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    items,
    loading,
    error,
    updateStatus,
    updatePriority,
    adicionarMensagemChat,
    refresh: fetchItems
  };
};