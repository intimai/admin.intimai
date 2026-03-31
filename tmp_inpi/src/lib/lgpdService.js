import { supabase } from './customSupabaseClient';
import { triggerWebhook } from './webhookService';

export const lgpdService = {
  /**
   * Envia uma solicitação de direitos dos titulares
   * @param {Object} formData - Dados do formulário
   * @returns {Promise<Object>} Resultado da operação
   */
  async enviarSolicitacao(formData) {
    try {
      console.log('Iniciando envio de solicitação LGPD:', formData);
      
      // 1. Salvar no banco de dados
      const insertData = {
        nome: formData.nome,
        documento: formData.documento,
        email: formData.email,
        telefone: formData.telefone || null,
        tipo_solicitacao: formData.tipoSolicitacao,
        descricao: formData.descricao,
        ip_address: await this.getClientIP(),
        user_agent: navigator.userAgent
      };

      console.log('Dados para inserção:', insertData);

      const { data: dbResult, error: dbError } = await supabase
        .from('lgpd_requests')
        .insert([insertData])
        .select()
        .single();

      if (dbError) {
        console.error('Erro detalhado do Supabase:', dbError);
        throw new Error(`Erro ao salvar solicitação no banco de dados: ${dbError.message} (${dbError.code})`);
      }

      console.log('Dados salvos com sucesso:', dbResult);

      // 2. Enviar webhook diretamente para Edge Function (sem autenticação para formulários públicos)
      const webhookPayload = {
        webhookType: "LGPD",
        payload: {
          data: {
            id: dbResult.id,
            nome: formData.nome,
            documento: formData.documento,
            email: formData.email,
            telefone: formData.telefone,
            tipo_solicitacao: formData.tipoSolicitacao,
            descricao: formData.descricao,
            created_at: dbResult.created_at,
            status: dbResult.status
          },
          user: null
        }
      };

      // 2. Enviar webhook para formulários públicos (sem autenticação)
      const webhookResponse = await fetch('https://tvdkmuivivvummvqznjh.supabase.co/functions/v1/lgpd-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(webhookPayload)
      });

      if (!webhookResponse.ok) {
        console.warn('Webhook falhou, mas dados foram salvos:', await webhookResponse.text());
        // Não falha a operação se o webhook falhar
      } else {
        console.log('✅ Webhook LGPD enviado com sucesso!');
      }

      return {
        success: true,
        id: dbResult.id,
        message: 'Solicitação enviada com sucesso'
      };

    } catch (error) {
      console.error('Erro no serviço LGPD:', error);
      throw new Error('Erro ao processar solicitação: ' + error.message);
    }
  },

  /**
   * Obtém o IP do cliente (simulado para desenvolvimento)
   * @returns {Promise<string>} IP do cliente
   */
  async getClientIP() {
    try {
      // Em produção, você pode usar um serviço como ipify.org
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.warn('Não foi possível obter IP do cliente:', error);
      return '127.0.0.1'; // IP local para desenvolvimento
    }
  },

  /**
   * Busca solicitações LGPD (apenas para administradores)
   * @param {Object} filters - Filtros de busca
   * @returns {Promise<Array>} Lista de solicitações
   */
  async buscarSolicitacoes(filters = {}) {
    try {
      let query = supabase
        .from('lgpd_requests')
        .select('*')
        .order('created_at', { ascending: false });

      // Aplicar filtros
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.email) {
        query = query.ilike('email', `%${filters.email}%`);
      }
      if (filters.documento) {
        query = query.ilike('documento', `%${filters.documento}%`);
      }
      if (filters.dataInicio) {
        query = query.gte('created_at', filters.dataInicio);
      }
      if (filters.dataFim) {
        query = query.lte('created_at', filters.dataFim);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error('Erro ao buscar solicitações: ' + error.message);
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar solicitações LGPD:', error);
      throw error;
    }
  },

  /**
   * Atualiza o status de uma solicitação (apenas para administradores)
   * @param {string} id - ID da solicitação
   * @param {string} status - Novo status
   * @param {string} responseText - Texto da resposta
   * @returns {Promise<Object>} Resultado da operação
   */
  async atualizarStatus(id, status, responseText = null) {
    try {
      const { data, error } = await supabase
        .from('lgpd_requests')
        .update({
          status,
          response_text: responseText,
          processed_at: new Date().toISOString(),
          processed_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error('Erro ao atualizar status: ' + error.message);
      }

      return data;
    } catch (error) {
      console.error('Erro ao atualizar status LGPD:', error);
      throw error;
    }
  }
};
