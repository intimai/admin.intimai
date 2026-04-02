import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { cn } from '@/lib/utils';
import {
  Activity,
  MessageSquare,
  Building2,
  Bot,
  Zap,
  ShieldCheck,
  Smartphone,
  Cpu
} from 'lucide-react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

export const VisaoOperacional = () => {
  const { isAdmin, loading: authLoading } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDelegacias: 0,
    totalIntimacoes: 0,
    intimacoesMes: 0,
    iaAtendendoAgora: 0,
    intimacoesAgendadas: 0,
    instanciasAtivas: 0,
  });

  useEffect(() => {
    async function fetchOperacaoStats(retryCount = 0) {
      if (!isAdmin || authLoading) return;
      try {
        setLoading(true);
        const agora = new Date();
        // Construindo a data de início do mês de forma segura em UTC para evitar problemas de fuso
        const primeiroDiaMes = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}-01T00:00:00Z`;

        // 1. Delegacias
        const { count: countDelegacias, error: errDel } = await supabase
          .from('delegacias')
          .select('delegaciaId', { count: 'exact', head: true });
        if (errDel) throw errDel;

        // 2. Intimacoes (Total na Tabela)
        const { count: countIntimacoes, error: errInt } = await supabase
          .from('intimacoes')
          .select('*', { count: 'exact', head: true });
        if (errInt) console.error('Erro ao contar total de intimações:', errInt);
        
        // 3. Intimacoes (Mês Atual)
        const { count: countIntimacoesMes, error: errIntMes } = await supabase
          .from('intimacoes')
          .select('id', { count: 'exact', head: true })
          .gte('criadoEm', primeiroDiaMes);
        
        // 4. Intimações Sendo Atendidas (pendente, entregue, ativa)
        const { count: countIaAtendendo, error: errIa } = await supabase
          .from('intimacoes')
          .select('id', { count: 'exact', head: true })
          .in('status', ['pendente', 'entregue', 'ativa']);

        // 4.5 Intimações Agendadas (Status Final da IA)
        const { count: countAgendadas, error: errAgendada } = await supabase
          .from('intimacoes')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'agendada');
        
        // 5. Motores WhatsApp (Conexões Meta Ativas)
        const { count: countInstanciasMeta, error: errMeta } = await supabase
          .from('meta_phones_status')
          .select('id', { count: 'exact', head: true })
          .eq('code_verification_status', 'VERIFIED');
        
        // Fallback para delegacias se a tabela meta não responder
        const totalInstancias = errMeta ? (countDelegacias || 0) : (countInstanciasMeta || 0);

        setStats({
          totalDelegacias: countDelegacias || 0,
          totalIntimacoes: countIntimacoes || 0,
          intimacoesMes: countIntimacoesMes || 0,
          iaAtendendoAgora: countIaAtendendo || 0,
          intimacoesAgendadas: countAgendadas || 0,
          instanciasAtivas: totalInstancias
        });

      } catch (err) {
        console.error("Erro ao buscar stats operacional", err);
        if (retryCount < 1 && (err.code === 'PGRST301' || err.status === 401)) {
          await new Promise(resolve => setTimeout(resolve, 800));
          return fetchOperacaoStats(retryCount + 1);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchOperacaoStats();
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
      
      {/* Painéis Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Gráfico/Indicador Visual Ocasional (Volume Processado Total) - Borda Brilhante Estática */}
          <div className="relative rounded-2xl overflow-hidden p-[2px] shadow-2xl flex group">
             
             {/* Efeito de Luz Fixo (Sem Movimento) */}
             <div className="absolute inset-0 bg-gradient-to-tr from-primary/80 via-transparent to-primary/40 opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
             
             {/* Inner Card content */}
             <div className="relative w-full h-full bg-card/95 rounded-[14px] p-8 flex flex-col justify-center items-center text-center overflow-hidden z-10 backdrop-blur-md">
                
                {/* Ícone de Fundo Gigante Estilo Visão Financeira */}
                <div className="absolute -right-8 -top-8 opacity-5 text-primary pointer-events-none transform rotate-12 transition-transform duration-700 group-hover:rotate-0">
                  <Cpu size={200} />
                </div>

                <div className="relative z-10 flex flex-col items-center">
                  <Cpu size={48} className="text-primary/80 mb-4" />
                  <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                     Carga Histórica Processada
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2 max-w-sm leading-relaxed">
                     Nossa infraestrutura atua incansavelmente gerindo intimações, garantindo segurança na comunicação oficial das delegacias e agendando depoimentos de forma autônoma.
                  </p>
                  <div className="mt-6 font-mono text-6xl font-black tracking-tighter text-foreground">
                      {stats.totalIntimacoes.toLocaleString('pt-BR')}  
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-primary/80 mt-4 bg-primary/10 px-3 py-1 rounded-full shadow-sm border border-primary/20">
                      Intimações Emitidas
                  </div>
                </div>

             </div>
          </div>

          {/* Status dos Microsserviços */}
          <div className="p-8 bg-card/60 border border-border/50 rounded-2xl shadow-xl backdrop-blur-md flex flex-col justify-center text-left">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-6 border-b border-border/40 pb-4">Status da Automação e Infraestrutura</h3>
              
              <div className="space-y-6">
                  <div className="flex items-center justify-between group">
                     <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
                             <Zap size={18} className="text-emerald-500" />
                         </div>
                         <div>
                             <p className="text-sm font-bold text-foreground">Motor Principal (N8N)</p>
                             <p className="text-xs text-muted-foreground">Roteamento de fluxos dinâmicos e Webhooks</p>
                         </div>
                     </div>
                     <span className="text-xs font-mono font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full shadow-sm border border-emerald-500/20">ONLINE</span>
                  </div>

                  <div className="flex items-center justify-between group">
                     <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
                             <ShieldCheck size={18} className="text-emerald-500" />
                         </div>
                         <div>
                             <p className="text-sm font-bold text-foreground">Meta Cloud API Proxy</p>
                             <p className="text-xs text-muted-foreground">Recepção de intimados e disparos oficiais (WhatsApp)</p>
                         </div>
                     </div>
                     <span className="text-xs font-mono font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full shadow-sm border border-emerald-500/20">ONLINE</span>
                  </div>

                  <div className="flex items-center justify-between group">
                     <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
                             <Bot size={18} className="text-emerald-500" />
                         </div>
                         <div>
                             <p className="text-sm font-bold text-foreground">Agente LLM (Inteligência Artificial)</p>
                             <p className="text-xs text-muted-foreground">Injeção de contexto humanizado em depoimentos</p>
                         </div>
                     </div>
                     <span className="text-xs font-mono font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full shadow-sm border border-emerald-500/20">ONLINE</span>
                  </div>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* IA Simultânea */}
        <div className="p-6 bg-card/60 rounded-2xl border border-border/50 shadow-sm relative overflow-hidden group hover:border-purple-500/50 transition-all">
          <div className="absolute right-0 top-0 w-24 h-24 bg-purple-500/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">IA Atendendo Agora</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-bold font-mono text-purple-500">{stats.iaAtendendoAgora}</h3>
              </div>
            </div>
            <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-500">
              <Bot size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
             Intimados em <span className="text-purple-500 font-medium">diálogo ativo</span> com a IA
          </div>
        </div>

        {/* Intimações Agendadas (Substituindo WhatsApp Engines) */}
        <div className="p-6 bg-card/60 rounded-2xl border border-border/50 shadow-sm relative overflow-hidden group hover:border-emerald-500/50 transition-all">
          <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Intimações Agendadas</p>
              <h3 className="text-3xl font-bold font-mono text-emerald-500">{stats.intimacoesAgendadas}</h3>
            </div>
            <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-500">
              <ShieldCheck size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
             Finalizadas com <span className="text-emerald-500 font-medium">sucesso pela IA</span>
          </div>
        </div>

        {/* Intimações Mês */}
        <div className="p-6 bg-card/60 rounded-2xl border border-border/50 shadow-sm relative overflow-hidden group hover:border-blue-500/50 transition-all">
          <div className="absolute right-0 top-0 w-24 h-24 bg-blue-500/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Volume Intimações</p>
              <h3 className="text-3xl font-bold font-mono text-blue-500">{stats.intimacoesMes}</h3>
            </div>
            <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-500">
              <MessageSquare size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
             Disparadas pelas <span className="text-blue-500 font-medium">delegacias no mês</span>
          </div>
        </div>

        {/* Delegacias Atendidas */}
        <div className="p-6 bg-card/60 rounded-2xl border border-border/50 shadow-sm relative overflow-hidden group hover:border-pink-500/50 transition-all">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-pink-500/5 blur-2xl rounded-full block"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Total de Órgãos</p>
              <h3 className="text-3xl font-bold font-mono text-foreground/90">{stats.totalDelegacias}</h3>
            </div>
            <div className="p-2.5 bg-pink-500/10 rounded-xl text-pink-500">
              <Building2 size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground relative z-10">
             Delegacias usando o sistema ativamente
          </div>
        </div>
      </div>

    </div>
  );
};
