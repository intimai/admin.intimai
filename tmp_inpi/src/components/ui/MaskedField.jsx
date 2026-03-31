import React from 'react';
import { useMask } from '@react-input/mask';
import { Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const MaskedField = ({ control, name, label, mask, replacement, ...props }) => {
  const inputRef = useMask({ mask, replacement, showMask: true });

  return (
    <div className="flex flex-col space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Input
            {...field}
            {...props}
            id={name}
            ref={inputRef}
            value={field.value || ''}
            onChange={field.onChange}
            onBlur={field.onBlur}
          />
        )}
      />
    </div>
  );
};