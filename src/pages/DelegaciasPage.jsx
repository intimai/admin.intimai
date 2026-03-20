import React, { useState, useEffect } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { useDelegacias } from '@/hooks/useDelegacias';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Building2,
  MapPin,
  Phone,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

const DelegaciaForm = ({ initialData, onSubmit, onCancel, isLoading }) => {
  const [formData, setFormData] = useState({
    nome: '',
    endereco: '',
    cidadeEstado: '',
    telefone: '',
    limiteUsuarios: 5,
    plano: 'basico',
    status_conta: 'inativa',
    bloqueado: false,
    evoInstancia: '',
    evoAPI: '',
    ...initialData
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome *</Label>
          <Input
            id="nome"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            required
            placeholder="Nome da Delegacia"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="telefone">Telefone</Label>
          <Input
            id="telefone"
            name="telefone"
            value={formData.telefone || ''}
            onChange={handleChange}
            placeholder="(00) 00000-0000"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="endereco">Endereço</Label>
          <Input
            id="endereco"
            name="endereco"
            value={formData.endereco || ''}
            onChange={handleChange}
            placeholder="Rua, Número, Bairro"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cidadeEstado">Cidade/Estado</Label>
          <Input
            id="cidadeEstado"
            name="cidadeEstado"
            value={formData.cidadeEstado || ''}
            onChange={handleChange}
            placeholder="Cidade - UF"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="limiteUsuarios">Limite de Usuários</Label>
          <Input
            id="limiteUsuarios"
            name="limiteUsuarios"
            type="number"
            value={formData.limiteUsuarios}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="plano">Plano</Label>
          <select
            id="plano"
            name="plano"
            value={formData.plano}
            onChange={handleChange}
            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="basico">Básico</option>
            <option value="intermediario">Intermediário</option>
            <option value="avancado">Avançado</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status_conta">Status da Conta</Label>
          <select
            id="status_conta"
            name="status_conta"
            value={formData.status_conta}
            onChange={handleChange}
            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="ativa">Ativa</option>
            <option value="inativa">Inativa</option>
            <option value="suspensa">Suspensa</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="evoInstancia">Evo Instância</Label>
          <Input
            id="evoInstancia"
            name="evoInstancia"
            value={formData.evoInstancia || ''}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="evoAPI">Evo API Key</Label>
          <Input
            id="evoAPI"
            name="evoAPI"
            value={formData.evoAPI || ''}
            onChange={handleChange}
            type="password"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2 pt-2">
        <input
          type="checkbox"
          id="bloqueado"
          name="bloqueado"
          checked={formData.bloqueado}
          onChange={handleChange}
          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
        />
        <Label htmlFor="bloqueado" className="font-normal cursor-pointer">
          Delegacia Bloqueada
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

const DelegaciaCard = ({ delegacia, onEdit, onDelete }) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Building2 size={18} className="text-primary" />
            {delegacia.nome}
          </CardTitle>
          <CardDescription className="text-xs flex items-center gap-1">
            <MapPin size={12} />
            {delegacia.cidadeEstado || 'Localização não informada'}
          </CardDescription>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => onEdit(delegacia)}>
            <Edit size={16} />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => onDelete(delegacia)}>
            <Trash2 size={16} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone size={14} />
            <span>{delegacia.telefone || 'Sem telefone'}</span>
          </div>
          {delegacia.bloqueado ? (
            <Badge variant="destructive" className="text-[10px] uppercase">Bloqueado</Badge>
          ) : (
            <Badge
              className={cn(
                "text-[10px] uppercase border-none",
                delegacia.status_conta === 'ativa'
                  ? "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                  : "bg-secondary text-secondary-foreground"
              )}
            >
              {delegacia.status_conta}
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t">
          <div>
            <span className="text-muted-foreground block">Plano</span>
            <span className="font-medium capitalize">{delegacia.plano}</span>
          </div>
          <div className="text-right">
            <span className="text-muted-foreground block">Usuários</span>
            <span className="font-medium">{delegacia.limiteUsuarios} max</span>
          </div>
        </div>
      </CardContent>
    </Card >
  );
};

const DelegaciasPage = () => {
  const { delegacias, loading, searchDelegacias, createDelegacia, updateDelegacia, deleteDelegacia } = useDelegacias();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ativa');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingDelegacia, setEditingDelegacia] = useState(null);
  const [deletingDelegacia, setDeletingDelegacia] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Debounce search
  useEffect(() => {
    console.log('[DelegaciasPage] useEffect triggered', { searchTerm, statusFilter });
    const timer = setTimeout(() => {
      console.log('[DelegaciasPage] Executing searchDelegacias', { searchTerm, statusFilter });
      searchDelegacias(searchTerm, statusFilter);
    }, 500);
    return () => {
      console.log('[DelegaciasPage] Cleaning up timer', { searchTerm, statusFilter });
      clearTimeout(timer);
    }
  }, [searchTerm, statusFilter, searchDelegacias]);

  const handleCreate = async (data) => {
    setActionLoading(true);
    const result = await createDelegacia(data);
    setActionLoading(false);
    if (result.success) {
      setIsCreateModalOpen(false);
    }
  };

  const handleUpdate = async (data) => {
    if (!editingDelegacia) return;
    setActionLoading(true);
    const result = await updateDelegacia(editingDelegacia.delegaciaId, data);
    setActionLoading(false);
    if (result.success) {
      setEditingDelegacia(null);
    }
  };

  const handleDelete = async () => {
    if (!deletingDelegacia) return;
    setActionLoading(true);
    const result = await deleteDelegacia(deletingDelegacia.delegaciaId);
    setActionLoading(false);
    if (result.success) {
      setDeletingDelegacia(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader
          title="Delegacias"
          description="Gestão de delegacias parceiras e configurações"
        />
        <Button onClick={() => setIsCreateModalOpen(true)} className="w-full md:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Nova Delegacia
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar delegacias por nome..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center p-1 bg-muted rounded-lg border w-fit">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "text-xs px-4 h-8",
              statusFilter === 'ativa' ? "bg-background shadow-sm text-primary font-bold" : "text-muted-foreground"
            )}
            onClick={() => setStatusFilter('ativa')}
          >
            Ativas
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "text-xs px-4 h-8",
              statusFilter === 'inativa' ? "bg-background shadow-sm text-primary font-bold" : "text-muted-foreground"
            )}
            onClick={() => setStatusFilter('inativa')}
          >
            Inativas
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "text-xs px-4 h-8",
              statusFilter === '' ? "bg-background shadow-sm text-primary font-bold" : "text-muted-foreground"
            )}
            onClick={() => setStatusFilter('')}
          >
            Todas
          </Button>
        </div>
      </div>

      {loading && delegacias.length === 0 ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : delegacias.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
          <AlertCircle className="h-12 w-12 mb-4 opacity-20" />
          <p>Nenhuma delegacia encontrada.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {delegacias.map((delegacia) => (
            <DelegaciaCard
              key={delegacia.delegaciaId}
              delegacia={delegacia}
              onEdit={setEditingDelegacia}
              onDelete={setDeletingDelegacia}
            />
          ))}
        </div>
      )}

      {/* Modal de Criação */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Delegacia</DialogTitle>
          </DialogHeader>
          <DelegaciaForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreateModalOpen(false)}
            isLoading={actionLoading}
          />
        </DialogContent>
      </Dialog>

      {/* Modal de Edição */}
      <Dialog open={!!editingDelegacia} onOpenChange={(open) => !open && setEditingDelegacia(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Delegacia</DialogTitle>
          </DialogHeader>
          {editingDelegacia && (
            <DelegaciaForm
              initialData={editingDelegacia}
              onSubmit={handleUpdate}
              onCancel={() => setEditingDelegacia(null)}
              isLoading={actionLoading}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmationModal
        isOpen={!!deletingDelegacia}
        onClose={() => setDeletingDelegacia(null)}
        onConfirm={handleDelete}
        title="Excluir Delegacia"
        isLoading={actionLoading}
      >
        <p className="text-sm text-gray-300">
          Tem certeza que deseja excluir a delegacia <strong>{deletingDelegacia?.nome}</strong>?
          Esta ação não pode ser desfeita.
        </p>
      </ConfirmationModal>
    </div>
  );
};

export default DelegaciasPage;