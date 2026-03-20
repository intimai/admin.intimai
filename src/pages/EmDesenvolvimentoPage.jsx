import React from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { Construction } from 'lucide-react';

const EmDesenvolvimentoPage = ({ title }) => {
    return (
        <div className="space-y-6">
            <PageHeader
                title={title || "Em Desenvolvimento"}
                description="Esta funcionalidade está sendo preparada e estará disponível em breve."
            />

            <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-dashed text-muted-foreground">
                <Construction size={48} className="mb-4 opacity-20" />
                <p className="text-lg font-medium">Novidades em breve!</p>
                <p className="text-sm">Estamos trabalhando para trazer esta funcionalidade para você.</p>
            </div>
        </div>
    );
};

export default EmDesenvolvimentoPage;
