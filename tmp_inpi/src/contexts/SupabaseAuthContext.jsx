import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { auditService } from '@/lib/auditService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [needsConsent, setNeedsConsent] = useState(false);

  const fetchSessionAndProfile = async (session) => {
    console.log('[AuthContext] fetchSessionAndProfile chamado. Session:', session ? 'Presente' : 'Nula');
    setLoading(true);
    try {
      if (session) {
        console.log('[AuthContext] Buscando perfil do usuário:', session.user.id);
        const { data: userProfile, error: userProfileError } = await supabase
          .from('usuarios')
          .select('*')
          .eq('userId', session.user.id)
          .single();

        if (userProfileError) console.error('[AuthContext] Erro ao buscar perfil:', userProfileError);
        if (!userProfile) console.warn('[AuthContext] Perfil não encontrado');
        if (userProfile && !userProfile.delegaciaId) console.warn('[AuthContext] Perfil sem delegaciaId');

        if (userProfileError || !userProfile || !userProfile.delegaciaId) {
          console.log('[AuthContext] Perfil inválido. Definindo user como null.');
          setUser(null);
          return;
        }

        const { data: delegaciaData, error: delegaciaError } = await supabase
          .from('delegacias')
          .select('nome, endereco, cidadeEstado')
          .eq('delegaciaId', userProfile.delegaciaId)
          .single();

        if (delegaciaError || !delegaciaData) {
          console.log('[AuthContext] Delegacia não encontrada ou erro. Definindo user como null.');
          setUser(null);
          return;
        }

        const finalUser = {
          ...session.user,
          ...userProfile,
          delegaciaNome: delegaciaData.nome,
          delegaciaEndereco: `${delegaciaData.endereco}, ${delegaciaData.cidadeEstado}`,
        };

        const needsTermsAcceptance = !userProfile.terms_accepted_at;
        setNeedsConsent(needsTermsAcceptance);
        setUser(finalUser);
      } else {
        console.log('[AuthContext] Sem sessão. Definindo user como null.');
        setUser(null);
      }
    } finally {
      setLoading(false);
      console.log('[AuthContext] Loading definido como false.');
    }
  };

  useEffect(() => {
    setLoading(true);
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`[AuthContext] onAuthStateChange: ${event}`);
      await fetchSessionAndProfile(session);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signUp = (email, password, metadata = {}) => supabase.auth.signUp({ 
    email, 
    password,
    options: {
      data: metadata
    }
  });

  const signIn = (email, password) => supabase.auth.signInWithPassword({ email, password });

  const signOut = () => supabase.auth.signOut();

  const passwordRecovery = (email) => supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/update-password`,
  });

  const updateUser = (credentials) => supabase.auth.updateUser(credentials);

  const acceptTerms = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('usuarios')
        .update({ terms_accepted_at: new Date().toISOString() })
        .eq('userId', user.userId);
      
      if (error) {
        console.error('Erro ao aceitar termos:', error);
        return false;
      }
      
      setNeedsConsent(false);
      
      // Atualizar o user local com a data de aceite
      setUser(prev => ({
        ...prev,
        terms_accepted_at: new Date().toISOString()
      }));

      // Registrar log de auditoria
      await auditService.logAcceptTerms(user);
      
      return true;
    } catch (error) {
      console.error('Erro ao aceitar termos:', error);
      return false;
    }
  };

  const value = {
    signUp,
    signIn,
    signOut,
    passwordRecovery,
    updateUser,
    acceptTerms,
    user,
    loading,
    needsConsent,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};