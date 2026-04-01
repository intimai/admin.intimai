import React, { useState, useEffect } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { cn } from '@/lib/utils';
import {
  Wallet,
  Activity,
  TrendingUp,
  Percent,
  MessageSquare,
  Building2,
  Users,
  CircleDollarSign,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

const Dashboard = () => {
  const { hasMenuAccess, isSuperAdmin } = useAdminAuth();
  const [activeTab, setActiveTab] = useState('financeira');
  const [stats, setStats] = useState({
    mrr: 0,
    faturasPendentes: 0,
    totalDelegacias: 0,
    totalIntimacoes: 0,
    receitas: 0,
    despesas: 0,
    lucroLiquido: 0
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        // Buscas básicas (mock e reais)
        const { count: countDelegacias } = await supabase
          .from('delegacias')
          .select('*', { count: 'exact', head: true });
          
        const { count: countIntimacoes } = await supabase
          .from('intimacoes')
          .select('*', { count: 'exact', head: true });

        // Buscas Reais de Financeiro
        const { data: faturas } = await supabase
          .from('fat_faturas')
          .select('valor, status_pagamento');
          
        const { data: despesasBody } = await supabase
          .from('fat_despesas')
          .select('valor, status_pagamento');

        const totalReceitas = (faturas || [])
          .filter(f => f.status_pagamento === 'PAGO')
          .reduce((acc, f) => acc + Number(f.valor), 0);

        const totalDespesas = (despesasBody || [])
          .filter(d => d.status_pagamento === 'PAGO')
          .reduce((acc, d) => acc + Number(d.valor), 0);

        const faturasAtrasadas = (faturas || [])
          .filter(f => f.status_pagamento === 'ATRASADO').length;

        setStats({
          mrr: totalReceitas, 
          faturasPendentes: faturasAtrasadas,
          totalDelegacias: countDelegacias || 0,
          totalIntimacoes: countIntimacoes || 0,
          receitas: totalReceitas,
          despesas: totalDespesas,
          lucroLiquido: totalReceitas - totalDespesas
        });
      } catch (err) {
        console.error("Erro ao buscar stats do dashboard", err);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Dashboard Central"
        description="Controle executivo: saúde financeira e operação tática do sistema IntimAI."
        icon={Activity}
      />

      <Card className="border-border/60 bg-card/40 backdrop-blur-sm overflow-hidden shadow-xl">
        <CardContent className="p-6 space-y-8">

          {/* Sistema de Abas Integrado */}
          <div className="flex items-center gap-1 p-1 bg-muted/30 border border-border/50 rounded-xl w-fit">
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
              Operação de IAs
            </button>
          </div>

          {/* Aba: Visão Financeira */}
          {activeTab === 'financeira' && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                
                {/* MRR / Receita */}
                <div className="group p-8 bg-card/60 rounded-2xl border border-border/50 shadow-sm hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300 relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 opacity-10 text-primary">
                    <TrendingUp size={100} />
                  </div>
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">MRR (Recorrente)</h3>
                  <p className="text-4xl font-bold mt-4 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                    R$ {stats.receitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-emerald-500">
                    <span className="bg-emerald-500/10 px-2 py-0.5 rounded-full">Baseado em Contratos Pagos</span>
                  </div>
                </div>

                {/* Lucro Líquido */}
                <div className="group p-8 bg-card/60 rounded-2xl border border-border/50 shadow-sm hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300 relative overflow-hidden bg-gradient-to-br from-primary/5 to-transparent">
                  <div className="absolute -right-4 -top-4 opacity-10 text-primary">
                    <CircleDollarSign size={100} />
                  </div>
                  <h3 className="text-sm font-bold text-primary uppercase tracking-wider">Lucro Líquido</h3>
                  <p className="text-4xl font-black mt-4 bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                    R$ {stats.lucroLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-primary/60">
                    <span className="bg-primary/10 px-2 py-0.5 rounded-full">Receitas - Despesas</span>
                  </div>
                </div>

                {/* Inadimplência */}
                <div className="group p-8 bg-card/60 rounded-2xl border border-border/50 shadow-sm hover:shadow-amber-500/5 hover:border-amber-500/20 transition-all duration-300">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Inadimplência</h3>
                  <p className="text-4xl font-bold mt-4 bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                    {stats.faturasPendentes}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-amber-500">
                    <span className="bg-amber-500/10 px-2 py-0.5 rounded-full">Faturas Atrasadas</span>
                  </div>
                </div>

                {/* Margem Operacional */}
                <div className="group p-8 bg-card/60 rounded-2xl border border-border/50 shadow-sm hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Margem Operacional</h3>
                  <p className="text-4xl font-bold mt-4 bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent flex items-center gap-2">
                    -- <Percent size={28} className="text-purple-400" />
                  </p>
                  <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-muted-foreground">
                    Cruza entrada B2B com consumo de API
                  </div>
                </div>

              </div>

              <div className="p-8 bg-muted/20 border border-border/50 rounded-2xl flex flex-col items-center justify-center text-center opacity-60">
                 <Wallet size={48} className="mb-4 text-muted-foreground opacity-50" />
                 <h2 className="text-lg font-bold">Gráficos em Breve</h2>
                 <p className="text-muted-foreground text-sm max-w-sm mt-2">Assim que o módulo de Contas a Receber e Despesas for alimentado, os gráficos de fluxo de caixa aparecerão aqui.</p>
              </div>
            </div>
          )}

          {/* Aba: Operação */}
          {activeTab === 'operacao' && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="group p-8 bg-card/60 rounded-2xl border border-border/50 shadow-sm hover:shadow-primary/5 transition-all duration-300 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Intimações Geradas</h3>
                    <p className="text-4xl font-bold mt-4 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                      {stats.totalIntimacoes}
                    </p>
                  </div>
                  <div className="p-4 bg-blue-500/10 rounded-full">
                     <MessageSquare size={32} className="text-blue-500" />
                  </div>
                </div>

                <div className="group p-8 bg-card/60 rounded-2xl border border-border/50 shadow-sm hover:shadow-primary/5 transition-all duration-300 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Delegacias Atendidas</h3>
                    <p className="text-4xl font-bold mt-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      {stats.totalDelegacias}
                    </p>
                  </div>
                  <div className="p-4 bg-purple-500/10 rounded-full">
                     <Building2 size={32} className="text-purple-500" />
                  </div>
                </div>

              </div>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
