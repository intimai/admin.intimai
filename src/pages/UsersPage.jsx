import React, { useState, useEffect } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { useUsers } from '@/hooks/useUsers';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import { Search, Loader2, AlertCircle, User, Mail, Building2, UserCheck, Plus, Edit, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const UserForm = ({ initialData, delegaciasDisponiveis, onSubmit, onCancel, isLoading }) => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    delegadoResponsavel: '',
    delegaciaId: '',
    delegacia: '',
    ativo: true,
    ...initialData
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDelegaciaChange = (value) => {
    // When Delegacia is selected via Select component, we need to save both the ID and the Name string
    const targetDel = delegaciasDisponiveis.find(d => d.delegaciaId === value);
    setFormData(prev => ({
      ...prev,
      delegaciaId: value,
      delegacia: targetDel ? targetDel.nome : ''
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Identificação Principal */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="nome">Nome Completo *</Label>
          <Input
            id="nome"
            name="nome"
            value={formData.nome || ''}
            onChange={handleChange}
            required
            placeholder="Ex: João da Silva"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="email">E-mail de Cadastro *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email || ''}
            onChange={handleChange}
            required
            placeholder="usuario@dominio.com.br"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="delegadoResponsavel">Delegado Responsável</Label>
          <Input
            id="delegadoResponsavel"
            name="delegadoResponsavel"
            value={formData.delegadoResponsavel || ''}
            onChange={handleChange}
            placeholder="Nome do Delegado (ou 'O próprio')"
          />
        </div>

        {/* Vínculo de Delegacia */}
        <div className="space-y-2 md:col-span-2">
          <Label>Delegacia Vinculada</Label>
          <Select value={formData.delegaciaId || ''} onValueChange={handleDelegaciaChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione uma delegacia" />
            </SelectTrigger>
            <SelectContent>
              {delegaciasDisponiveis.map(del => (
                <SelectItem key={del.delegaciaId} value={del.delegaciaId}>{del.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center space-x-2 pt-4">
        <input
          type="checkbox"
          id="ativo"
          name="ativo"
          checked={formData.ativo}
          onChange={handleChange}
          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
        />
        <Label htmlFor="ativo" className="font-normal cursor-pointer text-foreground font-semibold">
          Usuário Ativo
        </Label>
      </div>

      <DialogFooter className="pt-4">
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

const UserCard = ({ user, onEdit, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card
      className={cn(
        "hover:shadow-md transition-all duration-300 border",
        isExpanded ? "border-primary/30 shadow-sm bg-card/95" : "border-border/50 bg-card/40"
      )}
    >
      <div
        className="p-4 flex items-center justify-between cursor-pointer select-none group"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4 flex-1 overflow-hidden">
          <div className={cn(
            "h-10 w-10 flex items-center justify-center shrink-0 transition-transform",
            isExpanded ? "text-primary scale-110" : "text-primary/80 group-hover:text-primary scale-100"
          )}>
            <User size={24} />
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-bold text-foreground truncate">{user.nome}</h3>
              <Badge
                className={cn(
                  "text-[10px] uppercase border-none shrink-0 py-0 h-5 shadow-sm font-semibold",
                  user.ativo
                    ? "bg-green-500 text-zinc-900"
                    : "bg-secondary text-secondary-foreground"
                )}
              >
                {user.ativo ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1">
              <div className="flex items-center gap-1 shrink-0">
                <Building2 size={12} className="text-primary/60" />
                <span className="truncate max-w-[200px]">{user.delegacia || 'Sem delegacia vinculada'}</span>
              </div>
            </div>
          </div>
        </div>

        <div
          className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-muted/50 shrink-0 transition-all duration-300 ml-4"
          style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-muted-foreground"><path d="M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
        </div>
      </div>

      <div className={cn("grid transition-all duration-300", isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
        <div className="overflow-hidden">
          <CardContent className="p-4 pt-0 border-t border-border/50 mt-1 flex flex-col md:flex-row gap-4 justify-between bg-muted/5">
            {/* Informações Secundárias */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4 text-xs flex-1 pt-4">
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">E-mail de Cadastro</span>
                <span className="font-medium text-foreground flex items-center gap-1.5 break-all pr-2">
                  <Mail size={12} className="text-primary/60 shrink-0" />
                  {user.email || 'Não informado'}
                </span>
              </div>
              <div className="flex flex-col gap-1 sm:col-span-2">
                <span className="text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">Delegado Responsável</span>
                <span className="font-medium text-foreground flex items-center gap-1.5">
                  <UserCheck size={12} className="text-primary/60" />
                  {user.delegadoResponsavel === user.nome ? 'O próprio' : (user.delegadoResponsavel || 'Não informado')}
                </span>
              </div>
            </div>

            {/* Ações */}
            <div className="flex items-center gap-1.5 border-t md:border-t-0 md:border-l border-border/50 pt-4 md:pt-4 md:pl-4 mt-2 md:mt-0 shrink-0">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 bg-background/50 hover:bg-background"
                onClick={(e) => { e.stopPropagation(); onEdit(user); }}
                title="Editar Perfil"
              >
                <Edit size={14} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                onClick={(e) => { e.stopPropagation(); onDelete(user); }}
                title="Excluir Conta"
              >
                <Trash2 size={14} />
              </Button>
            </div>
          </CardContent>
        </div>
      </div>
    </Card>
  );
};

const UsersPage = () => {
  const { users, delegaciasDisponiveis, loading, searchUsers, createUser, updateUser, deleteUser } = useUsers();
  const [delegaciaFilter, setDelegaciaFilter] = useState('todas');
  const [searchTerm, setSearchTerm] = useState('');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch from DB when delegacia filter changes
  useEffect(() => {
    searchUsers(delegaciaFilter);
  }, [delegaciaFilter, searchUsers]);

  // Client-side filter for names
  const filteredUsers = users.filter(u =>
    u.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = async (data) => {
    setActionLoading(true);
    const result = await createUser(data);
    setActionLoading(false);
    if (result.success) {
      setIsCreateModalOpen(false);
    }
  };

  const handleUpdate = async (data) => {
    if (!editingUser) return;
    setActionLoading(true);
    const result = await updateUser(editingUser.id, data);
    setActionLoading(false);
    if (result.success) {
      setEditingUser(null);
    }
  };

  const handleDelete = async () => {
    if (!deletingUser) return;
    setActionLoading(true);
    const result = await deleteUser(deletingUser.id);
    setActionLoading(false);
    if (result.success) {
      setDeletingUser(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Usuários"
        description="Gestão de usuários vinculados às delegacias do sistema."
        action={
          <Button onClick={() => setIsCreateModalOpen(true)} className="h-10 px-6 shrink-0 shadow-md hover:shadow-primary/20">
            <Plus className="mr-2 h-4 w-4" />
            Novo Usuário
          </Button>
        }
      />

      <Card className="bg-card/90 border-border/40 overflow-hidden shadow-xl backdrop-blur-md">
        <CardContent className="p-6 space-y-8">
          {/* Controles Operacionais */}
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar usuário por nome ou email..."
                className="pl-10 h-10 bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-4 w-full sm:w-auto z-50">
              <div className="w-full sm:w-64">
                <Select value={delegaciaFilter} onValueChange={setDelegaciaFilter}>
                  <SelectTrigger className="h-10 bg-background/50 border-border/50 focus:border-primary/50">
                    <SelectValue placeholder="Filtrar por Delegacia" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas as Delegacias</SelectItem>
                    {delegaciasDisponiveis.map(del => (
                      <SelectItem key={del.delegaciaId} value={del.delegaciaId}>{del.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Lista de Usuários */}
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-primary opacity-50" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground bg-muted/10 rounded-xl border border-dashed border-border/50">
              <AlertCircle className="h-16 w-16 mb-4 opacity-10" />
              <p className="text-lg font-medium">Nenhum usuário encontrado.</p>
              <p className="text-sm opacity-60 text-center max-w-xs mt-2">
                Tente ajustar sua busca ou filtros para encontrar o que procura.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {filteredUsers.map((user, index) => (
                <UserCard
                  key={user.id || `user-fallback-${index}`}
                  user={user}
                  onEdit={setEditingUser}
                  onDelete={setDeletingUser}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Criação */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Usuário</DialogTitle>
          </DialogHeader>
          <UserForm
            delegaciasDisponiveis={delegaciasDisponiveis}
            onSubmit={handleCreate}
            onCancel={() => setIsCreateModalOpen(false)}
            isLoading={actionLoading}
          />
        </DialogContent>
      </Dialog>

      {/* Modal de Edição */}
      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <UserForm
              delegaciasDisponiveis={delegaciasDisponiveis}
              initialData={editingUser}
              onSubmit={handleUpdate}
              onCancel={() => setEditingUser(null)}
              isLoading={actionLoading}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmationModal
        isOpen={!!deletingUser}
        onClose={() => setDeletingUser(null)}
        onConfirm={handleDelete}
        title="Excluir Usuário"
        isLoading={actionLoading}
      >
        <p className="text-sm text-gray-300">
          Tem certeza que deseja excluir o usuário <strong>{deletingUser?.nome}</strong> permanentemente?
          Esta ação não pode ser desfeita.
        </p>
      </ConfirmationModal>
    </div>
  );
};

export default UsersPage;
