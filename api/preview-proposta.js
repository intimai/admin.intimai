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

        // Adicionando tag style/script extra para fazer o HTML do preview escalar bem na div React
        // porque a page tem dimensions fixas para A4 landscape no CSS original
        templateHtml = templateHtml.replace('</head>', `
            <style>
                /* Manter o fundo escuro da proposta verdadeira, e escalar responsivamente */
                html, body {
                    background: var(--bg-dark) !important;
                    margin: 0;
                    padding: 0;
                    overflow-x: hidden;
                    width: 100%;
                }
                .page {
                    transform-origin: top left !important;
                    margin-top: 20px !important;
                    margin-left: 20px !important;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                }

                /* Custom Scrollbar for the preview iframe */
                ::-webkit-scrollbar {
                  width: 8px;
                  height: 8px;
                }
                ::-webkit-scrollbar-track {
                  background: rgba(255, 255, 255, 0.05);
                  border-radius: 4px;
                }
                ::-webkit-scrollbar-thumb {
                  background-color: rgba(136, 51, 255, 0.4);
                  border-radius: 10px;
                  border: 2px solid transparent;
                  background-clip: padding-box;
                }
                ::-webkit-scrollbar-thumb:hover {
                  background-color: rgba(136, 51, 255, 0.8);
                }
            </style>
            <script>
                function scalePages() {
                    const pages = document.querySelectorAll('.page');
                    if(!pages || pages.length === 0) return;
                    
                    const containerWidth = window.innerWidth;
                    // Largura A4 Paisagem (297mm) ~= 1122.5px
                    const scale = Math.min((containerWidth - 40) / 1122.5, 1);
                    
                    pages.forEach(p => {
                        p.style.transform = 'scale(' + scale + ')';
                        // Compensar o espaço vazio
                        const pageHeight = 793.7; 
                        const diff = pageHeight * (1 - scale);
                        p.style.marginBottom = '-' + (diff - 40) + 'px';
                    });
                }
                window.addEventListener('resize', scalePages);
                window.addEventListener('load', scalePages);
                setTimeout(scalePages, 50);
            </script>
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
