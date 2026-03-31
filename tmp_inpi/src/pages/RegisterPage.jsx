import React from 'react';
import { RegisterForm } from '../components/auth/RegisterForm';
import { useTheme } from '../contexts/ThemeContext';

const RegisterPage = () => {
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
        <p className="text-muted-foreground text-lg">Crie sua conta para começar.</p>
      </div>
      
      <RegisterForm />
      
    </div>
  );
};

export default RegisterPage;