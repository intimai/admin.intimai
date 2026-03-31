import React from 'react';
import { ForgotPasswordForm } from '../components/auth/ForgotPasswordForm';
import { useTheme } from '../contexts/ThemeContext';

const ForgotPasswordPage = () => {
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
        <p className="text-muted-foreground text-lg">Recupere sua senha.</p>
      </div>
      
      <ForgotPasswordForm />
      
    </div>
  );
};

export default ForgotPasswordPage;