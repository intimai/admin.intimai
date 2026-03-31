import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ConsentModal = ({ isOpen, onAccept, onDecline, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px'
      }}
    >
      <div 
        style={{
          backgroundColor: '#000000',
          border: '1px solid #333333',
          borderRadius: '8px',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto'
        }}
      >
        <Card className="bg-transparent border-none">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <img 
                src="/logo.png" 
                alt="IntimAI Logo" 
                className="h-12 w-auto"
              />
            </div>
            <CardTitle className="text-xl font-semibold text-white">
              Consentimento LGPD - Tratamento de Dados
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4 text-gray-300">
            <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
              <h3 className="font-semibold text-blue-300 mb-2">
                📋 Sobre o Sistema IntimAI
              </h3>
              <p className="text-sm">
                Este sistema é destinado exclusivamente a <strong>policiais civis</strong> para 
                gestão e entrega de intimações via WhatsApp utilizando Inteligência Artificial.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-white">
                🔒 Tratamento de Dados de Terceiros (Intimados)
              </h3>
              
              <p className="text-sm leading-relaxed">
                Como policial civil, você irá <strong>inserir e manipular dados pessoais de terceiros</strong> 
                (intimados), incluindo:
              </p>
              
              <ul className="text-sm space-y-1 ml-4">
                <li>• Nome completo e documentos (CPF/RG)</li>
                <li>• Números de telefone e endereços</li>
                <li>• Informações processuais e de intimações</li>
                <li>• Histórico de comunicações via WhatsApp</li>
              </ul>

              <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-3 mt-4">
                <p className="text-sm text-yellow-300">
                  <strong>⚠️ Responsabilidade Legal:</strong> Como agente público, você possui 
                  prerrogativa legal para manipular estes dados conforme suas atribuições funcionais, 
                  sendo responsável pelo uso adequado das informações.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-white">
                📋 Seus Dados Como Usuário
              </h3>
              
              <p className="text-sm leading-relaxed">
                Para utilizar o sistema, coletamos seus dados funcionais:
              </p>
              
              <ul className="text-sm space-y-1 ml-4">
                <li>• Nome, e-mail e dados da delegacia</li>
                <li>• Logs de acesso e utilização do sistema</li>
                <li>• Histórico de ações realizadas (auditoria)</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-white">
                🛡️ Compromissos de Segurança
              </h3>
              
              <ul className="text-sm space-y-1 ml-4">
                <li>• Criptografia de dados sensíveis</li>
                <li>• Controle de acesso por delegacia</li>
                <li>• Logs de auditoria completos</li>
                <li>• Conformidade com LGPD</li>
              </ul>
            </div>

              <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-4 mt-6">
                <p className="text-sm text-center text-gray-300">
                  Ao aceitar, você confirma estar ciente de suas responsabilidades no tratamento 
                  de dados pessoais e concorda com nossa{' '}
                  <a 
                    href="/privacidade" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 underline cursor-pointer"
                  >
                    Política de Privacidade
                  </a>{' '}
                  e{' '}
                  <a 
                    href="/termos-de-uso" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 underline cursor-pointer"
                  >
                    Termos de Uso
                  </a>.
                </p>
              </div>

            <div className="flex gap-4 pt-4">
              <Button 
                onClick={onDecline}
                variant="outline"
                className="flex-1 bg-transparent border-red-600 text-red-400 hover:bg-red-900/20"
                disabled={isLoading}
              >
                Não Aceito
              </Button>
              
              <Button 
                onClick={onAccept}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processando...
                  </div>
                ) : (
                  'Aceito os Termos'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConsentModal;
