export const config = {
    api: {
        bodyParser: true,
    },
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        console.log('[trigger-webhook] Repassando evento para o n8n...', req.body);
        
        const response = await fetch('https://hook.intimai.app/webhook/admin_contratos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body),
        });

        if (!response.ok) {
            console.error('[trigger-webhook] Falha no n8n:', response.status);
            return res.status(response.status).json({ error: `n8n returned status ${response.status}` });
        }

        console.log('[trigger-webhook] n8n acionado com sucesso.');
        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('[trigger-webhook] Erro ao chamar webhooks:', error);
        return res.status(500).json({ error: error.message });
    }
}
