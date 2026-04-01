import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import PageHeader from '@/components/ui/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
    Tabs, TabsContent, TabsList, TabsTrigger
} from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import {
    Wifi, WifiOff, Plus, RefreshCw, MessageSquare, ShieldCheck,
    Loader2, Clock, CheckCircle2, XCircle, AlertTriangle, Smartphone,
    KeyRound, Settings, Link2Off, Search, MapPin, User
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Status Helpers ───────────────────────────────────────────────────────────
const NAME_STATUS = {
    APPROVED: { label: 'Nome Aprovado', iconColor: 'text-emerald-400', bg: 'bg-emerald-500/5 border-emerald-500/10', icon: CheckCircle2 },
    PENDING: { label: 'Aguard. Aprovação', iconColor: 'text-amber-400', bg: 'bg-amber-500/5 border-amber-500/10', icon: Clock },
    DECLINED: { label: 'Nome Reprovado', iconColor: 'text-red-400', bg: 'bg-red-500/5 border-red-500/10', icon: XCircle },
    NONE: { label: 'Pendente', iconColor: 'text-zinc-400', bg: 'bg-zinc-500/5 border-zinc-500/10', icon: Clock },
};
const VERIFY_STATUS = {
    VERIFIED: { label: 'Verificado', iconColor: 'text-emerald-400', icon: ShieldCheck },
    NOT_VERIFIED: { label: 'Não Verificado', iconColor: 'text-amber-400', icon: AlertTriangle },
    EXPIRED: { label: 'Verificação Expirada', iconColor: 'text-red-400', icon: XCircle },
};
const QUALITY = {
    GREEN: 'bg-emerald-500',
    YELLOW: 'bg-amber-500',
    RED: 'bg-red-500',
    UNKNOWN: 'bg-zinc-500',
};

function getConnectionStatus(phone) {
    if (phone.status === 'CONNECTED') return 'connected';
    const nameOk = phone.name_status === 'APPROVED';
    const verified = phone.code_verification_status === 'VERIFIED';
    if (nameOk && verified) return 'connected';
    if (!verified) return 'needs_verification';
    if (!nameOk) return 'pending_name';
    return 'connected';
}

// ─── Card de Instância ────────────────────────────────────────────────────────
const InstanceCard = ({ phone, delegaciaNome, customName, onRequestOtp, onVerifyOtp, onRefresh, onEdit, refreshing, onResetOtp, onUnlink }) => {
    const connStatus = getConnectionStatus(phone);
    const otpSent = phone.local_otp_sent;
    const nameInfo = NAME_STATUS[phone.name_status] || NAME_STATUS.NONE;
    const verifyInfo = VERIFY_STATUS[phone.code_verification_status] || VERIFY_STATUS.NOT_VERIFIED;
    const NameIcon = nameInfo.icon;
    const VerifyIcon = verifyInfo.icon;

    // Fonte da Verdade: Nome da Delegacia ou Nome Customizado Interno
    const mainTitle = delegaciaNome || customName || phone.verified_name || 'Número sem nome';
    const isMainTitleDifferent = mainTitle !== phone.verified_name;

    return (
        <Card className={cn(
            'border transition-all duration-300 overflow-hidden group flex flex-col',
            connStatus === 'connected'
                ? 'border-emerald-500/30 bg-emerald-500/5 shadow-emerald-500/5 shadow-lg'
                : otpSent
                    ? 'border-primary/30 bg-primary/5 shadow-primary/5 shadow-md'
                    : 'border-border/50 bg-card'
        )}>
            {/* Top Bar Lateral (Ícones Isolados à Direita) */}
            <div className="flex items-center justify-end px-4 pt-4 pb-3 h-[38px]">
                <div className="flex items-center gap-0.5">
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground transition-colors" onClick={() => onEdit(phone)} title="Configurações e Correção">
                        <Settings size={13} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground transition-colors" onClick={() => onRefresh(phone.id)} disabled={refreshing === phone.id} title="Atualizar status">
                        <RefreshCw size={13} className={refreshing === phone.id ? 'animate-spin' : ''} />
                    </Button>
                    {(delegaciaNome || customName) && (
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-red-400 transition-colors" onClick={() => onUnlink(phone.id, mainTitle)} title="Desvincular">
                            <Link2Off size={13} />
                        </Button>
                    )}
                </div>
            </div>

            <div className="px-5 pb-5 flex flex-col gap-3">
                {/* Ícone e Textos Básicos */}
                <div className="flex items-start gap-4">
                    <div className={cn(
                        'h-12 w-12 rounded-xl flex items-center justify-center shrink-0 transition-all mt-1',
                        connStatus === 'connected' ? 'bg-emerald-500/20 text-emerald-400'
                            : otpSent ? 'bg-primary/20 text-primary'
                                : 'bg-zinc-500/20 text-zinc-400'
                    )}>
                        {connStatus === 'connected' ? <Wifi size={22} /> : otpSent ? <KeyRound size={22} className="text-primary" /> : <WifiOff size={22} />}
                    </div>

                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-foreground break-words leading-snug">
                            {mainTitle}
                        </h3>
                        {isMainTitleDifferent && (
                            <p className="text-xs text-muted-foreground mt-1 break-words leading-tight">
                                Meta: <span className="text-foreground/80">{phone.verified_name}</span>
                            </p>
                        )}
                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                            <p className="text-[11px] text-muted-foreground font-mono whitespace-nowrap">
                                {phone.display_phone_number || `ID: ${phone.id}`}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Linha Reservada para Tags de Nome e Número (Colunas travadas) */}
                <div className="grid grid-cols-2 gap-2 mt-1 min-h-[26px]">
                    <span className="flex items-center justify-start gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded-md border border-border/40 text-muted-foreground bg-background/50 h-[26px] overflow-hidden">
                        <NameIcon size={12} className={cn(nameInfo.iconColor, "shrink-0")} />
                        <span className="truncate">{nameInfo.label}</span>
                    </span>

                    {phone.code_verification_status !== 'VERIFIED' ? (
                        <span className="flex items-center justify-start gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded-md border border-border/40 text-muted-foreground bg-background/50 h-[26px] overflow-hidden">
                            <VerifyIcon size={12} className={cn(verifyInfo.iconColor, "shrink-0")} />
                            <span className="truncate">{verifyInfo.label}</span>
                        </span>
                    ) : (
                        <div className="h-[26px]"></div>
                    )}
                </div>

                {/* Linha Inferior com a Tag Conectado isolada */}
                {connStatus === 'connected' && (
                    <div className="flex items-center justify-start mt-0.5">
                        <Badge className="text-[10px] bg-emerald-500/20 text-emerald-400 border-emerald-500/20 py-0 h-[22px] font-semibold uppercase tracking-wider">
                            Conectado
                        </Badge>
                    </div>
                )}

                {/* Botão de Corrida de Nome Minimalista (Neutro) */}
                {phone.name_status === 'DECLINED' && connStatus !== 'connected' && (
                    <Button size="sm" variant="outline" className="w-full text-[11px] h-8 mt-1 font-medium text-muted-foreground hover:bg-background/80 hover:text-foreground transition-all" onClick={() => onEdit(phone)}>
                        <Settings size={12} className="mr-2" /> Corrigir Nome na Meta
                    </Button>
                )}
            </div>

            {/* Action area (só aparece se НЕ estiver conectado) */}
            {connStatus !== 'connected' && phone.code_verification_status !== 'VERIFIED' && (
                <div className="px-5 pb-5 pt-3 border-t border-border/30 bg-background/20 mt-1">
                    {otpSent ? (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-bold text-primary flex items-center gap-1.5 uppercase tracking-wider">
                                        <ShieldCheck size={12} /> SMS já enviado
                                    </p>
                                    <p className="text-[10px] text-muted-foreground/60 italic">
                                        Clique abaixo para inserir o código.
                                    </p>
                                </div>
                                <Button
                                    variant="ghost" size="sm" className="h-6 text-[10px] text-muted-foreground hover:text-red-400"
                                    onClick={() => onResetOtp(phone.id)}
                                    title="Tentar outro método"
                                >
                                    Reiniciar
                                </Button>
                            </div>
                            <Button
                                className="w-full bg-primary hover:bg-primary/90 text-white font-semibold h-9 shadow-md shadow-primary/10"
                                onClick={() => onVerifyOtp(phone.id)}
                            >
                                <KeyRound size={14} className="mr-2" /> Inserir código
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <p className="text-[11px] text-muted-foreground/60 flex items-center gap-1.5 font-medium italic">
                                <AlertTriangle size={12} /> Verificação OTP pendente
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    size="sm" variant="outline"
                                    className="text-xs h-8 border-border/60 text-muted-foreground hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all flex-1"
                                    onClick={() => onRequestOtp(phone.id, 'SMS')}
                                >
                                    <Smartphone size={12} className="mr-1.5" /> Enviar SMS
                                </Button>
                                <Button
                                    size="sm" variant="outline"
                                    className="text-xs h-8 border-border/60 text-muted-foreground hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all flex-1"
                                    onClick={() => onRequestOtp(phone.id, 'VOICE')}
                                >
                                    Ligar (Voz)
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </Card>
    );
};

// ─── Modal: Inserir OTP ────────────────────────────────────────────────────────
const OtpModal = ({ open, phoneId, onClose, onSuccess, onReset }) => {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (code.length !== 6) return;
        setLoading(true);
        try {
            const resp = await fetch('/api/meta/verify_code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone_id: phoneId, code: code.trim() })
            });
            if (!resp.ok) {
                const data = await resp.json();
                throw new Error(data.error || 'Código inválido');
            }
            toast({ title: '✅ Conectado!', description: 'Número verificado com sucesso.' });
            onSuccess();
            onClose();
        } catch (err) {
            toast({ title: 'Erro', description: err.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(o) => { if (!o) { setCode(''); onClose(); } }}>
            <DialogContent className="sm:max-w-[380px] border-border/60 bg-card/95 backdrop-blur-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <KeyRound size={18} className="text-primary" /> Verificação do Código
                    </DialogTitle>
                    <DialogDescription>
                        Digite o código de 6 dígitos enviado pela Meta.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <Input
                        placeholder="000 000"
                        value={code}
                        onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="text-center text-3xl font-mono tracking-[0.3em] h-14 bg-background/50 border-border/50 focus:border-primary"
                        maxLength={6}
                        autoFocus
                    />
                    <div className="flex flex-col gap-2 pt-2">
                        <Button type="submit" disabled={loading || code.length !== 6} className="bg-primary hover:bg-primary/90 text-white w-full h-11">
                            {loading ? <Loader2 size={16} className="mr-2 animate-spin" /> : <ShieldCheck size={16} className="mr-2" />}
                            Confirmar Código
                        </Button>
                        <div className="flex items-center justify-between px-1">
                            <Button type="button" variant="ghost" className="text-xs text-muted-foreground hover:text-foreground h-8" onClick={onClose}>Mais tarde</Button>
                            <Button
                                type="button" variant="ghost"
                                className="text-xs text-muted-foreground hover:text-red-400 h-8"
                                onClick={() => { onReset(phoneId); onClose(); }}
                            >
                                Reiniciar processo
                            </Button>
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

// ─── Modal: Nova Instância ───────────────────────────────────────────────────
const NovaInstanciaModal = ({ open, onClose, delegacias, wabas, onSuccess }) => {
    const [form, setForm] = useState({ type: 'DELEGACIA', waba_id: '', delegacia_id: '', phone_number: '', verified_name: '', custom_name: '' });
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const availableDelegacias = delegacias.filter(d => !d.whatsappPhoneNumberId);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.waba_id) return toast({ title: 'Aviso', description: 'Selecione a conta WABA.', variant: 'destructive' });
        if (!form.phone_number || !form.verified_name) return;
        if (form.type === 'DELEGACIA' && !form.delegacia_id) return toast({ title: 'Aviso', description: 'Selecione a delegacia.', variant: 'destructive' });
        if (form.type === 'INTERNAL' && !form.custom_name) return toast({ title: 'Aviso', description: 'Preencha o nome interno.', variant: 'destructive' });

        setLoading(true);
        try {
            const resp = await fetch('/api/meta/phone_numbers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            const data = await resp.json();
            if (!resp.ok) throw new Error(data.error || 'Erro ao criar instância');
            toast({ title: 'Número adicionado!', description: 'Aguarde a aprovação do nome pela Meta.' });
            onSuccess();
            onClose();
        } catch (err) {
            toast({ title: 'Erro', description: err.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(o) => { if (!o) { setForm({ type: 'DELEGACIA', waba_id: '', delegacia_id: '', phone_number: '', verified_name: '', custom_name: '' }); onClose(); } }}>
            <DialogContent className="sm:max-w-[480px] border-border/60 bg-card/95 backdrop-blur-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Plus size={18} className="text-primary" /> Nova Conexão Meta
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    <div className="space-y-2">
                        <Label>Conta WABA (<span className="text-primary">Origem</span>)</Label>
                        <Select value={form.waba_id} onValueChange={v => setForm(f => ({ ...f, waba_id: v }))}>
                            <SelectTrigger className="bg-background/50 border-primary/20">
                                <SelectValue placeholder="Selecione o WABA..." />
                            </SelectTrigger>
                            <SelectContent>
                                {wabas.map(w => (
                                    <SelectItem key={w.waba_id} value={w.waba_id}>{w.name}</SelectItem>
                                ))}
                                {wabas.length === 0 && (
                                    <div className="p-2 text-xs text-muted-foreground text-center">Nenhum WABA cadastrado no sistema.</div>
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Destinação da Instância</Label>
                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                type="button" variant={form.type === 'DELEGACIA' ? 'default' : 'outline'}
                                className="h-9 transition-all text-xs border-border/60"
                                onClick={() => setForm(f => ({ ...f, type: 'DELEGACIA', custom_name: '' }))}
                            >
                                <MapPin size={14} className="mr-2" /> Delegacia
                            </Button>
                            <Button
                                type="button" variant={form.type === 'INTERNAL' ? 'default' : 'outline'}
                                className="h-9 transition-all text-xs border-border/60"
                                onClick={() => setForm(f => ({ ...f, type: 'INTERNAL', delegacia_id: '' }))}
                            >
                                <Wifi size={14} className="mr-2" /> Uso Interno
                            </Button>
                        </div>
                    </div>

                    {form.type === 'DELEGACIA' && (
                        <div className="space-y-2">
                            <Label>Vincular Delegacia</Label>
                            <Select value={form.delegacia_id} onValueChange={v => setForm(f => ({ ...f, delegacia_id: v }))}>
                                <SelectTrigger className="bg-background/50">
                                    <SelectValue placeholder="Selecione uma delegacia livre..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableDelegacias.map(d => (
                                        <SelectItem key={d.delegaciaId} value={d.delegaciaId}>{d.nome}</SelectItem>
                                    ))}
                                    {availableDelegacias.length === 0 && (
                                        <div className="p-2 text-xs text-muted-foreground text-center">Nenhuma delegacia disponível (sem número).</div>
                                    )}
                                </SelectContent>
                            </Select>
                            <p className="text-[10px] text-muted-foreground italic">Apenas delegacias que não possuem WhatsApp aparecem aqui.</p>
                        </div>
                    )}

                    {form.type === 'INTERNAL' && (
                        <div className="space-y-2">
                            <Label>Identificação Interna</Label>
                            <Input
                                placeholder="Ex: Comercial Principal"
                                value={form.custom_name}
                                onChange={e => setForm(f => ({ ...f, custom_name: e.target.value }))}
                                className="bg-background/50"
                                required={form.type === 'INTERNAL'}
                            />
                            <p className="text-[10px] text-muted-foreground italic">O nome que aparecerá como principal na nossa interface.</p>
                        </div>
                    )}

                    <div className="space-y-2 pt-2">
                        <Label>Número (+55...)</Label>
                        <Input
                            placeholder="+55 11 99999-9999"
                            value={form.phone_number}
                            onChange={e => setForm(f => ({ ...f, phone_number: e.target.value }))}
                            className="bg-background/50 font-mono"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Nome de Registo Oficial</Label>
                        <Input
                            placeholder="Ex: Delegacia SP Centro"
                            value={form.verified_name}
                            onChange={e => setForm(f => ({ ...f, verified_name: e.target.value }))}
                            className="bg-background/50"
                            required
                        />
                        <p className="text-[10px] text-muted-foreground italic text-right">O nome enviado para aprovação da Meta.</p>
                    </div>
                    <DialogFooter className="pt-2">
                        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 size={14} className="mr-2 animate-spin" />}
                            Criar Instância
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

// ─── Modal: Editar Perfil e Nome ───────────────────────────────────────────
const EditProfileModal = ({ phone, open, onClose, onSuccess }) => {
    const [name, setName] = useState('');
    const [profile, setProfile] = useState({
        about: '',
        address: '',
        description: '',
        email: '',
        websites: [''],
        vertical: 'UNDEFINED'
    });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('name');
    const { toast } = useToast();

    const fetchProfile = useCallback(async () => {
        if (!phone?.id) return;
        setLoading(true);
        try {
            const resp = await fetch(`/api/meta/profile/${phone.id}`);
            const data = await resp.json();
            if (resp.ok && data.data?.[0]) {
                const p = data.data[0];
                setProfile({
                    about: p.about || '',
                    address: p.address || '',
                    description: p.description || '',
                    email: p.email || '',
                    vertical: p.vertical || 'UNDEFINED',
                    websites: p.websites && p.websites.length > 0 ? p.websites : ['']
                });
            }
        } catch (err) { console.error('Erro ao buscar perfil:', err); }
        finally { setLoading(false); }
    }, [phone]);

    useEffect(() => {
        if (open && phone) {
            setName(phone.verified_name || '');
            fetchProfile();
        }
    }, [open, phone, fetchProfile]);

    const handleSaveName = async () => {
        setSaving(true);
        try {
            const resp = await fetch(`/api/meta/update_name/${phone.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ verified_name: name })
            });
            if (!resp.ok) throw new Error('Erro ao atualizar nome');
            toast({ title: 'Sucesso!', description: 'Nome enviado para análise.' });
            onSuccess();
        } catch (err) { toast({ title: 'Erro', description: err.message, variant: 'destructive' }); }
        finally { setSaving(false); }
    };

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            const cleanProfile = {
                ...profile,
                websites: profile.websites.filter(w => w.trim() !== '')
            };
            const resp = await fetch(`/api/meta/update_business_profile/${phone.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cleanProfile)
            });
            if (!resp.ok) throw new Error('Erro ao salvar perfil');
            toast({ title: 'Perfil atualizado!', description: 'As informações foram salvas na Meta.' });
        } catch (err) { toast({ title: 'Erro', description: err.message, variant: 'destructive' }); }
        finally { setSaving(false); }
    };

    const addWebsite = () => setProfile(p => ({ ...p, websites: [...p.websites, ''] }));
    const removeWebsite = (idx) => setProfile(p => ({ ...p, websites: p.websites.filter((_, i) => i !== idx) }));
    const updateWebsite = (idx, val) => {
        const newWebs = [...profile.websites];
        newWebs[idx] = val;
        setProfile(p => ({ ...p, websites: newWebs }));
    };

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="sm:max-w-[550px] bg-card/95 backdrop-blur-md max-h-[90vh] overflow-y-auto border-border/40 shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Settings size={18} className="text-primary" /> Configurações do Número
                    </DialogTitle>
                    <DialogDescription className="sr-only">Formulário para editar o nome e perfil público da instância.</DialogDescription>
                </DialogHeader>
                <div className="flex items-center gap-1 p-1 bg-muted/30 border border-border/50 rounded-xl w-fit mt-4">
                    <button
                        type="button"
                        onClick={() => setActiveTab('name')}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all",
                            activeTab === 'name'
                                ? "bg-background text-primary shadow-sm ring-1 ring-border"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        )}
                    >
                        <ShieldCheck size={16} />
                        Nome
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('profile')}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all",
                            activeTab === 'profile'
                                ? "bg-background text-primary shadow-sm ring-1 ring-border"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        )}
                    >
                        <User size={16} />
                        Perfil
                    </button>
                </div>

                {activeTab === 'name' && (
                    <div className="space-y-5 pt-5">
                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Nome de Exibição</Label>
                            <Input
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="bg-background/50 border-border/40 focus:border-primary/50 transition-colors"
                                placeholder="Ex: Delegacia Digital"
                            />
                            <p className="text-[10px] text-muted-foreground/60 italic">⚠️ Alterar o nome exige uma nova aprovação da Meta.</p>
                        </div>
                        <Button onClick={handleSaveName} disabled={saving || name === phone?.verified_name} className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-11">
                            {saving ? <Loader2 size={16} className="mr-2 animate-spin" /> : <ShieldCheck size={16} className="mr-2" />}
                            Enviar para Análise
                        </Button>
                    </div>
                )}

                {activeTab === 'profile' && (
                    <div className="space-y-6 pt-5">
                        {loading ? (
                            <div className="flex flex-col items-center py-10 gap-3">
                                <Loader2 className="animate-spin text-primary opacity-40" />
                                <span className="text-xs text-muted-foreground">Carregando dados da Meta...</span>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] text-muted-foreground uppercase font-bold">E-mail Comercial</Label>
                                        <Input
                                            value={profile.email}
                                            onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
                                            className="bg-background/40 h-9"
                                            placeholder="email@exemplo.com"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] text-muted-foreground uppercase font-bold">Categoria</Label>
                                        <Select value={profile.vertical} onValueChange={v => setProfile(p => ({ ...p, vertical: v }))}>
                                            <SelectTrigger className="bg-background/40 h-9">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="UNDEFINED">Não Definido</SelectItem>
                                                <SelectItem value="GOVT">Governo</SelectItem>
                                                <SelectItem value="PROF_SERVICES">Serviços Profissionais</SelectItem>
                                                <SelectItem value="HEALTH">Saúde</SelectItem>
                                                <SelectItem value="OTHER">Outros</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] text-muted-foreground uppercase font-bold">Sobre (Recado/Bio)</Label>
                                    <Input
                                        value={profile.about}
                                        onChange={e => setProfile(p => ({ ...p, about: e.target.value }))}
                                        className="bg-background/40 h-9"
                                        maxLength={139}
                                        placeholder="Ex: Delegacia Digital IntimAI"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] text-muted-foreground uppercase font-bold">Endereço Físico</Label>
                                    <Input
                                        value={profile.address}
                                        onChange={e => setProfile(p => ({ ...p, address: e.target.value }))}
                                        className="bg-background/40 h-9"
                                        placeholder="Rua, Número, Cidade - UF"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] text-muted-foreground uppercase font-bold">Descrição da Empresa</Label>
                                    <textarea
                                        value={profile.description}
                                        onChange={e => setProfile(p => ({ ...p, description: e.target.value }))}
                                        className="w-full rounded-lg border border-border/40 bg-background/40 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
                                        rows={3}
                                        placeholder="Descreva sua atuação ou delegacia..."
                                    />
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-[10px] text-muted-foreground uppercase font-bold">Websites</Label>
                                        <Button type="button" variant="ghost" size="sm" onClick={addWebsite} className="h-6 text-[10px] text-primary hover:text-primary/80">
                                            + Adicionar Site
                                        </Button>
                                    </div>
                                    <div className="space-y-2">
                                        {profile.websites.map((url, i) => (
                                            <div key={i} className="flex gap-2">
                                                <Input
                                                    value={url}
                                                    onChange={e => updateWebsite(i, e.target.value)}
                                                    className="bg-background/40 h-8 text-xs"
                                                    placeholder="https://exemplo.com"
                                                />
                                                {profile.websites.length > 1 && (
                                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeWebsite(i)} className="h-8 w-8 text-red-500/50 hover:text-red-500">
                                                        <Plus className="rotate-45" size={14} />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <Button onClick={handleSaveProfile} disabled={saving} className="w-full bg-zinc-900 border border-border/40 text-white font-bold h-11 hover:bg-zinc-800 transition-all">
                                    {saving ? <Loader2 size={16} className="mr-2 animate-spin" /> : <RefreshCw size={16} className="mr-2" />}
                                    Salvar Alterações de Perfil
                                </Button>
                            </>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

// ─── Modal: Configurações Admin ─────────────────────────────
const ConfigModal = ({ open, onClose }) => {
    const [settings, setSettings] = useState({ meta_api_token: '' });
    const [saving, setSaving] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (!open) return;
        supabase.from('admin_settings').select('meta_api_token').eq('key', 'config_meta').maybeSingle()
            .then(({ data }) => data && setSettings({
                meta_api_token: data.meta_api_token || ''
            }));
    }, [open]);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await supabase.from('admin_settings').upsert({
                key: 'config_meta',
                ...settings,
                updated_at: new Date().toISOString()
            }, { onConflict: 'key' });
            toast({ title: 'Configurações salvas!' });
            onClose();
        } catch (err) { toast({ title: 'Erro', description: err.message, variant: 'destructive' }); }
        finally { setSaving(false); }
    };

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="sm:max-w-[450px] bg-card/95 backdrop-blur-md">
                <DialogHeader>
                    <DialogTitle>Configurações Globais Meta</DialogTitle>
                    <DialogDescription className="sr-only">Configurações globais de token da Meta API.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSave} className="space-y-4 pt-2">
                    <div className="space-y-2">
                        <Label>API Token Permanente (Meta App)</Label>
                        <Input type="password" value={settings.meta_api_token} onChange={e => setSettings(s => ({ ...s, meta_api_token: e.target.value }))} className="bg-background/50 text-xs" />
                        <p className="text-[10px] text-muted-foreground italic">Esse token sistêmico dá permissão global no App do Facebook.</p>
                    </div>
                    <Button type="submit" disabled={saving} className="w-full">
                        {saving ? <Loader2 size={14} className="mr-2 animate-spin" /> : <ShieldCheck size={14} className="mr-2" />}
                        Salvar Credenciais
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
};

