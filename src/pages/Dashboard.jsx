import React from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

const Dashboard = () => {
  const { hasMenuAccess, isSuperAdmin } = useAdminAuth();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Dashboard"
        description="Visão geral do desempenho do sistema, métricas setoriais e saúde financeira."
      />

      <Card className="bg-card/90 border-border/40 overflow-hidden shadow-xl backdrop-blur-md">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Categoria Cadastros */}
            {(hasMenuAccess('users') || hasMenuAccess('delegacias') || isSuperAdmin) && (
              <div className="group p-8 bg-card/60 rounded-2xl border border-border/50 shadow-sm hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Cadastros Totais</h3>
                <p className="text-4xl font-bold mt-4 bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">1,234</p>
                <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-green-500">
                  <span className="bg-green-500/10 px-2 py-0.5 rounded-full">+12% este mês</span>
                </div>
              </div>
            )}

            {/* Categoria Comercial */}
            {(hasMenuAccess('pipeline') || hasMenuAccess('propostas') || isSuperAdmin) && (
              <div className="group p-8 bg-card/60 rounded-2xl border border-border/50 shadow-sm hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Leads no Pipeline</h3>
                <p className="text-4xl font-bold mt-4 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">856</p>
                <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-green-500">
                  <span className="bg-green-500/10 px-2 py-0.5 rounded-full">+5% este mês</span>
                </div>
              </div>
            )}

            {/* Categoria Administrativo */}
            {(hasMenuAccess('finance') || hasMenuAccess('nfe') || hasMenuAccess('contratos') || isSuperAdmin) && (
              <div className="group p-8 bg-card/60 rounded-2xl border border-border/50 shadow-sm hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Receita Mensal</h3>
                <p className="text-4xl font-bold mt-4 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">R$ 45.200</p>
                <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-green-500">
                  <span className="bg-green-500/10 px-2 py-0.5 rounded-full">+18% este mês</span>
                </div>
              </div>
            )}

          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;


