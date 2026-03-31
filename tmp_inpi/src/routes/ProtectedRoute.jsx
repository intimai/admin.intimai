import React, { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { motion } from 'framer-motion';
import ConsentModal from '../components/auth/ConsentModal';

const ProtectedRoute = () => {
  const { user, loading, needsConsent, acceptTerms } = useAuth();
  const [isAccepting, setIsAccepting] = useState(false);
  
  console.log('[ProtectedRoute] Renderizado. User:', user ? user.id : 'null', 'Loading:', loading);

  const handleAcceptTerms = async () => {
    setIsAccepting(true);
    try {
      const success = await acceptTerms();
      if (!success) {
        alert('Erro ao aceitar os termos. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao aceitar termos:', error);
      alert('Erro ao aceitar os termos. Tente novamente.');
    } finally {
      setIsAccepting(false);
    }
  };

  const handleDeclineTerms = async () => {
    if (confirm('Você não poderá utilizar o sistema sem aceitar os termos. Deseja sair?')) {
      // Fazer logout se não aceitar
      window.location.href = '/login';
    }
  };

  if (loading) {
    console.log('[ProtectedRoute] Mostrando loading spinner.');
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    console.log('[ProtectedRoute] Usuário não logado. Redirecionando para /login.');
    return <Navigate to="/login" replace />;
  }

  console.log('[ProtectedRoute] Usuário logado. Renderizando Outlet.');
  return (
    <>
      <Outlet />
      <ConsentModal
        isOpen={needsConsent}
        onAccept={handleAcceptTerms}
        onDecline={handleDeclineTerms}
        isLoading={isAccepting}
      />
    </>
  );
};

export default ProtectedRoute;