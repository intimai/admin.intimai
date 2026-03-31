import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

export const useContratos = () => {
  const { isAdmin, authLoading } = useAdminAuth();
  const [contratos, setContratos] = useState([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchContratos = useCallback(async (filters = {}) => {
    if (!isAdmin || authLoading) return;
    setLoading(true);
    try {
      let query = supabase
        .from('lead_contratos')
        .select('*, leads(delegacia)')
        .order('created_at', { ascending: false });

      if (filters.status && filters.status !== 'todos') {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;
      if (error) throw error;

      const formattedData = (data || []).map(c => ({
        ...c,
        delegacia_nome: c.leads?.delegacia || 'Delegacia não encontrada'
      }));

      setContratos(formattedData);
    } catch (err) {
      console.error('[useContratos] Erro ao buscar:', err);
      toast({ title: "Erro ao carregar contratos", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [isAdmin, authLoading, toast]);

  const updateStatus = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from('lead_contratos')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      setContratos(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
      toast({ title: "Status atualizado", description: `Contrato marcado como "${newStatus}".` });
    } catch (err) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  };

  const deleteContrato = async (contrato) => {
    try {
      // 1. Storage Deletion
      if (contrato.pdf_url) {
        const parts = contrato.pdf_url.split('/contratos/');
        if (parts.length > 1) {
          const fileName = parts[1];
          await supabase.storage.from('contratos').remove([fileName]);
        }
      }

      // 2. Database Deletion
      const { error } = await supabase.from('lead_contratos').delete().eq('id', contrato.id);
      if (error) throw error;

      setContratos(prev => prev.filter(c => c.id !== contrato.id));
      toast({ title: "Contrato excluído", description: "Registro e arquivo removidos." });
      return { success: true };
    } catch (err) {
      toast({ title: "Erro ao excluir", description: err.message, variant: "destructive" });
      return { success: false };
    }
  };

  useEffect(() => {
    if (isAdmin) fetchContratos();
  }, [isAdmin, fetchContratos]);

  return { contratos, loading, fetchContratos, updateStatus, deleteContrato };
};
