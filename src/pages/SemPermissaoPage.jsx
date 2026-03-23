import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldOff, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/ui/PageHeader';
import { Card, CardContent } from '@/components/ui/card';

const SemPermissaoPage = () => {
    const navigate = useNavigate();

    return (
        <div className="space-y-6 max-w-7xl mx-auto p-6 md:p-0 min-h-[80vh] flex flex-col justify-center">
            <PageHeader
                title="Acesso Negado"
                description="Parece que você tentou acessar uma área restrita do sistema IntimAI."
            />

            <Card className="bg-card/90 border-border/40 overflow-hidden shadow-xl backdrop-blur-md flex-1 flex items-center justify-center">
                <CardContent className="p-12 text-center space-y-8">
                    <div className="flex flex-col items-center gap-6">
                        <div className="h-24 w-24 rounded-full bg-destructive/5 flex items-center justify-center border border-destructive/20 select-none">
                            <ShieldOff className="h-12 w-12 text-destructive opacity-80" />
                        </div>
                        <div className="space-y-3">
                            <h2 className="text-2xl font-bold text-foreground italic">Permissão Insuficiente</h2>
                            <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                                Você não possui as credenciais necessárias para visualizar este conteúdo.
                                Caso acredite que isso seja um erro, entre em contato com seu gestor ou administrador.
                            </p>
                        </div>
                    </div>

                    <div className="pt-4">
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={() => navigate(-1)}
                            className="px-8 shadow-sm hover:shadow-md transition-all gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Voltar para Segurança
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default SemPermissaoPage;
