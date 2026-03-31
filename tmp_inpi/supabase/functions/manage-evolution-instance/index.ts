import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Define os cabeçalhos CORS para permitir que seu aplicativo chame esta função
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function pollForConnectionStatusAndUpdateSupabase(
  evoEndpoint,
  evoInstancia,
  evoAPI,
  supabaseAdmin,
  delegaciaId
) {
  const startTime = Date.now();
  const timeout = 60000; // 1 minuto em milissegundos
  const pollInterval = 3000; // 3 segundos em milissegundos

  console.log(`[${evoInstancia}] Iniciando polling de status de conexão para delegacia ${delegaciaId}. Timeout de 1 minuto.`);

  while (Date.now() - startTime < timeout) {
    await new Promise(resolve => setTimeout(resolve, pollInterval)); // Espera antes de verificar

    try {
      const statusUrl = `${evoEndpoint}/instance/connectionState/${evoInstancia}`;
      const statusResponse = await fetch(statusUrl, {
        method: 'GET',
        headers: { 'apikey': evoAPI },
      });

      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        const currentState = statusData.instance?.state;
        console.log(`[${evoInstancia}] Status da conexão: ${currentState}`);

        if (currentState === 'open') {
          console.log(`[${evoInstancia}] Conexão estabelecida. Atualizando status no Supabase para 'connected'.`);
          const { error: updateError } = await supabaseAdmin
            .from('delegacias')
            .update({ connection_status: 'connected' })
            .eq('delegaciaId', delegaciaId);

          if (updateError) {
            console.error(`[${evoInstancia}] Erro ao atualizar status da delegacia para 'connected':`, updateError);
          } else {
            console.log(`[${evoInstancia}] Status da delegacia atualizado com sucesso. Polling encerrado.`);
          }
          return; // Encerra a função de polling com sucesso
        }
      } else {
        console.warn(`[${evoInstancia}] Falha ao obter status da conexão. Status: ${statusResponse.status}`);
      }
    } catch (pollError) {
      console.error(`[${evoInstancia}] Erro durante o polling de conexão:`, pollError.message);
    }
  }

  console.log(`[${evoInstancia}] Polling de conexão atingiu o timeout de 1 minuto. Atualizando status para 'disconnected'.`);
  try {
    const { error: updateError } = await supabaseAdmin
      .from('delegacias')
      .update({ connection_status: 'disconnected' })
      .eq('delegaciaId', delegaciaId);

    if (updateError) {
      console.error(`[${evoInstancia}] Erro ao atualizar status da delegacia para 'disconnected' após timeout:`, updateError);
    }
  } catch (e) {
    console.error(`[${evoInstancia}] Erro crítico ao tentar atualizar status para 'disconnected' após timeout:`, e.message);
  }
}


Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, delegaciaId } = await req.json();
    console.log(`[manage-evolution-instance] Ação recebida: '${action}' para delegaciaId: '${delegaciaId}'.`);

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const evoEndpoint = Deno.env.get('EVOLUTION_URL');

    if (!evoEndpoint) {
      console.error('A variável de ambiente EVOLUTION_URL não está configurada.');
      return new Response(JSON.stringify({ error: 'Configuração do servidor incompleta.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    if (!delegaciaId) {
      return new Response(JSON.stringify({ error: 'delegaciaId é obrigatório' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const { data: delegacia, error: delegaciaError } = await supabaseAdmin
      .from('delegacias')
      .select('evoAPI, evoInstancia')
      .eq('delegaciaId', delegaciaId)
      .single();

    if (delegaciaError || !delegacia) {
      console.error('Erro ao buscar delegacia:', delegaciaError);
      return new Response(JSON.stringify({ error: 'Delegacia não encontrada ou erro ao buscar dados.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      });
    }

    console.log(`[manage-evolution-instance] Dados da delegacia ${delegaciaId} encontrados.`);
    const { evoAPI, evoInstancia } = delegacia;

    if (!evoAPI || !evoInstancia) {
      console.error(`[manage-evolution-instance] Configuração da instância incompleta para a delegacia ${delegaciaId}.`);
      return new Response(JSON.stringify({ error: 'Configuração da instância da Evolution API incompleta para esta delegacia.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    let apiUrl;
    let apiMethod = 'GET';
    let response;

    switch (action) {
      case 'status':
        apiUrl = `${evoEndpoint}/instance/connectionState/${evoInstancia}`;
        break;
      case 'connect':
        apiUrl = `${evoEndpoint}/instance/connect/${evoInstancia}`;
        break;
      case 'disconnect':
        apiUrl = `${evoEndpoint}/instance/logout/${evoInstancia}`;
        apiMethod = 'DELETE';
        break;
      default:
        return new Response(JSON.stringify({ error: 'Ação inválida.' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
    }

    console.log(`[manage-evolution-instance] Chamando a API da Evolution: ${apiMethod} ${apiUrl}`);

    try {
      response = await fetch(apiUrl, {
        method: apiMethod,
        headers: {
          'Content-Type': 'application/json',
          'apikey': evoAPI,
        },
      });
    } catch (networkError) {
      console.error(`[${evoInstancia}] Erro de rede ao tentar se comunicar com a Evolution API:`, networkError.message);
      return new Response(JSON.stringify({
        error: 'Erro de Rede ao conectar com a Evolution API.',
        details: `Não foi possível alcançar o endereço: ${apiUrl}. Verifique se a URL da API da Evolution está correta e acessível.`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`[${evoInstancia}] Erro da API da Evolution. Status: ${response.status}. Body:`, errorData);
      return new Response(JSON.stringify({ error: 'Erro ao comunicar com a Evolution API', details: errorData }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: response.status,
      });
    }

    const data = await response.json();
    console.log(`[${evoInstancia}] Resposta da Evolution API para a ação '${action}' recebida.`);

    // Se a ação for 'connect', inicia o polling em segundo plano
    if (action === 'connect') {
      // Não aguardamos a conclusão, "fire and forget"
      pollForConnectionStatusAndUpdateSupabase(evoEndpoint, evoInstancia, evoAPI, supabaseAdmin, delegaciaId);
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Erro inesperado na função manage-evolution-instance:', error);
    const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.';
    return new Response(JSON.stringify({
      error: 'Erro inesperado no servidor.',
      details: errorMessage,
      rawError: String(error)
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});