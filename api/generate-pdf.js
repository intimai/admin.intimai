import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve the project root correctly regardless of process.cwd() on Vercel
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

// Paths where Chrome/Edge is typically installed on Windows
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
        const data = req.body;
        console.log('[Backend] Dados recebidos para PDF:', JSON.stringify(data, null, 2));

        // 1. Carregar o template e as imagens (Base64)
        const templatePath = path.join(PROJECT_ROOT, 'api', 'templates', 'proposta.html');
        const templateHtml = fs.readFileSync(templatePath, 'utf8');

        // Função para converter arquivo local em Base64
        // Usa PROJECT_ROOT/api/assets para funcionar na Vercel (public/ é CDN-only)
        const toBase64 = (filename) => {
            try {
                const fullPath = path.join(__dirname, 'assets', filename);
                const bitmap = fs.readFileSync(fullPath);
                const ext = path.extname(fullPath).replace('.', '').replace('jpg', 'jpeg');
                return `data:image/${ext};base64,${bitmap.toString('base64')}`;
            } catch (e) {
                console.warn(`Aviso: Não foi possível carregar a imagem: ${filename}`);
                return '';
            }
        };

        // Adicionar as imagens ao objeto de dados
        data.img1 = toBase64('1.jpeg');
        data.img2 = toBase64('2.png');
        data.img3 = toBase64('3.jpeg');
        data.img4 = toBase64('4.jpeg');
        data.img5 = toBase64('5.png');
        data.logoBase64 = toBase64('logo.png');

        // 2. Compilar e substituir variáveis
        const template = handlebars.compile(templateHtml);
        const finalHtml = template(data);

        // 3. Detectar ambiente: local (Windows) ou Vercel (Serverless)
        const isVercel = !!process.env.VERCEL;
        let executablePath;
        let launchArgs;

        if (isVercel) {
            executablePath = await chromium.executablePath();
            launchArgs = chromium.args;
        } else {
            executablePath = findLocalBrowser();
            if (!executablePath) {
                throw new Error('Nenhum navegador (Chrome ou Edge) foi encontrado no seu computador. Instale o Google Chrome e tente novamente.');
            }
            console.log(`[API Local] Usando navegador em: ${executablePath}`);
            launchArgs = ['--no-sandbox', '--disable-setuid-sandbox'];
        }

        // 4. Configurar e executar o Puppeteer
        // IMPORTANTE: usar chromium.headless na Vercel (não simplesmente true)
        const browser = await puppeteer.launch({
            args: launchArgs,
            defaultViewport: chromium.defaultViewport,
            executablePath: executablePath,
            headless: isVercel ? chromium.headless : true,
        });

        const page = await browser.newPage();
        await page.setContent(finalHtml, {
            waitUntil: 'domcontentloaded',
            timeout: 60000
        });

        // 5. Gerar PDF (landscape = paisagem, estilo Gamma)
        const pdf = await page.pdf({
            format: 'A4',
            landscape: true,
            printBackground: true,
            margin: { top: '0mm', bottom: '0mm', left: '0mm', right: '0mm' }
        });

        await browser.close();

        // 6. Retornar o PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=proposta.pdf`);
        res.send(pdf);

    } catch (error) {
        console.error('Erro na geração do PDF:', error.message);
        res.status(500).json({ error: 'Erro interno ao gerar PDF', message: error.message });
    }
}
