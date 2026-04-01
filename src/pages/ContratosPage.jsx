import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/customSupabaseClient';
import { useContratos } from '@/hooks/useContratos';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import { 
    ScrollText, 
    Download, 
    Loader2, 
    Upload, 
    Settings2, 
    Eye, 
    EyeOff, 
    FileUp,
    History,
    Plus,
    Search,
    Trash2,
    ExternalLink,
    Calendar,
    CheckCircle2,
    Clock,
    XCircle,
    Send,
    Building2,
    FileText
} from 'lucide-react';

// ─── Construtor do HTML do contrato ──────────────────────────────
function buildContratoHTML(fields, corpoHTML, logoBase64) {
    const f = fields;
    const today = new Date().toLocaleDateString('pt-BR');

    return `<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
  .contract-preview {
    font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
    font-size: 13px; line-height: 1.7; color: #1a1a2e;
    -webkit-print-color-adjust: exact; print-color-adjust: exact;
    text-align: left;
  }
  .contract-preview * {
    box-sizing: border-box;
  }
  .page-wrapper { max-width: 210mm; margin: 0 auto; padding: 0; }

  /* ── HEADER ── */
  .contract-header {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
    color: #fff; padding: 24px 40px 20px; border-radius: 0 0 20px 20px;
    margin-bottom: 20px; position: relative; overflow: hidden;
    display: block;
  }
  .contract-header::after {
    content: ''; position: absolute; top: -40%; right: -10%; width: 300px; height: 300px;
    background: radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%);
    border-radius: 50%;
  }
  .header-logo { height: 32px; margin-bottom: 14px; position: relative; z-index: 1; }
  .header-title {
    font-size: 20px; font-weight: 800; letter-spacing: -.5px;
    background: linear-gradient(135deg, #fff 0%, #a78bfa 100%);
    -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
    position: relative; z-index: 1;
  }
  .header-subtitle { font-size: 10px; color: #9ca3af; margin-top: 2px; position: relative; z-index: 1; }
  .header-badge {
    display: inline-block; background: rgba(139,92,246,0.2); padding: 3px 12px;
    border-radius: 8px; border: 1px solid rgba(139,92,246,0.3);
    font-weight: 700; color: #a78bfa; font-size: 10px; margin-top: 10px;
    position: relative; z-index: 1;
  }

  /* ── SECTIONS ── */
  .section { margin-bottom: 20px; }
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
<div class="contract-preview">
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
</div>`;
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
    const [activeTab, setActiveTab] = useState('historico'); // 'gerar' ou 'historico'
    const [loading, setLoading] = useState(false);
    const [searchParams] = useSearchParams();
    const editorRef = useRef(null);
    const { contratos, loading: loadingHistorico, updateStatus, deleteContrato, fetchContratos } = useContratos();

    // ─── Leads ───────────────────────────────────────────────────
    const [leads, setLeads] = useState([]);
    const [selectedLeadId, setSelectedLeadId] = useState('');

    // ─── Template do corpo (upload) ──────────────────────────────
    const [corpoTemplate, setCorpoTemplate] = useState('');
    const [templateLoading, setTemplateLoading] = useState(true);
    const [uploadingTemplate, setUploadingTemplate] = useState(false);

    // ─── Filtros do Histórico ────────────────────────────────────
    const [filtroStatus, setFiltroStatus] = useState('todos');
    const [buscaHistorico, setBuscaHistorico] = useState('');
    const [isDeleting, setIsDeleting] = useState(null);

    // ─── Campos dinâmicos do formulário ──────────────────────────
    const [fields, setFields] = useState({
        NUMERO_CONTRATO: '',
        DATA_ASSINATURA: new Date().toLocaleDateString('pt-BR'),
        NOME_CONTRATANTE: '',
        IDENTIFICADOR_CONTRATANTE: '',
        ENDERECO_CONTRATANTE: '',
        REPRESENTANTE_CONTRATANTE: '',
        CARGO_REPRESENTANTE_CONTRATANTE: '',
        CPF_REPRESENTANTE_CONTRATANTE: '',
        RG_REPRESENTANTE_CONTRATANTE: '',
        NOME_CONTRATADA: 'IntimAI Soluções Ltda.',
        CNPJ_CONTRATADA: '63.058.837/0001-01',
        ENDERECO_CONTRATADA: '',
        REPRESENTANTE_CONTRATADA: 'Dores Dey Dias Netto',
        CARGO_REPRESENTANTE_CONTRATADA: 'CEO',
        CPF_REPRESENTANTE_CONTRATADA: '',
        RG_REPRESENTANTE_CONTRATADA: '',
        UNIDADE_BENEFICIARIA: '',
        ENDERECO_UNIDADE_BENEFICIARIA: '',
        DATA_INICIO_CONTRATO: '',
        DATA_FIM_CONTRATO: '',
        VIGENCIA_MESES: '12',
        CIDADE_FORO: '',
        UF_FORO: 'MG',
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
        SLA_DISPONIBILIDADE: '99,5',
        HORARIO_SUPORTE: 'Seg a Sex, 08h às 18h',
        TEMPO_RESPOSTA_SUPORTE: 'Até 4 horas úteis',
        TEMPO_RESOLUCAO_SUPORTE: 'Até 24 horas úteis',
        NOME_TESTEMUNHA_1: '',
        CPF_TESTEMUNHA_1: '',
        NOME_TESTEMUNHA_2: '',
        CPF_TESTEMUNHA_2: '',
    });

    const [showPreview, setShowPreview] = useState(true);
    const [logoBase64, setLogoBase64] = useState('');

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

    useEffect(() => {
        const fetchLeads = async () => {
            const { data } = await supabase.from('leads').select('*').order('delegacia');
            if (data) setLeads(data);
        };
        fetchLeads();
    }, []);

    useEffect(() => {
        const leadId = searchParams.get('lead_id');
        if (leadId && leads.length > 0 && leadId !== selectedLeadId) {
            handleLeadSelect(leadId);
        }
    }, [searchParams, leads]);

    useEffect(() => {
        const loadTemplate = async () => {
            try {
                setTemplateLoading(true);
                const { data: setting } = await supabase
                    .from('admin_settings')
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

    const debounceRef = useRef(null);
    useEffect(() => {
        if (!editorRef.current || !corpoTemplate || activeTab !== 'gerar') return;
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            const corpoHTML = markdownToHTML(corpoTemplate);
            editorRef.current.innerHTML = buildContratoHTML(fields, corpoHTML, logoBase64);
        }, 400);
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [fields, corpoTemplate, logoBase64, activeTab]);

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

    const handleTemplateUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingTemplate(true);
        try {
            const text = await file.text();
            const fileName = `modelo_contrato_${Date.now()}.txt`;

            const { error: uploadError } = await supabase.storage
                .from('contratos-template')
                .upload(fileName, file, { upsert: true });

            if (uploadError) throw uploadError;

            const { error: settingError } = await supabase
                .from('admin_settings')
                .upsert({ key: 'contrato_template_path', value: fileName, updated_at: new Date().toISOString() }, { onConflict: 'key' });

            if (settingError) throw settingError;

            setCorpoTemplate(text);
            toast({ title: 'Modelo atualizado', description: 'O modelo do contrato foi salvo com sucesso.' });
        } catch (err) {
            toast({ title: 'Erro no upload', description: err.message, variant: 'destructive' });
        } finally {
            setUploadingTemplate(false);
            e.target.value = '';
        }
    };

    const generatePDF = async () => {
        if (!editorRef.current) return;
        try {
            setLoading(true);
            const finalHTML = editorRef.current.innerHTML;
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

            let saveSuccessful = false;
            if (window.showSaveFilePicker) {
                try {
                    const handle = await window.showSaveFilePicker({
                        suggestedName: safeFileName,
                        types: [{ description: 'Arquivo PDF', accept: { 'application/pdf': ['.pdf'] } }],
                    });
                    const writable = await handle.createWritable();
                    await writable.write(blob);
                    await writable.close();
                    saveSuccessful = true;
                } catch (err) {
                    if (err.name === 'AbortError') return;
                }
            }

            if (!saveSuccessful) {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = safeFileName;
                document.body.appendChild(a); a.click();
                window.URL.revokeObjectURL(url); a.remove();
            }

            if (selectedLeadId && fields.NOME_CONTRATANTE) {
                const cleanName = fields.NOME_CONTRATANTE.replace(/[^a-zA-Z0-9_\-]/g, '_');
                const pdfFileName = `contrato_${cleanName}_${Date.now()}.pdf`;
                const pdfFile = new File([blob], pdfFileName, { type: 'application/pdf' });

                const { error: uploadError } = await supabase.storage.from('contratos').upload(pdfFileName, pdfFile);
                if (uploadError) throw uploadError;
                
                const { data: publicData } = supabase.storage.from('contratos').getPublicUrl(pdfFileName);
                await supabase.from('lead_contratos').insert([{
                    lead_id: selectedLeadId,
                    pdf_url: publicData.publicUrl,
                    status: 'pendente'
                }]);
                fetchContratos();
            }

            toast({ title: 'Contrato gerado', description: 'O PDF foi salvo no histórico.' });
        } catch (error) {
            toast({ title: 'Erro ao gerar', description: error.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    // ─── Lógica do Histórico ─────────────────────────────────────
    
    const contratosFiltrados = useMemo(() => {
        return contratos.filter(c => {
            const matchesStatus = filtroStatus === 'todos' || c.status === filtroStatus;
            const matchesSearch = c.delegacia_nome.toLowerCase().includes(buscaHistorico.toLowerCase());
            return matchesStatus && matchesSearch;
        });
    }, [contratos, filtroStatus, buscaHistorico]);

    const handleDelete = async () => {
        if (!isDeleting) return;
        setLoading(true);
        await deleteContrato(isDeleting);
        setLoading(false);
        setIsDeleting(null);
    };

    const renderField = (label, name, placeholder, extraClassName, extraProps) => (
        <div className={`space-y-1.5 ${extraClassName || ''}`} key={name}>
            <Label htmlFor={name} className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</Label>
            <Input id={name} name={name} value={fields[name] || ''} onChange={handleInputChange} placeholder={placeholder} className="h-9 text-sm placeholder:opacity-40" {...(extraProps || {})} />
        </div>
    );

    return (
        <div className="flex flex-col gap-6 max-w-7xl mx-auto">
            <PageHeader
                title="Gestão de Contratos"
                description="Gere contratos jurídicos personalizados ou gerencie o status das assinaturas."
            />

            <Card className="border-border/60 bg-card/40 backdrop-blur-sm overflow-hidden min-h-[500px]">
                <CardContent className="p-6 space-y-6">
                    {/* Tabs de Navegação */}
                    <div className="flex items-center gap-1 p-1 bg-muted/30 border border-border/50 rounded-xl w-fit">
                        <button
                            onClick={() => setActiveTab('historico')}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all",
                                activeTab === 'historico' 
                                    ? "bg-background text-primary shadow-sm ring-1 ring-border" 
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                            )}
                        >
                            <History size={16} />
                            Histórico de Contratos
                        </button>
                        <button
                            onClick={() => setActiveTab('gerar')}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all",
                                activeTab === 'gerar' 
                                    ? "bg-background text-primary shadow-sm ring-1 ring-border" 
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                            )}
                        >
                            <Plus size={16} />
                            Gerar Novo
                        </button>
                    </div>

                    {activeTab === 'gerar' ? (
                        /* ═══ ABA GERAR ═══ */
                        <div className="flex flex-col lg:flex-row gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="w-full lg:w-[400px] xl:w-[420px] flex-shrink-0 space-y-4">
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

                                <Card className="bg-card/50 backdrop-blur-sm border-border/40 shadow-xl">
                                    <CardContent className="space-y-3 pt-6">
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-primary">Contratante</h3>
                                        {renderField('Razão Social', 'NOME_CONTRATANTE', 'Delegacia XPTO')}
                                        <div className="grid grid-cols-2 gap-3">
                                            {renderField('CNPJ/Identificador', 'IDENTIFICADOR_CONTRATANTE', '00.000.000/0001-00')}
                                            {renderField('Representante', 'REPRESENTANTE_CONTRATANTE', 'Nome completo')}
                                        </div>
                                        {renderField('Endereço', 'ENDERECO_CONTRATANTE', 'Rua, nº, Bairro, Cidade/UF')}
                                    </CardContent>
                                </Card>

                                <Card className="bg-card/50 backdrop-blur-sm border-border/40 shadow-xl">
                                    <CardContent className="space-y-4 pt-6">
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-primary">Vigência e Plano</h3>
                                        <div className="grid grid-cols-3 gap-3">
                                            {renderField('Início', 'DATA_INICIO_CONTRATO', '01/04/2026')}
                                            {renderField('Fim', 'DATA_FIM_CONTRATO', '01/04/2027')}
                                            {renderField('Meses', 'VIGENCIA_MESES', '12')}
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            {renderField('Valor Plano (R$)', 'VALOR_PLANO', '1.500,00')}
                                            {renderField('Cid/UF Foro', 'CIDADE_FORO', 'MG')}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-card/50 backdrop-blur-sm border-border/40 shadow-xl p-4">
                                    <div className="space-y-3 text-center">
                                        <Label className="text-xs font-bold uppercase text-muted-foreground flex items-center justify-center gap-2">
                                            <Settings2 size={14} /> Modelo do Corpo (Markdown)
                                        </Label>
                                        <div className="flex flex-col gap-2">
                                            <Button variant="outline" size="sm" className="w-full relative overflow-hidden h-10 gap-2 border-dashed">
                                                {uploadingTemplate ? <Loader2 className="animate-spin" size={16} /> : <FileUp size={16} />}
                                                {uploadingTemplate ? 'Enviando...' : 'Atualizar Modelo (.txt)'}
                                                <input type="file" accept=".txt,.md" onChange={handleTemplateUpload} disabled={uploadingTemplate} className="absolute inset-0 opacity-0 cursor-pointer" />
                                            </Button>
                                            <p className="text-[10px] text-muted-foreground">O conteúdo textual do contrato é baseado em um arquivo markdown (.txt).</p>
                                        </div>
                                    </div>
                                </Card>

                                <Button onClick={generatePDF} disabled={loading || !corpoTemplate} size="lg" className="w-full h-14 text-lg font-bold gap-3 shadow-xl shadow-primary/10">
                                    {loading ? <Loader2 className="animate-spin" /> : <ScrollText size={22} />}
                                    {loading ? 'Gerando...' : 'Gerar Contrato'}
                                </Button>
                            </div>

                            <div className="flex-1 min-w-0">
                                <Card className="bg-card/50 backdrop-blur-sm border-border/40 shadow-xl sticky top-4">
                                    <CardContent className="pt-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-sm font-bold flex items-center gap-2 text-muted-foreground">
                                                <Eye size={16} className="text-primary" /> Visualização do Documento
                                            </h3>
                                            <Button variant="ghost" size="sm" onClick={() => setShowPreview(!showPreview)} className="h-7 text-xs">
                                                {showPreview ? <EyeOff size={14} /> : <Eye size={14} />} {showPreview ? 'Ocultar' : 'Mostrar'}
                                            </Button>
                                        </div>
                                        {showPreview && (
                                            <div className="relative rounded-xl border border-border/30 bg-card overflow-hidden h-[75vh] shadow-inner">
                                                {(loading || templateLoading) && (
                                                    <div className="absolute inset-0 z-10 bg-background/50 backdrop-blur-sm flex items-center justify-center">
                                                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                                    </div>
                                                )}
                                                <div ref={editorRef} className="w-full h-full overflow-y-auto p-4 bg-white" />
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    ) : (
                        /* ═══ ABA HISTÓRICO ═══ */
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                    <Input placeholder="Buscar por delegacia..." value={buscaHistorico} onChange={(e) => setBuscaHistorico(e.target.value)} className="pl-10 h-10 bg-background/50 border-border/60 focus:border-primary/50" />
                                </div>
                                <div className="flex items-center gap-3 w-full md:w-auto">
                                    <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                                        <SelectTrigger className="w-[160px] h-10 bg-background/50 border-border/60">
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="todos">Todos os Status</SelectItem>
                                            <SelectItem value="pendente">Pendente</SelectItem>
                                            <SelectItem value="enviado">Enviado</SelectItem>
                                            <SelectItem value="assinado">Assinado</SelectItem>
                                            <SelectItem value="cancelado">Cancelado</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {loadingHistorico ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-3">
                                    <Loader2 className="animate-spin text-primary" size={40} />
                                    <p className="text-muted-foreground font-medium">Carregando histórico...</p>
                                </div>
                            ) : contratosFiltrados.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground bg-muted/10 rounded-xl border border-dashed border-border/50">
                                    <FileText className="h-16 w-16 mb-4 opacity-10" />
                                    <p className="text-lg font-medium">Nenhum contrato encontrado.</p>
                                    <p className="text-sm opacity-60 text-center max-w-xs mt-2">
                                        Ajuste os filtros ou gere um novo contrato jurídico.
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-border/50 text-muted-foreground text-[11px] uppercase tracking-wider">
                                                <th className="text-left py-3 px-3 font-semibold">Delegacia</th>
                                                <th className="text-left py-3 px-3 font-semibold">Geração</th>
                                                <th className="text-left py-3 px-3 font-semibold">Status</th>
                                                <th className="text-center py-3 px-3 font-semibold">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {contratosFiltrados.map((contrato) => (
                                                <tr key={contrato.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                                                    <td className="py-3 px-3">
                                                        <div className="flex flex-col">
                                                            <span className="font-semibold text-foreground">{contrato.delegacia_nome}</span>
                                                            <span className="text-[10px] text-muted-foreground uppercase opacity-70">ID #{contrato.id.slice(0, 8)}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-3 text-muted-foreground text-xs whitespace-nowrap">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar size={14} className="opacity-50" />
                                                            {new Date(contrato.created_at).toLocaleDateString('pt-BR')}
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-3">
                                                        <Select value={contrato.status || 'pendente'} onValueChange={(val) => updateStatus(contrato.id, val)}>
                                                            <SelectTrigger className={cn(
                                                                "h-7 w-[110px] text-[10px] font-bold uppercase border rounded-full px-2.5 bg-background transition-all",
                                                                contrato.status === 'pendente' ? 'text-amber-500 border-amber-500/20 bg-amber-500/10' :
                                                                contrato.status === 'enviado' ? 'text-blue-500 border-blue-500/20 bg-blue-500/10' :
                                                                contrato.status === 'assinado' ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/10' :
                                                                'text-red-500 border-red-500/20 bg-red-500/10'
                                                            )}>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent className="text-xs">
                                                                <SelectItem value="pendente">Pendente</SelectItem>
                                                                <SelectItem value="enviado">Enviado</SelectItem>
                                                                <SelectItem value="assinado">Assinado</SelectItem>
                                                                <SelectItem value="cancelado">Cancelado</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </td>
                                                    <td className="py-3 px-3 text-center">
                                                        <div className="flex items-center justify-center gap-1">
                                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-primary" asChild>
                                                                <a href={contrato.pdf_url} target="_blank" rel="noreferrer" title="Visualizar PDF">
                                                                    <ExternalLink size={16} />
                                                                </a>
                                                            </Button>
                                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10" onClick={() => setIsDeleting(contrato)} title="Excluir">
                                                                <Trash2 size={16} />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            <ConfirmationModal
                isOpen={!!isDeleting}
                onClose={() => setIsDeleting(null)}
                onConfirm={handleDelete}
                title="Excluir Contrato"
                description={`Tem certeza que deseja excluir este contrato da delegacia "${isDeleting?.delegacia_nome}"? O arquivo PDF também será removido permanentemente.`}
                loading={loading}
                variant="destructive"
            />
        </div>
    );
};

export default ContratosPage;
