import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

export const useUsers = () => {
    const { isAdmin, loading: authLoading } = useAdminAuth();
    const [users, setUsers] = useState([]);
    const [delegaciasDisponiveis, setDelegaciasDisponiveis] = useState([]);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    // Load Delegacias for filter Dropdown
    const fetchDelegacias = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('delegacias')
                .select('delegaciaId, nome')
                .order('nome', { ascending: true });

            if (error) throw error;
            setDelegaciasDisponiveis(data || []);
        } catch (error) {
            console.error('[useUsers] Erro ao buscar lista de delegacias:', error);
        }
    }, []);

    useEffect(() => {
        if (isAdmin) {
            fetchDelegacias();
        }
    }, [isAdmin, fetchDelegacias]);

    const fetchUsers = useCallback(async (delegaciaFilterId = '') => {
        if (authLoading || !isAdmin) return;

        setLoading(true);
        try {
            let query = supabase
                .from('usuarios')
                .select('*')
                .order('nome', { ascending: true });

            if (delegaciaFilterId && delegaciaFilterId !== 'todas') {
                query = query.eq('delegaciaId', delegaciaFilterId);
            }

            const { data, error } = await query;

            if (error) {
                throw error;
            }

            setUsers(data || []);
        } catch (error) {
            console.error('[useUsers] Erro ao buscar usuários:', error);
            toast({
                title: "Erro ao carregar usuários",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }, [isAdmin, authLoading, toast]);

    const createUser = async (userData) => {
        try {
            const { data, error } = await supabase
                .from('usuarios')
                .insert([userData])
                .select()
                .single();

            if (error) throw error;

            toast({
                title: "Sucesso!",
                description: "Usuário criado com sucesso.",
            });
            fetchUsers();
            return { success: true, data };
        } catch (error) {
            console.error('[useUsers] Erro ao criar usuário:', error);
            toast({
                title: "Erro ao criar usuário",
                description: error.message,
                variant: "destructive",
            });
            return { success: false, error };
        }
    };

    const updateUser = async (id, userData) => {
        try {
            const { data, error } = await supabase
                .from('usuarios')
                .update(userData)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            toast({
                title: "Sucesso!",
                description: "Usuário atualizado com sucesso.",
            });
            fetchUsers();
            return { success: true, data };
        } catch (error) {
            console.error('[useUsers] Erro ao atualizar usuário:', error);
            toast({
                title: "Erro ao atualizar usuário",
                description: error.message,
                variant: "destructive",
            });
            return { success: false, error };
        }
    };

    const deleteUser = async (id) => {
        try {
            const { error } = await supabase
                .from('usuarios')
                .delete()
                .eq('id', id);

            if (error) throw error;

            toast({
                title: "Sucesso!",
                description: "Usuário removido com sucesso.",
            });
            fetchUsers();
            return { success: true };
        } catch (error) {
            console.error('[useUsers] Erro ao excluir usuário:', error);
            toast({
                title: "Erro ao excluir usuário",
                description: error.message,
                variant: "destructive",
            });
            return { success: false, error };
        }
    };

    return {
        users,
        delegaciasDisponiveis,
        loading,
        searchUsers: fetchUsers,
        createUser,
        updateUser,
        deleteUser
    };
};
