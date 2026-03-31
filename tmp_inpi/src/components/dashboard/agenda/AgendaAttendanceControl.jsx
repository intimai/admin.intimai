import React from 'react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

/**
 * Componente para controle de comparecimento na agenda
 * PRESERVA EXATAMENTE o mesmo comportamento e design
 */
const AgendaAttendanceControl = ({ intimacao, onComparecimentoChange }) => {
  return (
    <div className="flex items-center space-x-4">
      <span className="text-sm font-medium">Compareceu?</span>
      <RadioGroup
        defaultValue={intimacao.status === 'finalizada' ? 'sim' : 'nao'}
        onValueChange={onComparecimentoChange}
        className="flex items-center"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="sim" id={`sim-${intimacao.id}`} />
          <Label htmlFor={`sim-${intimacao.id}`}>Sim</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="nao" id={`nao-${intimacao.id}`} />
          <Label htmlFor={`nao-${intimacao.id}`}>Não</Label>
        </div>
      </RadioGroup>
    </div>
  );
};

export default AgendaAttendanceControl;
