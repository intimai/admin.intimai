import React from 'react';
import { Badge } from '@/components/ui/badge';

const statusClasses = {
  'pendente': { bg: 'bg-chart-pendentes' },
  'entregue': { bg: 'bg-chart-entregues' },
  'ativa': { bg: 'bg-chart-ativas' },
  'agendada': { bg: 'bg-chart-agendadas' },
  'recusada': { bg: 'bg-chart-recusadas' },
  'cancelada': { bg: 'bg-chart-canceladas' },
  'finalizada': { bg: 'bg-chart-finalizadas' },
  'ausente': { bg: 'bg-chart-ausentes' },
};

const getStatusLabelText = (status) => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const StatusLabel = ({ status, className }) => {
  const currentStatusClasses = statusClasses[status] || statusClasses.pendente;

  return (
    <Badge 
      className={`text-xs text-black ${currentStatusClasses.bg} ${className}`}
    >
      {getStatusLabelText(status)}
    </Badge>
  );
};

export default StatusLabel;