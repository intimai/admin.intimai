import React, { useState, useCallback, useMemo } from 'react';
import { FileText, Phone, FileType, Hash } from 'lucide-react';
import { useIntimacoes } from '@/hooks/useIntimacoes';
import { toast } from '@/components/ui/use-toast';
import CollapsibleCard from '../ui/CollapsibleCard';
import InfoItem from '../ui/InfoItem';
import { useMultipleModals } from '@/hooks/useConfirmationModal';
import AgendaItemHeader from './agenda/AgendaItemHeader';
import AgendaModalsGroup from './agenda/AgendaModalsGroup';

const AgendaItem = ({ intimacao, refetch, fetchIntimacoes }) => {
  const { cancelIntimacao, marcarComoAusente, marcarComoCompareceu } = useIntimacoes();

  // Funções memoizadas para evitar re-renders infinitos
  const handleCancel = useCallback(async () => {
    try {
      await cancelIntimacao(intimacao.id);
      toast({ title: "Solicitação de cancelamento enviada." });
      if (refetch) refetch();
      if (fetchIntimacoes) fetchIntimacoes(); // Atualiza a lista de intimações
    } catch (error) {
      toast({ title: "Erro ao solicitar cancelamento", variant: "destructive" });
      throw error;
    }
  }, [cancelIntimacao, intimacao.id, refetch, fetchIntimacoes]);

  const handleNoShow = useCallback(async () => {
    try {
      console.log('Marcando como ausente, ID:', intimacao.id);
      await marcarComoAusente(intimacao.id);
      toast({ title: "Intimação marcada como 'Não Compareceu'." });
      if (refetch) refetch();
    } catch (error) {
      console.error('Erro ao marcar como ausente:', error);
      toast({ 
        title: "Erro ao marcar como 'Não Compareceu'", 
        description: error.message || 'Verifique as permissões ou tente novamente.',
        variant: "destructive" 
      });
      // Não propaga o erro para evitar loops
    }
  }, [marcarComoAusente, intimacao.id, refetch]);

  const handleCompareceu = useCallback(async () => {
    try {
      console.log('Marcando como compareceu, ID:', intimacao.id);
      await marcarComoCompareceu(intimacao.id);
      toast({ title: "Intimação marcada como 'Compareceu'." });
      if (refetch) refetch();
    } catch (error) {
      console.error('Erro ao marcar como compareceu:', error);
      toast({ 
        title: "Erro ao marcar como 'Compareceu'", 
        description: error.message || 'Verifique as permissões ou tente novamente.',
        variant: "destructive" 
      });
      // Não propaga o erro para evitar loops
    }
  }, [marcarComoCompareceu, intimacao.id, refetch]);

  const modalConfig = useMemo(() => ({
    cancel: handleCancel,
    noShow: handleNoShow,
    compareceu: handleCompareceu,
  }), [handleCancel, handleNoShow, handleCompareceu]);

  const modals = useMultipleModals(modalConfig);

  // PRESERVA EXATAMENTE a mesma lógica de status canceláveis
  const cancellableStatuses = ['agendada'];
  const isCancellable = cancellableStatuses.includes(intimacao.status) && !intimacao.cancelamentoEmAndamento;

  // PRESERVA EXATAMENTE as mesmas funções de abertura
  const handleOpenCancelModal = (e) => {
    e.stopPropagation(); // MESMA lógica preservada
    modals.cancel.open();
  };

  const handleOpenNoShowModal = () => {
    modals.noShow.open();
  };
  
  const handleOpenCompareceuModal = () => {
    modals.compareceu.open();
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hour, minute] = timeStr.split(':');
    return `${hour}:${minute}`;
  };

  const handleComparecimentoChange = (value) => {
    if (value === 'nao') {
      handleOpenNoShowModal();
    } else if (value === 'sim' && intimacao.status === 'ausente') {
      handleOpenCompareceuModal();
    }
  };

  const renderHeader = () => (
    <AgendaItemHeader
      intimacao={intimacao}
      formatTime={formatTime}
      cancellableStatuses={cancellableStatuses}
      onOpenCancelModal={handleOpenCancelModal}
      onComparecimentoChange={handleComparecimentoChange}
    />
  );

  const renderActions = () => null;

  return (
    <li className="bg-card p-4 rounded-lg border shadow transition-transform duration-300 hover:-translate-y-1">
      <CollapsibleCard header={renderHeader()} actions={renderActions()}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
          <InfoItem icon={<FileText />} label="Documento" value={intimacao.documento} />
          <InfoItem icon={<Phone />} label="Telefone" value={intimacao.telefone} />
          <InfoItem icon={<FileType />} label="Tipo de Procedimento" value={intimacao.tipoProcedimento} />
          <InfoItem icon={<Hash />} label="Nº Procedimento" value={intimacao.numeroProcedimento} />
        </div>
      </CollapsibleCard>

      <AgendaModalsGroup modals={modals} />
    </li>
  );
};

function AgendaCard({ agendamentos, refetch, fetchIntimacoes }) {
  if (!agendamentos) {
    return <p>Carregando agendamentos...</p>;
  }

  if (agendamentos.length === 0) {
    return <p>Nenhum agendamento para esta data.</p>;
  }

  return (
    <ul className="space-y-4">
      {agendamentos.map((intimacao) => (
        <AgendaItem key={intimacao.id} intimacao={intimacao} refetch={refetch} fetchIntimacoes={fetchIntimacoes} />
      ))}
    </ul>
  );
}

export default AgendaCard;

