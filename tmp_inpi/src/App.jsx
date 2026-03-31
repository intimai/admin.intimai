import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/SupabaseAuthContext';
import IdleTimeoutHandler from './components/session/IdleTimeoutHandler';

// Layout
import { Layout } from './components/Layout';

// Route Protection
import ProtectedRoute from './routes/ProtectedRoute';

// Page Components
import { Dashboard } from './pages/Dashboard';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import { AgendaPage } from './pages/AgendaPage';
import { GlossarioPage } from './pages/GlossarioPage';
import { IntimacoesPage } from './pages/IntimacoesPage';
import OrientacoesPage from './pages/OrientacoesPage';
import { PerfilPage } from './pages/PerfilPage';
// import { ConexaoPage } from './pages/ConexaoPage'; // Desabilitado temporariamente
import SuportePage from './pages/SuportePage';
import PoliticaDePrivacidadePage from './pages/PoliticaDePrivacidadePage';
import PrivacidadePublicaPage from './pages/PrivacidadePublicaPage';
import TransparenciaPage from './pages/TransparenciaPage';
import DireitosTitularesPage from './pages/DireitosTitularesPage';
import TermosDeUsoPage from './pages/TermosDeUsoPage';



const AppContent = () => {
  const { user } = useAuth();
  console.log('[AppContent] Renderizado. User:', user ? user.id : 'null');

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      {user && <IdleTimeoutHandler />}
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        
        {/* LGPD Public Routes */}
        <Route path="/privacidade" element={<PrivacidadePublicaPage />} />
        <Route path="/transparencia" element={<TransparenciaPage />} />
        <Route path="/direitos-titulares" element={<DireitosTitularesPage />} />
        <Route path="/termos-de-uso" element={<TermosDeUsoPage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/*" element={
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/intimacoes" element={<IntimacoesPage />} />
                <Route path="/agenda" element={<AgendaPage />} />
                <Route path="/glossario" element={<GlossarioPage />} />
                <Route path="/orientacoes" element={<OrientacoesPage />} />
                <Route path="/perfil" element={<PerfilPage />} />
                {/* <Route path="/conexao" element={<ConexaoPage />} /> */}
                <Route path="/suporte" element={<SuportePage />} />
                <Route path="/politica-de-privacidade" element={<PoliticaDePrivacidadePage />} />
              </Routes>
            </Layout>
          } />
        </Route>
      </Routes>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;