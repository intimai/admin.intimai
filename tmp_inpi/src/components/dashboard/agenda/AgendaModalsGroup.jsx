import React from 'react';
import ConfirmationModal from '../../ui/ConfirmationModal';

/**
 * Componente para agrupar os modais de confirmação da agenda
 * PRESERVA EXATAMENTE o mesmo comportamento e design
 */
const AgendaModalsGroup = ({ modals }) => {
  return (
    <>
      <ConfirmationModal
        isOpen={modals.cancel.isOpen}
        onClose={modals.cancel.close}
        onConfirm={modals.cancel.confirm}
        isLoading={modals.cancel.isLoading}
        title="Confirmar Cancelamento"
      >
        <p>Você tem certeza que deseja solicitar o cancelamento desta intimação agendada?</p>
        <p className="text-sm text-gray-500 mt-2">Esta ação não poderá ser desfeita.</p>
      </ConfirmationModal>

      <ConfirmationModal
        isOpen={modals.noShow.isOpen}
        onClose={modals.noShow.close}
        onConfirm={modals.noShow.confirm}
        isLoading={modals.noShow.isLoading}
        title="Confirmar Ausência"
      >
        <p>Você tem certeza que deseja marcar esta intimação como 'Não Compareceu'?</p>
        <p className="text-sm text-gray-500 mt-2">Esta ação mudará o status para 'ausente'.</p>
      </ConfirmationModal>
      
      <ConfirmationModal
        isOpen={modals.compareceu.isOpen}
        onClose={modals.compareceu.close}
        onConfirm={modals.compareceu.confirm}
        isLoading={modals.compareceu.isLoading}
        title="Confirmar Comparecimento"
      >
        <p>Você tem certeza que deseja marcar esta intimação como 'Compareceu'?</p>
        <p className="text-sm text-gray-500 mt-2">Esta ação mudará o status para 'finalizada'.</p>
      </ConfirmationModal>
    </>
  );
};

export default AgendaModalsGroup;
