import express from 'express';
import handler from './api/generate-pdf.js';
import bodyParser from 'body-parser';

const app = express();
app.use(bodyParser.json());

// Mock do ambiente Vercel
app.post('/api/generate-pdf', async (req, res) => {
    console.log('[API Local] Gerando PDF para:', req.body.delegacia);
    try {
        await handler(req, res);
    } catch (e) {
        console.error('[API Local] Erro:', e);
        res.status(500).send(e.message);
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`\n🚀 Servidor de API Local rodando em http://localhost:${PORT}`);
    console.log(`\nCertifique-se de que o Vite (porta 5173) ainda está rodando.\n`);
});
