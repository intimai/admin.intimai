import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

// --- Componentes de Estado ---

const LoadingState = () => (
  <div className="flex items-center space-x-2">
    <Loader2 className="h-5 w-5 animate-spin" />
    <p>Verificando status da conexão...</p>
  </div>
);

const ConnectedState = ({ onDisconnect }) => (
  <div className="text-center">
    <p className="text-green-500 font-bold text-lg mb-6 p-12">✅ Conectado</p>
    <Button onClick={onDisconnect} className="w-full btn-destructive">
      Desconectar
    </Button>
  </div>
);

const DisconnectedState = ({ onConnect, isConnecting }) => (
  <div className="text-center">
    <p className="text-yellow-500 font-bold text-lg mb-4">⚠️ Desconectado</p>
    <p className="mb-4">Clique no botão abaixo para gerar o QR Code e conectar.</p>
    <Button onClick={onConnect} disabled={isConnecting} className="mt-4 btn-primary w-full">
      {isConnecting ? (
        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Gerando QR Code...</>
      ) : (
        'Conectar'
      )}
    </Button>
  </div>
);

const QrCodeDisplay = ({ qrCode, onRetry, countdown }) => (
  <div className="text-center">
    <p className="text-yellow-500 font-bold text-lg mb-4">⚠️ Escaneie para Conectar</p>
    <p className="mb-4">Abra o WhatsApp no celular da delegacia e escaneie o código abaixo.</p>
    {qrCode ? (
      <div className="mt-4 p-4 bg-white rounded-lg inline-block border">
        <img src={qrCode} alt="QR Code para conectar ao WhatsApp" className="w-64 h-64" />
        {countdown !== null && (
          <p className="mt-4 text-2xl font-bold text-blue-600">Tempo: {countdown}s</p>
        )}
      </div>
    ) : (
      <p className="mt-2 text-sm text-gray-400">Carregando QR Code...</p>
    )}
    <br />
    <Button onClick={onRetry} className="mt-4 btn-primary w-full">
      Atualizar QR Code
    </Button>
  </div>
);

const ErrorState = ({ onRetry }) => (
  <div className="text-center">
    <p className="text-red-500 font-bold text-lg mb-6 pt-8 pb-12 px-12">❌ Erro na Conexão</p>
    <p className="text-sm text-gray-400 -mt-8 mb-4">
      Não foi possível verificar o status. <br />
      Por favor, tente novamente em alguns segundos <br /> ou entre em contato com o suporte.
    </p>
    <Button onClick={onRetry} className="mt-4 w-full btn-destructive">
      Tentar Novamente
    </Button>
  </div>
);


// --- Componente Principal ---

