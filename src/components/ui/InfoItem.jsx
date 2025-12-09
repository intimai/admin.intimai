import React from 'react';
import Tooltip from './Tooltip';

const InfoItem = ({ icon, label, value }) => (
  <Tooltip text={label}>
    <div className="flex items-center gap-2">
      <div className="text-foreground flex-shrink-0">{React.cloneElement(icon, { className: 'w-4 h-4' })}</div>
      {value ? (
        <span className="text-xs text-foreground truncate">{value}</span>
      ) : (
        <span className="text-xs text-muted-foreground">N/A</span>
      )}
    </div>
  </Tooltip>
);

export default InfoItem;