import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOCAL_CHROME_PATHS = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
];

function findLocalBrowser() {
    for (const p of LOCAL_CHROME_PATHS) {
        if (fs.existsSync(p)) return p;
    }
    return null;
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    try {
        const { html, fileName } = req.body;

        if (!html) {
            return res.status(400).json({ error: 'HTML do contrato é obrigatório' });
        }

        console.log('[generate-contrato] Gerando PDF do contrato...');

        // Detectar ambiente
        const isVercel = !!process.env.VERCEL;
        let executablePath;
        let launchArgs;

        if (isVercel) {
            executablePath = await chromium.executablePath();
            launchArgs = chromium.args;
        } else {
            executablePath = findLocalBrowser();
            if (!executablePath) {
                throw new Error('Nenhum navegador (Chrome ou Edge) foi encontrado.');
            }
            console.log(`[API Local] Usando navegador em: ${executablePath}`);
            launchArgs = ['--no-sandbox', '--disable-setuid-sandbox'];
        }

        const browser = await puppeteer.launch({
            args: launchArgs,
            defaultViewport: chromium.defaultViewport,
            executablePath: executablePath,
            headless: isVercel ? chromium.headless : true,
        });

        const page = await browser.newPage();
        await page.setContent(html, {
            waitUntil: 'domcontentloaded',
            timeout: 60000
        });

        // PDF em formato A4 retrato (portrait) com margens
        const pdf = await page.pdf({
            format: 'A4',
            landscape: false,
            printBackground: true,
            margin: { top: '15mm', bottom: '15mm', left: '20mm', right: '20mm' }
        });

        await browser.close();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${fileName || 'contrato.pdf'}`);
        res.send(Buffer.from(pdf));

    } catch (error) {
        console.error('Erro na geração do PDF do contrato:', error.message);
        res.status(500).json({ error: 'Erro interno ao gerar PDF', message: error.message });
    }
}
