import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Card, CardContent } from '@/components/ui/card';

const PrivacyPolicy = () => {
  const [markdown, setMarkdown] = useState('');

  useEffect(() => {
    fetch('/POLITICA_DE_PRIVACIDADE.md')
      .then((response) => response.text())
      .then((text) => setMarkdown(text));
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="prose max-w-none text-muted-foreground prose-headings:font-semibold prose-headings:text-xl prose-headings:text-chart-recusadas prose-strong:text-foreground prose-a:text-chart-recusadas hover:prose-a:text-chart-recusadas/90 prose-li:text-muted-foreground prose-ol:text-muted-foreground">
            <ReactMarkdown>{markdown}</ReactMarkdown>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrivacyPolicy;