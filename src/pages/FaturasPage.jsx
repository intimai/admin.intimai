import React, { useState, useEffect } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Wallet,
    Search,
    Plus,
    Filter,
    MoreHorizontal,
    Download,
    ExternalLink,
    CheckCircle2,
    Clock,
    AlertCircle,
    XCircle,
    FileText,
    TrendingUp,
    Calendar
} from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { cn } from '@/lib/utils';
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

const FaturasPage = () => {
    const { toast } = useToast();
    const { isAdmin, loading: authLoading } = useAdminAuth();
    const [loading, setLoading] = useState(true);
    const [faturas, setFaturas] = useState([]);
    const [delegacias, setDelegacias] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('todos');
    const [monthFilter, setMonthFilter] = useState('todos');
    const [refMonthFilter, setRefMonthFilter] = useState('todos');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingFatura, setEditingFatura] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const MONTHS = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    // Form state for new Invoice
    const [newFatura, setNewFatura] = useState({
        delegaciaId: '',
        valor: '',
        data_vencimento: '',
        referencia_mes_ano: '',
        observacoes: ''
    });

    useEffect(() => {
        if (isAdmin && !authLoading) {
            fetchInitialData();
        }
    }, [isAdmin, authLoading]);

    const fetchInitialData = async (retryCount = 0) => {
        setLoading(true);
        try {
            // 1. Delegacias for filters/creation
            const { data: delData, error: delError } = await supabase
                .from('delegacias')
                .select('delegaciaId, nome')
                .order('nome');

            if (delError) throw delError;
            setDelegacias(delData || []);

            // 2. Faturas
            const { data: fatData, error: fatError } = await supabase
                .from('fat_faturas')
                .select('*, delegacias("delegaciaId", nome)')
                .order('data_vencimento', { ascending: false });

            if (fatError) throw fatError;
            setFaturas(fatData || []);
        } catch (error) {
            console.error("Erro ao buscar dados iniciais (Faturas):", error);
            // Se for erro de permissão (PGRST301/401) e for a primeira tentativa, tenta uma vez após breve delay
            if (retryCount < 1 && (error.code === 'PGRST301' || error.status === 401)) {
                console.warn('[FaturasPage] Falha de autorização, tentando novamente...');
                await new Promise(resolve => setTimeout(resolve, 800));
                return fetchInitialData(retryCount + 1);
            }
            if (retryCount > 0 || error.status !== 401) {
                toast({ title: "Erro de Conexão", description: "Falha ao carregar os dados. Tente recarregar a página.", variant: "destructive" });
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchFaturas = async () => {
        const { data, error } = await supabase
            .from('fat_faturas')
            .select('*, delegacias("delegaciaId", nome)')
            .order('data_vencimento', { ascending: false });

        if (error) {
            console.error("Erro ao buscar faturas silenciosamente:", error);
        } else {
            setFaturas(data || []);
        }
    };

    const handleCreateFatura = async () => {
        if (!newFatura.delegaciaId || !newFatura.valor || !newFatura.data_vencimento) {
            toast({ title: "Atenção", description: "Preencha os campos obrigatórios.", variant: "destructive" });
            return;
        }

        setIsSaving(true);
        try {
            const cleanValor = String(newFatura.valor).replace('R$', '').replace(/\./g, '').replace(',', '.').trim();
            const valorFinal = parseFloat(cleanValor);

            if (isNaN(valorFinal)) {
                toast({ title: "Valor inválido", description: "Por favor, insira um número válido.", variant: "destructive" });
                return;
            }

            const { error } = await supabase
                .from('fat_faturas')
                .insert([{
                    delegaciaId: parseInt(newFatura.delegaciaId),
                    valor: valorFinal,
                    data_vencimento: newFatura.data_vencimento,
                    referencia_mes_ano: newFatura.referencia_mes_ano,
                    observacoes: newFatura.observacoes,
                    status_pagamento: 'PENDENTE'
                }]);

            if (error) throw error;

            toast({ title: "Sucesso!", description: "Fatura gerada com sucesso." });
            setIsCreateModalOpen(false);
            setNewFatura({ delegaciaId: '', valor: '', data_vencimento: '', referencia_mes_ano: '', observacoes: '' });
            fetchFaturas();
        } catch (err) {
            console.error("Erro ao criar fatura:", err);
            toast({ title: "Erro", description: "Erro ao criar fatura no servidor.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };
    const handleEditFatura = (fat) => {
        setEditingFatura({
            id: fat.id,
            delegaciaId: String(fat.delegaciaId),
            valor: fat.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
            data_vencimento: fat.data_vencimento,
            referencia_mes_ano: fat.referencia_mes_ano || '',
            observacoes: fat.observacoes || '',
            status_pagamento: fat.status_pagamento
        });
        setIsEditModalOpen(true);
    };

    const handleUpdateFatura = async () => {
        if (!editingFatura.delegaciaId || !editingFatura.valor || !editingFatura.data_vencimento) {
            toast({ title: "Atenção", description: "Preencha os campos obrigatórios.", variant: "destructive" });
            return;
        }

        setIsSaving(true);
        try {
            const cleanValor = String(editingFatura.valor).replace('R$', '').replace(/\./g, '').replace(',', '.').trim();
            const valorFinal = parseFloat(cleanValor);

            if (isNaN(valorFinal)) {
                toast({ title: "Valor inválido", description: "Por favor, insira um número válido.", variant: "destructive" });
                return;
            }

            const { error } = await supabase
                .from('fat_faturas')
                .update({
                    delegaciaId: parseInt(editingFatura.delegaciaId),
                    valor: valorFinal,
                    data_vencimento: editingFatura.data_vencimento,
                    referencia_mes_ano: editingFatura.referencia_mes_ano,
                    observacoes: editingFatura.observacoes,
                    status_pagamento: editingFatura.status_pagamento
                })
                .eq('id', editingFatura.id);

            if (error) throw error;

            toast({ title: "Sucesso!", description: "Fatura atualizada com sucesso." });
            setIsEditModalOpen(false);
            setEditingFatura(null);
            fetchFaturas();
        } catch (err) {
            console.error("Erro ao atualizar fatura:", err);
            toast({ title: "Erro", description: "Erro ao atualizar fatura no servidor.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    const getStatusInfo = (status) => {
        switch (status) {
            case 'PAGO': return { icon: CheckCircle2, class: 'text-emerald-500 bg-emerald-500/10', label: 'Pago' };
            case 'PENDENTE': return { icon: Clock, class: 'text-amber-500 bg-amber-500/10', label: 'Pendente' };
            case 'ATRASADO': return { icon: AlertCircle, class: 'text-destructive bg-destructive/10', label: 'Atrasado' };
            case 'CANCELADO': return { icon: XCircle, class: 'text-slate-400 bg-slate-400/10', label: 'Cancelado' };
            default: return { icon: Clock, class: 'text-slate-400 bg-slate-400/10', label: status };
        }
    };

    const filteredFaturas = faturas.filter(f => {
        const matchesSearch = f.delegacias?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            f.referencia_mes_ano?.includes(searchTerm);
        const matchesStatus = statusFilter === 'todos' || f.status_pagamento === statusFilter;

        let matchesMonth = true;
        if (monthFilter !== 'todos') {
            const date = new Date(f.data_vencimento);
            matchesMonth = date.getMonth() === parseInt(monthFilter);
        }

        let matchesRefMonth = true;
        if (refMonthFilter !== 'todos') {
            const monthPrefix = String(parseInt(refMonthFilter) + 1).padStart(2, '0') + '/';
            matchesRefMonth = f.referencia_mes_ano?.startsWith(monthPrefix);
        }

        return matchesSearch && matchesStatus && matchesMonth && matchesRefMonth;
    });

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <PageHeader
                title="Faturas (Contas a Receber)"
                description="Gestão de faturamento, cobranças B2B e outros recebíveis."
                icon={Wallet}
                action={
                    <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
                        <Plus size={18} />
                        Gerar Fatura
                    </Button>
                }
            />

            <Card className="bg-card/40 border-border/40 overflow-hidden shadow-xl backdrop-blur-md">
                <CardContent className="p-6 space-y-6">
                    {/* Filtros Padronizados */}
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col md:flex-row gap-2 items-center">
                            <div className="relative flex-1 w-full max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                <Input
                                    placeholder="Buscar por delegacia ou mês..."
                                    className="pl-10 h-11 bg-background/50 border-border/40 focus:ring-primary/20"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                                <Select value={refMonthFilter} onValueChange={setRefMonthFilter}>
                                    <SelectTrigger className="w-[140px] h-10 bg-background/50 border-border/40 text-[11px] font-medium">
                                        <SelectValue placeholder="Todos os Meses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="todos">Todos os Meses</SelectItem>
                                        {MONTHS.map((m, i) => (
                                            <SelectItem key={i} value={String(i)}>{m}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-[140px] h-10 bg-background/50 border-border/40 text-[11px] font-medium">
                                        <SelectValue placeholder="Todos os Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="todos">Todos os Status</SelectItem>
                                        <SelectItem value="PAGO">Pagos</SelectItem>
                                        <SelectItem value="PENDENTE">Pendentes</SelectItem>
                                        <SelectItem value="ATRASADO">Atrasados</SelectItem>
                                        <SelectItem value="CANCELADO">Cancelados</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={monthFilter} onValueChange={setMonthFilter}>
                                    <SelectTrigger className="w-[140px] h-10 bg-background/50 border-border/40 text-[11px] font-medium">
                                        <SelectValue placeholder="Todos os Venc." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="todos">Todos os Venc.</SelectItem>
                                        {MONTHS.map((m, i) => (
                                            <SelectItem key={i} value={String(i)}>{m}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-border/40 text-muted-foreground text-[11px] uppercase tracking-wider">
                                    <th className="px-4 py-3 font-semibold">Mês Ref</th>
                                    <th className="px-4 py-3 font-semibold">Delegacia / Contrato</th>
                                    <th className="px-4 py-3 font-semibold">Vencimento</th>
                                    <th className="px-4 py-3 font-semibold text-right">Valor</th>
                                    <th className="px-4 py-3 font-semibold text-right">Status de Pagamento</th>
                                    <th className="px-4 py-3 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/20 text-sm">
                                {loading ? (
                                    <tr><td colSpan={5} className="px-6 py-12 text-center text-muted-foreground animate-pulse">Carregando faturas...</td></tr>
                                ) : filteredFaturas.length === 0 ? (
                                    <tr><td colSpan={5} className="px-6 py-12 text-center text-muted-foreground italic">Nenhuma fatura encontrada.</td></tr>
                                ) : (
                                    filteredFaturas.map((fat) => {
                                        const status = getStatusInfo(fat.status_pagamento);
                                        return (
                                            <tr key={fat.id} className="hover:bg-muted/10 transition-colors group">
                                                <td className="px-4 py-4">
                                                    <Badge variant="outline" className="border-fuchsia-500/30 text-fuchsia-500 bg-fuchsia-500/5 shadow-sm shadow-fuchsia-500/10 font-mono text-[10px] px-2 py-0 h-5">
                                                        {fat.referencia_mes_ano || '--'}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="font-medium text-foreground">{fat.delegacias?.nome}</div>
                                                </td>
                                                <td className="px-4 py-4 text-muted-foreground text-xs">
                                                    {new Date(fat.data_vencimento).toLocaleDateString('pt-BR')}
                                                </td>
                                                <td className="px-4 py-4 text-right font-bold text-emerald-500 font-mono text-xs">
                                                    R$ {fat.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="px-4 py-4 flex justify-end">
                                                    <Select
                                                        value={fat.status_pagamento}
                                                        onValueChange={(v) => {
                                                            // Atualizacao otimista para feedback imediato
                                                            setFaturas(prev => prev.map(item =>
                                                                item.id === fat.id ? { ...item, status_pagamento: v } : item
                                                            ));

                                                            supabase.from('fat_faturas').update({ status_pagamento: v }).eq('id', fat.id).then(({ error }) => {
                                                                if (error) {
                                                                    toast({ title: "Erro", description: "Erro ao salvar no banco.", variant: "destructive" });
                                                                    fetchFaturas(); // Reverte se der erro
                                                                } else {
                                                                    toast({ title: "Status atualizado", description: `Fatura marcada como ${v.toLowerCase()}.` });
                                                                }
                                                            });
                                                        }}
                                                    >
                                                        <SelectTrigger className={cn(
                                                            "h-7 w-[120px] text-[10px] font-bold uppercase rounded-full px-2.5 border-border/40",
                                                            status.class
                                                        )}>
                                                            <div className="flex items-center gap-1.5">
                                                                <status.icon size={10} />
                                                                <SelectValue />
                                                            </div>
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="PENDENTE">Pendente</SelectItem>
                                                            <SelectItem value="PAGO">Pago</SelectItem>
                                                            <SelectItem value="ATRASADO">Atrasado</SelectItem>
                                                            <SelectItem value="CANCELADO">Cancelado</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </td>
                                                <td className="px-4 py-4 text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreHorizontal size={16} /></Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem className="gap-2" onClick={() => handleEditFatura(fat)}><FileText size={14} /> Editar Dados</DropdownMenuItem>
                                                            <DropdownMenuItem className="gap-2"><ExternalLink size={14} /> Abrir no Efí</DropdownMenuItem>
                                                            <DropdownMenuItem className="gap-2"><Download size={14} /> Baixar PDF</DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-card/40 border-border/40 shadow-lg border-l-4 border-l-primary">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-xl text-primary">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground uppercase font-semibold tracking-wider">A Receber (30 dias)</p>
                            <p className="text-2xl font-bold">
                                R$ {faturas
                                    .filter(f => f.status_pagamento === 'PENDENTE')
                                    .reduce((acc, f) => acc + f.valor, 0)
                                    .toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-card/40 border-border/40 shadow-lg border-l-4 border-l-emerald-500">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
                            <CheckCircle2 size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground uppercase font-semibold tracking-wider">Recebido (Este Mês)</p>
                            <p className="text-2xl font-bold">
                                R$ {faturas
                                    .filter(f => f.status_pagamento === 'PAGO')
                                    .reduce((acc, f) => acc + f.valor, 0)
                                    .toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Modais de Criacao e Edicao (Restaurados) */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Gerar Nova Cobrança</DialogTitle>
                        <DialogDescription>
                            Preencha os detalhes abaixo para criar uma nova fatura manual para este contrato.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>Delegacia / Contrato</Label>
                            <Select onValueChange={(v) => setNewFatura({ ...newFatura, delegaciaId: v })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione a Delegacia" />
                                </SelectTrigger>
                                <SelectContent>
                                    {delegacias.map(del => (
                                        <SelectItem key={del.delegaciaId} value={String(del.delegaciaId)}>{del.nome}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Valor (R$)</Label>
                                <Input
                                    type="text"
                                    placeholder="0,00"
                                    value={newFatura.valor}
                                    onChange={(e) => setNewFatura({ ...newFatura, valor: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Data de Vencimento</Label>
                                <Input
                                    type="date"
                                    value={newFatura.data_vencimento}
                                    onChange={(e) => setNewFatura({ ...newFatura, data_vencimento: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label>Mês/Ano Referência (Opcional)</Label>
                            <Input
                                placeholder="Ex: 10/2026"
                                value={newFatura.referencia_mes_ano}
                                onChange={(e) => setNewFatura({ ...newFatura, referencia_mes_ano: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Observações</Label>
                            <Input
                                placeholder="Ex: Contrato Anual - Lote 50 usuários"
                                value={newFatura.observacoes}
                                onChange={(e) => setNewFatura({ ...newFatura, observacoes: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateModalOpen(false)} disabled={isSaving}>Cancelar</Button>
                        <Button onClick={handleCreateFatura} disabled={isSaving}>
                            {isSaving ? "Gerando..." : "Criar Fatura"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Editar/Ver Fatura</DialogTitle>
                        <DialogDescription>
                            Ajuste os dados desta fatura ou altere seu status de pagamento.
                        </DialogDescription>
                    </DialogHeader>
                    {editingFatura && (
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label>Delegacia / Contrato</Label>
                                <Select value={editingFatura.delegaciaId} onValueChange={(v) => setEditingFatura({ ...editingFatura, delegaciaId: v })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione a Delegacia" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {delegacias.map(del => (
                                            <SelectItem key={del.delegaciaId} value={String(del.delegaciaId)}>{del.nome}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Valor (R$)</Label>
                                    <Input
                                        type="text"
                                        placeholder="0,00"
                                        value={editingFatura.valor}
                                        onChange={(e) => setEditingFatura({ ...editingFatura, valor: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Data de Vencimento</Label>
                                    <Input
                                        type="date"
                                        value={editingFatura.data_vencimento}
                                        onChange={(e) => setEditingFatura({ ...editingFatura, data_vencimento: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Mês/Ano Referência</Label>
                                    <Input
                                        placeholder="Ex: 10/2026"
                                        value={editingFatura.referencia_mes_ano}
                                        onChange={(e) => setEditingFatura({ ...editingFatura, referencia_mes_ano: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Status de Pagamento</Label>
                                    <Select value={editingFatura.status_pagamento} onValueChange={(v) => setEditingFatura({ ...editingFatura, status_pagamento: v })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="PENDENTE">Pendente</SelectItem>
                                            <SelectItem value="PAGO">Pago</SelectItem>
                                            <SelectItem value="ATRASADO">Atrasado</SelectItem>
                                            <SelectItem value="CANCELADO">Cancelado</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label>Observações</Label>
                                <Input
                                    placeholder="Ex: Pagamento via Pix"
                                    value={editingFatura.observacoes}
                                    onChange={(e) => setEditingFatura({ ...editingFatura, observacoes: e.target.value })}
                                />
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditModalOpen(false)} disabled={isSaving}>Cancelar</Button>
                        <Button onClick={handleUpdateFatura} disabled={isSaving}>
                            {isSaving ? "Salvando..." : "Salvar Alterações"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default FaturasPage;
