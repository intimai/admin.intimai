import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { cn } from '@/lib/utils';
import {
  TrendingUp,
  Percent,
  CircleDollarSign,
  ArrowUpRight
} from 'lucide-react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

export const VisaoFinanceira = () => {
  const { isAdmin, loading: authLoading } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    mrr: 0,
    faturasAtrasadas: 0,
    lastMonthResult: 0,
    currentMonthEstimated: 0,
  });

  useEffect(() => {
    async function fetchFinanceStats(retryCount = 0) {
      if (!isAdmin || authLoading) return;
      try {
        setLoading(true);
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
        
        const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
        const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];

        // Faturas (Receitas)
        const { data: faturas, error: errFat } = await supabase
          .from('fat_faturas')
          .select('valor, status_pagamento, data_vencimento')
          .neq('status_pagamento', 'CANCELADO');
        if (errFat) throw errFat;
          
        // Despesas
        const { data: despesas, error: errDesp } = await supabase
          .from('fat_despesas')
          .select('valor, status_pagamento, data_vencimento')
          .neq('status_pagamento', 'CANCELADO');
        if (errDesp) throw errDesp;

        const filterByPeriod = (items, start, end) => (items || []).filter(i => i.data_vencimento >= start && i.data_vencimento <= end);

        // Mês Passado
        const receitasLast = filterByPeriod(faturas, firstDayLastMonth, lastDayLastMonth).reduce((acc, i) => acc + Number(i.valor), 0);
        const despesasLast = filterByPeriod(despesas, firstDayLastMonth, lastDayLastMonth).reduce((acc, i) => acc + Number(i.valor), 0);
        
        // Mês Corrente (Estimado)
        const receitasCurrent = filterByPeriod(faturas, startOfMonth, endOfMonth).reduce((acc, i) => acc + Number(i.valor), 0);
        const despesasCurrent = filterByPeriod(despesas, startOfMonth, endOfMonth).reduce((acc, i) => acc + Number(i.valor), 0);

        const atrasadas = (faturas || []).filter(f => f.status_pagamento === 'ATRASADO').length;

        setStats({
          mrr: (faturas || [])
                .filter(f => f.status_pagamento !== 'CANCELADO' && f.data_vencimento >= startOfMonth && f.data_vencimento <= endOfMonth)
                .reduce((acc, f) => acc + Number(f.valor), 0),
          faturasAtrasadas: atrasadas,
          lastMonthResult: receitasLast - despesasLast,
          currentMonthEstimated: receitasCurrent - despesasCurrent,
        });
      } catch (err) {
        console.error("Erro ao buscar stats financeiro", err);
        if (retryCount < 1 && (err.code === 'PGRST301' || err.status === 401)) {
          await new Promise(resolve => setTimeout(resolve, 800));
          return fetchFinanceStats(retryCount + 1);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchFinanceStats();
  }, [isAdmin, authLoading]);

  if (loading) {
      return (
          <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
      );
  }

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        
        {/* Resultado Mês Passado */}
        <div className="group p-8 bg-card/60 rounded-2xl border border-border/50 shadow-sm hover:shadow-primary/5 transition-all duration-300 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-10 text-primary">
            <TrendingUp size={100} />
          </div>
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <ArrowUpRight size={14} className="text-primary" />
            Resultado Mês Passado
          </h3>
          <p className="text-4xl font-bold mt-4 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            R$ {stats.lastMonthResult.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-emerald-500">
            <span className="bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase">Realizado</span>
          </div>
        </div>

        {/* Projeção Mês Corrente */}
        <div className="group p-8 bg-card/60 rounded-2xl border border-border/50 shadow-sm hover:shadow-primary/5 transition-all duration-300 relative overflow-hidden bg-gradient-to-br from-primary/5 to-transparent">
          <div className="absolute -right-4 -top-4 opacity-10 text-primary">
            <CircleDollarSign size={100} />
          </div>
          <h3 className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2">
            <ArrowUpRight size={14} />
            Lucro Estimado (Mês Atual)
          </h3>
          <p className="text-4xl font-black mt-4 bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            R$ {stats.currentMonthEstimated.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-primary/60 uppercase">
            <span className="bg-primary/10 px-2 py-0.5 rounded-full">Baseado em Vencimentos</span>
          </div>
        </div>

        {/* MRR / Base de Contratos */}
        <div className="group p-8 bg-card/60 rounded-2xl border border-border/50 shadow-sm hover:shadow-primary/5 transition-all duration-300">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">MRR Atual</h3>
          <p className="text-3xl font-bold mt-4 text-foreground/80">
            R$ {stats.mrr.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground uppercase">
            Assinaturas Válidas este mês
          </div>
        </div>

        {/* Inadimplência / Alerta */}
        <div className="group p-8 bg-card/60 rounded-2xl border border-border/50 shadow-sm hover:shadow-amber-500/5 transition-all duration-300">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Percent size={18} className="text-amber-500" />
            Inadimplência
          </h3>
          <p className="text-3xl font-bold mt-4 text-amber-500">
            {stats.faturasAtrasadas}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-amber-500/60 uppercase">
            Boletos em atraso
          </div>
        </div>
      </div>

      {/* Gráfico de Barras CSS Clean */}
      <div className="p-8 bg-card/40 border border-border/50 rounded-2xl shadow-xl backdrop-blur-md">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-10">Consistência Mensal</h3>
          
          <div className="flex flex-col gap-10">
            <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    <span>Mês Passado</span>
                    <span className="text-emerald-400">R$ {stats.lastMonthResult.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="h-3 w-full bg-muted/20 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-emerald-500/40 border-r border-emerald-500 transition-all duration-1000 ease-out" 
                        style={{ width: `${Math.min(100, Math.max(10, (stats.lastMonthResult / (stats.currentMonthEstimated || 1)) * 100))}%` }}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    <span>Projeção Mês Corrente</span>
                    <span className="text-primary">R$ {stats.currentMonthEstimated.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="h-3 w-full bg-muted/20 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-primary/40 border-r border-primary transition-all duration-1000 ease-out" 
                        style={{ width: `${Math.min(100, Math.max(10, (stats.currentMonthEstimated / (stats.lastMonthResult || 1)) * 100))}%` }}
                    />
                </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-border/30 text-center">
              <p className="text-xs text-muted-foreground">
                Diferença de <span className={cn("font-bold", stats.currentMonthEstimated >= stats.lastMonthResult ? "text-emerald-400" : "text-amber-400")}>
                    {Math.abs(((stats.currentMonthEstimated - stats.lastMonthResult) / (stats.lastMonthResult || 1)) * 100).toFixed(1)}%
                </span> em relação ao mês anterior.
              </p>
          </div>
      </div>
    </div>
  );
};
