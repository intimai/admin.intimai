import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useTheme } from '@/contexts/ThemeContext';
import { Loader2, Eye, EyeOff } from 'lucide-react';

const SetPasswordPage = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [checkingSession, setCheckingSession] = useState(true);
    const { toast } = useToast();
    const { logoSrc } = useTheme();
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
            setTimeout(() => navigate('/dashboard'), 1500);
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
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
            <div className="text-center mb-8 space-y-2">
                <img src={logoSrc} alt="IntimAI" className="h-12 mx-auto" />
                <h2 className="text-xl font-semibold text-primary tracking-wide uppercase">Novo Colaborador</h2>
                <p className="text-muted-foreground">Defina sua senha de acesso ao painel.</p>
            </div>

            <Card className="w-full max-w-md border-border shadow-lg">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold text-primary">Criar Senha</CardTitle>
                    <CardDescription>
                        Escolha uma senha segura para proteger sua conta.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">Nova Senha</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input-elegant pr-10"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary focus:outline-none"
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
                                className="input-elegant"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-primary hover:bg-primary/90"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Salvando...
                                </>
                            ) : (
                                'Ativar Meu Acesso'
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default SetPasswordPage;
