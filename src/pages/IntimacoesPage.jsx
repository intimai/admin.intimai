import React from 'react';
import PageHeader from '@/components/ui/PageHeader';

const IntimacoesPage = () => {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Gestão de Intimações" 
        description="Acompanhe e gerencie as intimações do sistema"
      />
      <div className="p-4 bg-muted/20 rounded-lg border border-dashed border-muted-foreground/25 flex items-center justify-center min-h-[300px]">
        <p className="text-muted-foreground">Funcionalidade de gestão de intimações será implementada aqui.</p>
      </div>
    </div>
  );
};

export default IntimacoesPage;
