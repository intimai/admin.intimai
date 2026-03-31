import React from 'react';
import { LoginForm } from '../components/auth/LoginForm';
import { useTheme } from '../contexts/ThemeContext';
import { InstallPWA } from '../components/InstallPWA';

const LoginPage = () => {
  const { theme } = useTheme();

  console.log('[LoginPage] Renderizado.');

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen bg-background p-4 ${theme === 'light' ? 'space-y-2' : 'space-y-8'}`}>
      <div className="text-center">
        <div style={{ height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img 
            src={theme === 'dark' ? '/logo.png' : '/Logo_modo_claro.png'}
            alt="IntimAI Logo" 
            className="mx-auto"
            style={{ width: '174.3px', height: 'auto' }} 
          />
        </div>
        <p className="text-muted-foreground text-lg">Gestão inteligente de intimações policiais.</p>
      </div>
      
      <LoginForm />
      <InstallPWA />
      
    </div>
  );
};

export default LoginPage;