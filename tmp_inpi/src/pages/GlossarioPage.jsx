import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { chartColors } from '@/config/chartColors';

const StatusDescription = ({ status, color, description }) => (
  <div className="flex items-start space-x-4 p-4 rounded-lg transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-800/50">
    <div className="flex-shrink-0 w-4 h-4 rounded-full mt-1.5" style={{ backgroundColor: color }}></div>
    <div>
      <h4 className="font-bold" style={{ color }}>{status}</h4>
      <p className="text-gray-600 dark:text-gray-400 text-sm">{description}</p>
    </div>
  </div>
);

export function GlossarioPage() {
  const statusList = [
    {
      status: 'Pendente',
      description: 'A intimação foi criada no sistema e, em breve, será entregue ao intimado.',
      color: chartColors.pendentes,
    },
    {
      status: 'Entregue',
      description: 'A intimação jinicial já foi entregue ao intimado. Aguardamos a confirmação de identidade.',
      color: chartColors.entregues,
    },
    {
      status: 'Ativa',
      description: 'A identidade foi confirmada e o processo de agendamento foi iniciado.',
      color: chartColors.ativas,
    },
    {
      status: 'Agendada',
      description: 'O intimado agendou data e hora de comparecimento. Informações já disponíveis na agenda do usuário.',
      color: chartColors.agendadas,
    },
    {
      status: 'Recusada',
      description: 'A identidade não foi confirmada (motivo = Desconhecido) ou o intimado recusou explicitamente a intimação (motivo = Recusa).',
      color: chartColors.recusadas,
    },
    {
      status: 'Cancelada',
      description: 'A intimação foi cancelada manualmente pelo usuário.',
      color: chartColors.canceladas,
    },
    {
      status: 'Finalizada',
      description: 'A intimação agendada já foi concluída e o intimado compareceu na data e hora marcadas.',
      color: chartColors.finalizadas,
    },
    {
      status: 'Ausente',
      description: 'A intimação agendada já foi concluída, mas o intimado não compareceu na data e hora marcadas.',
      color: chartColors.ausentes,
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardContent className="p-4">
          <h2 className="text-2xl font-bold active-link-gradient italic">Glossário de Status</h2>
          <p className="page-subtitle">Entenda o ciclo de vida de uma intimação através de seus status.</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-2">
          {statusList.map((item) => (
            <StatusDescription key={item.status} {...item} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}