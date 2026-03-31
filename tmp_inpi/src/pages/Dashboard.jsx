import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useIntimacoes } from '@/hooks/useIntimacoes';
import { CreateIntimacaoModal } from '../components/dashboard/CreateIntimacaoModal';
import StatsChart from '../components/dashboard/StatsChart';
import { chartColors } from '@/config/chartColors';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

function buildMonthOptions() {
  const now = new Date();
  const year = now.getFullYear();
  const options = [{ value: 'all', label: 'Todos os períodos' }];
  for (let y = year; y >= year - 1; y--) {
    const start = y === year ? now.getMonth() : 11;
    for (let m = start; m >= 0; m--) {
      options.push({
        value: `${y}-${String(m + 1).padStart(2, '0')}`,
        label: `${MESES[m]} ${y}`,
      });
    }
  }
  return options;
}

const MONTH_OPTIONS = buildMonthOptions();

export function Dashboard() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [monthFilter, setMonthFilter] = useState('all');
  const { user } = useAuth();
  
  const { fetchIntimacoesWithFilters } = useIntimacoes();
  
  const [allIntimacoes, setAllIntimacoes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAllIntimacoes = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('intimacoes')
        .select('status, userId, criadoEm')
        .eq('userId', user.id);
      
      if (error) {
        console.error('Erro ao buscar intimações para o dashboard:', error);
        return;
      }
      
      setAllIntimacoes(data || []);
    } catch (error) {
      console.error('Erro ao buscar intimações para o dashboard:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);
  
  useEffect(() => {
    fetchAllIntimacoes();
  }, [fetchAllIntimacoes]);

  const intimacoesFiltered = useMemo(() => {
    if (monthFilter === 'all') return allIntimacoes;
    const [year, month] = monthFilter.split('-').map(Number);
    return allIntimacoes.filter((int) => {
      if (!int.criadoEm) return false;
      const d = new Date(int.criadoEm);
      return d.getFullYear() === year && d.getMonth() + 1 === month;
    });
  }, [allIntimacoes, monthFilter]);

  const statsData = useMemo(() => {
    const counts = {
      pendentes: 0,
      entregues: 0,
      ativas: 0,
      agendadas: 0,
      recusadas: 0,
      canceladas: 0,
      finalizadas: 0,
      ausentes: 0,
    };

    const statusToPlural = {
      pendente: 'pendentes',
      entregue: 'entregues',
      ativa: 'ativas',
      agendada: 'agendadas',
      recusada: 'recusadas',
      cancelada: 'canceladas',
      finalizada: 'finalizadas',
      ausente: 'ausentes',
    };

    intimacoesFiltered.forEach(intimacao => {
      const pluralStatus = statusToPlural[intimacao.status];
      if (pluralStatus) counts[pluralStatus]++;
    });

    return [
      { name: 'Pendentes', value: counts.pendentes, color: chartColors.pendentes },
      { name: 'Entregues', value: counts.entregues, color: chartColors.entregues },
      { name: 'Ativas', value: counts.ativas, color: chartColors.ativas },
      { name: 'Agendadas', value: counts.agendadas, color: chartColors.agendadas },
      { name: 'Recusadas', value: counts.recusadas, color: chartColors.recusadas },
      { name: 'Canceladas', value: counts.canceladas, color: chartColors.canceladas },
      { name: 'Finalizadas', value: counts.finalizadas, color: chartColors.finalizadas },
      { name: 'Ausentes', value: counts.ausentes, color: chartColors.ausentes },
    ].filter(item => item.value > 0);
  }, [intimacoesFiltered]);

  const totalIntimacoes = intimacoesFiltered.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardContent className="p-4">
          <h2 className="text-2xl font-bold active-link-gradient italic">Dashboard</h2>
          <p className="text-gray-600 text-sm">Visão Geral das Intimações</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center gap-4 space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
            <Select value={monthFilter} onValueChange={setMonthFilter}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Filtrar por mês" />
              </SelectTrigger>
              <SelectContent>
                {MONTH_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total de Intimações</p>
            <p className="text-2xl font-bold">{totalIntimacoes}</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="btn-primary ml-auto">
            <Plus className="w-4 h-4 mr-2" />
            Nova Intimação
          </Button>
        </CardHeader>
        <CardContent className="p-4">
          <StatsChart data={statsData} />
        </CardContent>
      </Card>

      

      <CreateIntimacaoModal 
        open={showCreateModal} 
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          // Primeiro, busca os dados para os cards do dashboard
          fetchAllIntimacoes();
          // Depois, busca os dados para a lista de intimações (se necessário em outro lugar)
          fetchIntimacoesWithFilters(null, '');
        }}
      />
    </div>
  );
}