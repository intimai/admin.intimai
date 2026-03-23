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
  Search,
  Plus,
  Edit,
  Trash2,
  Building2,
  MapPin,
  Phone,
  Loader2,
  AlertCircle,
  Copy
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
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
    data_renovacao: '',
    whatsappPhoneNumberId: '',
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
        {/* Identificação Principal */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="nome">Nome da Delegacia *</Label>
          <Input
            id="nome"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            required
            placeholder="Ex: Delegacia de Polícia de São Paulo"
          />
        </div>

        {/* Localização e Contato */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="endereco">Endereço Completo</Label>
          <Input
            id="endereco"
            name="endereco"
            value={formData.endereco || ''}
            onChange={handleChange}
            placeholder="Rua, Número, Bairro, CEP"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cidadeEstado">Cidade - UF</Label>
          <Input
            id="cidadeEstado"
            name="cidadeEstado"
            value={formData.cidadeEstado || ''}
            onChange={handleChange}
            placeholder="Ex: São Paulo - SP"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="telefone">Telefone de Contato</Label>
          <Input
            id="telefone"
            name="telefone"
            value={formData.telefone || ''}
            onChange={handleChange}
            placeholder="(00) 00000-0000"
          />
        </div>

        {/* Configurações de Plano e Status */}
        <div className="p-4 bg-muted/30 rounded-lg border space-y-4 md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="plano">Plano</Label>
            <Select
              value={formData.plano || 'mensal'}
              onValueChange={(val) => handleChange({ target: { name: 'plano', value: val } })}
            >
              <SelectTrigger className="w-full h-10 bg-background">
                <SelectValue placeholder="Selecione um plano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mensal">Mensal</SelectItem>
                <SelectItem value="anual">Anual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status_conta">Status da Conta</Label>
            <Select
              value={formData.status_conta || 'ativa'}
              onValueChange={(val) => handleChange({ target: { name: 'status_conta', value: val } })}
            >
              <SelectTrigger className="w-full h-10 bg-background">
                <SelectValue placeholder="Status da Conta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ativa">Ativa</SelectItem>
                <SelectItem value="inativa">Inativa</SelectItem>
                <SelectItem value="suspensa">Suspensa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="data_renovacao">Data de Renovação</Label>
            <Input
              id="data_renovacao"
              name="data_renovacao"
              type="date"
              value={formData.data_renovacao || ''}
              onChange={handleChange}
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

          <div className="flex items-center space-x-2 pt-8 md:col-span-2">
            <input
              type="checkbox"
              id="bloqueado"
              name="bloqueado"
              checked={formData.bloqueado}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="bloqueado" className="font-normal cursor-pointer">
              Bloquear acesso desta delegacia
            </Label>
          </div>
        </div>

        {/* Configurações Técnicas (API/WhatsApp) */}
        <div className="p-4 bg-primary/5 rounded-lg border border-primary/10 space-y-4 md:col-span-2">
          <p className="text-[10px] uppercase font-bold text-primary/70 tracking-widest">Configuração Técnica (API)</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="evoInstancia">Evo Instância</Label>
              <Input
                id="evoInstancia"
                name="evoInstancia"
                value={formData.evoInstancia || ''}
                onChange={handleChange}
                placeholder="Nome da instância"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsappPhoneNumberId">Phone Number Id (WA)</Label>
              <Input
                id="whatsappPhoneNumberId"
                name="whatsappPhoneNumberId"
                value={formData.whatsappPhoneNumberId || ''}
                onChange={handleChange}
                placeholder="ID do número no WhatsApp"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="evoAPI">Evo API Key</Label>
              <Input
                id="evoAPI"
                name="evoAPI"
                value={formData.evoAPI || ''}
                onChange={handleChange}
                type="password"
                placeholder="Chave secreta da API"
              />
            </div>
          </div>
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
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();

  const handleCopy = (e, text) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Phone ID copiado para a área de transferência.",
      duration: 2000,
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Não definida';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('pt-BR').format(date);
    } catch (e) {
      return dateString;
    }
  };

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
            <Building2 size={24} />
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-bold text-foreground truncate">{delegacia.nome}</h3>
              {delegacia.bloqueado ? (
                <Badge variant="destructive" className="text-[10px] uppercase shrink-0 py-0 h-5">Bloqueado</Badge>
              ) : (
                <Badge
                  className={cn(
                    "text-[10px] uppercase border-none shrink-0 py-0 h-5 shadow-sm font-semibold",
                    delegacia.status_conta === 'ativa'
                      ? "bg-green-500 text-white"
                      : "bg-secondary text-secondary-foreground"
                  )}
                >
                  {delegacia.status_conta}
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1">
              {delegacia.telefone && (
                <div className="flex items-center gap-1 shrink-0">
                  <Phone size={12} className="text-primary/60" />
                  <span>{delegacia.telefone}</span>
                </div>
              )}
              {delegacia.cidadeEstado && (
                <div className="flex items-center gap-1 shrink-0">
                  {delegacia.telefone && <span className="text-border mx-1">•</span>}
                  <MapPin size={12} className="text-primary/60" />
                  <span className="truncate max-w-[200px]">{delegacia.cidadeEstado}</span>
                </div>
              )}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4 text-xs flex-1 pt-4">
              <div className="flex flex-col gap-1 sm:col-span-2">
                <span className="text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">Endereço Completo</span>
                <span className="font-medium text-foreground">{delegacia.endereco || 'Não informado'}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">Término da Licença</span>
                <span className="font-semibold flex items-center gap-1.5 text-foreground">
                  <AlertCircle size={12} className="text-primary/60" />
                  {formatDate(delegacia.data_renovacao)}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">Acesso ao Sistema</span>
                <span className="font-medium text-foreground capitalize">
                  Plano {delegacia.plano} ({delegacia.limiteUsuarios} max)
                </span>
              </div>
              <div className="flex flex-col gap-1 sm:col-span-2 md:col-span-4 mt-2">
                <span className="text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">Configuração WABA (Phone ID)</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono bg-muted/80 px-2 py-1 rounded text-[10px] w-fit text-foreground border border-border/50 shadow-sm">
                    {delegacia.whatsappPhoneNumberId || 'Não configurado pelo cliente'}
                  </span>
                  {delegacia.whatsappPhoneNumberId && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-primary"
                      onClick={(e) => handleCopy(e, delegacia.whatsappPhoneNumberId)}
                      title="Copiar Phone ID"
                    >
                      <Copy size={12} />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Ações */}
            <div className="flex flex-row md:flex-col items-center justify-end gap-2 border-t md:border-t-0 md:border-l border-border/50 pt-4 md:pt-4 md:pl-4 mt-2 md:mt-0 shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="w-full md:w-full gap-2 h-8 text-xs bg-background/50 hover:bg-background"
                onClick={(e) => { e.stopPropagation(); onEdit(delegacia); }}
              >
                <Edit size={12} />
                Editar Perfil
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full md:w-full gap-2 h-8 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                onClick={(e) => { e.stopPropagation(); onDelete(delegacia); }}
              >
                <Trash2 size={12} />
                Excluir Conta
              </Button>
            </div>
          </CardContent>
        </div>
      </div>
    </Card>
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
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Delegacias"
        description="Gestão de delegacias parceiras e configurações técnicas do sistema."
      />

      <Card className="bg-card/90 border-border/40 overflow-hidden shadow-xl backdrop-blur-md">
        <CardContent className="p-6 space-y-8">
          {/* Controles Operacionais */}
          <div className="flex flex-col md:flex-row gap-4 items-end md:items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar delegacias por nome..."
                className="pl-10 h-10 bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 z-50">
              <div className="w-full sm:w-48 shrink-0">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-10 bg-background/50 border-border/50 focus:border-primary/50 text-xs font-medium">
                    <SelectValue placeholder="Filtrar por Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativa">Ativas</SelectItem>
                    <SelectItem value="suspensa">Suspensas</SelectItem>
                    <SelectItem value="inativa">Inativas</SelectItem>
                    <SelectItem value="todas">Todas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={() => setIsCreateModalOpen(true)} className="h-10 px-6 shrink-0 shadow-md hover:shadow-primary/20">
                <Plus className="mr-2 h-4 w-4" />
                Nova Delegacia
              </Button>
            </div>
          </div>

          {/* Lista de Delegacias */}
          {loading && delegacias.length === 0 ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-primary opacity-50" />
            </div>
          ) : delegacias.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground bg-muted/10 rounded-xl border border-dashed border-border/50">
              <AlertCircle className="h-16 w-16 mb-4 opacity-10" />
              <p className="text-lg font-medium">Nenhuma delegacia encontrada.</p>
              <p className="text-sm opacity-60 text-center max-w-xs mt-2">
                Tente ajustar sua busca ou filtros para encontrar o que procura.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
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
        </CardContent>
      </Card>

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