import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://deno.land/x/supabase/mod.ts'

const WEBHOOK_CANCELAMENTO_URL = Deno.env.get('WEBHOOK_CANCELAMENTO_URL')

serve(async (req) => {
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const hoje = new Date();

    // Busca intimações que estão aguardando agendamento e têm uma primeira disponibilidade definida.
    const { data: intimacoes, error } = await supabaseClient
      .from('intimacoes')
      .select('*')
      .eq('status', 'Aguardando Agendamento') // Ou o status correto que indica que está com o N8N
      .not('primeiraDisponibilidade', 'is', null);

    if (error) throw error;

    const intimacoesExpiradas = intimacoes.filter(intimacao => {
      const [dataStr, periodo] = intimacao.primeiraDisponibilidade.split(' - ');
      const [dia, mes, ano] = dataStr.split('/').map(Number);
      const dataDisponibilidade = new Date(ano, mes - 1, dia);

      // Define a hora limite baseada no período
      if (periodo.toLowerCase() === 'manhã') {
        dataDisponibilidade.setHours(12, 0, 0, 0); // Meio-dia
      } else { // Tarde ou Ambos
        dataDisponibilidade.setHours(23, 59, 59, 999); // Fim do dia
      }

      return hoje > dataDisponibilidade;
    });

    for (const intimacao of intimacoesExpiradas) {
      await supabaseClient
        .from('intimacoes')
        .update({ 
          status: 'cancelada',
          motivo: 'Agendamento Expirado'
        })
        .eq('id', intimacao.id);

      if (WEBHOOK_CANCELAMENTO_URL) {
        try {
          fetch(WEBHOOK_CANCELAMENTO_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ intimacao: intimacao.id, motivo: 'Agendamento Expirado' })
          });
        } catch (e) {
          console.error('Erro ao chamar webhook de cancelamento:', e.message);
        }
      }
    }

    return new Response(JSON.stringify({ message: "Verificação de intimações expiradas concluída." }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})