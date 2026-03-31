import React from 'react';
import TooltipContent from './TooltipContent';

const Tooltip = ({ text, children }) => {
  return (
    <div className="relative flex items-center group">
      {children}
      <div className="absolute bottom-full mb-2 w-max opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
        <TooltipContent text={text} />
      </div>
    </div>
  );
};

export default Tooltip;
