import React from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { Construction } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const EmDesenvolvimentoPage = ({ title }) => {
    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <PageHeader
                title={title || "Em Desenvolvimento"}
                description="Esta funcionalidade está sendo preparada com as melhores tecnologias e estará disponível em breve para otimizar seus processos."
            />

            <Card className="bg-card/90 border-border/40 overflow-hidden shadow-xl backdrop-blur-md">
                <CardContent className="p-12">
                    <div className="flex flex-col items-center justify-center py-20 bg-muted/10 rounded-2xl border border-dashed border-border/50 text-muted-foreground gap-4">
                        <div className="h-20 w-20 rounded-full bg-primary/5 flex items-center justify-center animate-pulse">
                            <Construction size={48} className="text-primary/40" />
                        </div>
                        <div className="text-center space-y-2">
                            <p className="text-2xl font-semibold text-foreground italic">Novidades em breve!</p>
                            <p className="text-sm opacity-70 max-w-xs mx-auto leading-relaxed">
                                Nossa equipe está trabalhando intensamente para trazer esta funcionalidade para sua experiência.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default EmDesenvolvimentoPage;
