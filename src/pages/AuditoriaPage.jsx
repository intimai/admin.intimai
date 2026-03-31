import React, { useState, useEffect } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { supabase } from '@/lib/customSupabaseClient';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ShieldCheck, 
  Search, 
  FileText, 
  User, 
  Clock, 
  MapPin, 
  Globe, 
  Download,
  AlertCircle,
  Loader2,
  Lock,
  Eye,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Pagination } from '@/components/ui/Pagination';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const AuditoriaPage = () => {
    const [activeTab, setActiveTab] = useState('logs'); // 'logs' ou 'lgpd'
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const { toast } = useToast();
    const [isExporting, setIsExporting] = useState(false);
    const [selectedLgpdRequest, setSelectedLgpdRequest] = useState(null);
    
    // Estados para Audit Logs
    const [auditLogs, setAuditLogs] = useState([]);
    const [auditPage, setAuditPage] = useState(1);
    const [auditTotal, setAuditTotal] = useState(0);
    const itemsPerPage = 10;

    // Estados para LGPD Requests
    const [lgpdRequests, setLgpdRequests] = useState([]);

    useEffect(() => {
        if (activeTab === 'logs') {
            fetchAuditLogs();
        } else {
            fetchLgpdRequests();
        }
    }, [activeTab, auditPage, search]);

    const fetchAuditLogs = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('audit_logs')
                .select('*', { count: 'exact' });

            if (search) {
                query = query.or(`userNome.ilike.%${search}%,userEmail.ilike.%${search}%,delegaciaNome.ilike.%${search}%`);
            }

            const { data, count, error } = await query
                .order('createdAt', { ascending: false })
                .range((auditPage - 1) * itemsPerPage, auditPage * itemsPerPage - 1);

            if (error) throw error;
            setAuditLogs(data || []);
            setAuditTotal(count || 0);
        } catch (error) {
            console.error('Erro ao buscar logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchLgpdRequests = async () => {
        setLoading(true);
        try {
            let query = supabase.from('lgpd_requests').select('*');
            
            if (search) {
                query = query.or(`nome.ilike.%${search}%,documento.ilike.%${search}%`);
            }

            const { data, error } = await query.order('created_at', { ascending: false });
            if (error) throw error;
            setLgpdRequests(data || []);
        } catch (error) {
            console.error('Erro ao buscar solicitações LGPD:', error);
        } finally {
            setLoading(false);
        }
    };

    const exportToCSV = async () => {
        setIsExporting(true);
        try {
            let dataToExport = [];
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            let defaultFilename = '';

            if (activeTab === 'logs') {
                defaultFilename = `auditoria_logs_${timestamp}.csv`;
                let query = supabase.from('audit_logs').select('*');
                if (search) query = query.or(`userNome.ilike.%${search}%,userEmail.ilike.%${search}%,delegaciaNome.ilike.%${search}%`);
                
                const { data, error } = await query.order('createdAt', { ascending: false }).limit(5000);
                if (error) throw error;
                
                dataToExport = data.map(log => ({
                    'Data/Hora': new Date(log.createdAt).toLocaleString('pt-BR'),
                    'Usuário': log.userNome || 'Sistema',
                    'Email': log.userEmail || '-',
                    'Delegacia': log.delegaciaNome || '-',
                    'Ação': log.actionType,
                    'Tipo de Recurso': log.resourceType,
                    'ID Recurso': log.resourceId || '-',
                    'IP': log.ipAddress || '-',
                    'Dispositivo': log.userAgent || '-'
                }));
            } else {
                defaultFilename = `requisicoes_lgpd_${timestamp}.csv`;
                let query = supabase.from('lgpd_requests').select('*');
                if (search) query = query.or(`nome.ilike.%${search}%,documento.ilike.%${search}%`);
                
                const { data, error } = await query.order('created_at', { ascending: false }).limit(5000);
                if (error) throw error;
                
                dataToExport = data.map(req => ({
                    'Data da Solicitação': new Date(req.created_at).toLocaleString('pt-BR'),
                    'Titular': req.nome || '-',
                    'Documento': req.documento || '-',
                    'Tipo de Solicitação': req.tipo_solicitacao || '-',
                    'Status': req.status || '-',
                    'Protocolo': req.id || '-',
                    'Detalhes Adicionais': req.comentario || '-'
                }));
            }

            if (dataToExport.length === 0) {
                toast({ title: "Aviso", description: "Não há dados para exportar com os filtros atuais.", variant: "destructive" });
                return;
            }

            // Converter para CSV string
            const headers = Object.keys(dataToExport[0]).join(';');
            const rows = dataToExport.map(row => 
                Object.values(row).map(val => `"${String(val || '').replace(/"/g, '""')}"`).join(';')
            ).join('\n');
            const csvContent = `${headers}\n${rows}`;
            const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' }); // \uFEFF força UTF-8 com BOM no Excel

            // Usar a File System Access API caso seja suportada no browser (Chrome/Edge/Safari desktop moderno)
            if (window.showSaveFilePicker) {
                try {
                    const handle = await window.showSaveFilePicker({
                        suggestedName: defaultFilename,
                        types: [{ description: 'Arquivo CSV', accept: { 'text/csv': ['.csv'] } }],
                    });
                    const writable = await handle.createWritable();
                    await writable.write(blob);
                    await writable.close();
                    
                    toast({ title: "Sucesso!", description: "Arquivo salvo com sucesso no diretório escolhido." });
                    return; // Sai se deu certo
                } catch (err) {
                    if (err.name === 'AbortError') return; // Usuário cancelou
                    console.error("FilePicker API falhou, caindo para modo tradicional:", err);
                }
            }

            // Fallback: Modo tradicional (baixa com o nome sugerido direto nos Downloads)
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = defaultFilename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            toast({ title: "Download Iniciado", description: "O arquivo CSV foi salvo." });

        } catch (error) {
            console.error('Erro na exportação:', error);
            toast({ title: "Erro na Exportação", description: "Não foi possível gerar seu arquivo. Tente novamente.", variant: "destructive" });
        } finally {
            setIsExporting(false);
        }
    };

    const getActionBadge = (type) => {
        const types = {
            'LOGIN': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
            'VIEW': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
            'EXPORT': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
            'DELETE': 'bg-red-500/10 text-red-500 border-red-500/20',
            'UPDATE': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
        };
        return types[type] || 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20';
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Governança & Auditoria LGPD"
                subtitle="Rastreabilidade total de acessos e gestão de privacidade"
                icon={ShieldCheck}
            />

            <Card className="border-border/60 bg-card/40 backdrop-blur-sm overflow-hidden">
                <CardContent className="p-6 space-y-6">
                    {/* Sistema de Abas Integrado */}
                    <div className="flex items-center gap-1 p-1 bg-muted/30 border border-border/50 rounded-xl w-fit">
                        <button
                            onClick={() => setActiveTab('logs')}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all",
                                activeTab === 'logs' 
                                    ? "bg-background text-primary shadow-sm ring-1 ring-border" 
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                            )}
                        >
                            <Clock size={16} />
                            Trilha de Acessos
                        </button>
                        <button
                            onClick={() => setActiveTab('lgpd')}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all",
                                activeTab === 'lgpd' 
                                    ? "bg-background text-primary shadow-sm ring-1 ring-border" 
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                            )}
                        >
                            <Lock size={16} />
                            Solicitações de Titulares
                        </button>
                    </div>

                    {/* Filtros Integrados */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                            <Input
                                placeholder={activeTab === 'logs' ? "Buscar por Policial ou Delegacia..." : "Buscar por Nome ou Documento..."}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 bg-background/50 border-border/60 focus:border-primary/50"
                            />
                        </div>
                        <Button variant="outline" className="gap-2 border-border/60" onClick={exportToCSV} disabled={isExporting}>
                            {isExporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                            {isExporting ? "Gerando Relatório..." : "Exportar Relatório"}
                        </Button>
                    </div>

                    {/* Tabela de Dados */}
                    <div className="border border-border/40 rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-border/60 bg-muted/20">
                                        {activeTab === 'logs' ? (
                                            <>
                                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Usuário / Origem</th>
                                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ação</th>
                                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Recurso</th>
                                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">IP / Dispositivo</th>
                                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Data/Hora</th>
                                            </>
                                        ) : (
                                            <>
                                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Titular</th>
                                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Solicitação</th>
                                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Data</th>
                                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Ação</th>
                                            </>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/40">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                                                <div className="flex flex-col items-center gap-2">
                                                    <Loader2 className="animate-spin text-primary" size={32} />
                                                    <span className="text-sm">Consultando registros seguros...</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : activeTab === 'logs' ? (
                                        auditLogs.length > 0 ? auditLogs.map((log) => (
                                            <tr key={log.id} className="hover:bg-muted/10 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                            {log.userNome?.charAt(0).toUpperCase() || '?'}
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-semibold">{log.userNome}</div>
                                                            <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                                                                <MapPin size={10} />
                                                                {log.delegaciaNome}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge className={cn("text-[10px] font-bold border", getActionBadge(log.actionType))}>
                                                        {log.actionType}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium">{log.resourceType}</div>
                                                    <div className="text-[11px] text-muted-foreground">ID: {log.resourceId}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-0.5">
                                                        <div className="text-sm font-mono flex items-center gap-1.5">
                                                            <Globe size={12} className="text-muted-foreground" />
                                                            {log.ipAddress}
                                                        </div>
                                                        <div className="text-[10px] text-muted-foreground truncate max-w-[150px]">
                                                            {log.userAgent}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="text-sm font-medium">
                                                        {new Date(log.createdAt).toLocaleDateString('pt-BR')}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {new Date(log.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                                                    <FileText className="mx-auto mb-2 opacity-20" size={40} />
                                                    <p>Nenhum log de auditoria encontrado para esta busca.</p>
                                                </td>
                                            </tr>
                                        )
                                    ) : (
                                        lgpdRequests.length > 0 ? lgpdRequests.map((req) => (
                                            <tr key={req.id} className="hover:bg-muted/10 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-semibold">{req.nome}</div>
                                                    <div className="text-[11px] text-muted-foreground font-mono">{req.documento}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium">{req.tipo_solicitacao}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge variant={req.status === 'pendente' ? 'outline' : 'default'} className="text-[10px]">
                                                        {req.status?.toUpperCase()}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm">
                                                        {new Date(req.created_at).toLocaleDateString('pt-BR')}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Button size="sm" variant="ghost" className="h-8 px-2 group-hover:bg-primary/20 group-hover:text-primary" onClick={() => setSelectedLgpdRequest(req)}>
                                                        <Eye size={16} />
                                                    </Button>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                                                    <Lock className="mx-auto mb-2 opacity-20" size={40} />
                                                    <p>Nenhuma solicitação de titular aberta no momento.</p>
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {activeTab === 'logs' && auditTotal > itemsPerPage && (
                            <div className="p-4 border-t border-border/40 bg-muted/10">
                                <Pagination
                                    currentPage={auditPage}
                                    totalItems={auditTotal}
                                    itemsPerPage={itemsPerPage}
                                    totalPages={Math.ceil(auditTotal / itemsPerPage)}
                                    onPageChange={setAuditPage}
                                    onNextPage={() => setAuditPage(prev => prev + 1)}
                                    onPreviousPage={() => setAuditPage(prev => prev - 1)}
                                    hasNextPage={auditPage < Math.ceil(auditTotal / itemsPerPage)}
                                    hasPreviousPage={auditPage > 1}
                                />
                            </div>
                        )}
                    </div>

                    {/* Cards Informativos Integrados */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-border/40">
                        <Card className="border-border/60 bg-primary/5">
                            <CardContent className="p-4 flex flex-col gap-2">
                                <div className="p-2 w-fit rounded-lg bg-primary/20 text-primary">
                                    <Lock size={20} />
                                </div>
                                <div className="text-sm font-semibold">Integridade LGPD</div>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Todos os dados são anonimizados nos relatórios externos. O ID da transação serve como ponte segura para a Corregedoria.
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="border-border/60 bg-emerald-500/5">
                            <CardContent className="p-4 flex flex-col gap-2">
                                <div className="p-2 w-fit rounded-lg bg-emerald-500/20 text-emerald-500">
                                    <ShieldCheck size={20} />
                                </div>
                                <div className="text-sm font-semibold">Criptografia de Ponta</div>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Logs de acesso são imutáveis e protegidos por Row Level Security no Supabase.
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="border-border/60 bg-amber-500/5">
                            <CardContent className="p-4 flex flex-col gap-2">
                                <div className="p-2 w-fit rounded-lg bg-amber-500/20 text-amber-500">
                                    <AlertCircle size={20} />
                                </div>
                                <div className="text-sm font-semibold">Aviso de Auditoria</div>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Relatórios de exportação são registrados automaticamente nesta mesma trilha para controle interno.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </CardContent>
            </Card>

            {/* Modal de Detalhes da Solicitação LGPD */}
            <Dialog open={!!selectedLgpdRequest} onOpenChange={(open) => !open && setSelectedLgpdRequest(null)}>
                <DialogContent className="sm:max-w-[600px] border-border/60 bg-card/95 backdrop-blur-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <Lock className="text-primary" size={24} /> 
                            Detalhes da Solicitação LGPD
                        </DialogTitle>
                        <DialogDescription>
                            Visualizando dados sensíveis conforme Lei 13.709/2018. Protocolo de acesso registrado.
                        </DialogDescription>
                    </DialogHeader>
                    
                    {selectedLgpdRequest && (
                        <div className="space-y-6 pt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Titular dos Dados</div>
                                    <div className="text-sm font-medium">{selectedLgpdRequest.nome || '-'}</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Documento</div>
                                    <div className="text-sm font-mono bg-muted/30 p-1.5 w-fit rounded border border-border/40">{selectedLgpdRequest.documento || '-'}</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Tipo de Solicitação</div>
                                    <Badge variant="outline" className="text-primary border-primary/20">{selectedLgpdRequest.tipo_solicitacao || '-'}</Badge>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Status Atual</div>
                                    <Badge variant={selectedLgpdRequest.status === 'pendente' ? 'outline' : 'default'} className="uppercase">
                                        {selectedLgpdRequest.status || '-'}
                                    </Badge>
                                </div>
                                <div className="space-y-1 col-span-2">
                                    <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Comentário/Justificativa</div>
                                    <div className="text-sm p-3 bg-muted/20 border border-border/40 rounded-lg min-h-[60px]">
                                        {selectedLgpdRequest.comentario || 'Nenhum comentário fornecido pelo titular.'}
                                    </div>
                                </div>
                                <div className="space-y-1 col-span-2 flex items-center justify-between">
                                    <div>
                                        <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Criado em</div>
                                        <div className="text-sm">
                                            {new Date(selectedLgpdRequest.created_at).toLocaleString('pt-BR')}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Protocolo</div>
                                        <div className="text-xs font-mono opacity-60">
                                            {selectedLgpdRequest.id}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-border/60">
                                <Button variant="outline" onClick={() => setSelectedLgpdRequest(null)}>
                                    Fechar Janela
                                </Button>
                                {/* Exemplo de botão no futuro caso atenda o chamado por aqui */}
                                <Button variant="default" className="gap-2">
                                    <ShieldCheck size={16} />
                                    Atender Solicitação
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

        </div>
    );
};

export default AuditoriaPage;

