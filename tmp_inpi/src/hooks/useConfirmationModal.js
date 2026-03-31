import { useState, useCallback } from 'react';

/**
 * Hook para gerenciar estado de modais de confirmação
 * PRESERVA 100% da lógica de negócio existente
 * Apenas abstrai o estado de abertura/fechamento
 * 
 * @param {Function} onConfirm - Função a ser executada na confirmação
 * @returns {Object} { isOpen, openModal, closeModal, handleConfirm }
 */
export function useConfirmationModal(onConfirm) {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleConfirm = useCallback(async () => {
    try {
      if (onConfirm) {
        await onConfirm();
      }
      setIsOpen(false);
    } catch (error) {
      // A lógica de erro fica com o componente que usa o hook
      // Apenas fechamos o modal se não houve erro
      console.error('Erro na confirmação:', error);
      // Não fechamos automaticamente para permitir que o componente trate o erro
      throw error;
    }
  }, [onConfirm]);

  return {
    isOpen,
    openModal,
    closeModal,
    handleConfirm,
  };
}

/**
 * Hook especializado para múltiplos modais
 * Útil quando um componente tem vários modais diferentes
 * 
 * @param {Object} modalConfigs - Configuração dos modais { modalName: onConfirmFunction }
 * @returns {Object} Estado e funções para cada modal
 */
export function useMultipleModals(modalConfigs = {}) {
  const [modals, setModals] = useState(() => {
    const initialState = {};
    Object.keys(modalConfigs).forEach(modalName => {
      initialState[modalName] = false;
    });
    return initialState;
  });

  const [loadingStates, setLoadingStates] = useState(() => {
    const initialState = {};
    Object.keys(modalConfigs).forEach(modalName => {
      initialState[modalName] = false;
    });
    return initialState;
  });

  const openModal = useCallback((modalName) => {
    setModals(prev => ({ ...prev, [modalName]: true }));
  }, []);

  const closeModal = useCallback((modalName) => {
    setModals(prev => ({ ...prev, [modalName]: false }));
    setLoadingStates(prev => ({ ...prev, [modalName]: false }));
  }, []);

  const handleConfirm = useCallback(async (modalName) => {
    try {
      setLoadingStates(prev => ({ ...prev, [modalName]: true }));
      const onConfirm = modalConfigs[modalName];
      if (onConfirm) {
        await onConfirm();
      }
      setModals(prev => ({ ...prev, [modalName]: false }));
      setLoadingStates(prev => ({ ...prev, [modalName]: false }));
    } catch (error) {
      console.error(`Erro na confirmação do modal ${modalName}:`, error);
      setLoadingStates(prev => ({ ...prev, [modalName]: false }));
      // Fecha o modal mesmo com erro para evitar loops
      setModals(prev => ({ ...prev, [modalName]: false }));
      // Não propaga o erro - deixa o componente lidar com isso
    }
  }, [modalConfigs]);

  const modalHelpers = {};
  Object.keys(modalConfigs).forEach(modalName => {
    modalHelpers[modalName] = {
      isOpen: modals[modalName],
      isLoading: loadingStates[modalName],
      open: () => openModal(modalName),
      close: () => closeModal(modalName),
      confirm: () => handleConfirm(modalName),
    };
  });

  return modalHelpers;
}
