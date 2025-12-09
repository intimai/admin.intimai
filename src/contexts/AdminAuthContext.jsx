import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';

const AdminAuthContext = createContext({});

export const useAdminAuth = () => useContext(AdminAuthContext);

export const AdminAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const checkingRef = React.useRef(false);
  const lastCheckedUserRef = React.useRef(null);

  useEffect(() => {
    // Check active session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          await checkAdminStatus(session.user);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error checking session:', error);
        setLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Ignorar eventos que não requerem revalidação completa se o usuário não mudou
      if (session?.user) {
        // Se já estamos logados com esse usuário e ele é admin, não precisamos verificar de novo
        // a menos que seja um login explícito (SIGNED_IN)
        if (event === 'SIGNED_IN' || session.user.id !== lastCheckedUserRef.current) {
             await checkAdminStatus(session.user);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
        setLoading(false);
        lastCheckedUserRef.current = null;
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminStatus = async (currentUser) => {
    if (!currentUser?.email) {
      setLoading(false);
      return;
    }

    // Evita verificações repetidas para o mesmo usuário, mas permite se isAdmin ainda não foi confirmado
    if (checkingRef.current) {
        return;
    }
    
    // Se já verificamos este email e o resultado foi sucesso, não precisamos verificar de novo
    // Mas se lastCheckedUserRef for igual ao atual e isAdmin for false, talvez queiramos tentar de novo em um novo login
    if (lastCheckedUserRef.current === currentUser.email && isAdmin) {
        setLoading(false);
        return;
    }

    checkingRef.current = true;
    // Não setamos setLoading(true) aqui para não piscar a tela se já estiver carregada, 
    // mas garantimos que setLoading(false) seja chamado no final

    try {
      console.log('AdminAuthContext: Verificando status de admin para:', currentUser.email);
      
      // Consulta direta e simples, focada no email que é garantido pelo Auth
      // Adicionado .maybeSingle() em vez de .single() para evitar erros 406 se retornar 0 linhas
      // Adicionado timeout manual se necessário, mas o supabase-js já tem timeout padrão
      const { data, error } = await supabase
        .from('usuarios')
        .select('is_admin, nome')
        .eq('email', currentUser.email)
        .maybeSingle();

      if (error) {
        console.warn('AdminAuthContext: Erro ao buscar dados do usuário:', error);
        // Não marcamos como false imediatamente se for um erro de rede temporário, mas para segurança:
        setIsAdmin(false);
      } else if (data) {
        console.log('AdminAuthContext: Dados do usuário encontrados:', data);
        // AQUI ESTÁ A CORREÇÃO PRINCIPAL: Mapeamos is_admin (banco) para isAdmin (app)
        const adminStatus = data.is_admin === true;
        setIsAdmin(adminStatus);
        
        // Atualiza o objeto user com o nome vindo do banco
        setUser(prev => ({ 
            ...currentUser, // Mantém dados do auth
            nome: data.nome || prev?.nome || currentUser.email // Prioriza nome do banco
        }));
        
        lastCheckedUserRef.current = currentUser.email;
      } else {
        console.warn('AdminAuthContext: Usuário não encontrado na tabela usuarios.');
        setIsAdmin(false);
      }

    } catch (err) {
      console.error('AdminAuthContext: Erro inesperado:', err);
      setIsAdmin(false);
    } finally {
      // GARANTIA: Sempre remover o loading, não importa o que aconteça
      console.log('AdminAuthContext: Finalizando verificação. SetLoading(false)');
      setLoading(false);
      checkingRef.current = false;
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        await checkAdminStatus(data.user);
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
    setUser(null);
    setIsAdmin(false);
  };

  return (
    <AdminAuthContext.Provider value={{ user, isAdmin, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};