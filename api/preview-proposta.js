import handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve the project root correctly regardless of process.cwd() on Vercel
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

export const config = {
    api: { bodyParser: { sizeLimit: '10mb' } },
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    try {
        const data = req.body;
        
        // 1. Carregar o template e as imagens (Base64)
        const templatePath = path.join(PROJECT_ROOT, 'api', 'templates', 'proposta.html');
        let templateHtml = fs.readFileSync(templatePath, 'utf8');

        // Adicionando tag style extra para fazer o HTML do preview escalar bem na div React
        // porque a page tem dimensions fixas para A4 landscape no CSS original
        templateHtml = templateHtml.replace('</head>', `
            <style>
                html, body {
                    background: transparent !important;
                }
                .page {
                    transform-origin: top left;
                    margin: 0 auto;
                }
            </style>
        </head>`);

        // Função para converter arquivo local em Base64
        const toBase64 = (filename) => {
            try {
                const fullPath = path.join(__dirname, 'assets', filename);
                const bitmap = fs.readFileSync(fullPath);
                const ext = path.extname(fullPath).replace('.', '').replace('jpg', 'jpeg');
                return `data:image/${ext};base64,${bitmap.toString('base64')}`;
            } catch (e) {
                console.warn(`Aviso: Não foi possível carregar a imagem central: ${filename}`);
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

        // 2. Compilar e substituir as variáveis do template
        const template = handlebars.compile(templateHtml);
        const finalHtml = template(data);

        // 3. Retornar HTML limpo encapsulado para iframe
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.status(200).send(finalHtml);

    } catch (error) {
        console.error('Erro na geração do Preview:', error.message);
        res.status(500).json({ error: 'Erro interno ao gerar preview', message: error.message });
    }
}
