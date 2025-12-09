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

const KanbanColumn = ({ title, items, status, onMove, onUpdatePriority, colorClass }) => {
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
            <CardTitle className="text-sm font-bold line-clamp-1" title={item.nome}>
              {item.nome}
            </CardTitle>
            <GripVertical size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="flex justify-between items-center mt-1">
             <div className="flex items-center gap-1 text-xs text-muted-foreground" title={item.email}>
              <Mail size={12} />
              <span className="truncate max-w-[120px]">{item.email}</span>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger className="focus:outline-none">
                <Badge variant="outline" className={cn("text-[10px] uppercase shrink-0 border cursor-pointer transition-colors", getPriorityColor(item.prioridade))}>
                  {item.prioridade}
                </Badge>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onUpdatePriority(item.id, 'alta')} className="text-red-600 focus:text-red-700 cursor-pointer">
                  ALTA
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onUpdatePriority(item.id, 'media')} className="text-yellow-600 focus:text-yellow-700 cursor-pointer">
                  MÉDIA
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onUpdatePriority(item.id, 'baixa')} className="text-green-600 focus:text-green-700 cursor-pointer">
                  BAIXA
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

          </div>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <p className="text-xs text-muted-foreground line-clamp-3 italic bg-muted/50 p-2 rounded-md">
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
      aberto: items.filter(i => i.status === 'aberto' || !i.status),
      em_andamento: items.filter(i => i.status === 'em_andamento'),
      resolvido: items.filter(i => i.status === 'resolvido'),
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
        title="Suporte" 
        description="Central de atendimento e gestão de tickets"
      />
      
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-fit">
          <KanbanColumn 
            title="Aberto" 
            status="aberto" 
            items={columns.aberto} 
            onMove={updateStatus}
            onUpdatePriority={updatePriority}
            colorClass="text-yellow-600 border-yellow-200"
          />
          <KanbanColumn 
            title="Em Andamento" 
            status="em_andamento" 
            items={columns.em_andamento} 
            onMove={updateStatus}
            onUpdatePriority={updatePriority}
            colorClass="text-blue-600 border-blue-200"
          />
          <KanbanColumn 
            title="Resolvido" 
            status="resolvido" 
            items={columns.resolvido} 
            onMove={updateStatus}
            onUpdatePriority={updatePriority}
            colorClass="text-green-600 border-green-200"
          />
        </div>
      </div>
    </div>
  );
};

export default SuportePage;