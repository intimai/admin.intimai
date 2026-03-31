import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

const SessionTimeoutModal = ({ isOpen, onStayLoggedIn, onLogout, remainingTime }) => {
  const [countdown, setCountdown] = useState(Math.ceil(remainingTime / 1000));

  useEffect(() => {
    if (!isOpen) return;

    setCountdown(Math.ceil(remainingTime / 1000));

    const interval = setInterval(() => {
      setCountdown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, remainingTime]);

  useEffect(() => {
    if (countdown === 0 && isOpen) {
      onLogout();
    }
  }, [countdown, isOpen, onLogout]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onStayLoggedIn}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Você ainda está aí?</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p>Sua sessão será encerrada por inatividade em {countdown} segundos.</p>
          <p>Para continuar trabalhando, clique no botão abaixo.</p>
        </div>
        <DialogFooter>
          <Button onClick={onLogout} variant="outline">Sair</Button>
          <Button onClick={onStayLoggedIn}>Continuar Logado</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SessionTimeoutModal;