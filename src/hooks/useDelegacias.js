import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

export const useDelegacias = () => {
  const [delegacias, setDelegacias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  const fetchDelegacias = useCallback(async (searchTerm = '', status = '') => {
    console.log('[useDelegacias] Iniciando busca...', { searchTerm, status });
    try {
      setLoading(true);
      let query = supabase
        .from('delegacias')
        .select('*')
        .order('nome', { ascending: true });

      if (searchTerm) {
        query = query.ilike('nome', `%${searchTerm}%`);
      }

      if (status) {
        query = query.eq('status_conta', status);
      }

      const { data, error } = await query;

      if (error) throw error;

      console.log('[useDelegacias] Busca concluída com sucesso', { count: data?.length });
      setDelegacias(data || []);
    } catch (err) {
      console.error('Erro ao buscar delegacias:', err);
      setError(err);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as delegacias.",
        variant: "destructive"
      });
    } finally {
      console.log('[useDelegacias] Finalizando busca (loading false)');
      setLoading(false);
    }
  }, [toast]);

  const createDelegacia = async (delegaciaData) => {
    try {
      // Remover campos undefined ou vazios se necessário, mas o supabase lida bem
      const { data, error } = await supabase
        .from('delegacias')
        .insert([delegaciaData])
        .select()
        .single();

      if (error) throw error;

      setDelegacias(prev => [data, ...prev]);
      toast({
        title: "Sucesso",
        description: "Delegacia criada com sucesso.",
      });
      return { success: true, data };
    } catch (err) {
      console.error('Erro ao criar delegacia:', err);
      toast({
        title: "Erro",
        description: "Falha ao criar delegacia.",
        variant: "destructive"
      });
      return { success: false, error: err };
    }
  };

  const updateDelegacia = async (id, delegaciaData) => {
    try {
      const { data, error } = await supabase
        .from('delegacias')
        .update(delegaciaData)
        .eq('delegaciaId', id) // Usando delegaciaId conforme schema
        .select()
        .single();

      if (error) throw error;

      setDelegacias(prev => prev.map(item =>
        item.delegaciaId === id ? data : item
      ));

      toast({
        title: "Sucesso",
        description: "Delegacia atualizada com sucesso.",
      });
      return { success: true, data };
    } catch (err) {
      console.error('Erro ao atualizar delegacia:', err);
      toast({
        title: "Erro",
        description: "Falha ao atualizar delegacia.",
        variant: "destructive"
      });
      return { success: false, error: err };
    }
  };

  const deleteDelegacia = async (id) => {
    try {
      const { error } = await supabase
        .from('delegacias')
        .delete()
        .eq('delegaciaId', id);

      if (error) throw error;

      setDelegacias(prev => prev.filter(item => item.delegaciaId !== id));
      toast({
        title: "Sucesso",
        description: "Delegacia removida com sucesso.",
      });
      return { success: true };
    } catch (err) {
      console.error('Erro ao deletar delegacia:', err);
      toast({
        title: "Erro",
        description: "Falha ao remover delegacia.",
        variant: "destructive"
      });
      return { success: false, error: err };
    }
  };

  /* REMOVIDO: useEffect interno que causava dupla chamada e possíveis condições de corrida.
     A responsabilidade de buscar os dados iniciais agora é inteiramente do componente consumidor (DelegaciasPage),
     que já possui um useEffect com debounce para isso.
  useEffect(() => {
    fetchDelegacias();
  }, [fetchDelegacias]);
  */

  return {
    delegacias,
    loading,
    error,
    searchDelegacias: fetchDelegacias,
    createDelegacia,
    updateDelegacia,
    deleteDelegacia
  };
};

