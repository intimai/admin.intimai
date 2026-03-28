import express from 'express';
import handlerPdf from './api/generate-pdf.js';
import handlerContrato from './api/generate-contrato.js';
import handlerPreview from './api/preview-proposta.js';
import bodyParser from 'body-parser';

const app = express();
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Mock do ambiente Vercel
app.post('/api/generate-pdf', async (req, res) => {
    console.log('[API Local] Gerando PDF (Proposta) para:', req.body.delegacia);
    try {
        await handlerPdf(req, res);
    } catch (e) {
        console.error('[API Local] Erro na Proposta:', e);
        res.status(500).send(e.message);
    }
});

app.post('/api/generate-contrato', async (req, res) => {
    console.log('[API Local] Gerando PDF (Contrato) acessado...');
    try {
        await handlerContrato(req, res);
    } catch (e) {
        console.error('[API Local] Erro no Contrato:', e);
        res.status(500).send(e.message);
    }
});

app.post('/api/preview-proposta', async (req, res) => {
    try {
        await handlerPreview(req, res);
    } catch (e) {
        console.error('[API Local] Erro no Preview:', e);
        res.status(500).send(e.message);
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`\n🚀 Servidor de API Local rodando em http://localhost:${PORT}`);
    console.log(`\nCertifique-se de que o Vite (porta 5173) ainda está rodando.\n`);
});
