import React, { useMemo, useState, useCallback } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { useSuporte } from '@/hooks/useSuporte';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Mail, GripVertical, Building2, MessageSquare, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

// Mapa de transições permitidas para o Kanban de Suporte
const ALLOWED_TRANSITIONS = {
  'novo': [],          // Bloqueado — decisão da IA/N8N
  'conversando': [],   // Bloqueado — decisão da IA/N8N
  'em_atendimento': ['resolvido'],
  'resolvido': [],     // Status final — sem movimentação manual
  'avaliado': [],      // Status final — sem movimentação manual
};

const KanbanColumn = ({
  title,
  subtitle,
  items,
  status,
  onMove,
  colorClass,
  isLocked,
  dragSourceStatus,
  onDragStart,
  onDragEnd,
}) => {
  const [isOver, setIsOver] = useState(false);

  const isDragging = dragSourceStatus !== null;
  const isValidTarget =
    isDragging &&
    dragSourceStatus &&
    ALLOWED_TRANSITIONS[dragSourceStatus]?.includes(status);
  const isInvalidTarget =
    isDragging &&
    dragSourceStatus &&
    !ALLOWED_TRANSITIONS[dragSourceStatus]?.includes(status) &&
    dragSourceStatus !== status;

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
        'flex flex-col gap-4 min-w-[280px] w-80 p-4 rounded-lg h-fit border flex-shrink-0 transition-all duration-200',
        isOver && isValidTarget
          ? 'bg-green-500/10 border-green-400/60 scale-[1.01]'
          : isOver && isInvalidTarget
          ? 'bg-red-500/10 border-red-400/60'
          : isValidTarget
          ? 'border-green-400/40 bg-green-500/5'
          : isInvalidTarget
          ? 'border-red-400/20 opacity-60'
          : 'bg-muted/30 border-border/50'
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
        {subtitle && (
          <span className="text-[10px] opacity-70 italic mt-0.5">{subtitle}</span>
        )}
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
            <SuporteCard
              key={item.id}
              item={item}
              columnStatus={status}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
            />
          ))
        )}
      </div>
    </div>
  );
};

