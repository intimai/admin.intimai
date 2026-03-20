import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Loader2 } from 'lucide-react';

/**
 * AdminProtectedRoute
 *
 * Props:
 *  - children: componente a renderizar
 *  - menuSlug (opcional): slug do menu para checar permissão específica
 *    Ex: <AdminProtectedRoute menuSlug="prospeccao"> → só quem tem acesso a esse menu passa
 */
const AdminProtectedRoute = ({ children, menuSlug }) => {
  const { isAdmin, loading, hasMenuAccess } = useAdminAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se a rota exige acesso a um menu específico, verificar
  if (menuSlug && !hasMenuAccess(menuSlug)) {
    return <Navigate to="/sem-permissao" replace />;
  }

  return children;
};

export default AdminProtectedRoute;
