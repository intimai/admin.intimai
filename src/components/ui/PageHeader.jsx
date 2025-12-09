import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const PageHeader = ({ title, description }) => {
  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <h2 className="text-2xl font-bold active-link-gradient italic">{title}</h2>
        {description && (
          <p className="text-muted-foreground text-sm">{description}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default PageHeader;
