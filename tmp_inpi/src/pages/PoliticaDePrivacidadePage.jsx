import React from 'react';
import PrivacyPolicy from '../components/PrivacyPolicy';
import { Card, CardContent } from '@/components/ui/card';

const PoliticaDePrivacidadePage = () => {
  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardContent className="p-4">
          <h2 className="text-2xl font-bold active-link-gradient italic">Política de Privacidade</h2>
          <p className="text-gray-600 text-sm">Conheça nossas diretrizes de privacidade e proteção de dados.</p>
        </CardContent>
      </Card>
      <PrivacyPolicy />
    </div>
  );
};

export default PoliticaDePrivacidadePage;