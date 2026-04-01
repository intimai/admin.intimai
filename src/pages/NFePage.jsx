import React, { useState, useRef } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { useNotasFiscais } from '@/hooks/useNotasFiscais';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import {
  Receipt, Upload, Loader2, Plus, Search, ExternalLink, Trash2,
  FileUp, AlertCircle, CheckCircle2, Clock, XCircle, Building2
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

const STATUS_MAP = {
  pendente: { label: 'Pendente', icon: Clock, color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  enviada: { label: 'Enviada', icon: CheckCircle2, color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  paga: { label: 'Paga', icon: CheckCircle2, color: 'bg-green-500/10 text-green-400 border-green-500/20' },
  cancelada: { label: 'Cancelada', icon: XCircle, color: 'bg-red-500/10 text-red-400 border-red-500/20' },
};

const NFePage = () => {
  const { notas, delegacias, loading, uploading, fetchNotas, uploadNota, updateStatus, deleteNota } = useNotasFiscais();
  const { toast } = useToast();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deletingNota, setDeletingNota] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Filtros
  const [delegaciaFilter, setDelegaciaFilter] = useState('todas');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    delegaciaId: '',
    numero_nf: '',
    valor: '',
    data_emissao: '',
    descricao: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFilterChange = (type, value) => {
    if (type === 'delegacia') {
      setDelegaciaFilter(value);
      fetchNotas({ delegaciaId: value, status: statusFilter });
    } else {
      setStatusFilter(value);
      fetchNotas({ delegaciaId: delegaciaFilter, status: value });
    }
  };

  const filteredNotas = notas.filter(n =>
    n.numero_nf?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.delegacia_nome?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (file) => {
    if (!file) return;
    const allowed = ['application/pdf', 'text/xml', 'application/xml'];
    if (!allowed.includes(file.type) && !file.name.endsWith('.xml')) {
      toast({ title: "Formato inválido", description: "Apenas PDF ou XML são aceitos.", variant: "destructive" });
      return;
    }
    setSelectedFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    handleFileSelect(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile || !formData.delegaciaId || !formData.numero_nf) {
      toast({ title: "Campos obrigatórios", description: "Selecione delegacia, número da NF e arquivo.", variant: "destructive" });
      return;
    }

    const delegacia = delegacias.find(d => d.delegaciaId === formData.delegaciaId);
    const result = await uploadNota({
      file: selectedFile,
      delegaciaId: formData.delegaciaId,
      numero_nf: formData.numero_nf,
      valor: formData.valor,
      data_emissao: formData.data_emissao,
      descricao: formData.descricao
    });

    if (result.success) {
      setIsCreateOpen(false);
      setFormData({ delegaciaId: '', numero_nf: '', valor: '', data_emissao: '', descricao: '' });
      setSelectedFile(null);
    }
  };

  const handleDelete = async () => {
    if (!deletingNota) return;
    setActionLoading(true);
    await deleteNota(deletingNota);
    setActionLoading(false);
    setDeletingNota(null);
  };

  const formatCurrency = (val) => {
    if (!val && val !== 0) return '—';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try { return new Date(dateStr).toLocaleDateString('pt-BR'); } catch { return dateStr; }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Notas Fiscais"
        description="Gestão e controle de notas fiscais emitidas para delegacias parceiras."
        action={
          <Button className="gap-2 shadow-sm" onClick={() => setIsCreateOpen(true)}>
            <Plus size={16} /> Subir NF-e
          </Button>
        }
      />

      <Card className="bg-card/90 border-border/40 overflow-hidden shadow-xl backdrop-blur-md">
        <CardContent className="p-6 space-y-6">
          {/* Filtros */}
          <div className="flex flex-col md:flex-row gap-4 items-end md:items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por número da NF ou delegacia..."
                className="pl-10 h-10 bg-background/50 border-border/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <Select value={delegaciaFilter} onValueChange={(v) => handleFilterChange('delegacia', v)}>
                <SelectTrigger className="h-10 bg-background/50 border-border/50 w-full sm:w-48 text-xs">
                  <SelectValue placeholder="Delegacia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as Delegacias</SelectItem>
                  {delegacias.map(d => (
                    <SelectItem key={d.delegaciaId} value={d.delegaciaId}>{d.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={(v) => handleFilterChange('status', v)}>
                <SelectTrigger className="h-10 bg-background/50 border-border/50 w-full sm:w-40 text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Status</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="enviada">Enviada</SelectItem>
                  <SelectItem value="paga">Paga</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tabela de NFs */}
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-primary opacity-50" />
            </div>
          ) : filteredNotas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground bg-muted/10 rounded-xl border border-dashed border-border/50">
              <Receipt className="h-16 w-16 mb-4 opacity-10" />
              <p className="text-lg font-medium">Nenhuma nota fiscal encontrada.</p>
              <p className="text-sm opacity-60 text-center max-w-xs mt-2">
                Clique em "Suber NF-e" para registrar sua primeira nota fiscal.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 text-muted-foreground text-[11px] uppercase tracking-wider">
                    <th className="text-left py-3 px-3 font-semibold">Número</th>
                    <th className="text-left py-3 px-3 font-semibold">Delegacia</th>
                    <th className="text-left py-3 px-3 font-semibold">Emissão</th>
                    <th className="text-left py-3 px-3 font-semibold">Valor</th>
                    <th className="text-left py-3 px-3 font-semibold">Status</th>
                    <th className="text-center py-3 px-3 font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNotas.map((nf) => {
                    const statusInfo = STATUS_MAP[nf.status] || STATUS_MAP.pendente;
                    const StatusIcon = statusInfo.icon;
                    return (
                      <tr key={nf.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <Receipt size={14} className="text-primary/60 shrink-0" />
                            <span className="font-semibold text-foreground">{nf.numero_nf}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5">
                            <Building2 size={12} className="text-muted-foreground/50" />
                            <span className="text-muted-foreground truncate max-w-[180px]">{nf.delegacia_nome || '—'}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-muted-foreground text-xs">
                          {formatDate(nf.data_emissao)}
                        </td>
                        <td className="py-3 px-3 font-mono text-foreground font-medium text-xs">
                          {formatCurrency(nf.valor)}
                        </td>
                        <td className="py-3 px-3">
                          <Select
                            value={nf.status}
                            onValueChange={(v) => updateStatus(nf.id, v)}
                          >
                            <SelectTrigger className={cn("h-7 w-[120px] text-[10px] font-semibold uppercase border rounded-full px-2.5", statusInfo.color)}>
                              <div className="flex items-center gap-1">
                                <StatusIcon size={10} />
                                <SelectValue />
                              </div>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pendente">Pendente</SelectItem>
                              <SelectItem value="enviada">Enviada</SelectItem>
                              <SelectItem value="paga">Paga</SelectItem>
                              <SelectItem value="cancelada">Cancelada</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center justify-center gap-1">
                            {nf.arquivo_url && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-primary"
                                onClick={() => window.open(nf.arquivo_url, '_blank')}
                                title="Visualizar PDF"
                              >
                                <ExternalLink size={14} />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              onClick={() => setDeletingNota(nf)}
                              title="Excluir NF-e"
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Nova NF-e */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt size={20} className="text-primary" />
              Registrar Nota Fiscal
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Delegacia *</Label>
              <Select value={String(formData.delegaciaId)} onValueChange={(v) => setFormData(p => ({ ...p, delegaciaId: v }))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione a delegacia" />
                </SelectTrigger>
                <SelectContent>
                  {delegacias.map(d => (
                    <SelectItem key={d.delegaciaId} value={String(d.delegaciaId)}>{d.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Número da NF *</Label>
                <Input
                  name="numero_nf"
                  value={formData.numero_nf}
                  onChange={handleFormChange}
                  placeholder="Ex: NF-001234"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Valor (R$)</Label>
                <Input
                  name="valor"
                  type="number"
                  step="0.01"
                  value={formData.valor}
                  onChange={handleFormChange}
                  placeholder="0,00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Data de Emissão</Label>
              <Input
                name="data_emissao"
                type="date"
                value={formData.data_emissao}
                onChange={handleFormChange}
              />
            </div>

            <div className="space-y-2">
              <Label>Descrição / Observações</Label>
              <Textarea
                name="descricao"
                value={formData.descricao}
                onChange={handleFormChange}
                placeholder="Detalhes opcionais sobre a nota fiscal..."
                className="min-h-[60px] resize-none"
              />
            </div>

            {/* Upload Area */}
            <div className="space-y-2">
              <Label>Arquivo (PDF ou XML) *</Label>
              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200",
                  isDragOver
                    ? "border-primary bg-primary/5 scale-[1.01]"
                    : selectedFile
                      ? "border-green-500/40 bg-green-500/5"
                      : "border-border/50 bg-muted/10 hover:border-primary/40 hover:bg-muted/20"
                )}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.xml"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e.target.files?.[0])}
                />
                {selectedFile ? (
                  <div className="flex flex-col items-center gap-2">
                    <CheckCircle2 size={24} className="text-green-500" />
                    <span className="text-sm font-medium text-foreground">{selectedFile.name}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {(selectedFile.size / 1024).toFixed(1)} KB • Clique para trocar
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <FileUp size={28} className="text-muted-foreground/40" />
                    <span className="text-sm text-muted-foreground">
                      Arraste o arquivo ou <span className="text-primary font-medium">clique para selecionar</span>
                    </span>
                    <span className="text-[10px] text-muted-foreground/60">PDF ou XML • Máx 10MB</span>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={uploading} className="gap-2">
                {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                {uploading ? 'Enviando...' : 'Subir NF-e'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmationModal
        isOpen={!!deletingNota}
        onClose={() => setDeletingNota(null)}
        onConfirm={handleDelete}
        title="Excluir Nota Fiscal"
        isLoading={actionLoading}
      >
        <p className="text-sm text-gray-300">
          Tem certeza que deseja excluir a NF-e <strong>{deletingNota?.numero_nf}</strong>?
          Esta ação não pode ser desfeita.
        </p>
      </ConfirmationModal>
    </div>
  );
};

export default NFePage;
