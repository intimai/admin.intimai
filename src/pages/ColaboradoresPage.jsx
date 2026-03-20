import React, { useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { useColaboradores } from '@/hooks/useColaboradores';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import { Loader2, Plus, Edit, Trash2, UserCheck, UserX, Mail, ShieldCheck, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

// Menus disponíveis para configurar as permissões de cada colaborador
const MENU_OPTIONS = [
    { slug: 'dashboard', label: 'Dashboard' },
    { slug: 'prospeccao', label: 'Comercial' },
    { slug: 'propostas', label: 'Propostas' },
    { slug: 'contratos', label: 'Contratos' },
    { slug: 'nfe', label: 'NF-e' },
    { slug: 'delegacias', label: 'Delegacias' },
    { slug: 'users', label: 'Usuários' },
    { slug: 'suporte', label: 'Suporte' },
    { slug: 'finance', label: 'Financeiro' },
    { slug: 'settings', label: 'Configurações' },
];

const INITIAL_FORM = {
    nome: '',
    email: '',
    role: 'colaborador',
    admin_menus: [],
    ativo: true,
};

// ───────────────────────────────────────────
// Formulário de Colaborador
// ───────────────────────────────────────────
const ColaboradorForm = ({ initialData, onSubmit, onCancel, isLoading }) => {
    const [form, setForm] = useState(initialData || INITIAL_FORM);

    const handleMenuToggle = (slug) => {
        setForm(prev => {
            const currentMenus = prev.admin_menus || [];
            const updated = currentMenus.includes(slug)
                ? currentMenus.filter(m => m !== slug)
                : [...currentMenus, slug];
            return { ...prev, admin_menus: updated };
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Se role é 'super_admin', admin_menus = null (acesso total)
        onSubmit({
            ...form,
            admin_menus: form.role === 'super_admin' ? null : (form.admin_menus?.length ? form.admin_menus : null),
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="nome">Nome *</Label>
                    <Input
                        id="nome"
                        value={form.nome}
                        onChange={(e) => setForm(p => ({ ...p, nome: e.target.value }))}
                        placeholder="Nome completo"
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">E-mail *</Label>
                    <Input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
                        placeholder="email@exemplo.com"
                        required
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label>Nível de Acesso *</Label>
                <div className="flex gap-3">
                    {[
                        { value: 'super_admin', label: 'Super Admin', icon: ShieldCheck, desc: 'Acesso total a todos os menus' },
                        { value: 'colaborador', label: 'Colaborador', icon: Shield, desc: 'Acesso restrito aos menus selecionados' },
                    ].map(({ value, label, icon: Icon, desc }) => (
                        <button
                            key={value}
                            type="button"
                            onClick={() => setForm(p => ({ ...p, role: value }))}
                            className={cn(
                                'flex-1 flex flex-col items-start gap-1 p-3 rounded-lg border-2 text-left transition-all',
                                form.role === value
                                    ? 'border-primary bg-primary/10 text-primary'
                                    : 'border-border hover:border-muted-foreground/50 text-muted-foreground'
                            )}
                        >
                            <div className="flex items-center gap-2 font-medium text-sm">
                                <Icon size={16} />
                                {label}
                            </div>
                            <span className="text-xs opacity-75">{desc}</span>
                        </button>
                    ))}
                </div>
            </div>

            {form.role === 'colaborador' && (
                <div className="space-y-2">
                    <Label>Menus com Acesso</Label>
                    <p className="text-xs text-muted-foreground">Deixe todos desmarcados para liberar acesso total.</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {MENU_OPTIONS.map(({ slug, label }) => {
                            const selected = form.admin_menus?.includes(slug);
                            return (
                                <button
                                    key={slug}
                                    type="button"
                                    onClick={() => handleMenuToggle(slug)}
                                    className={cn(
                                        'px-3 py-2 text-xs rounded-md border font-medium transition-all',
                                        selected
                                            ? 'bg-primary text-white border-primary'
                                            : 'border-border text-muted-foreground hover:border-primary/50'
                                    )}
                                >
                                    {label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                    Cancelar
                </Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Salvar
                </Button>
            </DialogFooter>
        </form>
    );
};

// ───────────────────────────────────────────
// Card de Colaborador
// ───────────────────────────────────────────
const ColaboradorCard = ({ colaborador, onEdit, onDelete, onToggleAtivo }) => {
    const menuLabels = colaborador.admin_menus
        ? MENU_OPTIONS.filter(m => colaborador.admin_menus.includes(m.slug)).map(m => m.label)
        : [];

    return (
        <Card className={cn('transition-all', !colaborador.ativo && 'opacity-60')}>
            <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5 min-w-0">
                        <p className="font-semibold text-sm truncate">{colaborador.nome}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                            <Mail size={11} />
                            {colaborador.email}
                        </p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => onEdit(colaborador)}>
                            <Edit size={14} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => onDelete(colaborador)}>
                            <Trash2 size={14} />
                        </Button>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Badge variant={colaborador.role === 'super_admin' ? 'default' : 'secondary'} className="text-[10px] uppercase">
                            {colaborador.role === 'super_admin' ? 'Super Admin' : 'Colaborador'}
                        </Badge>
                        <Badge
                            variant={colaborador.ativo ? 'outline' : 'destructive'}
                            className="text-[10px] uppercase cursor-pointer"
                            onClick={() => onToggleAtivo(colaborador.id, colaborador.ativo)}
                        >
                            {colaborador.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                    </div>
                    <button
                        onClick={() => onToggleAtivo(colaborador.id, colaborador.ativo)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        title={colaborador.ativo ? 'Desativar' : 'Ativar'}
                    >
                        {colaborador.ativo ? <UserCheck size={16} className="text-green-500" /> : <UserX size={16} />}
                    </button>
                </div>

                {colaborador.role === 'colaborador' && (
                    <div className="text-xs text-muted-foreground pt-1 border-t border-border/50">
                        {menuLabels.length > 0
                            ? <span><strong>Menus:</strong> {menuLabels.join(', ')}</span>
                            : <span className="italic">Acesso total</span>
                        }
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

// ───────────────────────────────────────────
// Página Principal
// ───────────────────────────────────────────
const ColaboradoresPage = () => {
    const { colaboradores, loading, createColaborador, updateColaborador, toggleAtivo, deleteColaborador } = useColaboradores();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingColaborador, setEditingColaborador] = useState(null);
    const [deletingColaborador, setDeletingColaborador] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    const handleCreate = async (data) => {
        setActionLoading(true);
        const result = await createColaborador(data);
        setActionLoading(false);
        if (result.success) setIsCreateOpen(false);
    };

    const handleUpdate = async (data) => {
        if (!editingColaborador) return;
        setActionLoading(true);
        const result = await updateColaborador(editingColaborador.id, data);
        setActionLoading(false);
        if (result.success) setEditingColaborador(null);
    };

    const handleDelete = async () => {
        if (!deletingColaborador) return;
        setActionLoading(true);
        const result = await deleteColaborador(deletingColaborador.id);
        setActionLoading(false);
        if (result.success) setDeletingColaborador(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <PageHeader
                    title="Colaboradores"
                    description="Gerencie os colaboradores com acesso ao painel administrativo"
                />
                <Button onClick={() => setIsCreateOpen(true)} className="w-full sm:w-auto">
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Colaborador
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : colaboradores.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground bg-muted/20 rounded-lg border border-dashed gap-3">
                    <ShieldCheck size={40} className="opacity-20" />
                    <p>Nenhum colaborador cadastrado ainda.</p>
                    <Button variant="outline" size="sm" onClick={() => setIsCreateOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Adicionar primeiro colaborador
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {colaboradores.map((c) => (
                        <ColaboradorCard
                            key={c.id}
                            colaborador={c}
                            onEdit={setEditingColaborador}
                            onDelete={setDeletingColaborador}
                            onToggleAtivo={toggleAtivo}
                        />
                    ))}
                </div>
            )}

            {/* Modal Criar */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Novo Colaborador</DialogTitle>
                        <DialogDescription>Preencha os dados e defina as permissões de acesso.</DialogDescription>
                    </DialogHeader>
                    <ColaboradorForm
                        onSubmit={handleCreate}
                        onCancel={() => setIsCreateOpen(false)}
                        isLoading={actionLoading}
                    />
                </DialogContent>
            </Dialog>

            {/* Modal Editar */}
            <Dialog open={!!editingColaborador} onOpenChange={(open) => !open && setEditingColaborador(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Editar Colaborador</DialogTitle>
                        <DialogDescription>Altere os dados ou permissões do colaborador.</DialogDescription>
                    </DialogHeader>
                    {editingColaborador && (
                        <ColaboradorForm
                            initialData={editingColaborador}
                            onSubmit={handleUpdate}
                            onCancel={() => setEditingColaborador(null)}
                            isLoading={actionLoading}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Modal Excluir */}
            <ConfirmationModal
                isOpen={!!deletingColaborador}
                onClose={() => setDeletingColaborador(null)}
                onConfirm={handleDelete}
                title="Excluir Colaborador"
                isLoading={actionLoading}
            >
                <p className="text-sm text-gray-300">
                    Tem certeza que deseja excluir o colaborador <strong>{deletingColaborador?.nome}</strong>?
                    Esta ação não pode ser desfeita.
                </p>
            </ConfirmationModal>
        </div>
    );
};

export default ColaboradoresPage;
