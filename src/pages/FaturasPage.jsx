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
    TrendingUp
} from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { cn } from '@/lib/utils';
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
    const [loading, setLoading] = useState(true);
    const [faturas, setFaturas] = useState([]);
    const [delegacias, setDelegacias] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('todos');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    // Form state for new Invoice
    const [newFatura, setNewFatura] = useState({
        delegaciaId: '',
        valor: '',
        data_vencimento: '',
        referencia_mes_ano: '',
        observacoes: ''
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            // 1. Delegacias for filters/creation
            const { data: delData } = await supabase
                .from('delegacias')
                .select('delegaciaId, nome')
                .order('nome');
            setDelegacias(delData || []);

            // 2. Faturas
            await fetchFaturas();
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
            console.error("Erro ao buscar faturas:", error);
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
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <PageHeader 
                title="Faturas (Contas a Receber)" 
                description="Gestão de faturamento, cobranças B2B e recebíveis da agência."
                icon={Wallet}
            />

            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex flex-1 items-center gap-3 w-full">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <Input 
                            placeholder="Buscar por delegacia ou mês..." 
                            className="pl-10 h-11 bg-card border-border/40 focus:ring-primary/20"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px] h-11 bg-card border-border/40">
                            <Filter className="mr-2 h-4 w-4 opacity-50" />
                            <SelectValue placeholder="Filtrar Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="todos">Todos Status</SelectItem>
                            <SelectItem value="PAGO">Pagos</SelectItem>
                            <SelectItem value="PENDENTE">Pendentes</SelectItem>
                            <SelectItem value="ATRASADO">Atrasados</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                    <DialogTrigger asChild>
                        <Button className="h-11 gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
                            <Plus size={18} />
                            Gerar Fatura
                        </Button>
                    </DialogTrigger>
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
                                <Select onValueChange={(v) => setNewFatura({...newFatura, delegaciaId: v})}>
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
                                        onChange={(e) => setNewFatura({...newFatura, valor: e.target.value})}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Data de Vencimento</Label>
                                    <Input 
                                        type="date" 
                                        value={newFatura.data_vencimento}
                                        onChange={(e) => setNewFatura({...newFatura, data_vencimento: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label>Mês/Ano Referência (Opcional)</Label>
                                <Input 
                                    placeholder="Ex: 10/2026" 
                                    value={newFatura.referencia_mes_ano}
                                    onChange={(e) => setNewFatura({...newFatura, referencia_mes_ano: e.target.value})}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Observações</Label>
                                <Input 
                                    placeholder="Ex: Contrato Anual - Lote 50 usuários" 
                                    value={newFatura.observacoes}
                                    onChange={(e) => setNewFatura({...newFatura, observacoes: e.target.value})}
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
            </div>

            <Card className="bg-card/40 border-border/40 overflow-hidden shadow-xl backdrop-blur-md">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-muted/10 border-b border-border/40">
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">Status</th>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">Delegacia</th>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">Mês Ref</th>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">Vencimento</th>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap text-right">Valor</th>
                                    <th className="px-6 py-4 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/30 text-sm">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground animate-pulse">Carregando faturas...</td>
                                    </tr>
                                ) : filteredFaturas.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground italic">Nenhuma fatura encontrada.</td>
                                    </tr>
                                ) : (
                                    filteredFaturas.map((fat) => {
                                        const status = getStatusInfo(fat.status_pagamento);
                                        return (
                                            <tr key={fat.id} className="hover:bg-muted/10 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-semibold text-[11px] uppercase tracking-wide", status.class)}>
                                                        <status.icon size={12} />
                                                        {status.label}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 font-medium text-foreground">{fat.delegacias?.nome}</td>
                                                <td className="px-6 py-4 text-muted-foreground font-mono">{fat.referencia_mes_ano || '--'}</td>
                                                <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                                                    {new Date(fat.data_vencimento).toLocaleDateString('pt-BR')}
                                                </td>
                                                <td className="px-6 py-4 text-right font-bold text-foreground font-mono">
                                                    R$ {fat.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                <MoreHorizontal size={16} />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-48">
                                                            <DropdownMenuItem className="gap-2">
                                                                <ExternalLink size={14} /> Abrir no Efí
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem className="gap-2">
                                                                <Download size={14} /> Baixar PDF
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem className="gap-2 text-primary font-medium">
                                                                <CheckCircle2 size={14} /> Dar Baixa Manual
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem className="gap-2 text-destructive">
                                                                <AlertCircle size={14} /> Cancelar Fatura
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
        </div>
    );
};

export default FaturasPage;
