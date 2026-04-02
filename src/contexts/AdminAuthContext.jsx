import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { MENU_CONFIG } from '@/config/menuConfig';

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
  if (!authUser?.email) {
    return null;
  }

  // 1. Checar super admin na tabela usuarios
  const { data: usuarioData, error: usuarioError } = await supabase
    .from('usuarios')
    .select('is_admin, nome')
    .ilike('email', authUser.email)
    .maybeSingle();

  if (usuarioError) console.error('[AuthCheck] Erro na tabela usuarios:', usuarioError);

  if (usuarioData?.is_admin === true) {
    console.log('[AuthCheck] Super Admin identificado');
    return {
      authorized: true,
      role: 'super_admin',
      adminMenus: null,
      nome: usuarioData.nome || authUser.email,
    };
  }

  // 2. Checar colaborador na tabela admin_colaboradores
  const { data: colaboradorData, error: colaboradorError } = await supabase
    .from('admin_colaboradores')
    .select('role, admin_menus, nome, ativo')
    .ilike('email', authUser.email)
    .maybeSingle();

  if (colaboradorError) console.error('[AuthCheck] Erro na tabela admin_colaboradores:', colaboradorError);

  if (colaboradorData) {
    console.log('[AuthCheck] Dados de colaborador encontrados:', { ativo: colaboradorData.ativo });
    if (colaboradorData.ativo === true) {
      return {
        authorized: true,
        role: colaboradorData.role || 'colaborador',
        adminMenus: colaboradorData.admin_menus || null,
        nome: colaboradorData.nome || authUser.email,
      };
    } else {
      console.log('[AuthCheck] Colaborador está inativo');
    }
  } else {
    console.log('[AuthCheck] Nenhum registro encontrado em admin_colaboradores');
  }

  // Sem acesso ao admin
  console.log('[AuthCheck] Acesso NEGADO para:', authUser.email);
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
  const loginInProgressRef = useRef(false);
  const sessionUserRef = useRef(null); // Armazena a ref do usuário para checagens sync

  const applyProfile = (authUser, profile) => {
    sessionUserRef.current = authUser;
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
    sessionUserRef.current = null;
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

        // Pequena pausa para garantir sincronia do JWT com o cliente Supabase
        // antes que os hooks das páginas comecem a carregar dados.
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      setLoading(false);
      initializedRef.current = true;
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
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
        // Se o login() já está lidando com o profile, ignora aqui
        // para evitar race condition que reseta isAdmin
        if (loginInProgressRef.current) {
          return;
        }
        
        // Solução Arquitetural contra Deadlock: 
        // O evento SIGNED_IN global dispara atrasado logo após a função de login()
        // concluir. Se já baixamos o perfil no login, não podemos disparar outra busca
        // simultânea, pois isso enfileira a query exatamente enquanto o contexto muda de página,
        // gerando "hang" silencioso (trava) no client fetcher do Javascript.
        if (sessionUserRef.current?.id === session.user.id && isAdmin) {
          return;
        }

        const profile = await fetchAdminProfile(session.user);
        applyProfile(session.user, profile);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    loginInProgressRef.current = true;
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      // Breve delay para garantir que o cabeçalho de sessão (JWT)
      // seja propagado para as chamadas subsequentes e o RLS funcione.
      await new Promise(resolve => setTimeout(resolve, 500));

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
      loginInProgressRef.current = false;
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('[Auth] Erro ao deslogar:', error);
    } finally {
      // Garantir que o estado seja limpo mesmo se o evento SIGNED_OUT demorar
      clearState();
    }
  };

  /**
   * Verifica se o usuário tem acesso a um menu específico pelo slug.
   * Super admins e colaboradores com adminMenus = null têm acesso a tudo.
   */
  const hasMenuAccess = useCallback((menuSlug) => {
    if (!isAdmin) return false;
    if (adminMenus === null) return true; // acesso total

    // Suporte legado para contas que possuam permissão anterior 'prospeccao' ou 'comercial'
    if (menuSlug === 'pipeline') {
      return adminMenus.includes('pipeline') || adminMenus.includes('prospeccao') || adminMenus.includes('comercial');
    }

    return adminMenus.includes(menuSlug);
  }, [isAdmin, adminMenus]);

  /**
   * Retorna a primeira rota acessível para o usuário logado.
   * Útil para redirecionar colaboradores que não têm acesso ao pipeline.
   */
  const getFirstAccessibleRoute = useCallback(() => {
    if (!isAdmin) return '/login';
    if (adminMenus === null) return '/pipeline'; // acesso total → pipeline

    // Itera pelo MENU_CONFIG na ordem do sidebar e retorna a primeira rota permitida
    for (const group of MENU_CONFIG) {
      if (group.type === 'group') {
        for (const item of group.items) {
          if (!item.isSuperAdminOnly && hasMenuAccess(item.slug)) {
            return item.path;
          }
        }
      } else if (group.type === 'item' && !group.isSuperAdminOnly && hasMenuAccess(group.slug)) {
        return group.path;
      }
    }

    // Fallback: dashboard (sempre acessível)
    return '/dashboard';
  }, [isAdmin, adminMenus, hasMenuAccess]);

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
      getFirstAccessibleRoute,
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
};