export const ConexaoPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [connectionStatus, setConnectionStatus] = useState('loading'); // 'loading', 'connected', 'disconnected', 'error', 'showing_qr'
  const [qrCode, setQrCode] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false); // Para o estado de carregamento do botão "Conectar"
  const [countdown, setCountdown] = useState(null);
  const [countdownInterval, setCountdownInterval] = useState(null);


  // MODO DE SIMULAÇÃO: Altere para 'connected', 'disconnected', 'error' ou 'loading' para testar a UI.
  const [simulationMode] = useState(null); // Defina como null para usar a API real

  const checkConnection = useCallback(async (showLoading = true) => {
    if (simulationMode) {
      setConnectionStatus(simulationMode);
      return;
    }

    if (!user?.delegaciaId) {
      setConnectionStatus('error');
      return;
    }

    if (showLoading) {
      setConnectionStatus('loading');
    }

    try {
      const { data, error } = await supabase.functions.invoke('manage-evolution-instance', {
        body: { delegaciaId: user.delegaciaId, action: 'status' }, // Ação para verificar o status
      });

      if (error) throw new Error(error.message);

      if (data.instance?.state === 'open') {
        setConnectionStatus('connected');
        setQrCode(null);
      } else {
        setConnectionStatus('disconnected');
      }
    } catch (err) {
      setConnectionStatus('error');
      console.error(err);
    }
  }, [user, simulationMode]);

  useEffect(() => {
    if (!user?.delegaciaId) return;

    const channel = supabase
      .channel(`delegacia-status-change:${user.delegaciaId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'delegacias',
          filter: `delegaciaId=eq.${user.delegaciaId}`, // CORREÇÃO: Usar a coluna correta
        },
        (payload) => {
          const newStatus = payload.new.connection_status;

          // CORREÇÃO: O backend já envia o status correto, não precisa mapear novamente.
          if (newStatus && newStatus !== connectionStatus) {
            setConnectionStatus(newStatus);

            // Se o novo status for 'connected', limpa o QR code e o contador.
            if (newStatus === 'connected') {
              setQrCode(null);
              if (countdownInterval) {
                clearInterval(countdownInterval);
                setCountdownInterval(null);
              }
              setCountdown(null);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.delegaciaId]);

  const handleConnect = async () => {
    setIsConnecting(true);
    setQrCode(null); // Limpa o QR antigo
    if (countdownInterval) {
      clearInterval(countdownInterval);
    }
    setCountdown(null);


    try {
      // Agora, gera o QR Code
      const { data, error } = await supabase.functions.invoke('manage-evolution-instance', {
        body: { delegaciaId: user.delegaciaId, action: 'connect' }, // Ação para gerar QR Code
      });

      if (error) throw new Error(error.message);
      
      if (data.base64) {
        setQrCode(data.base64);
        setConnectionStatus('showing_qr');
        setCountdown(60); // Inicia o contador

        const interval = setInterval(() => {
          setCountdown((prevCountdown) => {
            if (prevCountdown === null || prevCountdown <= 1) {
              clearInterval(interval);
              setQrCode(null);
              // Only revert to disconnected if we were in the process of showing the QR code.
              // If we are already 'connected', do nothing.
              setConnectionStatus((prevStatus) => 
                prevStatus === 'showing_qr' ? 'disconnected' : prevStatus
              );
              return null;
            }
            return prevCountdown - 1;
          });
        }, 1000);
        setCountdownInterval(interval);
      } else {
        setConnectionStatus('error');
        toast({
          variant: 'destructive', title: 'Erro', description: 'Não foi possível obter o QR Code.'
        });
        setConnectionStatus('disconnected'); // Volta ao estado desconectado
      }
    } catch (err) {
      toast({ variant: 'destructive', title: 'Erro ao gerar QR Code', description: err.message });
      setConnectionStatus('disconnected'); // Volta ao estado desconectado
    } finally {
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  const handleDisconnect = async () => {
    setConnectionStatus('loading');
    try {
      const { error } = await supabase.functions.invoke('manage-evolution-instance', {
        body: { delegaciaId: user.delegaciaId, action: 'disconnect' },
      });

      if (error) throw new Error(error.message);

      toast({ title: 'Sucesso', description: 'A instância foi desconectada.' });
      setConnectionStatus('disconnected');

    } catch (err) {
      toast({ variant: 'destructive', title: 'Erro ao desconectar', description: err.message });
      checkConnection(false); // Re-verifica o status para ter certeza
    }
  }

  const renderStatus = () => {
    switch (connectionStatus) {
      case 'connected':
        return <ConnectedState onDisconnect={handleDisconnect} />;
      case 'disconnected':
        return <DisconnectedState onConnect={handleConnect} isConnecting={isConnecting} />;
      case 'showing_qr':
        return <QrCodeDisplay qrCode={qrCode} onRetry={handleConnect} countdown={countdown} />;
      case 'error':
        return <ErrorState onRetry={checkConnection} />;
      case 'loading':
      default:
        return <LoadingState />;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardContent className="p-4">
          <h2 className="text-2xl font-bold active-link-gradient italic">Conexão com o WhatsApp</h2>
          <p className="page-subtitle">Gerencie a conexão da sua delegacia com o WhatsApp para o envio de intimações.</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <h3 className="text-lg font-semibold">Status da Conexão</h3>
          {renderStatus()}
        </CardContent>
      </Card>
    </div>
  );
};