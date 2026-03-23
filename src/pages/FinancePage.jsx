import React from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { Card, CardContent } from '@/components/ui/card';

const FinancePage = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Financeiro"
        description="Gestão de cobranças, assinaturas e fluxo de caixa das delegacias integradas."
      />
      <Card className="bg-card/90 border-border/40 overflow-hidden shadow-xl backdrop-blur-md">
        <CardContent className="p-12">
          <div className="p-12 bg-muted/10 rounded-2xl border border-dashed border-border/50 flex flex-col items-center justify-center min-h-[400px] text-center gap-4">
            <div className="h-20 w-20 rounded-full bg-primary/5 flex items-center justify-center">
              <p className="text-4xl text-primary/30 font-bold">$</p>
            </div>
            <div className="space-y-2">
              <p className="text-xl font-semibold text-foreground italic">Módulo Financeiro</p>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                As funcionalidades de faturamento e extratos estão sendo integradas ao sistema e estarão disponíveis em breve.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancePage;
