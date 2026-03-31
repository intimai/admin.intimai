import React from 'react';
import { UpdatePasswordPage } from '../components/auth/UpdatePasswordPage';
import { useTheme } from '../contexts/ThemeContext';

const ResetPasswordPage = () => {
  const { theme } = useTheme();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 space-y-8">
      <div className="text-center">
        <div style={{ height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img 
            src={theme === 'dark' ? '/logo.png' : '/Logo_modo_claro.png'}
            alt="IntimAI Logo" 
            className="mx-auto"
            style={{ width: '174.3px', height: 'auto' }} 
          />
        </div>
        <p className="text-muted-foreground text-lg">Redefina sua senha.</p>
      </div>
      
      <UpdatePasswordPage />
      
    </div>
  );
};

export default ResetPasswordPage;