// ─── Modal: Gerenciar Contas WABA ───────────────────────────────────────────
const WabaManagerModal = ({ open, onClose, wabas, onRefresh }) => {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ waba_id: '', name: '' });
    const { toast } = useToast();

    const handleCreate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const resp = await fetch('/api/meta/wabas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            if (!resp.ok) throw new Error((await resp.json()).error);
            toast({ title: 'WABA cadastrado com sucesso!' });
            setForm({ waba_id: '', name: '' });
            onRefresh();
        } catch (err) {
            toast({ title: 'Erro', description: err.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(o) => (!o) && onClose()}>
            <DialogContent className="sm:max-w-[450px] bg-card/95 backdrop-blur-md">
                <DialogHeader>
                    <DialogTitle>Contas WABA (WhatsApp Business)</DialogTitle>
                    <DialogDescription className="sr-only">Gerenciamento das contas WABA cadastradas.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreate} className="space-y-4 pt-2 mb-4 border-b border-border/40 pb-4">
                    <p className="text-xs text-muted-foreground mb-2">Cadastre um novo número de identificação WABA para poder registrar telefones associados a ele.</p>
                    <div className="space-y-2">
                        <Label>Nome de Identificação (Ex: Matriz, Filial SP)</Label>
                        <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="bg-background/50 h-8" required />
                    </div>
                    <div className="space-y-2">
                        <Label>ID do WABA (Meta)</Label>
                        <Input value={form.waba_id} onChange={e => setForm(f => ({ ...f, waba_id: e.target.value }))} className="bg-background/50 h-8 font-mono" required />
                    </div>
                    <Button type="submit" disabled={loading} size="sm" className="w-full h-8">
                        {loading ? <Loader2 size={12} className="mr-2 animate-spin" /> : <Plus size={12} className="mr-2" />} Adicionar WABA
                    </Button>
                </form>

                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    <Label className="text-xs text-primary uppercase font-bold tracking-wider">Wabas Ativos</Label>
                    {wabas.map(w => (
                        <div key={w.waba_id} className="flex flex-col bg-background/40 p-2 rounded border border-border/50">
                            <span className="text-sm font-bold">{w.name}</span>
                            <span className="text-xs font-mono text-muted-foreground">ID: {w.waba_id}</span>
                        </div>
                    ))}
                    {wabas.length === 0 && <p className="text-xs text-muted-foreground italic">Nenhuma conta cadastrada.</p>}
                </div>
            </DialogContent>
        </Dialog>
    );
};

