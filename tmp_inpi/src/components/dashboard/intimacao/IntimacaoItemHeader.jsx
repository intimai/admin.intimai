import React from 'react';
import { Calendar, Clock, Phone, X, MessageCircle, Hash, HelpCircle, FileText, RefreshCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatusLabel from '../../ui/StatusLabel';
import { Button } from '@/components/ui/button';
import { formatDate, formatTime, formatDateTime } from "@/lib/utils";

export function IntimacaoItemHeader({ 
  intimacao, 
  onCancelClick, 
  onReativarClick, 
  cancellableStatuses, 
  isCancellable, 
  isReactivatable 
}) {
  return (
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">
            {intimacao.dataAgendada ? formatDate(intimacao.dataAgendada) : 'Data não definida'}
          </span>
        </div>
        {intimacao.horaAgendada && (
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {formatTime(intimacao.horaAgendada)}
            </span>
          </div>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        <StatusLabel status={intimacao.status} />
        
        {/* Botão de Cancelar - PRESERVA EXATAMENTE a mesma lógica */}
        {isCancellable && (
          <Button
            variant="outline"
            size="sm"
            onClick={onCancelClick}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <X className="h-4 w-4 mr-1" />
            Cancelar
          </Button>
        )}
        
        {/* Botão de Reativar - PRESERVA EXATAMENTE a mesma lógica */}
        {isReactivatable && (
          <Button
            variant="outline"
            size="sm"
            onClick={onReativarClick}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            <RefreshCcw className="h-4 w-4 mr-1" />
            Reativar
          </Button>
        )}
      </div>
    </CardHeader>
  );
}
