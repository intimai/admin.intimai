import React from 'react';
import { X } from 'lucide-react';
import AgendaAttendanceControl from './AgendaAttendanceControl';

/**
 * Componente para ações de um item da agenda
 * PRESERVA EXATAMENTE o mesmo comportamento e design
 */
const AgendaItemActions = ({ 
  intimacao, 
  cancellableStatuses, 
  onOpenCancelModal, 
  onComparecimentoChange 
}) => {
  return (
    <div className="flex items-center gap-4 justify-end w-full sm:w-auto" onClick={(e) => e.stopPropagation()}>
      {intimacao.cancelamentoEmAndamento ? (
        <span className="text-xs text-muted-foreground italic w-full text-right block">
          Em cancelamento...
        </span>
      ) : cancellableStatuses.includes(intimacao.status) ? (
        <button
          onClick={onOpenCancelModal}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 hover:bg-accent rounded-md p-1 -m-1"
        >
          <X style={{ color: '#C12F71' }} className="w-4 h-4" />
          Cancelar
        </button>
      ) : ['finalizada', 'ausente'].includes(intimacao.status) ? (
        <AgendaAttendanceControl 
          intimacao={intimacao}
          onComparecimentoChange={onComparecimentoChange}
        />
      ) : null}
    </div>
  );
};

export default AgendaItemActions;