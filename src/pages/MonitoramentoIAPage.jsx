import React, { useState, useEffect } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { supabase } from '@/lib/customSupabaseClient';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Clock, 
  AlertTriangle, 
  Cpu, 
  MessageSquare, 
  RefreshCw, 
  ExternalLink,
  CheckCircle2,
  XCircle,
  Bug,
  Terminal,
  Play,
  Copy,
  Loader2,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

const MonitoramentoIAPage = () => {
    const [activeTab, setActiveTab] = useState('timeouts'); // 'timeouts' ou 'errors'
    const [loading, setLoading] = useState(true);
    const [lastUpdate, setLastUpdate] = useState(null);
    const { toast } = useToast();
    
    // Estados para Gargalos (Timeouts)
    const [timeouts, setTimeouts] = useState([]);
    
    // Estados para Erros do N8N
    const [n8nErrors, setN8nErrors] = useState([]);

    useEffect(() => {
        fetchData();
        // Setup Real-time para novos erros
        const channel = supabase
            .channel('n8n-errors')
            .on('postgres_changes', { event: 'INSERT', table: 'logs_erro_ia' }, (payload) => {
                setN8nErrors(prev => [payload.new, ...prev]);
                toast({
                    title: "Novo Erro no N8N!",
                    description: `O workflow ${payload.new.nome_workflow} apresentou uma falha crítica.`,
                    variant: "destructive"
                });
            })
            .subscribe();

        // Setup Auto-refresh para gargalos (timeouts) a cada 60 segundos (60000ms)
        const intervalId = setInterval(() => {
            fetchTimeouts(); // Buscamos apenas os Timeouts (silenciosamente sem o skeleton loading)
        }, 60000);

        return () => {
            supabase.removeChannel(channel);
            clearInterval(intervalId); // Limpa o timer se fechar a tela
        };
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            await Promise.all([fetchTimeouts(), fetchErrors()]);
        } finally {
            setLoading(false);
        }
    };

    const fetchTimeouts = async () => {
        try {
            const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
            
            // Buscamos as conversas ativas (apenas 'entregue' e 'ativa') na tabela intimações primeiro
            const { data: activeIntimacoes, error: intimacoesError } = await supabase
                .from('intimacoes')
                .select('id, delegaciaId, criadoEm')
                .in('status', ['entregue', 'ativa'])
                .limit(50);

            if (intimacoesError) {
                console.error("Erro ao buscar intimações:", intimacoesError);
                return;
            }
            if (!activeIntimacoes) return;

            // Busca os chats em paralelo para altíssima performance (ao invés de travar linha a linha)
            const chatPromises = activeIntimacoes.map(async (intim) => {
                const { data: lastMsg } = await supabase
                    .from('chat')
                    .select('*')
                    .eq('id_intimacao', intim.id)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .maybeSingle();

                if (lastMsg && lastMsg.origem === 'intimado' && new Date(lastMsg.created_at) < new Date(fifteenMinsAgo)) {
                    return {
                        ...lastMsg,
                        intimacao: intim,
                        delay: Math.floor((Date.now() - new Date(lastMsg.created_at).getTime()) / 60000)
                    };
                }
                return null;
            });

            const timeoutResults = (await Promise.all(chatPromises)).filter(item => item !== null);

            setTimeouts(timeoutResults.sort((a, b) => b.delay - a.delay));
            setLastUpdate(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        } catch (error) {
            console.error('Erro ao buscar timeouts:', error);
        }
    };

    const fetchErrors = async () => {
        try {
            const { data, error } = await supabase
                .from('logs_erro_ia')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(20);

            if (error) throw error;
            setN8nErrors(data || []);
        } catch (error) {
            console.error('Erro ao buscar logs N8N:', error);
        }
    };

    const resolveError = async (id) => {
        try {
            const { error } = await supabase
                .from('logs_erro_ia')
                .update({ resolvido: true, resolvido_em: new Date().toISOString() })
                .eq('id', id);

            if (error) throw error;
            setN8nErrors(prev => prev.map(e => e.id === id ? { ...e, resolvido: true } : e));
            toast({ title: "Marcado como resolvido!" });
        } catch (error) {
            toast({ title: "Erro ao atualizar", variant: "destructive" });
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast({ title: "ID de Execução copiado!" });
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Monitoramento Tático da IA"
                subtitle="Vigilância de timeouts e diagnósticos de saúde da automação"
                icon={Activity}
            />

            {/* Container Principal Único (Padrão Legado) */}
            <Card className="border-border/60 bg-card/40 backdrop-blur-sm overflow-hidden shadow-xl">
                <CardContent className="p-6 space-y-8">
                    {/* Dash de Status Rápido (KPIs) */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card className="bg-amber-500/10 border-amber-500/30">
                            <CardContent className="p-4 flex flex-col gap-1">
                                <div className="text-amber-500 font-bold text-2xl">{timeouts.length}</div>
                                <div className="text-xs text-amber-600 font-medium uppercase tracking-wider">Chats Sem Resposta</div>
                            </CardContent>
                        </Card>
                        <Card className={cn("border-red-500/30 transition-all", n8nErrors.filter(e => !e.resolvido).length > 0 ? "bg-red-500/10 animate-pulse" : "bg-muted/10 opacity-50")}>
                            <CardContent className="p-4 flex flex-col gap-1">
                                <div className="text-red-500 font-bold text-2xl">{n8nErrors.filter(e => !e.resolvido).length}</div>
                                <div className="text-xs text-red-600 font-medium uppercase tracking-wider">Falhas Críticas (N8N)</div>
                            </CardContent>
                        </Card>
                        <Card className="bg-emerald-500/10 border-emerald-500/30 flex-1">
                            <CardContent className="p-4 flex flex-col gap-1">
                                <div className="text-emerald-500 font-bold text-2xl">100%</div>
                                <div className="text-xs text-emerald-600 font-medium uppercase tracking-wider">IA Engine Online</div>
                            </CardContent>
                        </Card>
                        <Button 
                            variant="outline" 
                            onClick={(e) => { e.preventDefault(); if (!loading) fetchData(); }} 
                            disabled={loading}
                            className="flex flex-col h-full gap-1 border-border/60 hover:bg-muted/50 transition-all py-3"
                        >
                            <div className="flex items-center gap-2 font-bold">
                                <RefreshCw size={16} className={loading ? "animate-spin text-primary" : ""} />
                                Forçar Verificação
                            </div>
                            <div className="text-[10px] text-muted-foreground bg-muted/50 px-2 py-0.5 rounded flex items-center gap-1 font-mono">
                                <Activity size={10} className={cn("text-emerald-500", !loading && "animate-pulse")} />
                                Monitorando: {lastUpdate || '...'}
                            </div>
                        </Button>
                    </div>

                    {/* Sistema de Abas Integrado */}
                    <div className="flex items-center gap-1 p-1 bg-muted/30 border border-border/50 rounded-xl w-fit">
                        <button
                            onClick={() => setActiveTab('timeouts')}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all",
                                activeTab === 'timeouts' 
                                    ? "bg-background text-primary shadow-sm ring-1 ring-border" 
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                            )}
                        >
                            <MessageSquare size={16} />
                            Gargalos (Timeouts)
                        </button>
                        <button
                            onClick={() => setActiveTab('errors')}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all",
                                activeTab === 'errors' 
                                    ? "bg-background text-primary shadow-sm ring-1 ring-border" 
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                            )}
                        >
                            <Bug size={16} />
                            Logs de Execução
                        </button>
                    </div>

                    {/* Conteúdo Dinâmico */}

                    {loading && (
                        <div className="py-20 flex flex-col items-center gap-4 text-muted-foreground">
                            <Loader2 className="animate-spin text-primary" size={40} />
                            <p className="text-sm font-mono tracking-widest uppercase">Varrendo sistemas corporativos...</p>
                        </div>
                    )}

                    {!loading && activeTab === 'timeouts' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {timeouts.length === 0 ? (
                                <div className="col-span-full py-20 text-center">
                                    <CheckCircle2 className="mx-auto text-emerald-500 opacity-20 mb-4" size={60} />
                                    <h3 className="text-lg font-semibold">Tudo em ordem!</h3>
                                    <p className="text-muted-foreground">Não há conversas aguardando a IA no momento.</p>
                                </div>
                            ) : (
                                timeouts.map((item) => (
                                    <Card key={item.id} className="border-l-4 border-l-amber-500 bg-card hover:shadow-md transition-shadow">
                                        <CardContent className="p-4 space-y-4">
                                            <div className="flex justify-between items-start">
                                                <div className="bg-muted px-2 py-1 rounded text-[10px] font-mono font-bold">
                                                    #{item.id_intimacao.toString().slice(-4).toUpperCase()}
                                                </div>
                                                <Badge variant="secondary" className="text-amber-600 bg-amber-100 flex gap-1 items-center">
                                                    <Clock size={12} />
                                                    {item.delay} min. atrás
                                                </Badge>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Cpu size={12} /> Última Fala (Intimado):
                                                </div>
                                                <p className="text-sm font-medium italic line-clamp-2">
                                                    "{item.mensagem}"
                                                </p>
                                            </div>
                                            <div className="pt-2 border-t border-border/50 flex justify-between items-center">
                                                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">
                                                    Requisição Silenciosa
                                                </div>
                                                <Button size="xs" variant="ghost" className="text-primary hover:bg-primary/10 gap-1 h-7 text-xs">
                                                    Resgatar Chat
                                                    <ArrowRight size={14} />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    )}

                    {!loading && activeTab === 'errors' && (
                        <div className="space-y-4">
                            {n8nErrors.length === 0 ? (
                                <div className="py-20 text-center">
                                    <Terminal className="mx-auto text-muted-foreground opacity-20 mb-4" size={60} />
                                    <p className="text-muted-foreground">Nenhum log de erro crítico registrado pelo N8N.</p>
                                </div>
                            ) : (
                                n8nErrors.map((error) => (
                                    <Card key={error.id} className={cn(
                                        "border-border/60 transition-all",
                                        error.resolvido ? "opacity-50 grayscale bg-muted/5" : "bg-card border-l-4 border-l-red-500 shadow-sm"
                                    )}>
                                        <CardContent className="p-4">
                                            <div className="flex flex-col md:flex-row gap-6">
                                                <div className="flex-1 space-y-3">
                                                    <div className="flex items-center gap-3">
                                                        <Badge variant={error.resolvido ? "secondary" : "destructive"} className="font-mono">
                                                            {error.nome_workflow || 'WORKFLOW_DESCONHECIDO'}
                                                        </Badge>
                                                        <span className="text-[11px] text-muted-foreground">{error.data_execucao}</span>
                                                    </div>
                                                    
                                                    <div className="flex items-start gap-2 p-2 bg-red-500/5 rounded-lg border border-red-500/10">
                                                        <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
                                                        <div className="text-sm font-mono text-red-700 leading-tight">
                                                            {error.mensagem_erro}
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap gap-4 text-xs">
                                                        <div className="flex items-center gap-1 text-muted-foreground">
                                                            <Cpu size={14} /> Nó: <span className="text-foreground font-semibold">{error.no_erratico}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1 text-muted-foreground">
                                                            <Clock size={14} /> Tempo: <span className="text-foreground font-semibold">{error.tempo_execucao}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1 text-muted-foreground">
                                                            <ExternalLink size={14} /> Modo: <span className="text-foreground font-semibold uppercase">{error.modo}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="w-full md:w-56 border-t md:border-t-0 md:border-l border-border/50 pt-4 md:pt-0 md:pl-6 flex flex-col gap-3 justify-center">
                                                    <div className="space-y-1">
                                                        <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">ID de Execução</div>
                                                        <div className="flex items-center justify-between p-2 bg-muted/50 rounded border border-border">
                                                            <span className="text-sm font-mono font-bold">{error.id_execucao}</span>
                                                            <Button size="xs" variant="ghost" className="h-6 w-6 p-0" onClick={() => copyToClipboard(error.id_execucao)}>
                                                                <Copy size={14} />
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    {!error.resolvido ? (
                                                        <Button 
                                                            size="sm" 
                                                            className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                                                            onClick={() => resolveError(error.id)}
                                                        >
                                                            <CheckCircle2 size={16} />
                                                            Marcar Resolvido
                                                        </Button>
                                                    ) : (
                                                        <div className="flex items-center justify-center gap-1 text-emerald-600 text-[10px] font-bold uppercase py-2">
                                                            <CheckCircle2 size={14} /> Concluído
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    )}
                    {/* Rodapé Informativo Integrado */}
                    <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 flex items-start gap-3 mt-8">
                        <Play size={20} className="text-primary mt-1" />
                        <div className="text-xs text-muted-foreground leading-relaxed">
                            <span className="font-bold text-primary mr-1">Dica técnica:</span> 
                            Para capturar falhas no painel vermelho, certifique-se de configurar o <span className="font-bold underline">Error Trigger</span> no N8N. 
                            Em caso de problemas amarelos (Timeouts), verifique se sua API de envio do Meta está com o limite excedido (Rate Limit) ou se o webhook do Meta está pausado.
                        </div>
                    </div>
                </CardContent>
            </Card>


        </div>
    );
};

export default MonitoramentoIAPage;

