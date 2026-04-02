import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

/**
 * MenuGuard
 *
 * Componente leve que verifica APENAS a permissão de menu (menuSlug).
 * NÃO verifica loading nem isAdmin — essa responsabilidade é do
 * AdminProtectedRoute externo que envolve o AdminLayout.
 *
 * Isso evita a desmontagem/remontagem de páginas durante a navegação,
 * que era causada pelo guard duplicado mostrando um spinner de tela cheia.
 *
 * Props:
 *  - menuSlug (opcional): slug do menu para checar permissão
 *  - children: componente a renderizar
 */
const MenuGuard = ({ menuSlug, children }) => {
  const { hasMenuAccess } = useAdminAuth();

  if (menuSlug && !hasMenuAccess(menuSlug)) {
    return <Navigate to="/sem-permissao" replace />;
  }

  return children;
};

export default MenuGuard;
