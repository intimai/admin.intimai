import React, { useState, useEffect } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { cn } from '@/lib/utils';
import {
  Wallet,
  Activity,
  Briefcase
} from 'lucide-react';
import { VisaoFinanceira } from '@/components/dashboard/VisaoFinanceira';
import { VisaoComercial } from '@/components/dashboard/VisaoComercial';
import { VisaoOperacional } from '@/components/dashboard/VisaoOperacional';

const Dashboard = () => {
  const { hasMenuAccess, isSuperAdmin, isAdmin, loading: authLoading } = useAdminAuth();
  const [activeTab, setActiveTab] = useState('');

  const hasFinanceiro = isSuperAdmin || hasMenuAccess('faturas') || hasMenuAccess('despesas');
  const hasOperacional = isSuperAdmin || hasMenuAccess('monitoramento-ia') || hasMenuAccess('delegacias') || hasMenuAccess('conexoes');
  const hasComercial = isSuperAdmin || hasMenuAccess('pipeline') || hasMenuAccess('propostas') || hasMenuAccess('contratos');

  useEffect(() => {
    if (!activeTab && !authLoading && isAdmin) {
      if (hasComercial) setActiveTab('comercial');
      else if (hasOperacional) setActiveTab('operacao');
      else if (hasFinanceiro) setActiveTab('financeira');
    }
  }, [hasFinanceiro, hasOperacional, hasComercial, activeTab, authLoading, isAdmin]);

  if (authLoading || !activeTab) {
      return null;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Dashboard Central"
        description="Controle executivo: saúde financeira, escala comercial e operação tática do sistema IntimAI."
        icon={Activity}
      />

      <Card className="border-border/60 bg-card/40 backdrop-blur-sm overflow-hidden shadow-xl">
        <CardContent className="p-6 space-y-8">

          {/* Sistema de Abas Integrado RBAC */}
          <div className="flex flex-wrap items-center gap-1 p-1 bg-muted/30 border border-border/50 rounded-xl w-fit">
            
            {hasComercial && (
              <button
                onClick={() => setActiveTab('comercial')}
                className={cn(
                  "flex items-center gap-2 px-6 py-2.5 text-sm font-medium rounded-lg transition-all",
                  activeTab === 'comercial'
                    ? "bg-background text-primary shadow-sm ring-1 ring-border"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <Briefcase size={16} />
                Visão Comercial
              </button>
            )}

            {hasOperacional && (
              <button
                onClick={() => setActiveTab('operacao')}
                className={cn(
                  "flex items-center gap-2 px-6 py-2.5 text-sm font-medium rounded-lg transition-all",
                  activeTab === 'operacao'
                    ? "bg-background text-primary shadow-sm ring-1 ring-border"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <Activity size={16} />
                Visão Operacional
              </button>
            )}

            {hasFinanceiro && (
              <button
                onClick={() => setActiveTab('financeira')}
                className={cn(
                  "flex items-center gap-2 px-6 py-2.5 text-sm font-medium rounded-lg transition-all",
                  activeTab === 'financeira'
                    ? "bg-background text-primary shadow-sm ring-1 ring-border"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <Wallet size={16} />
                Visão Financeira
              </button>
            )}
          </div>

          <div className="mt-4" />

          {/* Renderização Condicional */}
          {activeTab === 'financeira' && <VisaoFinanceira />}
          {activeTab === 'comercial' && <VisaoComercial />}
          {activeTab === 'operacao' && <VisaoOperacional />}

        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
