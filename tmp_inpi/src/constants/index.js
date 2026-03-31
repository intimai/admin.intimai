/**
 * Constantes centralizadas - IntimAI
 * 
 * Centraliza todas as constantes da aplicação para facilitar manutenção
 * e evitar strings mágicas espalhadas pelo código
 */

// Status de submissão
export const SUBMISSION_STATUS = {
  FORM: 'form',
  SUCCESS: 'success',
  DUPLICATE: 'duplicate', // Adicionado para tratar duplicidade
  PENDENTE: 'pendente',
  ENTREGUE: 'entregue',
  ATIVA: 'ativa',
  AGENDADA: 'agendada',
  RECUSADA: 'recusada',
  CANCELADA: 'cancelada',
  FINALIZADA: 'finalizada',
  AUSENTE: 'ausente'
};

// Animações
export const ANIMATIONS = {
  MODAL: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 }
  },
  SUCCESS: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 }
  },
  LOADING: {
    initial: { opacity: 0 },
    animate: { opacity: 1 }
  }
};

// Configurações de formulário
export const FORM_CONFIG = {
  MIN_DATE_OFFSET: 1, // Dias mínimos para agendamento
  PHONE_MASK: '(##) #####-####'
};

// Paginação
export const PAGINATION = {
  ITEMS_PER_PAGE: 10
};

// Tipos de webhook
export const WEBHOOK_TYPES = {
  CRIACAO: 'CRIACAO',
  REATIVACAO: 'REATIVACAO',
  CANCELAMENTO: 'CANCELAMENTO',
  LGPD: 'LGPD',
  SUPORTE: 'SUPORTE'
};

// Status de intimação no plural
export const INTIMACAO_STATUS_PLURAL = {
  pendente: 'Pendentes',
  entregue: 'Entregues',
  ativa: 'Ativas',
  agendada: 'Agendadas',
  recusada: 'Recusadas',
  cancelada: 'Canceladas',
  finalizada: 'Finalizadas',
  ausente: 'Ausentes'
};

// Mensagens de erro
export const ERROR_MESSAGES = {
  USER_PROFILE_NOT_FOUND: 'Perfil de usuário não encontrado',
  INTIMACAO_NOT_FOUND: 'Intimação não encontrada',
  GENERIC_ERROR: 'Ocorreu um erro inesperado'
};

// Mensagens de sucesso
export const SUCCESS_MESSAGES = {
  INTIMACAO_CREATED: 'Intimação criada com sucesso!',
  INTIMACAO_UPDATED: 'Intimação atualizada com sucesso!',
  INTIMACAO_DELETED: 'Intimação removida com sucesso!'
};
