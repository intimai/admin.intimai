import React from 'react';
import { Copy } from 'lucide-react';
import Tooltip from './Tooltip';

const InfoItem = ({ icon, label, value, copyValue, onCopy }) => (
  <Tooltip text={label}>
    <div className="flex items-center gap-2">
      <div className="text-foreground flex-shrink-0">{React.cloneElement(icon, { className: 'w-4 h-4' })}</div>
      {value ? (
        <>
          <span className="text-xs text-foreground truncate">{value}</span>
          {copyValue && onCopy && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onCopy(copyValue, label);
              }}
              className="text-muted-foreground hover:text-foreground transition-colors"
              title={`Copiar ${label}`}
              aria-label={`Copiar ${label}`}
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          )}
        </>
      ) : (
        <span className="text-xs text-muted-foreground">N/A</span>
      )}
    </div>
  </Tooltip>
);

export default InfoItem;