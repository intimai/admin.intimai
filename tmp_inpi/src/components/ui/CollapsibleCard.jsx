import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ExpansionButton from './ExpansionButton';

const CollapsibleCard = ({ header, children, actions, className = '' }) => {
  const [expanded, setExpanded] = useState(false);

  const toggle = (e) => {
    if (e) e.stopPropagation();
    setExpanded(!expanded);
  };

  return (
    <div className={`transition-all duration-200 ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0" onClick={toggle} style={{ cursor: 'pointer' }}>
          {header}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          {actions}
          <ExpansionButton isExpanded={expanded} onClick={toggle} />
        </div>
      </div>

      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-4 pt-4 border-t border-border"
          onClick={() => setExpanded(false)}
          style={{ cursor: 'pointer' }}
        >
          {children}
        </motion.div>
      )}
    </div>
  );
};

export default CollapsibleCard;