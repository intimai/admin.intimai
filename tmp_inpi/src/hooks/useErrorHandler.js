import { toast } from '@/components/ui/use-toast';

/**
 * Hook para tratamento centralizado de erros
 * 
 * Fornece funções padronizadas para diferentes tipos de erro
 * com feedback consistente para o usuário
 */
export const useErrorHandler = () => {
  const handleGenericError = (error, message = 'Ocorreu um erro inesperado') => {
    console.error('Erro:', error);
    toast({
      title: 'Erro',
      description: message,
      variant: 'destructive'
    });
  };

  const handleAuthError = (error) => {
    console.error('Erro de autenticação:', error);
    toast({
      title: 'Erro de Autenticação',
      description: 'Sua sessão expirou. Faça login novamente.',
      variant: 'destructive'
    });
  };

  const handleIntimacaoError = (error) => {
    console.error('Erro de intimação:', error);
    toast({
      title: 'Erro na Intimação',
      description: 'Não foi possível processar a intimação. Tente novamente.',
      variant: 'destructive'
    });
  };

  return {
    handleGenericError,
    handleAuthError,
    handleIntimacaoError
  };
};
