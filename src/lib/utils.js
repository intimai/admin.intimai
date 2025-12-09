import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
	return twMerge(clsx(inputs));
}

export const getPeriodoLabel = (periodo) => {
  if (!periodo) return 'N/A';
  switch (periodo) {
    case 'manha': return '🌅 Manhã';
    case 'tarde': return '🌆 Tarde';
    case 'ambos': return '🌅🌆 Ambos';
    default: return periodo;
  }
};

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return dateString;
  }
  return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
};

export const formatTime = (timeString) => {
  if (!timeString) return 'N/A';
  return timeString.slice(0, 5); // Pega hh:mm de hh:mm:ss
};

export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('pt-BR');
};
