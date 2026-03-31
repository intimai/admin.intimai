import React, { useState } from 'react';
import { useIdleTimer } from 'react-idle-timer';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import SessionTimeoutModal from './SessionTimeoutModal';

const IDLE_TIMEOUT = 60 * 60 * 1000; // 1 hora em milissegundos
const COUNTDOWN_DURATION = 60; // 1 minuto em segundos

function IdleTimeoutHandler({ children }) {
  const { signOut } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleIdle = () => {
    setIsModalOpen(true);
  };

  const handleActive = () => {
    setIsModalOpen(false);
  };

  const { reset, getRemainingTime } = useIdleTimer({
    onIdle: handleIdle,
    onActive: handleActive,
    timeout: 1000 * 60 * 60, // 1 hora
    promptBeforeIdle: 1000 * 60 * 1, // 1 minuto de aviso
    throttle: 500,
  });

  const handleStayLoggedIn = () => {
    setIsModalOpen(false);
    reset();
  };

  return (
    <>
      {children}
      <SessionTimeoutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onStayLoggedIn={handleStayLoggedIn}
        onLogout={signOut}
        remainingTime={getRemainingTime()}
      />
    </>
  );
};

export default IdleTimeoutHandler;