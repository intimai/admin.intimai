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
import AdminLayout from './components/layout/AdminLayout';
import AdminProtectedRoute from './components/layout/AdminProtectedRoute';
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Toaster } from '@/components/ui/toaster';

function App() {
  return (
    <ThemeProvider>
      <AdminAuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/set-password" element={<SetPasswordPage />} />
            <Route path="/sem-permissao" element={<SemPermissaoPage />} />

            <Route path="/" element={
              <AdminProtectedRoute>
                <AdminLayout />
              </AdminProtectedRoute>
            }>
              <Route index element={<Navigate to="/pipeline" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              
              <Route path="conexoes" element={
                <AdminProtectedRoute menuSlug="conexoes">
                  <EmDesenvolvimentoPage title="Conexões e Integrações (Meta)" />
                </AdminProtectedRoute>
              } />
              <Route path="monitoramento-ia" element={
                <AdminProtectedRoute menuSlug="monitoramento-ia">
                  <MonitoramentoIAPage />
                </AdminProtectedRoute>
              } />
              <Route path="auditoria" element={
                <AdminProtectedRoute menuSlug="auditoria">
                  <AuditoriaPage />
                </AdminProtectedRoute>
              } />

              <Route path="pipeline" element={
                <AdminProtectedRoute menuSlug="pipeline">
                  <PipelinePage />
                </AdminProtectedRoute>
              } />
              <Route path="chat" element={
                <AdminProtectedRoute menuSlug="chat">
                  <EmDesenvolvimentoPage title="Chat com Clientes" />
                </AdminProtectedRoute>
              } />
              <Route path="propostas" element={
                <AdminProtectedRoute menuSlug="propostas">
                  <PropostasPage />
                </AdminProtectedRoute>
              } />
              <Route path="contratos" element={
                <AdminProtectedRoute menuSlug="contratos">
                  <ContratosPage />
                </AdminProtectedRoute>
              } />
              <Route path="nfe" element={
                <AdminProtectedRoute menuSlug="nfe">
                  <EmDesenvolvimentoPage title="NF-e" />
                </AdminProtectedRoute>
              } />
              <Route path="delegacias" element={
                <AdminProtectedRoute menuSlug="delegacias">
                  <DelegaciasPage />
                </AdminProtectedRoute>
              } />
              <Route path="users" element={
                <AdminProtectedRoute menuSlug="users">
                  <UsersPage />
                </AdminProtectedRoute>
              } />
              <Route path="suporte" element={
                <AdminProtectedRoute menuSlug="suporte">
                  <SuportePage />
                </AdminProtectedRoute>
              } />
              <Route path="intimacoes" element={
                <AdminProtectedRoute menuSlug="intimacoes">
                  <IntimacoesPage />
                </AdminProtectedRoute>
              } />
              <Route path="finance" element={
                <AdminProtectedRoute menuSlug="finance">
                  <FinancePage />
                </AdminProtectedRoute>
              } />
              <Route path="settings" element={
                <AdminProtectedRoute menuSlug="settings">
                  <SettingsPage />
                </AdminProtectedRoute>
              } />
              {/* Apenas super_admin pode gerenciar colaboradores */}
              <Route path="colaboradores" element={
                <AdminProtectedRoute menuSlug="colaboradores">
                  <ColaboradoresPage />
                </AdminProtectedRoute>
              } />

              {/* Categoria: Financeiro (em desenvolvimento) */}
              <Route path="contas-pagar" element={
                <AdminProtectedRoute menuSlug="contas-pagar">
                  <EmDesenvolvimentoPage title="Contas a Pagar" />
                </AdminProtectedRoute>
              } />
              <Route path="contas-receber" element={
                <AdminProtectedRoute menuSlug="contas-receber">
                  <EmDesenvolvimentoPage title="Contas a Receber" />
                </AdminProtectedRoute>
              } />
              <Route path="receitas" element={
                <AdminProtectedRoute menuSlug="receitas">
                  <EmDesenvolvimentoPage title="Receitas" />
                </AdminProtectedRoute>
              } />
              <Route path="despesas" element={
                <AdminProtectedRoute menuSlug="despesas">
                  <EmDesenvolvimentoPage title="Despesas" />
                </AdminProtectedRoute>
              } />
              <Route path="relatorios-financeiros" element={
                <AdminProtectedRoute menuSlug="relatorios-financeiros">
                  <EmDesenvolvimentoPage title="Relatórios Financeiros" />
                </AdminProtectedRoute>
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
