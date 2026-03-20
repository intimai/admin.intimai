import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

export const useColaboradores = () => {
    const [colaboradores, setColaboradores] = useState([]);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const fetchColaboradores = useCallback(async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('admin_colaboradores')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setColaboradores(data || []);
        } catch (err) {
            console.error('Erro ao buscar colaboradores:', err);
            toast({
                title: 'Erro ao carregar colaboradores',
                description: err.message,
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchColaboradores();
    }, [fetchColaboradores]);

    /**
     * Cria um novo colaborador via Edge Function.
     * A Edge Function usa a service role key para:
     * 1. Enviar convite por e-mail (auth.admin.inviteUserByEmail)
     * 2. Inserir na tabela admin_colaboradores
     */
    const createColaborador = async (formData) => {
        try {
            const { data, error } = await supabase.functions.invoke('invite-colaborador', {
                body: {
                    nome: formData.nome,
                    email: formData.email,
                    role: formData.role,
                    admin_menus: formData.admin_menus,
                },
            });

            if (error) {
                // FunctionsHttpError — tenta ler o corpo do erro da Edge Function
                let errorMessage = error.message;
                try {
                    const errorBody = await error.context?.json?.();
                    if (errorBody?.error) errorMessage = errorBody.error;
                } catch (_) { }
                console.error('[useColaboradores] Erro da Edge Function:', errorMessage, error);
                throw new Error(errorMessage);
            }

            if (data?.error) {
                console.error('[useColaboradores] Erro no body da resposta:', data.error);
                throw new Error(data.error);
            }

            toast({
                title: 'Convite enviado!',
                description: `Um e-mail de convite foi enviado para ${formData.email}.`,
            });
            await fetchColaboradores();
            return { success: true };
        } catch (err) {
            console.error('[useColaboradores] createColaborador exception:', err);
            toast({
                title: 'Erro ao convidar colaborador',
                description: err.message,
                variant: 'destructive',
            });
            return { success: false, error: err };
        }
    };

    const updateColaborador = async (id, formData) => {
        try {
            const { error } = await supabase
                .from('admin_colaboradores')
                .update(formData)
                .eq('id', id);

            if (error) throw error;

            toast({ title: 'Colaborador atualizado com sucesso!' });
            await fetchColaboradores();
            return { success: true };
        } catch (err) {
            toast({
                title: 'Erro ao atualizar colaborador',
                description: err.message,
                variant: 'destructive',
            });
            return { success: false, error: err };
        }
    };

    const toggleAtivo = async (id, ativo) => {
        try {
            const { error } = await supabase
                .from('admin_colaboradores')
                .update({ ativo: !ativo })
                .eq('id', id);

            if (error) throw error;

            toast({
                title: ativo ? 'Colaborador desativado' : 'Colaborador ativado',
            });
            await fetchColaboradores();
            return { success: true };
        } catch (err) {
            toast({
                title: 'Erro ao alterar status',
                description: err.message,
                variant: 'destructive',
            });
            return { success: false };
        }
    };

    const deleteColaborador = async (id) => {
        try {
            const { error } = await supabase
                .from('admin_colaboradores')
                .delete()
                .eq('id', id);

            if (error) throw error;

            toast({ title: 'Colaborador removido com sucesso!' });
            await fetchColaboradores();
            return { success: true };
        } catch (err) {
            toast({
                title: 'Erro ao excluir colaborador',
                description: err.message,
                variant: 'destructive',
            });
            return { success: false };
        }
    };

    return {
        colaboradores,
        loading,
        createColaborador,
        updateColaborador,
        toggleAtivo,
        deleteColaborador,
        refresh: fetchColaboradores,
    };
};
