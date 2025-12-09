import React from 'react';
import PageHeader from '@/components/ui/PageHeader';

const UsersPage = () => {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Gestão de Usuários" 
        description="Gerencie os usuários da plataforma"
      />
      <div className="p-4 bg-muted/20 rounded-lg border border-dashed border-muted-foreground/25 flex items-center justify-center min-h-[300px]">
        <p className="text-muted-foreground">Funcionalidade de gestão de usuários será implementada aqui.</p>
      </div>
    </div>
  );
};

export default UsersPage;
