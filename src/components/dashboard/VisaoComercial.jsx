import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { cn } from '@/lib/utils';
import {
  Target,
  FileText,
  PenLine,
  TrendingUp,
  Users,
  Percent,
  ArrowUpRight,
  Filter,
  BarChart4,
  Flame,
  Award,
  CircleDollarSign
} from 'lucide-react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

export const VisaoComercial = () => {
  const { isAdmin, loading: authLoading } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalLeads: 0,
    leadsAtivosFunil: 0, // pendente, conversando, atendimento, qualificado, etc
    leadsAquecidos: 0, // qualificados + proposta
    propostasGeradas: 0,
    contratosAssinados: 0,
    taxaConversaoGlobal: 0,
    taxaSucessoPropostas: 0,
    novosClientesMes: 0
  });

  useEffect(() => {
    async function fetchComercialStats(retryCount = 0) {
      if (!isAdmin || authLoading) return;
      try {
        setLoading(true);
        const agora = new Date();
        const primeiroDiaMes = new Date(agora.getFullYear(), agora.getMonth(), 1).toISOString();

        // 1. Coletar Leads do CRM
        const { data: leads, error: errLeads } = await supabase
          .from('leads')
          .select('status, created_at');
        if (errLeads) throw errLeads;

        // 2. Coletar Propostas
        const { data: propostas, error: errProp } = await supabase
          .from('lead_propostas')
          .select('status');
        if (errProp) throw errProp;

        // 3. Coletar Contratos
        const { data: contratos, error: errCont } = await supabase
          .from('lead_contratos')
          .select('status, created_at');
        if (errCont) throw errCont;

        // --- Cálculos Estratégicos do Funil ---
        
        const totalLeadsRaw = leads?.length || 0;
        
        // Status que indicam que o lead está ativamente sendo trabalhado
        const ativados = ['pendente', 'conversando', 'em_atendimento', 'qualificado', 'proposta', 'fechado'];
        const leadsNoFunil = (leads || []).filter(l => ativados.includes(l.status)).length;
        
        // Leads que esquentaram (passaram do atendimento primário)
        const leadsAquecidosCount = (leads || []).filter(l => ['qualificado', 'proposta', 'fechado'].includes(l.status)).length;

        // Propostas
        const totalPropostas = propostas?.length || 0;
        const propostasAceitas = (propostas || []).filter(p => p.status === 'aceita').length;

        // Contratos / Clientes Novos
        const totalContratosAssinados = (contratos || []).filter(c => c.status === 'assinado').length;
        const clientesGanhosNoMes = (contratos || [])
            .filter(c => c.status === 'assinado' && c.created_at >= primeiroDiaMes).length;

        // Conversões
        const conversaoGlobal = totalLeadsRaw > 0 ? (totalContratosAssinados / totalLeadsRaw) * 100 : 0;
        const sucessoPropostas = totalPropostas > 0 ? (totalContratosAssinados / totalPropostas) * 100 : 0; // Das enviadas, quantas assinaram

        setStats({
          totalLeads: totalLeadsRaw,
          leadsAtivosFunil: leadsNoFunil,
          leadsAquecidos: leadsAquecidosCount,
          propostasGeradas: totalPropostas,
          contratosAssinados: totalContratosAssinados,
          taxaConversaoGlobal: conversaoGlobal,
          taxaSucessoPropostas: sucessoPropostas,
          novosClientesMes: clientesGanhosNoMes
        });

      } catch (err) {
        console.error("Erro ao buscar stats comercial", err);
        if (retryCount < 1 && (err.code === 'PGRST301' || err.status === 401)) {
          await new Promise(resolve => setTimeout(resolve, 800));
          return fetchComercialStats(retryCount + 1);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchComercialStats();
  }, [isAdmin, authLoading]);

  if (loading) {
      return (
          <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
      );
  }

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
      
      {/* Seção 1: Mapa Visual do Funil (Visualização Estilo Ampulheta) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Info Lateral de Performance - Borda Brilhante Estática */}
        <div className="relative rounded-2xl overflow-hidden p-[2px] shadow-2xl flex group">
           
           {/* Efeito de Luz Fixo (Sem Movimento) */}
           <div className="absolute inset-0 bg-gradient-to-tr from-primary/80 via-transparent to-primary/40 opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
           
           {/* Inner Card content */}
           <div className="relative w-full h-full bg-card/95 rounded-[14px] p-8 flex flex-col justify-center overflow-hidden z-10 backdrop-blur-md">
              
              {/* Ícone de Fundo Gigante Estilo Visão Financeira */}
              <div className="absolute -right-8 -top-8 opacity-5 text-primary pointer-events-none transform rotate-12 transition-transform duration-700 group-hover:rotate-0">
                <CircleDollarSign size={200} />
              </div>

              <div className="relative z-10 text-center space-y-6">
                 
                 <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-6 shadow-inner border border-primary/20">
                    <BarChart4 size={32} className="text-primary" />
                 </div>

                 <div>
                   <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Conversão de Propostas</p>
                   <div className="flex items-center justify-center gap-2 mt-2">
                      <span className="text-5xl font-black text-foreground">
                         {stats.taxaSucessoPropostas.toFixed(1)}<span className="text-2xl text-muted-foreground">%</span>
                      </span>
                   </div>
                   <p className="text-xs text-muted-foreground mt-4 max-w-[200px] mx-auto text-center leading-relaxed">
                     Eficiência do seu time de vendas na etapa final. Cada 100 propostas geram <span className="font-bold text-foreground">
                       {Math.round(stats.taxaSucessoPropostas)} contratos.
                     </span>
                   </p>
                 </div>

                 <div className="pt-6 border-t border-border/30 w-full mt-4">
                    <div className="flex justify-between items-center px-4">
                       <span className="text-xs font-semibold uppercase text-muted-foreground">Status Atual</span>
                       <span className={cn(
                           "text-xs font-bold uppercase rounded-full px-2 py-1 shadow-sm",
                           stats.taxaSucessoPropostas > 40 ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" :
                           stats.taxaSucessoPropostas > 20 ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20"
                       )}>
                           {stats.taxaSucessoPropostas > 40 ? "Excelente" : stats.taxaSucessoPropostas > 20 ? "Estável" : "Atenção"}
                       </span>
                    </div>
                 </div>

              </div>
           </div>
        </div>

        {/* Painel do Funil Esquerdo */}
        <div className="lg:col-span-2 p-8 bg-card/40 border border-border/50 rounded-2xl shadow-xl backdrop-blur-md flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-1">Mapeamento do Funil</h3>
            <p className="text-xs text-muted-foreground mb-8">Fluxo de volumetria das delegais cadastradas.</p>
          </div>
          
          <div className="relative flex flex-col px-4 lg:px-12 flex-1 justify-center gap-2">
            
            {/* Bloco 1: Total Base */}
            <div className="relative w-full h-14 bg-muted/30 rounded-t-xl rounded-b-md border border-border/60 flex items-center justify-between px-6 transition-all hover:bg-muted/50 group">
               <div className="flex gap-3 items-center">
                  <Users size={16} className="text-slate-400 group-hover:text-primary transition-colors" />
                  <span className="font-semibold text-sm">Base Total (Todos os Leads Cadastrados)</span>
               </div>
               <span className="font-mono text-lg font-bold">{stats.totalLeads}</span>
            </div>

            {/* Bloco 2: Em Atendimento / Aquecidos */}
            <div className="relative w-[90%] mx-auto h-14 bg-blue-500/10 rounded-lg border border-blue-500/20 flex items-center justify-between px-6 transition-all hover:bg-blue-500/20 group">
               <div className="flex gap-3 items-center">
                  <Target size={16} className="text-blue-500" />
                  <span className="font-semibold text-sm text-blue-700 dark:text-blue-300">Leads Trabalhados (Qualificados+)</span>
               </div>
               <span className="font-mono text-lg font-bold text-blue-600 dark:text-blue-400">{stats.leadsAquecidos}</span>
            </div>

            {/* Bloco 3: Propostas Enviadas */}
            <div className="relative w-[80%] mx-auto h-14 bg-amber-500/10 rounded-lg border border-amber-500/20 flex items-center justify-between px-6 transition-all hover:bg-amber-500/20 group">
               <div className="flex gap-3 items-center">
                  <FileText size={16} className="text-amber-500" />
                  <span className="font-semibold text-sm text-amber-700 dark:text-amber-300">Propostas Formais Apresentadas</span>
               </div>
               <span className="font-mono text-lg font-bold text-amber-600 dark:text-amber-400">{stats.propostasGeradas}</span>
            </div>

            {/* Bloco 4: Contratos Fechados */}
            <div className="relative w-[70%] mx-auto h-16 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-b-xl rounded-t-md border border-emerald-500/30 flex items-center justify-between px-6 transition-all shadow-[0_0_20px_rgba(16,185,129,0.1)] group">
               <div className="flex gap-3 items-center">
                  <PenLine size={18} className="text-emerald-500" />
                  <span className="font-bold text-sm text-emerald-700 dark:text-emerald-300">Clientes Ativos (Contratos Assinados)</span>
               </div>
               <span className="font-mono text-xl font-black text-emerald-600 dark:text-emerald-400">{stats.contratosAssinados}</span>
            </div>

          </div>
        </div>

      </div>

      {/* Seção 2: Cards Inferiores - Destaques Comerciais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-6 bg-card/60 rounded-2xl border border-border/50 shadow-sm relative overflow-hidden group hover:border-primary/50 transition-all">
          <div className="absolute right-0 top-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Leads no Funil</p>
              <h3 className="text-3xl font-bold font-mono text-foreground/90">{stats.leadsAtivosFunil}</h3>
            </div>
            <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-500">
              <Filter size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
             <span className="text-blue-500 font-medium">Ativos</span> em prospecção
          </div>
        </div>

        <div className="p-6 bg-card/60 rounded-2xl border border-border/50 shadow-sm relative overflow-hidden group hover:border-orange-500/50 transition-all">
          <div className="absolute right-0 top-0 w-24 h-24 bg-orange-500/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Leads Aquecidos</p>
              <h3 className="text-3xl font-bold font-mono text-foreground/90">{stats.leadsAquecidos}</h3>
            </div>
            <div className="p-2.5 bg-orange-500/10 rounded-xl text-orange-500">
              <Flame size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
             <span className="text-orange-500 font-medium">{stats.totalLeads > 0 ? ((stats.leadsAquecidos / stats.totalLeads) * 100).toFixed(1) : 0}%</span> da base total
          </div>
        </div>

        <div className="p-6 bg-card/60 rounded-2xl border border-border/50 shadow-sm relative overflow-hidden group hover:border-emerald-500/50 transition-all">
          <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Taxa de Conversão</p>
              <h3 className="text-3xl font-bold font-mono bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                {stats.taxaConversaoGlobal.toFixed(1)}%
              </h3>
            </div>
            <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-500">
              <Percent size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
             Performance <span className="font-medium text-emerald-500">Absoluta</span> (Fim a Fim)
          </div>
        </div>

        <div className="p-6 bg-gradient-to-br from-primary/10 to-transparent rounded-2xl border border-primary/20 shadow-sm relative overflow-hidden group">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/10 blur-2xl rounded-full block"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Novas Vendas</p>
              <h3 className="text-3xl font-bold font-mono text-primary">{stats.novosClientesMes}</h3>
            </div>
            <div className="p-2.5 bg-primary/20 rounded-xl text-primary">
              <Award size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-primary/70">
             <ArrowUpRight size={14} /> Contratos no mês vigente
          </div>
        </div>
      </div>

    </div>
  );
};
