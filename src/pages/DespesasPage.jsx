import React, { useState, useEffect } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    TrendingDown,
    Search,
    Plus,
    Filter,
    MoreHorizontal,
    Calendar,
    CheckCircle2,
    Clock,
    AlertCircle,
    Server,
    Cpu,
    Target
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

const DespesasPage = () => {
    const { toast } = useToast();
    const { isAdmin, loading: authLoading } = useAdminAuth();
    const [loading, setLoading] = useState(true);
    const [despesas, setDespesas] = useState([]);
    const [delegacias, setDelegacias] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('todos');
    const [statusFilter, setStatusFilter] = useState('todos');
    const [monthFilter, setMonthFilter] = useState('todos');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingDespesa, setEditingDespesa] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const MONTHS = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    const [newDespesa, setNewDespesa] = useState({
        tipo_despesa: 'FIXA',
        categoria: '',
        fornecedor: '',
        valor: '',
        data_vencimento: '',
        delegaciaIdReference: '',
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
            const { data: delData, error: delError } = await supabase
                .from('delegacias')
                .select('delegaciaId, nome')
                .order('nome');

            if (delError) throw delError;
            setDelegacias(delData || []);

            const { data: despData, error: despError } = await supabase
                .from('fat_despesas')
                .select('*, delegacias:delegaciaIdReference("delegaciaId", nome)')
                .order('data_vencimento', { ascending: false });

            if (despError) throw despError;
            setDespesas(despData || []);
        } catch (error) {
            console.error("Erro ao buscar dados iniciais (Despesas):", error);
            // Se for erro de permissão (PGRST301/401) e for a primeira tentativa, tenta uma vez após breve delay
            if (retryCount < 1 && (error.code === 'PGRST301' || error.status === 401)) {
                console.warn('[DespesasPage] Falha de autorização, tentando novamente...');
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

    const fetchDespesas = async () => {
        const { data, error } = await supabase
            .from('fat_despesas')
            .select('*, delegacias:delegaciaIdReference("delegaciaId", nome)')
            .order('data_vencimento', { ascending: false });

        if (error) {
            console.error("Erro ao buscar despesas silenciosamente:", error);
        } else {
            setDespesas(data || []);
        }
    };

    const handleCreateDespesa = async () => {
        if (!newDespesa.tipo_despesa || !newDespesa.valor || !newDespesa.data_vencimento) {
            toast({ title: "Atenção", description: "Campos obrigatórios faltando.", variant: "destructive" });
            return;
        }

        setIsSaving(true);
        try {
            const cleanValor = String(newDespesa.valor).replace('R$', '').replace(/\./g, '').replace(',', '.').trim();
            const valorFinal = parseFloat(cleanValor);

            if (isNaN(valorFinal)) {
                toast({ title: "Valor inválido", description: "Por favor, insira um número válido.", variant: "destructive" });
                return;
            }

            const { error } = await supabase
                .from('fat_despesas')
                .insert([{
                    tipo_despesa: newDespesa.tipo_despesa,
                    categoria: newDespesa.categoria,
                    fornecedor: newDespesa.fornecedor,
                    valor: valorFinal,
                    data_vencimento: newDespesa.data_vencimento,
                    delegaciaIdReference: newDespesa.delegaciaIdReference ? parseInt(newDespesa.delegaciaIdReference) : null,
                    observacoes: newDespesa.observacoes,
                    status_pagamento: 'PENDENTE'
                }]);

            if (error) throw error;
            toast({ title: "Sucesso!", description: "Despesa lançada." });
            setIsCreateModalOpen(false);
            setNewDespesa({ tipo_despesa: 'FIXA', categoria: '', fornecedor: '', valor: '', data_vencimento: '', delegaciaIdReference: '', observacoes: '' });
            fetchDespesas();
        } catch (err) {
            console.error("Erro ao criar despesa:", err);
            toast({ title: "Erro", description: "Erro ao criar despesa no servidor.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    const handleEditDespesa = (des) => {
        setEditingDespesa({
            id: des.id,
            tipo_despesa: des.tipo_despesa,
            categoria: des.categoria || '',
            fornecedor: des.fornecedor || '',
            valor: des.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
            data_vencimento: des.data_vencimento,
            delegaciaIdReference: des.delegaciaIdReference ? String(des.delegaciaIdReference) : '',
            observacoes: des.observacoes || '',
            status_pagamento: des.status_pagamento
        });
        setIsEditModalOpen(true);
    };

    const handleUpdateDespesa = async () => {
        if (!editingDespesa.tipo_despesa || !editingDespesa.valor || !editingDespesa.data_vencimento) {
            toast({ title: "Atenção", description: "Campos obrigatórios faltando.", variant: "destructive" });
            return;
        }

        setIsSaving(true);
        try {
            const cleanValor = String(editingDespesa.valor).replace('R$', '').replace(/\./g, '').replace(',', '.').trim();
            const valorFinal = parseFloat(cleanValor);

            if (isNaN(valorFinal)) {
                toast({ title: "Valor inválido", description: "Por favor, insira um número válido.", variant: "destructive" });
                return;
            }

            const { error } = await supabase
                .from('fat_despesas')
                .update({
                    tipo_despesa: editingDespesa.tipo_despesa,
                    categoria: editingDespesa.categoria,
                    fornecedor: editingDespesa.fornecedor,
                    valor: valorFinal,
                    data_vencimento: editingDespesa.data_vencimento,
                    delegaciaIdReference: editingDespesa.delegaciaIdReference ? parseInt(editingDespesa.delegaciaIdReference) : null,
                    observacoes: editingDespesa.observacoes,
                    status_pagamento: editingDespesa.status_pagamento
                })
                .eq('id', editingDespesa.id);

            if (error) throw error;
            toast({ title: "Sucesso!", description: "Despesa atualizada." });
            setIsEditModalOpen(false);
            setEditingDespesa(null);
            fetchDespesas();
        } catch (err) {
            console.error("Erro ao atualizar despesa:", err);
            toast({ title: "Erro", description: "Erro ao atualizar despesa.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    const getStatusInfo = (status) => {
        switch (status) {
            case 'PAGO': return { icon: CheckCircle2, class: 'text-emerald-500 bg-emerald-500/10', label: 'Pago' };
            case 'PENDENTE': return { icon: Clock, class: 'text-amber-500 bg-amber-500/10', label: 'Pendente' };
            case 'ATRASADO': return { icon: AlertCircle, class: 'text-destructive bg-destructive/10', label: 'Atrasado' };
            default: return { icon: Clock, class: 'text-slate-400 bg-slate-400/10', label: status };
        }
    };

    const filteredDespesas = despesas.filter(d => {
        const matchesSearch = d.fornecedor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.categoria?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'todos' || d.tipo_despesa === typeFilter;
        const matchesStatus = statusFilter === 'todos' || d.status_pagamento === statusFilter;

        let matchesMonth = true;
        if (monthFilter !== 'todos') {
            const date = new Date(d.data_vencimento);
            matchesMonth = date.getMonth() === parseInt(monthFilter);
        }

        return matchesSearch && matchesType && matchesStatus && matchesMonth;
    });

    const totalFixas = filteredDespesas.filter(d => d.tipo_despesa === 'FIXA').reduce((acc, d) => acc + d.valor, 0);
    const totalVariaveis = filteredDespesas.filter(d => d.tipo_despesa === 'VARIAVEL').reduce((acc, d) => acc + d.valor, 0);

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <PageHeader
                title="Despesas (Contas a Pagar)"
                description="Gestão de Custos Fixos (independem do número de clientes) e Variáveis (proporcionais ao número de clientes e intimações geradas)"
                icon={TrendingDown}
                action={
                    <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2 bg-destructive/80 hover:bg-destructive shadow-lg shadow-destructive/10">
                        <Plus size={18} />
                        Lançar Despesa
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
                                    placeholder="Buscar por fornecedor ou categoria..."
                                    className="pl-10 h-11 bg-background/50 border-border/40 focus:ring-primary/20"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                                <Select value={typeFilter} onValueChange={setTypeFilter}>
                                    <SelectTrigger className="w-[140px] h-10 bg-background/50 border-border/40 text-[11px] font-medium">
                                        <SelectValue placeholder="Todos os Tipos" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="todos">Todos os Tipos</SelectItem>
                                        <SelectItem value="FIXA">Fixa</SelectItem>
                                        <SelectItem value="VARIAVEL">Variável</SelectItem>
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
                                    <th className="px-4 py-3 font-semibold">Tipo</th>
                                    <th className="px-4 py-3 font-semibold">Fornecedor / Categoria</th>
                                    <th className="px-4 py-3 font-semibold">Vencimento</th>
                                    <th className="px-4 py-3 font-semibold text-right">Valor</th>
                                    <th className="px-4 py-3 font-semibold text-right">Status de Pagamento</th>
                                    <th className="px-4 py-3 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/20 text-sm">
                                {loading ? (
                                    <tr><td colSpan={6} className="px-6 py-12 text-center text-muted-foreground animate-pulse">Carregando despesas...</td></tr>
                                ) : filteredDespesas.length === 0 ? (
                                    <tr><td colSpan={6} className="px-6 py-12 text-center text-muted-foreground italic">Nenhuma despesa encontrada.</td></tr>
                                ) : (
                                    filteredDespesas.map((des) => {
                                        const status = getStatusInfo(des.status_pagamento);
                                        return (
                                            <tr key={des.id} className="hover:bg-muted/10 transition-colors group">
                                                <td className="px-4 py-4">
                                                    <Badge variant="outline" className={cn(
                                                        "font-bold text-[9px] px-2 py-0 h-5",
                                                        des.tipo_despesa === 'VARIAVEL' ? 'border-fuchsia-500/30 text-fuchsia-500 bg-fuchsia-500/5 shadow-sm shadow-fuchsia-500/10' : 'border-indigo-500/30 text-indigo-500 bg-indigo-500/5 shadow-sm shadow-indigo-500/10'
                                                    )}>
                                                        {des.tipo_despesa}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="font-medium text-foreground">{des.fornecedor}</div>
                                                    <div className="text-[10px] text-muted-foreground">{des.categoria}</div>
                                                </td>
                                                <td className="px-4 py-4 text-muted-foreground text-xs">
                                                    {new Date(des.data_vencimento).toLocaleDateString('pt-BR')}
                                                </td>
                                                <td className="px-4 py-4 text-right font-bold text-destructive font-mono text-xs">
                                                    R$ {des.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="px-4 py-4 flex justify-end">
                                                    <Select
                                                        value={des.status_pagamento}
                                                        onValueChange={(v) => {
                                                            // Atualizacao otimista para feedback imediato
                                                            setDespesas(prev => prev.map(item =>
                                                                item.id === des.id ? { ...item, status_pagamento: v } : item
                                                            ));

                                                            supabase.from('fat_despesas').update({ status_pagamento: v }).eq('id', des.id).then(({ error }) => {
                                                                if (error) {
                                                                    toast({ title: "Erro", description: "Não foi possível atualizar no banco.", variant: "destructive" });
                                                                    fetchDespesas(); // Reverte se der erro
                                                                } else {
                                                                    toast({ title: "Status atualizado", description: `Despesa marcada como ${v.toLowerCase()}.` });
                                                                }
                                                            });
                                                        }}
                                                    >
                                                        <SelectTrigger className={cn(
                                                            "h-7 w-[110px] text-[10px] font-bold uppercase rounded-full px-2.5 border-border/40",
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
                                                        </SelectContent>
                                                    </Select>
                                                </td>
                                                <td className="px-4 py-4 text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreHorizontal size={16} /></Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem className="gap-2" onClick={() => handleEditDespesa(des)}><Calendar size={14} /> Editar Lançamento</DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                className="gap-2 text-destructive"
                                                                onClick={() => {
                                                                    if (confirm('Deseja realmente excluir este lançamento?')) {
                                                                        supabase.from('fat_despesas').delete().eq('id', des.id).then(() => {
                                                                            toast({ title: "Sucesso", description: "Lançamento removido." });
                                                                            fetchDespesas();
                                                                        });
                                                                    }
                                                                }}
                                                            >
                                                                <AlertCircle size={14} /> Excluir Lançamento
                                                            </DropdownMenuItem>
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

            {/* Modais de Criacao e Edicao (Restaurados) */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Novo Lançamento de Saída</DialogTitle>
                        <DialogDescription>
                            Registre aqui um pagamento fixo ou variável para controle de fluxo de caixa.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Tipo de Despesa</Label>
                                <Select
                                    value={newDespesa.tipo_despesa}
                                    onValueChange={(v) => setNewDespesa({ ...newDespesa, tipo_despesa: v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="FIXA">Fixa</SelectItem>
                                        <SelectItem value="VARIAVEL">Variável (IA/Meta)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Valor (R$)</Label>
                                <Input
                                    placeholder="0,00"
                                    value={newDespesa.valor}
                                    onChange={(e) => setNewDespesa({ ...newDespesa, valor: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label>Fornecedor</Label>
                            <Input
                                placeholder="Ex: OpenAI, AWS, Vercel"
                                value={newDespesa.fornecedor}
                                onChange={(e) => setNewDespesa({ ...newDespesa, fornecedor: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Categoria</Label>
                            <Input
                                placeholder="Ex: Infraestrutura, Tokens ChatGPT"
                                value={newDespesa.categoria}
                                onChange={(e) => setNewDespesa({ ...newDespesa, categoria: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Data Vencimento</Label>
                            <Input
                                type="date"
                                value={newDespesa.data_vencimento}
                                onChange={(e) => setNewDespesa({ ...newDespesa, data_vencimento: e.target.value })}
                            />
                        </div>
                        {newDespesa.tipo_despesa === 'VARIAVEL' && (
                            <div className="grid gap-2">
                                <Label>Vincular a Delegacia (Opcional)</Label>
                                <Select value={newDespesa.delegaciaIdReference || 'none'} onValueChange={(v) => setNewDespesa({ ...newDespesa, delegaciaIdReference: v === 'none' ? '' : v })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione para calcular margem" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Nenhuma / Geral</SelectItem>
                                        {delegacias.map(del => (
                                            <SelectItem key={del.delegaciaId} value={String(del.delegaciaId)}>{del.nome}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateModalOpen(false)} disabled={isSaving}>Cancelar</Button>
                        <Button variant="destructive" onClick={handleCreateDespesa} disabled={isSaving}>
                            {isSaving ? "Lançando..." : "Lançar Pagamento"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Editar Lançamento</DialogTitle>
                        <DialogDescription>
                            Ajuste os detalhes da despesa ou altere o status de pagamento.
                        </DialogDescription>
                    </DialogHeader>
                    {editingDespesa && (
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Tipo de Despesa</Label>
                                    <Select
                                        value={editingDespesa.tipo_despesa}
                                        onValueChange={(v) => setEditingDespesa({ ...editingDespesa, tipo_despesa: v })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="FIXA">Fixa</SelectItem>
                                            <SelectItem value="VARIAVEL">Variável</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Valor (R$)</Label>
                                    <Input
                                        placeholder="0,00"
                                        value={editingDespesa.valor}
                                        onChange={(e) => setEditingDespesa({ ...editingDespesa, valor: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Fornecedor</Label>
                                    <Input
                                        value={editingDespesa.fornecedor}
                                        onChange={(e) => setEditingDespesa({ ...editingDespesa, fornecedor: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Status</Label>
                                    <Select value={editingDespesa.status_pagamento} onValueChange={(v) => setEditingDespesa({ ...editingDespesa, status_pagamento: v })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="PENDENTE">Pendente</SelectItem>
                                            <SelectItem value="PAGO">Pago</SelectItem>
                                            <SelectItem value="ATRASADO">Atrasado</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label>Categoria</Label>
                                <Input
                                    value={editingDespesa.categoria}
                                    onChange={(e) => setEditingDespesa({ ...editingDespesa, categoria: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Data Vencimento</Label>
                                <Input
                                    type="date"
                                    value={editingDespesa.data_vencimento}
                                    onChange={(e) => setEditingDespesa({ ...editingDespesa, data_vencimento: e.target.value })}
                                />
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditModalOpen(false)} disabled={isSaving}>Cancelar</Button>
                        <Button onClick={handleUpdateDespesa} disabled={isSaving}>
                            {isSaving ? "Salvando..." : "Salvar Alterações"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-card/40 border-border/40 shadow-lg border-l-4 border-l-blue-500">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500"><Server size={24} /></div>
                        <div>
                            <p className="text-sm text-muted-foreground uppercase font-semibold tracking-wider">Custos Fixos Totais</p>
                            <p className="text-2xl font-bold">R$ {totalFixas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-card/40 border-border/40 shadow-lg border-l-4 border-l-amber-500">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500"><Cpu size={24} /></div>
                        <div>
                            <p className="text-sm text-muted-foreground uppercase font-semibold tracking-wider">Custos Variáveis Totais</p>
                            <p className="text-2xl font-bold">R$ {totalVariaveis.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default DespesasPage;
