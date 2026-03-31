import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Eye, Database, Users, Lock, FileText, Calendar, Phone, AlertTriangle } from 'lucide-react';

const TransparenciaPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header com Logo */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center">
          <img 
            src="/logo.png" 
            alt="IntimAI Logo" 
            className="h-12 w-auto"
          />
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-4 space-y-6 max-w-5xl">
        {/* Card do Título */}
                 <Card className="w-full">
           <CardContent className="p-4 text-center">
             <h2 className="text-2xl font-bold active-link-gradient italic">Portal de Transparência</h2>
             <p className="text-gray-600 text-sm">Transparência no tratamento de dados pessoais no sistema IntimAI.</p>
           </CardContent>
         </Card>

        {/* Card do Conteúdo */}
        <Card>
          <CardContent className="p-8">
            <div className="space-y-8 text-muted-foreground">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-purple-600" />
                  Compromisso com a Transparência
                </h3>
                <p>
                  O <strong>IntimAI</strong> compromete-se com a máxima transparência no tratamento de dados pessoais, 
                  conforme exigido pela Lei Geral de Proteção de Dados (LGPD). Esta página detalha como, 
                  por que e com que finalidade seus dados são tratados em nosso sistema.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                  <Database className="w-5 h-5 mr-2 text-purple-600" />
                  Como os Dados são Coletados
                </h3>
                <p>
                  Os dados dos intimados são inseridos no sistema pelos <strong>agentes públicos (policiais civis)</strong> 
                  responsáveis pela condução dos procedimentos judiciais. O sistema atua como ferramenta de apoio 
                  para facilitar o cumprimento das obrigações legais de intimação.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-purple-600" />
                  Quem Acessa os Dados
                </h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Policiais Civis:</strong> Apenas os responsáveis pelo procedimento específico</li>
                  <li><strong>Supervisores:</strong> Acesso limitado para fins de supervisão</li>
                  <li><strong>Administradores:</strong> Acesso técnico para manutenção do sistema</li>
                  <li><strong>Auditores:</strong> Acesso apenas a logs de auditoria</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                  <Lock className="w-5 h-5 mr-2 text-purple-600" />
                  Medidas de Segurança Implementadas
                </h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Controle de Acesso:</strong> Row Level Security (RLS) no banco de dados</li>
                  <li><strong>Autenticação:</strong> Sistema seguro de login com Supabase</li>
                  <li><strong>Criptografia:</strong> Comunicação HTTPS e dados sensíveis criptografados</li>
                  <li><strong>Logs de Auditoria:</strong> Registro completo de todas as operações</li>
                  <li><strong>Minimização:</strong> Coleta apenas de dados necessários</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-purple-600" />
                  Finalidades Específicas do Tratamento
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-border p-4 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-2">Entrega de Intimações</h4>
                    <p className="text-sm">Utilização de WhatsApp e IA para entrega eficiente de intimações</p>
                  </div>
                  <div className="border border-border p-4 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-2">Agendamento de Oitivas</h4>
                    <p className="text-sm">Sistema inteligente para agendamento de comparecimentos</p>
                  </div>
                  <div className="border border-border p-4 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-2">Gestão de Procedimentos</h4>
                    <p className="text-sm">Controle completo do ciclo de vida das intimações</p>
                  </div>
                  <div className="border border-border p-4 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-2">Cumprimento Legal</h4>
                    <p className="text-sm">Atendimento às obrigações legais de intimação</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-purple-600" />
                  Período de Retenção
                </h3>
                <p>
                  Os dados são mantidos pelo período necessário para:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                  <li><strong>Cumprimento de obrigações legais</strong> (conforme legislação processual)</li>
                  <li><strong>Auditoria e fiscalização</strong> (período determinado pela instituição)</li>
                  <li><strong>Defesa de direitos</strong> (em caso de questionamentos judiciais)</li>
                </ul>
                <p className="mt-3">
                  Após o período de retenção obrigatório, os dados são <strong>anonimizados</strong> ou 
                  <strong> eliminados</strong> de forma segura e definitiva.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                  <Phone className="w-5 h-5 mr-2 text-purple-600" />
                  Compartilhamento de Dados
                </h3>
                <p>
                  <strong>Não compartilhamos</strong> seus dados pessoais com terceiros, exceto nas seguintes situações:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                  <li><strong>Obrigação legal:</strong> Quando exigido por lei ou ordem judicial</li>
                  <li><strong>Segurança:</strong> Para proteger direitos e segurança da instituição</li>
                  <li><strong>WhatsApp:</strong> Para entrega de intimações (apenas dados necessários)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-purple-600" />
                  Incidentes de Segurança
                </h3>
                <p>
                  Em caso de incidentes de segurança que possam comprometer seus dados pessoais, 
                  notificaremos imediatamente a <strong>Autoridade Nacional de Proteção de Dados (ANPD)</strong> 
                  e os titulares afetados, conforme exigido pela LGPD.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Links de Navegação */}
        <div className="flex justify-center space-x-4">
          <a 
            href="/privacidade" 
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Política de Privacidade
          </a>
          <a 
            href="/direitos-titulares" 
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Exercer Direitos
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-card/60 border-t border-border py-6">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2025 IntimAI - Sistema de Gestão de Intimações</p>
          <p className="text-sm mt-2">Powered by Aurios AI</p>
        </div>
      </footer>
    </div>
  );
};

export default TransparenciaPage;
