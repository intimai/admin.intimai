import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { toast } from '@/components/ui/use-toast';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { passwordRecovery } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { error } = await passwordRecovery(email);

    if (error) {
      toast({
        title: "Erro ao enviar email de recuperação",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setMessage('Se um usuário com este e-mail existir, um link de recuperação de senha será enviado.');
      toast({
        title: "Email de recuperação enviado!",
        description: "Por favor, verifique sua caixa de entrada.",
      });
    }

    setLoading(false);
  };

  return (
    <div className="w-full max-w-[448px] mx-auto">
      <Card className="card-hover glass-effect border-border">
        <CardHeader className="text-center">
          <CardTitle className="active-link-gradient">Recuperar Senha</CardTitle>
          <p className="text-muted-foreground">Insira seu email para receber o link de recuperação.</p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  placeholder="seu.email@delegacia.gov.br"
                  required
                />
              </div>
            </div>

            {message && <p className="text-sm text-green-600 text-center">{message}</p>}

            <Button
              type="submit"
              className="w-full btn-primary"
              disabled={loading}
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                'Enviar Link de Recuperação'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-primary hover:underline font-medium flex items-center justify-center w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para o Login
            </Link>
          </div>
        </CardContent>
      </Card>
      <p className="text-center text-xs text-muted-foreground mt-4">powered by Aurios AI</p>
    </div>
  );
}