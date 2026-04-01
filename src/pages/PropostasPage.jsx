import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
    FileText, 
    Download, 
    Loader2, 
    Sparkles, 
    Eye, 
    EyeOff, 
    History, 
    Plus, 
    Search, 
    Trash2, 
    ExternalLink,
    Calendar,
    DollarSign,
    CheckCircle2,
    Clock,
    XCircle,
    Send,
    Building2
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/customSupabaseClient';
import { usePropostas } from '@/hooks/usePropostas';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import ConfirmationModal from '@/components/ui/ConfirmationModal';

const PropostasPage = () => {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState('historico'); // 'gerar' ou 'historico'
    const [loading, setLoading] = useState(false);
    const [searchParams] = useSearchParams();
    const { propostas, loading: loadingHistorico, updateStatus, deleteProposta, fetchPropostas } = usePropostas();
    
    // Estados do Formulário
    const [formData, setFormData] = useState({
        delegacia: '',
        parceiro: '',
        estado: 'MG',
        usuarios: '',
        valor_usuario: '',
        total_mensal: '0,00',
        total_anual: '0,00',
        total_anual_antecipado: '',
        contexto: 'A Polícia Civil enfrenta limitações operacionais relacionadas à escassez de efetivo e necessidade de maior eficiência na execução de atos administrativos. O INTIMAI.APP automatiza o cumprimento de intimações, atividade essencial para o andamento de inquéritos, reduzindo custos de deslocamento, papel e combustível.'
    });

    const [leads, setLeads] = useState([]);
    const [selectedLeadId, setSelectedLeadId] = useState('');
    const [showPreview, setShowPreview] = useState(true);
    const [previewHtml, setPreviewHtml] = useState('');
    const [previewLoading, setPreviewLoading] = useState(false);

    // Filtros do Histórico
    const [filtroStatus, setFiltroStatus] = useState('todos');
    const [buscaHistorico, setBuscaHistorico] = useState('');
    const [isDeleting, setIsDeleting] = useState(null);

    // ─── Efeitos e Handlers do Formulário ────────────────────────
    
    useEffect(() => {
        // Debounce Preview Generation
        const timer = setTimeout(async () => {
            if (!formData.delegacia || !formData.usuarios) {
                setPreviewHtml('');
                return;
            }
            try {
                setPreviewLoading(true);
                const res = await fetch('/api/preview-proposta', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                if (res.ok) {
                    const html = await res.text();
                    setPreviewHtml(html);
                }
            } catch (err) {
                console.error("Erro no preview:", err);
            } finally {
                setPreviewLoading(false);
            }
        }, 800);
        return () => clearTimeout(timer);
    }, [formData]);

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

    const handleLeadSelect = (id) => {
        const lead = leads.find(l => l.id === id);
        if (lead) {
            setSelectedLeadId(id);
            setFormData(prev => ({ ...prev, delegacia: lead.delegacia || '' }));
        }
    };

    const formatCurrency = (val) => {
        if (!val) return '';
        const num = typeof val === 'string' ? parseFloat(val.replace(/\./g, '').replace(',', '.')) : val;
        if (isNaN(num)) return val;
        return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    useEffect(() => {
        const parseCurrency = (val) => {
            if (!val) return 0;
            const clean = val.toString().replace(/R\$\s?/, '').replace(/\./g, '').replace(',', '.');
            return parseFloat(clean) || 0;
        };
        const nUsuarios = parseInt(formData.usuarios) || 0;
        const vUsuario = parseCurrency(formData.valor_usuario);
        const mensal = nUsuarios * vUsuario;
        const anual = mensal * 12;
        setFormData(prev => ({
            ...prev,
            total_mensal: formatCurrency(mensal) || '0,00',
            total_anual: formatCurrency(anual) || '0,00'
        }));
    }, [formData.usuarios, formData.valor_usuario]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        if (name === 'valor_usuario' || name === 'total_anual_antecipado') {
            setFormData(prev => ({ ...prev, [name]: formatCurrency(value) }));
        }
    };

    const generatePDF = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/generate-pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (!response.ok) throw new Error('Falha ao gerar PDF');
            const blob = await response.blob();
            const safeFileName = `Proposta_${formData.delegacia.replace(/\s+/g, '_')}.pdf`;
            
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

            if (selectedLeadId && formData.delegacia) {
                const fileName = `proposta_${formData.delegacia.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
                const file = new File([blob], fileName, { type: 'application/pdf' });
                const { error: uploadError } = await supabase.storage.from('propostas').upload(fileName, file);

                if (!uploadError) {
                    const { data: publicData } = supabase.storage.from('propostas').getPublicUrl(fileName);
                    await supabase.from('lead_propostas').insert([{
                        lead_id: selectedLeadId,
                        pdf_url: publicData.publicUrl,
                        valor_mensal: formData.total_mensal,
                        valor_anual: formData.total_anual,
                        status: 'pendente'
                    }]);
                    fetchPropostas(); // Atualiza histórico
                }
            }
            toast({ title: "Proposta gerada", description: "O PDF foi gerado e salvo no histórico." });
        } catch (error) {
            toast({ title: "Erro ao gerar", description: "Verifique os dados.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    // ─── Lógica do Histórico ─────────────────────────────────────
    
    const propostasFiltradas = useMemo(() => {
        return propostas.filter(p => {
            const matchesStatus = filtroStatus === 'todos' || p.status === filtroStatus;
            const matchesSearch = p.delegacia_nome.toLowerCase().includes(buscaHistorico.toLowerCase());
            return matchesStatus && matchesSearch;
        });
    }, [propostas, filtroStatus, buscaHistorico]);

    const handleDelete = async () => {
        if (!isDeleting) return;
        setLoading(true);
        await deleteProposta(isDeleting);
        setLoading(false);
        setIsDeleting(null);
    };

    return (
        <div className="flex flex-col gap-6 max-w-7xl mx-auto">
            <PageHeader
                title="Gestão de Propostas"
                description="Gere propostas personalizadas ou gerencie o ciclo de vida dos documentos enviados."
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
                            Histórico de Propostas
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
                            Gerar Nova
                        </button>
                    </div>

                    {activeTab === 'gerar' ? (
                        /* ═══ ABA GERAR ═══ */
                        <div className="flex flex-col lg:flex-row gap-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="w-full lg:w-[460px] xl:w-[480px] flex-shrink-0 space-y-4">
                                <Card className="bg-card/50 backdrop-blur-sm border-border/40 shadow-xl">
                                    <CardContent className="space-y-5 pt-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="delegacia">Delegacia (Lead do Funil)</Label>
                                            <Select value={selectedLeadId} onValueChange={handleLeadSelect}>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Escolha um Lead do funil" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {leads.map(l => (
                                                        <SelectItem key={l.id} value={l.id}>{l.delegacia}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="parceiro">Parceiro Institucional</Label>
                                                <Input id="parceiro" name="parceiro" value={formData.parceiro} onChange={handleChange} placeholder="Ex: Câmara Municipal" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="estado">Estado (UF)</Label>
                                                <Input id="estado" name="estado" value={formData.estado} onChange={handleChange} placeholder="MG" maxLength={2} className="uppercase" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 border-t border-border/20 pt-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="usuarios">Qtd de Usuários</Label>
                                                <Input id="usuarios" name="usuarios" value={formData.usuarios} onChange={handleChange} placeholder="Ex: 10" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="valor_usuario">Valor por Usuário (R$)</Label>
                                                <Input id="valor_usuario" name="valor_usuario" value={formData.valor_usuario} onChange={handleChange} onBlur={handleBlur} placeholder="Ex: 390,00" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="total_mensal">Total Mensal (R$)</Label>
                                                <Input id="total_mensal" name="total_mensal" value={formData.total_mensal} readOnly className="bg-muted/50 font-mono font-bold" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="total_anual">Total Anual (R$)</Label>
                                                <Input id="total_anual" name="total_anual" value={formData.total_anual} readOnly className="bg-muted/50 font-mono font-bold" />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="total_anual_antecipado">Anual Antecipado (R$)</Label>
                                            <Input id="total_anual_antecipado" name="total_anual_antecipado" value={formData.total_anual_antecipado} onChange={handleChange} onBlur={handleBlur} placeholder="Valor com desconto manual" />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="contexto">Contexto / Justificativa</Label>
                                            <Textarea
                                                id="contexto" name="contexto" value={formData.contexto} onChange={handleChange}
                                                className="min-h-[120px] resize-none" placeholder="Breve descrição..."
                                            />
                                        </div>

                                        <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 space-y-3 mt-6">
                                            <h4 className="text-sm font-bold flex items-center gap-2">
                                                <Sparkles className="w-4 h-4 text-primary" />
                                                Resumo da Proposta
                                            </h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Mensal</span>
                                                    <span className="text-lg font-mono font-bold">R$ {formData.total_mensal}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Anual</span>
                                                    <span className="text-lg font-mono font-bold">R$ {formData.total_anual}</span>
                                                </div>
                                                <div className="flex flex-col p-2 bg-green-500/10 border border-green-500/20 rounded-lg">
                                                    <span className="text-[10px] text-green-600 dark:text-green-400 uppercase font-bold tracking-wider">À Vista</span>
                                                    <span className="text-xl font-mono font-bold text-green-600 dark:text-green-400">R$ {formData.total_anual_antecipado}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <Button
                                            onClick={generatePDF}
                                            disabled={loading || !formData.delegacia || !formData.usuarios}
                                            size="lg"
                                            className="w-full h-14 text-lg font-bold gap-3 shadow-xl"
                                        >
                                            {loading ? <Loader2 className="animate-spin" /> : <FileText size={22} />}
                                            {loading ? 'Gerando...' : 'Gerar Proposta'}
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="flex-1 min-w-0">
                                <Card className="bg-card/50 backdrop-blur-sm border-border/40 shadow-xl sticky top-4">
                                    <CardContent className="pt-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-sm font-bold flex items-center gap-2 text-muted-foreground">
                                                <FileText size={16} className="text-primary" />
                                                Pré-visualização
                                            </h3>
                                            <Button variant="ghost" size="sm" onClick={() => setShowPreview(!showPreview)}>
                                                {showPreview ? <EyeOff size={14} /> : <Eye size={14} />}
                                                {showPreview ? 'Ocultar' : 'Mostrar'}
                                            </Button>
                                        </div>
                                        {showPreview && (
                                            <div className="relative rounded-xl border border-border/30 bg-card overflow-hidden flex flex-col w-full h-[70vh] shadow-inner">
                                                {previewLoading && (
                                                    <div className="absolute inset-0 z-10 bg-background/50 backdrop-blur-sm flex items-center justify-center">
                                                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                                    </div>
                                                )}
                                                {!previewHtml ? (
                                                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center bg-muted/10">
                                                        <FileText className="w-16 h-16 mb-4 opacity-20" />
                                                        <p>Preencha os dados para visualizar.</p>
                                                    </div>
                                                ) : (
                                                    <iframe srcDoc={previewHtml} className="w-full h-full border-none bg-transparent" />
                                                )}
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
                                            <SelectItem value="enviada">Enviada</SelectItem>
                                            <SelectItem value="aprovada">Aprovada</SelectItem>
                                            <SelectItem value="recusada">Recusada</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {loadingHistorico ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-3">
                                    <Loader2 className="animate-spin text-primary" size={40} />
                                    <p className="text-muted-foreground font-medium">Carregando histórico...</p>
                                </div>
                            ) : propostasFiltradas.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground bg-muted/10 rounded-xl border border-dashed border-border/50">
                                    <FileText className="h-16 w-16 mb-4 opacity-10" />
                                    <p className="text-lg font-medium">Nenhuma proposta encontrada.</p>
                                    <p className="text-sm opacity-60 text-center max-w-xs mt-2">
                                        Ajuste os filtros ou gere uma nova proposta comercial.
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-border/50 text-muted-foreground text-[11px] uppercase tracking-wider">
                                                <th className="text-left py-3 px-3 font-semibold">Delegacia</th>
                                                <th className="text-left py-3 px-3 font-semibold">Mensal</th>
                                                <th className="text-left py-3 px-3 font-semibold">Anual</th>
                                                <th className="text-left py-3 px-3 font-semibold">Data</th>
                                                <th className="text-left py-3 px-3 font-semibold">Status</th>
                                                <th className="text-center py-3 px-3 font-semibold">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {propostasFiltradas.map((proposta) => (
                                                <tr key={proposta.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                                                    <td className="py-3 px-3">
                                                        <div className="flex flex-col">
                                                            <span className="font-semibold text-foreground">{proposta.delegacia_nome}</span>
                                                            <span className="text-[10px] text-muted-foreground uppercase opacity-70">ID #{proposta.id.slice(0, 8)}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-3 font-mono text-foreground font-medium text-xs">
                                                        R$ {proposta.valor_mensal}
                                                    </td>
                                                    <td className="py-3 px-3 font-mono text-primary font-medium text-xs">
                                                        R$ {proposta.valor_anual}
                                                    </td>
                                                    <td className="py-3 px-3 text-muted-foreground text-xs whitespace-nowrap">
                                                        {new Date(proposta.created_at).toLocaleDateString('pt-BR')}
                                                    </td>
                                                    <td className="py-3 px-3">
                                                        <Select value={proposta.status} onValueChange={(val) => updateStatus(proposta.id, val)}>
                                                            <SelectTrigger className={cn(
                                                                "h-7 w-[110px] text-[10px] font-bold uppercase border rounded-full px-2.5 bg-background transition-all",
                                                                proposta.status === 'pendente' ? 'text-amber-500 border-amber-500/20 bg-amber-500/10' :
                                                                proposta.status === 'enviada' ? 'text-blue-500 border-blue-500/20 bg-blue-500/10' :
                                                                proposta.status === 'aprovada' ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/10' :
                                                                'text-red-500 border-red-500/20 bg-red-500/10'
                                                            )}>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent className="text-xs">
                                                                <SelectItem value="pendente">Pendente</SelectItem>
                                                                <SelectItem value="enviada">Enviada</SelectItem>
                                                                <SelectItem value="aprovada">Aprovada</SelectItem>
                                                                <SelectItem value="recusada">Recusada</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </td>
                                                    <td className="py-3 px-3 text-center">
                                                        <div className="flex items-center justify-center gap-1">
                                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-primary" asChild>
                                                                <a href={proposta.pdf_url} target="_blank" rel="noreferrer" title="Visualizar PDF">
                                                                    <ExternalLink size={16} />
                                                                </a>
                                                            </Button>
                                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10" onClick={() => setIsDeleting(proposta)} title="Excluir">
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
                title="Excluir Proposta"
                description={`Tem certeza que deseja excluir esta proposta da delegacia "${isDeleting?.delegacia_nome}"? O arquivo PDF também será removido permanentemente.`}
                loading={loading}
                variant="destructive"
            />
        </div>
    );
};

export default PropostasPage;
