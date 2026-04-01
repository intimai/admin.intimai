import express from 'express';
import handlerPdf from './api/generate-pdf.js';
import handlerContrato from './api/generate-contrato.js';
import handlerPreview from './api/preview-proposta.js';
import handlerWhatsappLead from './api/send-whatsapp-lead.js';
import {
    listPhoneNumbers,
    addPhoneNumber,
    getPhoneStatus,
    requestVerificationCode,
    verifyCode,
    resetOtpStatus,
    unlinkPhoneNumber,
    updatePhoneName,
    getBusinessProfile,
    updateBusinessProfile,
    listWabas,
    createWaba
} from './api/meta-connections.js';
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

app.post('/api/send-whatsapp-lead', async (req, res) => {
    console.log('[API Local] Disparando WhatsApp Meta Oficial...');
    try {
        await handlerWhatsappLead(req, res);
    } catch (e) {
        console.error('[API Local] Erro Fatal no Envio ZAP:', e);
        res.status(500).send(e.message);
    }
});

// ─── Rotas Meta Connections ───────────────────────────────────────────────────
app.get('/api/meta/phone_numbers', async (req, res) => {
    try { await listPhoneNumbers(req, res); }
    catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/meta/phone_numbers', async (req, res) => {
    try { await addPhoneNumber(req, res); }
    catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/meta/status/:phone_id', async (req, res) => {
    try { await getPhoneStatus(req, res); }
    catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/meta/request_code', async (req, res) => {
    try { await requestVerificationCode(req, res); }
    catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/meta/verify_code', async (req, res) => {
    try { await verifyCode(req, res); }
    catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/meta/reset_otp', async (req, res) => {
    try { await resetOtpStatus(req, res); }
    catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/meta/unlink', async (req, res) => {
    try { await unlinkPhoneNumber(req, res); }
    catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/meta/update_name/:phone_id', async (req, res) => {
    try { await updatePhoneName(req, res); }
    catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/meta/profile/:phone_id', async (req, res) => {
    try { await getBusinessProfile(req, res); }
    catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/meta/update_business_profile/:phone_id', async (req, res) => {
    try { await updateBusinessProfile(req, res); }
    catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/meta/wabas', async (req, res) => {
    try { await listWabas(req, res); }
    catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/meta/wabas', async (req, res) => {
    try { await createWaba(req, res); }
    catch (e) { res.status(500).json({ error: e.message }); }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`\n🚀 Servidor de API Local rodando em http://localhost:${PORT}`);
    console.log(`\nCertifique-se de que o Vite (porta 5173) ainda está rodando.\n`);
});
