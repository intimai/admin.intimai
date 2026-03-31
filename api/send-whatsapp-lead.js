import { createClient } from '@supabase/supabase-js';

// No ambiente local de testes sem dotenv injetado no Node nativo, 
// a melhor forma de recuperar variáveis do VITE é lendo o processo (as vezes falha se não rodado junto com o Vite).
// Portanto, certifique-se de configurar estas três chaves no seu .env:
// VITE_META_TOKEN=EA...
// VITE_META_PHONE_ID=123...
// VITE_SUPABASE_URL=...
// VITE_SUPABASE_SERVICE_ROLE_KEY=...

export default async function handlerWhatsappLead(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    const { telefone, mensagem, lead_id } = req.body;

    if (!telefone || !mensagem || !lead_id) {
        return res.status(400).json({ error: 'Preencha telefone, mensagem e lead_id.' });
    }

    // Pega os segredos do ambiente (com fallback de aviso se não achar)
    const META_TOKEN = process.env.VITE_META_TOKEN || process.env.META_TOKEN;
    const PHONE_ID = process.env.VITE_META_PHONE_ID || process.env.META_PHONE_ID;
    
    // Serviço do Supabase para injetar no banco
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    if (!META_TOKEN || !PHONE_ID) {
        console.error('[WhatsApp API] Falta carregar TOKEN ou PHONE_ID no seu servidor Node.');
        return res.status(500).json({ error: 'Faltam credenciais da Meta no servidor Admin.' });
    }

    // --- Parte 1: Transformar o número para o padrão DDI WhatsApp
    let wppNumber = String(telefone).replace(/\D/g, '');
    if (!wppNumber.startsWith('55')) {
        wppNumber = '55' + wppNumber;
    }

    try {
        console.log(`[WhatsApp API] Tentando disparar para ${wppNumber} via Meta Graph...`);
        // --- Parte 2: O Despacho Oficial para a API da Meta WhatsApp
        const metaResponse = await fetch(`https://graph.facebook.com/v19.0/${PHONE_ID}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${META_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                recipient_type: 'individual',
                to: wppNumber,
                type: 'text',
                text: { 
                    preview_url: false,
                    body: mensagem 
                }
            })
        });

        const metaData = await metaResponse.json();

        if (!metaResponse.ok) {
            console.error('[WhatsApp API] Meta rejeitou envio:', metaData);
            return res.status(400).json({ error: 'Meta Recusou o envio', details: metaData });
        }

        // --- Parte 3: Sucesso no Disparo - Grava no Banco de Dados
        if (supabaseUrl && supabaseKey) {
            const supabase = createClient(supabaseUrl, supabaseKey);
            const { error: dbError } = await supabase.from('chat_admin').insert([
                {
                    lead_id: lead_id,
                    origem: 'admin',
                    mensagem: mensagem,
                    telefone: wppNumber,
                    status: 'enviado'
                }
            ]);

            if (dbError) {
                console.warn('[WhatsApp API] Enviou no Zap mas falhou o insert do chat:', dbError);
                // Não retorna erro mortal, pois o lead já leu no celular.
            }
        } else {
             console.warn('[WhatsApp API] Supabase Client ignorado, configure as chaves service_role no .env');
        }

        console.log('[WhatsApp API] 🎯 Sucesso Absoluto de Disparo e Gravação');
        return res.status(200).json({ success: true, message_id: metaData.messages?.[0]?.id });

    } catch (e) {
        console.error('[WhatsApp API] Erro fatal no try/catch interno:', e);
        return res.status(500).json({ error: 'Erro de infraestrutura (Node)', trace: e.message });
    }
}
