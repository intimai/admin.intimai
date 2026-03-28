import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollText, Download, Loader2, Upload, Settings2, Eye, EyeOff, FileUp } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/customSupabaseClient';

// ─── Construtor do HTML do contrato ──────────────────────────────
function buildContratoHTML(fields, corpoHTML, logoBase64) {
    const f = fields;
    const today = new Date().toLocaleDateString('pt-BR');

    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body {
    font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
    font-size: 13px; line-height: 1.7; color: #1a1a2e;
    -webkit-print-color-adjust: exact; print-color-adjust: exact;
  }
  .page-wrapper { max-width: 210mm; margin: 0 auto; padding: 0; }

  /* ── HEADER ── */
  .contract-header {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
    color: #fff; padding: 36px 40px 28px; border-radius: 0 0 20px 20px;
    margin-bottom: 28px; position: relative; overflow: hidden;
    break-after: avoid;
    page-break-after: avoid;
  }
  .contract-header::after {
    content: ''; position: absolute; top: -40%; right: -10%; width: 300px; height: 300px;
    background: radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%);
    border-radius: 50%;
  }
  .header-logo { height: 36px; margin-bottom: 18px; position: relative; z-index: 1; }
  .header-title {
    font-size: 22px; font-weight: 800; letter-spacing: -.5px;
    background: linear-gradient(135deg, #fff 0%, #a78bfa 100%);
    -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
    position: relative; z-index: 1;
  }
  .header-subtitle { font-size: 11px; color: #9ca3af; margin-top: 4px; position: relative; z-index: 1; }
  .header-badge {
    display: inline-block; background: rgba(139,92,246,0.2); padding: 4px 14px;
    border-radius: 8px; border: 1px solid rgba(139,92,246,0.3);
    font-weight: 700; color: #a78bfa; font-size: 11px; margin-top: 12px;
    position: relative; z-index: 1;
  }

  /* Primeira section — mantém junto com o header */
  .first-section {
    break-inside: avoid;
    page-break-inside: avoid;
  }

  /* ── SECTIONS ── */
  .section { margin-bottom: 22px; page-break-inside: avoid; }
  .section-title {
    font-size: 14px; font-weight: 800; color: #1a1a2e;
    border-bottom: 2px solid #8b5cf6; padding-bottom: 6px; margin-bottom: 14px;
    text-transform: uppercase; letter-spacing: .5px;
  }
  .data-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 24px; margin-bottom: 10px; }
  .data-item { margin-bottom: 4px; }
  .data-label { font-size: 9px; text-transform: uppercase; letter-spacing: .8px; color: #8b5cf6; font-weight: 700; }
  .data-value { font-size: 12px; font-weight: 600; color: #1a1a2e; }
  .party-block {
    background: #f8f7ff; border: 1px solid #e8e4f8; border-radius: 10px;
    padding: 14px 18px; margin-bottom: 10px; page-break-inside: avoid;
  }
  .party-title {
    font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;
    color: #8b5cf6; margin-bottom: 8px;
  }

  /* ── BODY ── */
  .contract-body { padding: 0 8px; }
  .contract-body h1 { font-size: 16px; font-weight: 800; margin: 24px 0 10px; color: #1a1a2e; page-break-after: avoid; }
  .contract-body h2 { font-size: 14px; font-weight: 700; margin: 20px 0 8px; color: #2d2d5e; page-break-after: avoid; }
  .contract-body h3 { font-size: 12px; font-weight: 700; margin: 14px 0 6px; color: #4a4a8a; }
  .contract-body p { margin-bottom: 8px; text-align: justify; }
  .contract-body ul, .contract-body ol { margin: 6px 0 10px 20px; }
  .contract-body li { margin-bottom: 4px; }
  .contract-body hr { border: none; border-top: 1px solid #e0ddf5; margin: 18px 0; }
  .contract-body strong { color: #1a1a2e; }

  /* ── SIGNATURE ── */
  .signatures { margin-top: 40px; page-break-inside: avoid; }
  .sig-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-top: 20px; }
  .sig-block { text-align: center; }
  .sig-line { border-top: 1px solid #1a1a2e; margin-top: 60px; padding-top: 6px; }
  .sig-name { font-weight: 700; font-size: 12px; }
  .sig-detail { font-size: 10px; color: #666; }
  .witnesses { margin-top: 30px; }
  .witness-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-top: 10px; }

  /* ── FOOTER ── */
  .contract-footer {
    margin-top: 30px; padding-top: 12px; border-top: 1px solid #e0ddf5;
    text-align: center; font-size: 9px; color: #999;
  }
</style>
</head>
<body>
<div class="page-wrapper">

  <!-- ═══ HEADER ═══ -->
  <div class="contract-header">
    ${logoBase64 ? `<img src="${logoBase64}" class="header-logo" alt="Logo">` : ''}
    <div class="header-title">CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE TECNOLOGIA</div>
    <div class="header-subtitle">Software como Serviço (SaaS) – IntimAI</div>
    <div class="header-badge">Nº ${f.NUMERO_CONTRATO || '___'} &bull; ${f.DATA_ASSINATURA || today}</div>
  </div>

  <!-- ═══ ANEXO 0 – QUADRO DE DADOS ═══ -->
  <div class="section first-section">
    <div class="section-title">Anexo 0 – Quadro de Dados do Contrato</div>

    <div class="party-block">
      <div class="party-title">Contratante</div>
      <div class="data-grid">
        <div class="data-item"><div class="data-label">Razão Social / Órgão</div><div class="data-value">${f.NOME_CONTRATANTE || '—'}</div></div>
        <div class="data-item"><div class="data-label">CNPJ / Identificador</div><div class="data-value">${f.IDENTIFICADOR_CONTRATANTE || '—'}</div></div>
        <div class="data-item"><div class="data-label">Endereço</div><div class="data-value">${f.ENDERECO_CONTRATANTE || '—'}</div></div>
        <div class="data-item"><div class="data-label">Representante</div><div class="data-value">${f.REPRESENTANTE_CONTRATANTE || '—'}</div></div>
        <div class="data-item"><div class="data-label">Cargo</div><div class="data-value">${f.CARGO_REPRESENTANTE_CONTRATANTE || '—'}</div></div>
        <div class="data-item"><div class="data-label">CPF</div><div class="data-value">${f.CPF_REPRESENTANTE_CONTRATANTE || '—'}</div></div>
        <div class="data-item"><div class="data-label">RG</div><div class="data-value">${f.RG_REPRESENTANTE_CONTRATANTE || '—'}</div></div>
      </div>
    </div>

    <div class="party-block">
      <div class="party-title">Contratada</div>
      <div class="data-grid">
        <div class="data-item"><div class="data-label">Razão Social</div><div class="data-value">${f.NOME_CONTRATADA}</div></div>
        <div class="data-item"><div class="data-label">CNPJ</div><div class="data-value">${f.CNPJ_CONTRATADA}</div></div>
        <div class="data-item"><div class="data-label">Endereço</div><div class="data-value">${f.ENDERECO_CONTRATADA || '—'}</div></div>
        <div class="data-item"><div class="data-label">Representante</div><div class="data-value">${f.REPRESENTANTE_CONTRATADA}</div></div>
        <div class="data-item"><div class="data-label">Cargo</div><div class="data-value">${f.CARGO_REPRESENTANTE_CONTRATADA}</div></div>
        <div class="data-item"><div class="data-label">CPF</div><div class="data-value">${f.CPF_REPRESENTANTE_CONTRATADA || '—'}</div></div>
        <div class="data-item"><div class="data-label">RG</div><div class="data-value">${f.RG_REPRESENTANTE_CONTRATADA || '—'}</div></div>
      </div>
    </div>

    <div class="party-block">
      <div class="party-title">Unidade Beneficiária</div>
      <div class="data-grid">
        <div class="data-item"><div class="data-label">Órgão / Unidade</div><div class="data-value">${f.UNIDADE_BENEFICIARIA || '—'}</div></div>
        <div class="data-item"><div class="data-label">Endereço</div><div class="data-value">${f.ENDERECO_UNIDADE_BENEFICIARIA || '—'}</div></div>
      </div>
    </div>

    <div class="party-block">
      <div class="party-title">Vigência e Foro</div>
      <div class="data-grid">
        <div class="data-item"><div class="data-label">Início da Vigência</div><div class="data-value">${f.DATA_INICIO_CONTRATO || '—'}</div></div>
        <div class="data-item"><div class="data-label">Fim da Vigência</div><div class="data-value">${f.DATA_FIM_CONTRATO || '—'}</div></div>
        <div class="data-item"><div class="data-label">Prazo Total</div><div class="data-value">${f.VIGENCIA_MESES || '12'} meses</div></div>
        <div class="data-item"><div class="data-label">Foro</div><div class="data-value">${f.CIDADE_FORO || '—'}/${f.UF_FORO || '—'}</div></div>
      </div>
    </div>
  </div>

  <!-- ═══ CORPO DO CONTRATO (UPLOAD) ═══ -->
  <div class="contract-body">
    ${corpoHTML}
  </div>

  <!-- ═══ ANEXO I – CONDIÇÕES COMERCIAIS ═══ -->
  <div class="section" style="margin-top:24px;">
    <div class="section-title">Anexo I – Plano / Condições Comerciais</div>
    <div class="data-grid">
      <div class="data-item"><div class="data-label">Plano Contratado</div><div class="data-value">${f.PLANO_NOME || '—'}</div></div>
      <div class="data-item"><div class="data-label">Modalidade</div><div class="data-value">${f.MODALIDADE_COBRANCA || 'Mensal'}</div></div>
      <div class="data-item"><div class="data-label">Nº de Usuários</div><div class="data-value">${f.NUMERO_USUARIOS || '—'}</div></div>
      <div class="data-item"><div class="data-label">Franquia Mensal</div><div class="data-value">${f.FRANQUIA_INTIMACOES_MENSAL || '—'} intimações</div></div>
      <div class="data-item"><div class="data-label">Valor do Plano</div><div class="data-value">R$ ${f.VALOR_PLANO || '0,00'}</div></div>
      <div class="data-item"><div class="data-label">Excedente</div><div class="data-value">${f.COBRANCA_EXCEDENTE || 'Não'} ${f.VALOR_EXCEDENTE ? '(R$ ' + f.VALOR_EXCEDENTE + '/unid.)' : ''}</div></div>
      <div class="data-item"><div class="data-label">Forma de Pagamento</div><div class="data-value">${f.FORMA_PAGAMENTO || '—'}</div></div>
      <div class="data-item"><div class="data-label">Prazo p/ Pagamento</div><div class="data-value">${f.PRAZO_PAGAMENTO_DIAS || '—'} dias</div></div>
      <div class="data-item"><div class="data-label">Reajuste</div><div class="data-value">${f.REAJUSTE || 'IPCA'}</div></div>
      <div class="data-item"><div class="data-label">1º Vencimento</div><div class="data-value">${f.DATA_PRIMEIRO_VENCIMENTO || '—'}</div></div>
    </div>
    ${f.OBSERVACOES_PLANO ? `<p style="margin-top:8px;font-size:11px;color:#666;"><strong>Obs:</strong> ${f.OBSERVACOES_PLANO}</p>` : ''}
  </div>

  <!-- ═══ ANEXO II – SLA ═══ -->
  <div class="section" style="margin-top:24px;">
    <div class="section-title">Anexo II – Níveis de Serviço (SLA)</div>
    <div class="data-grid">
      <div class="data-item"><div class="data-label">Disponibilidade Mínima</div><div class="data-value">${f.SLA_DISPONIBILIDADE || '—'}%</div></div>
      <div class="data-item"><div class="data-label">Horário de Suporte</div><div class="data-value">${f.HORARIO_SUPORTE || '—'}</div></div>
      <div class="data-item"><div class="data-label">Tempo de Resposta</div><div class="data-value">${f.TEMPO_RESPOSTA_SUPORTE || '—'}</div></div>
      <div class="data-item"><div class="data-label">Tempo Estimado de Resolução</div><div class="data-value">${f.TEMPO_RESOLUCAO_SUPORTE || '—'}</div></div>
    </div>
  </div>

  <!-- ═══ ASSINATURAS ═══ -->
  <div class="signatures">
    <div class="section-title">Assinaturas</div>
    <p style="font-size:12px;margin-bottom:6px;">E por estarem justas e contratadas, firmam o presente instrumento.</p>

    <div class="sig-grid">
      <div class="sig-block">
        <div class="sig-line"></div>
        <div class="sig-name">${f.NOME_CONTRATANTE || 'CONTRATANTE'}</div>
        <div class="sig-detail">${f.REPRESENTANTE_CONTRATANTE || ''}</div>
        <div class="sig-detail">CPF: ${f.CPF_REPRESENTANTE_CONTRATANTE || '___'}</div>
      </div>
      <div class="sig-block">
        <div class="sig-line"></div>
        <div class="sig-name">${f.NOME_CONTRATADA}</div>
        <div class="sig-detail">${f.REPRESENTANTE_CONTRATADA}</div>
        <div class="sig-detail">CPF: ${f.CPF_REPRESENTANTE_CONTRATADA || '___'}</div>
      </div>
    </div>

    <div class="witnesses">
      <div class="witness-grid">
        <div class="sig-block">
          <div class="sig-line"></div>
          <div class="sig-detail"><strong>Testemunha 1:</strong> ${f.NOME_TESTEMUNHA_1 || '___'}</div>
          <div class="sig-detail">CPF: ${f.CPF_TESTEMUNHA_1 || '___'}</div>
        </div>
        <div class="sig-block">
          <div class="sig-line"></div>
          <div class="sig-detail"><strong>Testemunha 2:</strong> ${f.NOME_TESTEMUNHA_2 || '___'}</div>
          <div class="sig-detail">CPF: ${f.CPF_TESTEMUNHA_2 || '___'}</div>
        </div>
      </div>
    </div>
  </div>

  <div class="contract-footer">
    IntimAI Soluções &bull; Documento gerado em ${today}
  </div>

</div>
</body>
</html>`;
}

// ─── Converte markdown simples para HTML ─────────────────────────
function markdownToHTML(md) {
    if (!md) return '';
    let html = md
        // Headings
        .replace(/^### (.+)$/gm, '<h3>$1</h3>')
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
        .replace(/^# (.+)$/gm, '<h1>$1</h1>')
        // Bold
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        // Italic
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        // Horizontal rules
        .replace(/^---$/gm, '<hr>')
        // Unordered lists
        .replace(/^\* (.+)$/gm, '<li>$1</li>')
        // Paragraphs - wrap remaining lines
        .split('\n')
        .map(line => {
            line = line.trim();
            if (!line) return '';
            if (line.startsWith('<h') || line.startsWith('<hr') || line.startsWith('<li') || line.startsWith('<ul') || line.startsWith('<ol') || line.startsWith('</')) return line;
            // Lines starting with a), b), etc.
            if (/^[a-z]\)/.test(line)) return `<p style="padding-left:20px;">${line}</p>`;
            // Lines starting with number. like 1.1.
            if (/^\d+\.\d+/.test(line)) return `<p>${line}</p>`;
            return `<p>${line}</p>`;
        })
        .join('\n');

    // Wrap consecutive <li> items in <ul>
    html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>');

    return html;
}


// ═══════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════
const ContratosPage = () => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [searchParams] = useSearchParams();
    const editorRef = useRef(null);

    // ─── Leads ───────────────────────────────────────────────────
    const [leads, setLeads] = useState([]);
    const [selectedLeadId, setSelectedLeadId] = useState('');

    // ─── Template do corpo (upload) ──────────────────────────────
    const [corpoTemplate, setCorpoTemplate] = useState('');
    const [templateLoading, setTemplateLoading] = useState(true);
    const [uploadingTemplate, setUploadingTemplate] = useState(false);

    // ─── Campos dinâmicos do formulário ──────────────────────────
    const [fields, setFields] = useState({
        NUMERO_CONTRATO: '',
        DATA_ASSINATURA: new Date().toLocaleDateString('pt-BR'),
        // Contratante
        NOME_CONTRATANTE: '',
        IDENTIFICADOR_CONTRATANTE: '',
        ENDERECO_CONTRATANTE: '',
        REPRESENTANTE_CONTRATANTE: '',
        CARGO_REPRESENTANTE_CONTRATANTE: '',
        CPF_REPRESENTANTE_CONTRATANTE: '',
        RG_REPRESENTANTE_CONTRATANTE: '',
        // Contratada
        NOME_CONTRATADA: 'IntimAI Soluções Ltda.',
        CNPJ_CONTRATADA: '63.058.837/0001-01',
        ENDERECO_CONTRATADA: '',
        REPRESENTANTE_CONTRATADA: 'Dores Dey Dias Netto',
        CARGO_REPRESENTANTE_CONTRATADA: 'CEO',
        CPF_REPRESENTANTE_CONTRATADA: '',
        RG_REPRESENTANTE_CONTRATADA: '',
        // Unidade
        UNIDADE_BENEFICIARIA: '',
        ENDERECO_UNIDADE_BENEFICIARIA: '',
        // Vigência
        DATA_INICIO_CONTRATO: '',
        DATA_FIM_CONTRATO: '',
        VIGENCIA_MESES: '12',
        CIDADE_FORO: '',
        UF_FORO: 'MG',
        // Anexo I
        PLANO_NOME: 'IntimAI Pro',
        MODALIDADE_COBRANCA: 'Mensal',
        NUMERO_USUARIOS: '',
        FRANQUIA_INTIMACOES_MENSAL: '',
        VALOR_PLANO: '',
        COBRANCA_EXCEDENTE: 'Não',
        VALOR_EXCEDENTE: '',
        FORMA_PAGAMENTO: 'Pix',
        PRAZO_PAGAMENTO_DIAS: '30',
        REAJUSTE: 'IPCA',
        DATA_PRIMEIRO_VENCIMENTO: '',
        OBSERVACOES_PLANO: '',
        // Anexo II – SLA
        SLA_DISPONIBILIDADE: '99,5',
        HORARIO_SUPORTE: 'Seg a Sex, 08h às 18h',
        TEMPO_RESPOSTA_SUPORTE: 'Até 4 horas úteis',
        TEMPO_RESOLUCAO_SUPORTE: 'Até 24 horas úteis',
        // Testemunhas
        NOME_TESTEMUNHA_1: '',
        CPF_TESTEMUNHA_1: '',
        NOME_TESTEMUNHA_2: '',
        CPF_TESTEMUNHA_2: '',
    });

    const [showPreview, setShowPreview] = useState(true);
    const [logoBase64, setLogoBase64] = useState('');

    // ─── Carregar logo como Base64 ───────────────────────────────
    useEffect(() => {
        fetch('/logo.png')
            .then(res => res.blob())
            .then(blob => {
                const reader = new FileReader();
                reader.onloadend = () => setLogoBase64(reader.result);
                reader.readAsDataURL(blob);
            })
            .catch(() => console.warn('Logo não encontrada'));
    }, []);

    // ─── Carregar leads ──────────────────────────────────────────
    useEffect(() => {
        const fetchLeads = async () => {
            const { data } = await supabase.from('leads').select('*').order('delegacia');
            if (data) setLeads(data);
        };
        fetchLeads();
    }, []);

    // ─── Pré-selecionar lead via URL ─────────────────────────────
    useEffect(() => {
        const leadId = searchParams.get('lead_id');
        if (leadId && leads.length > 0 && leadId !== selectedLeadId) {
            handleLeadSelect(leadId);
        }
    }, [searchParams, leads]);

    // ─── Carregar template do corpo do Supabase ──────────────────
    useEffect(() => {
        const loadTemplate = async () => {
            try {
                setTemplateLoading(true);
                // Buscar a referência salva
                const { data: setting } = await supabase
                    .from('app_settings')
                    .select('value')
                    .eq('key', 'contrato_template_path')
                    .maybeSingle();

                if (setting?.value) {
                    const { data: urlData } = supabase.storage
                        .from('contratos-template')
                        .getPublicUrl(setting.value);

                    if (urlData?.publicUrl) {
                        const response = await fetch(urlData.publicUrl);
                        if (response.ok) {
                            const text = await response.text();
                            setCorpoTemplate(text);
                        }
                    }
                }
            } catch (err) {
                console.warn('Nenhum template salvo encontrado:', err.message);
            } finally {
                setTemplateLoading(false);
            }
        };
        loadTemplate();
    }, []);

    // ─── Atualizar preview quando dados mudam (debounced) ────────
    const debounceRef = useRef(null);
    useEffect(() => {
        if (!editorRef.current || !corpoTemplate) return;
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            // Salvar posição do cursor/seleção antes de atualizar
            const activeEl = document.activeElement;
            const isEditorFocused = editorRef.current.contains(activeEl);
            const corpoHTML = markdownToHTML(corpoTemplate);
            editorRef.current.innerHTML = buildContratoHTML(fields, corpoHTML, logoBase64);
            // Não restaurar foco no editor se o usuário está digitando nos inputs
        }, 400);
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [fields, corpoTemplate, logoBase64]);

    // ─── Handlers ────────────────────────────────────────────────
    const handleLeadSelect = (id) => {
        const lead = leads.find(l => l.id === id);
        if (lead) {
            setSelectedLeadId(id);
            setFields(prev => ({
                ...prev,
                NOME_CONTRATANTE: lead.delegacia || '',
                UNIDADE_BENEFICIARIA: lead.delegacia || '',
                REPRESENTANTE_CONTRATANTE: lead.nome || '',
            }));
        }
    };

    const handleFieldChange = (name, value) => {
        setFields(prev => ({ ...prev, [name]: value }));
    };

    const handleInputChange = (e) => {
        handleFieldChange(e.target.name, e.target.value);
    };

    // ─── Upload do template ──────────────────────────────────────
    const handleTemplateUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingTemplate(true);
        try {
            const text = await file.text();
            const fileName = `modelo_contrato_${Date.now()}.txt`;

            // Upload para Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('contratos-template')
                .upload(fileName, file, { upsert: true });

            if (uploadError) throw uploadError;

            // Salvar referência em app_settings (upsert)
            const { error: settingError } = await supabase
                .from('app_settings')
                .upsert({ key: 'contrato_template_path', value: fileName, updated_at: new Date().toISOString() }, { onConflict: 'key' });

            if (settingError) throw settingError;

            setCorpoTemplate(text);
            toast({ title: 'Modelo atualizado', description: 'O modelo do contrato foi salvo com sucesso.' });
        } catch (err) {
            console.error('Erro ao fazer upload do template:', err);
            toast({ title: 'Erro no upload', description: err.message, variant: 'destructive' });
        } finally {
            setUploadingTemplate(false);
            e.target.value = '';
        }
    };

    // ─── Gerar PDF ───────────────────────────────────────────────
    const generatePDF = async () => {
        if (!editorRef.current) return;

        try {
            setLoading(true);
            const finalHTML = editorRef.current.innerHTML;

            // Envolver no estilo completo do documento para o PDF
            const fullHTML = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body {
    font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
    font-size: 13px; line-height: 1.7; color: #1a1a2e;
    -webkit-print-color-adjust: exact; print-color-adjust: exact;
  }
</style>
</head>
<body>${finalHTML}</body>
</html>`;

            const delegacia = fields.NOME_CONTRATANTE || 'contrato';
            const safeFileName = `Contrato_${delegacia.replace(/\s+/g, '_')}.pdf`;

            const response = await fetch('/api/generate-contrato', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ html: fullHTML, fileName: safeFileName }),
            });

            if (!response.ok) throw new Error('Falha ao gerar PDF');

            const blob = await response.blob();

            // Download
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = safeFileName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();

            // Upload PDF para Supabase Storage
            if (selectedLeadId && fields.NOME_CONTRATANTE) {
                console.log('[Upload] Iniciando upload para o Supabase...');
                // Limpar caracteres estranhos do nome do arquivo para evitar problemas
                const cleanName = fields.NOME_CONTRATANTE.replace(/[^a-zA-Z0-9_\-]/g, '_');
                const pdfFileName = `contrato_${cleanName}_${Date.now()}.pdf`;
                const pdfFile = new File([blob], pdfFileName, { type: 'application/pdf' });

                const { error: uploadError } = await supabase.storage
                    .from('contratos')
                    .upload(pdfFileName, pdfFile);

                if (uploadError) {
                    console.error('[Upload] Erro ao salvar arquivo no bucket:', uploadError);
                    throw new Error(`Erro ao salvar no bucket: ${uploadError.message}`);
                }
                
                console.log('[Upload] Arquivo salvo no bucket com sucesso!');
                const { data: publicData } = supabase.storage.from('contratos').getPublicUrl(pdfFileName);

                console.log('[DB] Salvando histórico na tabela lead_contratos...');
                const { error: dbError } = await supabase.from('lead_contratos').insert([{
                    lead_id: selectedLeadId,
                    pdf_url: publicData.publicUrl,
                }]);

                if (dbError) {
                    console.error('[DB] Erro ao salvar histórico:', dbError);
                } else {
                    console.log('[DB] Histórico salvo com sucesso!');
                    // O Trigger do banco (admin_lead_contratos_trigger) assume daqui para frente:
                    // dispara o webhook N8N e atualiza o funil automaticamente.
                }
            }

            toast({
                title: 'Contrato gerado',
                description: 'O PDF foi gerado, salvo e o download iniciado com sucesso.',
            });
        } catch (error) {
            console.error('Erro:', error);
            toast({
                title: 'Erro ao gerar',
                description: 'Não foi possível gerar o PDF. Verifique os dados.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    // ─── Render helper (inline) ───────────────────────────────────
    const renderField = (label, name, placeholder, extraClassName, extraProps) => (
        <div className={`space-y-1.5 ${extraClassName || ''}`} key={name}>
            <Label htmlFor={name} className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</Label>
            <Input id={name} name={name} value={fields[name] || ''} onChange={handleInputChange} placeholder={placeholder} className="h-9 text-sm placeholder:opacity-40" {...(extraProps || {})} />
        </div>
    );

    // ═══ RENDER ═══════════════════════════════════════════════════
    return (
        <div className="flex flex-col gap-6 max-w-7xl mx-auto">
            <PageHeader
                title="Gerador de Contratos"
                description="Monte, edite e gere contratos personalizados em PDF. O corpo do contrato é carregado do modelo enviado e pode ser editado antes da geração."
            />

            <div className="flex flex-col lg:flex-row gap-6">
                {/* ─── FORMULÁRIO LATERAL ─── */}
                <div className="w-full lg:w-[400px] xl:w-[420px] flex-shrink-0 space-y-4">
                    {/* Seleção de Lead */}
                    <Card className="bg-card/50 backdrop-blur-sm border-border/40 shadow-xl">
                        <CardContent className="space-y-4 pt-6">
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Selecione o Lead</Label>
                                <Select value={selectedLeadId} onValueChange={handleLeadSelect}>
                                    <SelectTrigger className="w-full h-9">
                                        <SelectValue placeholder="Escolha um Lead do funil" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {leads.map(l => (
                                            <SelectItem key={l.id} value={l.id}>{l.delegacia}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {renderField('Nº Contrato', 'NUMERO_CONTRATO', '001/2026')}
                                {renderField('Data Assinatura', 'DATA_ASSINATURA', '27/03/2026')}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Dados do Contratante */}
                    <Card className="bg-card/50 backdrop-blur-sm border-border/40 shadow-xl">
                        <CardContent className="space-y-3 pt-6">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                                Contratante
                            </h3>
                            {renderField('Nome / Razão Social', 'NOME_CONTRATANTE', 'Delegacia XPTO')}
                            <div className="grid grid-cols-2 gap-3">
                                {renderField('CNPJ / Identificador', 'IDENTIFICADOR_CONTRATANTE', '00.000.000/0001-00')}
                                {renderField('Representante', 'REPRESENTANTE_CONTRATANTE', 'Nome completo')}
                            </div>
                            {renderField('Endereço', 'ENDERECO_CONTRATANTE', 'Rua, nº, Bairro, Cidade/UF')}
                            <div className="grid grid-cols-3 gap-3">
                                {renderField('Cargo', 'CARGO_REPRESENTANTE_CONTRATANTE', 'Delegado')}
                                {renderField('CPF', 'CPF_REPRESENTANTE_CONTRATANTE', '000.000.000-00')}
                                {renderField('RG', 'RG_REPRESENTANTE_CONTRATANTE', 'MG-00.000.000')}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Dados da Contratada */}
                    <Card className="bg-card/50 backdrop-blur-sm border-border/40 shadow-xl">
                        <CardContent className="space-y-3 pt-6">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                                Contratada
                            </h3>
                            {renderField('Nome / Razão Social', 'NOME_CONTRATADA', 'IntimAI Soluções Ltda.')}
                            <div className="grid grid-cols-2 gap-3">
                                {renderField('CNPJ / Identificador', 'CNPJ_CONTRATADA', '00.000.000/0001-00')}
                                {renderField('Representante', 'REPRESENTANTE_CONTRATADA', 'Nome completo')}
                            </div>
                            {renderField('Endereço', 'ENDERECO_CONTRATADA', 'Rua, nº, Bairro, Cidade/UF')}
                            <div className="grid grid-cols-3 gap-3">
                                {renderField('Cargo', 'CARGO_REPRESENTANTE_CONTRATADA', 'CEO')}
                                {renderField('CPF', 'CPF_REPRESENTANTE_CONTRATADA', '000.000.000-00')}
                                {renderField('RG', 'RG_REPRESENTANTE_CONTRATADA', 'MG-00.000.000')}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Unidade e Vigência */}
                    <Card className="bg-card/50 backdrop-blur-sm border-border/40 shadow-xl">
                        <CardContent className="space-y-4 pt-6">
                            {/* Bloco Unidade */}
                            <div className="space-y-3 p-4 bg-muted/20 border border-muted/50 rounded-xl">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                                    Unidade Beneficiária
                                </h3>
                                {renderField('Órgão / Unidade', 'UNIDADE_BENEFICIARIA', 'Delegacia XPTO')}
                                {renderField('Endereço da Unidade', 'ENDERECO_UNIDADE_BENEFICIARIA', 'Endereço completo')}
                            </div>
                            
                            {/* Bloco Vigência */}
                            <div className="space-y-3 pt-2">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                    Vigência e Foro
                                </h3>
                                <div className="grid grid-cols-3 gap-3">
                                    {renderField('Início', 'DATA_INICIO_CONTRATO', '01/04/2026')}
                                    {renderField('Fim', 'DATA_FIM_CONTRATO', '01/04/2027')}
                                    {renderField('Meses', 'VIGENCIA_MESES', '12')}
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {renderField('Cidade (Foro)', 'CIDADE_FORO', 'Leopoldina')}
                                    {renderField('UF', 'UF_FORO', 'MG', 'uppercase', { maxLength: 2 })}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Anexo I – Comercial */}
                    <Card className="bg-card/50 backdrop-blur-sm border-border/40 shadow-xl">
                        <CardContent className="space-y-3 pt-6">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                                Anexo I – Plano / Condições Comerciais
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                {renderField('Plano', 'PLANO_NOME', 'IntimAI Pro')}
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Modalidade</Label>
                                    <Select value={fields.MODALIDADE_COBRANCA} onValueChange={(v) => handleFieldChange('MODALIDADE_COBRANCA', v)}>
                                        <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Mensal">Mensal</SelectItem>
                                            <SelectItem value="Anual">Anual</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                {renderField('Nº Usuários', 'NUMERO_USUARIOS', '10')}
                                {renderField('Franquia (mês)', 'FRANQUIA_INTIMACOES_MENSAL', '500')}
                                {renderField('Valor Plano (R$)', 'VALOR_PLANO', '1.500,00')}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Cobra Excedente?</Label>
                                    <Select value={fields.COBRANCA_EXCEDENTE} onValueChange={(v) => handleFieldChange('COBRANCA_EXCEDENTE', v)}>
                                        <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Sim">Sim</SelectItem>
                                            <SelectItem value="Não">Não</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                {renderField('Valor Excedente (R$)', 'VALOR_EXCEDENTE', '3,50')}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Forma Pagamento</Label>
                                    <Select value={fields.FORMA_PAGAMENTO} onValueChange={(v) => handleFieldChange('FORMA_PAGAMENTO', v)}>
                                        <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Pix">Pix</SelectItem>
                                            <SelectItem value="Boleto">Boleto</SelectItem>
                                            <SelectItem value="Transferência">Transferência</SelectItem>
                                            <SelectItem value="Cartão">Cartão</SelectItem>
                                            <SelectItem value="Empenho">Empenho</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                {renderField('Prazo (dias)', 'PRAZO_PAGAMENTO_DIAS', '30')}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {renderField('Reajuste', 'REAJUSTE', 'IPCA')}
                                {renderField('1º Vencimento', 'DATA_PRIMEIRO_VENCIMENTO', '01/05/2026')}
                            </div>
                            {renderField('Observações', 'OBSERVACOES_PLANO', 'Observações adicionais...')}
                        </CardContent>
                    </Card>

                    {/* Anexo II – SLA */}
                    <Card className="bg-card/50 backdrop-blur-sm border-border/40 shadow-xl">
                        <CardContent className="space-y-3 pt-6">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                                Anexo II – Níveis de Serviço (SLA)
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                {renderField('Disponibilidade (%)', 'SLA_DISPONIBILIDADE', '99,5')}
                                {renderField('Horário de Suporte', 'HORARIO_SUPORTE', 'Seg a Sex, 08h às 18h')}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {renderField('Tempo de Resposta', 'TEMPO_RESPOSTA_SUPORTE', 'Até 4 horas úteis')}
                                {renderField('Tempo de Resolução', 'TEMPO_RESOLUCAO_SUPORTE', 'Até 24 horas úteis')}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Testemunhas */}
                    <Card className="bg-card/50 backdrop-blur-sm border-border/40 shadow-xl">
                        <CardContent className="space-y-3 pt-6">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                                Testemunhas
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                {renderField('Nome Testemunha 1', 'NOME_TESTEMUNHA_1', 'Nome completo')}
                                {renderField('CPF Testemunha 1', 'CPF_TESTEMUNHA_1', '000.000.000-00')}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {renderField('Nome Testemunha 2', 'NOME_TESTEMUNHA_2', 'Nome completo')}
                                {renderField('CPF Testemunha 2', 'CPF_TESTEMUNHA_2', '000.000.000-00')}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Modelo e Geração */}
                    <Card className="bg-card/50 backdrop-blur-sm border-border/40 shadow-xl">
                        <CardContent className="space-y-4 pt-6">
                            {/* Upload */}
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                                    <Settings2 size={14} />
                                    Modelo do Corpo do Contrato
                                </h3>
                                <p className="text-[11px] text-muted-foreground leading-relaxed">
                                    Suba um arquivo <code className="bg-muted px-1 py-0.5 rounded text-[10px]">.txt</code> com as cláusulas. O cabeçalho e rodapé dinâmicos são gerados automaticamente.
                                </p>
                                <label className="cursor-pointer">
                                    <input
                                        type="file"
                                        accept=".txt,.md"
                                        onChange={handleTemplateUpload}
                                        className="hidden"
                                    />
                                    <div className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed transition-all text-sm font-medium
                                        ${corpoTemplate
                                            ? 'border-green-500/30 bg-green-500/5 text-green-400 hover:bg-green-500/10'
                                            : 'border-primary/30 bg-primary/5 text-primary hover:bg-primary/10'
                                        }`}
                                    >
                                        {uploadingTemplate ? (
                                            <Loader2 className="animate-spin" size={16} />
                                        ) : corpoTemplate ? (
                                            <>
                                                <FileUp size={16} />
                                                Atualizar Modelo
                                            </>
                                        ) : (
                                            <>
                                                <Upload size={16} />
                                                Enviar Modelo (.txt)
                                            </>
                                        )}
                                    </div>
                                </label>
                            </div>

                            {/* Botão Gerar */}
                            <Button
                                onClick={generatePDF}
                                disabled={loading || !fields.NOME_CONTRATANTE || !corpoTemplate || !selectedLeadId}
                                size="lg"
                                className="w-full h-14 text-lg font-bold gap-3 shadow-xl shadow-primary/20 hover:scale-[1.01] transition-transform"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin" />
                                        Gerando Contrato...
                                    </>
                                ) : (
                                    <>
                                        <ScrollText size={22} />
                                        Gerar Contrato
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* ─── PREVIEW DO CONTRATO ─── */}
                <div className="flex-1 min-w-0">
                    <Card className="bg-card/50 backdrop-blur-sm border-border/40 shadow-xl sticky top-4">
                        <CardContent className="pt-6">
                            {/* Toolbar do Preview */}
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-bold flex items-center gap-2 text-muted-foreground">
                                    <ScrollText size={16} className="text-primary" />
                                    Pré-visualização do Contrato
                                    <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">editável</span>
                                </h3>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowPreview(!showPreview)}
                                    className="h-7 text-xs gap-1.5"
                                >
                                    {showPreview ? <EyeOff size={14} /> : <Eye size={14} />}
                                    {showPreview ? 'Ocultar' : 'Mostrar'}
                                </Button>
                            </div>

                            {showPreview && (
                                <>
                                    {templateLoading ? (
                                        <div className="flex items-center justify-center py-20">
                                            <Loader2 className="h-8 w-8 animate-spin text-primary opacity-50" />
                                        </div>
                                    ) : !corpoTemplate ? (
                                        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                                            <Upload size={48} className="text-muted-foreground/30" />
                                            <div>
                                                <p className="font-semibold text-muted-foreground">Nenhum modelo de contrato configurado</p>
                                                <p className="text-xs text-muted-foreground/60 mt-1">
                                                    Use o botão "Enviar Modelo" ao lado para carregar o corpo do contrato.
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            ref={editorRef}
                                            contentEditable
                                            suppressContentEditableWarning
                                            className="bg-white rounded-xl shadow-inner overflow-auto max-h-[80vh] p-0 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
                                            style={{
                                                minHeight: '600px',
                                                color: '#1a1a2e',
                                                fontSize: '13px',
                                                lineHeight: '1.7',
                                            }}
                                        />
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ContratosPage;
