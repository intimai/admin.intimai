import React from 'react';

const TooltipContent = ({ text }) => {
  return (
    <div className="bg-white/95 border border-gray-200 rounded-md shadow-lg text-gray-700 text-xs p-2">
      {text}
    </div>
  );
};

export default TooltipContent;