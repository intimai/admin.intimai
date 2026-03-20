import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/customSupabaseClient';

const AdminAuthContext = createContext({});

export const useAdminAuth = () => useContext(AdminAuthContext);

/**
 * Busca o perfil de acesso ao admin para um usuário autenticado.
 * 
 * Prioridade:
 * 1. Verifica se é super admin via public.usuarios (is_admin = true)
 * 2. Verifica se é colaborador ativo via public.admin_colaboradores
 * 
 * Retorna: { authorized, role, adminMenus, nome } ou null se sem acesso
 */
const fetchAdminProfile = async (authUser) => {
  if (!authUser?.email) return null;

  // 1. Checar super admin na tabela usuarios
  const { data: usuarioData } = await supabase
    .from('usuarios')
    .select('is_admin, nome')
    .eq('email', authUser.email)
    .maybeSingle();

  if (usuarioData?.is_admin === true) {
    return {
      authorized: true,
      role: 'super_admin',
      adminMenus: null, // null = acesso total
      nome: usuarioData.nome || authUser.email,
    };
  }

  // 2. Checar colaborador na tabela admin_colaboradores
  const { data: colaboradorData } = await supabase
    .from('admin_colaboradores')
    .select('role, admin_menus, nome, ativo')
    .eq('email', authUser.email)
    .maybeSingle();

  if (colaboradorData?.ativo === true) {
    return {
      authorized: true,
      role: colaboradorData.role || 'colaborador',
      adminMenus: colaboradorData.admin_menus || null,
      nome: colaboradorData.nome || authUser.email,
    };
  }

  // Sem acesso ao admin
  return null;
};

export const AdminAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [adminMenus, setAdminMenus] = useState(null); // null = todos os menus
  const [role, setRole] = useState(null);
  const initializedRef = useRef(false);

  const applyProfile = (authUser, profile) => {
    if (profile) {
      setUser({ ...authUser, nome: profile.nome });
      setIsAdmin(true);
      setIsSuperAdmin(profile.role === 'super_admin');
      setRole(profile.role);
      setAdminMenus(profile.adminMenus);
    } else {
      setUser(null);
      setIsAdmin(false);
      setIsSuperAdmin(false);
      setRole(null);
      setAdminMenus(null);
    }
  };

  const clearState = () => {
    setUser(null);
    setIsAdmin(false);
    setIsSuperAdmin(false);
    setRole(null);
    setAdminMenus(null);
    setLoading(false);
  };

  useEffect(() => {
    const initSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        const profile = await fetchAdminProfile(session.user);
        applyProfile(session.user, profile);
      }

      setLoading(false);
      initializedRef.current = true;
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[Auth] Evento:', event);

      if (event === 'SIGNED_OUT') {
        clearState();
        return;
      }

      if (event === 'TOKEN_REFRESHED' && session?.user) {
        // Refresh silencioso — não re-busca no banco
        setUser(prev => prev ? { ...prev, ...session.user } : null);
        return;
      }

      if (event === 'SIGNED_IN' && session?.user && initializedRef.current) {
        const profile = await fetchAdminProfile(session.user);
        applyProfile(session.user, profile);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      if (data.user) {
        const profile = await fetchAdminProfile(data.user);
        applyProfile(data.user, profile);

        if (!profile) {
          // Usuário autenticado mas sem acesso ao admin
          await supabase.auth.signOut();
          return { data: null, error: { message: 'Você não tem permissão para acessar o painel administrativo.' } };
        }
      }
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    // clearState será chamado pelo onAuthStateChange (SIGNED_OUT)
  };

  /**
   * Verifica se o usuário tem acesso a um menu específico pelo slug.
   * Super admins e colaboradores com adminMenus = null têm acesso a tudo.
   */
  const hasMenuAccess = (menuSlug) => {
    if (!isAdmin) return false;
    if (adminMenus === null) return true; // acesso total
    return adminMenus.includes(menuSlug);
  };

  return (
    <AdminAuthContext.Provider value={{
      user,
      isAdmin,
      isSuperAdmin,
      role,
      adminMenus,
      loading,
      login,
      logout,
      hasMenuAccess,
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
};