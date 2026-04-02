import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

export const usePipeline = () => {
  const { isAdmin, loading: authLoading } = useAdminAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  const fetchItems = useCallback(async (retryCount = 0) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        if (retryCount < 1 && (error.code === 'PGRST301' || error.status === 401)) {
          console.warn('[usePipeline] Falha de autorização, tentando novamente...');
          await new Promise(resolve => setTimeout(resolve, 800));
          return fetchItems(retryCount + 1);
        }
        throw error;
      }

      setItems(data || []);
    } catch (err) {
      console.error('Erro ao buscar prospecções:', err);
      setError(err.message);
      toast({
        title: "Erro de Conexão",
        description: "Não foi possível sincronizar com o banco de dados.",
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

      const { error: dbError } = await supabase
        .from('leads')
        .update({ status: newStatus })
        .eq('id', id);

      if (dbError) throw dbError;

      toast({
        title: "Status atualizado",
        description: `O status foi alterado para ${newStatus}.`,
      });
    } catch (err) {
      console.error('Erro ao atualizar status do lead:', err);
      fetchItems();
      toast({
        title: "Erro ao atualizar",
        description: `Não foi possível atualizar o status: ${err.message}`,
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (isAdmin && !authLoading) {
      fetchItems();
    }
  }, [isAdmin, authLoading]);

  return {
    items,
    loading,
    error,
    updateStatus,
    refresh: fetchItems
  };
};