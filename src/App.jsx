import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import UsersPage from './pages/UsersPage';
import FinancePage from './pages/FinancePage';
import SettingsPage from './pages/SettingsPage';
import ProspeccaoPage from './pages/ProspeccaoPage';
import DelegaciasPage from './pages/DelegaciasPage';
import SuportePage from './pages/SuportePage';
import IntimacoesPage from './pages/IntimacoesPage';
import ColaboradoresPage from './pages/ColaboradoresPage';
import SemPermissaoPage from './pages/SemPermissaoPage';
import SetPasswordPage from './pages/SetPasswordPage';
import EmDesenvolvimentoPage from './pages/EmDesenvolvimentoPage';
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
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />

              <Route path="comercial" element={
                <AdminProtectedRoute menuSlug="prospeccao">
                  <ProspeccaoPage />
                </AdminProtectedRoute>
              } />
              <Route path="propostas" element={
                <AdminProtectedRoute menuSlug="propostas">
                  <EmDesenvolvimentoPage title="Propostas" />
                </AdminProtectedRoute>
              } />
              <Route path="contratos" element={
                <AdminProtectedRoute menuSlug="contratos">
                  <EmDesenvolvimentoPage title="Contratos" />
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
            </Route>
          </Routes>

          <Toaster />
        </BrowserRouter>
      </AdminAuthProvider>
    </ThemeProvider>
  );
}

export default App;
