import React, { useMemo, useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { usePipeline } from '@/hooks/usePipeline';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Phone, Mail, User, GripVertical, FileText, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const KanbanColumn = ({ title, subtitle, items, status, onMove, colorClass }) => {
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsOver(true);
  };

  const handleDragLeave = () => {
    setIsOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsOver(false);
    const itemId = e.dataTransfer.getData('itemId');
    if (itemId) {
      onMove(itemId, status);
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-4 min-w-[280px] w-80 p-4 rounded-lg h-fit border flex-shrink-0 transition-colors duration-200",
        isOver ? "bg-muted/60 border-primary/50" : "bg-muted/30 border-border/50"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className={`flex flex-col pb-2 border-b border-border/50 mb-2 ${colorClass}`}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm uppercase tracking-wide">{title}</h3>
          <Badge variant="secondary" className="font-mono text-xs">
            {items.length}
          </Badge>
        </div>
        {subtitle && <span className="text-[10px] opacity-70 italic mt-0.5">{subtitle}</span>}
      </div>

      <div className="flex flex-col gap-3 pr-2 min-h-[100px]">
        {items.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm italic border-2 border-dashed border-muted rounded-md bg-background/50">
            Arraste itens aqui
          </div>
        ) : (
          items.map((item) => (
            <PipelineCard key={item.id} item={item} columnStatus={status} />
          ))
        )}
      </div>
    </div>
  );
};

