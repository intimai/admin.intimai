import React from 'react';
import ConfirmationModal from '../../ui/ConfirmationModal';
import { ReativarIntimacaoModal } from '../ReativarIntimacaoModal';

export function IntimacaoModalsGroup({ 
  modals, 
  intimacao, 
  isReativarModalOpen, 
  onReativarModalClose,
  onReativarSuccess
}) {
  return (
    <>
      {/* Modal de Cancelamento - PRESERVA EXATAMENTE a mesma lógica */}
      <ConfirmationModal
        isOpen={modals.cancel.isOpen}
        onClose={modals.cancel.close}
        onConfirm={modals.cancel.confirm}
        isLoading={modals.cancel.isLoading}
        title="Confirmar Cancelamento"
      >
        <p>Você tem certeza que deseja solicitar o cancelamento desta intimação?</p>
        <p className="text-sm text-gray-500 mt-2">Esta ação não poderá ser desfeita.</p>
      </ConfirmationModal>

      {/* Modal de Reativação - PRESERVA EXATAMENTE a mesma lógica */}
      <ReativarIntimacaoModal
        open={isReativarModalOpen}
        onClose={onReativarModalClose}
        intimacao={intimacao}
        onSuccess={onReativarSuccess}
      />
    </>
  );
}
