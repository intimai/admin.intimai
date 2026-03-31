import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

export const usePropostas = () => {
  const { isAdmin, authLoading } = useAdminAuth();
  const [propostas, setPropostas] = useState([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchPropostas = useCallback(async (filters = {}) => {
    if (!isAdmin || authLoading) return;
    setLoading(true);
    try {
      let query = supabase
        .from('lead_propostas')
        .select('*, leads(delegacia)')
        .order('created_at', { ascending: false });

      if (filters.status && filters.status !== 'todos') {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;
      if (error) throw error;

      const formattedData = (data || []).map(p => ({
        ...p,
        delegacia_nome: p.leads?.delegacia || 'Delegacia não encontrada'
      }));

      setPropostas(formattedData);
    } catch (err) {
      console.error('[usePropostas] Erro ao buscar:', err);
      toast({ title: "Erro ao carregar propostas", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [isAdmin, authLoading, toast]);

  const updateStatus = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from('lead_propostas')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      setPropostas(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
      toast({ title: "Status atualizado", description: `Proposta marcada como "${newStatus}".` });
    } catch (err) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  };

  const deleteProposta = async (proposta) => {
    try {
      // 1. Extrair nome do arquivo da URL para deletar do Storage
      // URL: .../storage/v1/object/public/propostas/arquivo.pdf
      if (proposta.pdf_url) {
        const parts = proposta.pdf_url.split('/propostas/');
        if (parts.length > 1) {
          const fileName = parts[1];
          const { error: storageError } = await supabase.storage
            .from('propostas')
            .remove([fileName]);
          
          if (storageError) console.warn('[usePropostas] Erro ao deletar arquivo do storage:', storageError);
        }
      }

      // 2. Deletar do Banco
      const { error } = await supabase.from('lead_propostas').delete().eq('id', proposta.id);
      if (error) throw error;

      setPropostas(prev => prev.filter(p => p.id !== proposta.id));
      toast({ title: "Proposta excluída", description: "Registro e arquivo removidos com sucesso." });
      return { success: true };
    } catch (err) {
      toast({ title: "Erro ao excluir", description: err.message, variant: "destructive" });
      return { success: false };
    }
  };

  useEffect(() => {
    if (isAdmin) fetchPropostas();
  }, [isAdmin, fetchPropostas]);

  return { propostas, loading, fetchPropostas, updateStatus, deleteProposta };
};
