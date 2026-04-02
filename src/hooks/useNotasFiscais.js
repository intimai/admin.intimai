import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

export const useNotasFiscais = () => {
  const { isAdmin, loading: authLoading } = useAdminAuth();
  const [notas, setNotas] = useState([]);
  const [delegacias, setDelegacias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const fetchDelegacias = useCallback(async () => {
    const { data } = await supabase
      .from('delegacias')
      .select('delegaciaId, nome')
      .order('nome', { ascending: true });
    setDelegacias(data || []);
  }, []);

  const fetchNotas = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      let query = supabase
        .from('notas_fiscais')
        .select('*, delegacias:delegaciaId(nome)')
        .order('created_at', { ascending: false });

      if (filters.delegaciaId && filters.delegaciaId !== 'todas') {
        query = query.eq('delegaciaId', filters.delegaciaId);
      }
      if (filters.status && filters.status !== 'todos') {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Resolve o nome da delegacia via JOIN
      const notasComDelegacia = (data || []).map(n => ({
        ...n,
        delegacia_nome: n.delegacias?.nome || ''
      }));

      setNotas(notasComDelegacia);
    } catch (err) {
      console.error('[useNotasFiscais] Erro ao buscar:', err);
      toast({ title: "Erro ao carregar NF-e", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const uploadNota = async ({ file, delegaciaId, numero_nf, valor, data_emissao, descricao }) => {
    setUploading(true);
    try {
      // 1. Upload do arquivo para o Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `nf_${delegaciaId}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('notas-fiscais')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      // 2. Gerar URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('notas-fiscais')
        .getPublicUrl(fileName);

      const arquivo_url = publicUrl;

      // 3. Inserir registro na tabela (sem delegacia_nome - resolve via JOIN)
      const { data, error: dbError } = await supabase.from('notas_fiscais').insert([{
        delegaciaId,
        numero_nf,
        valor: parseFloat(valor) || 0,
        data_emissao: data_emissao || null,
        descricao,
        arquivo_url,
        arquivo_nome: file.name,
        status: 'pendente'
      }]).select().single();

      if (dbError) throw dbError;

      toast({ title: "NF-e registrada!", description: `Nota ${numero_nf} salva com sucesso.` });
      await fetchNotas();
      return { success: true, data };
    } catch (err) {
      console.error('[useNotasFiscais] Erro no upload:', err);
      toast({ title: "Erro ao registrar NF-e", description: err.message, variant: "destructive" });
      return { success: false, error: err };
    } finally {
      setUploading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from('notas_fiscais')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      setNotas(prev => prev.map(n => n.id === id ? { ...n, status: newStatus } : n));
      toast({ title: "Status atualizado", description: `NF-e marcada como "${newStatus}".` });
    } catch (err) {
      console.error('[useNotasFiscais] Erro ao atualizar status:', err);
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  };

  const deleteNota = async (nota) => {
    try {
      // 1. Storage Deletion
      if (nota.arquivo_url) {
        // Pega o nome do arquivo da URL (ex: .../notas-fiscais/nf_123.pdf)
        const parts = nota.arquivo_url.split('/notas-fiscais/');
        if (parts.length > 1) {
          const fileName = parts[1];
          await supabase.storage.from('notas-fiscais').remove([fileName]);
        }
      }

      // 2. Banco Deletion
      const { error } = await supabase.from('notas_fiscais').delete().eq('id', nota.id);
      if (error) throw error;

      setNotas(prev => prev.filter(n => n.id !== nota.id));
      toast({ title: "NF-e excluída", description: "Registro e arquivo removidos com sucesso." });
      return { success: true };
    } catch (err) {
      toast({ title: "Erro ao excluir", description: err.message, variant: "destructive" });
      return { success: false };
    }
  };

  useEffect(() => {
    if (isAdmin && !authLoading) {
      fetchDelegacias();
      fetchNotas();
    }
  }, [isAdmin, authLoading]);

  return { notas, delegacias, loading, uploading, fetchNotas, uploadNota, updateStatus, deleteNota };
};
