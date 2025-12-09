import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Download, Share } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

export function InstallPWA() {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Detectar se é iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(ios);

    // Detectar se já está instalado (standalone)
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(standalone);
    console.log('[InstallPWA] Estado inicial:', { ios, standalone });

    const handler = (e) => {
      e.preventDefault();
      console.log('[InstallPWA] Evento beforeinstallprompt disparado!');
      setSupportsPWA(true);
      setPromptInstall(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const onClick = (evt) => {
    evt.preventDefault();
    if (!promptInstall) {
      return;
    }
    promptInstall.prompt();
    promptInstall.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('Usuário aceitou a instalação');
      } else {
        console.log('Usuário recusou a instalação');
      }
      setPromptInstall(null);
    });
  };

  // Se já estiver instalado, não mostra nada
  if (isStandalone) {
      console.log('[InstallPWA] App já está em modo standalone (instalado). Botão oculto.');
      return null;
  }

  // Lógica para Android/Desktop
  if (supportsPWA) {
    return (
      <Button 
        onClick={onClick}
        className="fixed bottom-4 right-4 z-[9999] shadow-lg animate-bounce"
        variant="default"
      >
        <Download className="mr-2 h-4 w-4" />
        Instalar Admin
      </Button>
    );
  }

  // Debug mode removido após confirmação de funcionamento

  // Lógica para iOS (sempre mostra se for iOS e não estiver instalado, pois iOS não tem evento de prompt)
  if (isIOS) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button 
            className="fixed bottom-4 right-4 z-[9999] shadow-lg animate-bounce"
            variant="default"
          >
            <Download className="mr-2 h-4 w-4" />
            Instalar Admin
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Instalar IntimAI Admin</DialogTitle>
            <DialogDescription className="space-y-4 pt-4">
              <p>Para instalar este painel no seu dispositivo iOS:</p>
              <ol className="list-decimal list-inside space-y-2">
                <li>Toque no botão de compartilhamento <Share className="inline h-4 w-4" /> na barra inferior do navegador.</li>
                <li>Role para baixo e selecione "Adicionar à Tela de Início".</li>
              </ol>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  console.log('[InstallPWA] Não suporta instalação ou evento ainda não disparou.');
  return null;
}