// ─── Modal: Confirmar Desvinculação ───────────────────────────────────────────
const UnlinkModal = ({ open, reqContext, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleUnlink = async () => {
        if (!reqContext) return;
        setLoading(true);
        try {
            const resp = await fetch('/api/meta/unlink', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone_id: reqContext.id })
            });
            if (!resp.ok) throw new Error('Erro ao desvincular.');
            toast({ title: 'Desvinculado!', description: 'A instância agora está livre.' });
            onSuccess();
            onClose();
        } catch (err) {
            toast({ title: 'Erro', description: err.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="sm:max-w-[400px] bg-card/95 backdrop-blur-md border-red-500/30 shadow-red-500/10">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-500">
                        <AlertTriangle size={18} /> Desvincular Instância
                    </DialogTitle>
                    <DialogDescription className="sr-only">Confirmação para remover o vínculo da instância selecionada.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Você está prestes a remover o vínculo de <strong>{reqContext?.name}</strong>.
                        A delegacia vinculada ou o setor interno associado ficarão sem número no sistema até que seja feita uma nova conexão.
                    </p>
                </div>
                <DialogFooter className="pt-4">
                    <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
                    <Button type="button" variant="destructive" onClick={handleUnlink} disabled={loading}>
                        {loading ? <Loader2 size={14} className="mr-2 animate-spin" /> : <Link2Off size={14} className="mr-2" />}
                        Desvincular
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

// ─── Página Principal ─────────────────────────────────────────────────────────
const ConexoesPage = () => {
    const [phones, setPhones] = useState([]);
    const [delegacias, setDelegacias] = useState([]);
    const [wabas, setWabas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(null);
    const [showAdd, setShowAdd] = useState(false);
    const [showConfig, setShowConfig] = useState(false);
    const [showWabas, setShowWabas] = useState(false);
    const [editingPhone, setEditingPhone] = useState(null);
    const [otpPhoneId, setOtpPhoneId] = useState(null);
    const [unlinkReq, setUnlinkReq] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const { toast } = useToast();

    const fetchPhones = useCallback(async () => {
        setLoading(true);
        try {
            const resp = await fetch('/api/meta/phone_numbers');
            if (resp.ok) {
                const data = await resp.json();
                setPhones(data.data || []);
            }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }, []);

    const fetchDelegacias = useCallback(async () => {
        const { data } = await supabase.from('delegacias').select('delegaciaId, nome, whatsappPhoneNumberId').order('nome');
        setDelegacias(data || []);
    }, []);

    const fetchWabas = useCallback(async () => {
        try {
            const resp = await fetch('/api/meta/wabas');
            if (resp.ok) {
                const data = await resp.json();
                setWabas(data || []);
            }
        } catch (err) { console.error('Erro buscando WABAs:', err); }
    }, []);

    useEffect(() => {
        fetchWabas();
        fetchPhones();
        fetchDelegacias();
    }, [fetchWabas, fetchPhones, fetchDelegacias]);

    const requestOtp = async (phone_id, method) => {
        try {
            const resp = await fetch('/api/meta/request_code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone_id, code_method: method })
            });
            if (!resp.ok) {
                const data = await resp.json();
                throw new Error(data.error || 'Erro na solicitação');
            }
            toast({ title: 'Solicitado!', description: 'O código está a caminho.' });
            fetchPhones();
        } catch (err) { toast({ title: 'Erro', description: err.message, variant: 'destructive' }); }
    };

    const resetOtpStatus = async (phone_id) => {
        try {
            await fetch('/api/meta/reset_otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone_id })
            });
            fetchPhones();
        } catch (err) { console.error(err); }
    };

    const refreshPhone = async (phone_id) => {
        setRefreshing(phone_id);
        try {
            const resp = await fetch(`/api/meta/status/${phone_id}`);
            const updated = await resp.json();
            if (resp.ok) setPhones(prev => prev.map(p => p.id === phone_id ? { ...p, ...updated } : p));
        } finally { setRefreshing(null); }
    };

    const phoneToDelegate = delegacias.reduce((acc, d) => {
        if (d.whatsappPhoneNumberId) acc[d.whatsappPhoneNumberId] = d.nome;
        return acc;
    }, {});

    // Filtro e Ordenação
    const filteredPhones = phones.filter(phone => {
        const title = phoneToDelegate[phone.id] || phone.custom_name || phone.verified_name || '';
        const searchRegex = new RegExp(searchQuery, 'i');
        const matchesSearch = searchRegex.test(title) || searchRegex.test(phone.display_phone_number);

        if (!matchesSearch) return false;
        if (statusFilter === 'ALL') return true;
        const status = getConnectionStatus(phone);
        if (statusFilter === 'CONNECTED') return status === 'connected';
        if (statusFilter === 'PENDING') return status !== 'connected';
        return true;
    }).sort((a, b) => {
        const statusA = getConnectionStatus(a) === 'connected' ? 1 : 0;
        const statusB = getConnectionStatus(b) === 'connected' ? 1 : 0;
        return statusB - statusA;
    });

    return (
        <div className="space-y-6">
            <PageHeader title="Conexões Meta" description="Gerencie as comunicações oficiais da Meta API e Hub do WABA" />

            <Card className="border border-border/60 bg-card overflow-hidden shadow-sm">
                <div className="p-4 sm:p-5 border-b border-border/60 flex flex-col md:flex-row items-center justify-between gap-4 bg-background/50">
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar instância..."
                                className="pl-9 bg-background/50 h-9 border-border/60"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[140px] h-9 bg-background/50 border-border/60">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Todas</SelectItem>
                                <SelectItem value="CONNECTED">Conectadas</SelectItem>
                                <SelectItem value="PENDING">Pendentes / Erros</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                        <Button variant="outline" size="sm" onClick={() => setShowWabas(true)} className="h-9 border-border/60 text-muted-foreground hover:text-foreground">
                            <MapPin size={14} className="mr-2" />Contas WABA
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setShowConfig(true)} className="h-9 border-border/60 text-muted-foreground hover:text-foreground">
                            <Settings size={14} className="mr-2" />Token Meta API
                        </Button>
                        <Button size="sm" onClick={() => setShowAdd(true)} className="h-9 bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/10">
                            <Plus size={14} className="mr-2" />Nova Conexão
                        </Button>
                    </div>
                </div>

                <div className="p-4 sm:p-5">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <Loader2 className="animate-spin text-primary opacity-40 h-8 w-8" />
                            <span className="text-xs text-muted-foreground">Sincronizando com a Meta...</span>
                        </div>
                    ) : filteredPhones.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="h-12 w-12 rounded-full bg-zinc-500/10 flex items-center justify-center mb-3">
                                <Search size={20} className="text-zinc-500/50" />
                            </div>
                            <p className="text-sm font-medium text-foreground">Ainda não há instâncias aqui.</p>
                            <p className="text-xs text-muted-foreground mt-1 max-w-[250px]">
                                Verifique seus filtros ou crie uma nova conexão oficial do WhatsApp.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredPhones.map(phone => (
                                <InstanceCard
                                    key={phone.id}
                                    phone={phone}
                                    delegaciaNome={phoneToDelegate[phone.id]}
                                    customName={phone.custom_name}
                                    onRequestOtp={requestOtp}
                                    onVerifyOtp={setOtpPhoneId}
                                    onRefresh={refreshPhone}
                                    onEdit={setEditingPhone}
                                    onResetOtp={resetOtpStatus}
                                    refreshing={refreshing}
                                    onUnlink={(id, name) => setUnlinkReq({ id, name })}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </Card>

            <NovaInstanciaModal open={showAdd} onClose={() => setShowAdd(false)} delegacias={delegacias} wabas={wabas} onSuccess={() => { fetchPhones(); fetchDelegacias(); }} />
            <ConfigModal open={showConfig} onClose={() => setShowConfig(false)} />
            <WabaManagerModal open={showWabas} onClose={() => setShowWabas(false)} wabas={wabas} onRefresh={fetchWabas} />
            <EditProfileModal open={!!editingPhone} phone={editingPhone} onClose={() => setEditingPhone(null)} onSuccess={fetchPhones} />
            <OtpModal open={!!otpPhoneId} phoneId={otpPhoneId} onClose={() => setOtpPhoneId(null)} onSuccess={fetchPhones} onReset={resetOtpStatus} />
            <UnlinkModal open={!!unlinkReq} reqContext={unlinkReq} onClose={() => setUnlinkReq(null)} onSuccess={() => { fetchPhones(); fetchDelegacias(); }} />
        </div>
    );
};

export default ConexoesPage;
