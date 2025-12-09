import React from 'react';
import PageHeader from '@/components/ui/PageHeader';

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Dashboard" 
        description="Visão Geral das Intimações"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-card rounded-xl border shadow-sm hover:shadow-md transition-all">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Usuários Totais</h3>
          <p className="text-3xl font-bold mt-2 text-primary">1,234</p>
          <span className="text-xs text-green-500 font-medium mt-1 inline-block">+12% este mês</span>
        </div>
        <div className="p-6 bg-card rounded-xl border shadow-sm hover:shadow-md transition-all">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Assinaturas Ativas</h3>
          <p className="text-3xl font-bold mt-2 text-primary">856</p>
          <span className="text-xs text-green-500 font-medium mt-1 inline-block">+5% este mês</span>
        </div>
        <div className="p-6 bg-card rounded-xl border shadow-sm hover:shadow-md transition-all">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Receita Mensal</h3>
          <p className="text-3xl font-bold mt-2 text-primary">R$ 45.200</p>
          <span className="text-xs text-green-500 font-medium mt-1 inline-block">+18% este mês</span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


