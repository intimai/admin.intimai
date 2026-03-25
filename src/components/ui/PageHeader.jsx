import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const PageHeader = ({ title, description, action }) => {
  return (
    <Card className="w-full bg-card/90 border-border/40 backdrop-blur-md shadow-md">
      <CardContent className="p-8 flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-xl md:text-2xl font-semibold italic bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent transform -skew-x-6 w-fit">
            {title}
          </h1>
          {description && (
            <p className="text-muted-foreground text-xs md:text-sm max-w-2xl leading-relaxed opacity-80 italic">
              {description}
            </p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </CardContent>
    </Card>
  );
};

export default PageHeader;
