import React, { useMemo, useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { useProspeccao } from '@/hooks/useProspeccao';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Phone, Mail, User, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

const KanbanColumn = ({ title, items, status, onMove, colorClass }) => {
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
      <div className={`flex items-center justify-between pb-2 border-b border-border/50 mb-2 ${colorClass}`}>
        <h3 className="font-semibold text-sm uppercase tracking-wide">{title}</h3>
        <Badge variant="secondary" className="font-mono text-xs">
          {items.length}
        </Badge>
      </div>
      
      <div className="flex flex-col gap-3 pr-2 min-h-[100px]">
        {items.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm italic border-2 border-dashed border-muted rounded-md bg-background/50">
            Arraste itens aqui
          </div>
        ) : (
          items.map((item) => (
            <ProspeccaoCard key={item.id} item={item} />
          ))
        )}
      </div>
    </div>
  );
};

const ProspeccaoCard = ({ item }) => {
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
            <CardDescription className="text-xs flex items-center gap-1">
               <User size={12} /> {item.delegadoResponsavel}
            </CardDescription>
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
        </CardContent>
      </Card>
    </div>
  );
};

const ProspeccaoPage = () => {
  const { items, loading, updateStatus } = useProspeccao();

  const columns = useMemo(() => {
    return {
      pendente: items.filter(i => i.status === 'pendente' || !i.status),
      processando: items.filter(i => i.status === 'processando'),
      concluido: items.filter(i => i.status === 'concluido'),
    };
  }, [items]);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Prospecção" 
        description="Gerencie a fila de espera e oportunidades de novas delegacias"
      />
      
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-fit">
          <KanbanColumn 
            title="Aberto" 
            status="pendente" 
            items={columns.pendente} 
            onMove={updateStatus}
            colorClass="text-yellow-600 border-yellow-200"
          />
          <KanbanColumn 
            title="Em Andamento" 
            status="processando" 
            items={columns.processando} 
            onMove={updateStatus}
            colorClass="text-blue-600 border-blue-200"
          />
          <KanbanColumn 
            title="Resolvido" 
            status="concluido" 
            items={columns.concluido} 
            onMove={updateStatus}
            colorClass="text-green-600 border-green-200"
          />
        </div>
      </div>
    </div>
  );
};

export default ProspeccaoPage;