import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';

const CancelCheckbox = ({ id, onCheckedChange }) => {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox id={id} onCheckedChange={onCheckedChange} />
      <label
        htmlFor={id}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        Cancelar
      </label>
    </div>
  );
};

export default CancelCheckbox;