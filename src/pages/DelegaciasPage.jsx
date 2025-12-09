import React from 'react';
import PageHeader from '@/components/ui/PageHeader';

const DelegaciasPage = () => {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Delegacias" 
        description="Gestão de delegacias parceiras e contatos"
      />
      <div className="p-4 bg-muted/20 rounded-lg border border-dashed border-muted-foreground/25 flex items-center justify-center min-h-[300px]">
        <p className="text-muted-foreground">Funcionalidade de delegacias será implementada aqui.</p>
      </div>
    </div>
  );
};

export default DelegaciasPage;