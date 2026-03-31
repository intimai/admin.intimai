import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

const ExpansionButton = ({ isExpanded, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="p-1 rounded-md hover:bg-muted/50 focus:outline-none"
      aria-expanded={isExpanded}
    >
      {isExpanded ? (
        <ChevronUp className="h-5 w-5" />
      ) : (
        <ChevronDown className="h-5 w-5" />
      )}
      <span className="sr-only">{isExpanded ? 'Recolher' : 'Expandir'}</span>
    </button>
  );
};

export default ExpansionButton;