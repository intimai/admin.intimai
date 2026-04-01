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

const DespesasPage = () => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [despesas, setDespesas] = useState([]);
    const [delegacias, setDelegacias] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('todos');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
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
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const { data: delData } = await supabase
                .from('delegacias')
                .select('delegaciaId, nome')
                .order('nome');
            setDelegacias(delData || []);
            await fetchDespesas();
        } finally {
            setLoading(false);
        }
    };

    const fetchDespesas = async () => {
        const { data, error } = await supabase
            .from('fat_despesas')
            .select('*, delegacias:delegaciaIdReference(nome)')
            .order('data_vencimento', { ascending: false });

        if (error) console.error("Erro ao buscar despesas:", error);
        else setDespesas(data || []);
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
        return matchesSearch && matchesType;
    });

    const totalFixas = despesas.filter(d => d.tipo_despesa === 'FIXA').reduce((acc, d) => acc + d.valor, 0);
    const totalVariaveis = despesas.filter(d => d.tipo_despesa === 'VARIAVEL').reduce((acc, d) => acc + d.valor, 0);

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <PageHeader 
                title="Despesas (Contas a Pagar)" 
                description="Gestão de custos fixos, APIs de IA e despesas operacionais."
                icon={TrendingDown}
            />

            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex flex-1 items-center gap-3 w-full">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <Input 
                            placeholder="Buscar por fornecedor ou categoria..." 
                            className="pl-10 h-11 bg-card border-border/40 focus:ring-primary/20"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-[180px] h-11 bg-card border-border/40">
                            <Filter className="mr-2 h-4 w-4 opacity-50" />
                            <SelectValue placeholder="Tipo de Custo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="todos">Todos os Tipos</SelectItem>
                            <SelectItem value="FIXA">Fixas (Servidores/Salarios)</SelectItem>
                            <SelectItem value="VARIAVEL">Variáveis (Consumo IA)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                    <DialogTrigger asChild>
                        <Button className="h-11 gap-2 bg-destructive/80 hover:bg-destructive shadow-lg shadow-destructive/10">
                            <Plus size={18} />
                            Lançar Despesa
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Novo Lançamento de Saída</DialogTitle>
                            <DialogDescription>
                                Registre aqui um pagamento fixo ou variável para controle de fluxo de caixa e margens.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Tipo de Despesa</Label>
                                    <Select 
                                        value={newDespesa.tipo_despesa} 
                                        onValueChange={(v) => setNewDespesa({...newDespesa, tipo_despesa: v})}
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
                                        onChange={(e) => setNewDespesa({...newDespesa, valor: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label>Fornecedor</Label>
                                <Input 
                                    placeholder="Ex: OpenAI, AWS, Vercel" 
                                    value={newDespesa.fornecedor}
                                    onChange={(e) => setNewDespesa({...newDespesa, fornecedor: e.target.value})}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Categoria</Label>
                                <Input 
                                    placeholder="Ex: Infraestrutura, Tokens ChatGPT" 
                                    value={newDespesa.categoria}
                                    onChange={(e) => setNewDespesa({...newDespesa, categoria: e.target.value})}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Data Vencimento</Label>
                                <Input 
                                    type="date" 
                                    value={newDespesa.data_vencimento}
                                    onChange={(e) => setNewDespesa({...newDespesa, data_vencimento: e.target.value})}
                                />
                            </div>
                            {newDespesa.tipo_despesa === 'VARIAVEL' && (
                                <div className="grid gap-2">
                                    <Label>Vincular a Delegacia (Opcional)</Label>
                                    <Select onValueChange={(v) => setNewDespesa({...newDespesa, delegaciaIdReference: v})}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione para calcular margem" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">Nenhuma / Geral</SelectItem>
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
            </div>

            <Card className="bg-card/40 border-border/40 overflow-hidden shadow-xl backdrop-blur-md">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-muted/10 border-b border-border/40">
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tipo</th>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Fornecedor</th>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Categoria</th>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Vencimento</th>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">Valor</th>
                                    <th className="px-6 py-4 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/30 text-sm">
                                {loading ? (
                                    <tr><td colSpan={6} className="px-6 py-12 text-center text-muted-foreground animate-pulse">Carregando despesas...</td></tr>
                                ) : filteredDespesas.length === 0 ? (
                                    <tr><td colSpan={6} className="px-6 py-12 text-center text-muted-foreground italic">Nenhuma despesa encontrada.</td></tr>
                                ) : (
                                    filteredDespesas.map((des) => {
                                        const status = getStatusInfo(des.status_pagamento);
                                        return (
                                            <tr key={des.id} className="hover:bg-muted/10 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className={cn(
                                                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-[10px] uppercase",
                                                        des.tipo_despesa === 'VARIAVEL' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'
                                                    )}>
                                                        {des.tipo_despesa === 'VARIAVEL' ? <Cpu size={12} /> : <Server size={12} />}
                                                        {des.tipo_despesa}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-foreground">{des.fornecedor}</div>
                                                    {des.delegacias?.nome && (
                                                        <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                                            <Target size={10} /> {des.delegacias.nome}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-muted-foreground">{des.categoria}</td>
                                                <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                                                    {new Date(des.data_vencimento).toLocaleDateString('pt-BR')}
                                                </td>
                                                <td className="px-6 py-4 text-right font-bold text-destructive font-mono">
                                                    R$ {des.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreHorizontal size={16} /></Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem className="gap-2 text-emerald-500 font-medium"><CheckCircle2 size={14} /> Marcar como Pago</DropdownMenuItem>
                                                            <DropdownMenuItem className="gap-2 text-destructive"><AlertCircle size={14} /> Excluir Lançamento</DropdownMenuItem>
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
                            <p className="text-sm text-muted-foreground uppercase font-semibold tracking-wider">Custos IA (Variáveis)</p>
                            <p className="text-2xl font-bold">R$ {totalVariaveis.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default DespesasPage;
