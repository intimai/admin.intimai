import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldOff, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SemPermissaoPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-6 text-center px-4">
            <div className="flex flex-col items-center gap-4">
                <ShieldOff className="h-16 w-16 text-destructive opacity-80" />
                <h1 className="text-2xl font-bold text-foreground">Acesso Negado</h1>
                <p className="text-muted-foreground max-w-sm">
                    Você não tem permissão para acessar esta área.
                    Entre em contato com o administrador para solicitar acesso.
                </p>
            </div>
            <Button variant="outline" onClick={() => navigate(-1)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
            </Button>
        </div>
    );
};

export default SemPermissaoPage;
