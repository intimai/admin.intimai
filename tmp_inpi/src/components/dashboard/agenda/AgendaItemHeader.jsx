import React from 'react';
import { Clock, User } from 'lucide-react';
import AgendaItemActions from './AgendaItemActions';

/**
 * Componente para o cabeçalho de um item da agenda
 * PRESERVA EXATAMENTE o mesmo comportamento e design
 */
const AgendaItemHeader = ({ 
  intimacao, 
  formatTime, 
  cancellableStatuses, 
  onOpenCancelModal, 
  onComparecimentoChange 
}) => {
  return (
    <div className="w-full">
      <p className="font-bold flex items-center text-foreground truncate">
        <User className="w-4 h-4 mr-2 text-chart-agendadas flex-shrink-0" />
        <span className="truncate">{intimacao.intimadoNome}</span>
      </p>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-2 sm:mt-1 gap-2 sm:gap-0">
        <p className="text-sm text-muted-foreground flex items-center">
          <Clock className="w-4 h-4 mr-2 text-chart-entregues flex-shrink-0" />
          {formatTime(intimacao.horaAgendada)}
        </p>
        <AgendaItemActions
          intimacao={intimacao}
          cancellableStatuses={cancellableStatuses}
          onOpenCancelModal={onOpenCancelModal}
          onComparecimentoChange={onComparecimentoChange}
        />
      </div>
    </div>
  );
};

export default AgendaItemHeader;
