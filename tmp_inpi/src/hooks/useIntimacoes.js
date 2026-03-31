import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { triggerWebhook } from '@/lib/webhookService';
import { decryptSensitiveData } from '@/lib/encryptionService';
import { toast } from '@/components/ui/use-toast';

export function useIntimacoes() {
  const { user, supabaseClient } = useAuth();
  const [intimacoes, setIntimacoes] = useState([]);
  const [agendamentosDoDia, setAgendamentosDoDia] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(20); // Itens por página fixo
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Função para descriptografar dados antes de exibir
  const decryptIntimacoesData = useCallback(async (intimacoesData) => {
    if (!intimacoesData || intimacoesData.length === 0) return intimacoesData;
    
    const decryptedIntimacoes = await Promise.all(
      intimacoesData.map(async (intimacao) => {
        try {
          const decryptedData = await decryptSensitiveData(intimacao);
          return decryptedData;
        } catch (error) {
          console.error('Erro ao descriptografar intimação:', error);
          return intimacao; // Retorna dados originais em caso de erro
        }
      })
    );
    
    return decryptedIntimacoes;
  }, []);

  const fetchIntimacoes = useCallback(async (page = 1, statusFilter = null, searchTerm = '') => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // Calcular offset para paginação
    const from = (page - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;
    
    // Construir query base
    let query = supabase
      .from('intimacoes')
      .select('id, intimadoNome, status, documento, telefone, dataAgendada, horaAgendada, tipoProcedimento, numeroProcedimento, motivo, criadoEm, primeiraDisponibilidade, cancelamentoEmAndamento, reativada', { count: 'exact' })
      .eq('userId', user.id);
    
    // Aplicar filtros se fornecidos
    if (statusFilter && statusFilter !== 'todas') {
      query = query.eq('status', statusFilter);
    }
    
    if (searchTerm) {
      query = query.or(`intimadoNome.ilike.%${searchTerm}%,documento.ilike.%${searchTerm}%`);
    }
    
    // Aplicar ordenação e paginação
    query = query
      .order('criadoEm', { ascending: false })
      .range(from, to);

    const { data, error, count } = await query;

    let decryptedData = [];
    
    if (error) {
      console.error('Erro ao buscar intimações:', error);
      setIntimacoes([]);
      setTotalItems(0);
    } else {
      // Descriptografar dados antes de definir no estado
      decryptedData = await decryptIntimacoesData(data || []);
      
      // Forçar re-render criando um novo array com timestamp
      const timestamp = Date.now();
      setIntimacoes([...decryptedData]);
      setTotalItems(count || 0);
      setRefreshKey(timestamp);
      
      // Calcular informações de paginação
      const totalPages = Math.ceil((count || 0) / itemsPerPage);
      setHasNextPage(page < totalPages);
      setHasPreviousPage(page > 1);
      setCurrentPage(page);
    }
    setLoading(false);
    
    // Retornar os dados para que possam ser usados
    return decryptedData;
  }, [user, itemsPerPage, decryptIntimacoesData]);

  useEffect(() => {
    if (!user) return;

    fetchIntimacoes();

    // Realtime desabilitado temporariamente para evitar erros
    // const channel = supabase
    //   .channel('intimacoes_changes')
    //   .on('postgres_changes', { event: '*', schema: 'public', table: 'intimacoes' },
    //     () => {
    //       fetchIntimacoes();
    //     }
    //   )
    //   .subscribe();

    // return () => {
    //   supabase.removeChannel(channel);
    // };
  }, [fetchIntimacoes, user]);

  const createIntimacao = async (intimacaoData) => {
    if (!user) throw new Error("Usuário não autenticado");

    console.log("[useIntimacoes] Hook createIntimacao chamado com:", intimacaoData);

    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('delegaciaId') // Apenas a delegaciaId é necessária aqui
      .eq('userId', user.id)
      .single();

    if (userError) {
      console.error('Erro ao buscar dados do usuário:', userError);
      throw userError;
    }

    if (!userData) throw new Error("Perfil do usuário não encontrado.");

    console.log("[useIntimacoes] Invocando a Edge Function 'create-intimacao-with-check'...");
    // Invocar a Edge Function para criar a intimação com verificação de duplicidade
    const { data, error } = await supabase.functions.invoke('create-intimacao-with-check', {
      body: {
        ...intimacaoData,
        userId: user.id,
        delegaciaId: userData.delegaciaId,
      },
    });

    if (error) {
      console.error("[useIntimacoes] Erro retornado pela Edge Function:", error);
      // A Edge Function agora lança um erro com um status 409 para duplicatas.
      // O corpo do erro contém a mensagem e os detalhes da duplicata.
      if (error.name === 'FunctionsHttpError' && error.context && error.context.status === 409) {
        const errorBody = await error.context.json();
        // Lança um erro customizado com os detalhes da duplicata
        console.log("[useIntimacoes] Lançando erro de duplicidade.");
        throw {
          name: 'DuplicateIntimacaoError',
          message: errorBody.message, // ex: "DUPLICATE_FOUND"
          details: { 
            status: errorBody.details.status_existente, 
            created_at: errorBody.details.criadoEm 
          }, // ex: { status_existente: 'ativa', id_intimacao: '...' }
        };
      }

      // Para outros erros, lança um erro genérico.
      console.error('Erro ao invocar a Edge Function create-intimacao-with-check:', error);
      throw new Error(error.message || 'Erro ao criar intimação');
    }

    // A Edge Function retorna um array, então pegamos o primeiro elemento
    const novaIntimacao = data && data.length > 0 ? data[0] : null;

    // Disparar o webhook após a criação bem-sucedida
    if (novaIntimacao) {
      try {
        await triggerWebhook("CRIACAO", novaIntimacao, user);
      } catch (webhookError) {
        console.error("❌ Erro no webhook (intimação foi salva):", webhookError);
        // Não lançamos erro aqui para não quebrar o fluxo
      }
    }

    return novaIntimacao;
  };

  const reativarIntimacao = async (intimacaoOriginal, novaIntimacaoData) => {
    if (!user) {
      throw new Error("Usuário não autenticado");
    }

    console.log("[useIntimacoes] Hook reativarIntimacao chamado com:", novaIntimacaoData);

    // Reutiliza a lógica de createIntimacao para garantir a criptografia e consistência
    // A única diferença é que a reativação pode ter um comportamento de webhook diferente,
    // mas a criação no banco de dados deve ser a mesma.
    const novaIntimacao = await createIntimacao({
      ...novaIntimacaoData,
      // Adiciona um campo para indicar que é uma reativação, se necessário no futuro
      // reativadaDe: intimacaoOriginal.id 
    });

    // A lógica de webhook já é tratada dentro de createIntimacao,
    // mas se precisar de um webhook específico para reativação, pode ser adicionado aqui.
    // Ex: await triggerWebhook("REATIVACAO", novaIntimacao, user);

    // Atualiza o status da intimação original para 'reativada'
    const { error: updateError } = await supabase
      .from('intimacoes')
      .update({ status: 'reativada', reativada: true })
      .eq('id', intimacaoOriginal.id);

    if (updateError) {
      console.error('Erro ao atualizar status da intimação original:', updateError);
      // Considerar como lidar com este erro. A nova intimação foi criada.
      // Pode ser necessário um processo de compensação ou apenas logar o erro.
    }

    return novaIntimacao;
  };

  const cancelIntimacao = async (intimacaoId, motivo) => {
    const intimacaoToCancel = intimacoes.find(i => i.id === intimacaoId);
    if (!intimacaoToCancel) {
      throw new Error("Intimação não encontrada para cancelamento.");
    }

    // Atualiza o status localmente para uma resposta de UI mais rápida
    setIntimacoes(currentIntimacoes =>
      currentIntimacoes.map(i =>
        i.id === intimacaoId ? { ...i, status: 'cancelada' } : i
      )
    );

    try {
      // Chama o webhook para orquestrar o cancelamento
      await triggerWebhook("CANCELAMENTO", { ...intimacaoToCancel, motivoCancelamento: motivo }, user);
      toast({ title: "Processo de cancelamento iniciado." });
    } catch (error) {
      console.error("Erro ao iniciar o processo de cancelamento:", error);
      toast({ title: `Falha ao iniciar cancelamento: ${error.message}`, variant: "destructive" });
      // Reverte a mudança de status local em caso de falha
      setIntimacoes(currentIntimacoes =>
        currentIntimacoes.map(i =>
          i.id === intimacaoId ? { ...i, status: intimacaoToCancel.status } : i
        )
      );
    }
  };

  const getDecryptedIntimacaoDetails = async (intimacaoId) => {
    const intimacaoToCancel = intimacoes.find(i => i.id === intimacaoId);
    if (!intimacaoToCancel) {
      throw new Error("Intimação não encontrada para cancelamento.");
    }
    const { data, error } = await supabase
      .from('intimacoes')
      .update({ cancelamentoEmAndamento: true })
      .eq('id', intimacaoId)
      .select();

    if (error) {
      console.error("Erro ao atualizar a intimação para cancelamento:", error);
      throw error;
    }

    // Corrigindo a chamada do webhook
    try {
      await triggerWebhook("CANCELAMENTO", intimacaoToCancel, user);
    } catch (error) {
      console.error("Falha ao disparar o webhook de cancelamento:", error);
      // Não vamos lançar um erro para o usuário aqui, pois o cancelamento foi registrado no banco.
      // A falha no webhook deve ser tratada separadamente (ex: logs, monitoramento).
    }

    return data;
  };

  const marcarComoAusente = async (intimacaoId) => {
    // Garante que o ID está no formato correto
    const id = intimacaoId?.toString();
    
    if (!id) {
      throw new Error('ID da intimação é obrigatório');
    }

    const { data, error } = await supabase
      .from('intimacoes')
      .update({ status: 'ausente' })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Erro ao marcar como ausente:', error);
      throw error;
    }
    return data;
  };

  const marcarComoCompareceu = async (intimacaoId) => {
    // Garante que o ID está no formato correto
    const id = intimacaoId?.toString();
    
    if (!id) {
      throw new Error('ID da intimação é obrigatório');
    }

    const { data, error } = await supabase
      .from('intimacoes')
      .update({ status: 'finalizada' })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Erro ao marcar como compareceu:', error);
      throw error;
    }
    return data;
  };

  const fetchAgendamentos = useCallback(async (date) => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('intimacoes')
      .select('id, intimadoNome, horaAgendada, documento, telefone, tipoProcedimento, numeroProcedimento, status, cancelamentoEmAndamento')
      .eq('userId', user.id)
      .eq('dataAgendada', date)
      .in('status', ['agendada', 'finalizada', 'ausente'])
      .order('horaAgendada', { ascending: true });

    if (error) {
      console.error('Erro ao buscar agendamentos:', error);
      setAgendamentosDoDia([]);
    } else {
      // Descriptografar dados antes de definir no estado
      const decryptedData = await decryptIntimacoesData(data || []);
      setAgendamentosDoDia(decryptedData);
    }
    setLoading(false);
  }, [user, decryptIntimacoesData]);

  // Funções de navegação de páginas
  const goToNextPage = useCallback(() => {
    if (hasNextPage) {
      const nextPage = currentPage + 1;
      fetchIntimacoes(nextPage);
    }
  }, [hasNextPage, currentPage, fetchIntimacoes]);

  const goToPreviousPage = useCallback(() => {
    if (hasPreviousPage) {
      const prevPage = currentPage - 1;
      fetchIntimacoes(prevPage);
    }
  }, [hasPreviousPage, currentPage, fetchIntimacoes]);

  const goToPage = useCallback((page) => {
    if (page >= 1 && page <= Math.ceil(totalItems / itemsPerPage)) {
      fetchIntimacoes(page);
    }
  }, [totalItems, itemsPerPage, fetchIntimacoes]);

  // Função para buscar com filtros (preserva compatibilidade)
  const fetchIntimacoesWithFilters = useCallback((statusFilter, searchTerm) => {
    fetchIntimacoes(1, statusFilter, searchTerm); // Sempre volta para página 1 ao filtrar
  }, [fetchIntimacoes]);

  return {
    // Dados existentes
    intimacoes,
    agendamentosDoDia,
    loading,
    
    // Funções existentes (mantém compatibilidade)
    fetchIntimacoes,
    fetchAgendamentos,
    createIntimacao,
    reativarIntimacao,
    cancelIntimacao,
    marcarComoAusente,
    marcarComoCompareceu,
    
    // Novos recursos de paginação
    currentPage,
    totalItems,
    itemsPerPage,
    hasNextPage,
    hasPreviousPage,
    totalPages: Math.ceil(totalItems / itemsPerPage),
    
    // Funções de navegação
    goToNextPage,
    goToPreviousPage,
    goToPage,
    fetchIntimacoesWithFilters,
    
    // Chave para forçar re-render
    refreshKey,
  };
}