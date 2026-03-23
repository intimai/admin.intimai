import React, { useMemo, useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { useSuporte } from '@/hooks/useSuporte';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Mail, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const KanbanColumn = ({ title, subtitle, items, status, onMove, onUpdatePriority, colorClass }) => {
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
            <SuporteCard key={item.id} item={item} onUpdatePriority={onUpdatePriority} />
          ))
        )}
      </div>
    </div>
  );
};

const SuporteCard = ({ item, onUpdatePriority }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'alta': return 'text-red-600 bg-red-100 border-red-200 hover:bg-red-200';
      case 'media': return 'text-yellow-600 bg-yellow-100 border-yellow-200 hover:bg-yellow-200';
      case 'baixa': return 'text-green-600 bg-green-100 border-green-200 hover:bg-green-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200 hover:bg-gray-200';
    }
  };

  const handleDragStart = (e) => {
    e.dataTransfer.setData('itemId', item.id);
    e.dataTransfer.effectAllowed = 'move';
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
            <CardTitle className="text-sm font-bold line-clamp-1" title={item.email}>
              {item.email || 'Ticket Sem E-mail'}
            </CardTitle>
            <GripVertical size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="flex justify-between items-center mt-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-foreground/80">
              <span className="text-primary/70">Resp:</span>
              {item.nome || 'Não atribuído'}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <p className="text-sm text-foreground/90 italic bg-muted/30 p-3 rounded-lg border border-border/50 break-words">
            "{item.mensagem}"
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

const SuportePage = () => {
  const { items, loading, updateStatus, updatePriority } = useSuporte();

  const columns = useMemo(() => {
    return {
      novo: items.filter(i => i.status === 'novo' || !i.status || i.status === 'aberto'),
      conversando: items.filter(i => i.status === 'conversando'),
      em_atendimento: items.filter(i => i.status === 'em_atendimento' || i.status === 'em_andamento'),
      resolvido: items.filter(i => i.status === 'resolvido'),
      avaliado: items.filter(i => i.status === 'avaliado'),
    };
  }, [items]);

  if (loading) {
    return (
      <div className="flex flex-col gap-6 max-w-7xl mx-auto">
        <PageHeader title="Suporte" description="Carregando tickets de suporte..." />
        <Card className="bg-card/30 border-border/40 h-[60vh] flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary opacity-50" />
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      <PageHeader
        title="Suporte"
        description="Central estratégica de atendimento ao cliente e gestão inteligente de tickets de suporte."
      />

      <Card className="bg-card/90 border-border/40 overflow-hidden shadow-xl backdrop-blur-md">
        <CardContent className="p-6">
          <div className="overflow-x-auto pb-4 scale-y-[-1] custom-scrollbar">
            <div className="flex gap-6 min-w-fit pr-4 scale-y-[-1]">
              <KanbanColumn
                title="Aberto"
                status="novo"
                items={columns.novo}
                onMove={updateStatus}
                onUpdatePriority={updatePriority}
                colorClass="text-zinc-100 border-zinc-100/20"
              />
              <KanbanColumn
                title="Conversando"
                subtitle="com IA"
                status="conversando"
                items={columns.conversando}
                onMove={updateStatus}
                onUpdatePriority={updatePriority}
                colorClass="text-purple-400 border-purple-400/20"
              />
              <KanbanColumn
                title="Em Atendimento"
                subtitle="humano"
                status="em_atendimento"
                items={columns.em_atendimento}
                onMove={updateStatus}
                onUpdatePriority={updatePriority}
                colorClass="text-cyan-400 border-cyan-400/20"
              />
              <KanbanColumn
                title="Resolvido"
                status="resolvido"
                items={columns.resolvido}
                onMove={updateStatus}
                onUpdatePriority={updatePriority}
                colorClass="text-green-400 border-green-400/20"
              />
              <KanbanColumn
                title="Avaliado"
                status="avaliado"
                items={columns.avaliado}
                onMove={updateStatus}
                onUpdatePriority={updatePriority}
                colorClass="text-pink-400 border-pink-400/20"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuportePage;