import React from 'react';
import { DayPicker } from 'react-day-picker';
import { ptBR } from 'date-fns/locale';
import 'react-day-picker/dist/style.css';
import './AgendaCalendar.css';


export function AgendaCalendar({ selectedDate, setSelectedDate, intimacoes }) {
  const scheduledDays = intimacoes
    .filter(i => ['agendada', 'ausente', 'finalizada'].includes(i.status)) // Filtra agendadas, ausentes e finalizadas
    .map(i => new Date(i.dataAgendada + 'T00:00:00')) // Evita problemas de fuso horário
    .filter(d => !isNaN(d.getTime()));

  return (
    <div className="w-full flex justify-center agenda-calendar-wrapper">
      <DayPicker
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          modifiers={{ scheduled: scheduledDays }}
          modifiersClassNames={{
            scheduled: 'day-scheduled',
          }}
          locale={ptBR}
          classNames={{
            caption: 'flex justify-between items-center px-4',
            head_cell: 'text-muted-foreground font-normal text-[0.8rem]',
            cell: 'h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
            day: 'h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors',
            day_selected: 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
            day_today: 'bg-accent text-accent-foreground',
            day_outside: 'text-muted-foreground opacity-50',
            day_disabled: 'text-muted-foreground opacity-50',
            day_range_middle: 'aria-selected:bg-accent aria-selected:text-accent-foreground',
            day_hidden: 'invisible',
          }}
        />
    </div>
  );
}