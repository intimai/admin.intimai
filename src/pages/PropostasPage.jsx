import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Download, Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/customSupabaseClient';

const PropostasPage = () => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [searchParams] = useSearchParams();
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

    useEffect(() => {
        const fetchLeads = async () => {
            const { data } = await supabase.from('leads').select('*').order('delegacia');
            if (data) setLeads(data);
        };
        fetchLeads();
    }, []);

    useEffect(() => {
        const leadId = searchParams.get('lead_id');
        if (leadId && leads.length > 0) {
            if (leadId !== selectedLeadId) {
                handleLeadSelect(leadId);
            }
        }
    }, [searchParams, leads]);

    const handleLeadSelect = (id) => {
        const lead = leads.find(l => l.id === id);
        if (lead) {
            setSelectedLeadId(id);
            setFormData(prev => ({
                ...prev,
                delegacia: lead.delegacia || '',
            }));
        }
    };

    // Função auxiliar para formatar moeda (ex: "390" -> "390,00")
    const formatCurrency = (val) => {
        if (!val) return '';
        // Converte string para número se necessário
        const num = typeof val === 'string'
            ? parseFloat(val.replace(/\./g, '').replace(',', '.'))
            : val;
        if (isNaN(num)) return val;
        return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    // Cálculos automáticos
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

            console.log('[Frontend] Enviando dados para PDF:', formData);
            const response = await fetch('/api/generate-pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Falha ao gerar PDF');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Proposta_${formData.delegacia.replace(/\s+/g, '_')}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);

            // Upload PDF to Supabase Storage and Update Lead
            if (selectedLeadId && formData.delegacia) {
                const fileName = `proposta_${formData.delegacia.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
                const file = new File([blob], fileName, { type: 'application/pdf' });

                const { error: uploadError } = await supabase.storage
                    .from('propostas')
                    .upload(fileName, file);

                if (uploadError) {
                    console.error("Erro no upload do PDF:", uploadError);
                } else {
                    const { data: publicData } = supabase.storage.from('propostas').getPublicUrl(fileName);

                    await supabase.from('leads').update({
                        status: 'qualificado',
                        proposta_url: publicData.publicUrl
                    }).eq('id', selectedLeadId);
                }
            }

            toast({
                title: "Proposta gerada",
                description: "O PDF foi gerado e salvo no banco de dados com sucesso.",
            });
        } catch (error) {
            console.error('Erro:', error);
            toast({
                title: "Erro ao gerar",
                description: "Não foi possível gerar o PDF. Verifique os dados.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 max-w-5xl mx-auto">
            <PageHeader
                title="Gerador de Propostas"
                description="Configure os dados dinâmicos para gerar propostas comerciais personalizadas em PDF de alta qualidade (Puppeteer)."
            />

            <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
                {/* Formulario */}
                <Card className="bg-card/50 backdrop-blur-sm border-border/40 shadow-xl">
                    <CardContent className="space-y-6 pt-6">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1 space-y-2">
                                <Label htmlFor="delegacia">Selecione a Delegacia (Lead cadastrado)</Label>
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
                            <div className="w-full sm:w-20 space-y-2">
                                <Label htmlFor="estado">Estado</Label>
                                <Input id="estado" name="estado" value={formData.estado} onChange={handleChange} placeholder="MG" maxLength={2} className="text-center uppercase" />
                            </div>
                            <div className="flex-1 space-y-2">
                                <Label htmlFor="parceiro">Parceiro Institucional</Label>
                                <Input id="parceiro" name="parceiro" value={formData.parceiro} onChange={handleChange} placeholder="Ex: Câmara Municipal de Leopoldina" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-border/20 pt-4">
                            <div className="space-y-2">
                                <Label htmlFor="usuarios">Qtd de Usuários</Label>
                                <Input id="usuarios" name="usuarios" value={formData.usuarios} onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="valor_usuario">Valor por Usuário (R$)</Label>
                                <Input id="valor_usuario" name="valor_usuario" value={formData.valor_usuario} onChange={handleChange} onBlur={handleBlur} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="total_mensal">Total Mensal (R$)</Label>
                                <Input id="total_mensal" name="total_mensal" value={formData.total_mensal} readOnly className="bg-muted/50 font-mono font-bold" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="total_anual">Total Anual (R$)</Label>
                                <Input id="total_anual" name="total_anual" value={formData.total_anual} readOnly className="bg-muted/50 font-mono font-bold" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="total_anual_antecipado">Anual Antecipado (R$)</Label>
                                <Input id="total_anual_antecipado" name="total_anual_antecipado" value={formData.total_anual_antecipado} onChange={handleChange} onBlur={handleBlur} placeholder="Valor com desconto manual" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="contexto">Contexto / Justificativa</Label>
                            <Textarea
                                id="contexto"
                                name="contexto"
                                value={formData.contexto}
                                onChange={handleChange}
                                className="min-h-[120px] resize-none"
                                placeholder="Breve descrição da necessidade do cliente..."
                            />
                        </div>

                        {/* Resumo Financeiro Integrado */}
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
                                    <span className="text-[10px] text-green-600 dark:text-green-400 uppercase font-bold tracking-wider">Investimento à Vista</span>
                                    <span className="text-xl font-mono font-bold text-green-600 dark:text-green-400">R$ {formData.total_anual_antecipado}</span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-2">
                            <Button
                                onClick={generatePDF}
                                disabled={loading || !formData.delegacia || !formData.parceiro || !formData.usuarios || !formData.valor_usuario || !formData.estado}
                                size="lg"
                                className="w-full h-14 text-lg font-bold gap-3 shadow-xl shadow-primary/20 hover:scale-[1.01] transition-transform"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin" />
                                        Gerando Proposta...
                                    </>
                                ) : (
                                    <>
                                        <FileText size={22} />
                                        Gerar Proposta
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default PropostasPage;
