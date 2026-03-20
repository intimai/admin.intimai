import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, ShieldCheck, Eye, EyeOff } from 'lucide-react';

const SetPasswordPage = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [checkingSession, setCheckingSession] = useState(true);
    const { toast } = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        // Verificar se temos uma sessão (o supabase deve carregar via hash)
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                // Se não tiver sessão, pode ser que o token expirou ou é inválido
                toast({
                    title: 'Acesso inválido',
                    description: 'O link de convite expirou ou é inválido. Peça um novo convite.',
                    variant: 'destructive',
                });
                navigate('/login');
            }
            setCheckingSession(false);
        };
        checkSession();
    }, [navigate, toast]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password.length < 6) {
            toast({
                title: 'Senha muito curta',
                description: 'A senha deve ter pelo menos 6 caracteres.',
                variant: 'destructive',
            });
            return;
        }

        if (password !== confirmPassword) {
            toast({
                title: 'Senhas não conferem',
                description: 'As senhas digitadas não são iguais.',
                variant: 'destructive',
            });
            return;
        }

        try {
            setLoading(true);
            const { error } = await supabase.auth.updateUser({ password });

            if (error) throw error;

            toast({
                title: 'Senha definida com sucesso!',
                description: 'Você já pode acessar o painel administrativo.',
            });

            // Redirecionar para o dashboard após um breve momento
            setTimeout(() => navigate('/'), 1500);
        } catch (err) {
            console.error('Erro ao definir senha:', err);
            toast({
                title: 'Erro ao salvar senha',
                description: err.message,
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    if (checkingSession) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a10]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a10] p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black">
            <Card className="w-full max-w-md border-zinc-800 bg-zinc-950/50 backdrop-blur-xl shadow-2xl">
                <CardHeader className="space-y-2 text-center pb-8">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20">
                            <ShieldCheck className="h-8 w-8 text-primary" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight text-white">
                        Bem-vindo ao IntimAI Admin
                    </CardTitle>
                    <CardDescription className="text-zinc-400">
                        Para concluir seu acesso, defina uma senha de segurança para sua conta.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="password">Nova Senha</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-zinc-900/50 border-zinc-800 pr-10 focus-visible:ring-primary"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirm-password">Confirmar Senha</Label>
                            <Input
                                id="confirm-password"
                                type={showPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="bg-zinc-900/50 border-zinc-800 focus-visible:ring-primary"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-11 text-base font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Salvando...
                                </>
                            ) : (
                                'Configurar Acesso'
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default SetPasswordPage;
