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
import AdminLayout from './components/layout/AdminLayout';
import AdminProtectedRoute from './components/layout/AdminProtectedRoute';
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Toaster } from '@/components/ui/toaster';
import { InstallPWA } from './components/InstallPWA';

function App() {
  return (
    <ThemeProvider>
      <AdminAuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            
            <Route path="/" element={
              <AdminProtectedRoute>
                <AdminLayout />
              </AdminProtectedRoute>
            }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            
            <Route path="prospeccao" element={<ProspeccaoPage />} />
            <Route path="delegacias" element={<DelegaciasPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="suporte" element={<SuportePage />} />
            <Route path="finance" element={<FinancePage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
        <InstallPWA />
        <Toaster />
      </BrowserRouter>
    </AdminAuthProvider>
    </ThemeProvider>
  );
}

export default App;
