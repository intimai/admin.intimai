import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

export const useSuporte = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('suporte')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (err) {
      console.error('Erro ao buscar tickets de suporte:', err);
      setError(err.message);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar a lista de suporte.",
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

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return {
    items,
    loading,
    error,
    updateStatus,
    updatePriority,
    refresh: fetchItems
  };
};