const PipelineCard = ({ item, columnStatus }) => {
  const handleDragStart = (e) => {
    e.dataTransfer.setData('itemId', item.id);
    e.dataTransfer.effectAllowed = 'move';
    // Adiciona uma classe temporária para indicar que está sendo arrastado (opcional, pois o navegador já cria o "fantasma")
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="cursor-grab active:cursor-grabbing group"
    >
      <Card className="shadow-sm hover:shadow-md transition-shadow bg-card border-l-4 border-l-primary/20 hover:border-l-primary group-active:opacity-50">
        <CardHeader className="p-4 pb-2">
          <div className="flex justify-between items-start gap-2">
            <CardTitle className="text-sm font-bold line-clamp-1" title={item.delegacia}>
              {item.delegacia}
            </CardTitle>
            <GripVertical size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="flex justify-between items-center mt-1">
            <Badge variant="outline" className="text-[10px] uppercase shrink-0">
              {new Date(item.created_at).toLocaleDateString('pt-BR')}
            </Badge>
          </div>
          <div className="flex flex-col gap-1 mt-3">
            <CardDescription className="text-xs flex items-center gap-1.5 font-medium text-foreground/80">
              <User size={13} className="text-primary/70" />
              {item.nome || 'Não atribuído'}
            </CardDescription>
            <div className="text-[10px] text-muted-foreground/60 italic pl-5">
              Resp: {
                item.delegadoResponsavel === item.nome
                  ? 'O próprio'
                  : (item.delegadoResponsavel || 'Não informado')
              }
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-2 space-y-2">
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex items-center gap-2" title={item.email}>
              <Mail size={12} className="shrink-0" />
              <span className="truncate">{item.email}</span>
            </div>
            <div className="flex items-center gap-2" title={item.telefone}>
              <Phone size={12} className="shrink-0" />
              <span className="truncate">{item.telefone}</span>
            </div>
          </div>
          {columnStatus === 'qualificado' && (
            <div className="mt-4 pt-3 border-t border-border/30 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-[10px] gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.href = `/propostas?lead_id=${item.id}`;
                }}
              >
                <FileText size={12} />
                Gerar Proposta
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const NewLeadDialog = ({ onSuccess }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    delegacia: '',
    nome: '',
    email: '',
    telefone: '',
    delegadoResponsavel: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('leads').insert([{
        delegacia: formData.delegacia,
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone,
        delegadoResponsavel: formData.delegadoResponsavel,
        status: 'pendente'
      }]);

      if (error) throw error;

      toast({ title: "Lead Criado", description: "Novo lead adicionado com sucesso." });
      setOpen(false);
      setFormData({ delegacia: '', nome: '', email: '', telefone: '', delegadoResponsavel: '' });
      if (onSuccess) onSuccess();
    } catch (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 shadow-sm" variant="default">
          <Plus size={16} /> Novo Lead
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Novo Lead</DialogTitle>
          <DialogDescription>Cadastre manualmente uma nova delegacia no funil de vendas.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Nome da Delegacia (Obrigatório)</Label>
            <Input name="delegacia" value={formData.delegacia} onChange={handleChange} placeholder="Ex: Delegacia XPTO" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome do Contato</Label>
              <Input name="nome" value={formData.nome} onChange={handleChange} placeholder="Ex: João Silva" />
            </div>
            <div className="space-y-2">
              <Label>Delegado Responsável</Label>
              <Input name="delegadoResponsavel" value={formData.delegadoResponsavel} onChange={handleChange} placeholder="Opcional" />
            </div>
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="contato@exemplo.com" />
            </div>
            <div className="space-y-2">
              <Label>Telefone / WhatsApp</Label>
              <Input name="telefone" value={formData.telefone} onChange={handleChange} placeholder="(00) 00000-0000" />
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading || !formData.delegacia}>
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Salvar Lead
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const PipelinePage = () => {
  const { items, loading, updateStatus, refresh } = usePipeline();

  const columns = useMemo(() => {
    return {
      novo: items.filter(i => i.status === 'novo' || !i.status || i.status === 'pendente'),
      conversando: items.filter(i => i.status === 'conversando'),
      em_atendimento: items.filter(i => i.status === 'em_atendimento' || i.status === 'processando'),
      qualificado: items.filter(i => i.status === 'qualificado'),
      proposta: items.filter(i => i.status === 'proposta'),
      fechado: items.filter(i => i.status === 'fechado'),
      ativo: items.filter(i => i.status === 'ativo' || i.status === 'concluido'),
      nao_qualificado: items.filter(i => i.status === 'nao_qualificado'),
    };
  }, [items]);

  if (loading) {
    return (
      <div className="flex flex-col gap-6 max-w-7xl mx-auto">
        <PageHeader title="Pipeline" description="Carregando dados do funil..." />
        <Card className="bg-card/30 border-border/40 h-[60vh] flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary opacity-50" />
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      <PageHeader
        title="Pipeline"
        description="Gestão estratégica de leads e progresso do funil de conversão das delegacias."
        action={<NewLeadDialog onSuccess={refresh} />}
      />

      <Card className="bg-card/90 border-border/40 overflow-hidden shadow-xl backdrop-blur-md">
        <CardContent className="p-6">
          <div className="overflow-x-auto pb-4 scale-y-[-1] custom-scrollbar">
            <div className="flex gap-6 min-w-fit pr-4 scale-y-[-1]">
              <KanbanColumn
                title="Novo"
                status="pendente"
                items={columns.novo}
                onMove={updateStatus}
                colorClass="text-zinc-100 border-zinc-100/20"
              />
              <KanbanColumn
                title="Conversando"
                subtitle="com IA"
                status="conversando"
                items={columns.conversando}
                onMove={updateStatus}
                colorClass="text-purple-400 border-purple-400/20"
              />
              <KanbanColumn
                title="Em Atendimento"
                subtitle="por humano"
                status="em_atendimento"
                items={columns.em_atendimento}
                onMove={updateStatus}
                colorClass="text-cyan-400 border-cyan-400/20"
              />
              <KanbanColumn
                title="Qualificado"
                subtitle="Enviando Proposta..."
                status="qualificado"
                items={columns.qualificado}
                onMove={updateStatus}
                colorClass="text-pink-400 border-pink-400/20"
              />
              <KanbanColumn
                title="Proposta"
                subtitle="Aguardando Resposta"
                status="proposta"
                items={columns.proposta}
                onMove={updateStatus}
                colorClass="text-yellow-400 border-yellow-400/20"
              />
              <KanbanColumn
                title="Fechado"
                subtitle="Aguardando Contrato"
                status="fechado"
                items={columns.fechado}
                onMove={updateStatus}
                colorClass="text-indigo-400 border-indigo-400/20"
              />
              <KanbanColumn
                title="Ativo"
                subtitle="Contrato Assinado"
                status="ativo"
                items={columns.ativo}
                onMove={updateStatus}
                colorClass="text-green-400 border-green-400/20"
              />
              <KanbanColumn
                title="Não Qualificado"
                subtitle="Esteira de Reaquecimento"
                status="nao_qualificado"
                items={columns.nao_qualificado}
                onMove={updateStatus}
                colorClass="text-red-400 border-red-400/20"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PipelinePage;