import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

export const useProspeccao = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('lista_espera_delegacias')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (err) {
      console.error('Erro ao buscar prospecções:', err);
      setError(err.message);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar a lista de prospecção.",
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
        .from('lista_espera_delegacias')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Status atualizado",
        description: `O status foi alterado para ${newStatus}.`,
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

  // Auto-fetch ao montar o componente
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return {
    items,
    loading,
    error,
    updateStatus,
    refresh: fetchItems
  };
};