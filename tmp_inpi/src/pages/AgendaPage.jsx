import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { AgendaCalendar } from '@/components/dashboard/AgendaCalendar';
import AgendaCard from '@/components/dashboard/AgendaCard';
import { useIntimacoes } from '@/hooks/useIntimacoes';

import { Card, CardContent } from '@/components/ui/card';

export function AgendaPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { intimacoes, agendamentosDoDia, fetchAgendamentos, fetchIntimacoes } = useIntimacoes();

  const refetchAgendamentos = useCallback(() => {
    if (selectedDate) {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      fetchAgendamentos(formattedDate);
    }
  }, [selectedDate, fetchAgendamentos]);

  useEffect(() => {
    refetchAgendamentos();
  }, [refetchAgendamentos]);

  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardContent className="p-4">
          <h2 className="text-2xl font-bold active-link-gradient italic">Agenda</h2>
          <p className="page-subtitle">Visualize e gerencie seus agendamentos.</p>
        </CardContent>
      </Card>

      <Card>
                <CardContent className="p-2 sm:p-6 pb-8 space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 sm:gap-8">
            {/* Coluna do Calendário */}
            <div className="xl:col-span-2 min-w-0">
              <div className="flex justify-center xl:justify-start">
                <div className="w-full max-w-sm mx-auto xl:mx-0">
                  <AgendaCalendar
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                    intimacoes={intimacoes}
                  />
                </div>
              </div>
            </div>

            {/* Coluna dos Agendamentos do Dia */}
            <div className="xl:col-span-3 min-w-0">
              <h2 className="text-xl font-bold mb-4 text-center xl:text-left">Agendamentos do Dia</h2>
              <div className="max-h-[400px] overflow-y-auto pr-2 pt-2">
                <AgendaCard selectedDate={selectedDate} agendamentos={agendamentosDoDia} refetch={refetchAgendamentos} fetchIntimacoes={fetchIntimacoes} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}