import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import UsersPage from './pages/UsersPage';
import FinancePage from './pages/FinancePage';
import SettingsPage from './pages/SettingsPage';
import PipelinePage from './pages/PipelinePage';
import DelegaciasPage from './pages/DelegaciasPage';
import SuportePage from './pages/SuportePage';
import IntimacoesPage from './pages/IntimacoesPage';
import ColaboradoresPage from './pages/ColaboradoresPage';
import SemPermissaoPage from './pages/SemPermissaoPage';
import SetPasswordPage from './pages/SetPasswordPage';
import EmDesenvolvimentoPage from './pages/EmDesenvolvimentoPage';
import PropostasPage from './pages/PropostasPage';
import ContratosPage from './pages/ContratosPage';
import AuditoriaPage from './pages/AuditoriaPage';
import MonitoramentoIAPage from './pages/MonitoramentoIAPage';
import NFePage from './pages/NFePage';
import ConexoesPage from './pages/ConexoesPage';
import FaturasPage from './pages/FaturasPage';
import DespesasPage from './pages/DespesasPage';
import AdminLayout from './components/layout/AdminLayout';
import AdminProtectedRoute from './components/layout/AdminProtectedRoute';
import MenuGuard from './components/layout/MenuGuard';
import { AdminAuthProvider, useAdminAuth } from './contexts/AdminAuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Toaster } from '@/components/ui/toaster';

// Componente auxiliar que redireciona para a primeira rota acessível do colaborador
const SmartRedirect = () => {
  const { getFirstAccessibleRoute } = useAdminAuth();
  return <Navigate to={getFirstAccessibleRoute()} replace />;
};

function App() {
  return (
    <ThemeProvider>
      <AdminAuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/set-password" element={<SetPasswordPage />} />
            <Route path="/sem-permissao" element={<SemPermissaoPage />} />

            {/* Guard externo: verifica auth (loading + isAdmin). 
                Garante que só admins autenticados acessem qualquer rota interna. */}
            <Route path="/" element={
              <AdminProtectedRoute>
                <AdminLayout />
              </AdminProtectedRoute>
            }>
              <Route index element={<SmartRedirect />} />
              <Route path="dashboard" element={<Dashboard />} />
              
              {/* MenuGuard: verifica APENAS permissão de menu (hasMenuAccess).
                  Não re-verifica loading/isAdmin — já garantido pelo guard externo. */}
              <Route path="conexoes" element={
                <MenuGuard menuSlug="conexoes">
                  <ConexoesPage />
                </MenuGuard>
              } />
              <Route path="monitoramento-ia" element={
                <MenuGuard menuSlug="monitoramento-ia">
                  <MonitoramentoIAPage />
                </MenuGuard>
              } />
              <Route path="auditoria" element={
                <MenuGuard menuSlug="auditoria">
                  <AuditoriaPage />
                </MenuGuard>
              } />

              <Route path="pipeline" element={
                <MenuGuard menuSlug="pipeline">
                  <PipelinePage />
                </MenuGuard>
              } />
              <Route path="chat" element={
                <MenuGuard menuSlug="chat">
                  <EmDesenvolvimentoPage title="Chat com Clientes" />
                </MenuGuard>
              } />
              <Route path="propostas" element={
                <MenuGuard menuSlug="propostas">
                  <PropostasPage />
                </MenuGuard>
              } />
              <Route path="contratos" element={
                <MenuGuard menuSlug="contratos">
                  <ContratosPage />
                </MenuGuard>
              } />
              <Route path="nfe" element={
                <MenuGuard menuSlug="nfe">
                  <NFePage />
                </MenuGuard>
              } />
              <Route path="delegacias" element={
                <MenuGuard menuSlug="delegacias">
                  <DelegaciasPage />
                </MenuGuard>
              } />
              <Route path="users" element={
                <MenuGuard menuSlug="users">
                  <UsersPage />
                </MenuGuard>
              } />
              <Route path="suporte" element={
                <MenuGuard menuSlug="suporte">
                  <SuportePage />
                </MenuGuard>
              } />
              <Route path="intimacoes" element={
                <MenuGuard menuSlug="intimacoes">
                  <IntimacoesPage />
                </MenuGuard>
              } />
              <Route path="finance" element={
                <MenuGuard menuSlug="finance">
                  <FinancePage />
                </MenuGuard>
              } />
              <Route path="settings" element={
                <MenuGuard menuSlug="settings">
                  <SettingsPage />
                </MenuGuard>
              } />
              {/* Apenas super_admin pode gerenciar colaboradores */}
              <Route path="colaboradores" element={
                <MenuGuard menuSlug="colaboradores">
                  <ColaboradoresPage />
                </MenuGuard>
              } />

              {/* Módulo: Financeiro */}
              <Route path="faturas" element={
                <MenuGuard menuSlug="faturas">
                  <FaturasPage />
                </MenuGuard>
              } />
              <Route path="despesas" element={
                <MenuGuard menuSlug="despesas">
                  <DespesasPage />
                </MenuGuard>
              } />
            </Route>
          </Routes>

          <Toaster />
        </BrowserRouter>
      </AdminAuthProvider>
    </ThemeProvider>
  );
}

export default App;