const SuporteCard = ({ item, columnStatus, onDragStart, onDragEnd }) => {
  const isLocked = ALLOWED_TRANSITIONS[columnStatus]?.length === 0;

  const handleDragStart = (e) => {
    e.dataTransfer.setData('itemId', item.id);
    e.dataTransfer.setData('sourceStatus', columnStatus);
    e.dataTransfer.effectAllowed = 'move';
    if (onDragStart) onDragStart(columnStatus);
  };

  const handleDragEnd = () => {
    if (onDragEnd) onDragEnd();
  };

  // Recupera o nome da delegacia validando os possíveis mapeamentos ou preenchimentos
  const getDelegaciaNome = () => {
    if (item.delegaciaNomeMapeado) return item.delegaciaNomeMapeado;
    if (item.delegacia) return item.delegacia;
    if (!item.delegacias) return null;
    if (Array.isArray(item.delegacias)) return item.delegacias[0]?.nome || null;
    return item.delegacias.nome || null;
  };

  const delegaciaNome = getDelegaciaNome();

  // Função para parsear a mensagem no formato "Assunto: ... Mensagem: ..."
  const parseMensagem = (raw) => {
    if (!raw) return { assunto: null, corpo: 'Sem mensagem' };
    
    // Tenta encontrar o padrão Assunto: ... Mensagem: ...
    const match = raw.match(/Assunto:\s*(.*?)\s*Mensagem:\s*(.*)/i);
    if (match) {
      return { assunto: match[1], corpo: match[2] };
    }
    
    // Fallback se não bater o padrão (ou se tiver apenas Mensagem:)
    const matchMsg = raw.match(/Mensagem:\s*(.*)/i);
    if (matchMsg) return { assunto: null, corpo: matchMsg[1] };

    return { assunto: null, corpo: raw };
  };

  const { assunto, corpo } = parseMensagem(item.mensagem);

  return (
    <div
      draggable={true}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={cn(
        'group cursor-grab active:cursor-grabbing'
      )}
    >
      <Card className="shadow-sm hover:shadow-md transition-shadow bg-card border-l-4 border-l-primary/20 hover:border-l-primary group-active:opacity-50 overflow-hidden">
        <CardHeader className="p-4 pb-2">
          <div className="flex justify-between items-start gap-2">
            <div>
              <CardTitle className="text-sm font-bold line-clamp-1" title={item.nome}>
                {item.nome || 'Usuário sem nome'}
              </CardTitle>
            </div>
            <GripVertical
              size={14}
              className={cn(
                'text-muted-foreground transition-opacity shrink-0 mt-0.5 opacity-0 group-hover:opacity-100'
              )}
            />
          </div>

          <div className="flex flex-col gap-1.5 mt-2">
            {/* E-mail */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Mail size={11} className="text-primary/60 shrink-0" />
              <span className="truncate">{item.email || 'Sem e-mail'}</span>
            </div>

            {/* Delegacia */}
            {delegaciaNome && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Building2 size={11} className="text-primary/60 shrink-0" />
                <span className="truncate text-primary/80 font-medium">{delegaciaNome}</span>
              </div>
            )}
          </div>
        </CardHeader>

        {/* Mensagem e Assunto */}
        <CardContent className="p-4 pt-0 pb-4 space-y-2.5">
          <div className="border-t border-border/40 pt-2.5 mt-0.5 space-y-2">
            {assunto && (
              <div className="flex items-start gap-1.5 bg-primary/5 p-1.5 rounded-md border border-primary/10">
                <Tag size={11} className="text-primary/80 shrink-0 mt-0.5" />
                <span className="text-[10px] font-extrabold text-primary leading-tight uppercase tracking-tight">
                  {assunto}
                </span>
              </div>
            )}
            
            <div className="flex items-start gap-2">
              <MessageSquare size={12} className="text-muted-foreground/40 shrink-0 mt-1" />
              <p className="text-[11px] leading-relaxed text-muted-foreground line-clamp-3 italic">
                "{corpo}"
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const SuportePage = () => {
  const { items, loading, updateStatus } = useSuporte();
  const { toast } = useToast();
  const [dragSourceStatus, setDragSourceStatus] = useState(null);

  const columns = useMemo(() => {
    const normalize = (s) => (s || '').toLowerCase();
    return {
      novo: items.filter((i) => {
        const s = normalize(i.status);
        return s === 'novo' || s === 'aberto' || !s;
      }),
      conversando: items.filter((i) => normalize(i.status) === 'conversando'),
      em_atendimento: items.filter((i) => {
        const s = normalize(i.status);
        return s === 'em_atendimento' || s === 'em_andamento' || s === 'andamento' || s === 'atendimento_humano';
      }),
      resolvido: items.filter((i) => normalize(i.status) === 'resolvido' || normalize(i.status) === 'finalizado'),
      avaliado: items.filter((i) => normalize(i.status) === 'avaliado'),
    };
  }, [items]);

  const handleMoveCard = (id, newStatus) => {
    setDragSourceStatus(null);
    const item = items.find((i) => i.id === id);
    if (!item) return;

    const oldStatus = item.status || 'novo';
    if (oldStatus === newStatus) return;

    const allowed = ALLOWED_TRANSITIONS[oldStatus] || [];
    if (!allowed.includes(newStatus)) {
      let errorMessage = '';
      if (['resolvido', 'avaliado'].includes(oldStatus)) {
        errorMessage =
          "Este ticket já foi finalizado e não pode ser removido. Ele será atualizado para 'Avaliado' quando o usuário preencher a avaliação pelo IntimAI.";
      } else if (['novo', 'conversando'].includes(oldStatus)) {
        errorMessage =
          "Este ticket está na etapa de atendimento automatizado pela IA. Aguarde a ação automática para prosseguir.";
      } else if (oldStatus === 'em_atendimento') {
        errorMessage =
          "Tickets em 'Atendimento Humano' só podem ser movidos para 'Resolvido'.";
      } else {
        errorMessage = "Esta transição não é permitida.";
      }
      toast({ title: "Ação não permitida", description: errorMessage });
      return;
    }

    updateStatus(id, newStatus);
  };

  const handleDragStart = useCallback((sourceStatus) => setDragSourceStatus(sourceStatus), []);
  const handleDragEnd = useCallback(() => setDragSourceStatus(null), []);

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
                onMove={handleMoveCard}
                colorClass="text-zinc-100 border-zinc-100/20"
                isLocked={true}
                dragSourceStatus={dragSourceStatus}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              />
              <KanbanColumn
                title="Conversando"
                subtitle="com IA"
                status="conversando"
                items={columns.conversando}
                onMove={handleMoveCard}
                colorClass="text-purple-400 border-purple-400/20"
                isLocked={true}
                dragSourceStatus={dragSourceStatus}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              />
              <KanbanColumn
                title="Em Atendimento"
                subtitle="humano"
                status="em_atendimento"
                items={columns.em_atendimento}
                onMove={handleMoveCard}
                colorClass="text-cyan-400 border-cyan-400/20"
                dragSourceStatus={dragSourceStatus}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              />
              <KanbanColumn
                title="Resolvido"
                status="resolvido"
                items={columns.resolvido}
                onMove={handleMoveCard}
                colorClass="text-green-400 border-green-400/20"
                isLocked={true}
                dragSourceStatus={dragSourceStatus}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              />
              <KanbanColumn
                title="Avaliado"
                status="avaliado"
                items={columns.avaliado}
                onMove={handleMoveCard}
                colorClass="text-pink-400 border-pink-400/20"
                isLocked={true}
                dragSourceStatus={dragSourceStatus}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuportePage;