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

const KanbanColumn = ({ title, subtitle, items, status, onMove, colorClass, isLocked }) => {
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
        isOver && !isLocked ? "bg-muted/60 border-primary/50" : "bg-muted/30 border-border/50"
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
          !isLocked && (
            <div className="text-center py-8 text-muted-foreground text-sm italic border-2 border-dashed border-muted rounded-md bg-background/50">
              Arraste itens aqui
            </div>
          )
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
  // Apenas Qualificado e Fechado são não-arrastáveis (aguardam ação de botão)
  const isDraggable = !['qualificado', 'fechado'].includes(columnStatus);

  const handleDragStart = (e) => {
    if (!isDraggable) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('itemId', item.id);
    e.dataTransfer.setData('sourceStatus', columnStatus);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable={isDraggable}
      onDragStart={handleDragStart}
      className={cn("group", isDraggable ? "cursor-grab active:cursor-grabbing" : "cursor-default")}
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
    if (loading) return;

    setLoading(true);
    try {
      console.log('[NewLeadDialog] Criando lead com status pendente...');
      const { data, error } = await supabase.from('leads').insert([{
        delegacia: formData.delegacia,
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone,
        delegadoResponsavel: formData.delegadoResponsavel,
        status: 'pendente'
      }]).select();

      if (error) throw error;

      console.log('[NewLeadDialog] Sucesso!', data);
      toast({ title: "Lead Criado", description: "Novo lead adicionado com sucesso." });
      setOpen(false);
      setFormData({ delegacia: '', nome: '', email: '', telefone: '', delegadoResponsavel: '' });

      // Chama o refresh depois de fechar o modal
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('[NewLeadDialog] Erro:', error);
      toast({
        title: "Erro ao cadastrar",
        description: error.message || "Tente novamente em instantes.",
        variant: "destructive"
      });
    } finally {
      // Pequeno delay para garantir que o estado de loading não seja removido antes do unmount se estiver fechando
      setTimeout(() => setLoading(false), 500);
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
      nao_qualificado: items.filter(i => i.status === 'nao_qualificado'),
      proposta: items.filter(i => i.status === 'proposta'),
      fechado: items.filter(i => i.status === 'fechado'),
      ativo: items.filter(i => i.status === 'ativo' || i.status === 'concluido'),
      suspenso: items.filter(i => i.status === 'suspenso'),
      inativo: items.filter(i => i.status === 'inativo'),
    };
  }, [items]);

  const handleMoveCard = (id, newStatus) => {
    const item = items.find(i => i.id === id);
    if (!item) return;

    const oldStatus = item.status || 'pendente';

    // Se for o mesmo status, ignora
    if (oldStatus === newStatus) return;

    // Regras de Transição (Validação)
    let errorMessage = '';

    // Regra 1: Novo e IA - o arrastar visualmente é permitido, mas a transferência é bloqueada com mensagem
    if (['novo', 'pendente', 'conversando'].includes(oldStatus)) {
      errorMessage = "Este lead está na etapa de atendimento automatizado pela IA. Aguarde a qualificação automática para prosseguir.";
    }
    // Regra 3: Em Atendimento -> Qualificado ou Não Qualificado
    else if (oldStatus === 'em_atendimento' && !['qualificado', 'nao_qualificado'].includes(newStatus)) {
      errorMessage = "Cards em 'Atendimento Humano' só podem ser movidos para 'Qualificado' ou 'Não Qualificado'.";
    }
    // Regra 4: Qualificado não arrasta manualmente
    else if (oldStatus === 'qualificado') {
      errorMessage = "O card 'Qualificado' não pode ser movido manualmente. Gere a proposta para avançar automaticamente.";
    }
    // Regra 4: Não Qualificado -> Qualificado
    else if (oldStatus === 'nao_qualificado' && newStatus !== 'qualificado') {
      errorMessage = "Cards 'Não Qualificados' só podem retornar para a coluna 'Qualificado'.";
    }
    // Regra 5: Proposta Enviada -> Fechado
    else if (oldStatus === 'proposta' && newStatus !== 'fechado') {
      errorMessage = "Cards com 'Proposta Enviada' só podem ser movidos para 'Fechado' após confirmação.";
    }
    // Regra 6: Fechado não arrasta manualmente
    else if (oldStatus === 'fechado') {
      errorMessage = "O card 'Fechado' requer a geração de contrato (em breve) para avançar para 'Ativo'.";
    }
    // Regra 7: Ativo -> Suspenso
    else if (oldStatus === 'ativo' && newStatus !== 'suspenso') {
      errorMessage = "Cards 'Ativos' só podem ser movidos para a coluna 'Suspenso'.";
    }
    // Regra 8: Suspenso -> Ativo ou Inativo
    else if (oldStatus === 'suspenso' && !['ativo', 'inativo'].includes(newStatus)) {
      errorMessage = "Cards 'Suspensos' só podem retornar para 'Ativo' ou ir para 'Inativo'.";
    }

    if (errorMessage) {
      toast({
        title: "Ação não permitida",
        description: errorMessage,
        variant: "destructive"
      });
      return;
    }

    // Se passou nas regras, atualiza
    updateStatus(id, newStatus);
  };

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
                onMove={handleMoveCard}
                colorClass="text-zinc-100 border-zinc-100/20"
                isLocked={true}
              />
              <KanbanColumn
                title="Conversando"
                subtitle="IA"
                status="conversando"
                items={columns.conversando}
                onMove={handleMoveCard}
                colorClass="text-purple-400 border-purple-400/20"
                isLocked={true}
              />
              <KanbanColumn
                title="Em Atendimento"
                subtitle="Humano"
                status="em_atendimento"
                items={columns.em_atendimento}
                onMove={handleMoveCard}
                colorClass="text-cyan-400 border-cyan-400/20"
              />
              <KanbanColumn
                title="Qualificado"
                subtitle="Enviar Proposta"
                status="qualificado"
                items={columns.qualificado}
                onMove={handleMoveCard}
                colorClass="text-pink-400 border-pink-400/20"
                isLocked={true}
              />
              <KanbanColumn
                title="Não Qualificado"
                subtitle="Esteira de Reaquecimento"
                status="nao_qualificado"
                items={columns.nao_qualificado}
                onMove={handleMoveCard}
                colorClass="text-red-400 border-red-400/20"
              />
              <KanbanColumn
                title="Proposta Enviada"
                subtitle="Aguardando Resposta"
                status="proposta"
                items={columns.proposta}
                onMove={handleMoveCard}
                colorClass="text-yellow-400 border-yellow-400/20"
              />
              <KanbanColumn
                title="Fechado"
                subtitle="Enviar Contrato"
                status="fechado"
                items={columns.fechado}
                onMove={handleMoveCard}
                colorClass="text-indigo-400 border-indigo-400/20"
                isLocked={true}
              />
              <KanbanColumn
                title="Ativo"
                subtitle="Contrato Assinado"
                status="ativo"
                items={columns.ativo}
                onMove={handleMoveCard}
                colorClass="text-green-400 border-green-400/20"
              />
              <KanbanColumn
                title="Suspenso"
                subtitle="Pausado"
                status="suspenso"
                items={columns.suspenso}
                onMove={handleMoveCard}
                colorClass="text-orange-400 border-orange-400/20"
              />
              <KanbanColumn
                title="Inativo"
                subtitle="Perdido"
                status="inativo"
                items={columns.inativo}
                onMove={handleMoveCard}
                colorClass="text-slate-500 border-slate-500/20"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PipelinePage;