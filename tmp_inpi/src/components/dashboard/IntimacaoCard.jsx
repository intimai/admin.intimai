import React, { useCallback, useMemo } from 'react';
import { X, RefreshCcw, MessageSquare, Copy } from 'lucide-react';
import CollapsibleCard from '../ui/CollapsibleCard';
import StatusLabel from '../ui/StatusLabel';
import { Button } from '@/components/ui/button';
import { useMultipleModals } from '@/hooks/useConfirmationModal';
import { IntimacaoItemHeader } from './intimacao/IntimacaoItemHeader';
import { IntimacaoItemContent } from './intimacao/IntimacaoItemContent';
import { IntimacaoModalsGroup } from './intimacao/IntimacaoModalsGroup';
import { ChatHistoryModal } from './ChatHistoryModal';
import { toast } from '@/components/ui/use-toast';

export function IntimacaoCard({ intimacao, onCancel, onReativar }) {
  // Função memoizada para evitar re-renders
  const handleCancelFunction = useCallback(() => onCancel(intimacao.id), [onCancel, intimacao.id]);

  const modalConfig = useMemo(() => ({
    cancel: handleCancelFunction, // MESMA função de cancelamento, agora memoizada
  }), [handleCancelFunction]);
  
  // Hook para gerenciar múltiplos modais - PRESERVA EXATAMENTE a mesma lógica
  const modals = useMultipleModals(modalConfig);

  // Estados para modais customizados (ReativarIntimacaoModal)
  const [isReativarModalOpen, setIsReativarModalOpen] = React.useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = React.useState(false);

  // PRESERVA EXATAMENTE as mesmas funções
  const handleCancelClick = () => {
    modals.cancel.open(); // Mesma ação, novo hook
  };

  const handleReativarClick = () => {
    setIsReativarModalOpen(true); // MESMA lógica mantida
  };

  const handleCopy = async (value, label, event) => {
    event.stopPropagation();

    if (!value) return;

    try {
      await navigator.clipboard.writeText(String(value));
      toast({
        title: `${label} copiado`,
        description: String(value),
      });
    } catch (error) {
      toast({
        title: 'Erro ao copiar',
        description: `Nao foi possivel copiar ${label.toLowerCase()}.`,
        variant: 'destructive',
      });
    }
  };

  const renderActionsContent = () => {
    const status = intimacao.status;

    if (intimacao.cancelamentoEmAndamento) {
      return (
        <span className="text-xs text-muted-foreground italic">
          Em cancelamento...
        </span>
      );
    }

    if (status === "cancelada" || status === "ausente") {
      const isReativada = intimacao.reativada === true || String(intimacao.reativada).toLowerCase() === 'true';
    if (isReativada) {
      return (
        <span className="text-xs text-muted-foreground italic">
          Intimação Reativada
        </span>
      );
    }
      return (
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-200 hover:bg-accent rounded-md p-1 -m-1"
          onClick={handleReativarClick}
        >
          <RefreshCcw style={{ color: '#22C55E' }} className="w-4 h-4" />
          Reativar
        </Button>
      );
    }

    const cancellableStatus = ["pendente", "entregue", "ativa", "agendada"];
    if (cancellableStatus.includes(status)) {
      return (
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-200 hover:bg-accent rounded-md p-1 -m-1"
          onClick={handleCancelClick}
        >
          <X style={{ color: '#C12F71' }} className="w-4 h-4" />
          Cancelar
        </Button>
      );
    }

    return null;
  };

  const renderHeader = () => (
    <div className="w-full">
      <div className="flex items-center gap-3 mb-1">
        <h3 className="text-base font-bold text-foreground truncate">{intimacao.intimadoNome}</h3>
        <StatusLabel status={intimacao.status} />
      </div>
      <div className="flex justify-between items-center mt-1">
        <div className="flex items-center gap-2 min-w-0">
          <p className="text-xs text-gray-400 truncate">Doc: {intimacao.documento}</p>
          {intimacao.documento && (
            <button
              type="button"
              onClick={(event) => handleCopy(intimacao.documento, 'Documento', event)}
              className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
              title="Copiar documento"
              aria-label="Copiar documento"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Botão Ver Chat */}
          {intimacao.telefone && (
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-200 hover:bg-accent rounded-md p-1"
              onClick={(e) => {
                e.stopPropagation();
                setIsChatModalOpen(true);
              }}
              title="Ver histórico de conversa"
            >
              <MessageSquare className="w-4 h-4 text-blue-500" />
              <span className="text-xs">Chat</span>
            </Button>
          )}
          {renderActionsContent()}
        </div>
      </div>
    </div>
  );

  const renderActions = () => null;

  return (
    <>
      <CollapsibleCard
        header={renderHeader()}
        actions={renderActions()}
        className="bg-card p-4 rounded-lg border shadow transition-transform duration-300 hover:-translate-y-1"
      >
        <IntimacaoItemContent intimacao={intimacao} />
      </CollapsibleCard>
      
      <IntimacaoModalsGroup 
        modals={modals}
        intimacao={intimacao}
        isReativarModalOpen={isReativarModalOpen}
        onReativarModalClose={() => setIsReativarModalOpen(false)}
        onReativarSuccess={onReativar}
      />

      <ChatHistoryModal
        isOpen={isChatModalOpen}
        onClose={() => setIsChatModalOpen(false)}
        sessionId={intimacao.telefone}
        intimadoNome={intimacao.intimadoNome}
        intimacaoId={intimacao.id}
      />
    </>
  );
}